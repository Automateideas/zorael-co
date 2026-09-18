"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { desktopNav } from "@/lib/site";
import { cn } from "@/lib/utils";

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="hidden lg:block">
      <ul className="flex items-center gap-9">
        {desktopNav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "relative py-1 text-sm tracking-wide text-charcoal/80 transition-colors hover:text-charcoal",
                  active && "text-charcoal",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute -bottom-0.5 left-0 h-px bg-muted-gold transition-all duration-300",
                    active ? "w-full" : "w-0",
                  )}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
