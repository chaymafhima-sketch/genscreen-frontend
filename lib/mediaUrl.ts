// Base URL du backend pour les médias servis depuis /uploads (images, vidéos…).
// NEXT_PUBLIC_* : disponible côté navigateur. Repli sur localhost en développement.
export const MEDIA_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

// Construit l'URL absolue d'un média à partir d'un chemin relatif (ex: /uploads/images/x.png).
export function mediaUrl(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path; // déjà absolu
  return `${MEDIA_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}
