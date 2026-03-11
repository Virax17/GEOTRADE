import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Globe, Activity, TrendingUp, AlertOctagon, Info, LayoutDashboard, Menu, X } from 'lucide-react';

const NavBar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const links = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} aria-hidden="true" /> },
        { name: 'Sectors', path: '/sectors', icon: <TrendingUp size={18} aria-hidden="true" /> },
        { name: 'Alerts', path: '/alerts', icon: <AlertOctagon size={18} aria-hidden="true" /> },
        { name: 'Market Position', path: '/market-position', icon: <Activity size={18} aria-hidden="true" /> },
        { name: 'About', path: '/about', icon: <Info size={18} aria-hidden="true" /> },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-brand-bg/95 backdrop-blur-md shadow-lg flex flex-col" aria-label="Main Navigation">
            {/* Subtle India flag color strip */}
            <div className="h-1 w-full flex" aria-hidden="true">
                <div className="flex-1 bg-[#FF9933]"></div>
                <div className="flex-1 bg-white"></div>
                <div className="flex-1 bg-[#138808]"></div>
            </div>
            
            <div className="border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">

                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-2 text-brand-accent focus-within:ring-2 focus-within:ring-teal-500 rounded-lg p-1">
                        <Globe size={28} className="text-teal-500" aria-hidden="true" />
                        <span className="text-xl font-bold tracking-tight text-white select-none">GeoTrade</span>
                    </div>

                    {/* Center Links (Desktop) */}
                    <div className="hidden md:flex space-x-1 border border-white/5 bg-slate-800/50 p-1 rounded-full">
                        {links.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                aria-label={`Navigate to ${link.name}`}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[44px] min-w-[44px] ${isActive
                                        ? 'bg-brand-accent text-white shadow-md'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`
                                }
                            >
                                {link.icon}
                                {link.name}
                            </NavLink>
                        ))}
                    </div>

                    {/* LIVE Badge & Mobile Toggles */}
                    <div className="flex items-center gap-3 relative">
                        {/* Status Badge */}
                        <div 
                            className="hidden sm:flex items-center gap-2 text-xs font-semibold text-brand-alert bg-orange-500/10 px-3 py-2 rounded-full border border-orange-500/20 shadow-sm"
                            role="status"
                            aria-live="polite"
                        >
                            <div className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-alert"></span>
                            </div>
                            LIVE MONITORING
                        </div>

                        {/* Hamburger button (Mobile) */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-expanded={isMobileMenuOpen}
                            aria-controls="mobile-menu"
                            aria-label="Toggle navigation menu"
                            className="md:hidden p-2 text-slate-400 hover:text-white rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-800/50 border border-white/5 transition-colors"
                        >
                            {isMobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
                        </button>
                    </div>

                </div>
            </div>

            {/* Mobile nav (Expandable vertical menu) */}
            <div 
                id="mobile-menu" 
                className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-[#1E293B] border-b border-white/5 ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="px-4 py-3 space-y-2 flex flex-col">
                    {links.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            aria-label={`Navigate to ${link.name}`}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-xl text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${isActive ? 'bg-brand-accent/20 text-teal-400 border border-teal-500/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent'}`
                            }
                        >
                            {link.icon}
                            {link.name}
                        </NavLink>
                    ))}
                    <div className="mt-4 pt-4 border-t border-slate-700 flex justify-center">
                        <div className="flex items-center gap-2 text-xs font-semibold text-brand-alert bg-orange-500/10 px-4 py-2 rounded-full border border-orange-500/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-alert"></span>
                            </span>
                            LIVE SYSTEM STATUS
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
