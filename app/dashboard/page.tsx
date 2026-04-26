import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Minimal server-side redirect page: middleware + session decide destination.
// This avoids client-side role checks and prevents flashing.

export default async function DashboardIndex() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.user?.role;
  redirect(role === "admin" ? "/dashboard/admin" : "/dashboard/chef");
}

