import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${SITE.name} — ${SITE.tagline}`;

/**
 * Default social card for every page that doesn't set its own image (product
 * and journal pages override this with their own artwork). Text-based so it
 * needs no bundled font or logo file.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#171613",
          color: "#F5F1E8",
          fontFamily: "Georgia, serif",
          border: "16px solid #0D0D0B",
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 12,
            textTransform: "uppercase",
            color: "#B79A5A",
          }}
        >
          {SITE.tagline}
        </div>
        <div style={{ fontSize: 104, letterSpacing: 6, marginTop: 28 }}>
          ZORAEL &amp; CO.
        </div>
        <div style={{ fontSize: 32, color: "rgba(245,241,232,0.8)", marginTop: 24 }}>
          {SITE.motto}
        </div>
      </div>
    ),
    size,
  );
}
