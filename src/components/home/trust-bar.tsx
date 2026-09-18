import { Gem, Globe, ShieldCheck, Sparkles } from "lucide-react";

const items = [
  {
    Icon: Gem,
    title: "Premium Quality",
    copy: "Only the finest materials",
  },
  {
    Icon: Globe,
    title: "Worldwide Shipping",
    copy: "Luxury delivered globally",
  },
  {
    Icon: ShieldCheck,
    title: "Secure Payments",
    copy: "Shop with confidence",
  },
  {
    Icon: Sparkles,
    title: "Curated Collections",
    copy: "Timeless & exclusive",
  },
];

export function TrustBar() {
  return (
    <section className="border-y border-border bg-ivory">
      <div className="container-zorael grid grid-cols-2 gap-x-6 gap-y-8 py-10 lg:grid-cols-4">
        {items.map(({ Icon, title, copy }) => (
          <div key={title} className="flex items-center gap-3.5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-muted-gold/40 text-muted-gold">
              <Icon className="size-5" strokeWidth={1.4} />
            </span>
            <div>
              <p className="text-sm font-medium text-charcoal">{title}</p>
              <p className="text-xs text-charcoal/55">{copy}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
