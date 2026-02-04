import BaseApiService from "../config/BaseApiService";


export default class PlacesService extends BaseApiService {
  /**
   * Autocomplete location search
   * @param query - Search query
   * @returns {Promise<LocationResponse[]>}
   */
  static async autocomplete(query: string): Promise<LocationResponse[]> {
    try {
      const queryParams = new URLSearchParams({ q: query });
      const { data } = await this.get<{results: LocationResponse[]}>(`/locations/autocomplete?${queryParams.toString()}`);
      return data.results;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get place details including coordinates
   * @param placeId - Google Place ID
   * @returns {Promise<PlaceDetails>}
   */
  static async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    try {
      const { data } = await this.get<PlaceDetails>(`/locations/place/${placeId}`);
      return data;
    } catch (error) {
      throw error;
    }
  }

}