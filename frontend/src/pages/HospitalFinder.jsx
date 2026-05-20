import React, { useState, useEffect, useRef } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function haversine(lat1,lon1,lat2,lon2){
  const R=6371, r=Math.PI/180;
  const a=Math.sin((lat2-lat1)*r/2)**2+Math.cos(lat1*r)*Math.cos(lat2*r)*Math.sin((lon2-lon1)*r/2)**2;
  return +(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))).toFixed(2);
}

const ALL_HOSPITALS = [
  {name:'AIIMS Delhi',               lat:28.5672,lng:77.2100,phone:'011-26588500',type:'Trauma Centre',beds:800,rating:4.7,city:'Delhi'},
  {name:'Safdarjung Hospital',       lat:28.5691,lng:77.2062,phone:'011-26730000',type:'Government',   beds:1500,rating:4.3,city:'Delhi'},
  {name:'Max Hospital Gurgaon',      lat:28.4601,lng:77.0635,phone:'0124-4141414',type:'Private',      beds:400, rating:4.6,city:'Delhi'},
  {name:'Apollo Delhi',              lat:28.5672,lng:77.2790,phone:'011-26925801',type:'Private',      beds:600, rating:4.5,city:'Delhi'},
  {name:'KEM Hospital Mumbai',       lat:18.9767,lng:72.8405,phone:'022-24107000',type:'Government',   beds:1800,rating:4.2,city:'Mumbai'},
  {name:'Lilavati Hospital',         lat:19.0506,lng:72.8311,phone:'022-26751000',type:'Private',      beds:300, rating:4.6,city:'Mumbai'},
  {name:'Manipal Bangalore',         lat:12.9698,lng:77.5968,phone:'080-25024444',type:'Private',      beds:600, rating:4.5,city:'Bangalore'},
  {name:'Victoria Hospital',         lat:12.9630,lng:77.5785,phone:'080-26700178',type:'Government',   beds:800, rating:4.1,city:'Bangalore'},
  {name:'Apollo Chennai',            lat:13.0569,lng:80.2425,phone:'044-28290200',type:'Private',      beds:500, rating:4.7,city:'Chennai'},
  {name:'Govt General Chennai',      lat:13.0818,lng:80.2785,phone:'044-25305000',type:'Government',   beds:2000,rating:4.0,city:'Chennai'},
  {name:'Care Hospitals Hyderabad',  lat:17.4126,lng:78.4071,phone:'040-30418000',type:'Private',      beds:400, rating:4.4,city:'Hyderabad'},
  {name:'NIMS Hyderabad',            lat:17.4098,lng:78.3929,phone:'040-23489000',type:'Government',   beds:1000,rating:4.2,city:'Hyderabad'},
  {name:'SSKM Kolkata',              lat:22.5396,lng:88.3429,phone:'033-22041735',type:'Government',   beds:1700,rating:4.1,city:'Kolkata'},
  {name:'Apollo Kolkata',            lat:22.5439,lng:88.3898,phone:'033-23201000',type:'Private',      beds:400, rating:4.5,city:'Kolkata'},
  {name:'Ruby Hall Pune',            lat:18.5204,lng:73.8567,phone:'020-26163391',type:'Private',      beds:500, rating:4.6,city:'Pune'},
  {name:'Sassoon General Pune',      lat:18.5204,lng:73.8516,phone:'020-26128000',type:'Government',   beds:1200,rating:4.0,city:'Pune'},
];

/* ── Leaflet hospital map ─────────────────────────────────────────────── */
function HospitalMap({ hospitals, userPos, selected }) {
  const center = userPos
    ? [userPos.lat, userPos.lng]
    : hospitals.length ? [hospitals[0].lat, hospitals[0].lng] : [20.5937, 78.9629];

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#m{margin:0;padding:0;width:100%;height:100%;}</style>
</head><body><div id="m"></div><script>
var map=L.map('m',{center:${JSON.stringify(center)},zoom:${userPos?11:5}});
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  {attribution:'© OSM © CARTO',maxZoom:18}).addTo(map);

