<div align="center">
  
  # 🌐 GeoTrade Intelligence Platform (Prototype)
  
  **AI-powered geopolitical trade risk intelligence for India**
  
  *Real-time • Sector-specific • Decision-ready*

  [![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-geotrade.vercel.app-00C853?style=for-the-badge)](https://geotrade.vercel.app)
  [![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Virax17/GEOTRADE)
  
  ---
  
  ![Team](https://img.shields.io/badge/Team-Nakshatra-teal?style=flat-square)
  ![Competition](https://img.shields.io/badge/India%20Innovates-2026-orange?style=flat-square)
  ![University](https://img.shields.io/badge/Mumbai%20University-blue?style=flat-square)
  ![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
  ![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react)
  ![Vite](https://img.shields.io/badge/Vite-5.4-646cff?style=flat-square&logo=vite)

</div>

---

> **⚠️ IMPORTANT NOTICE:** This application is currently a **Prototype** and relies entirely on a highly-detailed **Mock Dataset** (~35k+ lines). While the interface, visualizations, maps, and AI interactions are fully functional and represent the intended user experience, the underlying data (trade volumes, shipping alerts, risk scores) is simulated for demonstration purposes. Live API integration is planned for future development phases.

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Data Sources](#-data-sources)
- [Hackathon Submission](#-hackathon-submission)
- [License](#-license)

---

## 🎯 Problem Statement

India's importers, exporters, and policymakers operate in an increasingly volatile global trade environment — from shipping disruptions and supply chain bottlenecks to sudden export bans and geopolitical crises. Currently, this intelligence is scattered across dozens of news sources, UN databases, marine traffic feeds, and commodity exchanges. Decision-makers lack a **single, unified view** of how global events translate into **concrete financial impacts** on specific Indian sectors.

---

## 💡 Our Solution

**GeoTrade Intelligence Platform** aggregates geopolitical signals, trade data, and commodity price movements into a single, AI-augmented dashboard designed specifically for the Indian context. It maps risks to specific supply chains, quantifies potential inflation pressures, identifies counter-cyclical export opportunities, and surfaces actionable insights. The embedded **GeoTrade AI** (powered by Claude) allows any stakeholder to ask natural-language questions and receive grounded, sector-specific answers in seconds.

---

## ✨ Key Features

### 🗺️ Advanced Mapping & Visualization

- **Interactive 2D & 3D Maps** — Explore global trade using robust Leaflet 2D maps and custom-built Three.js 3D globe
- **Exclusive Economic Zone (EEZ) Layers** — Accurately mapped EEZ boundaries for India and surrounding countries
- **Maritime Routes & Ports** — Visualized major sea routes and key Indian ports with high-density mock data points
- **Synchronized Filtering** — Seamless toggling between 2D and 3D views with persistent data filtering

### 🏭 Comprehensive Sector Intelligence

- **Detailed Sector Deep-Dives** — In-depth analysis for 6 key sectors: Petroleum, Fertilizers, Pharma, Engineering, IT, Textiles
- **Interactive Analytics** — Rich data visualizations using Recharts to track historical trends, import/export data, and risk matrices
- **Risk Score Gauges** — Intuitive visual indicators for immediate assessment of sector-specific vulnerabilities

### 🤖 Embedded GeoTrade AI Assistant

- **Claude-Powered Insights** — Floating chat assistant capable of answering complex trade queries in plain English
- **Context-Aware Responses** — AI strictly grounds its responses in the provided India-specific mock context
- **Sample Queries:**
  - *"How will Red Sea disruptions affect Indian petroleum imports?"*
  - *"Which sectors benefit from a weaker rupee?"*
  - *"What are the top export opportunities in Q1 2026?"*

### 🚀 Performance & Technical Highlights

- **Offline Capabilities** — Integrated Service Worker for caching and offline support
- **Optimized Rendering** — Lazy loading for resource-heavy components, memoization for smooth 60fps performance
- **Developer Tools** — Built-in developer checklist to verify core functionalities during testing

### 📊 Core Dashboard Features

| Module | Description |
|--------|-------------|
| 🗺️ **Live Risk Dashboard** | Summary stats, alert ticker, import risk panels, export opportunities |
| 🔔 **Alerts Center** | Filterable, expandable geopolitical alerts with severity levels (HIGH/MODERATE/LOW) |
| 📊 **Economic Impact Panel** | Slide-in panel with inflation gauge, commodity tracker, supply shortage timelines |
| 📱 **Responsive Design** | Mobile-first, fully WCAG AA compliant |
| 🇮🇳 **India Branding** | Tricolor header strip, IST clock, India-context data |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React 18.3 + Vite 5.4 |
| **Routing** | React Router DOM v7 |
| **Styling** | Tailwind CSS v4 |
| **Charts** | Recharts v3 |
| **2D Maps** | Leaflet / react-simple-maps |
| **3D Maps** | Three.js |
| **AI Assistant** | Anthropic Claude API (`claude-sonnet-4`) |
| **State** | React Context API |
| **Performance** | Service Worker, Lazy Loading |
| **Deployment** | Vercel |

---

## 🚀 Quick Start

### Prerequisites

```bash
node -v  # ≥ 18.x required
npm -v   # ≥ 9.x required
```

### Installation

```bash
# Clone the repository
git clone https://github.com/Virax17/GEOTRADE.git
cd GEOTRADE

# Install dependencies
cd frontend
npm install

# Set up environment variables
cp .env.example .env
# Add your Anthropic API key to .env

# Start development server
npm run dev
```

🌐 **Open:** http://localhost:5173

### Production Build

```bash
npm run build      # Output: /dist
npm run preview    # Preview locally
```

### Environment Variables

Create `.env` in the `frontend` folder (example provided in `.env.example`):

```env
# Required — Anthropic Claude API for the AI chat assistant
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional
VITE_APP_ENV=development
```


---

## 📁 Project Structure

```
GEOTRADE/
├── 📂 frontend/
│   ├── 📂 public/
│   │   └── sw.js                  # Service Worker
│   │
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   ├── DevChecklist.jsx       # Dev testing tools
│   │   │   ├── EconomicImpactPanel.jsx
│   │   │   ├── ErrorBoundary.jsx      # Error handling
│   │   │   ├── GeoTradeAI.jsx         # AI Chat Assistant
│   │   │   ├── GlobeView.jsx          # 3D Globe visualization
│   │   │   ├── NavBar.jsx             # Responsive navigation
│   │   │   └── RiskBadge.jsx          # Risk indicators
│   │   │
│   │   ├── 📂 layouts/
│   │   │   └── MainLayout.jsx         # App shell
│   │   │
│   │   ├── 📂 pages/
│   │   │   ├── Dashboard.jsx          # Main dashboard
│   │   │   ├── Alerts.jsx             # Alert center
│   │   │   ├── Sectors.jsx            # Sector analysis
│   │   │   ├── MarketPosition.jsx     # World map (lazy-loaded)
│   │   │   └── About.jsx              # Platform info
│   │   │
│   │   ├── App.jsx                    # Root component
│   │   ├── GlobalState.jsx            # Context provider
│   │   ├── mockData.js                # Curated dataset
│   │   └── main.jsx                   # Entry point
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 📡 Data Sources (Simulated / Mock)

The prototype operates entirely on a self-contained, expansive **mock dataset (~35k+ lines)** meant to simulate the behavior of these real-world APIs:

| Source | Target Usage in Production |
|--------|---------------------------|
| **UN Comtrade** | India bilateral trade volumes and commodity flows |
| **MarineTraffic** | Shipping lane disruption signals |
| **NewsAPI** | Geopolitical event detection and classification |
| **World Bank Open Data** | Macroeconomic indicators and inflation baselines |
| **DGFT India** | Sector-level export/import licensing data |

---

## 🏆 Hackathon Submission

<div align="center">

| Field | Details |
|-------|---------|
| **Event** | India Innovates 2026 |
| **Category** | AI for Public Policy & Economic Intelligence |
| **Team** | Nakshatra |
| **Institution** | Mumbai University |
| **Live Demo** | [geotrade.vercel.app](https://geotrade.vercel.app) |
| **Repository** | [github.com/Virax17/GEOTRADE](https://github.com/Virax17/GEOTRADE) |

</div>

---



<div align="center">
  
  ### 🌐 [Live Demo](https://geotrade.vercel.app) • [GitHub](https://github.com/Virax17/GEOTRADE)
  
  ---
  
  **Built with ❤️ for India's Trade Future**
  
  *Team Nakshatra · Mumbai University · India Innovates 2026*
  
</div>
