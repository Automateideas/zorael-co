import { ImageResponse } from "next/og";

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
          color: "#B79A5A",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: dim * 0.42, letterSpacing: -dim * 0.01 }}>
          Z&amp;C
        </div>
        <div
          style={{
            fontSize: dim * 0.08,
            letterSpacing: dim * 0.02,
            color: "#F5F1E8",
            marginTop: dim * 0.03,
          }}
        >
          ZORAEL
        </div>
      </div>
    ),
    { width: dim, height: dim },
  );
}
