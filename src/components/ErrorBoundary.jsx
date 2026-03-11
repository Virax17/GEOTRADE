import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        // In production, send to error reporting service
        if (import.meta.env.PROD) {
            // e.g. Sentry.captureException(error, { extra: errorInfo });
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0A0F1D] flex items-center justify-center p-6">
                    <div className="max-w-md w-full text-center">
                        {/* Icon */}
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
                            <AlertOctagon size={36} className="text-red-400" />
                        </div>

                        {/* Heading */}
                        <h1 className="text-2xl font-extrabold text-white mb-2">Something went wrong</h1>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            GeoTrade Intelligence Platform encountered an unexpected error.
                            Your data is safe — please refresh to continue.
                        </p>

                        {/* Error details (dev only) */}
                        {import.meta.env.DEV && this.state.error && (
                            <div className="mb-6 text-left bg-slate-900/80 border border-red-500/10 rounded-xl p-4 overflow-auto max-h-40">
                                <p className="text-red-400 text-xs font-mono break-words">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        {/* Action */}
                        <button
                            onClick={this.handleReset}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                        >
                            <RefreshCw size={16} />
                            Back to Dashboard
                        </button>

                        {/* Branding */}
                        <p className="mt-8 text-xs text-slate-600">
                            GeoTrade Intelligence Platform · Team Nakshatra · India Innovates 2026
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
