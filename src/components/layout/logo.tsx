import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="ZORAEL & CO. — home"
      className={cn(
        "font-serif text-xl tracking-[0.14em] text-charcoal transition-opacity hover:opacity-70 sm:text-2xl",
        className,
      )}
    >
      ZORAEL <span className="text-muted-gold">&amp;</span> CO.
    </Link>
  );
}

/** Monogram mark for compact spaces (bottom sheet, splash, icons). */
export function Monogram({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline font-serif tracking-tight text-gold",
        className,
      )}
    >
      Z<span className="text-[0.7em] text-muted-gold">&amp;</span>C
    </span>
  );
}
