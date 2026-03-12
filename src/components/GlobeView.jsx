import React, { useEffect, useRef, useState, useCallback } from 'react';

// ─── Accurate Geographic Data ──────────────────────────────────────────────

const EVENTS = [
  { id:1,  country:'Red Sea',        title:'Houthi Shipping Attacks',       severity:'critical', lat:15.5, lng:43.5,  desc:'Ongoing drone/missile attacks disrupting global shipping lanes',       category:'Shipping'  },
  { id:2,  country:'Russia/Ukraine', title:'Black Sea Grain Blockade',      severity:'high',     lat:46.5, lng:32.0,  desc:'Wheat export disruption affecting South Asian food imports',            category:'Trade'     },
  { id:3,  country:'Taiwan Strait',  title:'PLA Naval Exercises',           severity:'high',     lat:24.5, lng:120.5, desc:'Semiconductor supply chain risk elevated',                             category:'Political' },
  { id:4,  country:'Iran',           title:'Strait of Hormuz Tensions',     severity:'critical', lat:26.5, lng:56.5,  desc:'Crude oil tanker movement restricted, India energy imports affected',  category:'Energy'    },
  { id:5,  country:'Pakistan',       title:'India-Pakistan Border Closure', severity:'high',     lat:30.0, lng:70.0,  desc:'Land trade routes suspended',                                         category:'Trade'     },
  { id:6,  country:'Myanmar',        title:'Civil War Escalation',          severity:'moderate', lat:19.0, lng:96.0,  desc:'Northeast India border instability, ASEAN trade affected',            category:'Political' },
  { id:7,  country:'Sri Lanka',      title:'Port Congestion Crisis',        severity:'moderate', lat:7.8,  lng:80.7,  desc:'Colombo hub delays cascading to Indian transshipment routes',         category:'Shipping'  },
  { id:8,  country:'Bangladesh',     title:'Political Unrest',              severity:'moderate', lat:23.7, lng:90.4,  desc:'Garment export disruptions, textile supply chain impacted',           category:'Trade'     },
  { id:9,  country:'USA',            title:'Section 301 Tariff Review',     severity:'moderate', lat:38.9, lng:-77.0, desc:'Potential tariff hike on Indian pharma and IT exports',               category:'Trade'     },
  { id:10, country:'Belarus',        title:'Fertilizer Export Ban',         severity:'high',     lat:53.9, lng:27.6,  desc:'Potash and urea supply pressure for Indian agriculture',              category:'Trade'     },
  { id:11, country:'Israel/Gaza',    title:'Middle East Conflict',          severity:'critical', lat:31.5, lng:34.8,  desc:'Suez alternative routing adding 14 days to EU shipments',            category:'Shipping'  },
  { id:12, country:'China',          title:'South China Sea Dispute',       severity:'high',     lat:15.0, lng:114.0, desc:'ASEAN shipping lane risk, India-Vietnam corridor elevated',           category:'Political' },
];

// Accurate shipping lane waypoints [lat, lng]
const SEA_ROUTES = [
  {
    name:'Mumbai → Suez Canal (Red Sea)',
    risk:'critical',
    label:'⚠️ Disrupted — Houthi attacks, Red Sea alternative routing',
    points:[
      [18.93,72.84], // Mumbai
      [12.8,54.0],   // Arabian Sea
      [12.6,43.4],   // Bab-el-Mandeb
      [15.5,43.5],   // Red Sea
      [22.0,38.0],   // Red Sea
      [27.5,33.9],   // Red Sea north
      [30.0,32.6],   // Suez Canal entry
      [31.3,32.1],   // Port Said
      [36.2,14.0],   // Mediterranean
    ],
  },
  {
    name:'Mumbai → Singapore (Malacca Strait)',
    risk:'moderate',
    label:'⚠️ Elevated risk — South China Sea tensions',
    points:[
      [18.93,72.84], // Mumbai
      [7.8,80.7],    // Sri Lanka / Colombo
      [5.0,96.0],    // Indian Ocean
      [1.26,103.82], // Malacca Strait
      [1.35,103.82], // Singapore
    ],
  },
  {
    name:'Mumbai → Cape of Good Hope (Alternate)',
    risk:'low',
    label:'🔄 Alternate route — +14 days if Suez closed',
    points:[
      [18.93,72.84], // Mumbai
      [10.0,60.0],   // Arabian Sea
      [-2.0,44.0],   // East African coast
      [-15.0,35.0],  // Mozambique Channel
      [-34.3,18.5],  // Cape of Good Hope
    ],
  },
  {
    name:'Mumbai → Hormuz → Persian Gulf',
    risk:'critical',
    label:'⚠️ Disrupted — Iranian tensions at Hormuz',
    points:[
      [18.93,72.84], // Mumbai
      [22.0,62.0],   // Arabian Sea
      [24.3,58.0],   // Oman
      [26.35,56.45], // Strait of Hormuz
      [25.2,55.3],   // Dubai
      [26.2,50.6],   // Bahrain
    ],
  },
  {
    name:'Kolkata → Bay of Bengal → Vietnam',
    risk:'moderate',
    label:'⚠️ South China Sea dispute risk',
    points:[
      [22.5,88.3],   // Kolkata
      [15.0,90.0],   // Bay of Bengal
      [5.0,100.0],   // Andaman Sea
      [1.26,103.82], // Malacca Strait
      [10.8,106.7],  // Vietnam / Ho Chi Minh
    ],
  },
  {
    name:'Kochi → Colombo (Short Corridor)',
    risk:'stable',
    label:'✅ Normal operations',
    points:[
      [9.93,76.27],  // Kochi
      [6.9,79.86],   // Colombo
    ],
  },
];

