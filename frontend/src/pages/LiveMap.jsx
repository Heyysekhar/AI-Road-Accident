import React, { useState, useEffect, useRef } from 'react';

const API        = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const RISK_COLOR = { CRITICAL:'#dc2626', HIGH:'#ef4444', MEDIUM:'#f59e0b', LOW:'#22c55e' };
const VEH_COLOR  = { DANGER:'#dc2626', WARNING:'#f59e0b', SAFE:'#22c55e' };

const ZONES = [
  { id:1,  name:'NH-8 Gurgaon Toll',         lat:28.4595, lng:77.0266, risk:'CRITICAL', radius:2.0 },
  { id:2,  name:'Yamuna Expressway KM-28',   lat:28.3183, lng:77.4375, risk:'HIGH',     radius:3.0 },
  { id:3,  name:'Delhi-Meerut Expressway',   lat:28.7041, lng:77.5245, risk:'HIGH',     radius:2.5 },
  { id:4,  name:'Mumbai-Pune Expressway',    lat:18.6725, lng:73.5120, risk:'CRITICAL', radius:4.0 },
  { id:5,  name:'Bangalore Hosur Road',      lat:12.8445, lng:77.6610, risk:'MEDIUM',   radius:1.5 },
  { id:6,  name:'Chennai OMR IT Corridor',   lat:12.8996, lng:80.2209, risk:'MEDIUM',   radius:2.0 },
  { id:7,  name:'Hyderabad ORR Patancheru',  lat:17.4935, lng:78.3087, risk:'HIGH',     radius:3.0 },
  { id:8,  name:'Pune Satara Road',          lat:18.4200, lng:73.8567, risk:'CRITICAL', radius:3.5 },
  { id:9,  name:'Kolkata NH-12 Bypass',      lat:22.5054, lng:88.3476, risk:'HIGH',     radius:2.5 },
  { id:10, name:'Ahmedabad-Vadodara Exp',    lat:22.6708, lng:72.8521, risk:'MEDIUM',   radius:2.0 },
];

const DEMO_VEHS = [
  { vehicle_id:'DL-01-AB-1234', lat:28.610, lng:77.210, speed:72, status:'SAFE'    },
  { vehicle_id:'MH-02-CD-5678', lat:18.680, lng:73.850, speed:95, status:'WARNING' },
  { vehicle_id:'KA-03-EF-9012', lat:12.970, lng:77.590, speed:45, status:'SAFE'    },
  { vehicle_id:'TN-04-GH-3456', lat:13.080, lng:80.270, speed:88, status:'DANGER'  },
];

/* ── Build and serve a Leaflet map via iframe srcdoc ─────────────────── */
function AccidentMap({ zones, vehicles, userPos }) {
  const center = userPos ? [userPos.lat, userPos.lng] : [22.5, 78.9];
  const zoom   = userPos ? 10 : 5;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#m{margin:0;padding:0;width:100%;height:100%;}</style>
</head><body><div id="m"></div><script>
var map=L.map('m',{center:${JSON.stringify(center)},zoom:${zoom}});
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  {attribution:'© OSM © CARTO',maxZoom:18}).addTo(map);

var RC=${JSON.stringify(RISK_COLOR)};
var VC=${JSON.stringify(VEH_COLOR)};

/* — Risk zones — */
${JSON.stringify(zones)}.forEach(function(z){
  var c=RC[z.risk]||'#ef4444';
  L.circle([z.lat,z.lng],{radius:z.radius*1000,color:c,fillColor:c,
    fillOpacity:0.15,weight:2,opacity:0.9}).addTo(map)
   .bindPopup('<div style="background:#111827;color:#e0e6f0;padding:10px;'+
     'border-radius:8px;min-width:170px"><b style="color:'+c+'">'+z.name+'</b>'+
     '<br><span style="color:#9ca3af">Risk: </span><b style="color:'+c+'">'+z.risk+'</b>'+
     '<br><span style="color:#9ca3af">Radius: '+z.radius+' km</span></div>');
  L.circleMarker([z.lat,z.lng],{radius:8,fillColor:c,color:'#fff',
    weight:2,fillOpacity:1}).addTo(map);
});

