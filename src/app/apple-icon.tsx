import { ImageResponse } from "next/og";
import { LOGO_BACKGROUND, logoBox, logoDataUri } from "@/lib/brand-logo";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const box = logoBox(size.width);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: LOGO_BACKGROUND,
          overflow: "hidden",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoDataUri()} alt="" width={box.width} height={box.height} />
      </div>
    ),
    size,
  );
}