const CHOKEPOINTS = [
  { name:'Strait of Hormuz',  lat:26.35, lng:56.45, risk:'critical', flag:'🛢️', note:'20% of global oil supply. Iran-US tensions. India imports 40% of crude through here.' },
  { name:'Suez Canal',        lat:30.5,  lng:32.3,  risk:'critical', flag:'🚢', note:'12% of world trade. Houthi drone attacks via Red Sea forcing Cape reroute.' },
  { name:'Bab-el-Mandeb',    lat:12.6,  lng:43.4,  risk:'critical', flag:'🚨', note:'Gateway between Red Sea & Indian Ocean. Yemen conflict. 10% of global trade.' },
  { name:'Malacca Strait',    lat:1.26,  lng:103.82,risk:'high',     flag:'⚓', note:'India-ASEAN shipping bottleneck. 25% of global trade. Piracy & SCS risk.' },
  { name:'South China Sea',   lat:15.0,  lng:114.0, risk:'high',     flag:'⚠️', note:'Chinese territorial claims. India-East Asia sea lane conflict zone.' },
  { name:'Cape of Good Hope', lat:-34.3, lng:18.5,  risk:'low',      flag:'🔄', note:'Alternative to Suez. +14 days transit adds ~$1M/voyage in costs.' },
  { name:'Lombok Strait',     lat:-8.8,  lng:115.7, risk:'moderate', flag:'🔀', note:'Alternative to Malacca for LNG tankers. Deeper draft capable.' },
];

const MILITARY_BASES = [
  { name:'PLA Navy — Gwadar (Pakistan)',    lat:25.12, lng:62.32,  country:'China',    type:'Naval',   threat:'String-of-pearls node. Direct sea access near Indian coast.', flag:'🇨🇳', color:'#f97316' },
  { name:'PLA Navy — Hambantota (SL)',       lat:6.10,  lng:81.12,  country:'China',    type:'Naval',   threat:'Flanks Bay of Bengal. 99-yr lease. Indian Ocean surveillance.', flag:'🇨🇳', color:'#f97316' },
  { name:'PLA Navy — Djibouti',             lat:11.53, lng:43.15,  country:'China',    type:'Naval',   threat:'First overseas PLAN base. Controls Red Sea narrows.', flag:'🇨🇳', color:'#f97316' },
  { name:'PLA Intel — Coco Islands (Myan)', lat:14.12, lng:93.38,  country:'China',    type:'Signals', threat:'Signals intelligence base. Monitors Andaman & Nicobar Commands.', flag:'🇨🇳', color:'#f97316' },
  { name:'Pakistan Navy HQ — Karachi',      lat:24.86, lng:67.01,  country:'Pakistan', type:'Naval',   threat:'Controls north Arabian Sea approach. Fleet base.', flag:'🇵🇰', color:'#ef4444' },
  { name:'Pakistan Air Force — Skardu',     lat:35.33, lng:75.61,  country:'Pakistan', type:'AirBase', threat:'High-altitude fighter base facing Ladakh / Line of Control.', flag:'🇵🇰', color:'#ef4444' },
  { name:'US Navy — Diego Garcia',          lat:-7.31, lng:72.42,  country:'USA',      type:'Naval',   threat:'Allied base. B-52 operations. Indian Ocean power projection.', flag:'🇺🇸', color:'#38bdf8' },
  { name:'US CENTCOM — Bahrain',            lat:26.21, lng:50.59,  country:'USA',      type:'Naval',   threat:'5th Fleet HQ. Gulf / Hormuz presence.', flag:'🇺🇸', color:'#38bdf8' },
];

