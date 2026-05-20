import React, { useState } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Field = ({ label, children }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
    <label style={{ fontSize:13, color:'#9ca3af', fontWeight:500 }}>{label}</label>
    {children}
  </div>
);

const sel = {
  background:'#1f2937', color:'#e0e6f0', border:'1px solid #374151',
  borderRadius:8, padding:'10px 12px', fontSize:14, width:'100%'
};

export default function Prediction() {
  const [form, setForm] = useState({
    hour:12, day_of_week:1, weather:0, road_condition:0,
    speed:60, traffic_density:1, driver_age:30, driver_experience:5,
    visibility:80, temperature:25
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k,v) => setForm(p => ({...p, [k]: Number(v)}));

  const predict = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/predict/accident`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(form)
      });
      setResult(await r.json());
    } catch {
      setResult({ error: true, accident_probability:0.52, risk_level:'MEDIUM',
        risk_score:52, contributing_factors:['Demo Mode - Start backend for real predictions'] });
    }
    setLoading(false);
  };

  const colors = { LOW:'#22c55e', MEDIUM:'#f59e0b', HIGH:'#ef4444', CRITICAL:'#dc2626' };
  const rColor = result ? (colors[result.risk_level] || '#3b82f6') : '#3b82f6';

  return (
    <div style={{ maxWidth:900, margin:'0 auto' }}>
      <h1 style={{ fontSize:24, fontWeight:700, marginBottom:24 }}>🔮 Accident Risk Prediction</h1>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
        <div style={{ background:'#111827', borderRadius:12, padding:24 }}>
          <h3 style={{ marginBottom:20, color:'#3b82f6' }}>Input Parameters</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <Field label="Hour (0-23)">
              <input type="number" min={0} max={23} value={form.hour}
                onChange={e=>set('hour',e.target.value)} style={sel}/>
            </Field>
            <Field label="Day of Week (0=Mon)">
              <input type="number" min={0} max={6} value={form.day_of_week}
                onChange={e=>set('day_of_week',e.target.value)} style={sel}/>
            </Field>
            <Field label="Weather">
              <select value={form.weather} onChange={e=>set('weather',e.target.value)} style={sel}>
                <option value={0}>☀️ Clear</option>
                <option value={1}>🌧️ Rain</option>
                <option value={2}>🌫️ Fog</option>
                <option value={3}>❄️ Snow</option>
              </select>
            </Field>
            <Field label="Road Condition">
              <select value={form.road_condition} onChange={e=>set('road_condition',e.target.value)} style={sel}>
                <option value={0}>✅ Dry</option>
                <option value={1}>💧 Wet</option>
                <option value={2}>🧊 Icy</option>
              </select>
            </Field>
            <Field label={`Speed: ${form.speed} km/h`}>
              <input type="range" min={20} max={140} value={form.speed}
                onChange={e=>set('speed',e.target.value)}
                style={{ accentColor:'#3b82f6' }}/>
            </Field>
            <Field label="Traffic Density">
              <select value={form.traffic_density} onChange={e=>set('traffic_density',e.target.value)} style={sel}>
                <option value={0}>🟢 Low</option>
                <option value={1}>🟡 Medium</option>
                <option value={2}>🔴 High</option>
              </select>
            </Field>
            <Field label="Driver Age">
              <input type="number" min={18} max={80} value={form.driver_age}
                onChange={e=>set('driver_age',e.target.value)} style={sel}/>
            </Field>
            <Field label="Experience (years)">
              <input type="number" min={0} max={50} value={form.driver_experience}
                onChange={e=>set('driver_experience',e.target.value)} style={sel}/>
            </Field>
            <Field label={`Visibility: ${form.visibility}%`}>
              <input type="range" min={5} max={100} value={form.visibility}
                onChange={e=>set('visibility',e.target.value)}
                style={{ accentColor:'#3b82f6' }}/>
            </Field>
            <Field label={`Temperature: ${form.temperature}°C`}>
              <input type="range" min={-10} max={50} value={form.temperature}
                onChange={e=>set('temperature',e.target.value)}
                style={{ accentColor:'#3b82f6' }}/>
            </Field>
          </div>
          <button onClick={predict} disabled={loading}
            style={{ marginTop:20, width:'100%', padding:'14px', background:'#2563eb',
              color:'#fff', border:'none', borderRadius:10, fontSize:16, fontWeight:600,
              cursor:loading?'wait':'pointer', opacity:loading?0.7:1 }}>
            {loading ? '⏳ Analyzing...' : '🔍 Predict Accident Risk'}
          </button>
        </div>

        <div style={{ background:'#111827', borderRadius:12, padding:24 }}>
          <h3 style={{ marginBottom:20, color:'#3b82f6' }}>Prediction Result</h3>
          {result ? (
            <div>
              <div style={{ textAlign:'center', padding:'32px 0', border:`2px solid ${rColor}`,
                borderRadius:12, marginBottom:20 }}>
                <div style={{ fontSize:14, color:'#9ca3af', marginBottom:8 }}>Risk Level</div>
                <div style={{ fontSize:48, fontWeight:800, color:rColor }}>{result.risk_level}</div>
                <div style={{ fontSize:64, fontWeight:700, color:rColor, margin:'8px 0' }}>
                  {result.risk_score}<span style={{ fontSize:28 }}>%</span>
                </div>
                <div style={{ fontSize:14, color:'#9ca3af' }}>
                  Probability: {(result.accident_probability*100).toFixed(1)}%
                </div>
              </div>
              <div style={{ background:'#0a0e1a', borderRadius:10, padding:16 }}>
                <div style={{ fontSize:13, color:'#9ca3af', marginBottom:10, fontWeight:600 }}>
                  ⚠️ Contributing Factors:
                </div>
                {result.contributing_factors?.map((f,i)=>(
                  <div key={i} style={{ padding:'6px 0', fontSize:14, color:'#e0e6f0',
                    borderBottom:'1px solid #1f2937', display:'flex', gap:8 }}>
                    <span>•</span>{f}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign:'center', padding:'80px 0', color:'#4b5563' }}>
              <div style={{ fontSize:48 }}>🔮</div>
              <div style={{ marginTop:12 }}>Fill the form and click Predict</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
