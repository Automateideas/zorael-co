import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "gold" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-muted-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const variants: Record<Variant, string> = {
  primary: "bg-charcoal text-ivory hover:bg-black",
  secondary:
    "border border-charcoal/70 bg-transparent text-charcoal hover:bg-charcoal hover:text-ivory",
  gold: "bg-muted-gold text-white hover:bg-gold",
  ghost: "text-charcoal hover:text-muted-gold",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-8 text-sm",
};

export function PillLink({
  href,
  children,
  variant = "primary",
  size = "md",
  withArrow = false,
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  withArrow?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {children}
      {withArrow && <ArrowRight className="size-4" strokeWidth={1.75} />}
    </Link>
  );
}
