import axios from 'axios';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export class GeocodingService {
  /**
   * Geocodes a location based on university and country.
   * Fallback priority:
   * 1. {university}, {country}
   * 2. {country}
   */
  static async geocodeLocation(university: string | null, country: string | null): Promise<GeoCoordinates | null> {
    if (!university && !country) return null;

    try {
      // Priority 1: University + Country
      if (university && country) {
        const coords = await this.queryNominatim(`${university}, ${country}`);
        if (coords) return coords;
      }

      // Priority 2: University only (if country is null)
      if (university) {
        const coords = await this.queryNominatim(university);
        if (coords) return coords;
      }

      // Priority 3: Country fallback
      if (country) {
        const coords = await this.queryNominatim(country);
        if (coords) return coords;
      }

      return null;
    } catch (error) {
      console.error('[GeocodingService] Error during geocoding:', error);
      return null;
    }
  }

  private static async queryNominatim(query: string): Promise<GeoCoordinates | null> {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: query,
          format: 'json',
          limit: 1,
        },
        headers: {
          'User-Agent': 'EducationalPathwayScholarshipBot/1.0',
        }
      });

      if (response.data && response.data.length > 0) {
        return {
          latitude: parseFloat(response.data[0].lat),
          longitude: parseFloat(response.data[0].lon),
        };
      }
      return null;
    } catch (error) {
      console.warn(`[GeocodingService] Failed to geocode query: ${query}`);
      return null;
    }
  }
}