/* — Live vehicles — */
${JSON.stringify(vehicles)}.forEach(function(v){
  var c=VC[v.status]||'#22c55e';
  var icon=L.divIcon({className:'',
    html:'<div style="width:14px;height:14px;background:'+c+
      ';border:2px solid #fff;border-radius:50%;box-shadow:0 0 10px '+c+'90;"></div>',
    iconSize:[14,14],iconAnchor:[7,7]});
  L.marker([v.lat,v.lng],{icon:icon}).addTo(map)
   .bindPopup('<div style="background:#111827;color:#e0e6f0;padding:10px;border-radius:8px;">'+
     '<b>'+v.vehicle_id+'</b><br>Speed: '+v.speed+' km/h'+
     '<br><b style="color:'+c+'">'+v.status+'</b></div>');
});

/* — User location — */
${userPos ? `
var ui=L.divIcon({className:'',
  html:'<div style="width:18px;height:18px;background:#3b82f6;border:3px solid #fff;'+
    'border-radius:50%;box-shadow:0 0 16px #3b82f6;"></div>',
  iconSize:[18,18],iconAnchor:[9,9]});
L.marker([${userPos.lat},${userPos.lng}],{icon:ui}).addTo(map)
 .bindPopup('<b style="color:#3b82f6">📍 Your Location</b>').openPopup();
map.setView([${userPos.lat},${userPos.lng}],10);
` : ''}
</script></body></html>`;

  return <iframe srcDoc={html} title="map"
    style={{ width:'100%', height:'100%', border:'none', borderRadius:12 }} />;
}

/* ─────────────────────────────────────────────────────────────────────── */
export default function LiveMap() {
  const [zones,    setZones]    = useState(ZONES);
  const [vehicles, setVehicles] = useState(DEMO_VEHS);
  const [userPos,  setUserPos]  = useState(null);
  const [tracking, setTracking] = useState(false);
  const [filter,   setFilter]   = useState('ALL');
  const [mapKey,   setMapKey]   = useState(0);
  const [selected, setSelected] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/api/gps/accident-zones`).then(r=>r.json())
      .then(d=>{ if(d.zones?.length){ setZones(d.zones); setMapKey(k=>k+1); }}).catch(()=>{});
  }, []);

  const refreshVehicles = () =>
    fetch(`${API}/api/gps/live-vehicles`).then(r=>r.json())
      .then(d=>{ if(d.vehicles?.length){ setVehicles(d.vehicles); setMapKey(k=>k+1); }}).catch(()=>{});

  const startTracking = () => {
    setTracking(true);
    navigator.geolocation?.getCurrentPosition(
      p => { setUserPos({lat:p.coords.latitude, lng:p.coords.longitude}); setMapKey(k=>k+1); },
      () => {}
    );
    timerRef.current = setInterval(() => {
      refreshVehicles();
      /* jitter demo vehicles slightly */
      setVehicles(v => v.map(x=>({...x,
        lat:x.lat+(Math.random()-0.5)*0.002,
        lng:x.lng+(Math.random()-0.5)*0.002,
        speed:Math.max(20,Math.min(120,x.speed+(Math.random()-0.5)*6|0))
      })));
      setMapKey(k=>k+1);
    }, 4000);
  };

  const stopTracking = () => { setTracking(false); clearInterval(timerRef.current); };
  useEffect(() => () => clearInterval(timerRef.current), []);

  const visible = filter==='ALL' ? zones : zones.filter(z=>z.risk===filter);
  const counts  = zones.reduce((a,z)=>({...a,[z.risk]:(a[z.risk]||0)+1}),{});

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h1 style={{ fontSize:24, fontWeight:700 }}>🗺️ Real-Time Accident Risk Map</h1>
        <div style={{ display:'flex', gap:6 }}>
          {['ALL','CRITICAL','HIGH','MEDIUM','LOW'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{
              padding:'5px 13px', borderRadius:20, border:'none', cursor:'pointer',
              fontSize:12, fontWeight:700,
              background: filter===f ? (RISK_COLOR[f]||'#3b82f6') : '#1f2937',
              color:'#fff'
            }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Counts row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
        {Object.entries(RISK_COLOR).map(([r,c])=>(
          <div key={r} style={{ background:'#111827', borderRadius:10,
            padding:'12px 16px', borderLeft:`3px solid ${c}` }}>
            <div style={{ fontSize:26, fontWeight:700, color:c }}>{counts[r]||0}</div>
            <div style={{ color:'#6b7280', fontSize:12 }}>{r} Zones</div>
          </div>
        ))}
      </div>

      {/* Map + sidebar */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 275px', gap:16 }}>

        <div style={{ background:'#111827', borderRadius:14, overflow:'hidden', height:520 }}>
          <AccidentMap key={mapKey} zones={visible} vehicles={vehicles} userPos={userPos} />
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

          {/* GPS control */}
          <div style={C.card}>
            <div style={C.sh}>📡 GPS LIVE TRACKING</div>
            <button onClick={tracking ? stopTracking : startTracking} style={{
              width:'100%', padding:'10px', borderRadius:8, border:'none',
              cursor:'pointer', fontWeight:700, fontSize:13,
              background: tracking ? '#7f1d1d' : '#14532d', color:'#fff',
              transition:'background 0.2s'
            }}>
              {tracking ? '⏹ Stop Tracking' : '▶ Start Live Tracking'}
            </button>
            {tracking && (
              <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:'#dc2626',
                  display:'inline-block', animation:'blink 1s infinite' }}/>
                <span style={{ color:'#22c55e', fontSize:12 }}>Live · updates every 4 s</span>
              </div>
            )}
            {userPos && (
              <div style={{ marginTop:10, background:'#0a0e1a', borderRadius:8, padding:10 }}>
                <div style={{ color:'#3b82f6', fontWeight:700, fontSize:12 }}>📍 Your Location</div>
                <div style={{ color:'#9ca3af', fontSize:11, marginTop:3 }}>
                  {userPos.lat.toFixed(5)}, {userPos.lng.toFixed(5)}</div>
              </div>
            )}
          </div>

          {/* Live vehicles */}
          <div style={C.card}>
            <div style={C.sh}>🚗 LIVE VEHICLES ({vehicles.length})</div>
            {vehicles.map((v,i)=>(
              <div key={i} onClick={()=>setSelected(selected?.vehicle_id===v.vehicle_id?null:v)}
                style={{ padding:'9px 10px', background: selected?.vehicle_id===v.vehicle_id ?'#1f2937':'#0a0e1a',
                  borderRadius:8, marginBottom:7, cursor:'pointer',
                  borderLeft:`3px solid ${VEH_COLOR[v.status]}` }}>
                <div style={{ fontWeight:600, fontSize:12 }}>{v.vehicle_id}</div>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:3 }}>
                  <span style={{ color:'#9ca3af', fontSize:11 }}>{v.speed} km/h</span>
                  <span style={{ color:VEH_COLOR[v.status], fontSize:11, fontWeight:700 }}>{v.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Scrollable zone list */}
          <div style={{ ...C.card, flex:1, overflowY:'auto', maxHeight:220 }}>
            <div style={C.sh}>⚠️ RISK ZONES ({visible.length})</div>
            {visible.map(z=>(
              <div key={z.id} style={{ padding:'7px 9px', background:'#0a0e1a',
                borderRadius:7, marginBottom:6, borderLeft:`3px solid ${RISK_COLOR[z.risk]}` }}>
                <div style={{ fontSize:12, fontWeight:600 }}>{z.name}</div>
                <span style={{ fontSize:10, color:RISK_COLOR[z.risk] }}>{z.risk} · {z.radius} km</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </div>
  );
}

const C = {
  card: { background:'#111827', borderRadius:12, padding:14 },
  sh:   { fontSize:11, color:'#6b7280', fontWeight:700, letterSpacing:'0.08em', marginBottom:10 },
};
