import React, { useState, useEffect, useRef } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/* ── Command → response map (works fully offline) ────────────────────── */
const CMD_MAP = [
  { keys:['sos','mayday'],                    sev:'CRITICAL', action:'SOS_ACTIVATED',
    text:'SOS activated! Broadcasting your location to all emergency services. Help is on the way.' },
  { keys:['emergency','help me'],              sev:'CRITICAL', action:'EMERGENCY_ALERT',
    text:'Emergency services have been alerted. Stay calm. Help is on the way. Do not leave the vehicle.' },
  { keys:['ambulance','medical'],              sev:'CRITICAL', action:'CALL_AMBULANCE',
    text:'Calling ambulance now. Keep the victim still and do not remove any embedded objects.' },
  { keys:['police','cop'],                     sev:'HIGH',     action:'POLICE_NOTIFIED',
    text:'Notifying police with your current GPS coordinates. Stay at the scene.' },
  { keys:['accident','crash','collision'],     sev:'CRITICAL', action:'ACCIDENT_REPORTED',
    text:'Accident reported. Alerting emergency services, nearby hospitals, and traffic control.' },
  { keys:['hospital','nearest hospital'],      sev:'INFO',     action:'HOSPITAL_SEARCH',
    text:'Locating nearest hospitals. Opening hospital finder now.' },
  { keys:['safe route','route','navigate'],    sev:'INFO',     action:'ROUTE_CALC',
    text:'Calculating the safest route. Avoiding all high-risk accident zones ahead.' },
  { keys:['high risk','danger zone','risk'],   sev:'HIGH',     action:'RISK_WARNING',
    text:'High accident risk detected on your route! Reduce speed immediately and stay alert.' },
  { keys:['drowsy','sleepy','tired','sleeping'],sev:'HIGH',     action:'DROWSINESS_ALERT',
    text:'Drowsiness detected! Pull over safely at the next stop. Do not continue driving.' },
  { keys:['weather','rain','fog','snow'],      sev:'MEDIUM',   action:'WEATHER_WARNING',
    text:'Adverse weather conditions ahead. Reduce speed, turn on headlights, increase following distance.' },
  { keys:['traffic','congestion','jam'],       sev:'MEDIUM',   action:'TRAFFIC_ALERT',
    text:'Heavy traffic detected ahead. Alternate route is being calculated to save time.' },
  { keys:['hazard','obstacle','pothole'],      sev:'HIGH',     action:'ROAD_HAZARD',
    text:'Road hazard detected ahead! Reduce speed and proceed with extreme caution.' },
  { keys:['speed','slow down','speeding'],     sev:'HIGH',     action:'SPEED_WARNING',
    text:'Warning: You are approaching a speed-monitored zone. Please reduce your speed.' },
  { keys:['report','status'],                  sev:'INFO',     action:'STATUS_REPORT',
    text:'Current status: Route is mostly clear. Two medium-risk zones detected 12 km ahead.' },
];

const SEV_COLOR = { CRITICAL:'#dc2626', HIGH:'#ef4444', MEDIUM:'#f59e0b', INFO:'#3b82f6' };
const SEV_BG    = { CRITICAL:'#7f1d1d20', HIGH:'#7f1d1d15', MEDIUM:'#78350f20', INFO:'#1e3a8a20' };
const CAT_COL   = { emergency:'#dc2626', navigation:'#3b82f6', warning:'#f59e0b' };

const QUICK = [
  { label:'🆘 SOS',              cmd:'SOS',                 cat:'emergency'  },
  { label:'🚑 Call Ambulance',   cmd:'ambulance',           cat:'emergency'  },
  { label:'🚨 Emergency Help',   cmd:'emergency help',      cat:'emergency'  },
  { label:'🚔 Call Police',      cmd:'police',              cat:'emergency'  },
  { label:'💥 Report Accident',  cmd:'accident detected',   cat:'emergency'  },
  { label:'🏥 Find Hospital',    cmd:'nearest hospital',    cat:'navigation' },
  { label:'🛣️ Safe Route',       cmd:'safe route',          cat:'navigation' },
  { label:'🚦 Traffic Alert',    cmd:'heavy traffic',       cat:'warning'    },
  { label:'⚠️ High Risk Zone',   cmd:'high risk zone',      cat:'warning'    },
  { label:'😴 Drowsiness',       cmd:'feeling drowsy',      cat:'warning'    },
  { label:'🌧️ Weather Warning',  cmd:'bad weather',         cat:'warning'    },
  { label:'🚧 Road Hazard',      cmd:'road hazard ahead',   cat:'warning'    },
];

function matchCmd(text) {
  const t = text.toLowerCase();
  for (const c of CMD_MAP) {
    if (c.keys.some(k => t.includes(k))) return c;
  }
  return { sev:'INFO', action:'UNRECOGNIZED',
    text:`"${text}" — not recognized. Try: SOS, Call Ambulance, Nearest Hospital, or High Risk.` };
}

