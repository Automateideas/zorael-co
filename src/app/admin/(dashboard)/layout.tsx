import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin/auth";
import { AdminShell } from "./admin-shell";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · ZORAEL & CO." },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    redirect("/admin/login");
  }

  return <AdminShell>{children}</AdminShell>;
}
