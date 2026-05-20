import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard      from './pages/Dashboard';
import Prediction     from './pages/Prediction';
import Alerts         from './pages/Alerts';
import LiveMap        from './pages/LiveMap';
import VoiceAssistant from './pages/VoiceAssistant';
import GPSTracker     from './pages/GPSTracker';
import HospitalFinder from './pages/HospitalFinder';

const NAV = [
  { path:'/',          label:'📊 Dashboard'    },
  { path:'/predict',   label:'🔮 Predict'      },
  { path:'/map',       label:'🗺️ Live Map'     },
  { path:'/gps',       label:'📡 GPS Tracker'  },
  { path:'/hospitals', label:'🏥 Hospitals'    },
  { path:'/voice',     label:'🎤 Voice AI'     },
  { path:'/alerts',    label:'🚨 Alerts'       },
];

function Navbar() {
  const loc = useLocation();
  return (
    <nav style={{ display:'flex', alignItems:'center', padding:'0 24px',
      background:'#111827', borderBottom:'1px solid #1f2937',
      position:'sticky', top:0, zIndex:100, height:56, gap:4 }}>
      <div style={{ fontSize:16, fontWeight:700, color:'#3b82f6', marginRight:16, whiteSpace:'nowrap' }}>
        🚗 AI Accident
      </div>
      {NAV.map(n=>(
        <Link key={n.path} to={n.path} style={{
          padding:'6px 12px', borderRadius:6, color: loc.pathname===n.path ? '#fff' : '#9ca3af',
          textDecoration:'none', fontSize:13, fontWeight:500, whiteSpace:'nowrap',
          background: loc.pathname===n.path ? '#1d4ed8' : 'transparent',
          transition:'all 0.15s'
        }}>{n.label}</Link>
      ))}
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <main style={{ padding:'20px 24px', minHeight:'calc(100vh - 56px)' }}>
        <Routes>
          <Route path="/"          element={<Dashboard/>}      />
          <Route path="/predict"   element={<Prediction/>}     />
          <Route path="/map"       element={<LiveMap/>}         />
          <Route path="/gps"       element={<GPSTracker/>}     />
          <Route path="/hospitals" element={<HospitalFinder/>} />
          <Route path="/voice"     element={<VoiceAssistant/>} />
          <Route path="/alerts"    element={<Alerts/>}         />
        </Routes>
      </main>
    </Router>
  );
}
