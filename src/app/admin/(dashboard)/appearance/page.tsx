import { getAppearance } from "./actions";
import { SlotEditor } from "./slot-editor";

export const dynamic = "force-dynamic";

export default async function AppearancePage() {
  const slots = await getAppearance();

  const homepage = slots.filter((s) => !s.slot.startsWith("about-"));
  const about = slots.filter((s) => s.slot.startsWith("about-"));

  return (
    <div>
      <h1 className="font-serif text-2xl tracking-tight text-charcoal">
        Page Images
      </h1>
      <p className="mt-1 text-sm text-charcoal/50">
        Change the imagery on the homepage and About page. Pick from images
        already uploaded under Storage.
      </p>

      <h2 className="mt-8 text-xs font-medium uppercase tracking-[0.15em] text-charcoal/45">
        Homepage
      </h2>
      <div className="mt-3 space-y-4">
        {homepage.map((slot) => (
          <SlotEditor key={slot.slot} slot={slot} />
        ))}
      </div>

      <h2 className="mt-8 text-xs font-medium uppercase tracking-[0.15em] text-charcoal/45">
        About Page
      </h2>
      <div className="mt-3 space-y-4">
        {about.map((slot) => (
          <SlotEditor key={slot.slot} slot={slot} />
        ))}
      </div>
    </div>
  );
}
