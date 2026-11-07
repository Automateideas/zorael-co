/**
 * Courier tracking pages.
 *
 * These are the couriers' own fixed landing pages, not per-shipment deep links:
 * the customer opens the page and pastes the AWB they copied. That keeps this
 * list stable — a courier changing its internal URL format cannot turn a saved
 * order into a broken link.
 *
 * A carrier that is not listed here simply shows no link. The AWB and its copy
 * button still appear, so an unrecognised courier degrades quietly instead of
 * sending the customer somewhere wrong.
 */
const COURIERS: Record<string, { label: string; url: string }> = {
  // Every URL here was checked to return 200. Couriers whose tracking page
  // could not be reached were left out on purpose: no link is better than one
  // that sends a customer to a dead page, and an unlisted courier still shows
  // the AWB with its copy button.
  delhivery: { label: "Delhivery", url: "https://www.delhivery.com/tracking" },
  bluedart: { label: "Blue Dart", url: "https://www.bluedart.com/tracking" },
  dtdc: { label: "DTDC", url: "https://www.dtdc.in/tracking" },
  xpressbees: { label: "XpressBees", url: "https://www.xpressbees.com/track" },
  shiprocket: {
    label: "Shiprocket",
    url: "https://www.shiprocket.in/shipment-tracking/",
  },
};

export type Courier = { label: string; url: string };

/** Lower-cased, punctuation- and space-free, so "Blue Dart" matches "bluedart". */
function normalize(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Resolves a stored carrier name to its tracking page.
 *
 * Matches on a contained key as well as an exact one, so "Delhivery Surface"
 * and "Delhivery Express" both resolve rather than silently losing the link.
 */
export function resolveCourier(raw?: string | null): Courier | null {
  if (!raw) return null;
  const key = normalize(raw);
  if (!key) return null;
  if (COURIERS[key]) return COURIERS[key];
  const hit = Object.keys(COURIERS).find((k) => key.includes(k));
  return hit ? COURIERS[hit] : null;
}

/** The carriers offered in the admin dropdown, in the order shown. */
export const COURIER_OPTIONS = Object.values(COURIERS).map((c) => c.label);
