import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

// ─── Data ──────────────────────────────────────────────────────────────────
const EVENTS = [
  { id:1,  country:'Red Sea',        title:'Houthi Shipping Attacks',       severity:'critical', lat:15.5,  lng:43.5,   desc:'Ongoing drone/missile attacks disrupting global shipping lanes',      category:'Shipping',  __type:'event' },
  { id:2,  country:'Russia/Ukraine', title:'Black Sea Grain Blockade',      severity:'high',     lat:46.5,  lng:32.0,   desc:'Wheat export disruption affecting South Asian food imports',           category:'Trade',     __type:'event' },
  { id:3,  country:'Taiwan Strait',  title:'PLA Naval Exercises',           severity:'high',     lat:24.5,  lng:120.5,  desc:'Semiconductor supply chain risk elevated',                            category:'Political', __type:'event' },
  { id:4,  country:'Iran',           title:'Strait of Hormuz Tensions',     severity:'critical', lat:26.5,  lng:56.5,   desc:'Crude oil tanker movement restricted, India energy imports affected', category:'Energy',    __type:'event' },
  { id:5,  country:'Pakistan',       title:'India-Pakistan Border Closure', severity:'high',     lat:30.0,  lng:70.0,   desc:'Land trade routes suspended',                                        category:'Trade',     __type:'event' },
  { id:6,  country:'Myanmar',        title:'Civil War Escalation',          severity:'moderate', lat:19.0,  lng:96.0,   desc:'Northeast India border instability, ASEAN trade affected',           category:'Political', __type:'event' },
  { id:7,  country:'Sri Lanka',      title:'Port Congestion Crisis',        severity:'moderate', lat:7.8,   lng:80.7,   desc:'Colombo hub delays cascading to Indian transshipment routes',        category:'Shipping',  __type:'event' },
  { id:8,  country:'Bangladesh',     title:'Political Unrest',              severity:'moderate', lat:23.7,  lng:90.4,   desc:'Garment export disruptions, textile supply chain impacted',          category:'Trade',     __type:'event' },
  { id:9,  country:'USA',            title:'Section 301 Tariff Review',     severity:'moderate', lat:38.9,  lng:-77.0,  desc:'Potential tariff hike on Indian pharma and IT exports',              category:'Trade',     __type:'event' },
  { id:10, country:'Belarus',        title:'Fertilizer Export Ban',         severity:'high',     lat:53.9,  lng:27.6,   desc:'Potash and urea supply pressure for Indian agriculture',             category:'Trade',     __type:'event' },
  { id:11, country:'Israel/Gaza',    title:'Middle East Conflict',          severity:'critical', lat:31.5,  lng:34.8,   desc:'Suez alternative routing adding 14 days to EU shipments',           category:'Shipping',  __type:'event' },
  { id:12, country:'China',          title:'South China Sea Dispute',       severity:'high',     lat:15.0,  lng:114.0,  desc:'ASEAN shipping lane risk, India-Vietnam corridor elevated',          category:'Political', __type:'event' },
];

const SEA_ROUTES = [
  { id:'r1', name:'Mumbai → Suez Canal (Red Sea)', risk:'critical', label:'⚠️ DISRUPTED — Houthi attacks, rerouting via Cape',
    points:[[18.93,72.84],[15.5,69.5],[12.5,57.0],[11.8,51.3],[11.5,45.0],[12.6,43.4],[14.5,42.8],[18.5,40.0],[22.0,37.5],[26.0,35.0],[28.5,33.2],[30.0,32.6],[31.3,32.3],[33.5,27.5],[36.5,22.0],[38.0,14.5]] },
  { id:'r2', name:'Mumbai → Singapore (Malacca Strait)', risk:'moderate', label:'⚠️ Elevated — South China Sea tensions',
    points:[[18.93,72.84],[13.0,76.0],[9.0,78.5],[7.8,80.7],[4.0,84.0],[2.0,90.0],[1.26,103.82]] },
  { id:'r3', name:'Mumbai → Cape of Good Hope (Alt)', risk:'low', label:'🔄 Active alternate — Suez disruption diversion, +14 days',
    points:[[18.93,72.84],[12.0,64.0],[5.0,55.0],[-5.0,50.0],[-10.5,43.0],[-18.0,38.0],[-26.0,34.0],[-34.3,18.5],[-35.0,17.5],[-33.0,16.0]] },
  { id:'r4', name:'Mumbai → Strait of Hormuz → Persian Gulf', risk:'critical', label:'⚠️ DISRUPTED — Iranian tensions, tanker movement restricted',
    points:[[18.93,72.84],[21.0,65.5],[23.0,60.5],[24.3,58.3],[25.5,57.5],[26.35,56.45],[26.0,55.0],[25.2,55.3],[25.5,52.5],[26.2,50.6],[27.0,49.5]] },
  { id:'r5', name:'Kolkata → Bay of Bengal → Vietnam', risk:'moderate', label:'⚠️ South China Sea risk',
    points:[[22.5,88.3],[18.0,89.5],[13.0,90.5],[7.0,94.0],[4.0,99.0],[1.26,103.82],[4.0,106.0],[8.0,108.5],[10.8,106.7]] },
  { id:'r6', name:'Kochi → Colombo (Short Corridor)', risk:'stable', label:'✅ Normal — Key India–Sri Lanka corridor',
    points:[[9.93,76.27],[8.5,78.0],[7.8,80.2],[7.18,79.88]] },
  { id:'r7', name:'Chennai → Kolkata (Coastal)', risk:'stable', label:'✅ Normal — East coast coastal shipping',
    points:[[13.08,80.29],[14.5,80.3],[16.5,82.2],[17.72,83.3],[19.5,85.0],[20.3,86.7],[22.5,88.3]] },
  { id:'r8', name:'Mumbai → Rotterdam (via Cape)', risk:'high', label:'⚠️ Rerouting — Suez disruption adds cost',
    points:[[18.93,72.84],[-34.3,18.5],[-30.0,10.0],[-15.0,0.0],[0.0,-5.0],[20.0,-18.0],[38.0,-10.0],[48.0,-6.0],[51.9,4.5]] },
];

