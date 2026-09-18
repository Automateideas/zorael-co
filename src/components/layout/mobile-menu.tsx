"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronRight } from "lucide-react";
import { mobileMenu, SITE } from "@/lib/site";
import { Monogram } from "./logo";
import { cn } from "@/lib/utils";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // Close on route change.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  // Lock scroll while open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const drawer = (
    <>
      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-50 bg-charcoal/40 transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!open}
      />

      {/* Panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-sm flex-col bg-black text-ivory shadow-2xl transition-transform duration-400 lg:hidden pt-safe pb-safe",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <span className="flex items-center gap-2 font-serif text-lg tracking-[0.12em]">
            <Monogram className="text-2xl" /> {SITE.name}
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="text-ivory/80 transition-colors hover:text-ivory"
          >
            <X className="size-6" strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <ul>
            {mobileMenu.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between rounded-md px-4 py-3.5 text-[0.95rem] tracking-wide text-ivory/90 transition-colors hover:bg-white/5 hover:text-ivory"
                >
                  {item.label}
                  <ChevronRight
                    className="size-4 text-ivory/40"
                    strokeWidth={1.5}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-white/10 px-6 py-5 text-right">
          <p className="font-serif text-sm tracking-wide text-gold">
            Luxury in every detail
          </p>
        </div>
      </aside>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="inline-flex items-center justify-center text-charcoal transition-colors hover:text-muted-gold"
      >
        <Menu className="size-6" strokeWidth={1.5} />
      </button>
      {mounted ? createPortal(drawer, document.body) : null}
    </>
  );
}
