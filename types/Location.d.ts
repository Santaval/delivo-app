interface LocationResponse {
  placeId: string;
  description: string;
}

interface PlaceDetails {
  placeId: string;
  description: string;
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}