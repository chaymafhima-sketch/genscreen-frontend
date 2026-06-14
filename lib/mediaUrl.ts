// Base URL du backend pour les médias servis depuis /uploads (images, vidéos…).
// Résolution :
//   1) NEXT_PUBLIC_BACKEND_URL si définie (au build) ;
//   2) sinon détection à l'exécution : backend Render quand on est en ligne,
//      localhost:3001 en développement.
const PROD_BACKEND = "https://genscreen-backend.onrender.com";

function resolveMediaBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (fromEnv) return fromEnv;

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      return PROD_BACKEND;
    }
  }
  return "http://localhost:3001";
}

export const MEDIA_BASE = resolveMediaBase();

// Construit l'URL absolue d'un média à partir d'un chemin relatif (ex: /uploads/images/x.png).
export function mediaUrl(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path; // déjà absolu
  return `${MEDIA_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}
