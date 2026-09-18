import { Truck } from "lucide-react";
import { SITE } from "@/lib/site";

export function AnnouncementBar() {
  return (
    <div className="bg-black text-ivory">
      <div className="container-zorael flex h-9 items-center justify-between gap-4 text-[0.7rem] tracking-wide">
        <p className="mx-auto flex items-center gap-2 sm:mx-0">
          {SITE.announcement}
        </p>
        <div className="hidden items-center gap-6 sm:flex">
          <span className="flex items-center gap-1.5 text-ivory/80">
            <Truck className="size-3.5 text-gold" strokeWidth={1.5} />
            {SITE.freeShippingNote}
          </span>
          <span className="text-ivory/60">INR ₹</span>
        </div>
      </div>
    </div>
  );
}
