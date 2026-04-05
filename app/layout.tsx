import { Toaster } from "react-hot-toast";

import { ReactNode } from "react";
import "./globals.css"; // Ajout de l'import Tailwind

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
