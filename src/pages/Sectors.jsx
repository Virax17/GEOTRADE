import React, { useState } from 'react';
import { useGlobalState } from '../GlobalState';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    LineChart, Line, Area, AreaChart,
} from 'recharts';
import {
    ShieldAlert, TrendingUp, TrendingDown, Minus,
    Lightbulb, Globe, AlertTriangle, CheckCircle2, AlertOctagon,
    ChevronRight, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// Shared Config
// ─────────────────────────────────────────────────────────────────
const levelConfig = {
    HIGH: { border: 'border-red-500/30', badge: 'bg-red-900/40 text-red-400 border-red-500/30', bg: 'bg-red-500/5', dot: 'bg-red-500', text: 'text-red-400', icon: <AlertOctagon size={14} />, label: 'HIGH RISK' },
    MODERATE: { border: 'border-orange-500/20', badge: 'bg-orange-900/40 text-orange-400 border-orange-500/30', bg: 'bg-orange-500/5', dot: 'bg-orange-500', text: 'text-orange-400', icon: <AlertTriangle size={14} />, label: 'MODERATE' },
    OPPORTUNITY: { border: 'border-emerald-500/20', badge: 'bg-emerald-900/40 text-emerald-400 border-emerald-500/30', bg: 'bg-emerald-500/5', dot: 'bg-emerald-500', text: 'text-emerald-400', icon: <CheckCircle2 size={14} />, label: 'OPPORTUNITY' },
    LOW: { border: 'border-slate-600/20', badge: 'bg-slate-700/40 text-slate-300 border-slate-600/30', bg: 'bg-slate-700/10', dot: 'bg-slate-400', text: 'text-slate-400', icon: null, label: 'LOW / STABLE' },
};

const barColors = {
    HIGH: '#ef4444', MODERATE: '#f97316', OPPORTUNITY: '#10b981', LOW: '#94a3b8',
};

const trendIcon = (trend) => {
    if (trend === 'increasing') return <ArrowUpRight size={14} className="text-red-400" />;
    if (trend === 'positive') return <ArrowUpRight size={14} className="text-emerald-400" />;
    return <Minus size={14} className="text-slate-400" />;
};

// ─────────────────────────────────────────────────────────────────
// Risk Score Semicircle Gauge
// ─────────────────────────────────────────────────────────────────
const RiskGauge = ({ score }) => {
    const capped = Math.min(100, Math.max(0, score));
    const angle = (capped / 100) * 180; // 0–180°
    const rad = (angle - 90) * (Math.PI / 180);
    const cx = 60, cy = 60, r = 48;
    const nx = cx + r * Math.cos(rad);
    const ny = cy + r * Math.sin(rad);

    const color = capped >= 70 ? '#ef4444' : capped >= 40 ? '#f97316' : '#10b981';
    const label = capped >= 70 ? 'High Risk' : capped >= 40 ? 'Moderate' : 'Low Risk';

    // Arc from 180° left to current angle
    const startX = cx - r; // leftmost point (180°)
    const startY = cy;
    const largeArc = angle > 90 ? 1 : 0;

    return (
        <div className="flex flex-col items-center">
            <svg width="120" height="72" viewBox="0 0 120 72">
                {/* Track */}
                <path
                    d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                    fill="none" stroke="#1e293b" strokeWidth="10" strokeLinecap="round"
                />
                {/* Filled arc */}
                {capped > 0 && (
                    <path
                        d={`M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${nx} ${ny}`}
                        fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
                    />
                )}
                {/* Score text */}
                <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">{capped}</text>
                <text x={cx} y={cy + 12} textAnchor="middle" fill="#64748b" fontSize="9">/100</text>
            </svg>
            <span className="text-xs font-semibold mt-1" style={{ color }}>{label}</span>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────
// Custom Recharts Tooltip
// ─────────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
            <p className="text-slate-400 mb-0.5">{label}</p>
            <p className="text-white font-bold">{payload[0].value}</p>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────
// Detail View
// ─────────────────────────────────────────────────────────────────
const SectorDetail = ({ sector, relatedAlerts }) => {
    const cfg = levelConfig[sector.level] || levelConfig.LOW;
    const fillColor = barColors[sector.level] || '#94a3b8';
    const isExport = sector.type === 'EXPORT';
    const sourceLabel = isExport ? 'Top Export Destinations (% of exports)' : 'Top Import Sources (% share)';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mt-6">

            {/* ────── LEFT col: 60% ────── */}
            <div className="lg:col-span-3 space-y-5">

                {/* Sector header */}
                <div className={`flex flex-wrap items-center gap-4 p-5 rounded-2xl border ${cfg.border} ${cfg.bg}`}>
                    <span className="text-4xl">{sector.icon}</span>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-extrabold text-white">{sector.name}</h2>
                        <span className="text-xs font-medium text-slate-400">
                            {isExport ? 'Export Sector' : 'Import Sector'} · Key partner: {sector.keyDependency}
                        </span>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${cfg.badge}`}>
                        <span className={`w-2 h-2 rounded-full ${cfg.dot} ${sector.level === 'HIGH' ? 'animate-pulse' : ''}`}></span>
                        {cfg.label}
                    </span>
                </div>

                {/* Why at risk */}
                <div className="bg-[#1E293B] rounded-2xl border border-white/5 p-5">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">
                        {isExport ? '📈 Why Is This an Opportunity?' : '⚠️ Why Is This at Risk?'}
                    </h3>
                    <ul className="space-y-3">
                        {sector.riskBullets.map((b, i) => (
                            <li key={i} className="flex gap-3 text-sm text-slate-300 leading-relaxed">
                                <ChevronRight size={16} className={`flex-shrink-0 mt-0.5 ${cfg.text}`} />
                                {b}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Import / Export Sources Bar Chart */}
                <div className="bg-[#1E293B] rounded-2xl border border-white/5 p-5 animate-fade-in-up delay-200">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">{sourceLabel}</h3>
                    <div className="overflow-x-auto w-full">
                        <div style={{ minWidth: "400px", height: "180px" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sector.importSources} layout="vertical" margin={{ left: 0, right: 24, top: 0, bottom: 0 }}>
                                    <CartesianGrid horizontal={false} stroke="#1e293b" />
                                    <XAxis type="number" domain={[0, 60]} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="country" width={90} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Bar dataKey="share" fill={fillColor} radius={[0, 6, 6, 0]} maxBarSize={20} isAnimationActive={true} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Price Trend Line Chart */}
                <div className="bg-[#1E293B] rounded-2xl border border-white/5 p-5 animate-fade-in-up delay-300">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-1">6-Month Trend</h3>
                    <p className="text-xs text-slate-600 mb-4">{sector.trendLabel}</p>
                    <div className="overflow-x-auto w-full">
                        <div style={{ minWidth: "400px", height: "160px" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={sector.priceTrend} margin={{ left: 0, right: 4, top: 4, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id={`grad-${sector.id}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={fillColor} stopOpacity={0.3} />
                                            <stop offset="100%" stopColor={fillColor} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Area isAnimationActive={true} type="monotone" dataKey="value" stroke={fillColor} strokeWidth={2.5} fill={`url(#grad-${sector.id})`} dot={{ r: 3, fill: fillColor, strokeWidth: 2, stroke: '#0f172a' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Related Alerts */}
                {relatedAlerts.length > 0 && (
                    <div className="bg-[#1E293B] rounded-2xl border border-white/5 p-5">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Active Disruptions Linked to This Sector</h3>
                        <div className="space-y-3">
                            {relatedAlerts.map(alert => {
                                const alertCfg = levelConfig[alert.severity] || levelConfig.LOW;
                                return (
                                    <div key={alert.id} className={`flex items-start gap-3 p-3.5 rounded-xl border ${alertCfg.border} ${alertCfg.bg}`}>
                                        <span className="text-xl flex-shrink-0">{alert.categoryIcon || '📌'}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-xs font-bold mb-0.5 ${alertCfg.text}`}>{alertCfg.label}</div>
                                            <p className="text-sm font-semibold text-slate-200">{alert.title}</p>
                                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{alert.summary}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>

            {/* ────── RIGHT col: 40% ────── */}
            <div className="lg:col-span-2 space-y-5">

                {/* Risk Score Gauge */}
                <div className="bg-[#1E293B] rounded-2xl border border-white/5 p-5 flex flex-col items-center">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 self-start">Risk Score</h3>
                    <RiskGauge score={sector.riskScore} />
                    <p className="text-xs text-slate-500 mt-3 text-center max-w-xs">
                        Score reflects current supply chain vulnerability and geopolitical exposure on a 0–100 scale.
                    </p>
                </div>

                {/* What India Should Do */}
                <div className="bg-[#1E293B] rounded-2xl border border-white/5 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Lightbulb size={16} className="text-teal-400" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">What India Should Do</h3>
                    </div>
                    <ol className="space-y-3">
                        {sector.recommendedActions.map((action, i) => (
                            <li key={i} className="flex gap-3 text-sm">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500/15 border border-teal-500/25 text-teal-400 font-bold text-xs flex items-center justify-center mt-0.5">{i + 1}</span>
                                <span className="text-slate-300 leading-relaxed">{action}</span>
                            </li>
                        ))}
                    </ol>
                </div>

                {/* Alternative Suppliers */}
                {sector.alternativeSuppliers[0] !== 'N/A — India is a supplier' && (
                    <div className="bg-[#1E293B] rounded-2xl border border-white/5 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Globe size={16} className="text-blue-400" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Alternative Suppliers</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {sector.alternativeSuppliers.map(s => (
                                <span key={s} className="px-3 py-1.5 bg-slate-900/70 border border-white/5 rounded-lg text-xs font-semibold text-slate-300">
                                    🌍 {s}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Related Export Sectors */}
                <div className="bg-[#1E293B] rounded-2xl border border-white/5 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <ArrowUpRight size={16} className="text-emerald-400" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Related Sectors Affected</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {sector.relatedExports.map(s => (
                            <span key={s} className="px-3 py-1.5 bg-emerald-900/20 border border-emerald-500/15 rounded-lg text-xs font-semibold text-emerald-400">
                                {s}
                            </span>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────
// Comparison Table
// ─────────────────────────────────────────────────────────────────
const SummaryTable = ({ sectors }) => {
    const rows = Object.values(sectors);
    return (
        <div className="bg-[#1E293B] rounded-2xl border border-white/5 p-5 shadow-lg overflow-x-auto">
            <h2 className="text-lg font-bold text-white mb-5">All Sectors at a Glance</h2>
            <table className="w-full text-sm min-w-[640px]">
                <thead>
                    <tr className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-white/5">
                        <th className="text-left pb-3 pr-4">Sector</th>
                        <th className="text-left pb-3 pr-4">Type</th>
                        <th className="text-left pb-3 pr-4">Risk Level</th>
                        <th className="text-left pb-3 pr-4">Trend</th>
                        <th className="text-left pb-3 pr-4">Key Country</th>
                        <th className="text-left pb-3">Recommended Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {rows.map(s => {
                        const cfg = levelConfig[s.level] || levelConfig.LOW;
                        return (
                            <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="py-3.5 pr-4 font-semibold text-slate-200 whitespace-nowrap">
                                    <span className="mr-2">{s.icon}</span>{s.name}
                                </td>
                                <td className="py-3.5 pr-4">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${s.type === 'EXPORT' ? 'text-teal-400 bg-teal-900/20 border-teal-500/20' : 'text-orange-400 bg-orange-900/20 border-orange-500/20'
                                        }`}>
                                        {s.type}
                                    </span>
                                </td>
                                <td className="py-3.5 pr-4">
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.badge}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                                        {cfg.label}
                                    </span>
                                </td>
                                <td className="py-3.5 pr-4">
                                    <span className="flex items-center gap-1 text-xs">
                                        {trendIcon(s.trend)}
                                        <span className="text-slate-400 capitalize">{s.trend}</span>
                                    </span>
                                </td>
                                <td className="py-3.5 pr-4 text-slate-400 text-xs">{s.keyDependency}</td>
                                <td className="py-3.5 text-slate-400 text-xs max-w-[220px]">{s.recommendedActions[0]}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────
const SectorsPage = () => {
    const { sectorRisks, activeAlerts } = useGlobalState();
    const sectorKeys = Object.keys(sectorRisks);
    const [activeTab, setActiveTab] = useState(sectorKeys[0]);

    const activeSector = sectorRisks[activeTab];

    // Find alerts that are related to this sector
    const relatedAlerts = activeAlerts.filter(a =>
        (activeSector?.relatedAlertIds || []).includes(a.id)
    );

    const tabCfg = (key) => levelConfig[sectorRisks[key]?.level] || levelConfig.LOW;

    return (
        <div className="space-y-6">

            {/* ── Header ── */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">Sector Analysis</h1>
                <p className="text-slate-400 mt-1.5 text-sm">
                    Deep-dive into each of India's key trade sectors — risks, sources, trends and recommended actions.
                </p>
            </div>

            {/* ── Sector Tabs ── */}
            <div className="overflow-x-auto scrollbar-hide pb-1">
                <div className="flex gap-2 min-w-max bg-slate-800/40 border border-white/5 p-1.5 rounded-2xl w-fit">
                    {sectorKeys.map(key => {
                        const s = sectorRisks[key];
                        const cfg = tabCfg(key);
                        const isActive = key === activeTab;
                        return (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                role="tab"
                                aria-selected={isActive}
                                className={`flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 ${isActive
                                        ? `bg-[#1E293B] text-white shadow-lg border ${cfg.border}`
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                    }`}
                            >
                                <span>{s.icon}</span>
                                <span>{s.name}</span>
                                {isActive && (
                                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`}></span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Detail View ── */}
            {activeSector && (
                <SectorDetail sector={activeSector} relatedAlerts={relatedAlerts} />
            )}

            {/* ── Bottom Summary Table ── */}
            <SummaryTable sectors={sectorRisks} />

        </div>
    );
};

export default SectorsPage;
