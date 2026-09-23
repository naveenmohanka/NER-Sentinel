import { NextRequest, NextResponse } from "next/server";

// In-memory cache to avoid repeated external lookups
const geocodeCache = new Map<string, any>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 });
  }

  const cacheKey = `${parseFloat(lat).toFixed(4)},${parseFloat(lng).toFixed(4)}`;
  if (geocodeCache.has(cacheKey)) {
    return NextResponse.json(geocodeCache.get(cacheKey));
  }

  // 1. Try BigDataCloud first (fastest, high rate limit)
  try {
    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { signal: AbortSignal.timeout(3500) }
    );

    if (bdcRes.ok) {
      const data = await bdcRes.json();
      const locality = data.locality || data.city || "";
      const district =
        data.localityInfo?.administrative?.find(
          (a: any) => a.order === 10 || a.description?.toLowerCase().includes("district")
        )?.name || "";
      const state = data.principalSubdivision || "";
      const country = data.countryName || "India";

      const parts = [locality, district, state].filter(Boolean);
      const shortAddress = parts.join(", ") || `${data.city || "Area"}, ${state}`;
      const fullAddress = [locality, data.city, district, state, country]
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i)
        .join(", ");

      const result = {
        success: true,
        shortAddress,
        fullAddress: fullAddress || shortAddress,
        city: locality || data.city || "",
        state,
        district,
      };

      geocodeCache.set(cacheKey, result);
      return NextResponse.json(result);
    }
  } catch (err) {
    // Continue to Nominatim fallback
  }

  // 2. Try OpenStreetMap Nominatim
  try {
    const osmRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: { "User-Agent": "NERSentinel-GovDashboard/1.0" },
        signal: AbortSignal.timeout(3500),
      }
    );

    if (osmRes.ok) {
      const data = await osmRes.json();
      const addr = data.address || {};
      const sub = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || "";
      const dist = addr.state_district || addr.county || "";
      const state = addr.state || "";
      const full = data.display_name || "";

      const parts = [sub, dist, state].filter(Boolean);
      const shortAddress = parts.join(", ") || full;

      const result = {
        success: true,
        shortAddress,
        fullAddress: full || shortAddress,
        city: sub,
        state,
        district: dist,
      };

      geocodeCache.set(cacheKey, result);
      return NextResponse.json(result);
    }
  } catch (err) {
    // Silent
  }

  // 3. Fallback
  const fallbackResult = {
    success: false,
    shortAddress: `Sector [${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}]`,
    fullAddress: `Coordinates: ${parseFloat(lat).toFixed(4)}°N, ${parseFloat(lng).toFixed(4)}°E`,
    city: "",
    state: "",
    district: "",
  };

  return NextResponse.json(fallbackResult);
}
