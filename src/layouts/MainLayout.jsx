import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { useGlobalState } from '../GlobalState';
import EconomicImpactPanel from '../components/EconomicImpactPanel';
import GeoTradeAI from '../components/GeoTradeAI';
import { Loader2, RefreshCw, AlertTriangle, WifiOff } from 'lucide-react';

const MainLayout = () => {
    const { lastUpdated, isLoading, isRefreshing, error, refreshData } = useGlobalState();
    
    // Live clock for 'Last Updated'
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    
    // Instead of lastUpdated string directly, we show live clock if it's recently synced, or "Using cached data"
    const isCached = error !== null;

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col pt-safe bg-[#0A0F1D] text-slate-100 p-4 sm:p-6 lg:p-8">
                <NavBar />
                <div className="max-w-7xl w-full mx-auto mt-8 space-y-8 animate-pulse">
                    <div className="h-10 bg-slate-800/50 rounded-lg w-1/3 mb-4"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-slate-800/50 rounded-2xl border border-white/5"></div>
                        ))}
                    </div>
                    <div className="flex flex-col lg:flex-row gap-5">
                        <div className="lg:w-[60%] h-96 bg-slate-800/50 rounded-2xl border border-white/5"></div>
                        <div className="lg:w-[40%] h-96 bg-slate-800/50 rounded-2xl border border-white/5"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col pt-safe bg-[#0A0F1D] text-slate-100 selection:bg-teal-500/30">
            {/* Network Error Banner */}
            {error && (
                <div role="alert" className="bg-red-500/10 border-b border-red-500/20 text-red-400 px-4 py-2.5 flex items-center justify-center gap-3 text-[13px] font-medium animate-in slide-in-from-top-2">
                    <WifiOff size={16} />
                    <span>Connection Lost: {error}.</span>
                    <span className="text-red-300">Using cached offline data.</span>
                </div>
            )}

            <NavBar />
            
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                {/* Top Action Bar */}
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#1E293B]/50 border border-white/5 p-3 rounded-xl shadow-sm">
                    {/* Last Updated / Cached Notice */}
                    <div className="flex items-center text-xs font-medium">
                        {isCached ? (
                            <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                                <AlertTriangle size={14} />
                                Using cached data (Network Unavailable)
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-slate-400">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                System Synced • {currentTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)
                            </div>
                        )}
                    </div>

                    {/* Refresh Button */}
                    <button 
                        onClick={refreshData}
                        disabled={isRefreshing}
                        aria-label="Refresh intelligence data"
                        className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-400 rounded-lg text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                    >
                        {isRefreshing ? (
                            <>
                                <Loader2 size={13} className="animate-spin" />
                                Refreshing intelligence...
                            </>
                        ) : (
                            <>
                                <RefreshCw size={13} />
                                Refresh Status
                            </>
                        )}
                    </button>
                </div>

                <Outlet />
            </main>

            <footer className="mt-auto border-t border-white/5 bg-[#0D1421] py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center md:text-left">
                        <p className="text-sm font-bold text-slate-300">GeoTrade Intelligence Platform</p>
                        <p className="text-xs text-slate-500 mt-1">Powered by AI | Team Nakshatra | India Innovates 2026</p>
                    </div>
                    <div className="text-center md:text-right text-xs text-slate-500">
                        <p>Data sources: UN Comtrade, MarineTraffic, NewsAPI</p>
                        <p className="mt-1">&copy; {new Date().getFullYear()} All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {/* Economic Impact Indicators — accessible from all pages */}
            <EconomicImpactPanel />
            
            {/* Global AI Assistant */}
            <GeoTradeAI />
        </div>
    );
};

export default MainLayout;
