/* Newsletter print-artifact page renderer -> window._NewsletterSheet */
(function () {
  const SEED = window.SEED;
  const NAVY = '#1F3864', AMBERBG='#FFF4D6', AMBERBD='#D4A017', AMBERTX='#7A5A00', ALERTBG='#FBE5D6', ALERTAC='#C65911';
  const ink = '#222', ink2='#595959', line='#d8dbe0';

  function H({ children, sz=13 }) { return <div style={{ fontWeight:800, fontSize:sz, color:NAVY, letterSpacing:'-0.01em', marginBottom:6 }}>{children}</div>; }
  function Rule() { return <div style={{ height:2, background:NAVY, opacity:.15, margin:'7px 0' }} />; }

  function Sheet({ nl, page, scale=1 }) {
    return (
      <div style={{ transform:`scale(${scale})`, transformOrigin:'top center' }}>
        <div style={{ width:360, minHeight:566, background:'#fff', boxShadow:'0 6px 24px rgba(16,24,40,.22)', position:'relative', fontSize:9, lineHeight:1.45, color:ink, overflow:'hidden' }}>
          {page===1 && <Cover nl={nl} />}
          {page===2 && <Loop nl={nl} />}
          {page===3 && <Proposals nl={nl} />}
          {page===4 && <ComingUp nl={nl} />}
          {page===5 && <Engage nl={nl} />}
          {page===6 && <Form nl={nl} />}
          {page===7 && <Back nl={nl} />}
          <div style={{ position:'absolute', bottom:5, right:10, fontSize:7, color:ink2 }}>{page}</div>
        </div>
      </div>
    );
  }

  function Cover({ nl }) {
    const incl = ['Cover','Response Loop','Proposals','Coming Up','How to Engage','Feedback Form'];
    return (
      <div>
        <div style={{ background:NAVY, color:'#fff', padding:'16px 18px' }}>
          <div style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.02em' }}>Collier Connect</div>
          <div style={{ fontSize:9, opacity:.85, marginTop:2, textTransform:'uppercase', letterSpacing:1 }}>Township Newsletter · {nl.month}</div>
        </div>
        <div style={{ padding:'14px 18px', display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:12 }}>
          <div>
            <H sz={11}>A Letter From the Township Manager</H>
            <div style={{ whiteSpace:'pre-wrap', fontSize:8.5, color:ink }}>{nl.cover.letter}</div>
          </div>
          <div style={{ borderLeft:`1px solid ${line}`, paddingLeft:10 }}>
            <div style={{ fontSize:8, fontWeight:800, textTransform:'uppercase', letterSpacing:.6, color:ink2, marginBottom:5 }}>In This Issue</div>
            {incl.map((s,i)=>(<div key={i} style={{ fontSize:8.5, padding:'2px 0', borderBottom:`1px dotted ${line}` }}>{s}</div>))}
          </div>
        </div>
        <div style={{ margin:'4px 18px 16px', background:AMBERBG, border:`1px solid ${AMBERBD}`, borderRadius:6, padding:'11px 13px' }}>
          <div style={{ fontSize:8, fontWeight:800, textTransform:'uppercase', letterSpacing:.6, color:AMBERTX, marginBottom:3 }}>One Question for {nl.month.split(' ')[0]}</div>
          <div style={{ fontSize:11, fontWeight:700, color:AMBERTX }}>{nl.cover.oneQuestion}</div>
          <div style={{ fontSize:8, color:AMBERTX, marginTop:4 }}>Tell us on the form inside, or post on Collier Connect.</div>
        </div>
      </div>
    );
  }

  function Loop({ nl }) {
    const themes = nl.loopThemes.filter(t=>t.include).slice(0,6);
    return (
      <div style={{ padding:'14px 18px' }}>
        <H>You Said, We Did</H>
        <div style={{ fontSize:8, color:ink2, marginBottom:8 }}>Every month we gather what residents tell us and show what the township did about it. Here is this month's loop.</div>
        {themes.map(t=>(
          <div key={t.id} style={{ marginBottom:9, paddingBottom:9, borderBottom:`1px solid ${line}` }}>
            <div style={{ fontWeight:700, fontSize:9.5, marginBottom:3 }}>{t.title}</div>
            <div style={{ fontSize:8.5, marginBottom:3 }}><b style={{ color:NAVY }}>You said:</b> {t.youSaid}</div>
            <div style={{ fontSize:8.5, background:AMBERBG, border:`1px solid ${AMBERBD}`, borderRadius:4, padding:'5px 7px', color:AMBERTX }}><b>We did:</b> {t.summary}</div>
            <div style={{ fontSize:7.5, color:ink2, marginTop:3 }}>{t.count} residents raised this · {t.dept}</div>
          </div>
        ))}
        {themes.length===0 && <div style={{ fontSize:9, color:ink2 }}>No themes selected yet.</div>}
      </div>
    );
  }

  function Proposals({ nl }) {
    const props = nl.proposals.filter(p=>p.include).slice(0,3);
    return (
      <div style={{ padding:'14px 18px' }}>
        <H>Open for Your Feedback</H>
        <div style={{ fontSize:8, color:ink2, marginBottom:8 }}>These proposals are open for resident comment. Weigh in on the form inside or on Collier Connect.</div>
        {props.map(p=>(
          <div key={p.id} style={{ marginBottom:11, paddingBottom:10, borderBottom:`1px solid ${line}` }}>
            <div style={{ fontWeight:700, fontSize:10, color:NAVY }}>{p.name}</div>
            <div style={{ fontSize:8.5, margin:'3px 0' }}>{p.summary}</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, margin:'4px 0' }}>
              <div><div style={{ fontSize:7.5, fontWeight:800, color:'#548235', textTransform:'uppercase' }}>Benefits</div>{p.benefits.map((b,i)=>(<div key={i} style={{ fontSize:8 }}>+ {b}</div>))}</div>
              <div><div style={{ fontSize:7.5, fontWeight:800, color:ALERTAC, textTransform:'uppercase' }}>Considerations</div>{p.considerations.map((b,i)=>(<div key={i} style={{ fontSize:8 }}>· {b}</div>))}</div>
            </div>
            <div style={{ fontSize:7.5, color:ink2 }}>Cost: {p.cost} · Affects: {p.affected}</div>
            <div style={{ fontSize:8, fontWeight:700, color:NAVY, marginTop:3 }}>How to weigh in: check the box on page 6 by {p.deadline}.</div>
          </div>
        ))}
        {props.length===0 && <div style={{ fontSize:9, color:ink2 }}>No proposals featured yet.</div>}
      </div>
    );
  }

  function ComingUp({ nl }) {
    const events = nl.comingUp.filter(i=>i.include && i.kind==='event');
    const notices = nl.comingUp.filter(i=>i.include && i.kind!=='event');
    return (
      <div style={{ padding:'14px 18px' }}>
        <H>Coming Up in {nl.month.split(' ')[0]}</H>
        {events.map(e=>(
          <div key={e.id} style={{ display:'flex', gap:9, alignItems:'center', padding:'5px 0', borderBottom:`1px solid ${line}` }}>
            <div style={{ minWidth:42, textAlign:'center', background:NAVY, color:'#fff', borderRadius:4, padding:'4px 3px', fontSize:8, fontWeight:700 }}>{e.date}</div>
            <div><div style={{ fontWeight:700, fontSize:9 }}>{e.name}</div><div style={{ fontSize:8, color:ink2 }}>{e.loc}</div></div>
          </div>
        ))}
        <div style={{ marginTop:9 }}>
          {notices.map(n=>(
            <div key={n.id} style={{ background:n.kind==='alert'?ALERTBG:AMBERBG, border:`1px solid ${n.kind==='alert'?ALERTAC:AMBERBD}`, borderRadius:4, padding:'5px 8px', marginBottom:5, fontSize:8.5, color:n.kind==='alert'?'#8a3d0d':AMBERTX }}>
              <b>{n.name}</b> · {n.date} · {n.loc}
            </div>
          ))}
        </div>
        <div style={{ marginTop:8, background:AMBERBG, border:`1px solid ${AMBERBD}`, borderRadius:4, padding:'7px 9px', fontSize:8, color:AMBERTX }}>
          <b style={{ textTransform:'uppercase', letterSpacing:.5 }}>Feedback deadlines:</b> Recycling Expansion (Jul 28), Downtown Mixed-Use Zoning (Aug 5).
        </div>
      </div>
    );
  }

  function Engage({ nl }) {
    const pair = SEED.nlExamplePairs.find(p=>p.id===nl.engage.examplePair) || SEED.nlExamplePairs[0];
    return (
      <div style={{ padding:'14px 18px' }}>
        <H>How to Engage</H>
        <div style={{ fontSize:8.5, color:ink, marginBottom:8 }}>You can take part by mail or online. Fill out the form on the next pages and drop it back, or post on Collier Connect from your phone.</div>
        <div style={{ fontSize:8, fontWeight:800, textTransform:'uppercase', letterSpacing:.5, color:ink2, marginBottom:4 }}>Two Ways to Start</div>
        <div style={{ background:'#f2f2f2', borderRadius:4, padding:'7px 9px', fontSize:8.5, marginBottom:5 }}>1. {pair.a}</div>
        <div style={{ background:'#f2f2f2', borderRadius:4, padding:'7px 9px', fontSize:8.5, marginBottom:10 }}>2. {pair.b}</div>
        <div style={{ fontSize:8, fontWeight:800, textTransform:'uppercase', letterSpacing:.5, color:ink2, marginBottom:4 }}>Earn Local Rewards</div>
        <div style={{ fontSize:8.5, marginBottom:8 }}>{nl.engage.rewardIntro}</div>
        {nl.engage.specialNote && <div style={{ background:AMBERBG, border:`1px solid ${AMBERBD}`, borderRadius:4, padding:'7px 9px', fontSize:8.5, color:AMBERTX }}><b>A note from the township:</b> {nl.engage.specialNote}</div>}
      </div>
    );
  }

  function Form({ nl }) {
    const selected = nl.proposals.filter(p=>p.include);
    const rewards = nl.form.rewardIds.map(id=>SEED.rewards.find(r=>r.id===id)).filter(Boolean);
    const Box = ({ children }) => <span style={{ display:'inline-block', width:8, height:8, border:`1px solid ${ink}`, marginRight:4, verticalAlign:'middle' }} />;
    const Field = ({ label }) => <div style={{ marginBottom:6 }}><div style={{ fontSize:8, fontWeight:700 }}>{label}</div><div style={{ borderBottom:`1px solid ${line}`, height:11 }} /></div>;
    return (
      <div style={{ padding:'12px 18px' }}>
        <div style={{ background:NAVY, color:'#fff', textAlign:'center', padding:'6px', borderRadius:4, fontSize:10, fontWeight:800, marginBottom:8 }}>Resident Feedback Form</div>
        <Sec t="A. Proposal feedback">
          {selected.length? selected.map(p=>(<div key={p.id} style={{ fontSize:8.5 }}><Box /> {p.name} <span style={{ color:ink2 }}>(by {p.deadline})</span></div>)) : <div style={{ fontSize:8, color:ink2 }}>No proposals featured.</div>}
          <div style={{ fontSize:7.5, color:ink2, marginTop:2 }}>Support / Oppose / Support with conditions</div>
        </Sec>
        <Sec t="B. Report an issue"><Field label="What and where?" /></Sec>
        <Sec t="C. Request an event"><Field label="Event, date, location" /></Sec>
        <Sec t="D. General feedback"><Field label="Anything else?" /></Sec>
        <Sec t="E. Choose a reward">
          {rewards.map(r=>(<div key={r.id} style={{ fontSize:8.5 }}><Box /> {r.name} <span style={{ color:ink2 }}>· {r.partner}</span></div>))}
        </Sec>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          <Sec t="F. Your contact"><Field label="Name / address / email" /></Sec>
          <Sec t="G. Return options"><div style={{ fontSize:8 }}><Box /> Mail it back<br /><Box /> Drop at Municipal Bldg</div></Sec>
        </div>
      </div>
    );
  }
  function Sec({ t, children }) {
    return <div style={{ border:`1px solid ${line}`, borderRadius:4, padding:'6px 8px', marginBottom:6 }}><div style={{ fontSize:8.5, fontWeight:800, color:NAVY, marginBottom:3 }}>{t}</div>{children}</div>;
  }

  function Back({ nl }) {
    return (
      <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column', height:566, justifyContent:'space-between' }}>
        <div>
          <H>Stay Connected</H>
          <div style={{ fontSize:9 }}><b>Township of Collier</b></div>
          <div style={{ fontSize:8.5, color:ink2 }}>2418 Hilltop Road, Presto, PA 15142</div>
          <div style={{ fontSize:8.5, color:ink2 }}>(412) 276-5571 · collier-township.org</div>
          <Rule />
          <div style={{ fontSize:8, fontWeight:800, textTransform:'uppercase', letterSpacing:.5, color:ink2, marginBottom:4 }}>Drop-off Locations</div>
          <div style={{ fontSize:8.5 }}>Municipal Building lobby · Collier Library · Webb Park rec center</div>
        </div>
        <div style={{ background:NAVY, color:'#fff', borderRadius:6, padding:'12px 14px', textAlign:'center' }}>
          <div style={{ fontSize:10, fontWeight:700 }}>Thank you for shaping Collier Township.</div>
          <div style={{ fontSize:8, opacity:.85, marginTop:3 }}>Every form you return helps your neighbors.</div>
        </div>
      </div>
    );
  }

  window._NewsletterSheet = Sheet;
})();
