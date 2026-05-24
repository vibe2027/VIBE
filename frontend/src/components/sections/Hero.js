import React from 'react';
import { DNACanvas } from '@/components/canvas';
import { STRIPE_FOUNDER_LINK } from '@/lib/supabase';

export const Hero = ({ onLoginClick }) => {
  return (
    <section id="accueil" className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 relative z-10">
      <div className="relative w-[180px] h-[180px] mx-auto mb-9">
        <div className="orbit orbit1"></div>
        <div className="orbit orbit2"></div>
        <DNACanvas />
      </div>

      <div className="vibe-title">
        <span className="vt-v">V</span>
        <span className="vt-ibe">IBE</span>
      </div>

      <p className="text-[0.65rem] tracking-[6px] text-[rgba(212,175,55,0.45)] uppercase mt-2 mb-1">
        Réseau LGBTQ+ de nouvelle génération
      </p>
      <p className="text-[0.55rem] tracking-[4px] text-[rgba(255,255,255,0.15)] uppercase mb-7">
        Né à Québec · Canada · 2026
      </p>

      <div className="pride-spectrum mb-8">
        <span className="ps ps1"></span>
        <span className="ps ps2"></span>
        <span className="ps ps3"></span>
        <span className="ps ps4"></span>
        <span className="ps ps5"></span>
        <span className="ps ps6"></span>
        <span className="ps ps7"></span>
        <span className="ps ps8"></span>
      </div>

      <div className="flex gap-3 flex-wrap justify-center mb-12">
        <a className="btn-primary" href={STRIPE_FOUNDER_LINK} target="_blank" rel="noopener noreferrer">
          <span>Devenir Fondateur·trice — 99$</span>
        </a>
        <button className="btn-ghost" onClick={onLoginClick}>
          Se connecter
        </button>
      </div>
    </section>
  );
};
