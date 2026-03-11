import React, { useState, useEffect, useRef } from 'react';
import {
    TrendingUp, X, ChevronLeft, ChevronRight,
    Activity, AlertTriangle, BarChart2, Clock
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────
const COMMODITIES = [
    { name: 'Crude Oil', price: '$87/barrel', change: +2.3, impact: 'Fuel cost increase' },
    { name: 'Natural Gas', price: '$3.2/MMBtu', change: -1.1, impact: 'Slight relief' },
    { name: 'Wheat', price: '$245/ton', change: +4.7, impact: 'Food price pressure' },
    { name: 'Fertilizer (Urea)', price: '$320/ton', change: +1.8, impact: 'Agricultural cost rise' },
    { name: 'Semiconductor Index', price: '142', change: -0.5, impact: 'Stable electronics supply' },
];

const TIMELINE_EVENTS = [
    { week: 'Week 2–4', label: 'Petroleum supply tight', severity: 'high', offsetPercent: 8 },
    { week: 'Week 6', label: 'Fertilizer reorder window', severity: 'medium', offsetPercent: 35 },
    { week: 'Week 10–12', label: 'Semiconductor delays possible', severity: 'low', offsetPercent: 66 },
];

const INDUSTRIES = [
    { name: 'Automobile', risk: -3, color: '#EF4444' },
    { name: 'Agriculture', risk: -2, color: '#F97316' },
    { name: 'Electronics Mfg.', risk: -1, color: '#FBBF24' },
];

// ─────────────────────────────────────────────────────────────────
// Inflation Gauge (SVG Semicircle)
// ─────────────────────────────────────────────────────────────────
const InflationGauge = ({ value = 0.6 }) => {
    const [animated, setAnimated] = useState(0);
    const MAX = 5;
    const radius = 70;
    const cx = 100, cy = 90;
    const circumference = Math.PI * radius; // semicircle arc length

    useEffect(() => {
        let start = null;
        const duration = 1400;
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

    // Zone colors
    let needleColor = '#10B981'; // green
    if (animated >= 1 && animated < 2.5) needleColor = '#F97316';
    if (animated >= 2.5) needleColor = '#EF4444';

    // Needle angle: -180deg (left) → 0deg (right), ratio maps 0→-180, 1→0
    const needleAngleDeg = -180 + ratio * 180;
    const needleRad = (needleAngleDeg * Math.PI) / 180;
    const needleLen = 55;
    const nx = cx + needleLen * Math.cos(needleRad);
    const ny = cy + needleLen * Math.sin(needleRad);

    return (
        <div className="flex flex-col items-center">
            <svg viewBox="0 0 200 110" className="w-56 max-w-full">
                {/* Background track */}
                <path
                    d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
                    fill="none" stroke="#1E293B" strokeWidth="14" strokeLinecap="round"
                />
                {/* Green zone 0-20% */}
                <path
                    d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
                    fill="none" stroke="url(#gaugeGrad)" strokeWidth="14" strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    style={{ transition: 'stroke-dashoffset 0.05s linear' }}
                />
                {/* Zone tick marks */}
                {[0.2, 0.5].map((frac, i) => {
                    const a = (-180 + frac * 180) * (Math.PI / 180);
                    const r1 = radius - 10, r2 = radius + 5;
                    return (
                        <line key={i}
                            x1={cx + r1 * Math.cos(a)} y1={cy + r1 * Math.sin(a)}
                            x2={cx + r2 * Math.cos(a)} y2={cy + r2 * Math.sin(a)}
                            stroke="#334155" strokeWidth="2"
                        />
                    );
                })}
                {/* Gradient def */}
                <defs>
                    <linearGradient id="gaugeGrad" gradientUnits="userSpaceOnUse"
                        x1={cx - radius} y1={cy} x2={cx + radius} y2={cy}>
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="40%" stopColor="#F97316" />
                        <stop offset="80%" stopColor="#EF4444" />
                    </linearGradient>
                </defs>
                {/* Needle */}
                <line x1={cx} y1={cy} x2={nx} y2={ny}
                    stroke={needleColor} strokeWidth="3" strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 4px ${needleColor}88)` }}
                />
                <circle cx={cx} cy={cy} r="5" fill={needleColor} />
                {/* Labels */}
                <text x={cx - radius - 4} y={cy + 18} fill="#64748B" fontSize="9" textAnchor="middle">0%</text>
                <text x={cx} y={cy - radius - 8} fill="#64748B" fontSize="9" textAnchor="middle">2.5%</text>
                <text x={cx + radius + 4} y={cy + 18} fill="#64748B" fontSize="9" textAnchor="middle">5%</text>
                {/* Center value */}
                <text x={cx} y={cy + 20} fill="white" fontSize="22" fontWeight="800" textAnchor="middle">
                    +{animated.toFixed(1)}%
                </text>
            </svg>
            <div className="flex gap-3 mt-1 text-xs">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>Low (0–1%)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>Med (1–2.5%)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>High (2.5%+)</span>
            </div>
            <p className="mt-3 text-xs text-slate-400 text-center leading-relaxed px-2">
                Current global disruptions are estimated to add <span className="text-orange-400 font-semibold">0.6%</span> to India's inflation rate,
                mainly due to petroleum and fertilizer price increases.
            </p>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────
// Commodity Price Tracker
// ─────────────────────────────────────────────────────────────────
const CommodityTable = () => (
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
);

// ─────────────────────────────────────────────────────────────────
// Supply Shortage Risk Timeline
// ─────────────────────────────────────────────────────────────────
const RiskTimeline = () => {
    const severityStyles = {
        high: { dot: 'bg-red-500', label: 'text-red-400', line: '#EF4444' },
        medium: { dot: 'bg-orange-500', label: 'text-orange-400', line: '#F97316' },
        low: { dot: 'bg-yellow-500', label: 'text-yellow-400', line: '#EAB308' },
    };
    return (
        <div className="relative pt-4 pb-2">
            {/* Axis */}
            <div className="relative h-6 flex items-center">
                <div className="absolute inset-x-0 h-1 bg-slate-700 rounded-full"></div>
                {/* Week markers */}
                {[0, 25, 50, 75, 100].map((p, i) => (
                    <div key={i} className="absolute flex flex-col items-center"
                        style={{ left: `${p}%`, transform: 'translateX(-50%)' }}>
                        <div className="w-px h-2.5 bg-slate-600 mt-0.5"></div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-600 mt-0.5 mb-4">
                <span>Now</span><span>Wk 6</span><span>Wk 12</span>
            </div>

            {/* Events */}
            <div className="space-y-3">
                {TIMELINE_EVENTS.map((ev) => {
                    const s = severityStyles[ev.severity];
                    return (
                        <div key={ev.label} className="flex items-start gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5 ${s.dot}`}
                                style={{ boxShadow: `0 0 6px ${s.line}88` }}></div>
                            <div>
                                <span className={`text-[11px] font-bold ${s.label}`}>{ev.week}: </span>
                                <span className="text-[11px] text-slate-300">{ev.label}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────
// Industrial Output Impact
// ─────────────────────────────────────────────────────────────────
const IndustrialImpact = () => (
    <div className="space-y-3">
        {INDUSTRIES.map((ind) => {
            const pct = Math.abs(ind.risk);
            const width = (pct / 5) * 100; // max 5% mapped to 100%
            return (
                <div key={ind.name}>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-300 font-medium">{ind.name}</span>
                        <span className="text-xs font-bold" style={{ color: ind.color }}>
                            {ind.risk}% output risk
                        </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                                width: `${width}%`,
                                backgroundColor: ind.color,
                                boxShadow: `0 0 8px ${ind.color}66`,
                            }}
                        ></div>
                    </div>
                </div>
            );
        })}
        <p className="text-[10px] text-slate-600 mt-2 italic">* All figures are AI estimates and approximations.</p>
    </div>
);

// ─────────────────────────────────────────────────────────────────
// Section Wrapper
// ─────────────────────────────────────────────────────────────────
const PanelSection = ({ icon, title, children }) => {
    const [open, setOpen] = useState(true);
    return (
        <div className="border border-white/5 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(v => !v)}
                aria-expanded={open}
                className="w-full flex items-center gap-2 px-4 py-3 min-h-[44px] bg-slate-800/60 hover:bg-slate-700/60 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            >
                <span className="text-teal-400">{icon}</span>
                <span className="flex-1 text-xs font-bold text-slate-200 uppercase tracking-wider">{title}</span>
                <ChevronLeft
                    size={14}
                    className={`text-slate-500 transition-transform duration-300 ${open ? '-rotate-90' : 'rotate-0'}`}
                />
            </button>
            {open && (
                <div className="px-4 py-4 bg-slate-900/40">
                    {children}
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────
// Main Panel
// ─────────────────────────────────────────────────────────────────
const EconomicImpactPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (isOpen && panelRef.current && !panelRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen]);

    return (
        <>
            {/* ── Toggle Button (fixed right edge) ── */}
            <button
                onClick={() => setIsOpen(v => !v)}
                aria-expanded={isOpen}
                aria-label="Toggle Economic Impact Panel"
                className={`fixed top-1/2 -translate-y-1/2 z-50 flex flex-col items-center justify-center gap-1.5
                    rounded-l-xl px-2 py-5 shadow-2xl border border-r-0 border-white/10 min-h-[80px] min-w-[44px]
                    bg-[#162032] hover:bg-slate-700 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-teal-500/50
                    ${isOpen ? 'right-[380px]' : 'right-0'}`}
                style={{ transition: 'right 0.4s cubic-bezier(0.4,0,0.2,1), background 0.2s' }}
            >
                <TrendingUp size={18} className="text-teal-400 group-hover:text-teal-300 transition-colors" />
                <span
                    className="text-[10px] font-bold text-slate-400 group-hover:text-slate-200 transition-colors"
                    style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', letterSpacing: '0.08em' }}
                >
                    ECONOMIC IMPACT
                </span>
                {isOpen
                    ? <ChevronRight size={14} className="text-slate-500" />
                    : <ChevronLeft size={14} className="text-slate-500" />
                }
            </button>

            {/* ── Overlay backdrop ── */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* ── Slide-in Panel ── */}
            <div
                ref={panelRef}
                className={`fixed top-0 right-0 h-full z-50 w-[380px] max-w-full
                    bg-[#0D1929] border-l border-white/8 shadow-2xl
                    flex flex-col overflow-hidden
                    transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)' }}
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8 bg-gradient-to-r from-teal-900/30 to-slate-900/0">
                    <div className="p-2 bg-teal-500/10 rounded-xl">
                        <TrendingUp size={20} className="text-teal-400" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-sm font-bold text-white tracking-wide">Economic Impact Indicators</h2>
                        <p className="text-[11px] text-slate-500 mt-0.5">AI estimates • Real-time approximations</p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        aria-label="Close Economic Impact Panel"
                        className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* AI Estimate Banner */}
                <div className="mx-4 mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <AlertTriangle size={13} className="text-amber-400 flex-shrink-0" />
                    <span className="text-[11px] text-amber-300 font-medium">
                        All numbers are AI estimates and clearly approximate.
                    </span>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin"
                    style={{ scrollbarColor: '#334155 transparent' }}>

                    {/* 1. Inflation Gauge */}
                    <PanelSection icon={<Activity size={14} />} title="Inflation Pressure Meter">
                        <InflationGauge value={0.6} />
                    </PanelSection>

                    {/* 2. Commodity Prices */}
                    <PanelSection icon={<BarChart2 size={14} />} title="Commodity Price Tracker">
                        <CommodityTable />
                    </PanelSection>

                    {/* 3. Timeline */}
                    <PanelSection icon={<Clock size={14} />} title="Supply Shortage Risk — Next 90 Days">
                        <RiskTimeline />
                    </PanelSection>

                    {/* 4. Industrial Impact */}
                    <PanelSection icon={<AlertTriangle size={14} />} title="Industrial Output Impact">
                        <IndustrialImpact />
                    </PanelSection>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-white/5 bg-slate-900/60">
                    <p className="text-[10px] text-slate-600 text-center">
                        Data refreshed every 15 minutes • GeoTrade Intelligence Platform
                    </p>
                </div>
            </div>
        </>
    );
};

export default EconomicImpactPanel;
