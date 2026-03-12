import React from 'react';

const FilterPill = ({ active, onClick, children, className = '' }) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                active 
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30 shadow-sm' 
                    : 'bg-slate-800/50 text-slate-400 hover:text-white border border-transparent hover:bg-slate-700/50'
            } ${className}`}
        >
            {children}
        </button>
    );
};

export default FilterPill;
