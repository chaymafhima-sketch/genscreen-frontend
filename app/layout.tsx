import { Toaster } from "react-hot-toast";

import { ReactNode } from "react";
import "./globals.css"; // Ajout de l'import Tailwind

import { ThemeProvider } from "./components/theme-provider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
