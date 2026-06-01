/* Nav sections: Incoming, Response Loop, Content, Newsletter, Insights, Settings -> window.Section */
(function () {
  const { useState } = React;
  const Icon = window.Icon, SEED = window.SEED;
  const { Badge, PhaseBadge, FilterBar, Empty, AIButton, AILabel, StatWidget, Sparkline, BarChart, LineChart, toast, Placeholder } = window;

  function SubTabs({ tabs, active, onPick }) {
    return (
      <div className="row gap-4 wrap" style={{ borderBottom:'1px solid var(--border-soft)', marginBottom:16 }}>
        {tabs.map(t=>(
          <button key={t} data-tour={`subtab-${t.toLowerCase().split(' ')[0]}`} onClick={()=>onPick(t)}
            style={{ background:'none', border:'none', padding:'9px 12px', fontSize:13, fontWeight:600, cursor:'pointer',
              color: active===t?'var(--navy)':'var(--text-2)', borderBottom: active===t?'2px solid var(--navy)':'2px solid transparent', marginBottom:-1 }}>
            {window.titleCase(t)}
          </button>
        ))}
      </div>
    );
  }
  function Head({ title, sub, right }) {
    return (
      <div className="row items-center justify-between wrap gap-12 mb-16">
        <div><h1 className="page-title">{title}</h1>{sub&&<div className="muted text-13 mt-4">{sub}</div>}</div>
        {right}
      </div>
    );
  }

  function Section({ ctx }) {
    const map = { incoming:Incoming, loop:ResponseLoop, content:Content, newsletter:Newsletter, insights:window.Insights, settings:window.Settings };
    const Comp = map[ctx.route.section];
    return Comp ? <Comp ctx={ctx} /> : null;
  }

  /* ============ INCOMING ============ */
  function Incoming({ ctx }) {
    const tabs = ['Tickets','Event requests','Mailed forms','Flagged comments','Merge candidates','Resident appeals'];
    const [tab, setTab] = useState(ctx.route.tab && tabs.includes(ctx.route.tab) ? ctx.route.tab : 'Tickets');
    return (
      <>
        <Head title="Incoming" sub="Everything arriving from residents and the mailed channel" />
        <SubTabs tabs={tabs} active={tab} onPick={setTab} />
        {tab==='Tickets' && <TicketsTab ctx={ctx} />}
        {tab==='Event requests' && <EventReqTab ctx={ctx} />}
        {tab==='Mailed forms' && <FormsTab ctx={ctx} />}
        {tab==='Flagged comments' && <FlaggedTab ctx={ctx} />}
        {tab==='Merge candidates' && <MergeTab ctx={ctx} />}
        {tab==='Resident appeals' && <Placeholder title="Resident appeals" body="Residents can appeal a declined post or a removed comment. Appeals would queue here for review with the original item, the moderation reason, and the resident's response. Press a tab above to continue." />}
      </>
    );
  }

  function TicketsTab({ ctx }) {
    const [f, setF] = useState('All');
    const [q, setQ] = useState('');
    // department roles see only their own; secretary/manager/commissioner/comms/finance see all
    const broad = ['secretary','manager','commissioner','comms','finance'].includes(ctx.role);
    let rows = ctx.store.tickets.filter(t => broad || t.dept===SEED.ROLES.find(r=>r.id===ctx.role).dept);
    const chips = ['All','Submitted','Received','Under Review','Being Worked On','Resolved','Declined'];
    if (f!=='All') rows = rows.filter(t=>t.phase===f);
    if (q) rows = rows.filter(t=> (t.title+t.id+t.loc+t.nbhd).toLowerCase().includes(q.toLowerCase()));
    const triage = ctx.role==='secretary' ? ctx.store.triageQueue : [];
    return (
      <>
        {triage.length>0 && (
          <div className="card mb-16" style={{ borderColor:'var(--orange)' }}>
            <div className="row items-center justify-between" style={{ padding:'10px 14px', background:'var(--orange-bg)', borderBottom:'1px solid var(--border-soft)' }}>
              <div className="row items-center gap-8"><Icon name="alert" size={16} color="#b5560f" /><span className="fw7 text-13">{triage.length} tickets awaiting triage</span></div>
              <button className="btn btn-primary btn-sm" onClick={()=>ctx.startTriage()}>Triage next</button>
            </div>
            <table className="tbl"><tbody>
              {triage.slice(0,3).map(t=>(
                <tr key={t.id} className="clickable" onClick={()=>ctx.openTicket(t,'triage')}>
                  <td style={{ width:80 }}><Badge tone="gray" dot>New</Badge></td>
                  <td className="fw6">{t.title}</td>
                  <td className="muted">{t.cat}</td>
                  <td><span className="ai-label"><Icon name="sparkle" size={10} /> {t.suggestedDept}</span></td>
                  <td className="tright"><button className="btn btn-secondary btn-sm" onClick={(e)=>{e.stopPropagation();ctx.openTicket(t,'triage');}}>Triage</button></td>
                </tr>
              ))}
            </tbody></table>
          </div>
        )}
        <FilterBar chips={chips} active={f} onChip={setF} search={q} onSearch={setQ} />
        <div className="card" style={{ overflow:'hidden' }}>
          <table className="tbl">
            <thead><tr><th style={{width:90}}>Status</th><th>Ticket</th><th>Dept</th><th>Location</th><th>Affects</th><th>Received</th><th></th></tr></thead>
            <tbody>
              {rows.map(t=>(
                <tr key={t.id} className="clickable" onClick={()=>ctx.openTicket(t, t.staffResp?'view':(broad?'view':'respond'))}>
                  <td><PhaseBadge phase={t.phase} /></td>
                  <td><div className="fw6">{t.title}</div><div className="muted text-xs">{t.id}</div></td>
                  <td><Badge tone="blue" square>{t.dept}</Badge></td>
                  <td className="muted text-sm">{t.loc}</td>
                  <td className="tnum">{t.affects||0}</td>
                  <td className="muted text-sm">{t.date}</td>
                  <td className="tright"><Icon name="chevRight" size={16} color="var(--text-3)" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length===0 && <Empty title="No tickets match" sub="Adjust the filters above." />}
        </div>
      </>
    );
  }

  function EventReqTab({ ctx }) {
    const tone = { pending:'orange', 'needs-info':'purple', approved:'green', declined:'red' };
    const stLabel = { pending:'Pending', 'needs-info':'Needs Info', approved:'Approved', declined:'Declined' };
    return (
      <div className="card" style={{ overflow:'hidden' }}>
        <table className="tbl">
          <thead><tr><th>Event</th><th>Organizer</th><th>Date</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {ctx.store.eventRequests.map(r=>(
              <tr key={r.id} className="clickable" onClick={()=>ctx.openModal(React.createElement(window.EventRequestModal,{req:r,ctx,onClose:ctx.closeModal}))}>
                <td className="fw6">{r.name}</td><td className="muted">{r.org}</td><td className="muted text-sm">{r.date}</td>
                <td><Badge tone={tone[r.status]} dot>{stLabel[r.status]}</Badge></td>
                <td className="tright">{r.status==='pending' ? <button className="btn btn-secondary btn-sm" onClick={(e)=>{e.stopPropagation();ctx.openModal(React.createElement(window.EventRequestModal,{req:r,ctx,onClose:ctx.closeModal}));}}>Review</button> : <Icon name="chevRight" size={16} color="var(--text-3)" />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function FormsTab({ ctx }) {
    const forms = ctx.store.mailedForms;
    return (
      <>
        <div className="amber-callout mb-16 text-13"><b>Mailed forms.</b> Residents without the app mail back a paper feedback form. Process each one: AI extracts the fields, you verify, and the system routes everything in one step.</div>
        {forms.length===0 ? <Empty icon="check" title="All forms processed" sub="New mailed-form scans will appear here for processing." /> : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }} className="qgrid">
            {forms.map(f=>(
              <div key={f.id} className="card card-pad col gap-10">
                <div className="row items-center justify-between"><Badge tone="navy" square>{f.id}</Badge><span className="muted text-xs">{f.received}</span></div>
                <div style={{ height:80, background:'var(--gray-100)', borderRadius:6, display:'grid', placeItems:'center', color:'var(--text-3)' }}><Icon name="doc" size={26} /></div>
                <div><div className="fw6 text-13">{f.from} · {f.nbhd}</div><div className="muted text-xs mt-4">{f.summary}</div></div>
                <button className="btn btn-primary btn-sm btn-block" onClick={()=>ctx.openModal(React.createElement(window.MailedFormModal,{form:f,ctx,onClose:ctx.closeModal}))}>Process This Form</button>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  function FlaggedTab({ ctx }) {
    const [items, setItems] = useState(ctx.store.flaggedComments);
    const src = { auto:'Auto-flagged', reported:'Reported by resident', staff:'Staff-flagged' };
    function act(id, kind){ setItems(x=>x.filter(i=>i.id!==id)); toast(kind==='remove'?'Comment removed and logged.':'Comment kept. Flag cleared.'); }
    return (
      <div className="col gap-10">
        {items.length===0 && <Empty icon="check" title="Moderation queue clear" />}
        {items.map(c=>(
          <div key={c.id} className="card card-pad col gap-8">
            <div className="row items-center justify-between">
              <Badge tone={c.source==='auto'?'orange':c.source==='reported'?'red':'purple'} dot>{src[c.source]}</Badge>
              <span className="muted text-xs">on {c.on}</span>
            </div>
            <div className="text-13" style={{ background:'var(--gray-50)', border:'1px solid var(--border-soft)', borderRadius:6, padding:'8px 10px' }}>"{c.text}"</div>
            <div className="muted text-xs">Reason: {c.reason}</div>
            <div className="row items-center justify-end gap-8">
              <button className="btn btn-sm" onClick={()=>act(c.id,'keep')}>Keep</button>
              <button className="btn btn-danger btn-sm" onClick={()=>act(c.id,'remove')}>Remove Comment</button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function MergeTab({ ctx }) {
    return (
      <div className="card card-pad col gap-12">
        <div className="row items-center gap-8"><AILabel>Duplicate detection</AILabel><span className="muted text-sm">AI surfaced 1 cluster of likely-duplicate tickets.</span></div>
        <div className="card card-pad" style={{ background:'var(--gray-50)' }}>
          <div className="fw7 text-13 mb-8">3 tickets near Boyce Road @ Chartiers Creek bridge</div>
          <div className="col gap-6">
            {ctx.store.tickets.filter(t=>t.loc.includes('Boyce')||t.title.includes('Boyce')).slice(0,3).map(t=>(
              <div key={t.id} className="row items-center gap-8 text-13"><PhaseBadge phase={t.phase} /><span className="fw6">{t.title}</span><span className="muted text-xs">{t.id}</span></div>
            ))}
          </div>
          <div className="row gap-8 mt-12"><button className="btn btn-secondary btn-sm" onClick={()=>toast('Merged into a single tracked item.')}><Icon name="merge" size={14} /> Merge tickets</button><button className="btn btn-sm" onClick={()=>toast('Promoted to a project candidate.')}>Merge into project candidate</button></div>
        </div>
      </div>
    );
  }

  /* ============ RESPONSE LOOP ============ */
  function ResponseLoop({ ctx }) {
    const tabs = ['Draft','Approval queue','Published','Archive'];
    const [tab, setTab] = useState(ctx.route.tab && tabs.includes(ctx.route.tab) ? ctx.route.tab : 'Draft');
    const canPublish = ctx.role==='manager';
    return (
      <>
        <Head title="Response Loop" sub="Weekly aggregation of resident input into published township responses"
          right={ctx.role==='secretary' && <button className="btn btn-primary" data-tour="loop-start" onClick={()=>ctx.openModal(React.createElement(window.ResponseLoopModal,{ctx,onClose:ctx.closeModal}))}><Icon name="plus" size={15} /> Start this week's response loop</button>} />
        <SubTabs tabs={tabs} active={tab} onPick={setTab} />
        {tab==='Draft' && (
          ctx.role==='secretary'
          ? <div className="card card-pad col gap-12"><div className="row items-center justify-between"><div><div className="subhead">This week's draft</div><div className="muted text-sm mt-4">6 themes clustered from this week's resident input. 4 responses drafted.</div></div><button className="btn btn-primary" onClick={()=>ctx.openModal(React.createElement(window.ResponseLoopModal,{ctx,onClose:ctx.closeModal}))}>Continue Drafting</button></div>
              <div className="col gap-6">{SEED.rlDraftThemes.map(t=>(<div key={t.id} className="row items-center gap-8 text-13" style={{padding:'6px 0',borderBottom:'1px solid var(--border-soft)'}}><Badge tone="purple" square>{t.count}</Badge><span className="fw6">{t.name}</span><span className="muted text-xs">{t.quotes[0]}</span></div>))}</div></div>
          : <Empty icon="loop" title="Drafting is led by the Township Secretary" sub="Department heads contribute responses within their domain, but the weekly draft is assembled by the Secretary's office." />
        )}
        {tab==='Approval queue' && (
          canPublish
          ? <div className="card card-pad col gap-12"><div className="row items-center justify-between"><div><div className="subhead">{ctx.store.rlPending??4} drafts awaiting your approval</div><div className="muted text-sm mt-4">Approve, edit, or send each back. Approved responses publish to the resident Home screen.</div></div><button className="btn btn-primary" onClick={()=>ctx.openModal(React.createElement(window.RLApprovalModal,{ctx,onClose:ctx.closeModal}))}>Open Approval Queue</button></div></div>
          : <Empty icon="check" title="Approval is the Township Manager's step" sub="Submitted drafts wait here for the Manager to approve before anything publishes to residents." />
        )}
        {tab==='Published' && <ArchiveList items={SEED.rlArchive.slice(0,1)} published />}
        {tab==='Archive' && <ArchiveList items={SEED.rlArchive} />}
      </>
    );
  }
  function ArchiveList({ items, published }) {
    return (
      <div className="card" style={{ overflow:'hidden' }}>
        <table className="tbl">
          <thead><tr><th>{published?'This month':'Month'}</th><th>Themes</th><th>Drafted</th><th>Approved</th><th>Published</th></tr></thead>
          <tbody>
            {items.map(e=>(
              <tr key={e.id} className="clickable" onClick={()=>toast(`Opening ${e.month} response loop (read-only archive).`)}>
                <td className="fw6">{e.month}</td><td className="tnum">{e.themes}</td>
                <td><Badge tone="blue" square>{e.drafted}</Badge></td><td><Badge tone="blue" square>{e.approved}</Badge></td>
                <td className="muted text-sm">{e.published}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  /* ============ CONTENT ============ */
  function Content({ ctx }) {
    const tabs = ['Projects','Events','Notices and Alerts','Proposals'];
    const [tab, setTab] = useState(ctx.route.tab && tabs.includes(ctx.route.tab) ? ctx.route.tab : 'Projects');
    const dept = SEED.ROLES.find(r=>r.id===ctx.role).dept;
    return (
      <>
        <Head title="Content" sub="Create, edit, and publish projects, events, notices, and proposals" />
        <SubTabs tabs={tabs} active={tab} onPick={setTab} />
        {tab==='Projects' && <ProjectsTab ctx={ctx} dept={dept} />}
        {tab==='Events' && <EventsTab ctx={ctx} />}
        {tab==='Notices and Alerts' && <NoticesTab ctx={ctx} />}
        {tab==='Proposals' && <ProposalsTab ctx={ctx} />}
      </>
    );
  }
  function ProjectsTab({ ctx, dept }) {
    const [scope, setScope] = useState('Mine');
    let rows = ctx.store.projects;
    if (scope==='Mine') rows = rows.filter(p=>p.dept===dept);
    const canUpdate = !['commissioner','finance'].includes(ctx.role);
    return (
      <>
        <FilterBar chips={['Mine','All']} active={scope} onChip={setScope}
          right={<span className="muted text-xs" style={{marginLeft:8}}>{scope==='Mine'?`Filtered to ${dept}`:'All departments'}</span>} />
        <div className="card" style={{ overflow:'hidden' }}>
          <table className="tbl">
            <thead><tr><th>Project</th><th>Dept</th><th>Phase</th><th>Last update</th><th>Followers</th><th></th></tr></thead>
            <tbody>
              {rows.map(p=>(
                <tr key={p.id}>
                  <td className="fw6">{p.name}{p.stale&&<Badge tone="red" square>Stale</Badge>}</td>
                  <td><Badge tone="blue" square>{p.dept}</Badge></td>
                  <td><PhaseBadge phase={p.phase} /></td>
                  <td className="muted text-sm">{p.updated}</td><td className="tnum">{p.followers}</td>
                  <td className="tright">{canUpdate && p.dept===dept ? <button className="btn btn-secondary btn-sm" onClick={()=>ctx.openModal(React.createElement(window.ProjectUpdateModal,{project:p,ctx,onClose:ctx.closeModal}))}>Update</button> : <a onClick={()=>toast('Opening project (read-only).')}>View</a>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length===0 && <Empty title="No projects in this scope" sub="Switch to 'all' to see other departments." />}
        </div>
      </>
    );
  }
  function EventsTab({ ctx }) {
    return (
      <>
        <div className="row items-center justify-between mb-12"><div className="muted text-sm">July 2026 · {SEED.events.length} events</div><button className="btn btn-primary btn-sm" onClick={()=>ctx.openModal(React.createElement(window.EventCreateModal,{ctx,onClose:ctx.closeModal,dept:SEED.ROLES.find(r=>r.id===ctx.role).dept}))}><Icon name="plus" size={14} /> Create Event</button></div>
        <div className="card" style={{ overflow:'hidden' }}>
          <table className="tbl"><thead><tr><th>Event</th><th>Date</th><th>Location</th><th>Host</th></tr></thead>
            <tbody>{SEED.events.map(e=>(<tr key={e.id}><td className="fw6">{e.name}</td><td className="muted text-sm">{e.date}</td><td className="muted text-sm">{e.loc}</td><td><Badge tone="blue" square>{e.host}</Badge></td></tr>))}</tbody>
          </table>
        </div>
      </>
    );
  }
  function NoticesTab({ ctx }) {
    return (
      <>
        <div className="row items-center justify-between mb-12"><div className="muted text-sm">{ctx.store.notices.length} active notices and alerts</div><button className="btn btn-primary btn-sm" onClick={()=>ctx.openModal(React.createElement(window.NoticeCreateModal,{ctx,onClose:ctx.closeModal,dept:SEED.ROLES.find(r=>r.id===ctx.role).dept}))}><Icon name="plus" size={14} /> Create Notice</button></div>
        <div className="col gap-8">
          {ctx.store.notices.map(n=>(
            <div key={n.id} className={n.type==='alert'?'alert-callout':'amber-callout'}>
              <div className="row items-center justify-between"><div className="row items-center gap-8"><Badge tone={n.type==='alert'?'orange':'amber'} square>{n.type==='alert'?'Alert':'Notice'}</Badge><span className="fw6 text-13">{n.title}</span></div><span className="text-xs">{n.range} · {n.nbhds}</span></div>
            </div>
          ))}
        </div>
      </>
    );
  }
  function ProposalsTab({ ctx }) {
    const canEdit = ['planning','manager'].includes(ctx.role);
    return (
      <div className="card" style={{ overflow:'hidden' }}>
        <table className="tbl">
          <thead><tr><th>Proposal</th><th>Owner</th><th>Stage</th><th>Comments</th><th></th></tr></thead>
          <tbody>
            {ctx.store.proposals.map(p=>(
              <tr key={p.id}>
                <td className="fw6">{p.name}{p.voteDate&&<Badge tone="orange" square>Vote {p.voteDate.slice(5)}</Badge>}</td>
                <td><Badge tone="blue" square>{p.dept}</Badge></td>
                <td><Badge tone="purple" dot>{p.stage}</Badge></td><td className="tnum">{p.comments}</td>
                <td className="tright">{canEdit ? <button className="btn btn-secondary btn-sm" onClick={()=>ctx.openModal(React.createElement(window.ProposalAdvanceModal,{proposal:p,ctx,onClose:ctx.closeModal}))}>Manage</button> : ctx.role==='finance' ? <button className="btn btn-secondary btn-sm" onClick={()=>ctx.openModal(React.createElement(window.FinanceReviewModal,{ctx,onClose:ctx.closeModal,subject:p.name}))}>Financial Review</button> : <a onClick={()=>toast('Opening proposal (read-only).')}>View</a>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  /* ============ NEWSLETTER ============ */
  function Newsletter({ ctx }) {
    const tabs = ['Current issue','Past issues','Distribution','Production settings'];
    const [tab, setTab] = useState('Current issue');
    return (
      <>
        <Head title="Newsletter" sub="Monthly newsletter assembly and send" />
        <SubTabs tabs={tabs} active={tab} onPick={setTab} />
        {tab==='Current issue' && (
          ['secretary','manager'].includes(ctx.role)
            ? <window.NewsletterAssembly ctx={ctx} />
            : <Placeholder title="Your department's contributions" body="The monthly issue is assembled by the Township Secretary and signed by the Manager. Content your department publishes (events, notices, proposals, project updates) is auto-compiled into the relevant sections. There is nothing for you to assemble here." />
        )}
        {tab==='Past issues' && (
          <div className="card" style={{ overflow:'hidden' }}><table className="tbl"><thead><tr><th>Issue</th><th>Sent</th><th>Recipients</th><th>Response rate</th></tr></thead>
          <tbody>{ctx.store.newsletters.map(n=>(<tr key={n.id} className="clickable" onClick={()=>toast(`Opening ${n.month} issue (PDF preview).`)}><td className="fw6">{n.month}</td><td className="muted text-sm">{n.sent}</td><td className="tnum">{n.recipients.toLocaleString()}</td><td><Badge tone="green" square>{n.responseRate}%</Badge></td></tr>))}</tbody></table></div>
        )}
        {tab==='Distribution' && <Placeholder title="Distribution and analytics" body="Open and response rates over time, mailed-back form volume, and per-section engagement. Backed by 8 months of issue history." />}
        {tab==='Production settings' && <Placeholder title="Production settings" body="Print vendor, mailing list management, and per-issue cost configuration would live here." />}
      </>
    );
  }
  function CurrentIssue({ ctx }) {
    const canSign = ctx.role==='manager';
    const isSec = ctx.role==='secretary';
    const sections = [
      ['Page 1', 'Cover letter', canSign?'Ready for your signature':'Awaiting Manager\u0027s signature', canSign?'orange':'gray'],
      ['Page 2', 'Response loop', 'Auto-compiled from this month\u0027s published responses', 'green'],
      ['Page 3', 'Proposals', 'Auto-compiled from active proposals', 'green'],
      ['Page 4', 'Events and notices', 'Auto-compiled from this month\u0027s calendar', 'green'],
      ['Page 5', 'How to engage', 'Static template', 'gray'],
      ['Pages 6-7', 'Feedback form', 'Updated with this month\u0027s proposal checkboxes', 'green'],
    ];
    const [cover, setCover] = useState('');
    return (
      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:16, alignItems:'start' }} className="twocol">
        <div className="card">
          <div className="row items-center justify-between" style={{ padding:'12px 16px', borderBottom:'1px solid var(--border-soft)' }}><div className="subhead" style={{fontSize:14}}>May 2026 issue · in assembly</div><Badge tone="orange" dot>Draft</Badge></div>
          <div style={{ padding:16 }} className="col gap-8">
            {sections.map((s,i)=>(
              <div key={i} className="row items-center gap-12" style={{ padding:'9px 0', borderBottom:i<sections.length-1?'1px solid var(--border-soft)':'none' }}>
                <span className="badge badge-gray" style={{ minWidth:64, justifyContent:'center' }}>{s[0]}</span>
                <div className="flex1"><div className="fw6 text-13">{s[1]}</div><div className="muted text-xs mt-4">{s[2]}</div></div>
                <Badge tone={s[3]} dot>{s[3]==='green'?'Compiled':s[3]==='orange'?'Action':'Static'}</Badge>
              </div>
            ))}
          </div>
        </div>
        <div className="col gap-16">
          {isSec && <div className="card card-pad col gap-10"><div className="subhead" style={{fontSize:14}}>Cover letter</div>
            <div className="ai-panel"><div className="row items-center justify-between mb-8"><AILabel>Draft cover letter</AILabel><AIButton label="Draft with AI" loadingLabel="Drafting…" onResult={()=>setCover('Neighbors,\n\nThis month brought heavy rain and a surge of stormwater reports, and our crews have been out clearing grates from Webb Park to Mill Street. We also advanced the recycling expansion toward its July 28 vote, resurfaced the worst of Boyce Road, and improved our average response time to 2.3 days. Thank you for staying engaged.\n\nWarmly,\nThe Township of Collier')} /></div>
              <textarea className="textarea" value={cover} onChange={e=>setCover(e.target.value)} placeholder="Draft or write the cover letter…" style={{minHeight:120, background:'#fff'}} /></div>
            <button className="btn btn-primary btn-block" disabled={!cover} onClick={()=>toast('Sent to the Township Manager for review and signature.')}>Send to Manager for Signature</button>
          </div>}
          {canSign && <div className="card card-pad col gap-10"><div className="subhead" style={{fontSize:14}}>Cover letter - awaiting your signature</div>
            <div className="amber-callout text-13">Neighbors, this month brought heavy rain and a surge of stormwater reports… (drafted by the Secretary).</div>
            <button className="btn btn-primary btn-block" onClick={()=>toast('Signed and approved. Returned to the Secretary to send to print.')}><Icon name="check" size={15} /> Sign and Approve</button>
          </div>}
          {isSec && <div className="card card-pad col gap-10"><div className="subhead" style={{fontSize:14}}>Send to print</div><div className="muted text-sm">Once the Manager signs, hand off to the print vendor.</div><button className="btn btn-secondary btn-block" onClick={()=>ctx.openModal(React.createElement(PrintHandoff,{ctx}))}>Send to Print Vendor</button></div>}
          {!isSec && !canSign && <Placeholder title="Your department's contributions" body="Other roles see the queue of content their department needs to contribute to the issue. Assembly and sign-off are handled by the Secretary and Manager." />}
        </div>
      </div>
    );
  }
  function PrintHandoff({ ctx }) {
    return (
      <window.Modal title="Send to Print Vendor" onClose={ctx.closeModal}
        footer={<><button className="btn" onClick={ctx.closeModal}>Cancel</button><button className="btn btn-primary" onClick={()=>{ctx.closeModal();toast('Newsletter sent to the print queue. Archive updated.');}}>Confirm and Send</button></>}>
        <div className="modal-body col gap-10">
          <Row k="Distribution count" v="4,180 households" />
          <Row k="Projected mail date" v="June 4, 2026" />
          <Row k="Print vendor" v="Allegheny Print Co." />
          <Row k="Estimated cost" v="$2,640" />
        </div>
      </window.Modal>
    );
  }
  function Row({ k, v }) { return (<div className="row items-center justify-between text-13" style={{padding:'6px 0',borderBottom:'1px solid var(--border-soft)'}}><span className="muted">{k}</span><span className="fw7">{v}</span></div>); }

  window.Section = Section;
  window.SettingsRow = Row;
})();
