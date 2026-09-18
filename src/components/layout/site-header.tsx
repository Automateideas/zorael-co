import Link from "next/link";
import { Heart, Search, User } from "lucide-react";
import { AnnouncementBar } from "./announcement-bar";
import { DesktopNav } from "./desktop-nav";
import { HeaderSearch } from "./header-search";
import { MobileMenu } from "./mobile-menu";
import { CartBadge } from "./cart-badge";
import { Logo } from "./logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-ivory">
      <AnnouncementBar />

      <div className="border-b border-border">
        <div className="container-zorael flex h-16 items-center gap-4 lg:h-20">
          {/* Mobile: menu */}
          <div className="flex items-center lg:hidden">
            <MobileMenu />
          </div>

          {/* Logo — centered on mobile, left on desktop */}
          <div className="flex flex-1 justify-center lg:flex-none lg:justify-start">
            <Logo />
          </div>

          {/* Desktop nav */}
          <div className="hidden flex-1 justify-center lg:flex">
            <DesktopNav />
          </div>

          {/* Desktop search */}
          <div className="hidden justify-end lg:flex lg:flex-1">
            <HeaderSearch />
          </div>

          {/* Icon actions */}
          <div className="flex items-center gap-4 lg:gap-5 lg:pl-5">
            <Link
              href="/search"
              aria-label="Search"
              className="text-charcoal transition-colors hover:text-muted-gold lg:hidden"
            >
              <Search className="size-5" strokeWidth={1.5} />
            </Link>
            <Link
              href="/account"
              aria-label="Account"
              className="hidden text-charcoal transition-colors hover:text-muted-gold lg:inline-flex"
            >
              <User className="size-5" strokeWidth={1.5} />
            </Link>
            <Link
              href="/account/wishlist"
              aria-label="Wishlist"
              className="hidden text-charcoal transition-colors hover:text-muted-gold lg:inline-flex"
            >
              <Heart className="size-5" strokeWidth={1.5} />
            </Link>
            <CartBadge />
          </div>
        </div>
      </div>
    </header>
  );
}