const CHOKEPOINTS = [
  { id:'cp1', lat:26.35, lng:56.45, name:'Strait of Hormuz',  risk:'critical', note:'20% of global oil. Iranian tensions restrict tanker movement.' },
  { id:'cp2', lat:30.5,  lng:32.3,  name:'Suez Canal',        risk:'critical', note:'12% of world trade. Houthi attacks via Red Sea — India rerouting via Cape.' },
  { id:'cp3', lat:12.6,  lng:43.4,  name:'Bab-el-Mandeb',    risk:'critical', note:'Yemen conflict blockade. Gateway Red Sea ↔ Indian Ocean.' },
  { id:'cp4', lat:1.26,  lng:103.82,name:'Malacca Strait',    risk:'high',     note:'India-ASEAN bottleneck. 25% of global trade.' },
  { id:'cp5', lat:15.0,  lng:114.0, name:'South China Sea',   risk:'high',     note:'Chinese claims. India-East Asia corridor at risk.' },
  { id:'cp6', lat:-34.3, lng:18.5,  name:'Cape of Good Hope', risk:'low',      note:'Active Suez alternate. +14 days, +$1M/voyage.' },
  { id:'cp7', lat:-8.8,  lng:115.7, name:'Lombok Strait',     risk:'moderate', note:'Alt to Malacca for LNG tankers.' },
];

const PORTS = [
  { id:'p1',  name:'JNPT Mumbai',        lat:18.93, lng:72.94, country:'India',       type:'major',    volume:'72M TEU',  note:'Largest container port in India. 55% of India container traffic.' },
  { id:'p2',  name:'Chennai Port',       lat:13.08, lng:80.29, country:'India',       type:'major',    volume:'22M TEU',  note:'Second largest container port. Key automotive export hub.' },
  { id:'p3',  name:'Mundra Port',        lat:22.84, lng:69.72, country:'India',       type:'major',    volume:'155M MT',  note:'Largest private port. Handles crude oil & coal imports.' },
  { id:'p4',  name:'Haldia / Kolkata',   lat:22.03, lng:88.07, country:'India',       type:'major',    volume:'48M MT',   note:'East India gateway. Bangladesh corridor cargo.' },
  { id:'p5',  name:'Visakhapatnam',      lat:17.72, lng:83.30, country:'India',       type:'major',    volume:'73M MT',   note:'Largest port by volume. Steel & bulk cargo hub.' },
  { id:'p6',  name:'Cochin / Kochi',     lat:9.96,  lng:76.27, country:'India',       type:'major',    volume:'30M MT',   note:'South India transit hub. Growing container terminal.' },
  { id:'p7',  name:'Paradip',            lat:20.32, lng:86.61, country:'India',       type:'major',    volume:'118M MT',  note:'Key coal and iron ore import terminal.' },
  { id:'p8',  name:'Ennore / Kamarajar', lat:13.32, lng:80.32, country:'India',       type:'major',    volume:'35M MT',   note:'Dedicated energy port — coal, LNG, crude oil.' },
  { id:'p9',  name:'Port of Singapore',  lat:1.27,  lng:103.82,country:'Singapore',   type:'hub',      volume:'37M TEU',  note:'World 2nd busiest. Critical India-Asia transshipment hub.' },
  { id:'p10', name:'Port of Shanghai',   lat:30.63, lng:122.06,country:'China',       type:'hub',      volume:'47M TEU',  note:'World busiest port. Key India-China trade gateway.' },
  { id:'p11', name:'Jebel Ali (Dubai)',   lat:25.0,  lng:55.07, country:'UAE',         type:'hub',      volume:'14M TEU',  note:'Middle East hub. Handles 70% of India-Gulf trade.' },
  { id:'p12', name:'Port of Rotterdam',  lat:51.9,  lng:4.48,  country:'Netherlands', type:'hub',      volume:'15M TEU',  note:'Largest European port. India-EU trade gateway.' },
  { id:'p13', name:'Colombo Port',       lat:6.94,  lng:79.87, country:'Sri Lanka',   type:'hub',      volume:'7M TEU',   note:'South Asia hub. 70% of cargo is India transshipment.' },
  { id:'p14', name:'Port Klang',         lat:3.0,   lng:101.4, country:'Malaysia',    type:'hub',      volume:'13M TEU',  note:'Malacca Strait gateway. Key India-ASEAN hub.' },
  { id:'p15', name:'Port Said (Suez)',   lat:31.25, lng:32.30, country:'Egypt',       type:'strategic',volume:'7M TEU',   note:'Suez Canal entry. DISRUPTED — Houthi rerouting.' },
  { id:'p16', name:'Djibouti Port',      lat:11.6,  lng:43.15, country:'Djibouti',    type:'strategic',volume:'400K TEU', note:'Red Sea / Horn of Africa gateway. China base nearby.' },
  { id:'p17', name:'Bandar Abbas',       lat:27.18, lng:56.28, country:'Iran',        type:'strategic',volume:'2M TEU',   note:'Strait of Hormuz. Iranian sanctions affect transit.' },
  { id:'p18', name:'Gwadar Port',        lat:25.12, lng:62.32, country:'Pakistan',    type:'strategic',volume:'growing',  note:'CPEC-funded. China control. Flanks India Arabian Sea.' },
  { id:'p19', name:'Hambantota Port',    lat:6.10,  lng:81.12, country:'Sri Lanka',   type:'strategic',volume:'growing',  note:'Chinese 99yr lease. Flanks Bay of Bengal.' },
  { id:'p20', name:'Port of Busan',      lat:35.1,  lng:129.04,country:'S.Korea',     type:'hub',      volume:'22M TEU',  note:'Northeast Asia hub. India electronics import chain.' },
];

