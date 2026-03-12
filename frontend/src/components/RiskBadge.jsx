import React from 'react';

const RiskBadge = ({ level }) => {
    let bgColor = 'bg-slate-700';
    let textColor = 'text-slate-200';
    let dotColor = 'bg-slate-400';

    if (level === 'HIGH' || level === 'RED') {
        bgColor = 'bg-red-900/40';
        textColor = 'text-red-400';
        dotColor = 'bg-red-500';
    } else if (level === 'MODERATE' || level === 'ORANGE') {
        bgColor = 'bg-orange-900/40';
        textColor = 'text-orange-400';
        dotColor = 'bg-brand-alert';
    } else if (level === 'LOW' || level === 'OPPORTUNITY' || level === 'GREEN') {
        bgColor = 'bg-emerald-900/40';
        textColor = 'text-emerald-400';
        dotColor = 'bg-emerald-500';
    }

    const isHighRisk = level === 'HIGH' || level === 'RED';

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${bgColor} ${textColor} border border-white/5 ${isHighRisk ? 'badge-pulse-high' : ''}`}>
            {isHighRisk ? (
                <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColor}`}></span>
                </span>
            ) : (
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
            )}
            {level === 'OPPORTUNITY' ? 'OPPORTUNITY' : level}
        </span>
    );
};

export default RiskBadge;
