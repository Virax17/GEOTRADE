import React, { useState, useMemo } from 'react';
import { useGlobalState } from '../GlobalState';
import FilterPill from '../components/FilterPill';
import {
    Search,
    Clock,
    ChevronDown,
    ChevronUp,
    AlertTriangle,
    CheckCircle2,
    AlertOctagon,
    Info,
    MapPin,
    Tag,
    Lightbulb,
    TrendingDown,
    TrendingUp,
    Minus,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// Severity Config
// ─────────────────────────────────────────────────────────────────
const severityConfig = {
    HIGH: {
        border: 'border-red-500/30',
        glow: 'shadow-red-500/10',
        badge: 'bg-red-900/40 text-red-400 border-red-500/30',
        dot: 'bg-red-500',
        accent: 'bg-red-500',
        icon: <AlertOctagon size={14} />,
        label: 'HIGH RISK',
        headerBg: 'bg-red-900/10',
    },
    MODERATE: {
        border: 'border-orange-500/20',
        glow: 'shadow-orange-500/10',
        badge: 'bg-orange-900/40 text-orange-400 border-orange-500/30',
        dot: 'bg-orange-500',
        accent: 'bg-orange-500',
        icon: <AlertTriangle size={14} />,
        label: 'MODERATE',
        headerBg: 'bg-orange-900/10',
    },
    OPPORTUNITY: {
        border: 'border-emerald-500/20',
        glow: 'shadow-emerald-500/10',
        badge: 'bg-emerald-900/40 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-500',
        accent: 'bg-emerald-500',
        icon: <CheckCircle2 size={14} />,
        label: 'OPPORTUNITY',
        headerBg: 'bg-emerald-900/10',
    },
    LOW: {
        border: 'border-slate-500/20',
        glow: '',
        badge: 'bg-slate-700/40 text-slate-300 border-slate-600/30',
        dot: 'bg-slate-400',
        accent: 'bg-slate-400',
        icon: <Info size={14} />,
        label: 'LOW',
        headerBg: 'bg-slate-800/30',
    },
};

// ─────────────────────────────────────────────────────────────────
// Impact type icon
// ─────────────────────────────────────────────────────────────────
const ImpactChip = ({ type, sector, effect }) => {
    const isExport = type === 'EXPORT';
    const isDomestic = type === 'DOMESTIC';
    return (
        <div className="bg-slate-900/60 border border-white/5 rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
                <span className={`flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full border ${isExport ? 'text-teal-400 bg-teal-900/30 border-teal-500/20' :
                        isDomestic ? 'text-purple-400 bg-purple-900/30 border-purple-500/20' :
                            'text-orange-400 bg-orange-900/30 border-orange-500/20'
                    }`}>
                    {isExport ? <TrendingUp size={10} /> : isDomestic ? <Minus size={10} /> : <TrendingDown size={10} />}
                    {type}
                </span>
                <span className="text-slate-200 text-sm font-semibold">{sector}</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">{effect}</p>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────
// Single Alert Card
// ─────────────────────────────────────────────────────────────────
const AlertCard = ({ alert, index = 0 }) => {
    const [expanded, setExpanded] = useState(false);
    const cfg = severityConfig[alert.severity] || severityConfig.LOW;

    const dateObj = new Date(alert.timestamp);
    const timeAgo = (() => {
        const diff = Date.now() - dateObj.getTime();
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        if (h > 0) return `${h}h ${m}m ago`;
        return `${m}m ago`;
    })();
    const fullDate = dateObj.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short',
    });

    return (
        <div
            className={`group rounded-2xl border shadow-lg ${cfg.border} ${cfg.glow} bg-[#1E293B] transition-all duration-300 overflow-hidden animate-fade-in-up`}
            style={{ animationDelay: `${index * 80}ms` }}
        >
            {/* ── Collapsed Header ── */}
            <button
                onClick={() => setExpanded(e => !e)}
                className={`w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-white/[0.02] transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/10`}
                aria-expanded={expanded}
            >
                {/* Left accent bar */}
                <div className={`w-1 flex-shrink-0 self-stretch rounded-full ${cfg.accent} mt-0.5`}></div>

                {/* Category icon */}
                <span className="text-2xl flex-shrink-0 mt-0.5 select-none">{alert.categoryIcon || '📌'}</span>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${alert.severity === 'HIGH' ? 'animate-pulse' : ''}`}></span>
                            {cfg.label}
                        </span>
                        {alert.category && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-800/60 border border-white/5 px-2 py-0.5 rounded-full">
                                <Tag size={10} />
                                {alert.category}
                            </span>
                        )}
                        {alert.location && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 px-2 py-0.5">
                                <MapPin size={10} />
                                {alert.location}
                            </span>
                        )}
                    </div>
                    <h2 className="text-base font-bold text-slate-100 leading-snug group-hover:text-white transition-colors">
                        {alert.title}
                    </h2>
                    {!expanded && (
                        <p className="text-sm text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                            {alert.summary || alert.description}
                        </p>
                    )}
                </div>

                {/* Right: time + chevron */}
                <div className="flex-shrink-0 flex flex-col items-end gap-2 ml-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 whitespace-nowrap">
                        <Clock size={12} />
                        {timeAgo}
                    </div>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center bg-slate-800 border border-white/5 group-hover:bg-slate-700 transition-colors`}>
                        {expanded
                            ? <ChevronUp size={14} className="text-slate-400" />
                            : <ChevronDown size={14} className="text-slate-400" />
                        }
                    </div>
                </div>
            </button>

            {/* ── Expanded Details ── */}
            {expanded && (
                <div className={`px-6 pb-6 pt-2 border-t border-white/5 ${cfg.headerBg}`}>

                    {/* Full description */}
                    <div className="mb-5 mt-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">What Happened</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">{alert.description}</p>
                    </div>

                    {/* Impact areas chips */}
                    <div className="mb-5">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Affected Sectors</h3>
                        <div className="flex flex-wrap gap-2">
                            {alert.impactAreas.map(area => (
                                <span key={area} className="px-3 py-1 bg-slate-800 border border-white/5 rounded-lg text-xs font-semibold text-slate-300">
                                    {area}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* India Impact */}
                    {alert.indiaImpact && alert.indiaImpact.length > 0 && (
                        <div className="mb-5">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                                🇮🇳 India Impact
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {alert.indiaImpact.map((impact, i) => (
                                    <ImpactChip key={i} {...impact} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommended Action */}
                    {alert.recommendedAction && (
                        <div className="flex items-start gap-3 bg-teal-500/5 border border-teal-500/15 p-4 rounded-xl">
                            <Lightbulb size={18} className="text-teal-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <div className="text-xs font-bold uppercase tracking-widest text-teal-500 mb-1">Recommended Action</div>
                                <p className="text-sm text-slate-300 font-medium">{alert.recommendedAction}</p>
                            </div>
                        </div>
                    )}

                    {/* Timestamp footer */}
                    <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-600">
                        <Clock size={11} />
                        Detected: {fullDate} IST
                    </div>
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────
// FILTER / SEARCH BAR
// ─────────────────────────────────────────────────────────────────
const FILTERS = [
    { id: 'ALL', label: 'All Alerts', color: 'text-slate-300' },
    { id: 'HIGH', label: '🔴 High Risk', color: 'text-red-400' },
    { id: 'MODERATE', label: '🟠 Moderate', color: 'text-orange-400' },
    { id: 'OPPORTUNITY', label: '🟢 Opportunity', color: 'text-emerald-400' },
];

// ─────────────────────────────────────────────────────────────────
// Main Alerts Page
// ─────────────────────────────────────────────────────────────────
const AlertsPage = () => {
    const { activeAlerts, lastUpdated } = useGlobalState();
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = useMemo(() => {
        let list = [...activeAlerts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        if (activeFilter !== 'ALL') {
            list = list.filter(a => a.severity === activeFilter);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(a =>
                a.title.toLowerCase().includes(q) ||
                (a.description || '').toLowerCase().includes(q) ||
                (a.summary || '').toLowerCase().includes(q) ||
                (a.location || '').toLowerCase().includes(q) ||
                (a.category || '').toLowerCase().includes(q) ||
                (a.impactAreas || []).some(i => i.toLowerCase().includes(q))
            );
        }
        return list;
    }, [activeAlerts, activeFilter, searchQuery]);

    const lastUpdatedStr = new Date(lastUpdated).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short',
    });

    const highCount = activeAlerts.filter(a => a.severity === 'HIGH').length;
    const modCount = activeAlerts.filter(a => a.severity === 'MODERATE').length;
    const opporCount = activeAlerts.filter(a => a.severity === 'OPPORTUNITY').length;

    return (
        <div className="space-y-6">

            {/* ── Page Header ── */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight flex items-center gap-3">
                        <AlertOctagon className="text-brand-alert flex-shrink-0" size={32} />
                        Global Disruption Alerts
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm max-w-xl">
                        AI-detected events affecting India's trade — updated in real time from global data feeds.
                    </p>
                </div>

                {/* Stat pills */}
                <div className="flex flex-wrap items-center gap-2 self-start md:self-auto mt-1">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-900/20 border border-red-500/20 px-3 py-1.5 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        {highCount} High Risk
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-orange-400 bg-orange-900/20 border border-orange-500/20 px-3 py-1.5 rounded-full">
                        {modCount} Moderate
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-900/20 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                        {opporCount} Opportunity
                    </span>
                </div>
            </div>

            {/* ── Search + Filter Row ── */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search by keyword, location, or sector…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-[#1E293B] border border-white/5 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/30 transition-all"
                    />
                </div>

                {/* Filter pills */}
                <div className="flex gap-1.5 bg-slate-800/50 border border-white/5 p-1 rounded-xl flex-shrink-0">
                    {FILTERS.map(f => (
                        <FilterPill
                            key={f.id}
                            active={activeFilter === f.id}
                            onClick={() => setActiveFilter(f.id)}
                        >
                            <span className={f.color}>{f.label}</span>
                        </FilterPill>
                    ))}
                </div>
            </div>

            {/* ── Timestamp ── */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                Intelligence feed synced at {lastUpdatedStr} IST
                &nbsp;&bull;&nbsp;
                Showing {filtered.length} of {activeAlerts.length} alerts
            </div>

            {/* ── Alert Cards ── */}
            {filtered.length === 0 ? (
                <div className="text-center py-20 text-slate-600">
                    <Search size={40} className="mx-auto mb-4 opacity-40" />
                    <p className="text-lg font-semibold text-slate-500">No alerts match your search</p>
                    <p className="text-sm mt-1">Try a different keyword or reset the filters.</p>
                    <button
                        onClick={() => { setSearchQuery(''); setActiveFilter('ALL'); }}
                        className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm text-slate-300 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((alert, i) => (
                        <AlertCard key={alert.id} alert={alert} index={i} />
                    ))}
                </div>
            )}

        </div>
    );
};

export default AlertsPage;
