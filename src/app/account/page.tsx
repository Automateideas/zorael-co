import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  Heart,
  HelpCircle,
  Info,
  MapPin,
  Package,
  CreditCard,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getSession, getProfile } from "@/lib/auth";
import { LogoutButton } from "./logout-button";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false },
};

const menu = [
  { label: "My Orders", href: "/account/orders", Icon: Package, note: "Track & review" },
  { label: "Wishlist", href: "/account/wishlist", Icon: Heart, note: "Saved pieces" },
  { label: "Address Book", href: "/account/addresses", Icon: MapPin, note: "Delivery addresses" },
  { label: "Payment Methods", href: "/account", Icon: CreditCard, note: "Saved cards & UPI" },
  { label: "About Us", href: "/about", Icon: Info, note: "Our story & atelier" },
  { label: "Help & Support", href: "/about#support", Icon: HelpCircle, note: "We're here to help" },
  { label: "Settings", href: "/account", Icon: Settings, note: "Preferences" },
];

export default async function AccountPage() {
  const session = await getSession();
  const profile = session ? await getProfile() : null;

  return (
    <div className="container-zorael py-8 lg:py-12">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Account" }]}
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-[340px_1fr]">
        {/* Profile / sign-in card */}
        <aside>
          <div className="rounded-lg border border-border bg-white p-6">
            {session ? (
              <>
                <div className="flex items-center gap-4">
                  <span className="flex size-14 items-center justify-center rounded-full bg-cream text-muted-gold">
                    <User className="size-6" strokeWidth={1.25} />
                  </span>
                  <div>
                    <p className="font-serif text-lg tracking-tight text-charcoal">
                      {profile?.fullName || "Welcome back"}
                    </p>
                    <p className="text-xs text-charcoal/55">
                      +91 {session.phone}
                    </p>
                    {profile?.email && (
                      <p className="text-xs text-charcoal/45">{profile.email}</p>
                    )}
                  </div>
                </div>
                <div className="mt-6">
                  <LogoutButton />
                </div>
              </>
            ) : (
              <>
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
                <div className="mt-6">
                  <Link
                    href="/account/login"
                    className="flex h-11 w-full items-center justify-center rounded-full bg-charcoal text-sm font-medium text-ivory transition-colors hover:bg-black"
                  >
                    Sign In
                  </Link>
                </div>
              </>
            )}
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
