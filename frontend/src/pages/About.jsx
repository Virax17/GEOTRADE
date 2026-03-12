import React from 'react';
import { Info, Shield, Filter, Globe } from 'lucide-react';

const About = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <Info className="text-blue-500" size={32} />
                        Platform Overview
                    </h1>
                    <p className="text-slate-400 mt-2">Information regarding the GeoTrade Intelligence Platform data sources and methodology.</p>
                </div>
            </div>

            <div className="bg-slate-800/30 p-8 rounded-2xl border border-white/5 shadow-lg prose border-slate-700 max-w-none text-slate-300">
                <h2 className="text-xl font-semibold text-white mt-0 mb-4">Our Mission</h2>
                <p className="leading-relaxed mb-8 text-slate-400">
                    GeoTrade Intelligence Platform offers real-time monitoring and analysis of global geopolitical events, mapping their direct risks and opportunities onto India’s primary economic sectors. Our goal is to empower decision-makers with plain, actionable intelligence in an increasingly fractured global supply chain environment.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-5 bg-slate-900/50 rounded-xl border border-white/10 flex flex-col items-center text-center">
                        <Shield className="text-brand-accent mb-4" size={32} />
                        <h3 className="font-semibold text-white mb-2">Secure</h3>
                        <p className="text-sm text-slate-500">Encrypted data ingestion ensuring intelligence integrity and confidentiality.</p>
                    </div>
                    <div className="p-5 bg-slate-900/50 rounded-xl border border-white/10 flex flex-col items-center text-center">
                        <Filter className="text-brand-alert mb-4" size={32} />
                        <h3 className="font-semibold text-white mb-2">Curated</h3>
                        <p className="text-sm text-slate-500">We filter the noise. Only disruptions with a quantifiable impact on domestic sectors are presented.</p>
                    </div>
                    <div className="p-5 bg-slate-900/50 rounded-xl border border-white/10 flex flex-col items-center text-center">
                        <Globe className="text-blue-400 mb-4" size={32} />
                        <h3 className="font-semibold text-white mb-2">Global Scope</h3>
                        <p className="text-sm text-slate-500">Continuous scanning of over 150 vital transit chokepoints and source markets worldwide.</p>
                    </div>
                </div>

                <div className="bg-blue-900/20 p-6 rounded-xl border border-blue-500/20">
                    <h2 className="text-lg font-semibold text-blue-400 mt-0 mb-3">Notice on Data Freshness</h2>
                    <p className="text-sm text-slate-400 leading-relaxed mb-0">
                        Current data is operating in MOCK MODE for demonstration purposes. In a live environment, the system utilizes satellite AIS data, global event APIs, and proprietary NLP models to aggregate and synthesize geopolitical events.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;
