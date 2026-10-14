import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getSession } from "@/lib/auth";
import { getAddresses } from "./actions";
import { AddressList } from "./address-list";

export const metadata: Metadata = {
  title: "Address Book",
  robots: { index: false },
};

export default async function AddressBookPage() {
  const session = await getSession();
  const addresses = session ? await getAddresses() : [];

  return (
    <div className="container-zorael py-8 lg:py-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Account", href: "/account" },
          { label: "Address Book" },
        ]}
      />

      <h1 className="mt-6 font-serif text-2xl tracking-tight text-charcoal">
        Address Book
      </h1>

      {session ? (
        <AddressList addresses={addresses} />
      ) : (
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-border bg-white py-20 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-cream text-muted-gold">
            <MapPin className="size-7" strokeWidth={1.25} />
          </span>
          <p className="mt-5 font-serif text-lg tracking-tight text-charcoal">
            Please sign in to manage your addresses
          </p>
          <p className="mt-1.5 max-w-xs text-sm text-charcoal/55">
            Sign in to save delivery addresses for faster checkout.
          </p>
          <Link
            href="/account/login"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-charcoal px-7 text-sm font-medium text-ivory transition-colors hover:bg-black"
          >
            Sign In
            <ArrowRight className="size-4" strokeWidth={1.5} />
          </Link>
        </div>
      )}
    </div>
  );
}
