export interface WeatherData {
  temperatureCelsius: number;
  condition:
    | "CLEAR"
    | "PARTLY_CLOUDY"
    | "OVERCAST"
    | "RAIN"
    | "THUNDERSTORM"
    | "HEAVY_MIST"
    | "SNOW";
  conditionLabel: string;
  rainProbabilityPercent: number;
  windSpeedKmh: number;
  humidityPercent: number;
  sunriseTime: string;
  sunsetTime: string;
  alerts: string[];
  provider: "OPEN_METEO_LIVE" | "OPENWEATHER_LIVE" | "CALCULATED_ESTIMATE";
  isLive: boolean;
  isEstimated: boolean;
  fetchedAt: string;
  freshnessLabel: "LIVE" | "RECENT" | "ESTIMATED" | "UNAVAILABLE";
}

/**
 * Maps WMO Weather interpretation codes (used by Open-Meteo) to standard conditions.
 */
function mapWmoCode(code: number): {
  condition: WeatherData["condition"];
  label: string;
} {
  if (code === 0) return { condition: "CLEAR", label: "Clear Sky" };
  if (code === 1 || code === 2) return { condition: "PARTLY_CLOUDY", label: "Partly Cloudy" };
  if (code === 3) return { condition: "OVERCAST", label: "Overcast" };
  if (code >= 45 && code <= 48) return { condition: "HEAVY_MIST", label: "Fog & Mist" };
  if (code >= 51 && code <= 67) return { condition: "RAIN", label: "Rain / Drizzle" };
  if (code >= 71 && code <= 77) return { condition: "SNOW", label: "Snow" };
  if (code >= 80 && code <= 82) return { condition: "RAIN", label: "Heavy Rain Showers" };
  if (code >= 95 && code <= 99) return { condition: "THUNDERSTORM", label: "Thunderstorm Warning" };
  return { condition: "CLEAR", label: "Clear" };
}

// In-memory cache for live weather calls to prevent rate spikes (15-min TTL)
const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * Fetch genuine live meteorological context for sacred coordinates using Open-Meteo.
 * Open-Meteo is completely free, open-source, and does not require a paid API key.
 * If external fetch fails, returns an honest calculated estimate clearly marked as estimated.
 */
export async function getLiveWeather(
  latitude: number,
  longitude: number,
  locationName: string = "Sanctuary"
): Promise<WeatherData> {
  const cacheKey = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  const now = Date.now();
  const cached = weatherCache.get(cacheKey);

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=sunrise,sunset,precipitation_probability_max&timezone=Asia%2FKolkata&forecast_days=1`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Templeora-Sacred-Atlas/1.0" },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const current = data.current;
      const daily = data.daily;
      const wmo = mapWmoCode(current?.weather_code ?? 0);

      const sunrise = daily?.sunrise?.[0] ? daily.sunrise[0].split("T")[1]?.slice(0, 5) : "05:45";
      const sunset = daily?.sunset?.[0] ? daily.sunset[0].split("T")[1]?.slice(0, 5) : "18:30";
      const rainProb = daily?.precipitation_probability_max?.[0] ?? (wmo.condition === "RAIN" ? 80 : 10);

      const alerts: string[] = [];
      if (wmo.condition === "THUNDERSTORM") {
        alerts.push("Severe weather warning: Thunderstorms active in this pilgrimage sector.");
      } else if (current?.temperature_2m > 38) {
        alerts.push("High daytime temperature alert: Afternoon temple pradakshina precautions advised.");
      } else if (current?.temperature_2m < 10) {
        alerts.push("Cold alpine conditions: Warm pilgrim attire recommended for darshan.");
      }

      const weatherResult: WeatherData = {
        temperatureCelsius: Math.round(current?.temperature_2m ?? 28),
        condition: wmo.condition,
        conditionLabel: wmo.label,
        rainProbabilityPercent: rainProb,
        windSpeedKmh: Math.round(current?.wind_speed_10m ?? 8),
        humidityPercent: Math.round(current?.relative_humidity_2m ?? 55),
        sunriseTime: sunrise,
        sunsetTime: sunset,
        alerts,
        provider: "OPEN_METEO_LIVE",
        isLive: true,
        isEstimated: false,
        fetchedAt: new Date().toISOString(),
        freshnessLabel: "LIVE",
      };

      weatherCache.set(cacheKey, { data: weatherResult, timestamp: now });
      return weatherResult;
    }
  } catch (err) {
    console.warn(`[getLiveWeather] Live weather fetch failed for ${locationName}, using honest estimated model:`, err);
  }

  // Honest estimated fallback — clearly marked as ESTIMATED, never pretending to be live
  const isHighAltitude = latitude > 30.0;
  const estimatedResult: WeatherData = {
    temperatureCelsius: isHighAltitude ? 12 : 28,
    condition: isHighAltitude ? "HEAVY_MIST" : "CLEAR",
    conditionLabel: isHighAltitude ? "Mountain Mist (Estimated)" : "Clear (Estimated)",
    rainProbabilityPercent: 20,
    windSpeedKmh: 10,
    humidityPercent: 50,
    sunriseTime: "05:45",
    sunsetTime: "18:30",
    alerts: isHighAltitude ? ["Mountain terrain elevation: Carry warm shawls."] : [],
    provider: "CALCULATED_ESTIMATE",
    isLive: false,
    isEstimated: true,
    fetchedAt: new Date().toISOString(),
    freshnessLabel: "ESTIMATED",
  };

  return estimatedResult;
}
