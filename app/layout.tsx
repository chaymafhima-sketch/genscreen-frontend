import { Toaster } from "react-hot-toast";

import { ReactNode } from "react";
import "./globals.css"; // Ajout de l'import Tailwind

import { ThemeProvider } from "./components/theme-provider";
import NextAuthSessionProvider from "./components/session-provider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <NextAuthSessionProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            {children}
            <Toaster position="top-right" />
          </ThemeProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
