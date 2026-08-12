import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Recherche — Plateforme de découverte contextuelle',
  description: "Recherche connecte les apprenants et candidats avec les instituts d'allemand, enseignants, betreuer et compagnons visa.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