const AIRPORTS = [
  { code:'DEL', name:'Delhi IGI',           lat:28.56, lng:77.09,  status:'open',   note:'Largest Indian airport. 71M pax/yr. Ops normal.' },
  { code:'BOM', name:'Mumbai CSIA',         lat:19.09, lng:72.86,  status:'open',   note:'2nd busiest. 50M pax/yr. Key cargo hub.' },
  { code:'MAA', name:'Chennai MAA',         lat:12.99, lng:80.18,  status:'open',   note:'South India hub. Automotive export cargo.' },
  { code:'BLR', name:'Bengaluru BLR',       lat:13.20, lng:77.71,  status:'open',   note:'Tech corridor hub. IT exports cargo.' },
  { code:'HYD', name:'Hyderabad HYD',       lat:17.24, lng:78.43,  status:'open',   note:'Pharma export hub. Ops normal.' },
  { code:'CCU', name:'Kolkata CCU',         lat:22.65, lng:88.45,  status:'open',   note:'East India hub. Bangladesh corridor.' },
  { code:'ATQ', name:'Amritsar ATQ',        lat:31.71, lng:74.80,  status:'closed', note:'RESTRICTED — India-Pakistan border closure since 2019.' },
  { code:'SXR', name:'Srinagar SXR',        lat:34.00, lng:74.77,  status:'closed', note:'PERIODICALLY CLOSED — J&K security alerts active.' },
  { code:'DXB', name:'Dubai DXB',           lat:25.25, lng:55.36,  status:'hub',    note:'World busiest intl airport. Largest India diaspora transit.' },
  { code:'SIN', name:'Singapore Changi',    lat:1.36,  lng:103.99, status:'hub',    note:'SE Asia hub. India-ASEAN air corridor.' },
  { code:'CMB', name:'Colombo Bandaranaike',lat:7.18,  lng:79.88,  status:'hub',    note:'South Asia hub. India-Lanka corridor.' },
  { code:'DOH', name:'Doha Hamad (Qatar)',  lat:25.27, lng:51.61,  status:'hub',    note:'Gulf hub. Key India-Europe stopover.' },
];

const MIL_BASES = [
  { id:'b1', lat:25.12, lng:62.32, name:'PLA Navy — Gwadar',      country:'China',    color:'#f97316', note:'String-of-pearls node. Flanks India Arabian Sea.' },
  { id:'b2', lat:6.10,  lng:81.12, name:'PLA Navy — Hambantota',  country:'China',    color:'#f97316', note:'Flanks Bay of Bengal. 99-yr lease.' },
  { id:'b3', lat:11.53, lng:43.15, name:'PLA Navy — Djibouti',    country:'China',    color:'#f97316', note:'First overseas PLAN base. Red Sea narrows.' },
  { id:'b4', lat:14.12, lng:93.38, name:'PLA Intel — Coco Islands',country:'China',   color:'#f97316', note:'Signals intel near Andaman & Nicobar.' },
  { id:'b5', lat:24.86, lng:67.01, name:'Pakistan Navy — Karachi', country:'Pakistan', color:'#ef4444', note:'North Arabian Sea fleet base.' },
  { id:'b6', lat:-7.31, lng:72.42, name:'US Navy — Diego Garcia',  country:'USA',      color:'#38bdf8', note:'Allied B-52 base. Indian Ocean power.' },
  { id:'b7', lat:26.21, lng:50.59, name:'US CENTCOM — Bahrain',    country:'USA',      color:'#38bdf8', note:'5th Fleet HQ. Hormuz posture.' },
];

