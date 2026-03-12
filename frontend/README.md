# 🌐 GeoTrade Intelligence Platform

> **AI-powered geopolitical trade risk intelligence for India — real-time, sector-specific, decision-ready.**

[![Team](https://img.shields.io/badge/Team-Nakshatra-teal?style=flat-square)](https://github.com)
[![Competition](https://img.shields.io/badge/India%20Innovates-2026-orange?style=flat-square)](https://github.com)
[![University](https://img.shields.io/badge/Mumbai%20University-blue?style=flat-square)](https://mu.ac.in)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff?style=flat-square&logo=vite)](https://vitejs.dev)

---

## 🎯 Problem

India's importers, exporters, and policymakers operate in an increasingly volatile global trade environment — from Red Sea shipping disruptions and OPEC+ supply cuts to sudden export bans and currency crises. Today, this intelligence is scattered across dozens of news sources, UN databases, MarineTraffic feeds, and commodity exchanges. Decision-makers lack a single, unified view of how global events translate into concrete rupee impacts on specific sectors like petroleum, fertilizers, pharmaceuticals, and IT services.

## 💡 Solution

**GeoTrade Intelligence Platform** aggregates geopolitical signals, trade data, and commodity price movements into a single, AI-augmented dashboard designed for the Indian context. It maps risk to specific supply chains, quantifies inflation pressure, identifies counter-cyclical export opportunities, and surfaces actionable insights — all in plain English. The embedded GeoTrade AI (powered by Claude) lets any stakeholder ask natural-language questions and get grounded, sector-specific answers in seconds.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗺️ **Live Risk Dashboard** | Summary stats, alert ticker, import risk panel, export opportunities |
| 🔔 **Alerts Center** | Filterable, expandable geopolitical alerts with severity levels (HIGH/MODERATE/LOW) |
| 🏭 **Sector Intelligence** | Deep dive into 6 sectors: Petroleum, Fertilizers, Pharma, Engineering, IT, Textiles |
| 🌍 **Market Position Map** | Interactive world map with clickable country-level trade data |
| 📊 **Economic Impact Panel** | Inflation gauge, commodity tracker, supply shortage timeline, industrial output impact |
| 🤖 **GeoTrade AI** | Floating Claude-powered chat assistant for plain-English trade queries |
| 💀 **Skeleton Loading** | 1.5s simulated fetch with animated placeholder cards |
| 🔄 **Refresh & Error States** | Live refresh, cached-data notice, network error banner |
| 📱 **Full Responsive Design** | Mobile-first, hamburger nav, horizontal chart scroll, touch targets |
| ♿ **WCAG AA Accessible** | Focus rings, ARIA labels, color contrast compliance |
| 🇮🇳 **India Branding** | Tricolor header strip, IST clock, India-context data |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18.3 + Vite 5.4 |
| **Routing** | React Router DOM v7 |
| **Styling** | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| **Charts** | Recharts v3 |
| **World Map** | react-simple-maps (D3 / TopoJSON) |
| **Icons** | lucide-react |
| **AI Assistant** | Anthropic Claude API (`claude-sonnet-4`) |
| **Fonts** | Inter via Google Fonts |
| **State** | React Context API |
| **Offline** | Service Worker (Cache-First shell) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x  (check: `node -v`)
- **npm** ≥ 9.x  (check: `npm -v`)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/team-nakshatra/geotrade-platform.git
cd geotrade-platform

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and add your Anthropic API key

# 4. Start the development server
npm run dev
# OR
npm start
```

The app will be available at **http://localhost:5173**

### Build for Production

```bash
npm run build       # Outputs to /dist
npm run preview     # Preview the production build locally
```

---

## 🔐 Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```env
# Required — Anthropic Claude API for the AI chat assistant
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional
VITE_APP_ENV=production
```

> **⚠️ Note:** This app calls the Anthropic API directly from the browser (using `anthropic-dangerously-allow-browser: true`). For production deployments, route API calls through a secure backend proxy to protect your key.

---

## 📁 Project Structure

```
geotrade-platform/
├── public/
│   └── sw.js                    # Service Worker (offline support)
├── src/
│   ├── components/
│   │   ├── DevChecklist.jsx     # Dev-only testing checklist (DEV mode only)
│   │   ├── EconomicImpactPanel.jsx  # Slide-in economic indicators panel
│   │   ├── ErrorBoundary.jsx    # Top-level error boundary
│   │   ├── GeoTradeAI.jsx       # Floating AI chat assistant
│   │   ├── NavBar.jsx           # Responsive navigation bar
│   │   └── RiskBadge.jsx        # Color-coded risk badge with pulse animation
│   ├── layouts/
│   │   └── MainLayout.jsx       # App shell: header, footer, error banner, refresh
│   ├── pages/
│   │   ├── Dashboard.jsx        # Main dashboard (stats, risks, opportunities)
│   │   ├── Alerts.jsx           # Filterable geopolitical alerts
│   │   ├── Sectors.jsx          # Sector deep-dive with charts
│   │   ├── MarketPosition.jsx   # World map + competitor comparison (lazy-loaded)
│   │   └── About.jsx            # Platform information page
│   ├── App.jsx                  # Root: routing, lazy loading, error boundary
│   ├── GlobalState.jsx          # Context: shared state, loading, refresh logic
│   ├── index.css                # Global styles, animations, WCAG improvements
│   ├── main.jsx                 # React DOM entry point
│   └── mockData.js              # Comprehensive mock dataset (35k+ lines)
├── .env.example                 # Environment variable template
├── index.html                   # HTML shell with Google Fonts + SW registration
├── package.json
├── vite.config.js
└── README.md
```

---

## 📡 Data Sources

| Source | Usage |
|---|---|
| **UN Comtrade** | India bilateral trade volumes and commodity flows |
| **MarineTraffic** | Shipping lane disruption signals |
| **NewsAPI** | Geopolitical event detection and classification |
| **World Bank Open Data** | Macroeconomic indicators and inflation baselines |
| **DGFT India (mock)** | Sector-level export/import licensing data |

> *Current implementation uses AI-curated mock data representative of real-world patterns. Live API integration is the next milestone.*

---

## 📸 Screenshots

| Dashboard | Alerts | Sector Intelligence |
|---|---|---|
| *(placeholder)* | *(placeholder)* | *(placeholder)* |

| Market Position Map | GeoTrade AI Chat | Economic Impact Panel |
|---|---|---|
| *(placeholder)* | *(placeholder)* | *(placeholder)* |

---

## 🤖 AI Features

The embedded **GeoTrade AI** assistant is powered by Anthropic's `claude-sonnet-4` model with a dedicated system prompt that:
- Grounds responses in Indian trade context (petroleum, fertilizers, pharma, IT)
- Keeps answers concise (3-4 sentences max)
- Avoids jargon — plain English for policymakers and businesses alike
- References specific dashboard sections for follow-up exploration

---

## 🏆 Competition Context

**Event:** India Innovates 2026  
**Team:** Nakshatra  
**Institution:** Mumbai University  
**Category:** AI for Public Policy & Economic Intelligence  
**Submission Date:** March 2026

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Built with ❤️ for India's Trade Future</strong><br/>
  Team Nakshatra · Mumbai University · India Innovates 2026
</div>
