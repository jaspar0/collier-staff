/* Workflows part 2: response loop, project update, content creation, finance, insight->action */
(function () {
  const { useState } = React;
  const Icon = window.Icon, SEED = window.SEED;
  const { Modal, Badge, AIButton, AILabel, Spinner, toast } = window;

  function Steps({ steps, cur }) {
    return (
      <div className="steps">
        {steps.map((s,i)=>(
          <React.Fragment key={i}>
            {i>0 && <span className="step-line" />}
            <div className={`step-dot ${i===cur?'active':i<cur?'done':''}`}>
              <span className="n">{i<cur?<Icon name="check" size={12} />:i+1}</span>{s}
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  }

  /* ===== RESPONSE LOOP DRAFTING (Secretary) - 4 steps ===== */
  function ResponseLoopModal({ ctx, onClose }) {
    const [step, setStep] = useState(0);
    const [themes, setThemes] = useState([]);
    const [generated, setGenerated] = useState(false);

    function genThemes() {
      setThemes(SEED.rlDraftThemes.map(t=>({ ...t, draft:'' })));
      setGenerated(true);
    }
    function draftFor(id) {
      setThemes(ts => ts.map(t => t.id===id ? { ...t, draft: themeDraft(t) } : t));
    }
    function themeDraft(t) {
      return `On ${t.name.toLowerCase()}: we heard from ${t.count} residents this week. ${themeBody(t.name)} We will keep this thread updated as work progresses.\n\n- Township of Collier`;
    }
    function themeBody(name) {
      const map = {
        'Boyce Road conditions':'The worst stretch is being folded into the Boyce Road resurfacing project so the repair lasts, rather than a temporary patch.',
        'Drainage after storms':'Public Works and Sewer are inspecting the flagged grates at Webb Park and Mill Street and will clear or resize them as needed.',
        'Trail and park upkeep':'Parks has scheduled brush clearing on the north trail and is coordinating a volunteer cleanup day later this month.',
        'Recycling expansion questions':'The expanded pickup proposal goes to a board vote on July 28. Details on materials and any fee impact are posted on the proposal page.',
        'School zone speeding':'A speed-limit reduction in school zones is under board review, and enhanced signage is going up in the interim.',
        'Streetlight outages':'The reported outages on Mill Street have been logged and the photocells are scheduled for replacement this week.',
      };
      return map[name] || 'The responsible department has reviewed these and an update is posted on the related items.';
    }
    function rename(id, name){ setThemes(ts=>ts.map(t=>t.id===id?{...t,name}:t)); }
    function remove(id){ setThemes(ts=>ts.filter(t=>t.id!==id)); }
    function submit() {
      ctx.update(s => ({ ...s, rlPending: (s.rlPending||0) + themes.filter(t=>t.draft).length }));
      setStep(3);
    }

    const titles = ['Aggregate feedback','Draft Responses','Review and submit','Submitted'];
    const footer = (
      step===0 ? <><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!generated} onClick={()=>setStep(1)}>Next: Draft Responses <Icon name="arrowRight" size={15} /></button></>
      : step===1 ? <><button className="btn" onClick={()=>setStep(0)}>Back</button><button className="btn btn-primary" disabled={themes.some(t=>!t.draft)} onClick={()=>setStep(2)}>Next: Review <Icon name="arrowRight" size={15} /></button></>
      : step===2 ? <><button className="btn" onClick={()=>setStep(1)}>Back</button><button className="btn btn-primary" onClick={submit}>Submit to Manager for Approval</button></>
      : <button className="btn btn-primary btn-block" onClick={onClose}>Done</button>
    );

    return (
      <Modal wide title="Response loop · this week" sub={titles[step]} onClose={step===3?onClose:onClose} footer={footer}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border-soft)' }}><Steps steps={['Aggregate','Draft','Review','Done']} cur={step} /></div>
        <div className="modal-body">
          {step===0 && (
            <div className="col gap-16">
              <div className="ai-panel row items-center justify-between">
                <div><AILabel>Theme clustering</AILabel><div className="text-13 mt-8">Cluster this week's resident input - tickets, comments, mailed feedback - into themes. Rename, merge, or remove any before drafting.</div></div>
                {!generated && <AIButton label="Generate Themes" loadingLabel="Clustering…" onResult={genThemes} delay={2000} />}
              </div>
              {generated && (
                <div className="col gap-8">
                  <div className="muted text-sm">{themes.length} themes from {themes.reduce((a,t)=>a+t.count,0)} resident inputs:</div>
                  {themes.map(t=>(
                    <div key={t.id} className="card card-pad row items-start gap-12">
                      <Badge tone="purple" square>{t.count}</Badge>
                      <div className="flex1">
                        <input className="input" value={t.name} onChange={e=>rename(t.id, e.target.value)} style={{ fontWeight:600, border:'1px solid transparent', background:'transparent', padding:'2px 4px' }} />
                        <div className="muted text-xs mt-4" style={{ paddingLeft:4 }}>{t.quotes.map((q,i)=><div key={i}>{q}</div>)}</div>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={()=>remove(t.id)} title="Remove theme"><Icon name="x" size={15} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {step===1 && (
            <div className="col gap-12">
              <div className="muted text-sm">Draft a township response for each theme. AI writes the first draft; you edit it.</div>
              {themes.map(t=>(
                <div key={t.id} className="card card-pad col gap-8">
                  <div className="row items-center justify-between">
                    <div className="row items-center gap-8"><Badge tone="purple" square>{t.count}</Badge><span className="fw7 text-13">{t.name}</span></div>
                    {!t.draft && <AIButton label="Draft Response" loadingLabel="Drafting…" onResult={()=>draftFor(t.id)} />}
                  </div>
                  {t.draft && <><textarea className="textarea" value={t.draft} onChange={e=>setThemes(ts=>ts.map(x=>x.id===t.id?{...x,draft:e.target.value}:x))} style={{ minHeight:96 }} /><div className="row items-center gap-6"><AILabel /><span className="muted text-xs">Edit in the township voice before submitting.</span></div></>}
                </div>
              ))}
            </div>
          )}
          {step===2 && (
            <div className="col gap-12">
              <div className="muted text-sm">Review each theme and its draft side by side, then submit to the Manager.</div>
              {themes.map(t=>(
                <div key={t.id} style={{ display:'grid', gridTemplateColumns:'200px 1fr', gap:14 }} className="card card-pad">
                  <div><div className="fw7 text-13 mb-4">{t.name}</div><Badge tone="purple" square>{t.count} inputs</Badge><div className="muted text-xs mt-8">{t.quotes[0]}</div></div>
                  <div className="amber-callout text-13">{t.draft}</div>
                </div>
              ))}
            </div>
          )}
          {step===3 && (
            <div className="col items-center gap-12" style={{ padding:'24px 0', textAlign:'center' }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--green-bg)', display:'grid', placeItems:'center' }}><Icon name="check" size={22} color="var(--green)" /></div>
              <div className="subhead">{themes.filter(t=>t.draft).length} drafts submitted for approval</div>
              <div className="muted text-13" style={{ maxWidth:420 }}>They are now in the Township Manager's approval queue. Nothing publishes until the Manager approves each one.</div>
            </div>
          )}
        </div>
      </Modal>
    );
  }

  /* ===== RESPONSE LOOP APPROVAL (Manager) ===== */
  function RLApprovalModal({ ctx, onClose }) {
    const seedDrafts = [
      { id:'d1', theme:'Boyce Road conditions', count:9, draft:'We heard from 9 residents about Boyce Road. The worst stretch near the bridge is being folded into the Boyce Road resurfacing project so the repair lasts. - Township of Collier', note:'High volume this week; recommend publishing.' },
      { id:'d2', theme:'Drainage after storms', count:7, draft:'Seven residents flagged drainage after the Tuesday storm. Sewer is inspecting the Webb Park and Mill Street grates and will clear or resize as needed. - Township of Collier', note:'' },
      { id:'d3', theme:'Recycling expansion', count:11, draft:'Many of you asked about expanded recycling. The proposal goes to a board vote July 28; details on materials and fees are on the proposal page. - Township of Collier', note:'Tie to the vote date.' },
      { id:'d4', theme:'School zone speeding', count:8, draft:'A school-zone speed-limit reduction is under board review, with enhanced signage going up in the interim. - Township of Collier', note:'' },
    ];
    const [drafts, setDrafts] = useState(seedDrafts);
    const [edit, setEdit] = useState({});

    function act(id, kind) {
      setDrafts(ds => ds.filter(d=>d.id!==id));
      if (kind==='approve') toast('Approved and published to the resident Home screen.', { icon:'check' });
      else toast('Sent back to the Secretary with comments.');
      ctx.update(s => ({ ...s, rlPending: Math.max(0,(s.rlPending||4)-1) }));
    }

    return (
      <Modal wide title="Response loop · approval queue" sub={`${drafts.length} draft${drafts.length===1?'':'s'} awaiting your approval`} onClose={onClose}
        footer={<button className="btn btn-primary btn-block" onClick={onClose}>Close</button>}>
        <div className="modal-body col gap-14">
          {drafts.length===0 && <window.Empty icon="check" title="Approval queue clear" sub="All response loop drafts have been handled. Approved responses are now live on the resident platform." />}
          {drafts.map(d=>(
            <div key={d.id} className="card card-pad col gap-10">
              <div className="row items-center justify-between">
                <div className="row items-center gap-8"><Badge tone="purple" square>{d.count} inputs</Badge><span className="fw7 text-13">{d.theme}</span></div>
                <AILabel>Drafted by Secretary</AILabel>
              </div>
              {edit[d.id]!==undefined ? (
                <textarea className="textarea" value={edit[d.id]} onChange={e=>setEdit(x=>({...x,[d.id]:e.target.value}))} style={{ minHeight:84 }} />
              ) : (
                <div className="amber-callout text-13">{d.draft}</div>
              )}
              {d.note && <div className="muted text-xs row items-center gap-4"><Icon name="doc" size={12} /> Secretary note: {d.note}</div>}
              <div className="row items-center justify-end gap-8">
                <button className="btn btn-danger btn-sm" onClick={()=>act(d.id,'reject')}>Reject and Send Back</button>
                {edit[d.id]!==undefined
                  ? <button className="btn btn-secondary btn-sm" onClick={()=>act(d.id,'approve')}>Save and Publish</button>
                  : <button className="btn btn-secondary btn-sm" onClick={()=>setEdit(x=>({...x,[d.id]:d.draft}))}>Edit</button>}
                <button className="btn btn-primary btn-sm" onClick={()=>act(d.id,'approve')}><Icon name="check" size={14} /> Approve and Publish</button>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    );
  }

  /* ===== PROJECT PHASE UPDATE (Public Works) ===== */
  function ProjectUpdateModal({ project, ctx, onClose }) {
    const phases = SEED.PHASES.slice(0,7);
    const curIdx = phases.indexOf(project.phase);
    const [note, setNote] = useState('');
    const [advance, setAdvance] = useState(false);

    function aiNote() {
      setNote(`Crews completed the latest scope on ${project.name}. ${advance? 'Work is moving into the next phase; ':''}residents can expect continued progress over the coming weeks. We will post the next update as milestones are reached.`);
    }
    function post() {
      ctx.update(s => ({ ...s, projects: s.projects.map(p=>p.id===project.id ? { ...p, stale:false, updated: SEED.daysAgo(0), phase: advance && curIdx<phases.length-1 ? phases[curIdx+1] : p.phase, note: note||p.note } : p) }));
      toast(`Update posted to ${project.name}. ${project.followers} followers notified.`, { icon:'check' });
      onClose();
    }

    return (
      <Modal title={project.name} sub={`${project.dept} · ${project.phase}`} onClose={onClose}
        footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!note} onClick={post}>Post Update</button></>}>
        <div className="modal-body col gap-16">
          {project.stale && <div className="alert-callout"><b>This project has not had a phase update in 5 weeks.</b> Residents who follow it expect to hear what is happening.</div>}
          <div>
            <div className="field-label">Phase</div>
            <div className="row items-center gap-4 wrap">
              {phases.map((p,i)=>(
                <React.Fragment key={p}>
                  {i>0 && <span style={{ width:14, height:2, background:'var(--border-soft)' }} />}
                  <span className="badge" style={{ background: i<curIdx?'var(--green-bg)':i===curIdx?'var(--navy)':'var(--gray-100)', color: i===curIdx?'#fff':i<curIdx?'var(--green)':'var(--text-3)' }}>{p}</span>
                </React.Fragment>
              ))}
            </div>
            <label className="row items-center gap-8 mt-12 text-13" style={{ cursor:'pointer' }}>
              <input type="checkbox" checked={advance} onChange={e=>setAdvance(e.target.checked)} disabled={curIdx>=phases.length-1} />
              Advance to next phase{curIdx<phases.length-1?` (${phases[curIdx+1]})`:''}
            </label>
          </div>
          <div className="ai-panel">
            <div className="row items-center justify-between mb-8"><AILabel>Phase note</AILabel><AIButton label="Suggest Phase Note" loadingLabel="Drafting…" onResult={aiNote} /></div>
            <textarea className="textarea" value={note} onChange={e=>setNote(e.target.value)} placeholder="Write a short update residents will see on the project page…" style={{ minHeight:80, background:'#fff' }} />
          </div>
        </div>
      </Modal>
    );
  }

  /* ===== EVENT CREATE (Parks) ===== */
  function EventCreateModal({ ctx, onClose, dept='Parks' }) {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [date, setDate] = useState('');
    const [tags, setTags] = useState(null);

    function suggestTags() {
      setTags({ archetype:['Event_Goer','Newcomer','Quiet_Supporter'], topic:['music','family','outdoor','free'], on:{} });
    }
    function toggle(group, t){ setTags(x=>({ ...x, on:{ ...x.on, [group+t]: !x.on[group+t] } })); }
    function publish() {
      toast(`Event published. Live on the resident map, calendar, and matching For You feeds.`, { icon:'check' });
      onClose();
    }
    return (
      <Modal title="Create an Event" sub={`Host: ${dept}`} onClose={onClose}
        footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!name||!date} onClick={publish}>Publish Event</button></>}>
        <div className="modal-body col gap-12">
          <div><div className="field-label">Event name</div><input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Movies in the Park" /></div>
          <div className="row gap-12">
            <div className="flex1"><div className="field-label">Date and time</div><input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} /></div>
            <div className="flex1"><div className="field-label">Location</div><input className="input" placeholder="e.g. Webb Park" /></div>
          </div>
          <div><div className="field-label">Description</div><textarea className="textarea" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="What is happening, who it is for…" /></div>
          <div className="ai-panel">
            <div className="row items-center justify-between mb-8"><AILabel>Audience tags</AILabel>{!tags && <AIButton label="Suggest Tags" loadingLabel="Analyzing…" onResult={suggestTags} disabled={!name} />}</div>
            {tags ? (
              <div className="col gap-8">
                <TagRow label="Archetype" items={tags.archetype} group="a" on={tags.on} toggle={toggle} />
                <TagRow label="Topic" items={tags.topic} group="t" on={tags.on} toggle={toggle} />
                <div className="muted text-xs">Confirm the tags that fit. Tagged events surface in matching residents' For You feeds.</div>
              </div>
            ) : <div className="muted text-sm">Fill the name and description, then suggest tags so the event reaches the right residents.</div>}
          </div>
        </div>
      </Modal>
    );
  }
  function TagRow({ label, items, group, on, toggle }) {
    return (
      <div className="row items-center gap-8 wrap"><span className="eyebrow" style={{ width:70 }}>{label}</span>
        {items.map(t=>{ const active = on[group+t]!==false; return (
          <button key={t} className={`chip ${active?'active':''}`} onClick={()=>toggle(group,t)}>{active && <Icon name="check" size={12} style={{marginRight:4}} />}{t}</button>
        ); })}
      </div>
    );
  }

  /* ===== NOTICE CREATE (Garbage & Recycling / any) ===== */
  function NoticeCreateModal({ ctx, onClose, dept='Garbage & Recycling' }) {
    const [type, setType] = useState('notice');
    const [title, setTitle] = useState('');
    function publish() {
      const n = { id:'N-'+Date.now(), title: title||'Untitled notice', type, range:'This week', nbhds:'All', dept };
      ctx.update(s => ({ ...s, notices: [n, ...s.notices] }));
      toast(`${type==='alert'?'Alert':'Notice'} published to the resident calendar, list, and feeds.`, { icon:'check' });
      onClose();
    }
    return (
      <Modal title="Create a Notice" sub={dept} onClose={onClose}
        footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!title} onClick={publish}>Publish</button></>}>
        <div className="modal-body col gap-12">
          <div><div className="field-label">Type</div>
            <div className="row gap-8">
              <button className={`chip ${type==='notice'?'active':''}`} onClick={()=>setType('notice')}>Notice (amber)</button>
              <button className={`chip ${type==='alert'?'active':''}`} onClick={()=>setType('alert')}>Alert (orange)</button>
            </div>
          </div>
          <div><div className="field-label">Title</div><input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Holiday schedule: collection one day later" /></div>
          <div className="row gap-12">
            <div className="flex1"><div className="field-label">Date range</div><input className="input" placeholder="e.g. Jul 6 - Jul 10" /></div>
            <div className="flex1"><div className="field-label">Affected neighborhoods</div><select className="select"><option>All neighborhoods</option>{SEED.NEIGHBORHOODS.map(n=><option key={n}>{n}</option>)}</select></div>
          </div>
          <div className={type==='alert'?'alert-callout':'amber-callout'} style={{ fontSize:12 }}>Preview: {type==='alert'?'Alert':'Notice'} will appear on the resident calendar and notice feed, and residents with matching preferences receive a digest.</div>
        </div>
      </Modal>
    );
  }

  /* ===== PROPOSAL ADVANCE (Planning) ===== */
  function ProposalAdvanceModal({ proposal, ctx, onClose }) {
    const stages = SEED.proposalStages;
    const idx = stages.indexOf(proposal.stage);
    const [callout, setCallout] = useState('');
    function aiCallout() {
      setCallout(`Recent feedback on ${proposal.name} centered on cost certainty and scope. In response, the plan now includes a clearer phasing schedule and a commitment to publish updated figures before the vote.`);
    }
    function advance() {
      ctx.update(s => ({ ...s, proposals: s.proposals.map(p=>p.id===proposal.id ? { ...p, stage: idx<stages.length-1?stages[idx+1]:p.stage } : p) }));
      toast(`${proposal.name} advanced to ${stages[idx+1]||proposal.stage}. Followers notified; stage feedback closed.`, { icon:'check' });
      onClose();
    }
    return (
      <Modal title={proposal.name} sub={`${proposal.dept} · ${proposal.stage}`} onClose={onClose}
        footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={idx>=stages.length-1} onClick={advance}>Advance to {stages[idx+1]||'final'}</button></>}>
        <div className="modal-body col gap-16">
          <div>
            <div className="field-label">Timeline</div>
            <div className="row items-center gap-4 wrap">
              {stages.map((st,i)=>(<React.Fragment key={st}>
                {i>0 && <span style={{ width:14, height:2, background:'var(--border-soft)' }} />}
                <span className="badge" style={{ background:i<idx?'var(--green-bg)':i===idx?'var(--navy)':'var(--gray-100)', color:i===idx?'#fff':i<idx?'var(--green)':'var(--text-3)' }}>{st}</span>
              </React.Fragment>))}
            </div>
          </div>
          <div className="card card-pad row items-center justify-between" style={{ background:'var(--gray-50)' }}>
            <span className="text-13">Add supporting documents</span>
            <button className="btn btn-secondary btn-sm" onClick={()=>toast('Document attached (placeholder). AI suggested a filename from the content.')}><Icon name="plus" size={14} /> Add Document</button>
          </div>
          <div className="ai-panel">
            <div className="row items-center justify-between mb-8"><AILabel>"How feedback shaped this" callout</AILabel><AIButton label="Suggest Callout" loadingLabel="Drafting…" onResult={aiCallout} /></div>
            <textarea className="textarea" value={callout} onChange={e=>setCallout(e.target.value)} placeholder="2 to 3 sentences on how resident feedback changed the proposal…" style={{ minHeight:72, background:'#fff' }} />
          </div>
          <div className="alert-callout text-xs">Advancing the stage updates the public timeline, notifies {proposal.comments} engaged residents, and closes stage-scoped feedback.</div>
        </div>
      </Modal>
    );
  }

  /* ===== FINANCE REVIEW ===== */
  function FinanceReviewModal({ ctx, onClose, subject='Expanded Recycling Pickup' }) {
    const [comments, setComments] = useState('');
    function submit(){ toast(`Financial Review submitted and routed to Planning.`, { icon:'check' }); onClose(); }
    return (
      <Modal title={`Financial Review · ${subject}`} sub="Submit a structured review to the owning department" onClose={onClose}
        footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={submit}>Submit Financial Review</button></>}>
        <div className="modal-body col gap-14">
          <table className="tbl card" style={{ overflow:'hidden' }}>
            <thead><tr><th>Scenario</th><th>Vendor</th><th>Annual cost</th><th>Per-household</th><th>Revenue impact</th></tr></thead>
            <tbody>
              <tr><td>Base (weekly)</td><td>Waste Mgmt</td><td>$182,000</td><td>+$3.10/mo</td><td className="muted">Neutral</td></tr>
              <tr><td>Reduced (biweekly)</td><td>Waste Mgmt</td><td>$121,000</td><td>+$1.95/mo</td><td className="muted">Neutral</td></tr>
              <tr><td>With glass</td><td>Republic</td><td>$214,000</td><td>+$3.80/mo</td><td style={{ color:'var(--green)' }}>+grant eligible</td></tr>
            </tbody>
          </table>
          <div><div className="field-label">Review comments (routed to Planning)</div><textarea className="textarea" value={comments} onChange={e=>setComments(e.target.value)} placeholder="Financial assessment, recommended scenario, conditions…" style={{ minHeight:90 }} /></div>
          <div className="row gap-8">
            <button className="chip">Recommend approval</button><button className="chip">Approve with conditions</button><button className="chip">Flag for review</button>
          </div>
        </div>
      </Modal>
    );
  }

  /* ===== INSIGHT -> PROPOSAL ===== */
  function ProposalFromPatternModal({ pattern, ctx, onClose }) {
    const [drafted, setDrafted] = useState(false);
    const [fields, setFields] = useState({ title:'', summary:'', cat:'' });
    function draft() {
      setFields({ title:'School Zone Safety Improvements', cat:'Traffic / Public Safety',
        summary:'Eighteen comments across multiple proposals and tickets raised concern about vehicle speed near schools at pickup and drop-off. This proposal would lower the school-zone speed limit, add enhanced signage and flashing beacons, and evaluate a crossing guard program.' });
      setDrafted(true);
    }
    function route(){ toast('Proposal draft created and routed to the Planning queue.', { icon:'check' }); onClose(); }
    return (
      <Modal title="Draft a Proposal from This Pattern" sub={pattern} onClose={onClose}
        footer={drafted ? <><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={route}>Create and Route to Planning</button></> : <button className="btn" onClick={onClose}>Cancel</button>}>
        <div className="modal-body col gap-12">
          {!drafted ? (
            <div className="ai-panel col gap-12 items-start"><AILabel>Pattern to proposal</AILabel><div className="text-13">AI will pre-draft a proposal title, summary, and category from the detected pattern. You review before it routes.</div><AIButton label="Draft Proposal from Pattern" loadingLabel="Drafting…" onResult={draft} delay={1900} /></div>
          ) : (
            <>
              <div><div className="field-label">Title</div><input className="input" value={fields.title} onChange={e=>setFields(f=>({...f,title:e.target.value}))} /></div>
              <div><div className="field-label">Category</div><input className="input" value={fields.cat} onChange={e=>setFields(f=>({...f,cat:e.target.value}))} /></div>
              <div><div className="field-label">Summary</div><textarea className="textarea" value={fields.summary} onChange={e=>setFields(f=>({...f,summary:e.target.value}))} style={{ minHeight:110 }} /></div>
              <div className="row items-center gap-6"><AILabel /><span className="muted text-xs">Pre-drafted from 18 resident comments. Edit before routing.</span></div>
            </>
          )}
        </div>
      </Modal>
    );
  }

  Object.assign(window, { ResponseLoopModal, RLApprovalModal, ProjectUpdateModal, EventCreateModal, NoticeCreateModal, ProposalAdvanceModal, FinanceReviewModal, ProposalFromPatternModal, Steps });
})();