var hospitals=${JSON.stringify(hospitals)};
var selected=${JSON.stringify(selected)};

hospitals.forEach(function(h,i){
  var isSel=selected&&h.name===selected.name;
  var color=isSel?'#3b82f6':h.type==='Trauma Centre'?'#dc2626':h.type==='Private'?'#8b5cf6':'#22c55e';
  var icon=L.divIcon({className:'',
    html:'<div style="width:'+(isSel?22:16)+'px;height:'+(isSel?22:16)+'px;background:'+color+
      ';border:2px solid #fff;border-radius:4px;display:flex;align-items:center;justify-content:center;'+
      'font-size:10px;box-shadow:0 0 '+(isSel?20:8)+'px '+color+'80">🏥</div>',
    iconSize:isSel?[22,22]:[16,16],iconAnchor:isSel?[11,11]:[8,8]});
  var m=L.marker([h.lat,h.lng],{icon:icon}).addTo(map);
  m.bindPopup('<div style="background:#111827;color:#e0e6f0;padding:12px;border-radius:10px;min-width:200px;">'+
    '<b style="color:'+color+'">'+h.name+'</b><br>'+
    '<span style="color:#9ca3af">Type: </span>'+h.type+'<br>'+
    '<span style="color:#9ca3af">Phone: </span>'+h.phone+'<br>'+
    '<span style="color:#9ca3af">Beds: </span>'+h.beds+'<br>'+
    '<span style="color:#f59e0b">★ </span>'+h.rating+
    (h.distance?'<br><span style="color:#22c55e">📍 '+h.distance+' km away</span>':'')+'</div>');
  if(isSel){ m.openPopup(); map.setView([h.lat,h.lng],13); }
});