const AIRSPACES = [
  { name:'Pakistan Airspace', lat:30.38, lng:69.35, status:'closed',     note:'Completely closed for Indian carriers following 2019 Balakot crisis.',     color:'#ef4444'  },
  { name:'Afghanistan',       lat:33.93, lng:67.71, status:'restricted', note:'War zone. Taliban-controlled. All flights avoid.',                          color:'#f97316'  },
  { name:'Iran',              lat:32.43, lng:53.69, status:'restricted', note:'Diplomatic tensions. Indian carriers use alternate routes.',                 color:'#f97316'  },
  { name:'Myanmar',           lat:19.85, lng:96.11, status:'restricted', note:'Civil war zones. Partial airspace closures along India border.',             color:'#f97316'  },
  { name:'Saudi Arabia',      lat:23.89, lng:45.07, status:'open',       note:'Bilateral agreements active. Priority landing slots for Indian carriers.',   color:'#22c55e'  },
  { name:'UAE',               lat:24.47, lng:54.37, status:'open',       note:'Dubai hub. Major Indian diaspora route. Full ops.',                         color:'#22c55e'  },
  { name:'Indian Airspace',   lat:20.59, lng:78.96, status:'open',       note:'Full sovereignty. Peacetime operations. World 3rd largest civil airspace.',  color:'#0d9488'  },
];

const SEVER_COLOR = { critical:'#ef4444', high:'#f97316', moderate:'#eab308', stable:'#22c55e', low:'#94a3b8' };
const RISK_COLOR  = { critical:'#ef4444', high:'#f97316', moderate:'#eab308', stable:'#22c55e', low:'#94a3b8' };

// ─── Sub-components ───────────────────────────────────────────────────────────

