import React, { useState, useEffect } from 'react';
import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup,
} from 'react-simple-maps';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip,
    ResponsiveContainer, CartesianGrid, Legend, Cell,
    PieChart, Pie, Sector,
} from 'recharts';
import { useGlobalState } from '../GlobalState';
import {
    TrendingUp, Globe, BarChart2, ArrowUpRight, DollarSign,
    Target, Info, X,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// Color map for country statuses
// ─────────────────────────────────────────────────────────────────
const statusColor = {
    MAJOR_PARTNER: '#0f766e',   // teal-700
    DISRUPTED: '#c2410c',   // orange-700
    HIGH_RISK: '#b91c1c',   // red-700
    DEFAULT: '#1e293b',   // slate-800
    INDIA: '#0d9488',   // bright teal for India itself
};

const riskLabel = { STABLE: '🟢 Stable', ELEVATED: '🟡 Elevated', DISRUPTED: '🟠 Disrupted', CRITICAL: '🔴 Critical' };

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// ISO alpha-3 to numeric (world-atlas uses numeric IDs mapped via a lookup below)
// We use the name-based approach from the topology
const isoToName = {
    IRQ: 'Iraq', SAU: 'Saudi Arabia', ARE: 'United Arab Emirates', CHN: 'China',
    USA: 'United States of America', RUS: 'Russia', DEU: 'Germany', GBR: 'United Kingdom',
    JPN: 'Japan', AUS: 'Australia', SGP: 'Singapore', KOR: 'South Korea',
    YEM: 'Yemen', EGY: 'Egypt', IRN: 'Iran', UKR: 'Ukraine', TWN: 'Taiwan',
    IND: 'India',
};

// ─────────────────────────────────────────────────────────────────
// Custom Chart Tooltip
// ─────────────────────────────────────────────────────────────────
const ChartTooltip = React.memo(({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs shadow-2xl">
            <p className="text-slate-400 mb-1.5 font-semibold">{label}</p>
            {payload.map(p => (
                <div key={p.name} className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: p.fill || p.color }}></div>
                    <span className="text-slate-300">{p.name}:</span>
                    <span className="text-white font-bold">{p.value}</span>
                </div>
            ))}
        </div>
    );
});

// ─────────────────────────────────────────────────────────────────
// Active Donut shape for animation
// ─────────────────────────────────────────────────────────────────
const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
    return (
        <g>
            <text x={cx} y={cy - 8} textAnchor="middle" fill="white" className="text-sm" fontSize={13} fontWeight="bold">
                {payload.name}
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" fill="#94a3b8" fontSize={11}>
                {(percent * 100).toFixed(0)}%
            </text>
            <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} />
            <Sector cx={cx} cy={cy} innerRadius={outerRadius + 10} outerRadius={outerRadius + 13} startAngle={startAngle} endAngle={endAngle} fill={fill} />
        </g>
    );
};

