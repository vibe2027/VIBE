import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const HUD = ({ onLoginClick, onAdminClick }) => {
  const [time, setTime] = useState('00:00');
  const { user, signOut } = useAuth();

  useEffect(() => {
    const updateTime = () => {
      const n = new Date();
      const hours = n.getHours().toString().padStart(2, '0');
      const minutes = n.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="hud">
      <div className="hud-brand">✦ VIBE</div>
      <nav className="hud-mid">
        <a onClick={() => scrollTo('accueil')}>Accueil</a>
        <a onClick={() => scrollTo('ange-section')}>Ange gardien</a>
        <a onClick={() => scrollTo('globe-section')}>Globe</a>
        <a onClick={() => scrollTo('tribunal-section')}>Tribunal</a>
        <a onClick={() => scrollTo('salon-section')}>Salon</a>
        <a onClick={() => scrollTo('inscription')}>Rejoindre</a>
      </nav>
      <div className="hud-right">
        <div className="pulse-dot"></div>
        <span className="hud-time">{time}</span>
        {user ? (
          <>
            <button className="btn-ghost" onClick={onAdminClick}>
              Admin
            </button>
            <button className="btn-ghost" onClick={signOut}>
              Déconnexion
            </button>
          </>
        ) : (
          <button className="btn-ghost" onClick={onLoginClick}>
            Connexion
          </button>
        )}
      </div>
    </div>
  );
};
