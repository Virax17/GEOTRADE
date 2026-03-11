import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StateProvider } from './GlobalState';
import ErrorBoundary from './components/ErrorBoundary';
import MainLayout from './layouts/MainLayout';

// Eager-loaded pages (lightweight / always needed immediately)
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import About from './pages/About';
import Sectors from './pages/Sectors';

// Lazy-loaded heavy page
const MarketPosition = lazy(() => import('./pages/MarketPosition'));

// Dev-only checklist
const DevChecklist = import.meta.env.DEV
    ? lazy(() => import('./components/DevChecklist'))
    : null;

/* ─────────────────────────────────────────────────────────────────
   Page-level Suspense fallback — slim skeleton bar
───────────────────────────────────────────────────────────────── */
const PageSkeleton = () => (
    <div className="w-full animate-pulse space-y-6 py-4">
        <div className="h-8 w-1/3 bg-slate-800/60 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-800/50 rounded-2xl border border-white/5" />
            ))}
        </div>
        <div className="flex flex-col lg:flex-row gap-5">
            <div className="lg:w-[60%] h-80 bg-slate-800/50 rounded-2xl border border-white/5" />
            <div className="lg:w-[40%] h-80 bg-slate-800/50 rounded-2xl border border-white/5" />
        </div>
    </div>
);

function App() {
    return (
        <ErrorBoundary>
            <StateProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<MainLayout />}>
                            <Route index element={<Dashboard />} />
                            <Route path="sectors" element={<Sectors />} />
                            <Route path="alerts" element={<Alerts />} />
                            <Route
                                path="market-position"
                                element={
                                    <Suspense fallback={<PageSkeleton />}>
                                        <MarketPosition />
                                    </Suspense>
                                }
                            />
                            <Route path="about" element={<About />} />
                        </Route>
                    </Routes>
                </BrowserRouter>

                {/* Dev-only interactive checklist */}
                {import.meta.env.DEV && DevChecklist && (
                    <Suspense fallback={null}>
                        <DevChecklist />
                    </Suspense>
                )}
            </StateProvider>
        </ErrorBoundary>
    );
}

export default App;
