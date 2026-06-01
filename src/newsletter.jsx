/* Newsletter Assembly workflow — split workspace + live preview -> window.NewsletterAssembly */
(function () {
  const { useState, useRef } = React;
  const Icon = window.Icon, SEED = window.SEED;
  const { Badge, AIButton, AILabel, Spinner, Modal, toast } = window;

  const SECTIONS = [
    { key:'cover', name:'Cover', page:1, pages:'1', desc:'Masthead, Manager letter, One Question' },
    { key:'loop', name:'Response Loop', page:2, pages:'2', desc:'You Said, We Did' },
    { key:'proposals', name:'Proposals', page:3, pages:'3', desc:'Open for feedback' },
    { key:'comingup', name:'Coming Up', page:4, pages:'4', desc:'Events, notices, deadlines' },
    { key:'engage', name:'How to Engage', page:5, pages:'5', desc:'Tips and rewards intro' },
    { key:'form', name:'Form Pages', page:6, pages:'6-7', desc:'Mail-back feedback form' },
    { key:'back', name:'Back Cover', page:7, pages:'7', desc:'Contact and drop-off' },
  ];
  const SENT = { positive:['green','Positive'], neutral:['gray','Neutral'], negative:['orange','Negative leaning'] };

  function NewsletterAssembly({ ctx }) {
    const nl = ctx.store.nl;
    const [page, setPage] = useState(1);
    const [zoom, setZoom] = useState('width');
    const [printMode, setPrintMode] = useState(false);
    const [open, setOpen] = useState('loop');

    const isManager = ctx.role === 'manager';
    const managerReview = nl.status === 'manager-review';
    const readOnly = (isManager) || nl.status === 'sent';
    // Secretary can edit only in assembly; Manager edits cover letter only in review
    const canEditSection = (key) => {
      if (nl.status === 'sent') return false;
      if (isManager) return managerReview && key === 'cover';
      return nl.status === 'assembly';
    };

    function patchNl(fn) {
      ctx.update(s => { const n = JSON.parse(JSON.stringify(s.nl)); fn(n); return { ...s, nl:n }; });
    }
    function goSection(s) { setOpen(o => o===s.key ? o : s.key); setPage(s.page); }

    const completeCount = Object.values(nl.complete).filter(Boolean).length;
    const allComplete = completeCount === 7;

    function sectionStatus(key) {
      if (nl.complete[key]) return ['green','Ready'];
      if (key==='cover') return ['orange','In Progress'];
      if (key==='loop' || key==='proposals') return ['blue','AI Suggested'];
      if (key==='comingup') return ['purple','Auto-populated'];
      return ['gray','Needs Review'];
    }

    function sendToManager() {
      patchNl(n => { n.status='manager-review'; n.sentToManagerAt='just now'; });
      toast('Sent to Manager. Estimated review time: 2 to 3 business days.', { icon:'check' });
    }
    function sendBack(comment) {
      patchNl(n => { n.status='assembly'; n.managerComments = comment || 'Please revise and resubmit.'; });
      toast('Sent back to the Secretary with your comments.');
    }
    function confirmPrint() {
      patchNl(n => { n.status='sent'; });
      ctx.update(s => ({ ...s, newsletters: [{ id:'NL-new', month:nl.month, sent:'just now', recipients:2795, responseRate:nl.predictedRate }, ...s.newsletters] }));
      toast('Newsletter sent to print vendor. It will move to Past Issues once mailed.', { icon:'check' });
    }
    function startNext() {
      const next = JSON.parse(JSON.stringify(SEED.nlSeed));
      next.month = 'August 2026'; next.mailDate = 'August 30, 2026';
      ctx.update(s => ({ ...s, nl: next }));
      setPage(1); setOpen('loop');
    }

    // ===== Production / sent state =====
    if (nl.status === 'sent') {
      return (
        <div className="card card-pad col items-center gap-12" style={{ textAlign:'center', padding:'44px 24px' }}>
          <div style={{ width:44, height:44, borderRadius:'50%', background:'var(--green-bg)', display:'grid', placeItems:'center' }}><Icon name="check" size={24} color="var(--green)" /></div>
          <div className="subhead">The {nl.month} issue is in production</div>
          <div className="muted text-13" style={{ maxWidth:460 }}>It was sent to Bridgeville Print Services and is no longer editable. It will appear in Past Issues once mailed on {nl.mailDate}.</div>
          <button className="btn btn-secondary" onClick={startNext}><Icon name="plus" size={15} /> Start the August 2026 issue</button>
        </div>
      );
    }

    return (
      <>
        {/* header bar */}
        <div className="card card-pad mb-16">
          <div className="row items-center justify-between wrap gap-12">
            <div className="row items-center gap-12 wrap">
              <div><div className="subhead">{nl.month} Issue</div><div className="muted text-sm mt-4">Status: {managerReview?'Awaiting Manager Approval':'In Assembly'} · Target mail date: {nl.mailDate}</div></div>
              {managerReview && <Badge tone="orange" dot>In Manager review</Badge>}
            </div>
            <div className="row items-center gap-12">
              <div className="col" style={{ minWidth:150 }}>
                <div className="row items-center justify-between text-xs"><span className="muted">Sections complete</span><span className="fw7">{completeCount} of 7</span></div>
                <div className="pbar mt-4"><span style={{ width:(completeCount/7*100)+'%' }} /></div>
              </div>
              {!isManager && nl.status==='assembly' && (
                <button className="btn btn-primary" disabled={!allComplete} onClick={sendToManager} title={allComplete?'':'Mark all 7 sections complete first'}>Send to Manager for Approval</button>
              )}
            </div>
          </div>
          {nl.managerComments && !isManager && (
            <div className="alert-callout mt-12 text-13"><b>Returned by the Manager:</b> {nl.managerComments}</div>
          )}
          {/* predicted response rate */}
          <div className="ai-panel mt-12 row items-center gap-10">
            <Icon name="sparkle" size={16} color="var(--blue)" />
            <div className="flex1 text-13"><b>Estimated response rate for this issue: {nl.predictedRate}%</b> <span className="muted">— similar to past months with this content mix. A cover One Question callout historically lifts response by ~10 points.</span></div>
            <Signal text="Based on Jun 2026 response rate of 16% with a similar mix" />
          </div>
        </div>

        {/* split layout */}
        <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:16, alignItems:'start' }} className="nl-split">
          {/* LEFT: workspace */}
          <div className="col gap-10">
            {isManager && managerReview && <ManagerBar nl={nl} patchNl={patchNl} onApprove={()=>setPrintMode('handoff')} onSendBack={sendBack} />}
            {isManager && !managerReview && (
              <div className="ai-panel text-13" style={{ borderColor:'var(--border-soft)' }}><b>Still in assembly.</b> The Township Secretary is building this issue. It will arrive in your approval queue once submitted. You can preview the current draft on the right.</div>
            )}
            {!isManager && managerReview && (
              <div className="alert-callout text-13"><b>Submitted to the Manager.</b> Awaiting approval. You can preview the issue but cannot edit until it returns.</div>
            )}
            {SECTIONS.map(s => {
              const [tone,label] = sectionStatus(s.key);
              const isOpen = open===s.key;
              return (
                <div key={s.key} className="card" style={{ overflow:'hidden', borderColor:isOpen?'var(--navy)':'var(--border-soft)' }}>
                  <button onClick={()=>goSection(s)} className="row items-center gap-12" style={{ width:'100%', textAlign:'left', background: isOpen?'var(--navy-100)':'#fff', border:'none', padding:'12px 14px', cursor:'pointer' }}>
                    <span className="badge badge-gray" style={{ minWidth:30, justifyContent:'center' }}>{s.pages}</span>
                    <div className="flex1"><div className="fw7 text-13">{s.name}</div><div className="muted text-xs mt-4">{s.desc}</div></div>
                    {nl.complete[s.key] ? <Badge tone="green" dot>Ready</Badge> : <Badge tone={tone} dot>{label}</Badge>}
                    <Icon name={isOpen?'chevDown':'chevRight'} size={16} color="var(--text-3)" />
                  </button>
                  {isOpen && (
                    <div style={{ padding:'4px 14px 16px', borderTop:'1px solid var(--border-soft)' }}>
                      <SectionEditor sectionKey={s.key} nl={nl} patchNl={patchNl} readOnly={!canEditSection(s.key)} setPage={setPage} />
                      {!isManager && nl.status==='assembly' && (
                        <label className="row items-center gap-8 mt-12 text-13" style={{ cursor:'pointer', borderTop:'1px solid var(--border-soft)', paddingTop:12 }}>
                          <input type="checkbox" checked={!!nl.complete[s.key]} onChange={e=>patchNl(n=>{ n.complete[s.key]=e.target.checked; })} />
                          Mark <b>{s.name}</b> complete
                        </label>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* RIGHT: preview */}
          <div className="card" style={{ position:'sticky', top:8, overflow:'hidden' }}>
            <div className="row items-center justify-between" style={{ padding:'8px 12px', borderBottom:'1px solid var(--border-soft)', background:'var(--gray-50)' }}>
              <div className="row items-center gap-6">
                <button className="btn btn-ghost btn-sm" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}><Icon name="chevLeft" size={15} /></button>
                <span className="text-xs fw6">Page {page} of 7</span>
                <button className="btn btn-ghost btn-sm" onClick={()=>setPage(p=>Math.min(7,p+1))} disabled={page>=7}><Icon name="chevRight" size={15} /></button>
              </div>
              <div className="row items-center gap-4">
                {['width','height','actual'].map(z=>(<button key={z} className={`chip ${zoom===z?'active':''}`} style={{ fontSize:10.5, padding:'3px 7px' }} onClick={()=>setZoom(z)}>{z==='width'?'Fit W':z==='height'?'Fit H':'Actual'}</button>))}
                <button className="btn btn-ghost btn-sm" onClick={()=>setPrintMode('print')} title="Print preview"><Icon name="eye" size={15} /></button>
              </div>
            </div>
            <div style={{ background:'#e9ecf1', padding:16, maxHeight:'72vh', overflow:'auto', display:'flex', justifyContent:'center' }}>
              <NewsletterSheet nl={nl} page={page} scale={zoom==='actual'?1.18:zoom==='height'?0.74:0.96} />
            </div>
          </div>
        </div>

        {printMode==='print' && <PrintPreviewModal nl={nl} startPage={page} onClose={()=>setPrintMode(false)} />}
        {printMode==='handoff' && <PrintHandoffModal nl={nl} onClose={()=>setPrintMode(false)} onConfirm={()=>{ confirmPrint(); setPrintMode(false); }} />}
      </>
    );
  }

  /* ---- inline data signal (hover for source) ---- */
  function Signal({ text }) {
    return <span className="row items-center gap-4 muted text-xs" title={text} style={{ cursor:'help' }}><Icon name="sparkle" size={11} color="var(--blue)" /> source</span>;
  }
  function Sentiment({ s }) {
    const [tone,label] = SENT[s] || SENT.neutral;
    return <Badge tone={tone} dot>{label}</Badge>;
  }

  /* ===================== SECTION EDITORS ===================== */
  function SectionEditor({ sectionKey, nl, patchNl, readOnly, setPage }) {
    const map = { cover:CoverEditor, loop:LoopEditor, proposals:ProposalsEditor, comingup:ComingUpEditor, engage:EngageEditor, form:FormEditor, back:BackEditor };
    const C = map[sectionKey];
    return <C nl={nl} patchNl={patchNl} readOnly={readOnly} setPage={setPage} />;
  }

  function CoverEditor({ nl, patchNl, readOnly }) {
    return (
      <div className="col gap-14 mt-12">
        <div>
          <div className="row items-center justify-between mb-8"><div className="field-label" style={{ margin:0 }}>Manager's letter</div>
            {!readOnly && (nl.cover.letterDrafted
              ? <button className="btn btn-ghost btn-sm" onClick={()=>patchNl(n=>{ n.cover.letterDrafted=false; n.cover.letter=''; })}><Icon name="loop" size={13} /> Regenerate</button>
              : <AIButton label="Draft with AI" loadingLabel="Drafting…" onResult={()=>patchNl(n=>{ n.cover.letterDrafted=true; n.cover.letter=SEED.nlSeed.cover.letter; })} />)}
          </div>
          {nl.cover.letterDrafted
            ? <textarea className="textarea" value={nl.cover.letter} readOnly={readOnly} onChange={e=>patchNl(n=>{ n.cover.letter=e.target.value; })} style={{ minHeight:140 }} />
            : <div className="ai-panel text-sm muted">Click Draft with AI. The letter draws from this month's response loop themes, the calendar, and proposals open for feedback. You edit before it routes to the Manager for signature.</div>}
          <div className="muted text-xs mt-4">Signed with the Township Manager's name in the printed issue.</div>
        </div>
        <div>
          <div className="field-label">One Question for July</div>
          {!readOnly && <div className="ai-panel text-xs mb-8"><AILabel>Suggestion</AILabel> Most-engaged proposal this month is the recycling expansion. Suggested question: "Should we expand recycling pickup to twice monthly?" <Signal text="A cover One Question historically lifts response ~10 points" /></div>}
          <textarea className="textarea" value={nl.cover.oneQuestion} readOnly={readOnly} onChange={e=>patchNl(n=>{ n.cover.oneQuestion=e.target.value; })} style={{ minHeight:48 }} />
        </div>
      </div>
    );
  }

  function LoopEditor({ nl, patchNl, readOnly, setPage }) {
    const [editId, setEditId] = useState(null);
    const themes = nl.loopThemes;
    const incl = themes.filter(t=>t.include).length;
    function move(id, dir) {
      patchNl(n => { const a=n.loopThemes; const i=a.findIndex(t=>t.id===id); const j=i+dir; if(j<0||j>=a.length) return; [a[i],a[j]]=[a[j],a[i]]; });
    }
    return (
      <div className="col gap-8 mt-12">
        <div className="muted text-xs">The newsletter shows 4 to 6 themes. AI selected the {themes.filter(t=>t.include).length} with the highest resident engagement. Adjust as needed. <b>{incl} selected.</b></div>
        {themes.map((t,i)=>(
          <div key={t.id} className="card card-pad col gap-8" style={{ background: t.include?'#fff':'var(--gray-50)', borderColor: t.include?'var(--border-soft)':'var(--border-soft)' }}>
            <div className="row items-center gap-10">
              <input type="checkbox" checked={t.include} disabled={readOnly} onChange={()=>patchNl(n=>{ const x=n.loopThemes.find(z=>z.id===t.id); x.include=!x.include; })} />
              <div className="flex1"><div className="fw7 text-13">{t.title}</div>
                <div className="row items-center gap-8 mt-4 wrap">
                  <Badge tone="purple" square>{t.count} inputs</Badge>
                  <Sentiment s={t.sentiment} />
                  <span className="muted text-xs">{t.nbhds}</span>
                  <span className="muted text-xs">· {t.dept}</span>
                </div>
              </div>
              {!readOnly && <div className="col gap-2">
                <button className="btn btn-ghost btn-sm" style={{ padding:2 }} onClick={()=>move(t.id,-1)} disabled={i===0}><Icon name="arrowUp" size={13} /></button>
                <button className="btn btn-ghost btn-sm" style={{ padding:2 }} onClick={()=>move(t.id,1)} disabled={i===themes.length-1}><Icon name="arrowDown" size={13} /></button>
              </div>}
            </div>
            <div className="row items-center gap-8">
              <span className="ai-label" title={t.conf}><Icon name="sparkle" size={10} /> {t.confidence} confidence</span>
              <span className="muted text-xs" title={t.conf} style={{ cursor:'help' }}>{t.conf}</span>
              {!readOnly && <button className="btn btn-ghost btn-sm" style={{ marginLeft:'auto' }} onClick={()=>setEditId(editId===t.id?null:t.id)}>{editId===t.id?'Done':'Edit summary'}</button>}
            </div>
            {editId===t.id && (
              <div><div className="field-label">Newsletter summary (tighter than the full response)</div>
                <textarea className="textarea" value={t.summary} onChange={e=>patchNl(n=>{ n.loopThemes.find(z=>z.id===t.id).summary=e.target.value; })} style={{ minHeight:64 }} /></div>
            )}
          </div>
        ))}
      </div>
    );
  }

  function ProposalsEditor({ nl, patchNl, readOnly }) {
    const [editId, setEditId] = useState(null);
    const props = nl.proposals;
    const incl = props.filter(p=>p.include).length;
    function toggle(id) {
      const p = props.find(x=>x.id===id);
      if (!p.include && incl>=3) { toast('Up to 3 proposals fit on the page. Deselect one first.'); return; }
      patchNl(n=>{ const x=n.proposals.find(z=>z.id===id); x.include=!x.include; });
    }
    return (
      <div className="col gap-8 mt-12">
        <div className="muted text-xs">Ranked by deadline urgency, comment volume, and follower count. Feature 2, max 3. <b>{incl} selected.</b></div>
        {props.map(p=>(
          <div key={p.id} className="card card-pad col gap-8" style={{ background: p.include?'#fff':'var(--gray-50)' }}>
            <div className="row items-center gap-10">
              <input type="checkbox" checked={p.include} disabled={readOnly} onChange={()=>toggle(p.id)} />
              <div className="flex1"><div className="fw7 text-13">{p.name}</div>
                <div className="row items-center gap-8 mt-4 wrap">
                  <Badge tone="blue" square>{p.comments} comments</Badge>
                  <Badge tone="gray" square><Icon name="user" size={10} /> {p.followers} followers</Badge>
                  {p.urgent ? <Badge tone="red" dot>Due in {p.daysLeft} days</Badge> : <span className="muted text-xs">Due {p.deadline}</span>}
                </div>
              </div>
            </div>
            <div className="muted text-13" style={{ paddingLeft:26 }}>{p.summary}</div>
            <div className="row items-center gap-8" style={{ paddingLeft:26 }}>
              <span className="ai-label" title={p.rec}><Icon name="sparkle" size={10} /> AI</span>
              <span className="muted text-xs" style={{ cursor:'help' }} title={p.rec}>{p.rec}</span>
              <span className="muted text-xs">· {p.cost} · {p.affected}</span>
              {p.include && !readOnly && <button className="btn btn-ghost btn-sm" style={{ marginLeft:'auto' }} onClick={()=>setEditId(editId===p.id?null:p.id)}>{editId===p.id?'Done':'Edit'}</button>}
            </div>
            {editId===p.id && p.include && (
              <div className="col gap-8" style={{ paddingLeft:26 }}>
                <div><div className="field-label">Newsletter summary</div><textarea className="textarea" value={p.summary} onChange={e=>patchNl(n=>{ n.proposals.find(z=>z.id===p.id).summary=e.target.value; })} style={{ minHeight:54 }} /></div>
                <BulletPick label="Benefits to include" items={p.benefits} />
                <BulletPick label="Considerations to include" items={p.considerations} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
  function BulletPick({ label, items }) {
    const [on, setOn] = useState(items.map(()=>true));
    return (
      <div><div className="field-label">{label}</div>
        <div className="row gap-6 wrap">{items.map((b,i)=>(
          <button key={i} className={`chip ${on[i]?'active':''}`} onClick={()=>setOn(o=>o.map((v,j)=>j===i?!v:v))}>{on[i]&&<Icon name="check" size={11} style={{marginRight:3}} />}{b}</button>
        ))}</div>
      </div>
    );
  }

  function ComingUpEditor({ nl, patchNl, readOnly }) {
    const items = nl.comingUp;
    return (
      <div className="col gap-8 mt-12">
        <div className="muted text-xs">All July calendar items auto-populated. Uncheck anything too small for the newsletter.</div>
        {items.map(it=>(
          <div key={it.id} className="row items-center gap-10" style={{ padding:'6px 0', borderBottom:'1px solid var(--border-soft)' }}>
            <input type="checkbox" checked={it.include} disabled={readOnly} onChange={()=>patchNl(n=>{ const x=n.comingUp.find(z=>z.id===it.id); x.include=!x.include; })} />
            <Badge tone={it.kind==='alert'?'orange':it.kind==='notice'?'amber':'blue'} square>{it.kind}</Badge>
            <div className="flex1"><span className="fw6 text-13">{it.name}</span> <span className="muted text-xs">· {it.date} · {it.loc}</span></div>
            {it.hot && <Badge tone="green" dot title={`${it.rsvp} RSVPs, 2x typical`}>{it.rsvp} RSVPs</Badge>}
          </div>
        ))}
        <div className="ai-panel text-xs mt-4"><AILabel>Suggested cover highlights</AILabel> Independence Day Parade, July 4 trash delay, Boyce Road resurfacing July 21-23.</div>
        <div className="amber-callout text-xs"><b>Feedback deadlines this month:</b> Recycling Expansion (Jul 28), Downtown Mixed-Use Zoning (Aug 5).</div>
      </div>
    );
  }

  function EngageEditor({ nl, patchNl, readOnly }) {
    const pairs = SEED.nlExamplePairs;
    return (
      <div className="col gap-14 mt-12">
        <div>
          <div className="field-label">Posting-tip example pair</div>
          <div className="ai-panel text-xs mb-8"><AILabel>Suggestion</AILabel> Based on the proposals featured this issue, the events + proposal-feedback pair fits best.</div>
          <div className="col gap-6">{pairs.map(p=>(
            <label key={p.id} className="row items-start gap-8 card card-pad" style={{ cursor:'pointer', background: nl.engage.examplePair===p.id?'var(--navy-100)':'#fff' }}>
              <input type="radio" name="pair" checked={nl.engage.examplePair===p.id} disabled={readOnly} onChange={()=>patchNl(n=>{ n.engage.examplePair=p.id; })} />
              <div><div className="fw6 text-13">{p.label}</div><div className="muted text-xs mt-4">{p.a} / {p.b}</div></div>
            </label>
          ))}</div>
        </div>
        <div><div className="field-label">Reward intro copy</div><textarea className="textarea" value={nl.engage.rewardIntro} readOnly={readOnly} onChange={e=>patchNl(n=>{ n.engage.rewardIntro=e.target.value; })} style={{ minHeight:48 }} /></div>
        <div><div className="field-label">Special note from the township (optional)</div><textarea className="textarea" value={nl.engage.specialNote} readOnly={readOnly} onChange={e=>patchNl(n=>{ n.engage.specialNote=e.target.value; })} placeholder="Leave blank if none this month…" style={{ minHeight:48 }} /></div>
      </div>
    );
  }

  function FormEditor({ nl, patchNl, readOnly }) {
    const selected = nl.proposals.filter(p=>p.include);
    const rewards = SEED.rewards;
    function toggleReward(id) {
      const cur = nl.form.rewardIds;
      if (!cur.includes(id) && cur.length>=4) { toast('Up to 4 rewards fit on the form. Deselect one first.'); return; }
      patchNl(n=>{ n.form.rewardIds = cur.includes(id) ? cur.filter(x=>x!==id) : [...cur, id]; });
    }
    return (
      <div className="col gap-14 mt-12">
        <div>
          <div className="field-label">Section A — proposal feedback checkboxes (auto from featured proposals)</div>
          <div className="card card-pad col gap-6" style={{ background:'var(--gray-50)' }}>
            {selected.length===0 && <span className="muted text-sm">No proposals featured yet. Select proposals in Section 3.</span>}
            {selected.map(p=>(<div key={p.id} className="row items-center justify-between text-13"><span>☐ {p.name}</span><span className="muted text-xs">Deadline {p.deadline}</span></div>))}
          </div>
          <div className="muted text-xs mt-4">Verify the deadlines match the featured proposals.</div>
        </div>
        <div>
          <div className="field-label">Section E — feature up to 4 rewards ({nl.form.rewardIds.length}/4)</div>
          <div className="row gap-6 wrap">{rewards.map(r=>{ const on=nl.form.rewardIds.includes(r.id); return (
            <button key={r.id} className={`chip ${on?'active':''}`} disabled={readOnly} onClick={()=>toggleReward(r.id)}>{on&&<Icon name="check" size={11} style={{marginRight:3}} />}{r.name} ({r.partner})</button>
          ); })}</div>
          {nl.form.rewardIds.includes('R-1') && <div className="ai-panel text-xs mt-8"><AILabel>Suggestion</AILabel> Grist House drip coffee is the most-redeemed reward over the last 3 months. <Signal text="38 redemptions in 90 days; 320 of 500 monthly cap remaining" /></div>}
        </div>
        <div className="muted text-xs">Sections B, C, D, F, and G use the standard template (issue report, event request, general feedback, contact info, return options).</div>
      </div>
    );
  }

  function BackEditor({ nl, patchNl, readOnly }) {
    return (
      <div className="col gap-10 mt-12">
        <div className="muted text-13">Mostly static. The back cover prints township contact info and drop-off locations.</div>
        <div className="card card-pad col gap-6 text-13" style={{ background:'var(--gray-50)' }}>
          <div><b>Township of Collier</b> · 2418 Hilltop Rd, Presto PA 15142</div>
          <div className="muted">Phone (412) 276-5571 · collier-township.org</div>
          <div className="muted">Drop-off: Municipal Building lobby, Collier Library, Webb Park rec center</div>
        </div>
      </div>
    );
  }

  /* ===================== MANAGER BAR ===================== */
  function ManagerBar({ nl, patchNl, onApprove, onSendBack }) {
    const [signing, setSigning] = useState(false);
    const [sendBack, setSendBack] = useState(false);
    const [comment, setComment] = useState('');
    return (
      <div className="card card-pad col gap-10" style={{ borderColor:'var(--navy)' }}>
        <div className="row items-center gap-8"><Icon name="gavel" size={16} color="var(--navy)" /><span className="fw7 text-13">Manager review</span></div>
        <div className="muted text-13">Review each section in the preview. You sign the cover letter and approve the overall issue. The Secretary assembled the content.</div>
        {!sendBack ? (
          <div className="row gap-8 wrap">
            <button className="btn btn-secondary btn-sm" onClick={()=>setSigning(s=>!s)}><Icon name="doc" size={14} /> {signing?'Hide cover letter':'Review and sign cover letter'}</button>
            <button className="btn btn-sm" onClick={()=>setSendBack(true)}>Send back to Secretary</button>
            <button className="btn btn-primary btn-sm" style={{ marginLeft:'auto' }} onClick={onApprove}><Icon name="check" size={14} /> Approve and Send to Print Vendor</button>
          </div>
        ) : (
          <div className="col gap-8">
            <div className="field-label">What needs to change?</div>
            <textarea className="textarea" value={comment} onChange={e=>setComment(e.target.value)} placeholder="Comments for the Secretary…" style={{ minHeight:60 }} />
            <div className="row gap-8 justify-end"><button className="btn btn-sm" onClick={()=>setSendBack(false)}>Cancel</button><button className="btn btn-danger btn-sm" onClick={()=>onSendBack(comment)}>Send back with comments</button></div>
          </div>
        )}
        {signing && (
          <div className="col gap-8" style={{ borderTop:'1px solid var(--border-soft)', paddingTop:10 }}>
            <textarea className="textarea" value={nl.cover.letter} onChange={e=>patchNl(n=>{ n.cover.letter=e.target.value; })} style={{ minHeight:120 }} />
            <button className="btn btn-secondary btn-sm" style={{ alignSelf:'flex-start' }} onClick={()=>{ setSigning(false); toast('Cover letter signed and approved.'); }}><Icon name="check" size={14} /> Sign and approve the letter</button>
          </div>
        )}
      </div>
    );
  }

  /* ===================== PRINT HANDOFF ===================== */
  function PrintHandoffModal({ nl, onClose, onConfirm }) {
    const Row = window.SettingsRow;
    return (
      <Modal title="Send to Print Vendor" sub="This is the final commitment. After confirmation the issue is no longer editable." onClose={onClose}
        footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={onConfirm}><Icon name="check" size={15} /> Confirm and Send to Vendor</button></>}>
        <div className="modal-body col gap-2">
          <Row k="Distribution count" v="~2,795 households (all neighborhoods)" />
          <Row k="Mail date" v={`${nl.mailDate} (delivery Jul 31 - Aug 5)`} />
          <Row k="Estimated cost" v="$3,142 (printing + mailing + reply postage)" />
          <Row k="Print specs" v="6.5 x 11 in folded, full color, 70 lb, 8 pages" />
          <Row k="Vendor" v="Bridgeville Print Services" />
          <div className="alert-callout text-xs mt-12">After you confirm, the {nl.month} issue moves into the production pipeline and into Past Issues once mailed. A blank August issue will be created automatically.</div>
        </div>
      </Modal>
    );
  }

  /* ===================== PRINT PREVIEW (fullscreen) ===================== */
  function PrintPreviewModal({ nl, startPage, onClose }) {
    const [page, setPage] = useState(startPage || 1);
    return (
      <div className="modal-overlay" style={{ alignItems:'stretch', padding:0, background:'rgba(16,24,40,.75)' }} onMouseDown={e=>{ if(e.target===e.currentTarget) onClose(); }}>
        <div className="col" style={{ width:'100%' }}>
          <div className="row items-center justify-between" style={{ padding:'10px 18px', color:'#fff' }}>
            <span className="fw6">{nl.month} — Print preview</span>
            <div className="row items-center gap-10">
              <button className="btn btn-sm" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}><Icon name="chevLeft" size={15} /> Prev</button>
              <span style={{ color:'#fff', fontSize:13 }}>Page {page} of 7</span>
              <button className="btn btn-sm" onClick={()=>setPage(p=>Math.min(7,p+1))} disabled={page>=7}>Next <Icon name="chevRight" size={15} /></button>
              <button className="btn btn-sm" onClick={onClose}><Icon name="x" size={15} /> Close</button>
            </div>
          </div>
          <div style={{ flex:1, overflow:'auto', display:'flex', justifyContent:'center', alignItems:'flex-start', padding:'10px 20px 30px' }}>
            <NewsletterSheet nl={nl} page={page} scale={1.5} />
          </div>
        </div>
      </div>
    );
  }

  window.NewsletterAssembly = NewsletterAssembly;
  window.NewsletterSheet = null; // set in newsletter-pages.jsx
  window.__nlReady = () => { /* pages module attaches NewsletterSheet */ };

  // local ref used above resolves at render time:
  function NewsletterSheet(props) { return window._NewsletterSheet ? window._NewsletterSheet(props) : null; }
})();
