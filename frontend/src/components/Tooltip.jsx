import React from 'react';

const Tooltip = ({ children, content, position = 'top' }) => {
    return (
        <div className="group relative flex items-center justify-center">
            {children}
            <div className={`absolute z-[100] w-max max-w-xs px-3 py-2 text-xs font-medium text-slate-200 bg-[#1E293B] border border-teal-500/50 rounded shadow-xl transition-all duration-200 opacity-0 group-hover:opacity-100 pointer-events-none delay-75
                ${position === 'top' ? 'bottom-full mb-2' : ''}
                ${position === 'bottom' ? 'top-full mt-2' : ''}
                ${position === 'left' ? 'right-full mr-2' : ''}
                ${position === 'right' ? 'left-full ml-2' : ''}
            `}>
                {content}
            </div>
        </div>
    );
};

export default Tooltip;
