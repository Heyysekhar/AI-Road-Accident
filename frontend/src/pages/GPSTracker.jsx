import React, { useState, useEffect, useRef } from 'react';

const API        = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const RISK_COLOR = { CRITICAL:'#dc2626', HIGH:'#ef4444', MEDIUM:'#f59e0b', LOW:'#22c55e' };

function haversine(lat1,lon1,lat2,lon2){
  const R=6371, toR=Math.PI/180;
  const dLat=(lat2-lat1)*toR, dLon=(lon2-lon1)*toR;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*toR)*Math.cos(lat2*toR)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

const ZONES=[
  {id:1,name:'NH-8 Gurgaon Toll',      lat:28.4595,lng:77.0266,risk:'CRITICAL',radius:2.0},
  {id:2,name:'Yamuna Expressway',      lat:28.3183,lng:77.4375,risk:'HIGH',    radius:3.0},
  {id:3,name:'Mumbai-Pune Exp',        lat:18.6725,lng:73.5120,risk:'CRITICAL',radius:4.0},
  {id:4,name:'Bangalore Hosur Road',   lat:12.8445,lng:77.6610,risk:'MEDIUM',  radius:1.5},
  {id:5,name:'Hyderabad ORR',          lat:17.4935,lng:78.3087,risk:'HIGH',    radius:3.0},
  {id:6,name:'Chennai OMR',            lat:12.8996,lng:80.2209,risk:'MEDIUM',  radius:2.0},
];

/* ── Leaflet mini-map (single vehicle focus) ──────────────────────────── */
function VehicleMap({ pos, zones, trail }) {
  if (!pos) return (
    <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center',
                  justifyContent:'center', flexDirection:'column', color:'#4b5563' }}>
      <div style={{ fontSize:40 }}>📍</div>
      <div style={{ marginTop:10, fontSize:14 }}>Enable GPS to see live map</div>
    </div>
  );

  const trailJs = trail.map(p=>`[${p.lat},${p.lng}]`).join(',');
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#m{margin:0;padding:0;width:100%;height:100%;}</style>
</head><body><div id="m"></div><script>
var map=L.map('m',{center:[${pos.lat},${pos.lng}],zoom:12});
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  {attribution:'© OSM © CARTO',maxZoom:18}).addTo(map);

/* Zones */
var RC=${JSON.stringify(RISK_COLOR)};
${JSON.stringify(zones)}.forEach(function(z){
  var c=RC[z.risk]||'#ef4444';
  L.circle([z.lat,z.lng],{radius:z.radius*1000,color:c,fillColor:c,
    fillOpacity:0.15,weight:1.5}).addTo(map)
   .bindPopup('<b style="color:'+c+'">'+z.name+'</b><br>Risk: '+z.risk);
});

/* Trail */
var trail=[${trailJs}];
if(trail.length>1)L.polyline(trail,{color:'#3b82f6',weight:2,opacity:0.6}).addTo(map);
trail.forEach(function(p,i){
  if(i<trail.length-1)L.circleMarker(p,{radius:3,fillColor:'#3b82f680',color:'none',fillOpacity:1}).addTo(map);
});

/* Current position */
var icon=L.divIcon({className:'',
  html:'<div style="width:20px;height:20px;background:#3b82f6;border:3px solid #fff;'+
    'border-radius:50%;box-shadow:0 0 18px #3b82f6;"></div>',
  iconSize:[20,20],iconAnchor:[10,10]});
L.marker([${pos.lat},${pos.lng}],{icon:icon}).addTo(map)
 .bindPopup('<b style="color:#3b82f6">Your Vehicle</b><br>Speed: ${pos.speed||0} km/h').openPopup();
