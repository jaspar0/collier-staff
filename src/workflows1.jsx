/* Workflows part 1: ticket detail/triage/respond, mailed form, event request -> window.* */
(function () {
  const { useState } = React;
  const Icon = window.Icon, SEED = window.SEED;
  const { Modal, Badge, PhaseBadge, AIButton, AILabel, Spinner, toast } = window;

  // ---- shared: photo placeholder ----
  function PhotoStub({ h=120 }) {
    return (
      <div style={{ height:h, background:'var(--gray-100)', border:'1px solid var(--border-soft)', borderRadius:6, display:'grid', placeItems:'center', color:'var(--text-3)' }}>
        <div className="col items-center gap-4"><Icon name="photo" size={22} /><span className="text-xs">Resident photo</span></div>
      </div>
    );
  }

  function MapStub({ loc, nbhd }) {
    return (
      <div style={{ position:'relative', height:96, borderRadius:6, overflow:'hidden', border:'1px solid var(--border-soft)', background:'linear-gradient(135deg,#e8eef2,#dde6ec)' }}>
        <svg width="100%" height="100%" style={{ position:'absolute', inset:0, opacity:.5 }}>
          <path d="M0 60 H300" stroke="#b9c6d0" strokeWidth="6" fill="none" />
          <path d="M120 0 V120" stroke="#b9c6d0" strokeWidth="6" fill="none" />
          <path d="M0 24 H300 M0 96 H300 M60 0 V120 M210 0 V120" stroke="#cdd8e0" strokeWidth="2" fill="none" />
        </svg>
        <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-100%)', color:'var(--red)' }}><Icon name="pin" size={26} /></div>
        <div style={{ position:'absolute', left:8, bottom:8, background:'rgba(255,255,255,.92)', borderRadius:4, padding:'3px 8px', fontSize:11, fontWeight:600, color:'var(--text)' }}>{loc} · {nbhd}</div>
      </div>
    );
  }

  function CommentThread({ comments }) {
    if (!comments || !comments.length) return <div className="muted text-sm">No comments yet.</div>;
    return (
      <div className="col gap-8">
        {comments.map((c,i)=>(
          <div key={i} className={c.staff?'amber-callout':''} style={ c.staff?null:{ background:'var(--gray-50)', border:'1px solid var(--border-soft)', borderRadius:6, padding:'10px 12px' } }>
            <div className="row items-center gap-8 mb-4">
              <span className="fw7 text-sm">{c.who}</span>
              {c.staff && <Badge tone="amber" square>Staff comment</Badge>}
            </div>
            <div className="text-13">{c.text}</div>
          </div>
        ))}
      </div>
    );
  }

  /* ===== TICKET DETAIL: handles triage (Secretary) and response (department) ===== */
  function TicketDetail({ ticket, mode, ctx, onClose }) {
    // mode: 'triage' | 'respond' | 'view'
    const [dept, setDept] = useState(ticket.suggestedDept || ticket.dept || 'Public Works');
    const [note, setNote] = useState('');
    const [draft, setDraft] = useState(ticket.response || '');
    const [drafted, setDrafted] = useState(!!ticket.response);
    const [showOriginal, setShowOriginal] = useState(false);

    const DEPTS = [
      { v:'Public Works', l:'Public Works' },
      { v:'Sewer', l:'Sewer Department' },
      { v:'Building & Codes', l:'Building and Codes' },
      { v:'Police', l:'Police Department' },
      { v:'Planning', l:'Planning, Zoning, and Land Development' },
      { v:'Garbage & Recycling', l:'Garbage and Recycling' },
      { v:'Parks', l:'Parks and Recreation' },
      { v:'Finance', l:'Finance Department' },
      { v:'Secretary', l:"Township Secretary's Office" },
      { v:'Manager', l:"Township Manager's Office" },
    ];
    const deptLabel = (DEPTS.find(d=>d.v===dept)||{}).l || dept;

    function aiSummary() {
      const urg = (ticket.affects||0) >= 8 ? 'Urgency appears elevated given the number of residents affected.' : 'No urgency signals detected.';
      const first = (ticket.desc||'').split('. ')[0];
      return `A resident reports ${ticket.sub.toLowerCase()} at ${ticket.loc} (${ticket.nbhd}). ${first}. Submitted ${ticket.date} by ${ticket.submitter}. ${urg}`;
    }

    function aiDraft() {
      const t = `Thank you for reporting ${ticket.title.toLowerCase()}. ${ticket.dept||dept} has reviewed the location at ${ticket.loc}. We have scheduled this for assessment and will post an update here as work is planned. We appreciate you flagging it, and the ${ticket.affects||0} neighbors who marked that it affects them too.\n\n- ${ticket.dept||dept}`;
      setDraft(t); setDrafted(true);
    }

    function confirmTriage() {
      ctx.update(s => ({ ...s, triageQueue: s.triageQueue.filter(t=>t.id!==ticket.id) }));
      const remaining = ctx.store.triageQueue.length - 1;
      toast(`Sent ${ticket.id} to ${deptLabel}. ${remaining} ticket${remaining===1?'':'s'} remain in triage.`, { icon:'check' });
      // auto-load next
      const next = ctx.store.triageQueue.find(t=>t.id!==ticket.id);
      if (next && mode==='triage') ctx.openModal(<TicketDetail ticket={next} mode="triage" ctx={ctx} onClose={onClose} />);
      else onClose();
    }

    function publishResponse() {
      ctx.update(s => ({ ...s, tickets: s.tickets.map(t => t.id===ticket.id ? { ...t, response:draft, staffResp:true, phase: t.phase==='Submitted'||t.phase==='Received' ? 'Approved for Work' : t.phase } : t) }));
      toast(`Response published on ${ticket.id}. Visible to the resident now.`, { icon:'check' });
      onClose();
    }

    const footer = mode==='triage' ? (
      <>
        <button className="btn" onClick={onClose}>Cancel</button>
        <div className="row gap-8">
          <button className="btn btn-secondary" onClick={confirmTriage}>Override and Send</button>
          <button className="btn btn-primary" onClick={confirmTriage}><Icon name="check" size={15} /> Confirm and Send to {deptLabel}</button>
        </div>
      </>
    ) : mode==='respond' ? (
      <>
        <button className="btn" onClick={onClose}>Cancel</button>
        <div className="row gap-8">
          <button className="btn btn-secondary" disabled={!draft} onClick={()=>{ toast('Saved as draft.'); onClose(); }}>Save as Draft</button>
          <button className="btn btn-primary" disabled={!draft} onClick={publishResponse}>Publish Response</button>
        </div>
      </>
    ) : <button className="btn btn-primary" onClick={onClose}>Close</button>;

    return (
      <Modal wide title={ticket.title} sub={`${ticket.id} · ${ticket.cat} / ${ticket.sub} · submitted ${ticket.date}`} onClose={onClose} footer={footer}>
        <div className="modal-body">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:20 }} className="td-grid">
            <div className="col gap-16">
              {/* status row */}
              <div className="row items-center gap-8 wrap">
                <PhaseBadge phase={ticket.phase} />
                {ticket.dept && <Badge tone="blue" square>{ticket.dept}</Badge>}
                {ticket.needsInfo && <Badge tone="orange" dot>Needs More Info</Badge>}
                <span className="muted text-sm row items-center gap-4"><Icon name="pin" size={13} /> {ticket.loc}</span>
              </div>

              {/* AI SUMMARY (default) */}
              <div className="card card-pad">
                <div className="row items-center gap-8 mb-4"><AILabel>AI Summary</AILabel></div>
                <div className="muted text-xs mb-8">Generated by AI from the resident's submission. Read the original below if you want to verify.</div>
                <div className="text-13" style={{ lineHeight:1.55 }}>{aiSummary()}</div>
                <div className="row items-center gap-6 wrap mt-12">
                  <Badge tone="gray" square><Icon name="pin" size={11} /> {ticket.loc}</Badge>
                  <Badge tone="gray" square>{ticket.cat} / {ticket.sub}</Badge>
                  <Badge tone="blue" square><Icon name="sparkle" size={11} /> Route: {ticket.suggestedDept || ticket.dept || 'Public Works'}</Badge>
                </div>
              </div>

              {/* ORIGINAL RESIDENT SUBMISSION (collapsible, source of truth) */}
              <div className="card" style={{ overflow:'hidden', background: showOriginal?'#fff':'var(--gray-50)', borderColor: showOriginal?'var(--navy)':'var(--border-soft)' }}>
                <button onClick={()=>setShowOriginal(o=>!o)} className="row items-center justify-between" style={{ width:'100%', background:'none', border:'none', padding:'11px 14px', cursor:'pointer', textAlign:'left' }}>
                  <span className="row items-center gap-8 fw6 text-13" style={{ color: showOriginal?'var(--navy)':'var(--text-2)' }}>
                    <Icon name="doc" size={15} /> Original Resident Submission {showOriginal?'':'(click to expand)'}
                  </span>
                  <Icon name={showOriginal?'chevDown':'chevRight'} size={16} color="var(--text-3)" />
                </button>
                {showOriginal && (
                  <div style={{ padding:'0 16px 16px' }} className="col gap-12">
                    <div className="row items-center gap-8 wrap">
                      <Badge tone="navy" square><Icon name="user" size={11} /> {ticket.submitter}</Badge>
                      <span className="muted text-xs row items-center gap-4"><Icon name="clock" size={12} /> Submitted {ticket.date}</span>
                    </div>
                    <div>
                      <div className="eyebrow mb-4">Category selected by resident</div>
                      <div className="row gap-6 wrap"><Badge tone="gray" square>{ticket.cat}</Badge><Badge tone="gray" square>{ticket.sub}</Badge></div>
                    </div>
                    <div>
                      <div className="eyebrow mb-4">Location marked by resident</div>
                      <MapStub loc={ticket.loc} nbhd={ticket.nbhd} />
                    </div>
                    <div>
                      <div className="eyebrow mb-4">Description, in the resident's exact words</div>
                      <blockquote style={{ margin:0, padding:'10px 14px', borderLeft:'3px solid var(--navy)', background:'var(--gray-50)', borderRadius:'0 6px 6px 0', fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize:12.5, lineHeight:1.6, color:'var(--text)', whiteSpace:'pre-wrap' }}>{ticket.desc}</blockquote>
                    </div>
                    {ticket.photo && <div><div className="eyebrow mb-4">Photo uploaded by resident</div><PhotoStub /></div>}
                    <div className="row gap-20 wrap">
                      <div><div className="eyebrow mb-4">Contact preference</div><div className="text-13 fw6">Email</div></div>
                      <div><div className="eyebrow mb-4">Notifications</div><div className="text-13 fw6">Updates on this ticket: On</div></div>
                    </div>
                    <div className="muted text-xs row items-center gap-6" style={{ borderTop:'1px solid var(--border-soft)', paddingTop:10 }}><Icon name="check" size={13} color="var(--green)" /> These are the resident's exact words and choices.</div>
                  </div>
                )}
              </div>

              {/* TRIAGE: AI routing */}
              {mode==='triage' && (
                <div className="ai-panel">
                  <div className="row items-center justify-between mb-8">
                    <AILabel>AI Routing Suggestion</AILabel>
                    <Badge tone="green" dot>{ticket.confidence||88}% confidence</Badge>
                  </div>
                  <div className="text-13 mb-12">Suggested department: <b>{ticket.suggestedDept}</b>, based on category <b>{ticket.cat}</b> and historical routing of similar reports.</div>
                  <div className="field-label">Assign to Department</div>
                  <select className="select" value={dept} onChange={e=>setDept(e.target.value)} style={{ maxWidth:320 }}>
                    {DEPTS.map(d=>(<option key={d.v} value={d.v}>{d.l}</option>))}
                  </select>
                  <div className="field-label mt-12">Internal note (optional)</div>
                  <textarea className="textarea" value={note} onChange={e=>setNote(e.target.value)} placeholder="Add context for the receiving department…" style={{ minHeight:60 }} />
                </div>
              )}

              {/* RESPOND: AI draft */}
              {mode==='respond' && (
                <div className="ai-panel">
                  <div className="row items-center justify-between mb-8">
                    <AILabel>Draft Response</AILabel>
                    {!drafted && <AIButton label="Draft Response" loadingLabel="Drafting…" onResult={aiDraft} />}
                  </div>
                  {drafted ? (
                    <>
                      <textarea className="textarea" value={draft} onChange={e=>setDraft(e.target.value)} style={{ minHeight:150, background:'#fff' }} />
                      <div className="muted text-xs mt-4">AI-drafted from the resident's report. Edit freely. Publishing posts this publicly and advances the ticket.</div>
                    </>
                  ) : (
                    <div className="muted text-sm">Click Draft Response. AI writes a first draft in the township voice, referencing this report. You edit before publishing.</div>
                  )}
                </div>
              )}

              {/* existing published response (view) */}
              {mode!=='respond' && ticket.response && (
                <div className="amber-callout">
                  <div className="row items-center gap-8 mb-4"><Badge tone="amber" square>Township responded</Badge></div>
                  <div className="text-13">{ticket.response}</div>
                </div>
              )}

              <div>
                <div className="field-label">Comments ({(ticket.comments||[]).length})</div>
                <CommentThread comments={ticket.comments} />
              </div>
            </div>

            {/* sidebar */}
            <div className="col gap-12">
              <div className="card card-pad col gap-12" style={{ background:'var(--gray-50)' }}>
                <Meta label="Submitter" value={ticket.submitter} />
                <Meta label="Neighborhood" value={ticket.nbhd} />
                <Meta label="Affects me too" value={`${ticket.affects||0} residents`} />
                <Meta label="Category" value={`${ticket.cat} / ${ticket.sub}`} />
                <Meta label="Received" value={ticket.date} />
              </div>
              {mode==='triage' && (
                <div className="alert-callout text-xs">Confirm the AI suggestion in one click, or pick a different department. Overrides are logged so routing improves over time.</div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    );
  }
  function Meta({ label, value }) {
    return (<div><div className="eyebrow" style={{ marginBottom:2 }}>{label}</div><div className="text-13 fw6">{value}</div></div>);
  }

  /* ===== MAILED FORM ===== */
  function MailedFormModal({ form, ctx, onClose }) {
    const [stage, setStage] = useState('scan'); // scan | extracting | verify | done
    const f = form.fields;
    const [vals, setVals] = useState(Object.fromEntries(Object.keys(f).map(k=>[k, f[k].val])));

    function route() {
      ctx.update(s => ({ ...s, mailedForms: s.mailedForms.filter(x=>x.id!==form.id) }));
      setStage('done');
    }

    let footer;
    if (stage==='scan') footer = (<><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={()=>{ setStage('extracting'); setTimeout(()=>setStage('verify'), 1800); }}><Icon name="sparkle" size={15} /> Extract Data with AI</button></>);
    else if (stage==='verify') footer = (<><button className="btn" onClick={()=>setStage('scan')}>Back to scan</button><button className="btn btn-primary" onClick={route}>Save and Route</button></>);
    else if (stage==='done') footer = (<button className="btn btn-primary btn-block" onClick={onClose}>Done</button>);
    else footer = null;

    return (
      <Modal wide title={`Process Mailed Form · ${form.id}`} sub={`From ${form.from} (${form.nbhd}) · received ${form.received}`} onClose={stage==='extracting'?null:onClose} footer={footer}>
        <div className="modal-body">
          {stage==='scan' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              <FormScan form={form} />
              <div className="col gap-12 justify-center">
                <div className="subhead">Newsletter feedback form</div>
                <div className="muted text-13">This is a scan of a paper form a resident mailed back. AI will read the handwriting and populate the seven sections as structured fields. You verify each before routing.</div>
                <div className="ai-panel text-sm"><AILabel>OCR + extraction</AILabel><div className="mt-8">Sections A through G map to proposal feedback, an issue report, an event request, general feedback, a reward selection, contact info, and delivery preference.</div></div>
              </div>
            </div>
          )}
          {stage==='extracting' && (
            <div className="col items-center justify-center gap-12" style={{ padding:'60px 0' }}>
              <Spinner size={28} />
              <div className="fw6">Reading the form and extracting fields…</div>
              <div className="muted text-sm">Section A → G</div>
            </div>
          )}
          {stage==='verify' && (
            <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:20 }}>
              <FormScan form={form} small />
              <div className="col gap-12">
                <div className="row items-center gap-8"><AILabel>Extracted</AILabel><span className="muted text-sm">Verify and edit each field, then route.</span></div>
                {Object.keys(f).map(k=>(
                  <div key={k}>
                    <div className="field-label">Section {k} - {f[k].label}</div>
                    <textarea className="textarea" style={{ minHeight: vals[k]?54:38 }} value={vals[k]} placeholder="(blank on form)" onChange={e=>setVals(v=>({ ...v, [k]:e.target.value }))} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {stage==='done' && (
            <div className="col gap-12" style={{ padding:'8px 0' }}>
              <div className="row items-center gap-8"><div style={{ width:34, height:34, borderRadius:'50%', background:'var(--green-bg)', display:'grid', placeItems:'center' }}><Icon name="check" size={20} color="var(--green)" /></div><div className="subhead">Form processed and routed</div></div>
              <div className="card card-pad col gap-8" style={{ background:'var(--gray-50)' }}>
                {vals.A && <RouteLine icon="loop" text={`Proposal feedback routed to feedback aggregation`} />}
                {vals.B && <RouteLine icon="ticket" text={`New ticket created from the issue report, auto-routed to Public Works`} />}
                {vals.C && <RouteLine icon="calendar" text={`Event request sent to the Community event requests queue`} />}
                {vals.D && <RouteLine icon="doc" text={`General feedback logged for response loop review`} />}
                {vals.E && <RouteLine icon="coins" text={`Reward email triggered: ${vals.E}`} />}
                <RouteLine icon="check" text={`Confirmation email sent to ${form.from}`} />
              </div>
            </div>
          )}
        </div>
      </Modal>
    );
  }
  function RouteLine({ icon, text }) {
    return (<div className="row items-center gap-8 text-13"><Icon name={icon} size={15} color="var(--blue)" /><span>{text}</span></div>);
  }
  function FormScan({ form, small }) {
    return (
      <div style={{ border:'1px solid var(--border)', borderRadius:6, background:'#fdfdf8', padding:14, fontSize: small?9:10.5, lineHeight:1.5, fontFamily:'Georgia, serif', color:'#333', boxShadow:'var(--shadow-sm)' }}>
        <div style={{ textAlign:'center', borderBottom:'2px solid #333', paddingBottom:6, marginBottom:8 }}>
          <div style={{ fontWeight:700, letterSpacing:0.5 }}>COLLIER TOWNSHIP</div>
          <div>Resident Feedback Form</div>
        </div>
        {Object.keys(form.fields).map(k=>(
          <div key={k} style={{ marginBottom:6 }}>
            <div style={{ fontWeight:700 }}>{k}. {form.fields[k].label}</div>
            <div style={{ minHeight:14, borderBottom:'1px dotted #aaa', color:'#1a4', fontStyle:'normal' }}>{form.fields[k].val ? '✓ handwritten entry' : ''}</div>
          </div>
        ))}
      </div>
    );
  }

  /* ===== EVENT REQUEST ===== */
  function EventRequestModal({ req, ctx, onClose }) {
    const [screened, setScreened] = useState(false);
    const [decision, setDecision] = useState(null);
    const [reason, setReason] = useState('');

    function decide(kind) {
      ctx.update(s => ({ ...s, eventRequests: s.eventRequests.map(r=>r.id===req.id ? { ...r, status: kind==='approve'?'approved':kind==='decline'?'declined':'needs-info' } : r) }));
      if (kind==='approve') toast(`Approved. ${req.name} published to the resident map and calendar.`, { icon:'check' });
      else if (kind==='decline') toast(`Declined. ${req.org} notified with your reason.`);
      else toast(`Question sent to ${req.org}.`);
      onClose();
    }

    return (
      <Modal title={req.name} sub={`Requested by ${req.org} · ${req.date} · ${req.loc}`} onClose={onClose}
        footer={<>
          <button className="btn" onClick={onClose}>Close</button>
          <div className="row gap-8">
            <button className="btn btn-secondary" onClick={()=>decide('info')}>Ask for More Info</button>
            <button className="btn btn-danger" onClick={()=>decide('decline')}>Decline</button>
            <button className="btn btn-primary" onClick={()=>decide('approve')}><Icon name="check" size={15} /> Approve and Publish</button>
          </div>
        </>}>
        <div className="modal-body col gap-16">
          <div className="text-13" style={{ lineHeight:1.55 }}>{req.desc}</div>
          <div className="ai-panel">
            <div className="row items-center justify-between mb-8">
              <AILabel>Event screening</AILabel>
              {!screened && <AIButton label="Screen This Request" loadingLabel="Screening…" onResult={()=>setScreened(true)} />}
            </div>
            {screened ? (
              <div className="text-13" style={{ lineHeight:1.5 }}>
                <b>Assessment: {req.qualifies===true?'Likely qualifies.':req.qualifies===false?'Likely does not qualify.':'Needs more information.'}</b>{' '}
                {req.qualifies===true && 'The organizer is a recognized community group, the event is open to the public, and the description does not match disqualification patterns. '}
                {req.qualifies===false && 'The description indicates the event is not open to the public. '}
                {req.flag && <span>Manual review recommended for: {req.flag}</span>}
              </div>
            ) : <div className="muted text-sm">Run a qualification check against community-event criteria before deciding.</div>}
          </div>
          <div className="card card-pad col gap-8" style={{ background:'var(--gray-50)' }}>
            <Meta label="Organizer" value={req.org} />
            <Meta label="Proposed date" value={req.date} />
            <Meta label="Location" value={req.loc} />
            <Meta label="Status" value={{pending:'Pending','needs-info':'Needs Info',approved:'Approved',declined:'Declined'}[req.status]||req.status} />
          </div>
          <div>
            <div className="field-label">Reason / question (sent to organizer on decline or info request)</div>
            <textarea className="textarea" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Optional message to the organizer…" style={{ minHeight:60 }} />
          </div>
        </div>
      </Modal>
    );
  }

  Object.assign(window, { TicketDetail, MailedFormModal, EventRequestModal, PhotoStub, CommentThread });
})();
