/* Onboarding entry screens + spotlight tour engine -> window.* */
(function () {
  const { useState, useEffect, useRef, useCallback } = React;
  const Icon = window.Icon, SEED = window.SEED;

  /* ============ ENTRY FLOW ============ */
  function OnboardingFlow({ onComplete }) {
    const [step, setStep] = useState('welcome'); // welcome | role | path
    const [role, setRole] = useState(null);

    return (
      <div style={{ minHeight:'100%', background:'linear-gradient(180deg,#eef2f8,#e3e9f2)', display:'flex', flexDirection:'column' }}>
        <div style={{ height:56, display:'flex', alignItems:'center', padding:'0 24px', borderBottom:'1px solid var(--border-soft)', background:'#fff' }}>
          <Logo />
        </div>
        <div style={{ flex:1, display:'grid', placeItems:'center', padding:'40px 20px' }}>
          {step==='welcome' && <Welcome onNext={()=>setStep('role')} />}
          {step==='role' && <RoleSelect role={role} setRole={setRole} onNext={()=>setStep('path')} onBack={()=>setStep('welcome')} />}
          {step==='path' && <PathChoice role={role} onPick={(tour)=>onComplete(role, tour)} onBack={()=>setStep('role')} />}
        </div>
      </div>
    );
  }

  function Logo({ light }) {
    return (
      <div className="row items-center gap-8">
        <div style={{ width:30, height:30, borderRadius:7, background: light?'#fff':'var(--navy)', display:'grid', placeItems:'center' }}>
          <Icon name="hub" size={18} color={light?'var(--navy)':'#fff'} />
        </div>
        <div className="col" style={{ lineHeight:1.1 }}>
          <span style={{ fontWeight:700, fontSize:15, color: light?'#fff':'var(--navy)', letterSpacing:'-0.01em' }}>Collier Connect</span>
          <span style={{ fontSize:10.5, fontWeight:600, letterSpacing:'0.5px', textTransform:'uppercase', color: light?'rgba(255,255,255,.7)':'var(--text-3)' }}>Staff Dashboard</span>
        </div>
      </div>
    );
  }

  function Welcome({ onNext }) {
    return (
      <div className="card" style={{ maxWidth:560, padding:'40px 40px 34px', textAlign:'center' }}>
        <div style={{ width:54, height:54, borderRadius:12, background:'var(--navy)', display:'grid', placeItems:'center', margin:'0 auto 22px' }}>
          <Icon name="hub" size={30} color="#fff" />
        </div>
        <h1 style={{ fontSize:30, fontWeight:700, margin:'0 0 16px', letterSpacing:'-0.02em', lineHeight:1.15 }}>Welcome to the Collier Connect staff dashboard.</h1>
        <p style={{ fontSize:15, color:'var(--text-2)', margin:'0 0 14px', lineHeight:1.55 }}>You have just been hired by Collier Township. This dashboard is what the staff uses to operate the resident-facing Collier Connect platform. You are being onboarded into the system.</p>
        <p style={{ fontSize:13.5, color:'var(--text-2)', margin:'0 0 26px', lineHeight:1.55 }}>This dashboard has been running for several months. You will see real activity already in the system: tickets at various stages, ongoing proposals with comment threads, completed newsletters, and response loop entries from prior months. You can also start new tasks to see how to add content yourself.</p>
        <button className="btn btn-primary btn-lg" onClick={onNext}>Pick your role <Icon name="arrowRight" size={16} /></button>
      </div>
    );
  }

  function RoleSelect({ role, setRole, onNext, onBack }) {
    return (
      <div style={{ maxWidth:1000, width:'100%' }}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <h1 style={{ fontSize:26, fontWeight:700, margin:'0 0 8px' }}>What role are you taking on?</h1>
          <p style={{ fontSize:14, color:'var(--text-2)', margin:0, maxWidth:620, marginInline:'auto' }}>Pick the role you have been hired into. This sets your dashboard view. You can switch to view as other roles later using the View As dropdown in the header.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12 }} className="role-grid">
          {SEED.ROLES.map(r => (
            <button key={r.id} onClick={()=>setRole(r.id)}
              className="card"
              style={{ textAlign:'left', padding:14, cursor:'pointer', border: role===r.id?'2px solid var(--navy)':'1px solid var(--border-soft)', background: role===r.id?'var(--navy-100)':'#fff', boxShadow: role===r.id?'var(--shadow-md)':'var(--shadow-sm)', transition:'all .12s' }}>
              <div className="row items-center gap-8 mb-8">
                <div style={{ width:30, height:30, borderRadius:7, background: role===r.id?'var(--navy)':'var(--gray-100)', display:'grid', placeItems:'center', color: role===r.id?'#fff':'var(--navy)', flex:'none' }}>
                  <Icon name={r.icon} size={17} />
                </div>
                <span style={{ fontWeight:700, fontSize:13, lineHeight:1.2 }}>{r.short}</span>
              </div>
              <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.4 }}>{r.desc}</div>
            </button>
          ))}
        </div>
        <div className="row items-center justify-between mt-24">
          <button className="btn btn-ghost" onClick={onBack}><Icon name="chevLeft" size={16} /> Back</button>
          <button className="btn btn-primary btn-lg" disabled={!role} onClick={onNext}>Continue <Icon name="arrowRight" size={16} /></button>
        </div>
      </div>
    );
  }

  function PathChoice({ role, onPick, onBack }) {
    const r = SEED.ROLES.find(x=>x.id===role);
    return (
      <div style={{ maxWidth:560, width:'100%' }}>
        <div style={{ textAlign:'center', marginBottom:8 }}>
          <Badge tone="blue" square>{r.short}</Badge>
        </div>
        <div style={{ textAlign:'center', marginBottom:26 }}>
          <h1 style={{ fontSize:26, fontWeight:700, margin:'12px 0 8px' }}>How do you want to learn?</h1>
          <p style={{ fontSize:14, color:'var(--text-2)', margin:0 }}>We can walk you through what you need to know, or you can explore on your own.</p>
        </div>
        <div className="col gap-12">
          <PathOption fill title="Walk me through it." sub={`Guided tour for ${r.short}. About 25 to 30 minutes.`} onClick={()=>onPick('role')} />
          <PathOption outline title="Show me everything." sub="Full tour across all roles. About 45 to 60 minutes." onClick={()=>onPick('full')} />
          <button onClick={()=>onPick(null)} style={{ background:'none', border:'none', textAlign:'center', padding:'10px', marginTop:4 }}>
            <span style={{ color:'var(--blue)', fontWeight:600, fontSize:14 }}>I will explore on my own.</span>
            <div style={{ color:'var(--text-3)', fontSize:12.5, marginTop:3 }}>No tour. Contextual tips appear the first time you visit each section.</div>
          </button>
        </div>
        <div className="row items-center justify-center mt-16">
          <button className="btn btn-ghost" onClick={onBack}><Icon name="chevLeft" size={16} /> Change role</button>
        </div>
      </div>
    );
  }
  function PathOption({ title, sub, onClick, fill, outline }) {
    const Badge = window.Badge;
    return (
      <button onClick={onClick}
        style={{ textAlign:'left', padding:'16px 18px', borderRadius:8, cursor:'pointer',
          background: fill?'var(--navy)':'#fff', color: fill?'#fff':'var(--navy)',
          border: fill?'1px solid var(--navy)':outline?'1.5px solid var(--navy)':'1px solid var(--border-soft)' }}>
        <div style={{ fontWeight:700, fontSize:15 }}>{title}</div>
        <div style={{ fontSize:12.5, marginTop:3, color: fill?'rgba(255,255,255,.8)':'var(--text-2)' }}>{sub}</div>
      </button>
    );
  }

  /* ============ SPOTLIGHT TOUR ENGINE ============ */
  /* steps: [{ sel, title, body, type:'feature'|'nav', placement, pre }] */
  function Tour({ steps, onExit, onNavigate }) {
    const [i, setI] = useState(0);
    const [rect, setRect] = useState(null);
    const [visible, setVisible] = useState(false); // tooltip fade
    const step = steps[i];

    const measure = useCallback(() => {
      if (!step) return;
      const el = document.querySelector(step.sel);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top:r.top, left:r.left, width:r.width, height:r.height });
      } else {
        setRect(null);
      }
    }, [step]);

    // when step changes: run the 3-part transition
    useEffect(() => {
      if (!step) return;
      setVisible(false); // fade out old tooltip
      if (step.pre) step.pre();
      // allow any view change to render, then move cutout
      const t1 = setTimeout(() => { measure(); }, 160);
      const t2 = setTimeout(() => { setVisible(true); }, 480);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [i]);

    useEffect(() => {
      const onResize = () => measure();
      window.addEventListener('resize', onResize);
      const iv = setInterval(measure, 600); // keep cutout aligned if layout shifts
      return () => { window.removeEventListener('resize', onResize); clearInterval(iv); };
    }, [measure]);

    // click handler for nav steps: clicking the highlighted element advances
    useEffect(() => {
      if (!step || step.type!=='nav') return;
      const el = document.querySelector(step.sel);
      if (!el) return;
      const handler = () => { setTimeout(next, 120); };
      el.addEventListener('click', handler, { once:true });
      return () => el.removeEventListener('click', handler);
    }, [i, rect]);

    function next(){ if (i < steps.length-1) setI(i+1); else finish(); }
    function finish(){ onExit && onExit(); }

    if (!step) return null;
    const pad = 6;
    const cut = rect ? { top:rect.top-pad, left:rect.left-pad, width:rect.width+pad*2, height:rect.height+pad*2 } : null;

    // tooltip placement
    let tip = { top: 0, left: 0 };
    const TW = 320;
    if (cut) {
      const place = step.placement || 'bottom';
      if (place==='bottom') { tip = { top: cut.top+cut.height+14, left: Math.min(Math.max(12, cut.left), window.innerWidth-TW-12) }; }
      else if (place==='top') { tip = { top: cut.top-14, left: Math.min(Math.max(12, cut.left), window.innerWidth-TW-12), translateY:'-100%' }; }
      else if (place==='right') { tip = { top: cut.top, left: Math.min(cut.left+cut.width+14, window.innerWidth-TW-12) }; }
      else if (place==='left') { tip = { top: cut.top, left: Math.max(12, cut.left-TW-14) }; }
    } else {
      tip = { top: window.innerHeight/2-100, left: window.innerWidth/2-TW/2 };
    }

    return (
      <div style={{ position:'fixed', inset:0, zIndex:7000, pointerEvents:'none' }}>
        {/* cutout */}
        {cut ? (
          <div style={{
            position:'fixed', top:cut.top, left:cut.left, width:cut.width, height:cut.height,
            borderRadius:8, boxShadow:'0 0 0 9999px rgba(18,28,48,0.60)',
            transition:'all .3s ease-in-out', pointerEvents:'none',
            outline:'2px solid rgba(255,255,255,.9)', outlineOffset:'2px'
          }} />
        ) : (
          <div style={{ position:'fixed', inset:0, background:'rgba(18,28,48,0.60)' }} />
        )}
        {/* block clicks except on the highlighted nav element */}
        {step.type==='nav' && cut && (
          <div style={{ position:'fixed', top:cut.top, left:cut.left, width:cut.width, height:cut.height, pointerEvents:'none' }} />
        )}
        {/* tooltip */}
        <div style={{
          position:'fixed', top:tip.top, left:tip.left, width:TW,
          transform: tip.translateY?`translateY(${tip.translateY})`:'none',
          background:'#fff', borderRadius:10, boxShadow:'var(--shadow-lg)', padding:'16px 18px',
          opacity: visible?1:0, transition:'opacity .2s', pointerEvents:'auto'
        }}>
          <div className="row items-center justify-between mb-8">
            <span className="eyebrow" style={{ color:'var(--blue)' }}>{step.type==='nav'?'Try it':'Step'} {i+1} / {steps.length}</span>
            <button onClick={finish} style={{ background:'none', border:'none', color:'var(--text-3)', fontSize:12, fontWeight:600, cursor:'pointer' }}>Skip tour</button>
          </div>
          <div className="subhead mb-8" style={{ fontSize:15 }}>{step.title}</div>
          <div className="text-13 muted" style={{ lineHeight:1.5 }}>{step.body}</div>
          <div className="row items-center justify-between mt-16">
            <div className="row gap-4">
              {steps.map((_,k)=><span key={k} style={{ width:6, height:6, borderRadius:3, background: k===i?'var(--navy)':'var(--border)' }} />)}
            </div>
            {step.type==='nav'
              ? <span className="text-sm fw6" style={{ color:'var(--blue)' }}>Tap the highlighted item</span>
              : <button className="btn btn-primary btn-sm" onClick={next}>{i===steps.length-1?'Finish':'Got it'}</button>}
          </div>
        </div>
      </div>
    );
  }

  Object.assign(window, { OnboardingFlow, Tour, Logo });
})();
