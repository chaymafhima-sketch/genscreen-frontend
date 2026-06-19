import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Masque l'indicateur "N" des Dev Tools de Next.js (visible en dev uniquement)
  devIndicators: false,

  // Autorise l'accès aux ressources de dev (HMR, /_next/*) depuis le téléphone
  // sur le réseau local / partage de connexion. À adapter si l'IP change.
  allowedDevOrigins: [
    "192.168.43.232", // IP actuelle du PC (hotspot téléphone)
    "192.168.43.*",   // plage du partage de connexion Android
    "192.168.1.*",    // plage Wi-Fi domestique
  ],
};

export default nextConfig;
