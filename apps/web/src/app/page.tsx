import React from 'react';

export default function HomePage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <header>
        <h1>RECHERCHE</h1>
        <p style={{ fontStyle: 'italic', color: '#666' }}>
          « L&apos;information est la clé » / &ldquo;Information is the key&rdquo;
        </p>
      </header>

      <section style={{ marginTop: '2rem' }}>
        <h2>Bienvenue sur la plateforme Recherche</h2>
        <p>
          Plateforme de découverte contextuelle et de mise en relation pour l&apos;écosystème
          germano-africain.
        </p>
      </section>

      <footer style={{ marginTop: '4rem', fontSize: '0.9rem', color: '#999' }}>
        <p>RECHERCHE V1 — Day 1 i18n Baseline (Français par défaut / English supported)</p>
      </footer>
    </div>
  );
}