</script></body></html>`;

  return <iframe srcDoc={html} title="gps"
    style={{ width:'100%', height:'100%', border:'none', borderRadius:12 }}/>;
}

/* ─────────────────────────────────────────────────────────────────────── */
export default function GPSTracker() {
  const [tracking,  setTracking]  = useState(false);
  const [pos,       setPos]       = useState(null);
  const [trail,     setTrail]     = useState([]);
  const [nearZones, setNearZones] = useState([]);
  const [speed,     setSpeed]     = useState(0);
  const [heading,   setHeading]   = useState(0);
  const [mapKey,    setMapKey]    = useState(0);
  const [alerts,    setAlerts]    = useState([]);
  const [elapsed,   setElapsed]   = useState(0);
  const [distance,  setDistance]  = useState(0);
  const wRef     = useRef(null);
  const timerRef = useRef(null);
  const startRef = useRef(null);
  const prevPos  = useRef(null);

  const startGPS = () => {
    if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
    setTracking(true); setTrail([]); setDistance(0); setElapsed(0);
    startRef.current = Date.now();
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now()-startRef.current)/1000)), 1000);

    wRef.current = navigator.geolocation.watchPosition(
      p => {
        const { latitude:lat, longitude:lng, speed:spd, heading:hdg } = p.coords;
        const newPos = { lat, lng, speed:Math.round((spd||0)*3.6) };
        setPos(newPos); setSpeed(newPos.speed); setHeading(Math.round(hdg||0));
        setTrail(t => { const n=[...t, {lat,lng}]; return n.slice(-80); });
        if (prevPos.current) {
          const d = haversine(prevPos.current.lat, prevPos.current.lng, lat, lng);
          setDistance(x => +(x+d).toFixed(2));
        }
        prevPos.current = {lat, lng};
        checkZones(lat, lng);
        setMapKey(k=>k+1);
      },
      err => { console.warn(err); stopGPS(); },
      { enableHighAccuracy:true, maximumAge:1000, timeout:10000 }
    );
  };

  const stopGPS = () => {
    setTracking(false);
    navigator.geolocation.clearWatch(wRef.current);
    clearInterval(timerRef.current);
  };

  useEffect(() => () => { navigator.geolocation.clearWatch(wRef.current); clearInterval(timerRef.current); }, []);

  const checkZones = (lat, lng) => {
    const nearby = ZONES.map(z=>({
      ...z, dist:+haversine(lat,lng,z.lat,z.lng).toFixed(2)
    })).filter(z=>z.dist<15).sort((a,b)=>a.dist-b.dist);
    setNearZones(nearby);
    nearby.forEach(z => {
      if (z.dist < z.radius) {
        const msg = `⚠️ Entering ${z.risk} zone: ${z.name}`;
        setAlerts(a => [{ id:Date.now()+z.id, msg, risk:z.risk,
          time:new Date().toLocaleTimeString() }, ...a].slice(0,10));
      }
    });
  };

  /* demo simulation when real GPS not available */
  const startDemo = () => {
    setTracking(true); setTrail([]); setDistance(0); setElapsed(0);
    startRef.current = Date.now();
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now()-startRef.current)/1000)), 1000);
    let lat=28.615, lng=77.205, step=0;
    const sim = setInterval(() => {
      lat += (Math.random()-0.48)*0.002;
      lng += (Math.random()-0.48)*0.002;
      const spd = 40+Math.floor(Math.random()*60);
      const newPos = {lat, lng, speed:spd};
      setPos(newPos); setSpeed(spd);
      setTrail(t=>[...t,{lat,lng}].slice(-80));
      setDistance(x=>+(x+0.15).toFixed(2));
      checkZones(lat,lng);
      setMapKey(k=>k+1);
      step++;
    }, 2000);
    wRef.current = { sim, clear: ()=>clearInterval(sim) };
  };
  const stopDemo = () => {
    setTracking(false);
    wRef.current?.sim && clearInterval(wRef.current.sim);
    wRef.current?.clear?.();
    clearInterval(timerRef.current);
  };

  const fmt = s => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const compass = ['N','NE','E','SE','S','SW','W','NW'][Math.round(heading/45)%8];

  return (
    <div>
      <h1 style={{ fontSize:24, fontWeight:700, marginBottom:20 }}>📡 GPS Live Tracker</h1>

      {/* Stats bar */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
        {[
          {icon:'🚗', label:'Speed',    val:`${speed} km/h`, color:'#3b82f6'},
          {icon:'📍', label:'Distance', val:`${distance} km`,color:'#22c55e'},
          {icon:'⏱️', label:'Duration', val:fmt(elapsed),   color:'#f59e0b'},
          {icon:'🧭', label:'Heading',  val:compass||'—',   color:'#8b5cf6'},
        ].map(s=>(
          <div key={s.label} style={{ background:'#111827', borderRadius:10,
            padding:'14px 16px', borderLeft:`3px solid ${s.color}` }}>
            <div style={{ fontSize:11, color:'#6b7280', marginBottom:4 }}>{s.icon} {s.label}</div>
            <div style={{ fontSize:22, fontWeight:700, color:s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:16 }}>

        {/* Map */}
        <div style={{ background:'#111827', borderRadius:14, overflow:'hidden', height:480 }}>
          <VehicleMap key={mapKey} pos={pos} zones={ZONES} trail={trail} />
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

          {/* Controls */}
          <div style={C.card}>
            <div style={C.sh}>🎮 TRACKING CONTROLS</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <button onClick={tracking ? stopGPS : startGPS} style={{
                padding:'10px', borderRadius:8, border:'none', cursor:'pointer',
                fontWeight:700, fontSize:13,
                background: tracking ? '#7f1d1d' : '#1e3a8a', color:'#fff' }}>
                {tracking ? '⏹ Stop GPS' : '📍 Start GPS Tracking'}
              </button>
              <button onClick={tracking ? stopDemo : startDemo} style={{
                padding:'10px', borderRadius:8, border:'none', cursor:'pointer',
                fontWeight:700, fontSize:13,
                background: tracking ? '#374151' : '#14532d', color:'#fff' }}>
                {tracking ? '⏹ Stop Demo' : '🎭 Start Demo Mode'}
              </button>
            </div>
            {pos && (
              <div style={{ marginTop:12, background:'#0a0e1a', borderRadius:8, padding:10, fontSize:12 }}>
                <div style={{ color:'#3b82f6', fontWeight:700, marginBottom:4 }}>📍 Live Coordinates</div>
                <div style={{ color:'#9ca3af' }}>Lat: {pos.lat.toFixed(6)}</div>
                <div style={{ color:'#9ca3af' }}>Lng: {pos.lng.toFixed(6)}</div>
              </div>
            )}
          </div>

          {/* Nearby zones */}
          <div style={C.card}>
            <div style={C.sh}>⚠️ NEARBY RISK ZONES</div>
            {nearZones.length===0 ? (
              <div style={{ color:'#4b5563', fontSize:12, textAlign:'center', padding:'12px 0' }}>
                No zones detected nearby</div>
            ) : nearZones.slice(0,4).map((z,i)=>(
              <div key={i} style={{ padding:'9px', background:'#0a0e1a', borderRadius:8,
                marginBottom:7, borderLeft:`3px solid ${RISK_COLOR[z.risk]}` }}>
                <div style={{ fontWeight:600, fontSize:12 }}>{z.name}</div>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:3 }}>
                  <span style={{ color:RISK_COLOR[z.risk], fontSize:11, fontWeight:700 }}>{z.risk}</span>
                  <span style={{ color:'#9ca3af', fontSize:11 }}>{z.dist} km</span>
                </div>
              </div>
            ))}
          </div>

          {/* Alerts */}
          <div style={{ ...C.card, overflowY:'auto', maxHeight:180 }}>
            <div style={C.sh}>🚨 ZONE ALERTS</div>
            {alerts.length===0 ? (
              <div style={{ color:'#4b5563', fontSize:12, textAlign:'center', padding:'10px 0' }}>
                No alerts</div>
            ) : alerts.map(a=>(
              <div key={a.id} style={{ padding:'8px', background:'#0a0e1a', borderRadius:7,
                marginBottom:6, borderLeft:`3px solid ${RISK_COLOR[a.risk]}` }}>
                <div style={{ fontSize:12 }}>{a.msg}</div>
                <div style={{ color:'#4b5563', fontSize:10, marginTop:3 }}>{a.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const C = {
  card: { background:'#111827', borderRadius:12, padding:14 },
  sh:   { fontSize:11, color:'#6b7280', fontWeight:700, letterSpacing:'0.08em', marginBottom:10 },
};
