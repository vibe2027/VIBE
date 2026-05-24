import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const NAV_LINKS = [
  { id: 'accueil', label: 'Accueil' },
  { id: 'ange-section', label: 'Ange gardien' },
  { id: 'globe-section', label: 'Globe' },
  { id: 'tribunal-section', label: 'Tribunal' },
  { id: 'salon-section', label: 'Salon' },
  { id: 'inscription', label: 'Rejoindre' },
];

const formatTime = () => {
  const n = new Date();
  const hours = n.getHours().toString().padStart(2, '0');
  const minutes = n.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const scrollToSection = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

export const HUD = ({ onLoginClick, onAdminClick }) => {
  const [time, setTime] = useState(formatTime);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => setTime(formatTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hud">
      <div className="hud-brand">✦ VIBE</div>
      <nav className="hud-mid">
        {NAV_LINKS.map((link) => (
          <a key={link.id} onClick={() => scrollToSection(link.id)}>
            {link.label}
          </a>
        ))}
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
