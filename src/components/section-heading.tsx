import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  viewAllHref,
  viewAllLabel = "View All",
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-end justify-between gap-6",
        align === "center" && "flex-col items-center text-center",
        className,
      )}
    >
      <div className={cn(align === "center" && "max-w-2xl")}>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="font-serif text-3xl leading-tight tracking-tight text-charcoal sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-charcoal/60">
            {description}
          </p>
        )}
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="link-underline shrink-0 whitespace-nowrap pb-1"
        >
          {viewAllLabel}
          <ArrowRight className="size-3.5" strokeWidth={1.5} />
        </Link>
      )}
    </div>
  );
}
