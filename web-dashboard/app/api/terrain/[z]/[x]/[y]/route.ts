import { NextRequest, NextResponse } from "next/server";

// 1x1 transparent PNG fallback buffer
const EMPTY_PNG_BUFFER = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64"
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ z: string; x: string; y: string }> }
) {
  try {
    const { z, x, y } = await params;
    const cleanY = y.replace(/\.png$/, "");
    const tileUrl = `https://elevation-tiles-prod.s3.amazonaws.com/terrarium/${z}/${x}/${cleanY}.png`;

    const res = await fetch(tileUrl, {
      next: { revalidate: 86400 }
    });

    if (!res.ok) {
      // Return 200 with an empty tile so MapLibre GL never throws an AJAXError (530 / 404)
      return new NextResponse(EMPTY_PNG_BUFFER, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    const imageBuffer = await res.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=604800, immutable",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    // Return 200 fallback tile instead of 404 to suppress client AJAXErrors
    return new NextResponse(EMPTY_PNG_BUFFER, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
