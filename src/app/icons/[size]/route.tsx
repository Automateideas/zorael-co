import { ImageResponse } from "next/og";
import { LOGO_BACKGROUND, logoBox, logoDataUri } from "@/lib/brand-logo";

export const dynamic = "force-static";

/** Pre-render the two sizes the manifest references. */
export function generateStaticParams() {
  return [{ size: "192" }, { size: "512" }];
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ size: string }> },
) {
  const { size } = await params;
  const dim = size === "512" ? 512 : 192;
  const box = logoBox(dim);

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
        <img
          src={logoDataUri()}
          alt=""
          width={box.width}
          height={box.height}
        />
      </div>
    ),
    { width: dim, height: dim },
  );
}
