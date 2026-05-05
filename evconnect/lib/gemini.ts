import { GoogleGenerativeAI } from "@google/generative-ai";
import { Charger, RouteData, UserProfile, WeatherData } from "./types";

/* ═══════════════════════════════════════════════════════════
   EVA — Gemini 2.5 Flash AI Assistant
   ═══════════════════════════════════════════════════════════ */

const SYSTEM_PROMPT = `You are EVA, an intelligent EV charging assistant for the EVConnect platform in India.

You have access to real-time data that will be injected before each user message:
- LIVE_CHARGERS: JSON array of nearby available chargers with location, price, connector type
- USER_ROUTE: Current route details (start, end, distance, battery status)
- USER_PROFILE: EV model, battery capacity, connector type
- CURRENT_WEATHER: Temperature, rain status at user location

Your capabilities:
1. Help users find and book nearby P2P chargers
2. Explain battery predictions and why range varies with weather
3. Calculate charging costs for specific chargers
4. Answer any EV-related technical questions (connectors, charging speeds, battery care)
5. Guide users through the booking process

Rules:
- Always be specific — use actual charger names, prices, distances from the data
- If no chargers found nearby, suggest expanding search radius
- Always mention charging time estimate alongside cost
- For booking, confirm: charger name + estimated cost + charging time + owner contact
- Keep responses under 120 words — this is a mobile chat interface
- Use Indian context: prices in ₹, distances in km, cities by Indian names

You are NOT a general chatbot. Stay focused on EV charging, routing, and the EVConnect platform only.`;

/**
 * Build context string from live app data
 */
function buildContext(context: {
  nearbyChargers: Charger[];
  currentRoute?: RouteData;
  userProfile?: UserProfile;
  weather?: WeatherData;
}): string {
  const parts: string[] = [];

  if (context.nearbyChargers.length > 0) {
    const top5 = context.nearbyChargers.slice(0, 5).map((c) => ({
      name: c.ownerName,
      address: c.location.address,
      city: c.location.city,
      connector: c.connectorType,
      powerKW: c.powerKW,
      price: `₹${c.pricePerUnit}/kWh`,
      status: c.status,
      rating: c.rating,
      distance: c.distanceKm ? `${c.distanceKm.toFixed(1)} km` : "unknown",
    }));
    parts.push(`LIVE_CHARGERS: ${JSON.stringify(top5)}`);
  } else {
    parts.push("LIVE_CHARGERS: No chargers nearby");
  }

  if (context.currentRoute) {
    parts.push(
      `USER_ROUTE: Distance ${context.currentRoute.distanceKm.toFixed(1)} km, Duration ${Math.round(context.currentRoute.durationMinutes)} min`
    );
  }

  if (context.userProfile) {
    parts.push(
      `USER_PROFILE: ${context.userProfile.evModel}, ${context.userProfile.batteryCapacityKwh} kWh, ${context.userProfile.connectorType}`
    );
  }

  if (context.weather) {
    parts.push(
      `CURRENT_WEATHER: ${context.weather.temperature}°C, ${context.weather.description}, Rain: ${context.weather.isRaining ? "Yes" : "No"}`
    );
  }

  return parts.join("\n");
}

/**
 * Chat with EVA using Gemini 2.5 Flash
 */
export async function chatWithEVA(
  userMessage: string,
  context: {
    nearbyChargers: Charger[];
    currentRoute?: RouteData;
    userProfile?: UserProfile;
    weather?: WeatherData;
  }
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    return "EVA is not configured yet. Please add your Gemini API key to .env.local";
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const contextString = buildContext(context);
    const fullMessage = `${contextString}\n\nUser: ${userMessage}`;

    const result = await model.generateContent(fullMessage);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("EVA Error:", error);
    return "EVA is temporarily unavailable. Use the map to find chargers directly.";
  }
}
