import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  Heart,
  HelpCircle,
  MapPin,
  Package,
  CreditCard,
  Settings,
  User,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false },
};

const menu = [
  { label: "My Orders", href: "/account", Icon: Package, note: "Track & review" },
  {
    label: "Wishlist",
    href: "/account/wishlist",
    Icon: Heart,
    note: "Saved pieces",
  },
  { label: "Address Book", href: "/account", Icon: MapPin, note: "Delivery addresses" },
  {
    label: "Payment Methods",
    href: "/account",
    Icon: CreditCard,
    note: "Saved cards & UPI",
  },
  {
    label: "Help & Support",
    href: "/about#support",
    Icon: HelpCircle,
    note: "We're here to help",
  },
  { label: "Settings", href: "/account", Icon: Settings, note: "Preferences" },
];

export default function AccountPage() {
  return (
    <div className="container-zorael py-8 lg:py-12">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Account" }]}
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-[340px_1fr]">
        {/* Profile / sign-in card */}
        <aside>
          <div className="rounded-lg border border-border bg-white p-6">
            <div className="flex items-center gap-4">
              <span className="flex size-14 items-center justify-center rounded-full bg-cream text-muted-gold">
                <User className="size-6" strokeWidth={1.25} />
              </span>
              <div>
                <p className="font-serif text-lg tracking-tight text-charcoal">
                  Welcome to Zorael
                </p>
                <p className="text-xs text-charcoal/55">
                  Sign in to view your orders & wishlist
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <button
                type="button"
                className="h-11 w-full rounded-full bg-charcoal text-sm font-medium text-ivory transition-colors hover:bg-black"
              >
                Sign In
              </button>
              <button
                type="button"
                className="h-11 w-full rounded-full border border-border text-sm font-medium text-charcoal transition-colors hover:border-charcoal/50"
              >
                Create Account
              </button>
            </div>
            <p className="mt-4 text-center text-[0.7rem] leading-relaxed text-charcoal/45">
              This is a front-end demonstration — no account backend is connected.
            </p>
          </div>
        </aside>

        {/* Menu */}
        <div>
          <h1 className="font-serif text-2xl tracking-tight text-charcoal">
            My Account
          </h1>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {menu.map(({ label, href, Icon, note }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="flex items-center gap-4 rounded-lg border border-border bg-white px-5 py-4 transition-colors hover:border-charcoal/30"
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-cream text-muted-gold">
                    <Icon className="size-5" strokeWidth={1.4} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-charcoal">
                      {label}
                    </span>
                    <span className="block text-xs text-charcoal/50">
                      {note}
                    </span>
                  </span>
                  <ChevronRight
                    className="size-4 text-charcoal/40"
                    strokeWidth={1.5}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
