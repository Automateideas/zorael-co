"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Package,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Tags,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const pageTitle = navItems.find(
    (item) =>
      pathname === item.href ||
      (item.href !== "/admin" && pathname.startsWith(item.href)),
  )?.label;

  return (
    <div className="flex min-h-screen bg-ivory">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-white transition-transform duration-200 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link href="/admin" className="flex flex-col">
            <span className="font-serif text-sm tracking-tight text-charcoal">
              ZORAEL & CO.
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-charcoal/35">
              Admin Panel
            </span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="rounded-md p-1 lg:hidden"
            aria-label="Close menu"
          >
            <X className="size-5 text-charcoal/50" strokeWidth={1.5} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3 pt-4">
          <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-[0.2em] text-charcoal/30">
            Menu
          </p>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-charcoal text-ivory"
                    : "text-charcoal/60 hover:bg-cream hover:text-charcoal",
                )}
              >
                <Icon className="size-[18px]" strokeWidth={1.5} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-charcoal/50 transition-colors hover:bg-cream hover:text-charcoal"
          >
            <ExternalLink className="size-[18px]" strokeWidth={1.5} />
            View Store
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-charcoal/50 transition-colors hover:bg-cream hover:text-red-600"
          >
            <LogOut className="size-[18px]" strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-white/80 px-4 backdrop-blur-sm lg:px-6">
          <button
            onClick={() => setOpen(true)}
            className="rounded-md p-1 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5 text-charcoal" strokeWidth={1.5} />
          </button>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-charcoal/40">
            <Link
              href="/admin"
              className="transition-colors hover:text-charcoal"
            >
              Admin
            </Link>
            {pageTitle && pageTitle !== "Dashboard" && (
              <>
                <span>/</span>
                <span className="text-charcoal">{pageTitle}</span>
              </>
            )}
          </nav>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
