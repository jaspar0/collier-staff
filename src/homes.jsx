/* Role Today homes -> window.Home */
(function () {
  const { useState } = React;
  const Icon = window.Icon, SEED = window.SEED;
  const { QueueWidget, StatWidget, Badge, PhaseBadge, AIButton, AILabel, Sparkline, toast, Empty } = window;

  function QA({ children, tour, primary, onClick }) {
    return <button className={`btn ${primary?'btn-primary':'btn-secondary'}`} data-tour={tour} onClick={onClick}>{children}</button>;
  }
  function Panel({ title, children, action }) {
    return (
      <div className="card">
        <div className="row items-center justify-between" style={{ padding:'12px 16px', borderBottom:'1px solid var(--border-soft)' }}>
          <div className="subhead" style={{ fontSize:14 }}>{title}</div>{action}
        </div>
        <div style={{ padding:16 }}>{children}</div>
      </div>
    );
  }
  function InProgressItem({ icon, title, status, onClick }) {
    return (
      <button className="row items-center gap-12" onClick={onClick} style={{ width:'100%', textAlign:'left', background:'#fff', border:'1px solid var(--border-soft)', borderRadius:6, padding:'11px 13px', cursor:'pointer' }}>
        <div style={{ width:32, height:32, borderRadius:7, background:'var(--gray-100)', display:'grid', placeItems:'center', color:'var(--navy)', flex:'none' }}><Icon name={icon} size={17} /></div>
        <div className="flex1"><div className="fw6 text-13">{title}</div><div className="muted text-xs mt-4">{status}</div></div>
        <Icon name="chevRight" size={16} color="var(--text-3)" />
      </button>
    );
  }
  function ActivityFeed({ items }) {
    return (
      <div className="col gap-10">
        {items.map((a,i)=>(
          <div key={i} className="row items-start gap-10">
            <div style={{ width:26, height:26, borderRadius:6, background:'var(--gray-100)', display:'grid', placeItems:'center', color:'var(--text-2)', flex:'none' }}><Icon name={a.icon} size={14} /></div>
            <div className="flex1"><div className="text-13">{a.text}</div><div className="muted text-xs mt-4">{a.t}</div></div>
          </div>
        ))}
      </div>
    );
  }

  function Grid({ children, cols=4 }) {
    return <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols}, 1fr)`, gap:12 }} className="qgrid">{children}</div>;
  }
  function TwoCol({ children }) {
    return <div style={{ display:'grid', gridTemplateColumns:'1.55fr 1fr', gap:16, alignItems:'start' }} className="twocol">{children}</div>;
  }

  /* ============ HOME ROUTER ============ */
  function Home({ ctx }) {
    const role = ctx.role;
    const map = {
      secretary: SecretaryHome, manager: ManagerHome, pubworks: PublicWorksHome,
      parks: ParksHome, finance: FinanceHome, commissioner: CommissionerHome,
    };
    const Comp = map[role] || GenericHome;
    return (
      <div className="col gap-20">
        <Greeting ctx={ctx} />
        <Comp ctx={ctx} />
      </div>
    );
  }

  function Greeting({ ctx }) {
    const r = SEED.ROLES.find(x=>x.id===ctx.role);
    const hour = 9;
    return (
      <div className="row items-center justify-between wrap gap-12">
        <div>
          <h1 className="page-title">Today</h1>
          <div className="muted text-13 mt-4">{r.name} · Friday, May 30, 2026</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={ctx.simulate}><Icon name="sparkle" size={14} /> Simulate new resident activity</button>
      </div>
    );
  }

  /* ---------- SECRETARY ---------- */
  function SecretaryHome({ ctx }) {
    const triage = ctx.store.triageQueue.length;
    const forms = ctx.store.mailedForms.length;
    const evReq = ctx.store.eventRequests.filter(r=>r.status==='pending').length;
    const flags = ctx.store.flaggedComments.length;
    return (
      <>
        <div data-tour="today-queues"><Grid>
          <QueueWidget icon="ticket" tone="orange" count={triage} label="tickets needing triage" cta="Triage" onClick={()=>ctx.startTriage()} />
          <QueueWidget icon="doc" tone="navy" count={forms} label="mailed forms ready to process" cta="Process" onClick={()=>ctx.go('incoming',{tab:'Mailed forms'})} />
          <QueueWidget icon="calendar" tone="purple" count={evReq} label="community event requests" cta="Review" onClick={()=>ctx.go('incoming',{tab:'Event requests'})} />
          <QueueWidget icon="flag" tone="red" count={flags} label="flagged comments to moderate" cta="Moderate" onClick={()=>ctx.go('incoming',{tab:'Flagged comments'})} />
        </Grid></div>

        <TwoCol>
          <div className="col gap-16">
            <Panel title="In progress" action={<a onClick={()=>ctx.go('loop')}>Open Response Loop</a>}>
              <div className="col gap-8">
                <InProgressItem icon="loop" title="This week's response loop draft" status="12 themes clustered · 4 draft responses written · awaiting Manager approval" onClick={()=>ctx.openModal(React.createElement(window.ResponseLoopModal,{ctx,onClose:ctx.closeModal}))} />
                <InProgressItem icon="doc" title="This month's newsletter draft" status="Cover letter ready · content compilation complete" onClick={()=>ctx.go('newsletter')} />
              </div>
            </Panel>
            <Panel title="Recent activity">
              <ActivityFeed items={[
                { icon:'check', text:'Streetlight on Chartiers Creek marked Resolved by Public Works.', t:'40 minutes ago' },
                { icon:'loop', text:'Response published: drainage after storms (approved by Manager).', t:'2 hours ago' },
                { icon:'ticket', text:'CT-2103 standing water at Webb Park routed to Sewer.', t:'3 hours ago' },
                { icon:'doc', text:'Mailed form from H. Bauer processed and routed.', t:'Yesterday' },
              ]} />
            </Panel>
          </div>
          <div className="col gap-16">
            <Panel title="Quick actions">
              <div className="col gap-8">
                <QA tour="qa-triage" primary onClick={()=>ctx.startTriage()}><Icon name="ticket" size={15} /> Triage Next Ticket</QA>
                <QA onClick={()=>ctx.go('loop',{tab:'Draft'})}><Icon name="loop" size={15} /> Start Response Loop for This Week</QA>
                <QA onClick={()=>ctx.go('incoming',{tab:'Mailed forms'})}><Icon name="doc" size={15} /> Process a New Mailed Form</QA>
              </div>
            </Panel>
            <Panel title="Today's calendar">
              <div className="col gap-8">
                <CalRow time="10:00" text="Department heads sync" />
                <CalRow time="14:00" text="Newsletter content review" />
                <CalRow time="-" text="Boyce Road resurfacing notice goes live" tone="amber" />
              </div>
            </Panel>
          </div>
        </TwoCol>
      </>
    );
  }
  function CalRow({ time, text, tone }) {
    return (<div className="row items-center gap-10"><span className="badge badge-gray" style={{ minWidth:46, justifyContent:'center' }}>{time}</span><span className="text-13">{text}</span>{tone&&<Badge tone={tone} square>scheduled</Badge>}</div>);
  }

  /* ---------- MANAGER ---------- */
  function ManagerHome({ ctx }) {
    const pending = ctx.store.rlPending ?? 4;
    return (
      <>
        <div data-tour="today-queues"><Grid>
          <QueueWidget icon="loop" tone="orange" count={pending} label="response loop drafts awaiting your approval" cta="Review" onClick={()=>ctx.openModal(React.createElement(window.RLApprovalModal,{ctx,onClose:ctx.closeModal}))} />
          <QueueWidget icon="alert" tone="red" count={2} label="escalation decisions needing your input" cta="Decide" onClick={()=>ctx.go('insights')} />
          <QueueWidget icon="coins" tone="navy" count={1} label="budget allocation pending" cta="Allocate" onClick={()=>toast('Budget allocation flow (placeholder). $500 neighborhood fund.')} />
          <QueueWidget icon="doc" tone="purple" count={3} label="newsletter sections awaiting your review" cta="Review" onClick={()=>ctx.go('newsletter')} />
        </Grid></div>
        <TwoCol>
          <div className="col gap-16">
            <Panel title="In progress">
              <div className="col gap-8">
                <InProgressItem icon="loop" title="This week's response loop" status={`${pending} drafts in approval`} onClick={()=>ctx.openModal(React.createElement(window.RLApprovalModal,{ctx,onClose:ctx.closeModal}))} />
                <InProgressItem icon="chart" title="This month's strategic priorities" status="Engagement up, stormwater volume rising" onClick={()=>ctx.go('insights')} />
              </div>
            </Panel>
            <Panel title="This week" action={<a onClick={()=>ctx.go('insights')}>Open insights</a>}>
              <div className="ai-panel"><AILabel>Manager briefing</AILabel><div className="text-13 mt-8">Ticket volume is 23% above the 4-week average, concentrated in stormwater after Tuesday's storm. Consider a proactive notice on the Boyce Road project status. Response times continue to improve.</div></div>
            </Panel>
          </div>
          <div className="col gap-16">
            <Panel title="Quick actions">
              <div className="col gap-8">
                <QA tour="qa-approvals" primary onClick={()=>ctx.openModal(React.createElement(window.RLApprovalModal,{ctx,onClose:ctx.closeModal}))}><Icon name="check" size={15} /> Review Pending Approvals</QA>
                <QA onClick={()=>ctx.go('newsletter')}><Icon name="doc" size={15} /> Sign the Newsletter Cover Letter</QA>
                <QA onClick={()=>ctx.go('insights')}><Icon name="chart" size={15} /> Open This Month's Insights Briefing</QA>
              </div>
            </Panel>
            <Panel title="Awaiting your signature">
              <InProgressItem icon="doc" title="May newsletter cover letter" status="Drafted by Secretary · ready to sign" onClick={()=>ctx.go('newsletter')} />
            </Panel>
          </div>
        </TwoCol>
      </>
    );
  }

  /* ---------- PUBLIC WORKS ---------- */
  function PublicWorksHome({ ctx }) {
    const mine = ctx.store.tickets.filter(t=>t.dept==='Public Works');
    const needResp = mine.filter(t=>!t.staffResp && t.phase!=='Declined');
    const staleProj = ctx.store.projects.filter(p=>p.dept==='Public Works' && p.stale);
    return (
      <>
        <div data-tour="today-queues"><Grid cols={3}>
          <QueueWidget icon="ticket" tone="navy" count={mine.length} label="tickets assigned to Public Works" cta="View queue" onClick={()=>ctx.go('incoming',{tab:'Tickets'})} />
          <QueueWidget icon="alert" tone="orange" count={needResp.length} label="tickets needing your response" cta="Respond" onClick={()=>{ const t=needResp[0]; t&&ctx.openTicket(t,'respond'); }} />
          <QueueWidget icon="project" tone="red" count={staleProj.length} label="projects needing phase updates" cta="Update" onClick={()=>{ const p=staleProj[0]; p&&ctx.openModal(React.createElement(window.ProjectUpdateModal,{project:p,ctx,onClose:ctx.closeModal})); }} />
        </Grid></div>
        <TwoCol>
          <div className="col gap-16">
            <Panel title="Tickets needing your response" action={<a onClick={()=>ctx.go('incoming',{tab:'Tickets'})}>View all</a>}>
              <div className="col gap-8">
                {needResp.slice(0,4).map(t=>(
                  <div key={t.id} className="row items-center gap-12" style={{ padding:'8px 0', borderBottom:'1px solid var(--border-soft)' }}>
                    <PhaseBadge phase={t.phase} />
                    <div className="flex1"><div className="fw6 text-13">{t.title}</div><div className="muted text-xs">{t.id} · {t.loc}</div></div>
                    <button className="btn btn-secondary btn-sm" onClick={()=>ctx.openTicket(t,'respond')}>Respond</button>
                  </div>
                ))}
                {needResp.length===0 && <Empty icon="check" title="No tickets awaiting response" />}
              </div>
            </Panel>
            <Panel title="This week's project milestones">
              <ActivityFeed items={[
                { icon:'project', text:'Washington Pike Crosswalks: signal-head install scheduled next week.', t:'Updated 8 days ago' },
                { icon:'project', text:'Settlers Ridge Sidewalk Repair: Phase 2 mobilization Monday.', t:'Updated 9 days ago' },
                { icon:'check', text:'Old Village Streetlight Conversion: 70% complete.', t:'Updated 7 days ago' },
              ]} />
            </Panel>
          </div>
          <div className="col gap-16">
            <Panel title="Quick actions">
              <div className="col gap-8">
                <QA tour="qa-respond" primary onClick={()=>{ const t=needResp[0]; t&&ctx.openTicket(t,'respond'); }}><Icon name="ticket" size={15} /> Respond to Next Ticket</QA>
                <QA onClick={()=>{ const p=ctx.store.projects.find(p=>p.dept==='Public Works'); p&&ctx.openModal(React.createElement(window.ProjectUpdateModal,{project:p,ctx,onClose:ctx.closeModal})); }}><Icon name="project" size={15} /> Update a Project</QA>
                <QA onClick={()=>ctx.openModal(React.createElement(window.NoticeCreateModal,{ctx,onClose:ctx.closeModal,dept:'Public Works'}))}><Icon name="alert" size={15} /> Create a Notice</QA>
              </div>
            </Panel>
            <Panel title="Today's scheduled work">
              <div className="col gap-8">
                <CalRow time="AM" text="Boyce Road crew - pothole assessment" />
                <CalRow time="AM" text="Hilltop Road crack-seal" />
                <CalRow time="PM" text="Sidewalk panel pour, Settlers Ridge" />
              </div>
            </Panel>
          </div>
        </TwoCol>
      </>
    );
  }

  /* ---------- PARKS ---------- */
  function ParksHome({ ctx }) {
    const mine = ctx.store.tickets.filter(t=>t.dept==='Parks');
    return (
      <>
        <div data-tour="today-queues"><Grid cols={3}>
          <QueueWidget icon="calendar" tone="green" count={3} label="events ready to publish" cta="Publish" onClick={()=>ctx.openModal(React.createElement(window.EventCreateModal,{ctx,onClose:ctx.closeModal}))} />
          <QueueWidget icon="ticket" tone="navy" count={mine.length} label="parks tickets assigned" cta="Respond" onClick={()=>ctx.go('incoming',{tab:'Tickets'})} />
          <QueueWidget icon="project" tone="purple" count={2} label="parks projects in active design" cta="Update" onClick={()=>ctx.go('content',{tab:'Projects'})} />
        </Grid></div>
        <TwoCol>
          <div className="col gap-16">
            <Panel title="Parks tickets" action={<a onClick={()=>ctx.go('incoming',{tab:'Tickets'})}>View all</a>}>
              <div className="col gap-8">
                {mine.slice(0,4).map(t=>(
                  <div key={t.id} className="row items-center gap-12" style={{ padding:'8px 0', borderBottom:'1px solid var(--border-soft)' }}>
                    <PhaseBadge phase={t.phase} />
                    <div className="flex1"><div className="fw6 text-13">{t.title}</div><div className="muted text-xs">{t.id} · {t.loc}</div></div>
                    <button className="btn btn-secondary btn-sm" onClick={()=>ctx.openTicket(t, t.staffResp?'view':'respond')}>{t.staffResp?'View':'Respond'}</button>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
          <div className="col gap-16">
            <Panel title="Quick actions">
              <div className="col gap-8">
                <QA tour="qa-event" primary onClick={()=>ctx.openModal(React.createElement(window.EventCreateModal,{ctx,onClose:ctx.closeModal}))}><Icon name="calendar" size={15} /> Create an Event</QA>
                <QA onClick={()=>ctx.go('content',{tab:'Projects'})}><Icon name="project" size={15} /> Update a Parks Project</QA>
                <QA onClick={()=>{ const t=mine.find(t=>!t.staffResp); t&&ctx.openTicket(t,'respond'); }}><Icon name="ticket" size={15} /> Respond to Next Ticket</QA>
              </div>
            </Panel>
            <Panel title="Upcoming events">
              <div className="col gap-8">
                <CalRow time="Jul 11" text="Movies in the Park - Webb Park" />
                <CalRow time="Jul 18" text="Summer Concert Series" />
                <CalRow time="Jul 25" text="Movies in the Park - Hilltop" />
              </div>
            </Panel>
          </div>
        </TwoCol>
      </>
    );
  }

  /* ---------- FINANCE ---------- */
  function FinanceHome({ ctx }) {
    return (
      <>
        <div data-tour="today-queues"><Grid>
          <StatWidget label="Capital projects" value="6 active" sub="2 over budget" tone="navy" flag="2 over" onClick={()=>ctx.go('insights',{tab:'Capital projects'})} />
          <StatWidget label="Active grants" value="4" sub="1 deadline this month" tone="navy" />
          <StatWidget label="Reward spend YTD" value="$4,200" sub="of $12,000 budgeted (35%)" tone="green" />
          <StatWidget label="This quarter's revenue" value="On track" sub="No variance flags" tone="green" />
        </Grid></div>
        <TwoCol>
          <div className="col gap-16">
            <Panel title="Capital budget - attention needed" action={<a onClick={()=>ctx.go('insights',{tab:'Capital projects'})}>Open tracker</a>}>
              <table className="tbl">
                <thead><tr><th>Project</th><th>Budgeted</th><th>Actual</th><th>Status</th></tr></thead>
                <tbody>
                  {ctx.store.projects.filter(p=>p.budget).slice(0,5).map(p=>{
                    const over = p.spent>p.budget;
                    return <tr key={p.id} className="clickable" onClick={()=>ctx.openModal(React.createElement(window.FinanceReviewModal,{ctx,onClose:ctx.closeModal,subject:p.name}))}>
                      <td className="fw6">{p.name}</td><td>${(p.budget/1000).toFixed(0)}K</td><td>${(p.spent/1000).toFixed(0)}K</td>
                      <td>{over?<Badge tone="red" dot>Over</Badge>:<Badge tone="green" dot>On track</Badge>}</td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </Panel>
            <Panel title="Financial alerts">
              <ActivityFeed items={[
                { icon:'coins', text:'Boyce Road Stormwater is $12K over on the engineering study.', t:'40 minutes ago' },
                { icon:'doc', text:'Vendor contract renewal: Hollow Oak (native plant kits) in 30 days.', t:'2 hours ago' },
                { icon:'grant', text:'Green Infrastructure grant deadline is July 31.', t:'5 hours ago' },
              ]} />
            </Panel>
          </div>
          <div className="col gap-16">
            <Panel title="Quick actions">
              <div className="col gap-8">
                <QA tour="qa-budget" primary onClick={()=>ctx.go('insights',{tab:'Capital projects'})}><Icon name="chart" size={15} /> Open Capital Budget Tracker</QA>
                <QA onClick={()=>ctx.go('insights')}><Icon name="grant" size={15} /> Review Grant Pipeline</QA>
                <QA onClick={()=>toast('Quarterly report generated (placeholder export).')}><Icon name="doc" size={15} /> Generate Quarterly Report</QA>
                <QA onClick={()=>toast('Vendor invoice approved.')}><Icon name="check" size={15} /> Approve Pending Vendor Invoice</QA>
              </div>
            </Panel>
            <Panel title="Reward catalog spend">
              <div className="col gap-8">
                <div className="row items-center justify-between text-13"><span>Year-to-date</span><span className="fw7">$4,200</span></div>
                <div className="pbar"><span style={{ width:'35%' }} /></div>
                <div className="muted text-xs">35% of $12,000 annual budget</div>
              </div>
            </Panel>
          </div>
        </TwoCol>
      </>
    );
  }

  /* ---------- COMMISSIONER ---------- */
  function CommissionerHome({ ctx }) {
    return (
      <>
        <div data-tour="today-queues"><Grid cols={3}>
          <StatWidget label="Resident engagement" value="47%" sub="participation rate this month" trend="+3 pts" trendDir="up" tone="navy" />
          <StatWidget label="Recent response loop" value="4 themes" sub="published this month" tone="navy" onClick={()=>ctx.go('loop',{tab:'Published'})} />
          <StatWidget label="Upcoming votes" value="1" sub="Recycling expansion · July 28" tone="orange" />
        </Grid></div>
        <TwoCol>
          <div className="col gap-16">
            <Panel title="This month's governance briefing" action={<a onClick={()=>ctx.go('insights')}>Open full briefing</a>}>
              <div className="ai-panel"><AILabel>Monthly summary</AILabel><div className="text-13 mt-8">Engagement reached 47% of households, a third-straight monthly rise. Stormwater concerns dominated resident input after the Tuesday storm. The recycling expansion heads to a vote July 28 with split-but-engaged feedback. Response times improved to 2.3 days.</div></div>
            </Panel>
            <Panel title="Items needing a board vote">
              <div className="col gap-8">
                <InProgressItem icon="recycle" title="Expanded Recycling Pickup" status="Board vote · July 28 · 52 resident comments" onClick={()=>ctx.go('content',{tab:'Proposals'})} />
                <InProgressItem icon="coins" title="$500 neighborhood budget allocation" status="Monthly participatory allocation · open" onClick={()=>toast('Voting interface (placeholder). Allocate the monthly $500 fund.')} />
              </div>
            </Panel>
          </div>
          <div className="col gap-16">
            <Panel title="Quick actions">
              <div className="col gap-8">
                <QA tour="qa-vote" primary onClick={()=>toast('Voting on the $500 neighborhood allocation (placeholder).')}><Icon name="coins" size={15} /> Vote on This Month's Allocation</QA>
                <QA onClick={()=>ctx.go('insights')}><Icon name="chart" size={15} /> Open Monthly Governance Briefing</QA>
                <QA onClick={()=>ctx.go('settings')}><Icon name="gear" size={15} /> Review Platform Policies</QA>
              </div>
            </Panel>
            <Panel title="Year-over-year">
              <div className="col gap-8">
                <YoY label="Engagement" now="47%" then="29%" />
                <YoY label="Avg response time" now="2.3d" then="3.8d" good />
                <YoY label="Tickets resolved" now="61/mo" then="31/mo" />
              </div>
            </Panel>
          </div>
        </TwoCol>
      </>
    );
  }
  function YoY({ label, now, then, good }) {
    return (<div className="row items-center justify-between text-13"><span className="muted">{label}</span><span className="row items-center gap-8"><span className="muted text-xs">{then}</span><Icon name="arrowRight" size={12} color="var(--text-3)" /><span className="fw7">{now}</span></span></div>);
  }

  /* ---------- GENERIC (sewer, codes, police, planning, garbage, comms) ---------- */
  function GenericHome({ ctx }) {
    const r = SEED.ROLES.find(x=>x.id===ctx.role);
    const dept = r.dept;
    const mine = ctx.store.tickets.filter(t=>t.dept===dept);
    const cfg = {
      sewer:   { widgets:[['wave','navy',mine.length,'drainage tickets assigned to Sewer'],['alert','orange',mine.filter(t=>!t.staffResp).length,'tickets needing your response'],['project','purple',1,'stormwater projects needing a phase update']], actions:[['Respond to Next Ticket','ticket','respond'],['Update a Project','project','project'],['Create a Notice','alert','notice']] },
      codes:   { widgets:[['ruler','navy',mine.length,'property and blight tickets assigned'],['doc','purple',3,'building permit reviews in queue'],['alert','red',1,'code enforcement escalation']], actions:[['Respond to Next Ticket','ticket','respond'],['Review Next Permit','doc','permit'],['Create a Notice','alert','notice']] },
      police:  { widgets:[['shield','navy',mine.length,'public safety tickets assigned'],['cone','orange',2,'traffic concern tickets'],['calendar','green',1,'community policing event ready to publish']], actions:[['Respond to Next Ticket','ticket','respond'],['Publish Next Event','calendar','event']] },
      planning:{ widgets:[['map','navy',3,'proposals in active stages you own'],['layers','orange',1,'proposal needs a stage advancement'],['calendar','purple',4,'agenda items · Planning Commission July 14']], actions:[['Advance a Proposal Stage','layers','proposal'],['Add Documents to a Proposal','doc','proposal'],['Write a Feedback Callout','sparkle','proposal']] },
      garbage: { widgets:[['calendar','orange',2,'upcoming holidays needing schedule notices'],['recycle','navy',1,'vendor coordination item'],['ticket','gray',0,'active sanitation tickets']], actions:[['Create a Notice','alert','notice'],['Post a Schedule Change','calendar','notice'],['Update Recycling Program Info','recycle','notice']] },
      comms:   { widgets:[['coins','red',3,'reward catalog items low on inventory'],['broadcast','navy',2,'business partner inquiries'],['layers','purple',8,'content items needing tag review'],['flag','orange',5,'anti-abuse flags to review']], actions:[['Manage Reward Catalog','coins','reward'],['Tag Pending Content','layers','tag'],['Review Engagement Metrics','chart','insights']] },
    }[ctx.role] || { widgets:[['ticket','navy',mine.length,`tickets assigned to ${dept}`]], actions:[['Respond to Next Ticket','ticket','respond']] };

    function doAction(kind){
      if (kind==='respond'){ const t=mine.find(t=>!t.staffResp)||mine[0]; t?ctx.openTicket(t,t.staffResp?'view':'respond'):toast('No tickets in your queue.'); }
      else if (kind==='notice') ctx.openModal(React.createElement(window.NoticeCreateModal,{ctx,onClose:ctx.closeModal,dept}));
      else if (kind==='event') ctx.openModal(React.createElement(window.EventCreateModal,{ctx,onClose:ctx.closeModal,dept}));
      else if (kind==='proposal'){ const p=ctx.store.proposals.find(p=>p.dept==='Planning'); p&&ctx.openModal(React.createElement(window.ProposalAdvanceModal,{proposal:p,ctx,onClose:ctx.closeModal})); }
      else if (kind==='reward') ctx.go('settings',{tab:'Reward catalog'});
      else if (kind==='tag') ctx.go('content');
      else if (kind==='insights') ctx.go('insights');
      else if (kind==='project'){ const p=ctx.store.projects.find(p=>p.dept===dept)||ctx.store.projects[0]; ctx.openModal(React.createElement(window.ProjectUpdateModal,{project:p,ctx,onClose:ctx.closeModal})); }
      else if (kind==='permit') toast('Permit review opens here. In production, this is the full permit workflow.');
    }

    return (
      <>
        <div data-tour="today-queues"><Grid cols={cfg.widgets.length>3?4:3}>
          {cfg.widgets.map((w,i)=>(<QueueWidget key={i} icon={w[0]} tone={w[1]} count={w[2]} label={w[3]} cta="Open" onClick={()=>ctx.go('incoming',{tab:'Tickets'})} />))}
        </Grid></div>
        <TwoCol>
          <div className="col gap-16">
            <Panel title={`${dept} tickets`} action={<a onClick={()=>ctx.go('incoming',{tab:'Tickets'})}>View all</a>}>
              <div className="col gap-8">
                {mine.length===0 && <Empty icon="check" title="No open tickets in your queue" sub="New items routed to your department will appear here." />}
                {mine.slice(0,5).map(t=>(
                  <div key={t.id} className="row items-center gap-12" style={{ padding:'8px 0', borderBottom:'1px solid var(--border-soft)' }}>
                    <PhaseBadge phase={t.phase} />
                    <div className="flex1"><div className="fw6 text-13">{t.title}</div><div className="muted text-xs">{t.id} · {t.loc}</div></div>
                    <button className="btn btn-secondary btn-sm" onClick={()=>ctx.openTicket(t, t.staffResp?'view':'respond')}>{t.staffResp?'View':'Respond'}</button>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
          <div className="col gap-16">
            <Panel title="Quick actions" >
              <div className="col gap-8" data-tour="qa-respond">
                {cfg.actions.map((a,i)=>(<QA key={i} primary={i===0} onClick={()=>doAction(a[2])}><Icon name={a[1]} size={15} /> {a[0]}</QA>))}
              </div>
            </Panel>
            {ctx.role==='planning' && <Panel title="Proposal pipeline"><div className="col gap-8">{ctx.store.proposals.filter(p=>p.dept==='Planning').slice(0,4).map(p=>(<div key={p.id} className="row items-center justify-between text-13"><span className="fw6" style={{maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</span><Badge tone="purple" square>{p.stage}</Badge></div>))}</div></Panel>}
          </div>
        </TwoCol>
      </>
    );
  }

  window.Home = Home;
})();
