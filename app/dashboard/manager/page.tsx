import { redirect } from "next/navigation";

// Le responsable ouvre directement sur la 1ʳᵉ entité de sa sidebar : les Écrans.
// (La page de statistiques n'est plus dans son parcours.)
export default function ManagerDashboard() {
  redirect("/dashboard/manager/screens");
}
