"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Store, User } from "lucide-react";
import { ShoppingBag } from "lucide-react";
import { useStore } from "@/components/providers/store-provider";
import { cn } from "@/lib/utils";

const items = [
  { label: "Home", href: "/", Icon: Home },
  { label: "Shop", href: "/shop", Icon: Store },
  { label: "Search", href: "/search", Icon: Search, emphasized: true },
  { label: "Bag", href: "/bag", Icon: ShoppingBag, isBag: true },
  { label: "Account", href: "/account", Icon: User },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const { cartCount, ready } = useStore();

  return (
    <nav
      aria-label="Primary mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white lg:hidden pb-safe"
    >
      <ul className="flex items-stretch justify-around px-2">
        {items.map(({ label, href, Icon, ...rest }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          const emphasized = "emphasized" in rest && rest.emphasized;
          const isBag = "isBag" in rest && rest.isBag;

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[0.65rem] tracking-wide transition-colors",
                  active ? "text-charcoal" : "text-charcoal/55",
                )}
              >
                {emphasized ? (
                  <span
                    className={cn(
                      "-mt-5 flex size-11 items-center justify-center rounded-full border-4 border-white shadow-sm transition-colors",
                      active
                        ? "bg-charcoal text-ivory"
                        : "bg-muted-gold text-ivory",
                    )}
                  >
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                ) : (
                  <span className="relative">
                    <Icon
                      className="size-[22px]"
                      strokeWidth={active ? 2 : 1.5}
                    />
                    {isBag && ready && cartCount > 0 && (
                      <span className="absolute -right-2.5 -top-2 flex size-4 items-center justify-center rounded-full bg-charcoal text-[0.55rem] font-medium text-white">
                        {cartCount}
                      </span>
                    )}
                  </span>
                )}
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
