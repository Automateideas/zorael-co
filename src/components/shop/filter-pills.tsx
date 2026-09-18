import Link from "next/link";
import { cn } from "@/lib/utils";

export type FilterOption = { label: string; value: string };

/**
 * Server-rendered filter pills. Each pill is a Link that updates the given
 * query param — no client JS required, fully accessible and shareable.
 */
export function FilterPills({
  options,
  active,
  param,
  basePath,
  extraParams,
}: {
  options: readonly FilterOption[];
  active: string;
  param: string;
  basePath: string;
  extraParams?: Record<string, string | undefined>;
}) {
  const buildHref = (value: string) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(extraParams ?? {})) {
      if (v) sp.set(k, v);
    }
    if (value && value !== "all") sp.set(param, value);
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isActive = active === opt.value || (!active && opt.value === "all");
        return (
          <Link
            key={opt.value}
            href={buildHref(opt.value)}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "inline-flex h-9 items-center rounded-full border px-4 text-xs font-medium tracking-wide transition-colors",
              isActive
                ? "border-charcoal bg-charcoal text-ivory"
                : "border-border bg-transparent text-charcoal/70 hover:border-charcoal/40 hover:text-charcoal",
            )}
          >
            {opt.label}
          </Link>
        );
      })}
    </div>
  );
}