const EEZ_ZONES = [
  { id:'eez1', name:'India EEZ', country:'India', color:'#0d9488', note:"India's 2.37M sq km EEZ. Arabian Sea + Bay of Bengal.",
    points:[[23.5,63.0],[22.0,60.0],[19.5,57.5],[16.5,58.5],[14.0,60.0],[12.0,62.0],[10.0,64.5],[8.5,68.0],[7.5,72.5],[6.5,74.5],[6.0,77.0],[5.5,80.0],[6.0,83.0],[7.0,86.0],[8.5,88.5],[10.5,90.5],[12.5,91.5],[14.0,93.0],[15.5,93.5],[17.5,92.5],[19.0,91.0],[20.5,90.0],[22.0,89.5],[23.0,89.0],[22.5,88.5],[21.5,87.0],[20.0,86.0],[19.0,84.5],[17.0,82.0],[15.0,80.0],[13.0,80.5],[11.0,79.5],[9.5,78.0],[8.0,77.5],[8.5,76.5],[10.0,75.5],[11.5,74.5],[14.0,74.0],[15.5,73.5],[17.0,72.5],[18.9,72.8],[20.5,72.5],[21.5,72.0],[22.5,69.5],[23.0,68.5],[23.5,66.0],[23.5,63.0]] },
  { id:'eez2', name:'China South China Sea Claim', country:'China', color:'#ef4444', note:"Contested 9-dash line. Overlaps ASEAN nations. Affects India-East Asia routes.",
    points:[[20.0,110.0],[18.5,113.0],[16.0,117.0],[14.0,117.5],[12.0,116.5],[10.0,115.0],[8.0,113.5],[5.5,112.0],[4.0,110.0],[4.5,107.5],[6.0,106.0],[8.0,106.5],[10.0,107.0],[12.0,109.0],[14.0,111.0],[16.5,111.0],[18.0,110.5],[20.0,110.0]] },
  { id:'eez3', name:'Pakistan EEZ', country:'Pakistan', color:'#f97316', note:"Pakistan's EEZ in Arabian Sea. CPEC Gwadar expansion flanks India.",
    points:[[23.5,63.0],[24.5,63.0],[25.5,64.0],[26.0,65.5],[25.5,67.0],[25.0,68.5],[24.5,67.5],[24.0,66.0],[23.5,63.0]] },
  { id:'eez4', name:'Sri Lanka EEZ', country:'Sri Lanka', color:'#eab308', note:"Sri Lanka's EEZ — 532,000 sq km. Colombo handles 70% India transshipment.",
    points:[[7.0,78.5],[8.5,78.0],[10.0,79.0],[10.5,81.0],[10.0,82.5],[8.5,83.5],[7.0,83.0],[5.5,82.0],[4.5,80.5],[5.0,78.5],[6.0,78.0],[7.0,78.5]] },
  { id:'eez5', name:'Australia EEZ (Indian Ocean)', country:'Australia', color:'#22c55e', note:"Australia EEZ — Quad partner. Controls southern Indian Ocean LNG lanes.",
    points:[[-22.0,95.0],[-18.0,110.0],[-18.0,120.0],[-22.0,130.0],[-28.0,130.0],[-32.0,124.0],[-34.0,115.0],[-35.0,110.0],[-34.0,100.0],[-30.0,95.0],[-25.0,93.0],[-22.0,95.0]] },
];

const RISK_C = { critical:0xef4444, high:0xf97316, moderate:0xeab308, stable:0x22c55e, low:0x22c55e };
const RISK_H = { critical:'#ef4444', high:'#f97316', moderate:'#eab308', stable:'#22c55e', low:'#22c55e' };

// ─── Helper ─────────────────────────────────────────────────────────────────
function latLngToVec3(lat, lng, r = 1.02) {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(r * Math.sin(phi) * Math.cos(theta)),
     (r * Math.cos(phi)),
     (r * Math.sin(phi) * Math.sin(theta))
  );
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

