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
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
              {children}
              <Toaster
                position="bottom-left"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: 'var(--card)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '10px 16px',
                    fontSize: '13px',
                    fontWeight: '600',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                    maxWidth: '320px',
                    animation: 'slideInLeft 0.3s ease-out',
                  },
                  success: {
                    iconTheme: { primary: '#047857', secondary: '#fff' },
                  },
                  error: {
                    iconTheme: { primary: '#ef4444', secondary: '#fff' },
                  },
                }}
              />
            </ThemeProvider>
          </LanguageProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
