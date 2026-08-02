import polyline from "@mapbox/polyline";

type Coord = {
  lat: number;
  lng: number;
};

const EARTH_RADIUS_KM = 6371;
const toRad = (deg: number) => (deg * Math.PI) / 180;

export function haversineKm(a: Coord, b: Coord): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

  return EARTH_RADIUS_KM * c;
}

export function polylineDistanceKm(encoded: string | undefined | null): number {
  if (!encoded) return 0;

  const points = polyline.decode(encoded);
  if (points.length < 2) return 0;

  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const [prevLat, prevLng] = points[i - 1];
    const [curLat, curLng] = points[i];
    total += haversineKm(
      { lat: prevLat, lng: prevLng },
      { lat: curLat, lng: curLng }
    );
  }

  return total;
}