// ─── Component ──────────────────────────────────────────────────────────────
const GlobeView = ({ onEventSelect, activeFilter = 'All' }) => {
  const mountRef      = useRef(null);
  const rendererRef   = useRef(null);
  const sceneRef      = useRef(null);
  const cameraRef     = useRef(null);
  const globeMeshRef  = useRef(null);
  const frameRef      = useRef(null);
  const isDragging    = useRef(false);
  const prevMouse     = useRef({ x: 0, y: 0 });
  const tiltAngle     = useRef(0);
  const autoAngle     = useRef(0);
  const layerObjects  = useRef([]);
  const clickables    = useRef([]);
  const initDone      = useRef(false);
  const touchRef      = useRef([]);

  const [ready,    setReady]    = useState(false);
  const [selected, setSelected] = useState(null);
  const [tooltip,  setTooltip]  = useState(null);

  const [showEvents,      setShowEvents]      = useState(true);
  const [showRoutes,      setShowRoutes]      = useState(true);
  const [showChokepoints, setShowChokepoints] = useState(true);
  const [showBases,       setShowBases]       = useState(false);
  const [showAirspace,    setShowAirspace]    = useState(false);
  const [showAirports,    setShowAirports]    = useState(false);
  const [showPorts,       setShowPorts]       = useState(false);
  const [showEEZ,         setShowEEZ]         = useState(false);

  // Sync layer visibility with dashboard filter pill
  useEffect(() => {
    if (activeFilter === 'All')         { setShowEvents(true);  setShowRoutes(true);  setShowChokepoints(true);  setShowBases(false); setShowAirspace(false); setShowAirports(false); setShowPorts(false); setShowEEZ(false); }
    if (activeFilter === 'Shipping')    { setShowEvents(true);  setShowRoutes(true);  setShowChokepoints(true);  setShowBases(false); setShowAirspace(false); setShowPorts(true); }
    if (activeFilter === 'Routes')      { setShowEvents(false); setShowRoutes(true);  setShowChokepoints(true);  setShowPorts(true); }
    if (activeFilter === 'Chokepoints') { setShowEvents(false); setShowRoutes(false); setShowChokepoints(true); }
    if (activeFilter === 'Mil. Bases')  { setShowEvents(false); setShowRoutes(false); setShowChokepoints(false); setShowBases(true); }
    if (activeFilter === 'Airspace')    { setShowEvents(false); setShowRoutes(false); setShowChokepoints(false); setShowAirspace(true); setShowAirports(true); }
    if (activeFilter === 'EEZ')         { setShowEvents(false); setShowRoutes(false); setShowChokepoints(false); setShowEEZ(true); }
    if (['Trade','Energy','Political'].includes(activeFilter)) { setShowEvents(true); setShowRoutes(false); setShowChokepoints(false); }
    if (activeFilter === 'Ports')       { setShowEvents(false); setShowRoutes(false); setShowChokepoints(false); setShowPorts(true); }
  }, [activeFilter]);

  // ── Init (once, when container has real dimensions) ──────────────────────
  useEffect(() => {
    if (initDone.current) return;
    const mount = mountRef.current;
    if (!mount) return;

    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width === 0 || height === 0) return;
      if (initDone.current) return;
      initDone.current = true;
      ro.disconnect();

      // Scene + Camera
      const scene    = new THREE.Scene();
      scene.background = new THREE.Color(0x03080f);
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(0, 0, 2.5);
      cameraRef.current = camera;

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x03080f, 1);
      mount.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Globe
      const loader = new THREE.TextureLoader();
      const globe = new THREE.Mesh(
        new THREE.SphereGeometry(1, 64, 64),
        new THREE.MeshPhongMaterial({
          map: loader.load('https://unpkg.com/three-globe/example/img/earth-night.jpg'),
          specular: new THREE.Color(0x333333),
          shininess: 15,
        })
      );
      globe.name = 'globe';
      scene.add(globe);
      globeMeshRef.current = globe;

      // Atmosphere glow
      scene.add(new THREE.Mesh(
        new THREE.SphereGeometry(1.015, 64, 64),
        new THREE.MeshBasicMaterial({ color: 0x0d9488, transparent: true, opacity: 0.06, side: THREE.BackSide })
      ));

      // Stars
      const starPos = new Float32Array(2000 * 3);
      for (let i = 0; i < 2000; i++) {
        const t = Math.random() * Math.PI * 2;
        const p = Math.acos(2 * Math.random() - 1);
        const r = 80;
        starPos[i*3]     = r * Math.sin(p) * Math.cos(t);
        starPos[i*3 + 1] = r * Math.cos(p);
        starPos[i*3 + 2] = r * Math.sin(p) * Math.sin(t);
      }
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, transparent: true, opacity: 0.5 })));

      // Lighting
      scene.add(new THREE.AmbientLight(0x404060, 0.8));
      const dir = new THREE.DirectionalLight(0xffffff, 1.2);
      dir.position.set(5, 3, 5);
      scene.add(dir);

      // India home marker (always visible)
      const indiaPos = latLngToVec3(20.5, 78.9, 1.025);
      const indiaMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.022, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x0d9488 })
      );
      indiaMesh.position.copy(indiaPos);
      indiaMesh.userData = { name: '🇮🇳 India — Home', note: 'GeoTrade Intelligence monitoring center', __home: true };
      globe.add(indiaMesh);
      clickables.current.push(indiaMesh);

      const indiaRing = new THREE.Mesh(
        new THREE.RingGeometry(0.03, 0.042, 32),
        new THREE.MeshBasicMaterial({ color: 0x0d9488, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
      );
      indiaRing.position.copy(indiaPos);
      indiaRing.lookAt(new THREE.Vector3(0, 0, 0));
      indiaRing.rotateX(Math.PI);
      globe.add(indiaRing);

      // Set initial rotation to center India (lng≈79°E) facing camera.
      // Derived: for India to maximise +Z after Y-rotation, angle ≈ 2.95 rad
      autoAngle.current = 2.95;

      // Animation
      const animate = () => {
        frameRef.current = requestAnimationFrame(animate);
        if (!isDragging.current) autoAngle.current += 0.0015;
        globe.rotation.y = autoAngle.current;
        globe.rotation.x = tiltAngle.current;
        renderer.render(scene, camera);
      };
      animate();
      setReady(true);
    });
    ro.observe(mount);

    return () => {
      ro.disconnect();
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        try { rendererRef.current.forceContextLoss(); } catch (_) {}
      }
      if (sceneRef.current) {
        sceneRef.current.traverse(obj => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
            else obj.material.dispose();
          }
        });
      }
      if (mount) mount.innerHTML = '';
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Resize handler ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      const mount = mountRef.current;
      if (!mount || !rendererRef.current || !cameraRef.current) return;
      const w = mount.clientWidth, h = mount.clientHeight;
      rendererRef.current.setSize(w, h);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Mouse / Touch interaction ─────────────────────────────────────────────
  useEffect(() => {
    if (!ready) return;
    const el = rendererRef.current?.domElement;
    if (!el) return;

    const onDown = (e) => { isDragging.current = true; prevMouse.current = { x: e.clientX, y: e.clientY }; };
    const onUp   = ()  => { isDragging.current = false; };
    const onMove = (e) => {
      if (!isDragging.current) return;
      const dx = e.clientX - prevMouse.current.x;
      const dy = e.clientY - prevMouse.current.y;
      prevMouse.current = { x: e.clientX, y: e.clientY };
      autoAngle.current += dx * 0.005;
      tiltAngle.current  = clamp(tiltAngle.current + dy * 0.003, -0.5, 0.5);
    };
    const onWheel = (e) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      cameraRef.current.position.z = clamp(cameraRef.current.position.z + e.deltaY * 0.001, 1.4, 4.5);
    };

    // Touch
    const onTouchStart = (e) => {
      touchRef.current = Array.from(e.touches);
      if (e.touches.length === 1) { isDragging.current = true; prevMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }
    };
    const onTouchMove = (e) => {
      if (e.touches.length === 1 && isDragging.current) {
        const dx = e.touches[0].clientX - prevMouse.current.x;
        const dy = e.touches[0].clientY - prevMouse.current.y;
        prevMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        autoAngle.current += dx * 0.005;
        tiltAngle.current  = clamp(tiltAngle.current + dy * 0.003, -0.5, 0.5);
      } else if (e.touches.length === 2 && touchRef.current.length === 2) {
        const prev = Math.hypot(touchRef.current[0].clientX - touchRef.current[1].clientX, touchRef.current[0].clientY - touchRef.current[1].clientY);
        const curr = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        if (cameraRef.current) cameraRef.current.position.z = clamp(cameraRef.current.position.z - (curr - prev) * 0.005, 1.4, 4.5);
        touchRef.current = Array.from(e.touches);
      }
    };
    const onTouchEnd = () => { isDragging.current = false; touchRef.current = []; };

    el.addEventListener('mousedown',   onDown);
    el.addEventListener('mousemove',   onMove);
    el.addEventListener('mouseup',     onUp);
    el.addEventListener('mouseleave',  onUp);
    el.addEventListener('wheel',       onWheel, { passive: false });
    el.addEventListener('touchstart',  onTouchStart, { passive: true });
    el.addEventListener('touchmove',   onTouchMove,  { passive: true });
    el.addEventListener('touchend',    onTouchEnd);

    return () => {
      el.removeEventListener('mousedown',  onDown);
      el.removeEventListener('mousemove',  onMove);
      el.removeEventListener('mouseup',    onUp);
      el.removeEventListener('mouseleave', onUp);
      el.removeEventListener('wheel',      onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove',  onTouchMove);
      el.removeEventListener('touchend',   onTouchEnd);
    };
  }, [ready]);

  // ── Raycasting (hover + click) ────────────────────────────────────────────
  useEffect(() => {
    if (!ready) return;
    const el    = rendererRef.current?.domElement;
    const rc    = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    if (!el) return;

    const getHit = (clientX, clientY) => {
      const rect = el.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width)  *  2 - 1;
      mouse.y = ((clientY - rect.top)  / rect.height) * -2 + 1;
      rc.setFromCamera(mouse, cameraRef.current);
      const hits = rc.intersectObjects(clickables.current, false);
      return hits.length > 0 ? hits[0] : null;
    };

    const onHover = (e) => {
      const hit = getHit(e.clientX, e.clientY);
      if (hit) {
        const d = hit.object.userData;
        setTooltip({ x: e.clientX, y: e.clientY, text: d.name || d.title || d.code || '' });
        el.style.cursor = 'pointer';
      } else {
        setTooltip(null);
        el.style.cursor = '';
      }
    };
    const onClick = (e) => {
      if (isDragging.current) return;
      const hit = getHit(e.clientX, e.clientY);
      if (hit) {
        const d = hit.object.userData;
        setSelected(d);
        if (d.__type === 'event' && onEventSelect) onEventSelect(d);
      }
    };

    el.addEventListener('pointermove', onHover);
    el.addEventListener('click',       onClick);
    return () => {
      el.removeEventListener('pointermove', onHover);
      el.removeEventListener('click',       onClick);
    };
  }, [ready, onEventSelect]);

  // ── Rebuild layers when visibility toggles change ─────────────────────────
  useEffect(() => {
    if (!ready || !globeMeshRef.current || !sceneRef.current) return;
    const globe = globeMeshRef.current;
    const scene = sceneRef.current;

    // Remove old
    layerObjects.current.forEach(obj => {
      globe.remove(obj);
      scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });
    layerObjects.current = [];
    // Reset clickables (keep India home marker at index 0)
    clickables.current = clickables.current.filter(o => o.userData.__home);

    const add = (obj, parent = globe, clickable = false) => {
      parent.add(obj);
      layerObjects.current.push(obj);
      if (clickable) clickables.current.push(obj);
    };

    // ── EVENTS ────────────────────────────────────────────────────────────
    if (showEvents) {
      EVENTS.forEach(ev => {
        const pos = latLngToVec3(ev.lat, ev.lng, 1.02);
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.016, 8, 8),
          new THREE.MeshBasicMaterial({ color: RISK_C[ev.severity] || 0xffffff })
        );
        sphere.position.copy(pos);
        sphere.userData = { ...ev };
        add(sphere, globe, true);

        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.02, 0.028, 16),
          new THREE.MeshBasicMaterial({ color: RISK_C[ev.severity], transparent: true, opacity: 0.4, side: THREE.DoubleSide })
        );
        ring.position.copy(pos);
        ring.lookAt(new THREE.Vector3(0, 0, 0));
        ring.rotateX(Math.PI);
        add(ring);
      });
    }

    // ── SEA ROUTES ────────────────────────────────────────────────────────
    // Routes use ALL waypoints as CatmullRomCurve3 control points at radius
    // 1.04 (above surface). Waypoints are AIS-sourced ocean positions, so
    // the spline stays over ocean and never cuts through land.
    if (showRoutes) {
      SEA_ROUTES.forEach(route => {
        const color = RISK_C[route.risk] || 0x38bdf8;
        const pts   = route.points;

        // Build control points: each waypoint sits at r=1.04 above the surface.
        // Add a slightly elevated intermediate between every pair so the curve
        // arcs gently above the globe surface instead of dipping through it.
        const controlPts = [];
        for (let i = 0; i < pts.length; i++) {
          controlPts.push(latLngToVec3(pts[i][0], pts[i][1], 1.04));
          if (i < pts.length - 1) {
            // Midpoint at r=1.055 to ensure the arc stays above surface
            const midLat = (pts[i][0] + pts[i+1][0]) / 2;
            const midLng = (pts[i][1] + pts[i+1][1]) / 2;
            controlPts.push(latLngToVec3(midLat, midLng, 1.055));
          }
        }

        const curve    = new THREE.CatmullRomCurve3(controlPts);
        const segments = Math.max(controlPts.length * 6, 48);
        const tube = new THREE.Mesh(
          new THREE.TubeGeometry(curve, segments, 0.0025, 5, false),
          new THREE.MeshBasicMaterial({ color })
        );
        tube.userData = { name: route.name, label: route.label, risk: route.risk, note: route.label };
        add(tube, globe, true);

        if (route.risk === 'critical' || route.risk === 'high') {
          const glow = new THREE.Mesh(
            new THREE.TubeGeometry(curve, segments, 0.0042, 5, false),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.20 })
          );
          add(glow);
        }
      });
    }

    // ── CHOKEPOINTS ───────────────────────────────────────────────────────
    if (showChokepoints) {
      CHOKEPOINTS.forEach(cp => {
        const pos   = latLngToVec3(cp.lat, cp.lng, 1.04);
        const color = RISK_C[cp.risk] || 0xf97316;
        const oct   = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.022),
          new THREE.MeshBasicMaterial({ color })
        );
        oct.position.copy(pos);
        oct.userData = { ...cp };
        add(oct, globe, true);

        const wire = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.035),
          new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.45 })
        );
        wire.position.copy(pos);
        add(wire);
      });
    }

    // ── PORTS ─────────────────────────────────────────────────────────────
    if (showPorts) {
      PORTS.forEach(p => {
        const pos   = latLngToVec3(p.lat, p.lng, 1.03);
        const color = p.type === 'major' ? 0x0d9488 : p.type === 'hub' ? 0x38bdf8 : 0xf97316;
        const box   = new THREE.Mesh(
          new THREE.BoxGeometry(0.014, 0.014, 0.014),
          new THREE.MeshBasicMaterial({ color })
        );
        box.position.copy(pos);
        box.lookAt(new THREE.Vector3(0, 0, 0));
        box.userData = { ...p };
        add(box, globe, true);
      });
    }

    // ── AIRPORTS ──────────────────────────────────────────────────────────
    if (showAirports) {
      AIRPORTS.forEach(ap => {
        const pos   = latLngToVec3(ap.lat, ap.lng, 1.03);
        const color = ap.status === 'open' ? 0x22c55e : ap.status === 'closed' ? 0xef4444 : 0x0d9488;
        const cone  = new THREE.Mesh(
          new THREE.ConeGeometry(0.012, 0.018, 4),
          new THREE.MeshBasicMaterial({ color })
        );
        cone.position.copy(pos);
        cone.lookAt(new THREE.Vector3(0, 0, 0));
        cone.rotateX(Math.PI / 2);
        cone.userData = { ...ap, name: ap.code + ' — ' + ap.name };
        add(cone, globe, true);

        if (ap.status === 'closed') {
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(0.015, 0.020, 16),
            new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
          );
          ring.position.copy(pos);
          ring.lookAt(new THREE.Vector3(0, 0, 0));
          ring.rotateX(Math.PI);
          add(ring);
        }
      });
    }

    // ── MILITARY BASES ────────────────────────────────────────────────────
    if (showBases) {
      MIL_BASES.forEach(b => {
        const pos   = latLngToVec3(b.lat, b.lng, 1.028);
        const color = parseInt(b.color.replace('#', ''), 16);
        const star  = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.018),
          new THREE.MeshBasicMaterial({ color, wireframe: false })
        );
        star.position.copy(pos);
        star.userData = { ...b };
        add(star, globe, true);

        const wire = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.026),
          new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.5 })
        );
        wire.position.copy(pos);
        add(wire);
      });
    }

    // ── EEZ ZONES ─────────────────────────────────────────────────────────
    if (showEEZ) {
      EEZ_ZONES.forEach(eez => {
        const hexColor = parseInt(eez.color.replace('#', ''), 16);
        // 3 concentric boundary lines at slightly different radii for glow
        [1.010, 1.011, 1.013].forEach((r, idx) => {
          const vpts = eez.points.map(([lat, lng]) => latLngToVec3(lat, lng, r));
          vpts.push(vpts[0].clone()); // close loop
          const geo  = new THREE.BufferGeometry().setFromPoints(vpts);
          const line = new THREE.Line(
            geo,
            new THREE.LineBasicMaterial({ color: hexColor, transparent: true, opacity: 0.7 - idx * 0.2 })
          );
          add(line, globe);
        });

        // Centroid label sphere
        const sumLat = eez.points.reduce((s, p) => s + p[0], 0) / eez.points.length;
        const sumLng = eez.points.reduce((s, p) => s + p[1], 0) / eez.points.length;
        const cent = latLngToVec3(sumLat, sumLng, 1.025);
        const dot  = new THREE.Mesh(
          new THREE.SphereGeometry(0.008, 8, 8),
          new THREE.MeshBasicMaterial({ color: hexColor })
        );
        dot.position.copy(cent);
        dot.userData = { name: eez.name, note: eez.note, country: eez.country };
        add(dot, globe, true);
      });
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, showEvents, showRoutes, showChokepoints, showBases, showAirspace, showAirports, showPorts, showEEZ]);

  // ── Resize observer after ready ───────────────────────────────────────────
  useEffect(() => {
    if (!ready) return;
    const mount = mountRef.current;
    if (!mount) return;
    const ro = new ResizeObserver(() => {
      if (!rendererRef.current || !cameraRef.current) return;
      const w = mount.clientWidth, h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      rendererRef.current.setSize(w, h);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
    });
    ro.observe(mount);
    return () => ro.disconnect();
  }, [ready]);

  // ── Render ────────────────────────────────────────────────────────────────
  const toggleBtns = [
    { icon:'⚡', label:'Events',      active:showEvents,      set:setShowEvents,      color:'#ef4444' },
    { icon:'🚢', label:'Routes',      active:showRoutes,      set:setShowRoutes,      color:'#38bdf8' },
    { icon:'⚓', label:'Chokepoints', active:showChokepoints, set:setShowChokepoints, color:'#f97316' },
    { icon:'🏭', label:'Ports',       active:showPorts,       set:setShowPorts,       color:'#0d9488' },
    { icon:'✈',  label:'Airports',    active:showAirports,    set:setShowAirports,    color:'#22c55e' },
    { icon:'⚔️', label:'Mil. Bases',  active:showBases,       set:setShowBases,       color:'#f43f5e' },
    { icon:'🌊', label:'EEZ',         active:showEEZ,         set:setShowEEZ,         color:'#0d9488' },
  ];

  return (
    <div style={{ position:'relative', width:'100%', height:'100%', background:'#03080f', minHeight:'500px' }}>

      {/* Loading */}
      {!ready && (
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#03080f', zIndex:40 }}>
          <div style={{ fontSize:'48px', animation:'spin 2s linear infinite' }}>🌍</div>
          <div style={{ color:'#64748b', fontSize:'13px', marginTop:'12px' }}>Loading 3D Globe…</div>
          <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* Layer toggles */}
      <div style={{ position:'absolute', top:'8px', left:'8px', display:'flex', flexWrap:'wrap', gap:'6px', maxWidth:'calc(100% - 270px)', zIndex:50 }}>
        {toggleBtns.map(btn => (
          <button key={btn.label}
            onClick={() => btn.set(v => !v)}
            style={{
              padding:'4px 10px', borderRadius:'8px', fontSize:'11px', fontWeight:600,
              border:`1px solid ${btn.active ? btn.color : 'rgba(255,255,255,0.08)'}`,
              background: btn.active ? `${btn.color}22` : 'rgba(15,23,42,0.85)',
              color: btn.active ? btn.color : '#64748b',
              cursor:'pointer', display:'flex', alignItems:'center', gap:'5px',
              boxShadow: btn.active ? `0 0 8px ${btn.color}44` : 'none',
              backdropFilter:'blur(8px)',
              transition:'all 0.2s',
            }}>
            {btn.icon} {btn.label}
          </button>
        ))}
      </div>

      {/* Info panel */}
      {selected && (
        <div style={{ position:'absolute', top:'8px', right:'8px', width:'240px', background:'rgba(13,24,37,0.97)', border:'1px solid #0d9488', borderRadius:'12px', padding:'12px', zIndex:50, fontSize:'11px', color:'#e2e8f0' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
            <span style={{ fontWeight:700, color:'white', flex:1, paddingRight:'8px', lineHeight:1.3 }}>{selected.name || selected.title || selected.code}</span>
            <button onClick={() => setSelected(null)} style={{ color:'#64748b', cursor:'pointer', background:'none', border:'none', fontSize:'16px', padding:0, lineHeight:1 }}>✕</button>
          </div>
          <div style={{ color: RISK_H[selected.risk || selected.severity] || '#94a3b8', fontSize:'10px', fontWeight:600, marginBottom:'6px' }}>
            {(selected.risk || selected.severity || selected.status || '').toUpperCase()}
            {selected.country ? ` · ${selected.country}` : ''}
          </div>
          <div style={{ color:'#94a3b8', lineHeight:1.5 }}>
            {selected.note || selected.desc || selected.label || ''}
          </div>
          {selected.volume && <div style={{ color:'#64748b', fontSize:'10px', marginTop:'6px' }}>Volume: {selected.volume}</div>}
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div style={{ position:'fixed', left: tooltip.x + 14, top: tooltip.y - 24, background:'rgba(13,24,37,0.95)', border:'1px solid #0d9488', borderRadius:'6px', padding:'5px 9px', fontSize:'10px', color:'#e2e8f0', pointerEvents:'none', zIndex:9999, maxWidth:'200px', whiteSpace:'nowrap' }}>
          {tooltip.text}
        </div>
      )}

      {/* Globe canvas */}
      <div ref={mountRef} style={{ width:'100%', height:'100%', minHeight:'500px' }} />

      {/* Legend bar */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'6px 12px', background:'rgba(5,13,24,0.9)', borderTop:'1px solid #1a2d42', display:'flex', flexWrap:'wrap', gap:'12px', fontSize:'10px', color:'#64748b', fontWeight:600, zIndex:50 }}>
        <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><span style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#ef4444', display:'inline-block' }}></span>Critical</span>
        <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><span style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#f97316', display:'inline-block' }}></span>High</span>
        <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><span style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#eab308', display:'inline-block' }}></span>Moderate</span>
        <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><span style={{ width:'12px', height:'2px', background:'#38bdf8', display:'inline-block', borderRadius:'1px' }}></span>Sea route</span>
        <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><span style={{ width:'12px', height:'2px', background:'#ef4444', display:'inline-block', borderRadius:'1px' }}></span>Disrupted</span>
        <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><span style={{ width:'8px', height:'8px', background:'#0d9488', display:'inline-block', borderRadius:'2px' }}></span>Major port</span>
        <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><span style={{ width:'8px', height:'8px', background:'#38bdf8', display:'inline-block', borderRadius:'2px' }}></span>Hub port</span>
        <span style={{ marginLeft:'auto', color:'#334155', fontStyle:'italic' }}>Drag · Scroll zoom · Click markers</span>
      </div>
    </div>
  );
};

export default GlobeView;
