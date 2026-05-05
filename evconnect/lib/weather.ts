import { WeatherData } from "./types";

/* ═══════════════════════════════════════════════════════════
   Weather Service — Open-Meteo API (free, no key needed)
   ═══════════════════════════════════════════════════════════ */

/**
 * WMO Weather Code descriptions
 */
function getWeatherDescription(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rainy";
  if (code <= 77) return "Snowy";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}

/**
 * Get weather icon based on weather code
 */
export function getWeatherIcon(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 86) return "🌨️";
  if (code <= 99) return "⛈️";
  return "🌤️";
}

/**
 * Fetch current weather from Open-Meteo
 */
export async function getWeather(
  lat: number,
  lng: number
): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,weathercode&timezone=auto`;
    const response = await fetch(url);
    const data = await response.json();

    return {
      temperature: data.current.temperature_2m,
      isRaining: data.current.precipitation > 0,
      weatherCode: data.current.weathercode,
      description: getWeatherDescription(data.current.weathercode),
    };
  } catch (error) {
    console.error("Weather fetch error:", error);
    // Fallback — assume Bangalore weather
    return {
      temperature: 28,
      isRaining: false,
      weatherCode: 0,
      description: "Clear sky",
    };
  }
}