${userPos?`
var ui=L.divIcon({className:'',
  html:'<div style="width:18px;height:18px;background:#3b82f6;border:3px solid #fff;'+
    'border-radius:50%;box-shadow:0 0 16px #3b82f6;"></div>',
  iconSize:[18,18],iconAnchor:[9,9]});
L.marker([${userPos.lat},${userPos.lng}],{icon:ui}).addTo(map)
 .bindPopup('<b style="color:#3b82f6">📍 Your Location / Accident Site</b>');
`:''}
</script></body></html>`;

  return <iframe srcDoc={html} title="hospitals"
    style={{ width:'100%', height:'100%', border:'none', borderRadius:12 }} />;
}

/* ─────────────────────────────────────────────────────────────────────── */
export default function HospitalFinder() {
  const [userPos,    setUserPos]    = useState(null);
  const [hospitals,  setHospitals]  = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [radius,     setRadius]     = useState(50);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [loading,    setLoading]    = useState(false);
  const [mapKey,     setMapKey]     = useState(0);
  const [sorted,     setSorted]     = useState('distance');
  const [accidentMode, setAccidentMode] = useState(false);

  const findHospitals = (lat, lng) => {
    setLoading(true);
    fetch(`${API}/api/gps/nearby-hospitals`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ lat, lng, radius_km:radius })
    }).then(r=>r.json()).then(d=>{
      setHospitals(d.hospitals||buildLocal(lat,lng));
    }).catch(()=>{
      setHospitals(buildLocal(lat,lng));
    }).finally(()=>setLoading(false));
  };

  const buildLocal = (lat, lng) =>
    ALL_HOSPITALS.map(h=>({...h, distance:haversine(lat,lng,h.lat,h.lng),
      eta:Math.round(haversine(lat,lng,h.lat,h.lng)/0.5)}))
    .filter(h=>h.distance<=radius)
    .sort((a,b)=>a.distance-b.distance);

  const getGPS = () => {
    if (!navigator.geolocation) { alert('GPS not supported'); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(p=>{
      const pos = {lat:p.coords.latitude, lng:p.coords.longitude};
      setUserPos(pos); setMapKey(k=>k+1);
      findHospitals(pos.lat, pos.lng);
    }, ()=>{
      /* use Delhi as demo */
      const pos = {lat:28.6139, lng:77.2090};
      setUserPos(pos); setMapKey(k=>k+1);
      findHospitals(pos.lat, pos.lng);
    });
  };

  const simulateAccident = () => {
    setAccidentMode(true);
    const pos = userPos || {lat:28.6139, lng:77.2090};
    setUserPos(pos); setMapKey(k=>k+1);
    findHospitals(pos.lat, pos.lng);
    if (window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance('Accident detected! Finding nearest hospitals now. Emergency services have been notified.');
      u.rate=1.1; u.pitch=1.2; window.speechSynthesis.speak(u);
    }
    setTimeout(()=>setAccidentMode(false), 8000);
  };

  const displayed = (typeFilter==='ALL' ? hospitals : hospitals.filter(h=>h.type===typeFilter))
    .sort((a,b)=> sorted==='distance' ? a.distance-b.distance :
                  sorted==='rating'   ? b.rating-a.rating     : a.name.localeCompare(b.name));

  const typeColor = { 'Trauma Centre':'#dc2626', 'Private':'#8b5cf6', 'Government':'#22c55e' };

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:700 }}>🏥 Hospital Finder</h1>
        {accidentMode && (
          <div style={{ background:'#7f1d1d', border:'1px solid #dc2626', borderRadius:10,
            padding:'8px 16px', color:'#fca5a5', fontSize:13, fontWeight:600,
            animation:'pulse 1s infinite' }}>
            🚨 ACCIDENT MODE — Finding nearest trauma centres
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ background:'#111827', borderRadius:12, padding:18, marginBottom:16 }}>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end' }}>
          <div>
            <div style={{ fontSize:12, color:'#6b7280', marginBottom:6 }}>Search Radius</div>
            <select value={radius} onChange={e=>setRadius(+e.target.value)} style={S.sel}>
              {[10,25,50,100,200].map(r=><option key={r} value={r}>{r} km</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize:12, color:'#6b7280', marginBottom:6 }}>Hospital Type</div>
            <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} style={S.sel}>
              <option value="ALL">All Types</option>
              <option value="Trauma Centre">Trauma Centre</option>
              <option value="Private">Private</option>
              <option value="Government">Government</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize:12, color:'#6b7280', marginBottom:6 }}>Sort By</div>
            <select value={sorted} onChange={e=>setSorted(e.target.value)} style={S.sel}>
              <option value="distance">Distance</option>
              <option value="rating">Rating</option>
              <option value="name">Name</option>
            </select>
          </div>
          <button onClick={getGPS} disabled={loading} style={{
            padding:'10px 20px', background:'#1d4ed8', color:'#fff', border:'none',
            borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:13,
            opacity:loading?0.7:1 }}>
            {loading ? '🔍 Searching…' : '📍 Find Hospitals Near Me'}
          </button>
          <button onClick={simulateAccident} style={{
            padding:'10px 20px', background:'#7f1d1d', color:'#fca5a5', border:'1px solid #dc2626',
            borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:13 }}>
            🚨 Simulate Accident
          </button>
        </div>
      </div>

      {/* Summary stats */}
      {hospitals.length>0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
          {[
            {label:'Found',      val:hospitals.length,                          color:'#3b82f6'},
            {label:'Nearest',    val:`${hospitals[0]?.distance||'—'} km`,       color:'#22c55e'},
            {label:'Quickest ETA',val:`${hospitals[0]?.eta||'—'} min`,          color:'#f59e0b'},
            {label:'Trauma Centres',val:hospitals.filter(h=>h.type==='Trauma Centre').length, color:'#dc2626'},
          ].map(s=>(
            <div key={s.label} style={{ background:'#111827', borderRadius:10,
              padding:'12px 16px', borderLeft:`3px solid ${s.color}` }}>
              <div style={{ fontSize:22, fontWeight:700, color:s.color }}>{s.val}</div>
              <div style={{ color:'#6b7280', fontSize:12 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Map + list */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:16 }}>

        {/* Map */}
        <div style={{ background:'#111827', borderRadius:14, overflow:'hidden', height:520 }}>
          {hospitals.length>0 || userPos ? (
            <HospitalMap key={mapKey} hospitals={displayed} userPos={userPos} selected={selected} />
          ) : (
            <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center', color:'#4b5563' }}>
              <div style={{ fontSize:52 }}>🏥</div>
              <div style={{ marginTop:12, fontSize:15 }}>Click "Find Hospitals" to search</div>
            </div>
          )}
        </div>

        {/* Hospital list */}
        <div style={{ overflowY:'auto', maxHeight:520, display:'flex', flexDirection:'column', gap:10 }}>
          {displayed.length===0 ? (
            <div style={{ background:'#111827', borderRadius:12, padding:24,
              textAlign:'center', color:'#4b5563' }}>
              <div style={{ fontSize:36 }}>🔍</div>
              <div style={{ marginTop:8 }}>No hospitals found. Try increasing radius.</div>
            </div>
          ) : displayed.map((h,i)=>(
            <div key={i} onClick={()=>{ setSelected(h); setMapKey(k=>k+1); }}
              style={{ background: selected?.name===h.name ? '#1f2937':'#111827',
                borderRadius:12, padding:16, cursor:'pointer',
                border:`1px solid ${selected?.name===h.name ? '#3b82f6':'#1f2937'}`,
                borderLeft:`4px solid ${typeColor[h.type]||'#3b82f6'}`,
                transition:'all 0.2s' }}>

              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <div>
                  {i===0 && <span style={{ fontSize:10, background:'#dc262620', color:'#ef4444',
                    padding:'1px 7px', borderRadius:8, fontWeight:700,
                    marginBottom:4, display:'inline-block' }}>NEAREST</span>}
                  <div style={{ fontWeight:700, fontSize:14 }}>{h.name}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:18, fontWeight:700, color:'#22c55e' }}>
                    {h.distance} km</div>
                  <div style={{ fontSize:11, color:'#6b7280' }}>~{h.eta} min</div>
                </div>
              </div>

              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
                <span style={{ fontSize:10, background:`${typeColor[h.type]||'#3b82f6'}20`,
                  color:typeColor[h.type]||'#3b82f6',
                  padding:'2px 9px', borderRadius:10, fontWeight:600 }}>{h.type}</span>
                <span style={{ fontSize:10, background:'#f59e0b20', color:'#f59e0b',
                  padding:'2px 9px', borderRadius:10 }}>⭐ {h.rating}</span>
                <span style={{ fontSize:10, background:'#3b82f620', color:'#60a5fa',
                  padding:'2px 9px', borderRadius:10 }}>{h.beds} beds</span>
              </div>

              <div style={{ fontSize:12, color:'#9ca3af', marginBottom:10 }}>
                📞 {h.phone} · 🏙️ {h.city}
              </div>

              <div style={{ display:'flex', gap:8 }}>
                <a href={`https://maps.google.com/?q=${h.lat},${h.lng}`} target="_blank"
                   rel="noreferrer" style={{ flex:1, padding:'7px', background:'#1d4ed820',
                   color:'#60a5fa', borderRadius:7, textAlign:'center', fontSize:12,
                   textDecoration:'none', fontWeight:600 }}>
                  🗺️ Directions
                </a>
                <a href={`tel:${h.phone}`} style={{ flex:1, padding:'7px', background:'#14532d20',
                   color:'#4ade80', borderRadius:7, textAlign:'center', fontSize:12,
                   textDecoration:'none', fontWeight:600 }}>
                  📞 Call Now
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}`}</style>
    </div>
  );
}

const S = {
  sel: { background:'#1f2937', color:'#e0e6f0', border:'1px solid #374151',
         borderRadius:8, padding:'8px 12px', fontSize:13 }
};
