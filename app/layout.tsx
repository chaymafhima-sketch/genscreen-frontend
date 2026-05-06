import { Toaster } from "react-hot-toast";

import { ReactNode } from "react";
import "./globals.css"; // Ajout de l'import Tailwind

import { ThemeProvider } from "./components/theme-provider";
import NextAuthSessionProvider from "./components/session-provider";
import { LanguageProvider } from "@/lib/dictionaries/LanguageContext";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <NextAuthSessionProvider>
          <LanguageProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
              {children}
              <Toaster position="top-right" />
            </ThemeProvider>
          </LanguageProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
