/* App shell -> mounts everything */
(function () {
  const { useState, useEffect, useRef, useCallback } = React;
  const Icon = window.Icon, SEED = window.SEED;
  const { Badge, toast, ToastHost } = window;

  const NAV = [
    { id:'today', label:'Today', icon:'home' },
    { id:'incoming', label:'Incoming', icon:'inbox' },
    { id:'loop', label:'Response Loop', icon:'loop' },
    { id:'content', label:'Content', icon:'layers' },
    { id:'newsletter', label:'Newsletter', icon:'doc' },
    { id:'insights', label:'Insights', icon:'chart' },
    { id:'settings', label:'Settings', icon:'gear' },
  ];

  function initStore() {
    return {
      tickets: SEED.tickets.map(t=>({ ...t })),
      triageQueue: SEED.triageQueue.map(t=>({ ...t })),
      mailedForms: SEED.mailedForms.map(f=>({ ...f })),
      eventRequests: SEED.eventRequests.map(r=>({ ...r })),
      projects: SEED.projects.map(p=>({ ...p })),
      proposals: SEED.proposals.map(p=>({ ...p })),
      notices: SEED.notices.map(n=>({ ...n })),
      flaggedComments: SEED.flaggedComments.map(c=>({ ...c })),
      newsletters: SEED.newsletters.map(n=>({ ...n })),
      nl: JSON.parse(JSON.stringify(SEED.nlSeed)),
      rlPending: 4,
    };
  }

  function App() {
    const [phase, setPhase] = useState('onboarding'); // onboarding | dashboard
    const [role, setRole] = useState(null);
    const [originalRole, setOriginalRole] = useState(null);
    const [route, setRoute] = useState({ section:'today', tab:null });
    const [store, setStore] = useState(initStore);
    const [modal, setModal] = useState(null);
    const [tourSteps, setTourSteps] = useState(null);
    const [bellOpen, setBellOpen] = useState(false);
    const [switchOpen, setSwitchOpen] = useState(false);
    const [visited, setVisited] = useState({ today:true });
    const [tip, setTip] = useState(null);
    const [mobile, setMobile] = useState(window.innerWidth < 760);
    const exploreMode = useRef(false);

    useEffect(() => { const f = () => setMobile(window.innerWidth < 760); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, []);

    const update = useCallback((fn) => setStore(s => fn(s)), []);
    const closeModal = useCallback(() => setModal(null), []);
    const openModal = useCallback((node) => setModal(node), []);

    const go = useCallback((section, opts={}) => {
      setRoute({ section, tab: opts.tab || null });
      setBellOpen(false); setSwitchOpen(false);
      // contextual tip on first visit (explore mode only)
      if (exploreMode.current && !visitedRef.current[section] && section!=='today') {
        setVisited(v=>({ ...v, [section]:true }));
        setTip(TIPS[section]);
      }
    }, []);
    const visitedRef = useRef(visited); useEffect(()=>{ visitedRef.current = visited; }, [visited]);

    // ctx assembled fresh each render so components see latest store
    const ctx = {
      role, store, update, go, openModal, closeModal,
      route,
      openTicket: (t, mode) => openModal(React.createElement(window.TicketDetail, { ticket:t, mode, ctx, onClose:closeModal })),
      startTriage: () => { const t = store.triageQueue[0]; if (t) openModal(React.createElement(window.TicketDetail, { ticket:t, mode:'triage', ctx, onClose:closeModal })); else toast('Triage queue is clear.'); },
      simulate: () => simulate(),
    };

    function simulate() {
      const kinds = ['ticket','comment','form','amplify'];
      const k = kinds[Math.floor(Math.random()*kinds.length)];
      if (k==='ticket') {
        const id = 'CT-'+(2300+Math.floor(Math.random()*99));
        const nt = { id, title:'Pothole forming on Maple Ave', cat:'Roads', sub:'Pothole', dept:null, suggestedDept:'Public Works', confidence:91, phase:'Submitted', loc:'Maple Ave', nbhd:'Old Village', submitter:'New resident', date:SEED.daysAgo(0), desc:'Just-submitted report. A pothole is forming near the Maple Ave curve and is getting wider after the rain.', photo:true, affects:1, response:'', staffResp:false, comments:[], untriaged:true };
        setStore(s=>({ ...s, triageQueue:[nt, ...s.triageQueue] }));
        toast('Simulated new activity: new ticket "Pothole forming on Maple Ave" added to triage.', { icon:'ticket' });
      } else if (k==='form') {
        toast('Simulated new activity: a mailed form scan arrived in the queue.', { icon:'doc' });
      } else if (k==='comment') {
        toast('Simulated new activity: a new comment was posted on CT-2041 (Boyce Road pothole).', { icon:'loop' });
      } else {
        setStore(s=>({ ...s, tickets: s.tickets.map((t,i)=> i===0 ? { ...t, affects:(t.affects||0)+1 } : t) }));
        toast('Simulated new activity: a resident marked "this affects me too" on a ticket.', { icon:'arrowUp' });
      }
    }

    function completeOnboarding(roleId, tour) {
      setRole(roleId); setOriginalRole(roleId); setPhase('dashboard'); setRoute({ section:'today', tab:null });
      if (tour) { setTimeout(()=> setTourSteps(window.getTour(roleId, go)), 400); }
      else { exploreMode.current = true; }
    }

    function switchRole(roleId) {
      setRole(roleId); setRoute({ section:'today', tab:null }); setSwitchOpen(false); setBellOpen(false);
    }

    if (phase==='onboarding') {
      return (<><window.OnboardingFlow onComplete={completeOnboarding} /><ToastHost /></>);
    }

    if (mobile) return (<><MobileApp ctx={ctx} role={role} setRole={setRole} /><ToastHost />{modal}</>);

    const notifs = SEED.notifications[role] || SEED.defaultNotifs;
    const unread = notifs.filter(n=>n.unread).length;
    const roleObj = SEED.ROLES.find(r=>r.id===role);

    return (
      <div className="col" style={{ height:'100%' }}>
        {/* Shadow banner */}
        {role!==originalRole && (
          <div style={{ background:'var(--navy)', color:'#fff', fontSize:12.5, padding:'7px 16px', display:'flex', alignItems:'center', gap:10, justifyContent:'center' }}>
            <Icon name="eye" size={14} color="rgba(255,255,255,.8)" />
            You are viewing the dashboard as <b>{roleObj.short}</b>. Originally onboarded as <b>{SEED.ROLES.find(r=>r.id===originalRole).short}</b>.
            <button onClick={()=>switchRole(originalRole)} style={{ background:'rgba(255,255,255,.16)', border:'none', color:'#fff', fontWeight:600, fontSize:12, padding:'3px 10px', borderRadius:4, cursor:'pointer' }}>Return to original role</button>
          </div>
        )}

        {/* Header */}
        <header style={{ height:'var(--header-h)', borderBottom:'1px solid var(--border-soft)', background:'#fff', display:'flex', alignItems:'center', padding:'0 16px', gap:16, flex:'none' }}>
          <button onClick={()=>go('today')} style={{ background:'none', border:'none', cursor:'pointer', padding:0 }}><window.Logo /></button>

          {/* Role switcher */}
          <div style={{ position:'relative' }} data-tour="role-switcher">
            <button className="btn btn-sm" onClick={()=>{ setSwitchOpen(o=>!o); setBellOpen(false); }} style={{ background:'var(--gray-100)' }}>
              <Icon name={roleObj.icon} size={14} color="var(--navy)" />
              <span style={{ maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{roleObj.short}</span>
              <Icon name="chevDown" size={14} color="var(--text-3)" />
            </button>
            <span className="muted text-xs" style={{ marginLeft:8 }}>View as</span>
            {switchOpen && (
              <div className="card" style={{ position:'absolute', top:38, left:0, width:300, zIndex:600, maxHeight:'70vh', overflowY:'auto', padding:6 }}>
                <div style={{ padding:'6px 10px' }} className="muted text-xs">Demo affordance: switch roles to see what other staff see. In production this would not exist.</div>
                {SEED.ROLES.map(r=>(
                  <button key={r.id} onClick={()=>switchRole(r.id)} className="row items-center gap-8" style={{ width:'100%', textAlign:'left', padding:'8px 10px', background: r.id===role?'var(--navy-100)':'transparent', border:'none', borderRadius:6, cursor:'pointer' }}>
                    <div style={{ width:26, height:26, borderRadius:6, background:'var(--gray-100)', display:'grid', placeItems:'center', color:'var(--navy)', flex:'none' }}><Icon name={r.icon} size={14} /></div>
                    <div className="flex1"><div className="fw6 text-13">{r.short}</div></div>
                    {r.id===originalRole && <Badge tone="gray" square>You</Badge>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex1" />

          {/* Bell */}
          <div style={{ position:'relative' }} data-tour="bell">
            <button onClick={()=>{ setBellOpen(o=>!o); setSwitchOpen(false); }} style={{ position:'relative', background:'none', border:'1px solid var(--border-soft)', borderRadius:8, width:36, height:36, display:'grid', placeItems:'center', cursor:'pointer', color:'var(--text-2)' }}>
              <Icon name="bell" size={18} />
              {unread>0 && <span style={{ position:'absolute', top:-5, right:-5, background:'var(--red)', color:'#fff', fontSize:10, fontWeight:700, minWidth:17, height:17, borderRadius:9, display:'grid', placeItems:'center', padding:'0 4px' }}>{unread}</span>}
            </button>
            {bellOpen && <BellDropdown notifs={notifs} onClose={()=>setBellOpen(false)} go={go} />}
          </div>
        </header>

        {/* Nav */}
        <nav style={{ height:'var(--nav-h)', borderBottom:'1px solid var(--border-soft)', background:'#fff', display:'flex', alignItems:'stretch', padding:'0 12px', gap:2, flex:'none' }}>
          {NAV.map(n=>(
            <button key={n.id} data-tour={`nav-${n.id}`} onClick={()=>go(n.id)}
              className="row items-center gap-6"
              style={{ background:'none', border:'none', padding:'0 14px', cursor:'pointer', fontSize:13, fontWeight:600,
                color: route.section===n.id?'var(--navy)':'var(--text-2)',
                borderBottom: route.section===n.id?'2.5px solid var(--navy)':'2.5px solid transparent' }}>
              <Icon name={n.icon} size={16} /> {n.label}
            </button>
          ))}
        </nav>

        {/* Body */}
        <main style={{ flex:1, overflowY:'auto', background:'var(--gray-50)' }}>
          <div style={{ maxWidth:1240, margin:'0 auto', padding:'22px 24px 80px' }}>
            {tip && <ContextTip tip={tip} onClose={()=>setTip(null)} />}
            {route.section==='today' ? <window.Home ctx={ctx} /> : <window.Section ctx={ctx} />}
          </div>
        </main>

        {/* Footer simulate */}
        <footer style={{ flex:'none', borderTop:'1px solid var(--border-soft)', background:'#fff', padding:'8px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span className="muted text-xs">Collier Connect Staff · demo environment · 8 months of seeded activity</span>
          <button className="btn btn-sm" onClick={simulate}><Icon name="sparkle" size={13} /> Simulate new resident activity</button>
        </footer>

        {modal}
        {tourSteps && <window.Tour steps={tourSteps} onExit={()=>setTourSteps(null)} />}
        <ToastHost />
        {(bellOpen||switchOpen) && <div onClick={()=>{ setBellOpen(false); setSwitchOpen(false); }} style={{ position:'fixed', inset:0, zIndex:500 }} />}
      </div>
    );
  }

  const TIPS = {
    incoming: { title:'Incoming', body:'Every resident submission and mailed form lands here. Use the sub-tabs to switch between tickets, event requests, forms, and the moderation queue.' },
    loop: { title:'Response Loop', body:'The weekly rhythm: cluster resident input into themes, draft responses, and publish them after Manager approval.' },
    content: { title:'Content', body:'Create and manage projects, events, notices, and proposals. Items are filtered to your department by default.' },
    newsletter: { title:'Newsletter', body:'Most of the monthly issue auto-compiles from activity. The cover letter and sign-off are the human steps.' },
    insights: { title:'Insights', body:'Quick reads up top, then AI-surfaced insights that route straight into a workflow. Drill into any metric in Deep dive.' },
    settings: { title:'Settings', body:'Policies and configuration. Most settings are restricted to the Secretary and Manager; you have read access.' },
  };
  function ContextTip({ tip, onClose }) {
    return (
      <div className="ai-panel row items-start gap-12 mb-16" style={{ borderColor:'#c9d6ea' }}>
        <Icon name="sparkle" size={18} color="var(--blue)" />
        <div className="flex1"><div className="fw7 text-13">{tip.title}</div><div className="muted text-13 mt-4">{tip.body}</div></div>
        <button className="btn btn-ghost btn-sm" onClick={onClose}><Icon name="x" size={15} /></button>
      </div>
    );
  }

  function BellDropdown({ notifs, onClose, go }) {
    const [filter, setFilter] = useState('All');
    let items = notifs;
    if (filter==='Unread') items = items.filter(n=>n.unread);
    if (filter==='Important') items = items.filter(n=>n.important);
    return (
      <div className="card" style={{ position:'absolute', top:44, right:0, width:340, zIndex:600, overflow:'hidden' }}>
        <div className="row items-center justify-between" style={{ padding:'10px 14px', borderBottom:'1px solid var(--border-soft)' }}>
          <span className="fw7 text-13">Notifications</span>
          <div className="row gap-4">{['All','Unread','Important'].map(f=>(<button key={f} className={`chip ${filter===f?'active':''}`} style={{ fontSize:11, padding:'3px 8px' }} onClick={()=>setFilter(f)}>{f}</button>))}</div>
        </div>
        <div style={{ maxHeight:360, overflowY:'auto' }}>
          {items.length===0 && <div className="muted text-sm" style={{ padding:20, textAlign:'center' }}>Nothing here.</div>}
          {items.map((n,i)=>(
            <div key={i} className="row items-start gap-10" style={{ padding:'11px 14px', borderBottom:'1px solid var(--border-soft)', background: n.unread?'var(--blue-bg)':'#fff' }}>
              <div style={{ width:28, height:28, borderRadius:7, background:'#fff', border:'1px solid var(--border-soft)', display:'grid', placeItems:'center', color:'var(--navy)', flex:'none' }}><Icon name={n.icon} size={15} /></div>
              <div className="flex1"><div className="text-13" style={{ lineHeight:1.4 }}>{n.text}</div><div className="muted text-xs mt-4">{n.t} ago{n.important && <span> · <span style={{ color:'var(--red)', fontWeight:600 }}>Important</span></span>}</div></div>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{ width:'100%', padding:'9px', background:'var(--gray-50)', border:'none', borderTop:'1px solid var(--border-soft)', fontSize:12, fontWeight:600, color:'var(--blue)', cursor:'pointer' }}>View all notifications</button>
      </div>
    );
  }

  /* ============ MOBILE (field staff) ============ */
  function MobileApp({ ctx, role, setRole }) {
    const [tab, setTab] = useState('tickets');
    const isField = role==='pubworks';
    const dept = SEED.ROLES.find(r=>r.id===role).dept;
    const mine = ctx.store.tickets.filter(t=>t.dept===dept);
    const notifs = SEED.notifications[role] || SEED.defaultNotifs;
    return (
      <div className="col" style={{ height:'100%', maxWidth:480, margin:'0 auto', background:'#fff' }}>
        <header style={{ height:52, borderBottom:'1px solid var(--border-soft)', display:'flex', alignItems:'center', padding:'0 14px' }}><window.Logo /></header>
        <main style={{ flex:1, overflowY:'auto', background:'var(--gray-50)', padding:14 }}>
          {tab==='tickets' && (
            <div className="col gap-10">
              <h2 className="section-head">My assigned tickets</h2>
              {!isField && <div className="alert-callout text-13">This part of the dashboard is best on desktop. Field response and status updates work here; for Insights, Newsletter, and Response Loop please use a computer.</div>}
              {mine.map(t=>(
                <div key={t.id} className="card card-pad col gap-8" onClick={()=>ctx.openTicket(t, t.staffResp?'view':'respond')}>
                  <div className="row items-center gap-8"><window.PhaseBadge phase={t.phase} /><span className="muted text-xs">{t.id}</span></div>
                  <div className="fw6 text-13">{t.title}</div>
                  <div className="muted text-xs row items-center gap-4"><Icon name="pin" size={12} /> {t.loc}</div>
                  {!t.staffResp && <button className="btn btn-primary btn-sm btn-block">Quick respond</button>}
                </div>
              ))}
              {mine.length===0 && <window.Empty title="No tickets assigned" />}
            </div>
          )}
          {tab==='notifs' && (
            <div className="col gap-8"><h2 className="section-head">Notifications</h2>
              {notifs.map((n,i)=>(<div key={i} className="card card-pad row items-start gap-10"><Icon name={n.icon} size={16} color="var(--navy)" /><div className="flex1"><div className="text-13">{n.text}</div><div className="muted text-xs mt-4">{n.t} ago</div></div></div>))}
            </div>
          )}
          {tab==='profile' && (
            <div className="col gap-12"><h2 className="section-head">Profile</h2>
              <div className="card card-pad col gap-8"><window.SettingsRow k="Role" v={SEED.ROLES.find(r=>r.id===role).short} /><window.SettingsRow k="Department" v={dept} /></div>
              <div className="muted text-13">Switch roles or take the full tour on a desktop browser.</div>
            </div>
          )}
        </main>
        <nav style={{ height:60, borderTop:'1px solid var(--border-soft)', display:'flex' }}>
          {[['tickets','ticket','My Tickets'],['notifs','bell','Alerts'],['profile','user','Profile']].map(t=>(
            <button key={t[0]} onClick={()=>setTab(t[0])} className="col items-center justify-center flex1" style={{ background:'none', border:'none', gap:3, color: tab===t[0]?'var(--navy)':'var(--text-3)', cursor:'pointer' }}>
              <Icon name={t[1]} size={20} /><span style={{ fontSize:10.5, fontWeight:600 }}>{t[2]}</span>
            </button>
          ))}
        </nav>
      </div>
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
})();
