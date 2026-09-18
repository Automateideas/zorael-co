import Link from "next/link";
import { SITE } from "@/lib/site";
import { Monogram } from "./logo";
import { NewsletterForm } from "@/components/newsletter-form";

const footerLinks = [
  {
    title: "Shop",
    links: [
      { label: "Clothes", href: "/shop?category=clothes" },
      { label: "Jewellery", href: "/shop?category=jewelry" },
      { label: "Hand Bags", href: "/shop?category=hand-bags" },
      { label: "Collections", href: "/collections" },
    ],
  },
  {
    title: "The House",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Journal", href: "/journal" },
      { label: "Collections", href: "/collections" },
      { label: "Customer Support", href: "/about#support" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "My Account", href: "/account" },
      { label: "Track Order", href: "/account" },
      { label: "Wishlist", href: "/account/wishlist" },
      { label: "Your Bag", href: "/bag" },
    ],
  },
];

function SocialIcon({ path, label }: { path: string; label: string }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="flex size-9 items-center justify-center rounded-full border border-white/15 text-ivory/70 transition-colors hover:border-gold hover:text-gold"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-4"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d={path} />
      </svg>
    </a>
  );
}

const socials = [
  {
    label: "Instagram",
    path: "M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.7.1-1.1.1-1.7.2-2.1.4-.5.2-.9.4-1.3.8-.4.4-.6.8-.8 1.3-.2.4-.3 1-.4 2.1C2.6 9.9 2.6 10.3 2.6 12s0 2.1.1 3.3c.1 1.1.2 1.7.4 2.1.2.5.4.9.8 1.3.4.4.8.6 1.3.8.4.2 1 .3 2.1.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.7-.2 2.1-.4.5-.2.9-.4 1.3-.8.4-.4.6-.8.8-1.3.2-.4.3-1 .4-2.1.1-1.2.1-1.6.1-3.3s0-2.1-.1-3.3c-.1-1.1-.2-1.7-.4-2.1-.2-.5-.4-.9-.8-1.3-.4-.4-.8-.6-1.3-.8-.4-.2-1-.3-2.1-.4-1.2-.1-1.6-.1-4.7-.1Zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 8a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2Zm5.1-8.3a1.1 1.1 0 1 1-2.3 0 1.1 1.1 0 0 1 2.3 0Z",
  },
  {
    label: "Pinterest",
    path: "M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.1-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.5 2.1-.8 3.3-.2.9.5 1.7 1.4 1.7 1.7 0 2.9-2.2 2.9-4.7 0-1.9-1.3-3.4-3.7-3.4-2.7 0-4.4 2-4.4 4.3 0 .8.2 1.3.6 1.8.2.2.2.3.1.5l-.2.8c-.1.3-.3.4-.5.2-1.1-.5-1.7-1.9-1.7-3.4 0-2.6 2.2-5.7 6.5-5.7 3.5 0 5.8 2.5 5.8 5.2 0 3.6-2 6.2-4.9 6.2-1 0-1.9-.5-2.2-1.1l-.6 2.4c-.2.8-.7 1.7-1 2.3A10 10 0 1 0 12 2Z",
  },
  {
    label: "Facebook",
    path: "M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z",
  },
  {
    label: "YouTube",
    path: "M23 7.5a3 3 0 0 0-2.1-2.1C19 4.8 12 4.8 12 4.8s-7 0-8.9.6A3 3 0 0 0 1 7.5C.4 9.4.4 12 .4 12s0 2.6.6 4.5a3 3 0 0 0 2.1 2.1c1.9.6 8.9.6 8.9.6s7 0 8.9-.6a3 3 0 0 0 2.1-2.1c.6-1.9.6-4.5.6-4.5s0-2.6-.6-4.5ZM9.8 15.3V8.7l5.7 3.3-5.7 3.3Z",
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-black text-ivory">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="container-zorael grid gap-8 py-14 md:grid-cols-2 md:items-center md:gap-16 md:py-16">
          <div>
            <span className="flex items-center gap-2 font-serif text-2xl tracking-[0.14em]">
              <Monogram className="text-3xl" /> {SITE.name}
            </span>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ivory/60">
              The Zorael Edit — be the first to discover new collections,
              editorial stories and considered pieces.
            </p>
          </div>
          <div>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Link columns */}
      <div className="container-zorael grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="max-w-xs">
          <p className="font-serif text-lg tracking-wide text-gold">
            {SITE.tagline}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ivory/55">
            {SITE.description}
          </p>
          <div className="mt-6 flex gap-3">
            {socials.map((s) => (
              <SocialIcon key={s.label} label={s.label} path={s.path} />
            ))}
          </div>
        </div>

        {footerLinks.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="text-[0.72rem] font-medium uppercase tracking-[0.2em] text-ivory/50">
              {col.title}
            </h3>
            <ul className="mt-5 space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-ivory/70 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-zorael flex flex-col items-center justify-between gap-3 py-6 text-xs text-ivory/45 sm:flex-row">
          <p>© {new Date().getFullYear()} Zorael &amp; Co. All rights reserved.</p>
          <p className="tracking-[0.16em] text-ivory/40">
            LUXURY IN EVERY DETAIL
          </p>
        </div>
      </div>
    </footer>
  );
}
