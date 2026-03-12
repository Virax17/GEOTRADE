import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Polyline, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGlobalState } from '../GlobalState';
import RiskBadge from '../components/RiskBadge';
import FilterPill from '../components/FilterPill';
import Tooltip from '../components/Tooltip';
const GlobeView = lazy(() => import('../components/GlobeView'));
import {
    AlertOctagon,
    ShieldAlert,
    TrendingUp,
    ArrowUpRight,
    Zap,
    BarChart2,
    Flame,
    Globe,
    Activity,
    Clock,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// Economic Impact: Mock Data
// ─────────────────────────────────────────────────────────────────
const COMMODITIES = [
    { name: 'Crude Oil', price: '$87/barrel', change: +2.3, impact: 'Fuel cost increase' },
    { name: 'Natural Gas', price: '$3.2/MMBtu', change: -1.1, impact: 'Slight relief' },
    { name: 'Wheat', price: '$245/ton', change: +4.7, impact: 'Food price pressure' },
    { name: 'Fertilizer (Urea)', price: '$320/ton', change: +1.8, impact: 'Agricultural cost rise' },
    { name: 'Semiconductor Index', price: '142', change: -0.5, impact: 'Stable electronics supply' },
];

const TIMELINE_EVENTS = [
    { week: 'Week 2–4', label: 'Petroleum supply tight', severity: 'high' },
    { week: 'Week 6', label: 'Fertilizer reorder window', severity: 'medium' },
    { week: 'Week 10–12', label: 'Semiconductor delays possible', severity: 'low' },
];

const INDUSTRIES = [
    { name: 'Automobile', risk: -3, color: '#EF4444' },
    { name: 'Agriculture', risk: -2, color: '#F97316' },
    { name: 'Electronics Mfg.', risk: -1, color: '#FBBF24' },
];

// ─────────────────────────────────────────────────────────────────
// Inline Inflation Gauge (SVG Semicircle)
// ─────────────────────────────────────────────────────────────────
const InlineInflationGauge = ({ value = 0.6 }) => {
    const [animated, setAnimated] = useState(0);
    const MAX = 5;
    const radius = 65;
    const cx = 90, cy = 80;
    const circumference = Math.PI * radius;

    useEffect(() => {
        let start = null;
        const duration = 1600;
        const raf = (ts) => {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setAnimated(parseFloat((value * ease).toFixed(2)));
            if (progress < 1) requestAnimationFrame(raf);
        };
        const id = requestAnimationFrame(raf);
        return () => cancelAnimationFrame(id);
    }, [value]);

    const ratio = Math.min(animated / MAX, 1);
    const dashOffset = circumference * (1 - ratio);
    const needleAngleDeg = -180 + ratio * 180;
    const needleRad = (needleAngleDeg * Math.PI) / 180;
    const needleLen = 50;
    const nx = cx + needleLen * Math.cos(needleRad);
    const ny = cy + needleLen * Math.sin(needleRad);
    let needleColor = '#10B981';
    if (animated >= 1 && animated < 2.5) needleColor = '#F97316';
    if (animated >= 2.5) needleColor = '#EF4444';

    return (
        <div className="flex flex-col items-center">
            <svg viewBox="0 0 180 100" className="w-48 max-w-full">
                <defs>
                    <linearGradient id="gaugeGradDash" gradientUnits="userSpaceOnUse" x1={cx - radius} y1={cy} x2={cx + radius} y2={cy}>
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="40%" stopColor="#F97316" />
                        <stop offset="80%" stopColor="#EF4444" />
                    </linearGradient>
                </defs>
                <path d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
                    fill="none" stroke="#1E293B" strokeWidth="13" strokeLinecap="round" />
                <path d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
                    fill="none" stroke="url(#gaugeGradDash)" strokeWidth="13" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={dashOffset}
                    style={{ transition: 'stroke-dashoffset 0.05s linear' }} />
                <line x1={cx} y1={cy} x2={nx} y2={ny}
                    stroke={needleColor} strokeWidth="3" strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 4px ${needleColor}88)` }} />
                <circle cx={cx} cy={cy} r="4.5" fill={needleColor} />
                <text x={cx - radius - 2} y={cy + 16} fill="#64748B" fontSize="8" textAnchor="middle">0%</text>
                <text x={cx} y={cy - radius - 6} fill="#64748B" fontSize="8" textAnchor="middle">2.5%</text>
                <text x={cx + radius + 2} y={cy + 16} fill="#64748B" fontSize="8" textAnchor="middle">5%</text>
                <text x={cx} y={cy + 18} fill="white" fontSize="20" fontWeight="800" textAnchor="middle">+{animated.toFixed(1)}%</text>
            </svg>
            <div className="flex gap-3 mt-1 text-[10px] text-slate-400">
                <span><span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1"></span>Low 0–1%</span>
                <span><span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-1"></span>Med 1–2.5%</span>
                <span><span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1"></span>High 2.5%+</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400 text-center leading-relaxed max-w-xs">
                Current disruptions estimated to add <span className="text-orange-400 font-semibold">+0.6%</span> to India's inflation,
                driven by petroleum &amp; fertilizer price rises.
            </p>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────
// Animated Count-Up Hook
// ─────────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1200) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (typeof target !== 'number') return;
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) {
                setValue(target);
                clearInterval(timer);
            } else {
                setValue(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration]);
    return value;
}

// ─────────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon, iconBg, label, value, extra, onClick, index = 0 }) => {
    const isNum = typeof value === 'number';
    const animated = useCountUp(isNum ? value : 0);

    return (
        <button
            onClick={onClick}
            className="group w-full text-left bg-[#1E293B] hover:bg-slate-700/60 border border-white/5 hover:border-slate-600 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500/40 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className={`inline-flex p-2.5 rounded-xl mb-4 ${iconBg}`}>
                {icon}
            </div>
            <div className="text-4xl font-extrabold tracking-tight text-white mb-1 flex items-end gap-1">
                {isNum ? animated : value}
                {extra && <span className="text-sm font-medium text-slate-400 mb-1 ml-1">{extra}</span>}
            </div>
            <div className="text-sm text-slate-400 font-medium group-hover:text-slate-300 transition-colors">{label}</div>
        </button>
    );
};

// ─────────────────────────────────────────────────────────────────
// Risk Level Colors
// ─────────────────────────────────────────────────────────────────
const riskColors = {
    HIGH: { bar: 'bg-red-500', glow: 'shadow-red-500/20', badge: 'text-red-400 bg-red-900/30 border-red-500/20' },
    MODERATE: { bar: 'bg-orange-500', glow: 'shadow-orange-500/20', badge: 'text-orange-400 bg-orange-900/30 border-orange-500/20' },
    LOW: { bar: 'bg-emerald-500', glow: 'shadow-emerald-500/10', badge: 'text-emerald-400 bg-emerald-900/30 border-emerald-500/20' },
    OPPORTUNITY: { bar: 'bg-emerald-500', glow: 'shadow-emerald-500/10', badge: 'text-emerald-400 bg-emerald-900/30 border-emerald-500/20' },
    GRAY: { bar: 'bg-slate-500', glow: '', badge: 'text-slate-300 bg-slate-700/40 border-slate-600/20' },
};

// ─────────────────────────────────────────────────────────────────
// Ticker
// ─────────────────────────────────────────────────────────────────
const AlertTicker = ({ alerts }) => {
    const ticker = alerts.map(a => a.ticker).filter(Boolean).join('     |     ');
    const doubled = ticker + '     |     ' + ticker;

    return (
        <div className="relative overflow-hidden bg-slate-900/60 border-t border-b border-white/5 py-3 rounded-xl">
            <div
                className="flex whitespace-nowrap gap-0 text-sm font-medium"
                style={{
                    animation: 'ticker-scroll 40s linear infinite',
                }}
            >
                <span className="text-slate-300 pr-12">{doubled}</span>
                <span className="text-slate-300 pr-12">{doubled}</span>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────
// Economic Impact: Sub-Panels
// ─────────────────────────────────────────────────────────────────
const EISubPanel = ({ icon, title, children }) => {
    const [open, setOpen] = useState(true);
    return (
        <div className="flex-1 min-w-0 bg-slate-900/50 border border-white/5 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center gap-2 px-4 py-3 bg-slate-800/50 hover:bg-slate-700/40 transition-colors text-left"
            >
                <span className="text-teal-400">{icon}</span>
                <span className="flex-1 text-xs font-bold text-slate-300 uppercase tracking-wider">{title}</span>
                {open ? <ChevronUp size={13} className="text-slate-500" /> : <ChevronDown size={13} className="text-slate-500" />}
            </button>
            {open && <div className="px-4 py-4">{children}</div>}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────
// Economic Impact: Full Dashboard Section
// ─────────────────────────────────────────────────────────────────
const EconomicImpactSection = () => (
    <div>
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-500/10 rounded-xl">
                    <TrendingUp size={20} className="text-teal-400" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white">Economic Impact Indicators</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Estimated consequences of current global disruptions on India</p>
                </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
                <AlertTriangle size={11} />
                AI Estimates
            </div>
        </div>

        {/* Top row: Gauge + Commodity Table */}
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Inflation Gauge */}
            <EISubPanel icon={<Activity size={13} />} title="Inflation Pressure Meter">
                <InlineInflationGauge value={0.6} />
            </EISubPanel>

            {/* Commodity Tracker */}
            <EISubPanel icon={<BarChart2 size={13} />} title="Commodity Price Tracker">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left text-slate-500 pb-2 font-semibold pr-3">Commodity</th>
                                <th className="text-right text-slate-500 pb-2 font-semibold pr-3">Price</th>
                                <th className="text-right text-slate-500 pb-2 font-semibold pr-3">24h</th>
                                <th className="text-left text-slate-500 pb-2 font-semibold">India Impact</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {COMMODITIES.map((c) => {
                                const isUp = c.change > 0;
                                return (
                                    <tr key={c.name} className="hover:bg-white/5 transition-colors">
                                        <td className="py-2 pr-3 font-medium text-slate-200 whitespace-nowrap">{c.name}</td>
                                        <td className="py-2 pr-3 text-right text-slate-300 whitespace-nowrap">{c.price}</td>
                                        <td className={`py-2 pr-3 text-right font-bold whitespace-nowrap ${isUp ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {isUp ? '↑' : '↓'} {Math.abs(c.change).toFixed(1)}%
                                        </td>
                                        <td className="py-2 text-slate-400 text-[11px]">{c.impact}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </EISubPanel>
        </div>

        {/* Bottom row: Timeline + Industrial Impact */}
        <div className="flex flex-col lg:flex-row gap-4">
            {/* Risk Timeline */}
            <EISubPanel icon={<Clock size={13} />} title="Supply Shortage Risk — Next 90 Days">
                {/* Horizontal visual bar */}
                <div className="relative mb-5">
                    <div className="h-4 rounded-full overflow-hidden flex">
                        <div className="bg-red-500/70 flex-1" style={{ maxWidth: '25%' }} />
                        <div className="bg-orange-500/50 flex-1" style={{ maxWidth: '20%' }} />
                        <div className="bg-yellow-500/30 flex-1" style={{ maxWidth: '20%' }} />
                        <div className="bg-slate-700/50 flex-1" />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                        <span>Now</span><span>Wk 4</span><span>Wk 8</span><span>Wk 12 (90 days)</span>
                    </div>
                </div>
                <div className="space-y-3">
                    {TIMELINE_EVENTS.map((ev) => {
                        const styles = {
                            high: { dot: 'bg-red-500', text: 'text-red-400', shadow: '#EF4444' },
                            medium: { dot: 'bg-orange-500', text: 'text-orange-400', shadow: '#F97316' },
                            low: { dot: 'bg-yellow-500', text: 'text-yellow-400', shadow: '#EAB308' },
                        }[ev.severity];
                        return (
                            <div key={ev.label} className="flex items-start gap-2.5">
                                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5 ${styles.dot}`}
                                    style={{ boxShadow: `0 0 7px ${styles.shadow}99` }} />
                                <div className="text-xs">
                                    <span className={`font-bold ${styles.text}`}>{ev.week}: </span>
                                    <span className="text-slate-300">{ev.label}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </EISubPanel>

            {/* Industrial Output Impact */}
            <EISubPanel icon={<AlertTriangle size={13} />} title="Industrial Output Impact">
                <div className="space-y-4">
                    {INDUSTRIES.map((ind) => {
                        const pct = Math.abs(ind.risk);
                        const width = (pct / 5) * 100;
                        return (
                            <div key={ind.name}>
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-xs text-slate-300 font-medium">{ind.name}</span>
                                    <span className="text-xs font-bold" style={{ color: ind.color }}>
                                        {ind.risk}% output risk
                                    </span>
                                </div>
                                <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 delay-300"
                                        style={{
                                            width: `${width}%`,
                                            backgroundColor: ind.color,
                                            boxShadow: `0 0 10px ${ind.color}55`,
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                    <p className="text-[10px] text-slate-600 italic mt-3">
                        * All figures are AI estimates and approximations only.
                    </p>
                </div>
            </EISubPanel>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────
// Interactive Map Section
// ─────────────────────────────────────────────────────────────────

const severityColors = {
    critical: '#EF4444',
    high: '#F97316',
    moderate: '#EAB308',
    stable: '#22C55E'
};

const mapEvents = [
  { id:1, country:"Red Sea", title:"Houthi Shipping Attacks", severity:"critical", lat:15.5,lng:43.5, desc:"Ongoing drone/missile attacks disrupting global shipping lanes", time:"2h ago", category:"Shipping" },
  { id:2, country:"Russia/Ukraine", title:"Black Sea Grain Blockade", severity:"high", lat:46.5,lng:32.0, desc:"Wheat export disruption affecting South Asian food imports", time:"4h ago", category:"Trade" },
  { id:3, country:"Taiwan Strait", title:"PLA Naval Exercises", severity:"high", lat:24.5,lng:120.5, desc:"Semiconductor supply chain risk elevated", time:"6h ago", category:"Political" },
  { id:4, country:"Iran", title:"Strait of Hormuz Tensions", severity:"critical", lat:26.5,lng:56.5, desc:"Crude oil tanker movement restricted, India energy imports affected", time:"8h ago", category:"Energy" },
  { id:5, country:"Pakistan", title:"India-Pakistan Border Closure", severity:"high", lat:30.0,lng:70.0, desc:"Land trade routes suspended, affecting cross-border commerce", time:"12h ago", category:"Trade" },
  { id:6, country:"Myanmar", title:"Civil War Escalation", severity:"moderate", lat:19.0,lng:96.0, desc:"Northeast India border instability, ASEAN trade affected", time:"1d ago", category:"Political" },
  { id:7, country:"Sri Lanka", title:"Port Congestion Crisis", severity:"moderate", lat:7.8,lng:80.7, desc:"Colombo hub delays cascading to Indian transshipment routes", time:"1d ago", category:"Shipping" },
  { id:8, country:"Bangladesh", title:"Political Unrest", severity:"moderate", lat:23.7,lng:90.4, desc:"Garment export disruptions, textile supply chain impacted", time:"2d ago", category:"Trade" },
  { id:9, country:"USA", title:"Section 301 Tariff Review", severity:"moderate", lat:38.9,lng:-77.0, desc:"Potential tariff hike on Indian pharma and IT exports", time:"2d ago", category:"Trade" },
  { id:10, country:"Belarus", title:"Fertilizer Export Ban", severity:"high", lat:53.9,lng:27.6, desc:"Potash and urea supply pressure for Indian agriculture", time:"3d ago", category:"Trade" },
  { id:11, country:"Israel/Gaza", title:"Middle East Conflict", severity:"critical", lat:31.5,lng:34.8, desc:"Suez alternative routing adding 14 days to EU shipments", time:"3d ago", category:"Shipping" },
  { id:12, country:"China", title:"South China Sea Dispute", severity:"high", lat:15.0,lng:114.0, desc:"ASEAN shipping lane risk, India-Vietnam corridor elevated", time:"4d ago", category:"Political" }
];

const tradeRoutes = [
  [38.9, -77.0], // USA
  [51.5, -0.1], // UK
  [25.2, 55.3], // UAE
  [39.9, 116.4], // China
  [1.3, 103.8], // Singapore
  [-35.3, 149.1], // Australia
  [-25.7, 28.2], // South Africa
  [52.5, 13.4], // Germany
  [35.6, 139.6], // Japan
  [-15.8, -47.9], // Brazil
];

const MapController = ({ target }) => {
    const map = useMap();
    useEffect(() => {
        if (target) {
            map.flyTo([target.lat, target.lng], 5, { duration: 0.9 });
        }
    }, [target, map]);
    return null;
};

// ─────────────────────────────────────────────────────────────────
// 2D Map data: chokepoints, sea routes, military bases, airspace
// ─────────────────────────────────────────────────────────────────
// Accurate multi-waypoint shipping lanes from India
const MAP_SEA_ROUTES = [
  {
    id:'r1', name:'Mumbai → Suez Canal (Red Sea)', risk:'critical',
    label:'⚠️ Disrupted — Houthi attacks via Red Sea',
    points:[
      [18.93,72.84],[12.8,54.0],[12.6,43.4],[15.5,43.5],
      [22.0,38.0],[27.5,33.9],[30.0,32.6],[31.3,32.1],[36.2,14.0],
    ],
  },
  {
    id:'r2', name:'Mumbai → Singapore (Malacca Strait)', risk:'moderate',
    label:'⚠️ Elevated — South China Sea tensions',
    points:[[18.93,72.84],[7.8,80.7],[5.0,96.0],[1.26,103.82],[1.35,103.82]],
  },
  {
    id:'r3', name:'Mumbai via Cape of Good Hope (Alternate)', risk:'low',
    label:'🔄 Alt Suez route — +14 days transit',
    points:[[18.93,72.84],[10.0,60.0],[-2.0,44.0],[-15.0,35.0],[-34.3,18.5]],
  },
  {
    id:'r4', name:'Mumbai → Hormuz → Persian Gulf', risk:'critical',
    label:'⚠️ Disrupted — Iranian tensions at Hormuz',
    points:[[18.93,72.84],[22.0,62.0],[24.3,58.0],[26.35,56.45],[25.2,55.3],[26.2,50.6]],
  },
  {
    id:'r5', name:'Kolkata → Bay of Bengal → Vietnam', risk:'moderate',
    label:'⚠️ South China Sea dispute risk',
    points:[[22.5,88.3],[15.0,90.0],[5.0,100.0],[1.26,103.82],[10.8,106.7]],
  },
  {
    id:'r6', name:'Kochi → Colombo (Short Corridor)', risk:'stable',
    label:'✅ Normal operations',
    points:[[9.93,76.27],[6.9,79.86]],
  },
];
const ROUTE_COLORS = { critical:'#ef4444', high:'#f97316', moderate:'#eab308', low:'#22c55e', stable:'#22c55e' };

const MAP_CHOKEPOINTS = [
  { id:'cp1', lat:26.35, lng:56.45, name:'Strait of Hormuz', risk:'critical', flag:'🛢️', note:'20% of global oil. Iran-US tensions affect India crude imports.' },
  { id:'cp2', lat:30.5,  lng:32.3,  name:'Suez Canal',       risk:'critical', flag:'🚢', note:'12% of global trade. Houthi attacks via Red Sea — India rerouting via Cape.' },
  { id:'cp3', lat:1.26,  lng:103.82,name:'Malacca Strait',   risk:'high',     flag:'⚓', note:'India-ASEAN bottleneck. 25% of global trade. Piracy & SCS tensions.' },
  { id:'cp4', lat:12.6,  lng:43.4,  name:'Bab-el-Mandeb',   risk:'critical', flag:'🚨', note:'Gateway between Red Sea & Indian Ocean. Yemen conflict blockade.' },
  { id:'cp5', lat:15.0,  lng:114.0, name:'South China Sea',  risk:'high',     flag:'⚠️', note:'Chinese territorial claims. Key India-East Asia corridor at risk.' },
  { id:'cp6', lat:-34.3, lng:18.5,  name:'Cape of Good Hope',risk:'low',      flag:'🔄', note:'Alternative to Suez if Red Sea closed. +14d, +$1M/voyage.' },
  { id:'cp7', lat:-8.8,  lng:115.7, name:'Lombok Strait',    risk:'moderate', flag:'🔀', note:'Alt to Malacca for LNG. Deeper draft vessels use this.' },
];
const CHOKE_COLORS = { critical:'#ef4444', high:'#f97316', moderate:'#eab308', low:'#22c55e' };

const MAP_MIL_BASES = [
  { id:'b1', lat:25.12,lng:62.32, name:'PLA Navy — Gwadar (Pakistan)',    country:'China',    flag:'🇨🇳', color:'#f97316', note:'String-of-pearls node. Direct sea access flanking India.' },
  { id:'b2', lat:6.10, lng:81.12, name:'PLA Navy — Hambantota (SL)',       country:'China',    flag:'🇨🇳', color:'#f97316', note:'Flanks Bay of Bengal. 99-yr lease. Indian Ocean surveillance.' },
  { id:'b3', lat:11.53,lng:43.15, name:'PLA Navy — Djibouti',              country:'China',    flag:'🇨🇳', color:'#f97316', note:'First overseas PLAN base. Controls Red Sea narrows.' },
  { id:'b4', lat:14.12,lng:93.38, name:'PLA Intel — Coco Islands (Myan)', country:'China',    flag:'🇨🇳', color:'#f97316', note:'Signals intelligence near Andaman & Nicobar.' },
  { id:'b5', lat:24.86,lng:67.01, name:'Pakistan Navy HQ — Karachi',      country:'Pakistan', flag:'🇵🇰', color:'#ef4444', note:'Controls north Arabian Sea approach. Fleet base.' },
  { id:'b6', lat:35.33,lng:75.61, name:'Pakistan AF — Skardu',            country:'Pakistan', flag:'🇵🇰', color:'#ef4444', note:'High-altitude fighter base facing Ladakh / LoC.' },
  { id:'b7', lat:-7.31,lng:72.42, name:'US Navy — Diego Garcia',          country:'USA',      flag:'🇺🇸', color:'#38bdf8', note:'Allied base. B-52 ops. Indian Ocean power projection.' },
  { id:'b8', lat:26.21,lng:50.59, name:'US CENTCOM — Bahrain',            country:'USA',      flag:'🇺🇸', color:'#38bdf8', note:'5th Fleet HQ. Gulf/Hormuz posture.' },
];

// Airspaces — radius in METRES so they render at correct geographic scale
const MAP_AIRSPACES = [
  { id:'as1', lat:30.38,lng:69.35, name:'Pakistan Airspace',  status:'closed',     note:'Completely closed for Indian carriers since 2019 Balakot crisis.',        radius:700000  },
  { id:'as2', lat:33.93,lng:67.71, name:'Afghanistan',        status:'restricted', note:'War zone. All civil flights avoid.',                                       radius:450000  },
  { id:'as3', lat:32.43,lng:53.69, name:'Iranian Airspace',   status:'restricted', note:'Indian carriers rerouting due to diplomatic tensions.',                    radius:750000  },
  { id:'as4', lat:19.85,lng:96.11, name:'Myanmar Airspace',   status:'restricted', note:'Civil war zones. Partial closures along India border.',                   radius:350000  },
  { id:'as5', lat:23.89,lng:45.07, name:'Saudi Arabia',       status:'open',       note:'Bilateral agreements active. Full access for Indian carriers.',            radius:900000  },
  { id:'as6', lat:24.47,lng:54.37, name:'UAE Airspace',       status:'open',       note:'Dubai hub. Full operations. Major Indian diaspora route.',                 radius:300000  },
  { id:'as7', lat:20.59,lng:78.96, name:'Indian Airspace',    status:'open',       note:'Full Indian sovereignty. World 3rd largest civil airspace.',              radius:1500000 },
];
const AIR_COLORS = { open:'#22c55e', restricted:'#f97316', closed:'#ef4444' };

// Airport data — use REAL lat/lng for Leaflet Marker
const AIRPORTS = [
  { code:'DEL', name:'Delhi Indira Gandhi', lat:28.56, lng:77.09, status:'open',    note:'Ops normal — Largest Indian airport, 71M pax/yr' },
  { code:'BOM', name:'Mumbai CSIA',         lat:19.09, lng:72.86, status:'open',    note:'Ops normal — 2nd busiest, 50M pax/yr' },
  { code:'MAA', name:'Chennai MAA',         lat:12.99, lng:80.18, status:'open',    note:'Ops normal — Main south India hub' },
  { code:'CCU', name:'Kolkata CCU',         lat:22.65, lng:88.45, status:'open',    note:'Ops normal — East India hub' },
  { code:'BLR', name:'Bengaluru BLR',       lat:13.20, lng:77.71, status:'open',    note:'Ops normal — Tech corridor hub' },
  { code:'HYD', name:'Hyderabad HYD',       lat:17.24, lng:78.43, status:'open',    note:'Ops normal' },
  { code:'GOI', name:'Goa GOI',             lat:15.38, lng:73.83, status:'open',    note:'Ops normal — Tourist hub' },
  { code:'ATQ', name:'Amritsar ATQ',        lat:31.71, lng:74.80, status:'closed',  note:'Restricted — India-Pakistan tensions, border closure' },
  { code:'SXR', name:'Srinagar SXR',        lat:34.00, lng:74.77, status:'closed',  note:'Periodically closed — Security alerts, J&K conflict' },
  { code:'IXL', name:'Leh IXL',            lat:34.14, lng:77.55, status:'open',    note:'Ops normal — Ladakh defence & civil flights' },
  { code:'DXB', name:'Dubai DXB',           lat:25.25, lng:55.36, status:'hub',     note:'International hub — Largest Indian diaspora transit point' },
  { code:'SIN', name:'Singapore SIN',       lat:1.36,  lng:103.99,status:'hub',     note:'International hub — Southeast Asia transit' },
  { code:'CMB', name:'Colombo CMB',         lat:7.18,  lng:79.88, status:'hub',     note:'International hub — Sri Lanka transshipment' },
];

const mapCategories = ['All', 'Trade', 'Shipping', 'Energy', 'Political', 'Routes', 'Chokepoints', 'Mil. Bases', 'Airspace'];

const InteractiveMapSection = () => {
    const [filterCategory, setFilterCategory] = useState('All');
    const [activeEvent, setActiveEvent] = useState(null);
    const [mapMode, setMapMode] = useState('2d'); // '2d' | 'globe'
    const listRef = useRef(null);
    const { activeAlerts } = useGlobalState();

    const alertText = JSON.stringify(activeAlerts).toLowerCase();
    const hasRedSeaAlert = !!alertText.match(/red sea|suez|hormuz/);

    const showRoutes     = filterCategory === 'All' || filterCategory === 'Routes';
    const showChokepoints= filterCategory === 'All' || filterCategory === 'Chokepoints';
    const showBases      = filterCategory === 'Mil. Bases';
    const showAirspace   = filterCategory === 'Airspace';
    const showEvents     = !['Routes','Chokepoints','Mil. Bases','Airspace'].includes(filterCategory);
    const showAirports   = filterCategory === 'Airspace';

    const eventFilter = ['All','Trade','Shipping','Energy','Political'].includes(filterCategory) ? filterCategory : 'All';
    const filteredEvents = mapEvents.filter(ev => eventFilter === 'All' || ev.category === eventFilter);

    const handleEventClick = (ev) => {
        setActiveEvent(ev);
        const el = document.getElementById(`event-list-item-${ev.id}`);
        if (el && listRef.current) {
            const listTop = listRef.current.getBoundingClientRect().top;
            const elTop = el.getBoundingClientRect().top;
            listRef.current.scrollTop += elTop - listTop - 20;
        }
    };

    return (
        <div className="flex flex-col mb-7 bg-[#080d14] rounded-xl border border-[#1a2d42] shadow-lg overflow-hidden relative z-0">

            {/* ─── TOP TOOLBAR ─── */}
            <div className="p-2.5 bg-[#0a111a] border-b border-[#1a2d42] flex items-center gap-2 flex-wrap">
                {/* Mode switcher */}
                <div className="flex bg-[#0d1825] border border-white/10 rounded-lg overflow-hidden flex-shrink-0 mr-2">
                    <button
                        onClick={() => setMapMode('2d')}
                        className={`px-4 py-1.5 text-xs font-bold transition-colors ${ mapMode==='2d' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >🗺 2D Map</button>
                    <button
                        onClick={() => setMapMode('globe')}
                        className={`px-4 py-1.5 text-xs font-bold transition-colors ${ mapMode==='globe' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >🌍 3D Globe</button>
                </div>
                {/* Filter pills */}
                <div className="flex gap-1.5 flex-wrap">
                    {mapCategories.map(cat => (
                        <FilterPill key={cat} active={filterCategory===cat} onClick={()=>setFilterCategory(cat)}>{cat}</FilterPill>
                    ))}
                </div>
                {/* Legend pills */}
                <div className="ml-auto flex gap-3 flex-shrink-0 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]"></span>Critical</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_6px_#f97316]"></span>High</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400"></span>Moderate</span>
                </div>
            </div>

            {/* ─── MAIN BODY ─── */}
            <div className="flex flex-col lg:flex-row" style={{ height: '560px' }}>

                {/* LEFT: map or globe */}
                <div className="lg:w-[70%] h-full flex flex-col overflow-hidden border-r border-[#1a2d42] bg-[#050a14] relative">

                    {/* ══════════ 2D MAP ══════════ */}
                    {mapMode === '2d' && (
                    <div className="flex-1 relative overflow-hidden">
                        <style>{`
                            .leaflet-container { background: transparent !important; outline: none; height:100%; width:100%; }
                            .dark-map-tiles { filter: brightness(0.38) saturate(0.25) hue-rotate(180deg) !important; }
                            .pm { animation: pulseM 2s infinite; }
                            .pc { animation: pulseC 2s infinite; }
                            @keyframes pulseC {
                                0%,100% { fill-opacity:.85; filter: drop-shadow(0 0 0 #EF4444); }
                                50%      { fill-opacity:.4;  filter: drop-shadow(0 0 8px #EF4444); }
                            }
                            @keyframes pulseM {
                                0%,100% { fill-opacity:.85; filter: drop-shadow(0 0 0 #F97316); }
                                50%      { fill-opacity:.4;  filter: drop-shadow(0 0 7px #F97316); }
                            }
                            /* Dark Leaflet popups */
                            .leaflet-popup-content-wrapper, .leaflet-popup-tip {
                                background: #0d1825 !important;
                                border: 1px solid #0d9488 !important;
                                border-radius: 10px !important;
                                box-shadow: 0 4px 20px rgba(0,0,0,0.8) !important;
                                padding: 0 !important;
                            }
                            .leaflet-popup-content { margin: 0 !important; }
                            .leaflet-popup-close-button { color: #64748b !important; font-size: 18px !important; }
                        `}</style>
                        <MapContainer center={[20,65]} zoom={2} style={{height:'100%',width:'100%'}} zoomControl={false} attributionControl={false}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" className="dark-map-tiles" opacity={0.7} />
                            <MapController target={activeEvent} />

                            {/* ── Sea Routes (accurate Polylines) */}
                            {showRoutes && MAP_SEA_ROUTES.map(r => {
                                const color = hasRedSeaAlert && (r.id==='r1'||r.id==='r4') ? '#ef4444' : ROUTE_COLORS[r.risk];
                                return (
                                    <Polyline key={r.id}
                                        positions={r.points}
                                        pathOptions={{ color, weight: 2.5, opacity: 0.9, dashArray: '8 5', lineCap:'round' }}
                                    >
                                        <Popup className="dark-popup">
                                            <div style={{background:'#0d1825',color:'#e2e8f0',padding:'8px 12px',borderRadius:'8px',fontSize:'11px',minWidth:'200px'}}>
                                                <div style={{fontWeight:700,marginBottom:4}}>🚢 {r.name}</div>
                                                <div style={{color,fontSize:10}}>{r.label}</div>
                                            </div>
                                        </Popup>
                                    </Polyline>
                                );
                            })}

                            {/* ── Chokepoints */}
                            {showChokepoints && MAP_CHOKEPOINTS.map(cp => (
                                <CircleMarker key={cp.id} center={[cp.lat,cp.lng]}
                                    radius={11} fillColor={CHOKE_COLORS[cp.risk]}
                                    color="#fff" weight={2} fillOpacity={0.75}
                                    eventHandlers={{ click: () => setActiveEvent({ ...cp, type:'chokepoint' }) }}
                                >
                                    <Popup className="dark-popup">
                                        <div style={{background:'#0d1825',color:'#e2e8f0',padding:'8px 12px',borderRadius:'8px',fontSize:'11px',minWidth:'180px'}}>
                                            <div style={{fontWeight:700,marginBottom:4}}>{cp.flag} {cp.name}</div>
                                            <div style={{color:CHOKE_COLORS[cp.risk],fontSize:10,fontWeight:600,marginBottom:4}}>{cp.risk.toUpperCase()}</div>
                                            <div style={{color:'#94a3b8',lineHeight:1.4}}>{cp.note}</div>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            ))}

                            {/* ── Military Bases */}
                            {showBases && MAP_MIL_BASES.map(b => (
                                <Marker key={b.id} position={[b.lat,b.lng]}
                                    icon={L.divIcon({
                                        className: '',
                                        html: `<div style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:${b.color};border:2px solid #fff;box-shadow:0 0 8px ${b.color}88;font-size:13px;cursor:pointer;">${b.flag}</div>`,
                                        iconSize: [26,26], iconAnchor:[13,13],
                                    })}
                                >
                                    <Popup className="dark-popup">
                                        <div style={{background:'#0d1825',color:'#e2e8f0',padding:'8px 12px',borderRadius:'8px',fontSize:'11px',minWidth:'200px'}}>
                                            <div style={{fontWeight:700,marginBottom:3}}>{b.flag} {b.name}</div>
                                            <div style={{color:b.color,fontSize:10,fontWeight:600,marginBottom:4}}>MILITARY BASE · {b.country.toUpperCase()}</div>
                                            <div style={{color:'#94a3b8',lineHeight:1.4}}>{b.note}</div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}

                            {/* ── Airspace (Circle = meter-radius, scales with zoom) */}
                            {showAirspace && MAP_AIRSPACES.map(a => (
                                <Circle key={a.id}
                                    center={[a.lat, a.lng]}
                                    radius={a.radius}
                                    pathOptions={{ color: AIR_COLORS[a.status], fillColor: AIR_COLORS[a.status], fillOpacity: 0.12, weight: 1.5, dashArray: a.status==='closed'?'6 4':undefined }}
                                >
                                    <Popup className="dark-popup">
                                        <div style={{background:'#0d1825',color:'#e2e8f0',padding:'8px 12px',borderRadius:'8px',fontSize:'11px',minWidth:'200px'}}>
                                            <div style={{fontWeight:700,marginBottom:3}}>✈ {a.name}</div>
                                            <div style={{color:AIR_COLORS[a.status],fontSize:10,fontWeight:600,marginBottom:4}}>{a.status.toUpperCase()}</div>
                                            <div style={{color:'#94a3b8',lineHeight:1.4}}>{a.note}</div>
                                        </div>
                                    </Popup>
                                </Circle>
                            ))}

                            {/* ── Airport Markers – proper Leaflet Markers at real lat/lng */}
                            {showAirports && AIRPORTS.map(ap => {
                                const clr = ap.status==='open'?'#22c55e':ap.status==='closed'?'#ef4444':'#0d9488';
                                const size = ap.status==='hub' ? 22 : 18;
                                return (
                                <Marker key={ap.code} position={[ap.lat, ap.lng]}
                                    icon={L.divIcon({
                                        className: '',
                                        html: `<div style="display:flex;align-items:center;justify-content:center;font-size:${size}px;filter:drop-shadow(0 0 3px ${clr});${ap.status==='closed'?'text-decoration:line-through;opacity:0.8;':''}" title="${ap.code}">✈</div>`,
                                        iconSize: [size+4, size+4],
                                        iconAnchor: [(size+4)/2, (size+4)/2],
                                    })}
                                >
                                    <Popup className="dark-popup">
                                        <div style={{background:'#0d1825',color:'#e2e8f0',padding:'8px 12px',borderRadius:'8px',fontSize:'11px',minWidth:'200px'}}>
                                            <div style={{fontWeight:700,marginBottom:3}}>✈ {ap.code} — {ap.name}</div>
                                            <div style={{color:clr,fontSize:10,fontWeight:600,marginBottom:4}}>{ap.status.toUpperCase()}</div>
                                            <div style={{color:'#94a3b8',lineHeight:1.4}}>{ap.note}</div>
                                        </div>
                                    </Popup>
                                </Marker>
                            )})}

                            {/* ── Event markers */}
                            {showEvents && filteredEvents.map(ev => {
                                const cls = ev.severity==='critical'?'pc': ev.severity==='high'?'pm':'';
                                return (
                                <CircleMarker key={ev.id} center={[ev.lat,ev.lng]}
                                    radius={ev.severity==='critical'?8:ev.severity==='high'?6:5}
                                    fillColor={severityColors[ev.severity]} color={severityColors[ev.severity]}
                                    weight={2} fillOpacity={0.85} className={cls}
                                    eventHandlers={{ click: () => handleEventClick(ev) }}
                                >
                                    <Popup className="dark-popup">
                                        <div style={{background:'#0d1825',color:'#e2e8f0',padding:'8px 12px',borderRadius:'8px',fontSize:'11px',minWidth:'180px'}}>
                                            <div style={{fontWeight:700,marginBottom:3}}>{ev.title}</div>
                                            <div style={{color:severityColors[ev.severity],fontSize:10,fontWeight:600,marginBottom:4}}>{ev.country} · {ev.severity.toUpperCase()}</div>
                                            <div style={{color:'#94a3b8',lineHeight:1.4}}>{ev.desc}</div>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            )})}

                            {/* ── India home marker */}
                            <CircleMarker center={[20.5,78.9]} radius={8} fillColor="#0d9488" color="#fff" weight={2.5} fillOpacity={1}>
                                <Popup><div style={{background:'#0d1825',color:'#0d9488',padding:'6px 10px',borderRadius:'8px',fontSize:'11px',fontWeight:700}}>🇮🇳 India</div></Popup>
                            </CircleMarker>
                        </MapContainer>

                        {/* Bottom Legend */}
                        <div className="absolute bottom-0 left-0 w-full px-3 py-2 bg-[#0a111a]/90 border-t border-[#1a2d42] flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-semibold text-slate-400 z-50">
                            <span className="flex items-center gap-1.5"><span className="inline-block w-5 border-t-2 border-dashed border-red-500"></span>Disrupted route</span>
                            <span className="flex items-center gap-1.5"><span className="inline-block w-5 border-t-2 border-dashed border-sky-400"></span>Normal route</span>
                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border-2 border-orange-400 opacity-70"></span>Chokepoint</span>
                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500"></span>China base</span>
                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500"></span>Pak base</span>
                            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-sky-400"></span>Allied base</span>
                            <span className="flex items-center gap-1.5"><span style={{color:'#22c55e'}}>✈</span>Open airport</span>
                            <span className="flex items-center gap-1.5"><span style={{color:'#ef4444'}}>✈</span>Closed/restricted</span>
                        </div>
                    </div>
                    )}

                    {/* ══════════ 3D GLOBE ══════════ */}
                    {mapMode === 'globe' && (
                    <div className="flex-1 relative overflow-hidden">
                        <Suspense fallback={
                            <div className="flex-1 flex items-center justify-center h-full text-slate-400 text-sm bg-[#030810]">
                                <div className="text-center">
                                    <div className="text-5xl mb-3 animate-spin" style={{animationDuration:'2s'}}>🌐</div>
                                    <div>Loading 3D Globe…</div>
                                </div>
                            </div>
                        }>
                            <GlobeView onEventSelect={ev => {
                                handleEventClick(ev);
                            }} />
                        </Suspense>
                    </div>
                    )}
                </div>

                {/* RIGHT: events sidebar */}
                <div className="lg:w-[30%] h-full flex flex-col bg-[#0a111a] overflow-hidden">
                    <div className="p-4 border-b border-[#1a2d42] flex justify-between items-center bg-[#0d1520]">
                        <h3 className="text-sm font-bold text-white">Global Events</h3>
                        <div className="bg-red-500 text-white text-[10px] font-black w-5 h-5 flex justify-center items-center rounded-sm">
                            {filteredEvents.length}
                        </div>
                    </div>

                    {/* Info card for non-event selections */}
                    {activeEvent?.type && ['chokepoint','base','airspace'].includes(activeEvent.type) && (
                        <div className="m-2 p-3 rounded-lg border border-teal-500/30 bg-teal-500/5 text-xs">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-white">{activeEvent.flag} {activeEvent.name}</span>
                                <button onClick={()=>setActiveEvent(null)} className="text-slate-500 hover:text-white">✕</button>
                            </div>
                            <div className="text-slate-300 leading-relaxed">{activeEvent.note || activeEvent.desc || activeEvent.threat}</div>
                            {activeEvent.country && <div className="text-slate-500 mt-1">Country: {activeEvent.country}</div>}
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-2 space-y-2" ref={listRef} style={{scrollBehavior:'smooth'}}>
                        {filteredEvents.map(ev => {
                            const isSelected = activeEvent?.id === ev.id;
                            return (
                            <button key={ev.id} id={`event-list-item-${ev.id}`}
                                onClick={() => handleEventClick(ev)}
                                className={`group w-full text-left p-3 rounded-lg border-l-4 transition-all duration-300 text-sm cursor-pointer ${ isSelected ? 'bg-teal-500/10 border-teal-500' : 'bg-[#121c27] hover:bg-[#162332] border-transparent group-hover:border-teal-500/40'}`}
                            >
                                <div className="flex justify-between items-start mb-1 text-xs">
                                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                        <div className="shrink-0 w-2.5 h-2.5 rounded-full" style={{backgroundColor:severityColors[ev.severity]}}></div>
                                        <div className="font-bold text-slate-200 truncate pr-2">{ev.country}</div>
                                    </div>
                                    <div className="text-slate-500 text-[10px] font-medium shrink-0">{ev.time}</div>
                                </div>
                                <div className="font-semibold text-white/90 mb-1">{ev.title}</div>
                                <div className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">{ev.desc}</div>
                            </button>
                        )})}
                        {filteredEvents.length === 0 && (
                            <div className="p-6 text-center text-slate-500 text-sm italic">No events matching this filter.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
    const navigate = useNavigate();
    const { activeAlerts, importRisks, exportOpportunities, summaryStats } = useGlobalState();

    return (
        <div className="space-y-7">
            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                        India Trade Intelligence
                    </h1>
                    <p className="text-slate-400 mt-1.5 text-sm">
                        Real-time geopolitical risk mapping for Indian importers and exporters.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-brand-alert bg-orange-500/10 px-3 py-2 rounded-full border border-orange-500/20 self-start sm:self-auto">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-alert"></span>
                    </span>
                    LIVE MONITORING
                </div>
            </div>

            {/* ── Interactive Map Section ── */}
            <InteractiveMapSection />

            {/* ── TOP ROW: 4 Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    icon={<AlertOctagon size={22} className="text-red-400" />}
                    iconBg="bg-red-500/10"
                    label="Active Global Disruptions"
                    value={summaryStats.activeDisruptions}
                    onClick={() => navigate('/alerts')}
                    index={0}
                />
                <StatCard
                    icon={<ShieldAlert size={22} className="text-orange-400" />}
                    iconBg="bg-orange-500/10"
                    label="High Risk Trade Corridors"
                    value={summaryStats.highRiskCorridors}
                    onClick={() => navigate('/sectors')}
                    index={1}
                />
                <StatCard
                    icon={<ArrowUpRight size={22} className="text-emerald-400" />}
                    iconBg="bg-emerald-500/10"
                    label="Export Opportunities Detected"
                    value={summaryStats.exportOpportunities}
                    onClick={() => navigate('/market-position')}
                    index={2}
                />
                <StatCard
                    icon={<TrendingUp size={22} className="text-teal-400" />}
                    iconBg="bg-teal-500/10"
                    label="Projected Inflation Impact"
                    value={summaryStats.inflationImpact}
                    onClick={() => navigate('/market-position')}
                    index={3}
                />
            </div>

            {/* ── MIDDLE ROW: Import Risk (60%) + Export Opportunities (40%) ── */}
            <div className="flex flex-col lg:flex-row gap-5">

                {/* ── LEFT: Import Risk Panel (60%) ── */}
                <div className="lg:w-[60%] bg-[#1E293B] border border-white/5 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-500/10 rounded-xl">
                            <Flame size={20} className="text-red-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">India Import Sector Risk</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Supply chain vulnerability assessment by sector</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {importRisks.map((sector, idx) => {
                            const colors = riskColors[sector.level] || riskColors.LOW;
                            return (
                                <button
                                    key={sector.id}
                                    onClick={() => navigate('/sectors')}
                                    className="w-full group flex items-center gap-4 bg-slate-900/50 hover:bg-slate-800/70 border border-white/5 hover:border-slate-600 rounded-xl px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg text-left animate-fade-in-up"
                                    style={{ animationDelay: `${idx * 80}ms` }}
                                >
                                    {/* Colored left accent bar */}
                                    <div className={`w-1 h-10 rounded-full flex-shrink-0 ${colors.bar}`}></div>

                                    {/* Icon */}
                                    <span className="text-2xl flex-shrink-0 select-none">{sector.icon}</span>

                                    {/* Name + Note */}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-slate-100 text-sm group-hover:text-white transition-colors">
                                            {sector.sector}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-0.5 truncate">{sector.note}</div>
                                    </div>

                                    {/* Badge */}
                                    <span
                                        className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border ${colors.badge}`}
                                    >
                                        {sector.level}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── RIGHT: Export Opportunities Panel (40%) ── */}
                <div className="lg:w-[40%] bg-[#1E293B] border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-500/10 rounded-xl">
                            <Globe size={20} className="text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Export Opportunities</h2>
                            <p className="text-xs text-slate-500 mt-0.5">High-potential sectors for Indian exporters</p>
                        </div>
                    </div>

                    <div className="space-y-3 flex-1">
                        {exportOpportunities.map((item, idx) => {
                            const colors = riskColors[item.badgeLevel] || riskColors.GRAY;
                            const isGray = item.badgeLevel === 'GRAY';
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => navigate('/market-position')}
                                    className="w-full group flex items-center gap-4 bg-slate-900/50 hover:bg-slate-800/70 border border-white/5 hover:border-slate-600 rounded-xl px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg text-left animate-fade-in-up"
                                    style={{ animationDelay: `${idx * 80 + 200}ms` }}
                                >
                                    {/* Icon */}
                                    <span className="text-2xl flex-shrink-0 select-none">{item.icon}</span>

                                    {/* Name + Note */}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-slate-100 text-sm group-hover:text-white transition-colors">
                                            {item.sector}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.note}</div>
                                    </div>

                                    {/* Badge */}
                                    <span
                                        className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border whitespace-nowrap
                      ${isGray ? 'text-slate-300 bg-slate-700/40 border-slate-600/20' :
                                                item.badge === 'HIGH DEMAND'
                                                    ? 'text-emerald-400 bg-emerald-900/30 border-emerald-500/20'
                                                    : 'text-teal-400 bg-teal-900/30 border-teal-500/20'
                                            }`}
                                    >
                                        {item.badge}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Quick CTA */}
                    <button
                        onClick={() => navigate('/market-position')}
                        className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-400 text-sm font-semibold transition-all duration-200 hover:text-teal-300"
                    >
                        <BarChart2 size={15} />
                        Full Market Analysis
                    </button>
                </div>
            </div>

            {/* ── BOTTOM: Active Alerts Ticker ── */}
            <div>
                <div className="flex items-center gap-2 mb-3 text-slate-400 text-xs font-semibold uppercase tracking-widest">
                    <Zap size={14} className="text-brand-alert" />
                    Live Alerts Feed
                </div>
                <AlertTicker alerts={activeAlerts} />
            </div>

            {/* ══════════════════════════════════════════════════════
                ECONOMIC IMPACT INDICATORS — Dashboard Inline Section
            ══════════════════════════════════════════════════════ */}
            <EconomicImpactSection />

            {/* Ticker Keyframe */}
            <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
        </div>
    );
};

export default Dashboard;
