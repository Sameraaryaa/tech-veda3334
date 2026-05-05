# ⚡ EVConnect — P2P EV Charging Network

> **Find. Charge. Go.** — India's first peer-to-peer EV charging platform.

Built for **VisionAstraa EV Academy Hackathon** | Combined Problems 2 + 6 + 9

---

## 🚀 What We Built

EVConnect is a unified EV platform with 3 modules that work as ONE seamless user journey:

1. **P2P Charger Marketplace** — List and book home chargers (Problem 2)
2. **Smart Route + Battery Predictor** — Route planning with weather-adjusted battery calculation (Problem 6)
3. **EVA — AI Assistant** — Gemini 2.5 Flash powered chatbot with live Firebase context (Problem 9)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 App Router + TypeScript + Tailwind CSS |
| Map | Mapbox GL JS (navigation-night-v1 style) |
| Realtime DB | Firebase Realtime Database |
| Auth | Firebase Auth (Google Sign-in) |
| AI | Gemini 2.5 Flash API |
| Routing | OpenRouteService (free, no credit card) |
| Weather | Open-Meteo (free, no API key) |
| Hosting | Vercel |

---

## 📦 Setup

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env.local

# 3. Add your API keys to .env.local:
#    - NEXT_PUBLIC_MAPBOX_TOKEN (mapbox.com)
#    - NEXT_PUBLIC_FIREBASE_* (Firebase Console)
#    - NEXT_PUBLIC_GEMINI_API_KEY (aistudio.google.com)
#    - NEXT_PUBLIC_ORS_API_KEY (openrouteservice.org)

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🎮 Demo Flow

1. Click **"Demo Mode"** on the map page
2. Watch route auto-calculate (Koramangala → Whitefield)
3. See battery warning (35% won't make it with weather factors)
4. Browse chargers sorted by distance along route
5. Click **"Book Now"** → see cost calculator → confirm
6. Open **EVA** → ask "Is my booking confirmed?"
7. EVA responds with live data from Firebase

---

## 🏗️ Architecture

```
/app
  page.tsx          → Landing page (hero + stats + how-it-works)
  /map/page.tsx     → Main map dashboard (core screen)
  /list-charger/    → 3-step charger listing wizard
  /profile/         → User EV profile + settings

/components
  /map/MapView      → Mapbox GL JS with custom markers
  /charger/         → ChargerCard + BookingModal
  /chat/EVAChat     → Gemini AI chat panel
  /route/           → RoutePlanner + BatteryGauge
  /ui/              → Navbar + StatusBadge

/lib
  firebase.ts       → Firebase init + CRUD + realtime listeners
  gemini.ts         → Gemini 2.5 Flash with context injection
  weather.ts        → Open-Meteo weather fetching
  routing.ts        → OpenRouteService + Mapbox geocoding
  /algorithms/      → Battery prediction + pricing logic
  /data/            → Mock chargers + state pricing
```

---

## 🔑 Key Features

- **Real-time charger markers** — Firebase listeners update map markers instantly
- **Weather-adjusted battery prediction** — Cold, rain, and AC usage reduce range
- **State-aware pricing** — BESCOM, MSEDCL, BSES rates with floor/ceiling
- **Smart route planning** — Finds chargers along your route when battery is insufficient
- **EVA AI assistant** — Gemini with live charger/route/weather context injection
- **One-click demo mode** — Sets up the complete hackathon story

---

## 👥 Team EVConnect

Built with ⚡ for VisionAstraa EV Academy Hackathon
