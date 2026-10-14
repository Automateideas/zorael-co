"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

export function LogoutButton() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/account");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-border text-sm text-charcoal/60 transition-colors hover:border-charcoal/50 hover:text-charcoal"
    >
      <LogOut className="size-4" strokeWidth={1.5} />
      Sign Out
    </button>
  );
}
