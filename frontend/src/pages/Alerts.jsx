import React, { useState } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function Alerts() {
  const [form, setForm] = useState({
    accident_location:'NH-8, Near Delhi Toll',
    latitude:28.6139, longitude:77.2090,
    risk_level:'HIGH', description:'High speed + foggy conditions detected',
    contact_number:''
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const inp = { background:'#1f2937', color:'#e0e6f0', border:'1px solid #374151',
    borderRadius:8, padding:'10px 12px', fontSize:14, width:'100%' };

  const sendAlert = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/alerts/send`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(form)
      });
      setStatus(await r.json());
    } catch {
      setStatus({ message:'Configure .env file with Twilio & Email credentials for real alerts.',
        sms_sent:false, email_sent:false });
    }
    setLoading(false);
  };

  const recentAlerts = [
    { id:1, time:'10:32 AM', loc:'NH-8 Delhi', risk:'CRITICAL', sms:true, email:true },
    { id:2, time:'09:45 AM', loc:'Yamuna Expressway', risk:'HIGH', sms:true, email:false },
    { id:3, time:'09:10 AM', loc:'Mumbai-Pune Highway', risk:'MEDIUM', sms:false, email:true },
  ];
  const rc = { LOW:'#22c55e', MEDIUM:'#f59e0b', HIGH:'#ef4444', CRITICAL:'#dc2626' };

  return (
    <div>
      <h1 style={{ fontSize:24, fontWeight:700, marginBottom:24 }}>🚨 Emergency Alert System</h1>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
        <div style={{ background:'#111827', borderRadius:12, padding:24 }}>
          <h3 style={{ marginBottom:20, color:'#ef4444' }}>Send Emergency Alert</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[
              ['Location', 'accident_location', 'text'],
              ['Latitude', 'latitude', 'number'],
              ['Longitude', 'longitude', 'number'],
              ['Description', 'description', 'text'],
            ].map(([label, key, type]) => (
              <div key={key}>
                <label style={{ fontSize:13, color:'#9ca3af', display:'block', marginBottom:4 }}>{label}</label>
                <input type={type} value={form[key]}
                  onChange={e=>setForm(p=>({...p,[key]:type==='number'?Number(e.target.value):e.target.value}))}
                  style={inp}/>
              </div>
            ))}
            <div>
              <label style={{ fontSize:13, color:'#9ca3af', display:'block', marginBottom:4 }}>Risk Level</label>
              <select value={form.risk_level} onChange={e=>setForm(p=>({...p,risk_level:e.target.value}))} style={inp}>
                {['LOW','MEDIUM','HIGH','CRITICAL'].map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <button onClick={sendAlert} disabled={loading} style={{
              padding:'14px', background:'#dc2626', color:'#fff', border:'none',
              borderRadius:10, fontSize:16, fontWeight:600, cursor:'pointer' }}>
              {loading ? '📡 Sending...' : '🚨 Send Emergency Alert'}
            </button>
            {status && (
              <div style={{ background:'#0a0e1a', borderRadius:8, padding:16 }}>
                <div style={{ marginBottom:8 }}>{status.message}</div>
                <div style={{ color: status.sms_sent ? '#22c55e':'#ef4444' }}>
                  SMS: {status.sms_sent ? '✅ Sent':'❌ Not sent (check .env)'}
                </div>
                <div style={{ color: status.email_sent ? '#22c55e':'#ef4444' }}>
                  Email: {status.email_sent ? '✅ Sent':'❌ Not sent (check .env)'}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div style={{ background:'#111827', borderRadius:12, padding:24, marginBottom:20 }}>
            <h3 style={{ marginBottom:16 }}>📋 Alert History</h3>
            {recentAlerts.map(a=>(
              <div key={a.id} style={{ padding:'14px', background:'#0a0e1a', borderRadius:8,
                marginBottom:10, borderLeft:`3px solid ${rc[a.risk]}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontWeight:600 }}>{a.loc}</span>
                  <span style={{ color:'#6b7280', fontSize:13 }}>{a.time}</span>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <span style={{ background:`${rc[a.risk]}20`, color:rc[a.risk],
                    padding:'2px 10px', borderRadius:20, fontSize:12 }}>{a.risk}</span>
                  <span style={{ color: a.sms ? '#22c55e':'#6b7280', fontSize:13 }}>
                    {a.sms ? '✅':'❌'} SMS
                  </span>
                  <span style={{ color: a.email ? '#22c55e':'#6b7280', fontSize:13 }}>
                    {a.email ? '✅':'❌'} Email
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background:'#111827', borderRadius:12, padding:24 }}>
            <h3 style={{ marginBottom:16 }}>🏥 Nearby Hospitals</h3>
            {[
              { name:'City General Hospital', dist:'2.3 km', phone:'112' },
              { name:'Emergency Care Center', dist:'4.1 km', phone:'108' },
              { name:'Trauma Response Unit', dist:'5.8 km', phone:'102' },
            ].map((h,i)=>(
              <div key={i} style={{ padding:'12px', background:'#0a0e1a', borderRadius:8, marginBottom:8 }}>
                <div style={{ fontWeight:600 }}>{h.name}</div>
                <div style={{ color:'#6b7280', fontSize:13 }}>📍 {h.dist} &nbsp;|&nbsp; 📞 {h.phone}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