const DonutChart = React.memo(function DonutChart({ data, title, subtitle, index = 0 }) {
    const [activeIndex, setActiveIndex] = useState(0);
    return (
        <div
            className="bg-[#1E293B] border border-white/5 rounded-2xl p-5 flex-1 min-w-0 animate-fade-in-up"
            style={{ animationDelay: `${index * 150 + 400}ms` }}
        >
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-1">{title}</h3>
            <p className="text-xs text-slate-500 mb-4">{subtitle}</p>
            <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                    <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        dataKey="value"
                        onMouseEnter={(_, i) => setActiveIndex(i)}
                        isAnimationActive={true}
                    >
                        {data.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
                {data.map((entry, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: entry.color }}></span>
                        {entry.name} <span className="text-slate-400">({entry.value}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
});

// ─────────────────────────────────────────────────────────────────
// World Map Section
// ─────────────────────────────────────────────────────────────────
const WorldMapSection = ({ tradeCountries }) => {
    const [tooltip, setTooltip] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [geoError, setGeoError] = useState(false);

    // Build a quick lookup name→tradeData
    const countryLookup = {};
    tradeCountries.forEach(c => {
        const name = isoToName[c.iso];
        if (name) countryLookup[name] = c;
    });

    const getCountryColor = (geoName) => {
        if (geoName === 'India') return statusColor.INDIA;
        const entry = countryLookup[geoName];
        if (!entry) return statusColor.DEFAULT;
        return statusColor[entry.status] || statusColor.DEFAULT;
    };

    const mapLegend = [
        { color: statusColor.INDIA, label: 'India' },
        { color: statusColor.MAJOR_PARTNER, label: 'Major Trade Partner' },
        { color: statusColor.DISRUPTED, label: 'Disrupted Route' },
        { color: statusColor.HIGH_RISK, label: 'High Risk Region' },
        { color: '#334155', label: 'Neutral / No Data' },
    ];

    return (
        <div className="bg-[#1E293B] border border-white/5 rounded-2xl overflow-hidden shadow-xl animate-fade-in-up delay-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 pb-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-500/10 rounded-xl">
                        <Globe size={20} className="text-teal-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">India's Global Trade Map</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Hover or click any country to see trade details</p>
                    </div>
                </div>
                {/* Legend */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {mapLegend.map(l => (
                        <div key={l.label} className="flex items-center gap-1.5 text-xs text-slate-300">
                            <span className="w-3 h-3 rounded-sm" style={{ background: l.color }}></span>
                            {l.label}
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative flex flex-col lg:flex-row">
                {/* Map */}
                <div className="flex-1 min-w-0 bg-slate-900/50" style={{ height: 380 }}>
                    <ComposableMap
                        projection="geoNaturalEarth1"
                        projectionConfig={{ scale: 140, center: [20, 10] }}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <ZoomableGroup zoom={1} minZoom={1} maxZoom={4}>
                            <Geographies geography={GEO_URL}>
                                {({ geographies }) =>
                                    geographies.map(geo => {
                                        const name = geo.properties.name;
                                        const fill = getCountryColor(name);
                                        const entry = countryLookup[name] || (name === 'India' ? { name: 'India', status: 'INDIA', volume: '$775B+', commodities: 'All sectors', risk: 'STABLE' } : null);
                                        return (
                                            <Geography
                                                key={geo.rsmKey}
                                                geography={geo}
                                                fill={fill}
                                                stroke="#0f172a"
                                                strokeWidth={0.5}
                                                style={{
                                                    default: { outline: 'none', opacity: 1 },
                                                    hover: { outline: 'none', opacity: 0.85, filter: 'brightness(1.3)', cursor: entry ? 'pointer' : 'default' },
                                                    pressed: { outline: 'none' },
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (entry) setTooltip({ x: e.clientX, y: e.clientY, data: entry, name });
                                                }}
                                                onMouseLeave={() => setTooltip(null)}
                                                onClick={() => {
                                                    if (entry) setSelectedCountry(entry.name ? entry : { ...entry, name });
                                                }}
                                            />
                                        );
                                    })
                                }
                            </Geographies>
                        </ZoomableGroup>
                    </ComposableMap>

                    {/* Hover Tooltip */}
                    {tooltip && (
                        <div
                            className="fixed z-50 pointer-events-none bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs shadow-2xl max-w-[200px]"
                            style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
                        >
                            <p className="font-bold text-white mb-1">{tooltip.name}</p>
                            <p className="text-slate-400">Volume: <span className="text-slate-200">{tooltip.data.volume}</span></p>
                            <p className="text-slate-400">Goods: <span className="text-slate-200">{tooltip.data.commodities}</span></p>
                            <p className="text-slate-400">Status: <span className="text-slate-200">{riskLabel[tooltip.data.risk] || tooltip.data.risk}</span></p>
                        </div>
                    )}
                </div>

                {/* Country Detail Panel */}
                {selectedCountry && (
                    <div className="lg:w-64 bg-slate-900/60 border-l border-white/5 p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-white text-base">{selectedCountry.name || 'Country'}</h3>
                            <button onClick={() => setSelectedCountry(null)} className="text-slate-500 hover:text-slate-300 transition-colors p-2" aria-label="Close details">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5">
                                <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Trade Volume</div>
                                <div className="text-white font-bold text-lg">{selectedCountry.volume || 'N/A'}</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5">
                                <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Key Commodities</div>
                                <div className="text-slate-200 font-medium">{selectedCountry.commodities || '—'}</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5">
                                <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Current Status</div>
                                <div className="text-slate-200 font-medium">{riskLabel[selectedCountry.risk] || selectedCountry.risk || '—'}</div>
                            </div>
                            {selectedCountry.status && (
                                <div className={`text-xs font-semibold px-2.5 py-1.5 rounded-full text-center ${selectedCountry.status === 'MAJOR_PARTNER' ? 'bg-teal-900/40 text-teal-400 border border-teal-500/20' :
                                        selectedCountry.status === 'DISRUPTED' ? 'bg-orange-900/40 text-orange-400 border border-orange-500/20' :
                                            selectedCountry.status === 'HIGH_RISK' ? 'bg-red-900/40 text-red-400 border border-red-500/20' :
                                                'bg-slate-700/40 text-slate-300 border border-white/5'
                                    }`}>
                                    {selectedCountry.status?.replace('_', ' ')}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────
// Export Opportunity Cards
// ─────────────────────────────────────────────────────────────────
const OpportunityCards = React.memo(({ cards }) => (
    <div className="space-y-5 animate-fade-in-up delay-200">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
                <Target size={20} className="text-emerald-400" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-white">Where India Can Win Right Now</h2>
                <p className="text-xs text-slate-400 mt-0.5">High-confidence export opportunities identified this quarter</p>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cards.map((card, i) => (
                <div
                    key={card.id}
                    className="group bg-[#1E293B] hover:bg-slate-700/40 border border-emerald-500/10 hover:border-emerald-500/30 rounded-2xl p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-default animate-fade-in-up"
                    style={{ animationDelay: `${i * 100 + 300}ms` }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{card.flag}</span>
                            <div>
                                <p className="text-xs text-slate-400 font-medium">{card.region}</p>
                                <p className="text-sm font-bold text-slate-200">{card.sector}</p>
                            </div>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-900/40 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 badge-pulse-high">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            {card.badge}
                        </span>
                    </div>
                    {/* Potential Value */}
                    <div className="mb-3">
                        <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Estimated Potential</p>
                        <div className="flex items-center gap-1.5">
                            <DollarSign size={18} className="text-emerald-400 flex-shrink-0" />
                            <span className="text-3xl font-extrabold text-white">{card.potential}</span>
                        </div>
                    </div>
                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3">{card.description}</p>
                </div>
            ))}
        </div>
    </div>
));

// ─────────────────────────────────────────────────────────────────
// Competitor Comparison Chart
// ─────────────────────────────────────────────────────────────────
const CompetitorChart = React.memo(({ data }) => (
    <div className="bg-[#1E293B] border border-white/5 rounded-2xl p-5 shadow-lg animate-fade-in-up delay-400">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-xl">
                <BarChart2 size={20} className="text-blue-400" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-white">India vs Competitors — Export Strength</h2>
                <p className="text-xs text-slate-400 mt-0.5">Competitiveness index by sector (0–100 scale) — higher is stronger</p>
            </div>
        </div>
        <div className="overflow-x-auto w-full">
            <div style={{ minWidth: "600px", height: "280px" }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 0, right: 20, left: -10, bottom: 0 }} barGap={2} barCategoryGap="30%">
                        <CartesianGrid vertical={false} stroke="#1e293b" />
                        <XAxis dataKey="sector" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}`} />
                        <RechartsTooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                        <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 16 }} />
                        <Bar dataKey="India" fill="#0d9488" radius={[4, 4, 0, 0]} isAnimationActive={true} />
                        <Bar dataKey="China" fill="#334155" radius={[4, 4, 0, 0]} isAnimationActive={true} />
                        <Bar dataKey="Bangladesh" fill="#1e293b" radius={[4, 4, 0, 0]} stroke="#475569" strokeWidth={1} isAnimationActive={true} />
                        <Bar dataKey="Vietnam" fill="#293548" radius={[4, 4, 0, 0]} isAnimationActive={true} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
        <div className="mt-4 flex items-start gap-2 bg-teal-500/5 border border-teal-500/10 rounded-xl p-3">
            <Info size={14} className="text-teal-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
                India leads in IT/Software and Pharmaceuticals. China leads in Engineering and Textiles. Bangladesh is a formidable competitor in textiles.
            </p>
        </div>
    </div>
));

// ─────────────────────────────────────────────────────────────────
// Trade Balance KPI Row
// ─────────────────────────────────────────────────────────────────
const KpiRow = ({ indicators }) => {
    const kpis = [
        { label: 'Rupee / USD', value: `₹${indicators.rupeeToUsd}`, sub: '↓ 0.2% this week', color: 'text-orange-400' },
        { label: 'Retail Inflation', value: indicators.inflationRate, sub: 'Consumer Price Index', color: 'text-white' },
        { label: 'Forex Reserves', value: indicators.forexReserves, sub: 'Adequate coverage', color: 'text-teal-400' },
        { label: 'Export Growth', value: indicators.exportGrowth, sub: 'Year on Year', color: 'text-emerald-400' },
    ];
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up delay-100">
            {kpis.map((k, i) => (
                <div key={k.label} className={`bg-[#1E293B] border border-white/5 rounded-2xl p-4 shadow-md hover:bg-slate-700/30 transition-colors animate-fade-in-up`} style={{ animationDelay: `${i * 100 + 100}ms` }}>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">{k.label}</p>
                    <p className={`text-2xl font-extrabold ${k.color}`}>{k.value}</p>
                    <p className="text-slate-500 text-xs mt-1">{k.sub}</p>
                </div>
            ))}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────
const MarketPosition = () => {
    const { marketPosition, economicIndicators } = useGlobalState();
    const {
        tradeCountries, exportOpportunityCards,
        competitorData, importComposition, exportComposition,
    } = marketPosition;

    return (
        <div className="space-y-8">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">Market Position</h1>
                    <p className="text-slate-400 mt-1.5 text-sm">
                        India's global trade footprint — partners, opportunities, risks, and competitive strength.
                    </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-2 rounded-full self-start sm:self-auto">
                    <ArrowUpRight size={14} />
                    Total Trade: ~$775B (FY2025)
                </div>
            </div>

            {/* ── KPI Row ── */}
            <KpiRow indicators={economicIndicators} />

            {/* ── SECTION 1: World Map ── */}
            <WorldMapSection tradeCountries={tradeCountries} />

            {/* ── SECTION 2: Export Opportunity Scanner ── */}
            <OpportunityCards cards={exportOpportunityCards} />

            {/* ── SECTION 3: Competitor Comparison ── */}
            <CompetitorChart data={competitorData} />

            {/* ── SECTION 4: Trade Balance Donuts ── */}
            <div>
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-purple-500/10 rounded-xl">
                        <TrendingUp size={20} className="text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">India Trade Balance Snapshot</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Composition of imports and exports by sector (FY2025 estimates)</p>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-5">
                    <DonutChart
                        data={importComposition}
                        title="Import Composition"
                        subtitle="What India buys from the world"
                        index={0}
                    />
                    <DonutChart
                        data={exportComposition}
                        title="Export Composition"
                        subtitle="What India sells to the world"
                        index={1}
                    />
                </div>
            </div>

        </div>
    );
};

export default MarketPosition;
