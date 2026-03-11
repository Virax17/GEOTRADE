import React from 'react';
import {
    CheckSquare, Square, AlertOctagon, Navigation, Filter,
    Layers, BarChart2, MessageSquare, Sliders, Loader2,
    Palette, FileText, X, ChevronDown, ChevronUp
} from 'lucide-react';

const checks = [
    { id: 'pages',     icon: <Layers size={14} />,       label: 'All 5 pages load without errors',                    category: 'Core' },
    { id: 'nav',       icon: <Navigation size={14} />,   label: 'Navigation works on mobile and desktop',             category: 'Core' },
    { id: 'filter',    icon: <Filter size={14} />,       label: 'Alert filtering works (ALL/HIGH/MODERATE/OPP)',       category: 'Features' },
    { id: 'sectors',   icon: <Layers size={14} />,       label: 'Sector tabs all switch correctly',                   category: 'Features' },
    { id: 'charts',    icon: <BarChart2 size={14} />,    label: 'Charts render and animate on load',                  category: 'Features' },
    { id: 'ai',        icon: <MessageSquare size={14} />,label: 'AI chat opens, sends, and receives messages',        category: 'AI' },
    { id: 'scenario',  icon: <Sliders size={14} />,      label: 'Scenario simulator dropdown works',                  category: 'Features' },
    { id: 'skeleton',  icon: <Loader2 size={14} />,      label: 'Loading skeletons appear then disappear (1.5s)',     category: 'UX' },
    { id: 'colors',    icon: <Palette size={14} />,      label: 'Colors correct: RED=HIGH, ORANGE=MOD, GREEN=LOW',    category: 'UX' },
    { id: 'footer',    icon: <FileText size={14} />,     label: 'Footer: Team Nakshatra + data sources shown',        category: 'Branding' },
];

const categoryColor = {
    Core:     'text-teal-400 bg-teal-500/10 border-teal-500/20',
    Features: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    AI:       'text-purple-400 bg-purple-500/10 border-purple-500/20',
    UX:       'text-orange-400 bg-orange-500/10 border-orange-500/20',
    Branding: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

const DevChecklist = () => {
    const [checked, setChecked] = React.useState({});
    const [visible, setVisible] = React.useState(true);
    const [collapsed, setCollapsed] = React.useState(false);

    if (!visible) return null;

    const total = checks.length;
    const done = Object.values(checked).filter(Boolean).length;
    const pct = Math.round((done / total) * 100);

    const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));

    return (
        <div
            className="fixed bottom-24 left-4 z-[9999] w-80 max-h-[85vh] flex flex-col rounded-2xl border border-white/10 shadow-2xl bg-[#0D1929]/95 backdrop-blur-md text-xs overflow-hidden"
            role="region"
            aria-label="Developer Testing Checklist"
        >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-gradient-to-r from-teal-900/30 to-transparent">
                <div className="p-1.5 bg-teal-500/10 rounded-lg flex-shrink-0">
                    <CheckSquare size={14} className="text-teal-400" />
                </div>
                <div className="flex-1">
                    <span className="font-bold text-slate-100 text-sm">Dev Checklist</span>
                    <span className="ml-2 text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded-full">DEV ONLY</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setCollapsed(c => !c)}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
                        aria-label={collapsed ? 'Expand checklist' : 'Collapse checklist'}
                    >
                        {collapsed ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
                    </button>
                    <button
                        onClick={() => setVisible(false)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                        aria-label="Close checklist"
                    >
                        <X size={13} />
                    </button>
                </div>
            </div>

            {/* Progress */}
            {!collapsed && (
                <>
                    <div className="px-4 py-2.5 border-b border-white/5">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-slate-400">Progress</span>
                            <span className={`font-bold ${done === total ? 'text-emerald-400' : 'text-slate-200'}`}>
                                {done}/{total} ({pct}%)
                            </span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${pct}%`,
                                    background: done === total ? '#10b981' : 'linear-gradient(90deg, #0d9488, #0ea5e9)',
                                }}
                            />
                        </div>
                    </div>

                    {/* Items */}
                    <ul className="flex-1 overflow-y-auto divide-y divide-white/5">
                        {checks.map(c => (
                            <li key={c.id}>
                                <button
                                    onClick={() => toggle(c.id)}
                                    className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${checked[c.id] ? 'bg-emerald-500/5' : 'hover:bg-white/[0.03]'}`}
                                >
                                    <span className="mt-0.5 flex-shrink-0">
                                        {checked[c.id]
                                            ? <CheckSquare size={13} className="text-emerald-400" />
                                            : <Square size={13} className="text-slate-500" />
                                        }
                                    </span>
                                    <span className={`flex-1 leading-relaxed ${checked[c.id] ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                                        {c.label}
                                    </span>
                                    <span className={`flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${categoryColor[c.category]}`}>
                                        {c.category}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>

                    {/* Footer */}
                    <div className="px-4 py-2.5 border-t border-white/5 bg-slate-900/40">
                        {done === total ? (
                            <p className="text-emerald-400 font-bold text-center flex items-center justify-center gap-1.5">
                                <CheckSquare size={12}/> All checks passed! Ready to deploy.
                            </p>
                        ) : (
                            <p className="text-center text-slate-500">Click items to mark as tested</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default DevChecklist;
