import React, { useEffect, useState } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const StatCard = ({ icon, label, value, color }) => (
  <div style={{ background:'#111827', borderRadius:12, padding:24, border:`1px solid ${color}40` }}>
    <div style={{ fontSize:28 }}>{icon}</div>
    <div style={{ fontSize:32, fontWeight:700, color, marginTop:8 }}>{value}</div>
    <div style={{ color:'#6b7280', fontSize:14, marginTop:4 }}>{label}</div>
  </div>
);

export default function Dashboard() {
  const [stats] = useState({ total_predictions_today:247, high_risk_alerts:18,
    accidents_prevented:11, active_monitors:34, accuracy:'94.2%' });
  const [alerts] = useState([
    {id:1, time:'10:32', location:'NH-8 Delhi', risk:'HIGH', type:'Speed Violation'},
    {id:2, time:'10:15', location:'Ring Road Bangalore', risk:'MEDIUM', type:'Bad Weather'},
    {id:3, time:'09:58', location:'Marine Drive Mumbai', risk:'CRITICAL', type:'Drowsy Driver'},
    {id:4, time:'09:40', location:'ORR Hyderabad', risk:'LOW', type:'Heavy Traffic'},
    {id:5, time:'09:22', location:'EC Road Kolkata', risk:'HIGH', type:'Fog + Speed'},
  ]);

  const riskColors = { LOW:'#22c55e', MEDIUM:'#f59e0b', HIGH:'#ef4444', CRITICAL:'#dc2626' };

  const lineData = {
    labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    datasets:[
      { label:'Predictions', data:[82,91,78,95,88,70,75], borderColor:'#3b82f6', tension:0.4 },
      { label:'Accidents', data:[22,18,25,15,20,30,28], borderColor:'#ef4444', tension:0.4 },
      { label:'Prevented', data:[10,14,9,13,11,8,12], borderColor:'#22c55e', tension:0.4 },
    ]
  };

  const donutData = {
    labels:['Low','Medium','High','Critical'],
    datasets:[{ data:[40,30,20,10], backgroundColor:['#22c55e','#f59e0b','#ef4444','#7f1d1d'],
      borderColor:'#111827', borderWidth:2 }]
  };

  const chartOpts = { plugins:{ legend:{ labels:{ color:'#9ca3af' }}},
    scales:{ x:{ ticks:{ color:'#9ca3af' }}, y:{ ticks:{ color:'#9ca3af' }}}};

  return (
    <div>
      <h1 style={{ fontSize:24, fontWeight:700, marginBottom:24 }}>📊 System Dashboard</h1>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:16, marginBottom:28 }}>
        <StatCard icon="🔮" label="Predictions Today" value={stats.total_predictions_today} color="#3b82f6"/>
        <StatCard icon="🚨" label="High Risk Alerts" value={stats.high_risk_alerts} color="#ef4444"/>
        <StatCard icon="✅" label="Accidents Prevented" value={stats.accidents_prevented} color="#22c55e"/>
        <StatCard icon="📡" label="Active Monitors" value={stats.active_monitors} color="#8b5cf6"/>
        <StatCard icon="🎯" label="Model Accuracy" value={stats.accuracy} color="#f59e0b"/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20, marginBottom:28 }}>
        <div style={{ background:'#111827', borderRadius:12, padding:20 }}>
          <h3 style={{ marginBottom:16 }}>Weekly Trend</h3>
          <Line data={lineData} options={chartOpts}/>
        </div>
        <div style={{ background:'#111827', borderRadius:12, padding:20 }}>
          <h3 style={{ marginBottom:16 }}>Risk Distribution</h3>
          <Doughnut data={donutData} options={{ plugins:{ legend:{ labels:{ color:'#9ca3af' }}}}}/>
        </div>
      </div>
      <div style={{ background:'#111827', borderRadius:12, padding:20 }}>
        <h3 style={{ marginBottom:16 }}>Recent Alerts</h3>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ color:'#6b7280', fontSize:13 }}>
            {['#','Time','Location','Risk Level','Type'].map(h=>(
              <th key={h} style={{ padding:'8px 12px', textAlign:'left', borderBottom:'1px solid #1f2937' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{alerts.map(a=>(
            <tr key={a.id} style={{ borderBottom:'1px solid #1f2937' }}>
              <td style={{ padding:'10px 12px' }}>{a.id}</td>
              <td style={{ padding:'10px 12px', color:'#9ca3af' }}>{a.time}</td>
              <td style={{ padding:'10px 12px' }}>{a.location}</td>
              <td style={{ padding:'10px 12px' }}>
                <span style={{ background:`${riskColors[a.risk]}20`, color:riskColors[a.risk],
                  padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>{a.risk}</span>
              </td>
              <td style={{ padding:'10px 12px', color:'#9ca3af' }}>{a.type}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
