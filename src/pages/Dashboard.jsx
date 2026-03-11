import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalState } from '../GlobalState';
import RiskBadge from '../components/RiskBadge';
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