const LegendItem = ({ color, label }) => (
  <span className="flex items-center gap-1.5">
    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}88` }}></span>
    <span>{label}</span>
  </span>
);

const LayerToggle = ({ label, icon, active, onClick, color = '#0d9488' }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all duration-200 border whitespace-nowrap"
    style={{
      background: active ? `${color}22` : 'rgba(15,23,42,0.8)',
      borderColor: active ? color : 'rgba(255,255,255,0.08)',
      color: active ? color : '#64748b',
      boxShadow: active ? `0 0 8px ${color}44` : 'none',
    }}
  >
    <span>{icon}</span>
    <span>{label}</span>
  </button>
);

const InfoPanel = ({ selected, onClose }) => {
  if (!selected) return null;
  const riskColor = SEVER_COLOR[selected.risk || selected.severity] || '#94a3b8';
  return (
    <div className="absolute top-2 right-2 z-50 w-64 bg-[#0d1825]/97 border border-teal-500/40 rounded-xl shadow-2xl backdrop-blur-sm overflow-hidden">
      <div className="flex items-start justify-between gap-2 p-3 border-b border-white/10">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg flex-shrink-0">{selected.flag || '📍'}</span>
          <div className="min-w-0">
            <div className="text-white text-xs font-bold leading-tight">{selected.name || selected.title}</div>
            <div className="text-[10px] font-semibold mt-0.5" style={{ color: riskColor }}>
              {(selected.risk || selected.severity || '').toUpperCase()} {selected.type ? `· ${selected.type}` : ''}
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white w-5 h-5 flex items-center justify-center flex-shrink-0">✕</button>
      </div>
      <div className="p-3 text-xs text-slate-300 leading-relaxed space-y-1.5">
        {selected.note && <p>{selected.note}</p>}
        {selected.desc && <p>{selected.desc}</p>}
        {selected.threat && <p className="text-orange-300">{selected.threat}</p>}
        {selected.label && <p className="italic text-slate-400">{selected.label}</p>}
        {selected.country && <p className="text-slate-500 mt-1">Country: {selected.country}</p>}
      </div>
    </div>
  );
};

// ─── GlobeView ─────────────────────────────────────────────────────────────

const GlobeView = ({ onEventSelect }) => {
  const mountRef   = useRef(null);
  const globeRef   = useRef(null);
  const initDone   = useRef(false);
  const [ready,    setReady]           = useState(false);
  const [error,    setError]           = useState(null);
  const [selected, setSelected]        = useState(null);
  const [showEvents,      setShowEvents]      = useState(true);
  const [showRoutes,      setShowRoutes]      = useState(true);
  const [showChokepoints, setShowChokepoints] = useState(true);
  const [showBases,       setShowBases]       = useState(true);
  const [showAirspace,    setShowAirspace]    = useState(false);

  // ── Build arc segments from routes
  const arcs = showRoutes ? SEA_ROUTES.flatMap(r => {
    const pts = r.points;
    const segs = [];
    for (let i = 0; i < pts.length - 1; i++) {
      segs.push({
        startLat: pts[i][0],   startLng: pts[i][1],
        endLat:   pts[i+1][0], endLng:   pts[i+1][1],
        color: RISK_COLOR[r.risk] || '#38bdf8',
        name: r.name, label: r.label, risk: r.risk,
      });
    }
    return segs;
  }) : [];

  // ── Build points
  const points = [
    ...(showEvents      ? EVENTS.map(e => ({ ...e, __t:'event', altitude:0.022, radius:0.55, color: SEVER_COLOR[e.severity] })) : []),
    ...(showChokepoints ? CHOKEPOINTS.map(c => ({ ...c, __t:'choke', altitude:0.035, radius:0.65, color: RISK_COLOR[c.risk] })) : []),
    ...(showBases       ? MILITARY_BASES.map(b => ({ ...b, __t:'base',  altitude:0.018, radius:0.48, color: b.color })) : []),
    ...(showAirspace    ? AIRSPACES.map(a => ({ ...a, __t:'air',  altitude:0.012, radius:0.8, color: a.color })) : []),
  ];

  // ── Initialise globe (once)
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const mount = mountRef.current;
    if (!mount) return;

    // Wait one frame so the element has layout dimensions
    const rafId = requestAnimationFrame(async () => {
      try {
        const mod = await import('globe.gl');
        const GlobeGL = mod.default || mod;
        if (!mount) return;

        const w = mount.clientWidth  || 600;
        const h = mount.clientHeight || 500;

        const globe = GlobeGL()(mount);
        globeRef.current = globe;

        globe
          .width(w)
          .height(h)
          .backgroundColor('#03080f')
          // Night-side Earth texture served from unpkg CDN
          .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
          .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
          .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
          .showAtmosphere(true)
          .atmosphereColor('#0d9488')
          .atmosphereAltitude(0.18)
          .pointOfView({ lat: 20.6, lng: 78.9, altitude: 2.0 }, 0);

        globe.controls().autoRotate      = true;
        globe.controls().autoRotateSpeed = 0.35;

        setReady(true);
      } catch (err) {
        console.error('Globe init error:', err);
        setError(err.message || 'Failed to load 3D Globe');
      }
    });

    // ResizeObserver to keep globe sized to container
    const ro = new ResizeObserver(() => {
      if (globeRef.current && mount) {
        globeRef.current.width(mount.clientWidth);
        globeRef.current.height(mount.clientHeight);
      }
    });
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      // Clean up Three.js renderer
      if (globeRef.current) {
        try {
          const renderer = globeRef.current.renderer?.();
          if (renderer) { renderer.dispose(); renderer.forceContextLoss(); }
          const scene = globeRef.current.scene?.();
          if (scene) {
            scene.traverse(obj => {
              if (obj.geometry) obj.geometry.dispose();
              if (obj.material) {
                if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                else obj.material.dispose();
              }
            });
          }
        } catch (_) { /* ignore */ }
        if (mount) mount.innerHTML = '';
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Update points layer
  useEffect(() => {
    if (!ready || !globeRef.current) return;
    globeRef.current
      .pointsData(points)
      .pointLat('lat').pointLng('lng')
      .pointAltitude('altitude')
      .pointRadius('radius')
      .pointColor('color')
      .pointResolution(8)
      .onPointClick(p => {
        setSelected(p);
        if (p.__t === 'event' && onEventSelect) onEventSelect(p);
        globeRef.current.pointOfView({ lat: p.lat, lng: p.lng, altitude: 1.4 }, 900);
      })
      .pointLabel(p => `
        <div style="background:#0d1825cc;border:1px solid #0d9488;border-radius:8px;padding:7px 11px;font-size:11px;color:#e2e8f0;max-width:220px">
          <div style="font-weight:700;color:white;margin-bottom:3px">${p.name || p.title}</div>
          <div style="color:${p.color};font-size:10px;font-weight:600;margin-bottom:4px">${(p.__t || '').toUpperCase()} · ${(p.risk || p.severity || '').toUpperCase()}</div>
          <div style="color:#94a3b8;line-height:1.4">${(p.note || p.desc || p.threat || '').substring(0, 120)}</div>
        </div>`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, showEvents, showChokepoints, showBases, showAirspace]);

  // ── Update arcs layer
  useEffect(() => {
    if (!ready || !globeRef.current) return;
    globeRef.current
      .arcsData(arcs)
      .arcStartLat('startLat').arcStartLng('startLng')
      .arcEndLat('endLat').arcEndLng('endLng')
      .arcColor(a => [`${a.color}66`, a.color])
      .arcStroke(0.6)
      .arcDashLength(0.35)
      .arcDashGap(0.15)
      .arcDashAnimateTime(2500)
      .arcAltitudeAutoScale(0.3)
      .onArcClick(a => setSelected(a))
      .arcLabel(a => `
        <div style="background:#0d1825cc;border:1px solid #0d9488;border-radius:8px;padding:7px 11px;font-size:11px;color:#e2e8f0">
          <div style="font-weight:700">🚢 ${a.name}</div>
          <div style="color:${a.color};font-size:10px;margin-top:3px">${a.label}</div>
        </div>`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, showRoutes, arcs.length]);

  const handleClose = useCallback(() => setSelected(null), []);

  // ── Error fallback
  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#03080f] text-slate-400">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-sm font-semibold text-slate-300">3D Globe failed to load</p>
        <p className="text-xs mt-1 text-slate-500 max-w-xs text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#03080f]">
      {/* Layer toggles */}
      <div className="absolute top-2 left-2 z-50 flex flex-wrap gap-1.5" style={{ maxWidth: 'calc(100% - 16px)' }}>
        <LayerToggle icon="⚡" label="Events"       active={showEvents}      onClick={() => setShowEvents(v=>!v)}      color="#ef4444" />
        <LayerToggle icon="🚢" label="Sea Routes"   active={showRoutes}      onClick={() => setShowRoutes(v=>!v)}      color="#38bdf8" />
        <LayerToggle icon="⚓" label="Chokepoints"  active={showChokepoints} onClick={() => setShowChokepoints(v=>!v)} color="#f97316" />
        <LayerToggle icon="⚔️" label="Mil. Bases"   active={showBases}       onClick={() => setShowBases(v=>!v)}       color="#f43f5e" />
        <LayerToggle icon="✈️" label="Airspace"     active={showAirspace}    onClick={() => setShowAirspace(v=>!v)}    color="#22c55e" />
      </div>

      {/* Loading spinner */}
      {!ready && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-[#03080f]">
          <div className="text-5xl mb-4" style={{ animation: 'spin 2s linear infinite' }}>🌍</div>
          <div className="text-slate-400 text-sm">Loading 3D Globe…</div>
          <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        </div>
      )}

      {/* Globe canvas mount */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Info panel */}
      <InfoPanel selected={selected} onClose={handleClose} />

      {/* Legend */}
      <div className="absolute bottom-0 left-0 w-full px-3 py-2 bg-[#050d18]/90 border-t border-[#1a2d42] flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-semibold text-slate-400 z-50">
        <LegendItem color="#ef4444" label="Critical"       />
        <LegendItem color="#f97316" label="High"           />
        <LegendItem color="#eab308" label="Moderate"       />
        <LegendItem color="#38bdf8" label="Route (normal)" />
        <LegendItem color="#ef4444" label="Route (disrupted)" />
        <LegendItem color="#f97316" label="China base"     />
        <LegendItem color="#ef4444" label="Pakistan base"  />
        <LegendItem color="#38bdf8" label="Allied base"    />
        <LegendItem color="#22c55e" label="Open airspace"  />
        <span className="ml-auto text-slate-600 italic">Drag to rotate · Scroll to zoom · Click markers</span>
      </div>
    </div>
  );
};

export default GlobeView;
