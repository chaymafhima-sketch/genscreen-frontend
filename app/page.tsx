import { redirect } from "next/navigation";

export default function Page() {
  // Redirection immédiate côté serveur vers la page d'inscription
  redirect("/register");
}