/* ── Waveform bars animation ──────────────────────────────────────────── */
function WaveBars({ active, color }) {
  const bars = [0.4,0.7,1.0,0.8,0.6,0.9,0.5,0.75,1.0,0.6,0.4,0.85];
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                  gap:3, height:40, marginBottom:6 }}>
      {bars.map((h,i) => (
        <div key={i} style={{
          width:4, borderRadius:2,
          background: active ? color : '#374151',
          height: active ? `${h*100}%` : '20%',
          transition:'height 0.15s',
          animation: active ? `wave 0.8s ease-in-out infinite alternate` : 'none',
          animationDelay: `${i * 0.07}s`,
        }}/>
      ))}
      <style>{`@keyframes wave{from{height:20%}to{height:100%}}`}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
export default function VoiceAssistant() {
  const [listening,  setListening]  = useState(false);
  const [speaking,   setSpeaking]   = useState(false);
  const [transcript, setTranscript] = useState('');
  const [result,     setResult]     = useState(null);
  const [history,    setHistory]    = useState([]);
  const [hasSSR,     setHasSSR]     = useState(false);
  const [voices,     setVoices]     = useState([]);
  const recRef   = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  /* load TTS voices */
  useEffect(() => {
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setHasSSR(!!SR);
    if (SR) {
      const r = new SR();
      r.continuous = false; r.interimResults = true; r.lang = 'en-IN';
      r.onresult = e => {
        const t = Array.from(e.results).map(x=>x[0].transcript).join('');
        setTranscript(t);
        if (e.results[e.results.length-1].isFinal) processCmd(t);
      };
      r.onend   = () => { setListening(false); };
      r.onerror = () => { setListening(false); };
      recRef.current = r;
    }
  }, []);

  const processCmd = async (text) => {
    let res;
    try {
      const r = await fetch(`${API}/api/voice/command`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ command:text, lat:28.6139, lng:77.209 })
      });
      const d = await r.json();
      res = { sev:d.severity||'INFO', action:d.action, text:d.response_text };
    } catch { res = matchCmd(text); }
    setResult(res);
    addHistory(text, res);
    speak(res.text, res.sev);
  };

  const speak = (text, sev) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const u  = new SpeechSynthesisUtterance(text);
    u.rate   = sev === 'CRITICAL' ? 1.2 : 1.0;
    u.pitch  = sev === 'CRITICAL' ? 1.3 : 1.0;
    u.volume = 1;
    // prefer female English voice
    const pref = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
               || voices.find(v => v.lang.startsWith('en'))
               || voices[0];
    if (pref) u.voice = pref;
    u.onstart = () => setSpeaking(true);
    u.onend   = () => setSpeaking(false);
    synthRef.current.speak(u);
  };

  const addHistory = (cmd, res) =>
    setHistory(p => [{ id:Date.now(), cmd, ...res,
      time:new Date().toLocaleTimeString() }, ...p].slice(0,20));

  const toggle = () => {
    if (!hasSSR) return;
    if (listening) { recRef.current?.stop(); setListening(false); }
    else { setTranscript(''); setResult(null); recRef.current?.start(); setListening(true); }
  };

  const runQuick = (cmd) => { setTranscript(cmd); processCmd(cmd); };

  const micBg = listening
    ? 'radial-gradient(circle, #7f1d1d, #dc2626)'
    : speaking
    ? 'radial-gradient(circle, #14532d, #16a34a)'
    : 'radial-gradient(circle, #1e3a8a, #2563eb)';

  const statusLabel = listening ? '🔴 Listening…' : speaking ? '🔊 Speaking…' : '● Tap to speak';
  const statusColor = listening ? '#ef4444' : speaking ? '#22c55e' : '#6b7280';

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <h1 style={{ fontSize:24, fontWeight:700 }}>🎙️ AI Voice Assistant</h1>
        {!hasSSR && <span style={{ fontSize:12, background:'#78350f30', color:'#f59e0b',
          padding:'3px 10px', borderRadius:10 }}>Mic unavailable — use Quick Commands</span>}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'400px 1fr', gap:20 }}>

        {/* ── LEFT ──────────────────────────────────────────────────────── */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Mic card */}
          <div style={C.card}>

            {/* Waveform */}
            <WaveBars active={listening || speaking}
              color={listening ? '#ef4444' : '#22c55e'} />

            {/* Ripple + mic button */}
            <div style={{ position:'relative', display:'flex', alignItems:'center',
                          justifyContent:'center', height:120, marginBottom:16 }}>
              {(listening || speaking) && [1,2,3].map(i => (
                <span key={i} style={{
                  position:'absolute', borderRadius:'50%',
                  width:80+i*28, height:80+i*28,
                  border:`1.5px solid ${listening ? '#ef4444' : '#22c55e'}`,
                  opacity:0.5-i*0.14,
                  animation:'ripple 1.8s ease-out infinite',
                  animationDelay:`${(i-1)*0.5}s`,
                  pointerEvents:'none'
                }}/>
              ))}
              <button onClick={toggle} style={{
                width:80, height:80, borderRadius:'50%', border:'none',
                cursor: hasSSR ? 'pointer' : 'not-allowed',
                background:micBg, fontSize:32, position:'relative', zIndex:2,
                boxShadow:`0 0 28px ${listening ? '#dc262660' : speaking ? '#16a34a60' : '#2563eb50'}`,
                transition:'all 0.25s', opacity: hasSSR ? 1 : 0.5
              }}>
                {listening ? '⏹' : speaking ? '🔊' : '🎙️'}
              </button>
            </div>

            {/* Status */}
            <div style={{ textAlign:'center', marginBottom:16 }}>
              <span style={{ fontSize:14, fontWeight:600, color:statusColor }}>
                {statusLabel}
              </span>
            </div>

            {/* Transcript */}
            {transcript && (
              <div style={{ background:'#0a0e1a', borderRadius:10, padding:12,
                            border:'1px solid #1f2937', marginBottom:12 }}>
                <div style={{ fontSize:10, color:'#4b5563', letterSpacing:'0.08em',
                              marginBottom:4 }}>YOU SAID</div>
                <div style={{ color:'#e0e6f0', fontStyle:'italic', fontSize:14 }}>"{transcript}"</div>
              </div>
            )}

            {/* Response */}
            {result && (
              <div style={{ background: SEV_BG[result.sev], borderRadius:12, padding:16,
                            borderLeft:`4px solid ${SEV_COLOR[result.sev]}` }}>
                <div style={{ display:'flex', justifyContent:'space-between',
                              alignItems:'center', marginBottom:10 }}>
                  <span style={{ fontSize:10, color:'#6b7280', fontWeight:700,
                                 letterSpacing:'0.08em' }}>AI RESPONSE</span>
                  <span style={{ fontSize:11, fontWeight:700,
                    color:SEV_COLOR[result.sev],
                    background:`${SEV_COLOR[result.sev]}25`,
                    padding:'2px 10px', borderRadius:20 }}>{result.sev}</span>
                </div>
                <div style={{ color:'#e0e6f0', fontSize:14, lineHeight:1.65 }}>{result.text}</div>
                {result.action && (
                  <div style={{ marginTop:8, fontSize:11, color:'#4b5563' }}>
                    Action → <span style={{ color:'#60a5fa' }}>{result.action}</span>
                  </div>
                )}
                {speaking && (
                  <button onClick={() => { synthRef.current?.cancel(); setSpeaking(false); }}
                    style={{ marginTop:10, padding:'5px 14px', background:'#374151',
                             color:'#e0e6f0', border:'none', borderRadius:6,
                             cursor:'pointer', fontSize:12 }}>⏹ Stop</button>
                )}
              </div>
            )}
          </div>

          {/* Quick Commands */}
          <div style={C.card}>
            <div style={C.secHead}>⚡ QUICK COMMANDS</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7 }}>
              {QUICK.map((q,i) => (
                <button key={i} onClick={() => runQuick(q.cmd)} style={{
                  padding:'9px 10px', borderRadius:8, border:'none',
                  background:`${CAT_COL[q.cat]}12`,
                  outline:`1px solid ${CAT_COL[q.cat]}30`,
                  color:'#e0e6f0', cursor:'pointer', fontSize:12,
                  textAlign:'left', transition:'background 0.15s'
                }}
                onMouseEnter={e=>e.currentTarget.style.background=`${CAT_COL[q.cat]}28`}
                onMouseLeave={e=>e.currentTarget.style.background=`${CAT_COL[q.cat]}12`}>
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT — History ────────────────────────────────────────────── */}
        <div style={C.card}>
          <div style={C.secHead}>📋 COMMAND HISTORY</div>
          {history.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 0', color:'#374151' }}>
              <div style={{ fontSize:52 }}>🎙️</div>
              <div style={{ marginTop:12, fontSize:14 }}>No commands yet</div>
              <div style={{ marginTop:6, fontSize:12 }}>Speak or tap a quick command</div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10,
                          overflowY:'auto', maxHeight:640 }}>
              {history.map(h => (
                <div key={h.id} style={{ background:'#0a0e1a', borderRadius:10,
                  padding:14, borderLeft:`3px solid ${SEV_COLOR[h.sev]}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between',
                                marginBottom:6 }}>
                    <span style={{ color:'#6b7280', fontSize:12, fontStyle:'italic' }}>
                      "{h.cmd}"</span>
                    <span style={{ color:'#374151', fontSize:11 }}>{h.time}</span>
                  </div>
                  <div style={{ color:'#e0e6f0', fontSize:13, lineHeight:1.5 }}>{h.text}</div>
                  <div style={{ marginTop:8, display:'flex', gap:8 }}>
                    <span style={{ fontSize:10, fontWeight:700,
                      color:SEV_COLOR[h.sev], background:`${SEV_COLOR[h.sev]}20`,
                      padding:'2px 9px', borderRadius:10 }}>{h.sev}</span>
                    <span style={{ fontSize:10, color:'#4b5563' }}>{h.action}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes ripple{0%{transform:scale(1);opacity:0.5}100%{transform:scale(1.9);opacity:0}}`}</style>
    </div>
  );
}

const C = {
  card:    { background:'#111827', borderRadius:14, padding:22 },
  secHead: { fontSize:11, color:'#6b7280', fontWeight:700,
             letterSpacing:'0.08em', marginBottom:14 },
};
