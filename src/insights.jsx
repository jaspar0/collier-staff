/* Insights (5 layers) + Settings -> window.Insights, window.Settings */
(function () {
  const { useState } = React;
  const Icon = window.Icon, SEED = window.SEED;
  const { Badge, StatWidget, Sparkline, BarChart, LineChart, AIButton, AILabel, Spinner, toast, Placeholder, Empty } = window;
  const I = SEED.insights;

  function Head({ title, sub, right }) {
    return (<div className="row items-center justify-between wrap gap-12 mb-16"><div><h1 className="page-title">{title}</h1>{sub&&<div className="muted text-13 mt-4">{sub}</div>}</div>{right}</div>);
  }
  function SubTabs({ tabs, active, onPick }) {
    return (<div className="row gap-4 wrap" style={{ borderBottom:'1px solid var(--border-soft)', marginBottom:16 }}>
      {tabs.map(t=>(<button key={t} onClick={()=>onPick(t)} style={{ background:'none', border:'none', padding:'9px 12px', fontSize:13, fontWeight:600, cursor:'pointer', color: active===t?'var(--navy)':'var(--text-2)', borderBottom: active===t?'2px solid var(--navy)':'2px solid transparent', marginBottom:-1 }}>{window.titleCase(t)}</button>))}
    </div>);
  }
  function Panel({ title, children, right }) {
    return (<div className="card"><div className="row items-center justify-between" style={{padding:'12px 16px',borderBottom:'1px solid var(--border-soft)'}}><div className="subhead" style={{fontSize:14}}>{title}</div>{right}</div><div style={{padding:16}}>{children}</div></div>);
  }

  /* ============ INSIGHTS ============ */
  function Insights({ ctx }) {
    const tabs = ['Overview','Domain dashboard','Capital projects','Deep dive','Forecasting'];
    const [tab, setTab] = useState(ctx.route.tab && tabs.includes(ctx.route.tab) ? ctx.route.tab : 'Overview');
    return (
      <>
        <Head title="Insights" sub="Quick reads, domain dashboards, and AI-surfaced insights" />
        <SubTabs tabs={tabs} active={tab} onPick={setTab} />
        {tab==='Overview' && <Overview ctx={ctx} />}
        {tab==='Domain dashboard' && <DomainDash ctx={ctx} />}
        {tab==='Capital projects' && <CapitalProjects ctx={ctx} />}
        {tab==='Deep dive' && <DeepDive ctx={ctx} />}
        {tab==='Forecasting' && <Forecasting ctx={ctx} />}
      </>
    );
  }

  /* Layer A: quick reads + Layer C: AI insights */
  function Overview({ ctx }) {
    const [insights, setInsights] = useState(I.aiInsights.slice(0,3));
    const [gen, setGen] = useState(false);
    return (
      <div className="col gap-16">
        {/* AI one-line summary */}
        <div className="ai-panel row items-center gap-12">
          <Icon name="sparkle" size={20} color="var(--blue)" />
          <div className="flex1 text-13"><b>This week:</b> ticket volume is 23% above the 4-week average, concentrated in stormwater after Tuesday's storm. Otherwise normal. Response times continue to improve.</div>
          <AILabel>AI summary</AILabel>
        </div>

        {/* Quick reads */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }} className="qgrid">
          <QuickRead label="This week's tickets" value="47" trend="+23% vs avg" dir="up" data={I.ticketVolume} color="var(--orange)" />
          <QuickRead label="Avg time to response" value="2.3 days" trend="-12% improving" dir="down" data={I.responseTime} color="var(--green)" inv />
          <QuickRead label="Engagement rate" value="47%" trend="+3 pts" dir="up" data={I.engagement} color="var(--blue)" />
          <QuickRead label="Newsletter response" value="38%" trend="steady" data={I.engagement.map(x=>x*0.8)} color="var(--navy)" />
          <QuickRead label="Reward redemptions" value="142" trend="+5%" dir="up" data={I.redemptions} color="var(--purple)" />
          <QuickRead label="Sentiment" value="Positive" trend="neutral leaning positive" data={I.sentiment.map(x=>x*100)} color="var(--green)" />
        </div>

        {/* AI-surfaced insights (Layer C) */}
        <Panel title="AI-surfaced insights" right={<AIButton label={gen?'Regenerate':'Generate this week\u0027s insights'} loadingLabel="Analyzing…" delay={2200} onResult={()=>{ setInsights(I.aiInsights); setGen(true); }} className="btn btn-secondary btn-sm" />}>
          <div className="col gap-10">
            {insights.map(ins=>(
              <div key={ins.id} className="card card-pad row items-start gap-12" style={{ background:'var(--gray-50)' }}>
                <div style={{ width:30, height:30, borderRadius:7, background:'#fff', border:'1px solid #c9d6ea', display:'grid', placeItems:'center', flex:'none' }}><Icon name="sparkle" size={16} color="var(--blue)" /></div>
                <div className="flex1"><div className="fw7 text-13">{ins.head}</div><div className="muted text-13 mt-4">{ins.body}</div>
                  <div className="row gap-8 mt-12">{ins.actions.map(a=>(<button key={a} className="btn btn-secondary btn-sm" onClick={()=>handleInsightAction(a, ins, ctx)}>{a} <Icon name="arrowRight" size={12} /></button>))}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {ctx.role==='manager' && (
          <Panel title="Board preparation" right={<AIButton label="Generate Board Prep Packet" loadingLabel="Compiling…" delay={2400} onResult={()=>toast('Board prep packet compiled. 2-page PDF preview ready (placeholder export).')} className="btn btn-primary btn-sm" />}>
            <div className="muted text-13">AI compiles the month's aggregated data into an export-ready 2-page summary for the board meeting: engagement, top themes, proposal status, and budget flags.</div>
          </Panel>
        )}
      </div>
    );
  }
  function QuickRead({ label, value, trend, dir, data, color, inv }) {
    return (
      <div className="card card-pad">
        <div className="row items-center justify-between"><span className="eyebrow">{label}</span><Sparkline data={data} w={70} h={26} color={color} /></div>
        <div className="row items-end gap-8 mt-8">
          <div style={{ fontSize:24, fontWeight:700, lineHeight:1 }}>{value}</div>
          <div className="row items-center gap-4 text-xs fw6" style={{ color: dir==='up'?(inv?'var(--red)':'var(--green)'):dir==='down'?(inv?'var(--green)':'var(--green)'):'var(--text-3)', paddingBottom:2 }}>
            {dir && <Icon name={dir==='up'?'arrowUp':'arrowDown'} size={12} />}{trend}
          </div>
        </div>
      </div>
    );
  }
  function handleInsightAction(a, ins, ctx) {
    if (a==='Create proposal' || a==='Draft proposal') ctx.openModal(React.createElement(window.ProposalFromPatternModal,{pattern:ins.head,ctx,onClose:ctx.closeModal}));
    else if (a==='View cluster') ctx.go('incoming',{tab:'Merge candidates'});
    else if (a==='Review feedback') ctx.go('content',{tab:'Proposals'});
    else toast(`${a}: drilling into "${ins.head}".`);
  }

  /* Layer B: domain dashboard (role-specific) */
  function DomainDash({ ctx }) {
    const role = ctx.role;
    if (['finance'].includes(role)) return <CapitalProjects ctx={ctx} />;
    return (
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }} className="twocol">
        <Panel title="Ticket volume by month"><BarChart data={I.ticketVolume} labels={I.monthLabels} highlightLast /></Panel>
        <Panel title="Time to response (days)"><LineChart series={[{ data:I.responseTime, color:'var(--green)' }]} labels={I.monthLabels} /></Panel>
        <Panel title="Engagement rate (%)"><LineChart series={[{ data:I.engagement, color:'var(--blue)' }]} labels={I.monthLabels} /></Panel>
        <Panel title="Ticket categories">
          <div className="col gap-8">
            {[['Roads',34,'var(--navy)'],['Drainage',22,'var(--blue)'],['Parks',16,'var(--green)'],['Lighting',12,'var(--orange)'],['Other',16,'var(--text-3)']].map(c=>(
              <div key={c[0]} className="row items-center gap-10"><span className="text-13" style={{width:70}}>{c[0]}</span><div className="pbar flex1"><span style={{width:c[1]+'%',background:c[2]}} /></div><span className="text-xs muted tnum" style={{width:32}}>{c[1]}%</span></div>
            ))}
          </div>
        </Panel>
      </div>
    );
  }

  /* Layer B (finance) / capital tracker */
  function CapitalProjects({ ctx }) {
    const projects = ctx.store.projects.filter(p=>p.budget);
    return (
      <div className="col gap-16">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }} className="qgrid">
          <StatWidget label="Total budgeted" value={'$'+(projects.reduce((a,p)=>a+p.budget,0)/1e6).toFixed(2)+'M'} tone="navy" />
          <StatWidget label="Total spent" value={'$'+(projects.reduce((a,p)=>a+p.spent,0)/1e6).toFixed(2)+'M'} tone="navy" />
          <StatWidget label="Over budget" value={projects.filter(p=>p.spent>p.budget).length+' projects'} tone="red" flag="Attention" />
        </div>
        <Panel title="Capital budget - budgeted vs actual">
          <table className="tbl">
            <thead><tr><th>Project</th><th>Dept</th><th>Budgeted</th><th>Actual</th><th>Variance</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {projects.map(p=>{ const v=p.spent-p.budget; const over=v>0; return (
                <tr key={p.id}>
                  <td className="fw6">{p.name}</td><td><Badge tone="blue" square>{p.dept}</Badge></td>
                  <td className="tnum">${(p.budget/1000).toFixed(0)}K</td><td className="tnum">${(p.spent/1000).toFixed(0)}K</td>
                  <td className="tnum" style={{color:over?'var(--red)':'var(--green)'}}>{over?'+':''}${Math.abs(v/1000).toFixed(0)}K</td>
                  <td>{over?<Badge tone="red" dot>Over</Badge>:<Badge tone="green" dot>On track</Badge>}</td>
                  <td className="tright">{ctx.role==='finance' ? <button className="btn btn-secondary btn-sm" onClick={()=>ctx.openModal(React.createElement(window.FinanceReviewModal,{ctx,onClose:ctx.closeModal,subject:p.name}))}>Review</button> : <a onClick={()=>toast('Opening project budget detail.')}>View</a>}</td>
                </tr>
              ); })}
            </tbody>
          </table>
        </Panel>
      </div>
    );
  }

  /* Layer D: deep dive */
  function DeepDive({ ctx }) {
    const [running, setRunning] = useState(false);
    const [done, setDone] = useState(false);
    return (
      <div className="col gap-16">
        <Panel title="Query builder">
          <div className="row gap-12 wrap items-end">
            <FieldSel label="Metric" opts={['Ticket volume','Response time','Engagement','Sentiment','Redemptions']} />
            <FieldSel label="Neighborhood" opts={['All',...SEED.NEIGHBORHOODS]} />
            <FieldSel label="Category" opts={['All','Roads','Drainage','Parks','Lighting','Traffic']} />
            <FieldSel label="Date range" opts={['Last 4 weeks','Last quarter','Last 12 months','Year to date']} />
            <button className="btn btn-primary" onClick={()=>{ setRunning(true); setDone(false); setTimeout(()=>{ setRunning(false); setDone(true); }, 1400); }}>{running? <Spinner size={14}/> : <Icon name="search" size={15} />} Run Query</button>
          </div>
        </Panel>
        {done && (
          <Panel title="Result: Ticket volume · Webb · Drainage · last 12 months">
            <BarChart data={[2,3,4,3,5,4,2,3,5,6,8,11]} labels={I.monthLabels} highlightLast />
            <div className="muted text-sm mt-12">Drainage tickets in Webb are up sharply over the last quarter, consistent with the stormwater pattern surfaced in this week's insights.</div>
          </Panel>
        )}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }} className="twocol">
          <Panel title="Compare time periods"><div className="muted text-13">Place two date ranges side by side for any metric. Useful for before/after a notable event such as the Tuesday storm.</div><div className="row gap-12 mt-12"><MiniStat label="This quarter" v="148 tickets" /><Icon name="arrowRight" size={16} color="var(--text-3)" style={{alignSelf:'center'}} /><MiniStat label="Prior quarter" v="106 tickets" /></div></Panel>
          <Panel title="Sentiment analysis"><div className="muted text-13 mb-8">On resident text across tickets and comments.</div><div className="col gap-6">{[['Positive',54,'var(--green)'],['Neutral',31,'var(--text-3)'],['Negative',15,'var(--red)']].map(s=>(<div key={s[0]} className="row items-center gap-10"><span className="text-13" style={{width:64}}>{s[0]}</span><div className="pbar flex1"><span style={{width:s[1]+'%',background:s[2]}} /></div><span className="text-xs muted tnum">{s[1]}%</span></div>))}</div></Panel>
        </div>
      </div>
    );
  }
  function FieldSel({ label, opts }) { return (<div><div className="field-label">{label}</div><select className="select" style={{minWidth:150}}>{opts.map(o=><option key={o}>{o}</option>)}</select></div>); }
  function MiniStat({ label, v }) { return (<div className="card card-pad flex1"><div className="eyebrow mb-4">{label}</div><div className="fw7" style={{fontSize:18}}>{v}</div></div>); }

  /* Layer E: forecasting */
  function Forecasting({ ctx }) {
    return (
      <div className="col gap-16">
        <div className="ai-panel row items-center gap-12"><Icon name="sparkle" size={18} color="var(--blue)" /><div className="flex1 text-13">Predictive aids use 8 months of history plus multi-year seasonal patterns. Projections are directional, not commitments.</div><AILabel>Forecast</AILabel></div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }} className="twocol">
          <Panel title="Seasonal pattern: leaf tickets"><LineChart series={[{ data:[5,8,14,22,35,40,28,12,6,4,3,4], color:'var(--orange)' }]} labels={I.monthLabels} /><div className="muted text-sm mt-8">Based on a 3-year pattern, expect roughly 40 leaf-related tickets starting October 15. Pre-plan crew capacity.</div></Panel>
          <Panel title="Predictive workload"><div className="col gap-10">
            <div className="row items-center justify-between text-13"><span>Public Works</span><Badge tone="orange" dot>+0.5 FTE likely</Badge></div>
            <div className="muted text-xs">Volume growth of 18% over two quarters suggests added capacity by Q4.</div>
            <hr className="divider" />
            <div className="row items-center justify-between text-13"><span>Sewer</span><Badge tone="green" dot>Stable</Badge></div>
            <div className="muted text-xs">Within normal range despite seasonal stormwater spikes.</div>
          </div></Panel>
          <Panel title="Capital needs forecast"><div className="col gap-8">{[['Road resurfacing','High','var(--red)'],['Stormwater upgrades','High','var(--red)'],['Park facilities','Medium','var(--orange)'],['Streetlight LED','Low','var(--green)']].map(c=>(<div key={c[0]} className="row items-center justify-between text-13"><span>{c[0]}</span><Badge tone={c[2]==='var(--red)'?'red':c[2]==='var(--orange)'?'orange':'green'} dot>{c[1]}</Badge></div>))}</div></Panel>
          <Panel title="Vendor contract renewals"><div className="col gap-8">{[['Hollow Oak','30 days','92'],['Allegheny Print','120 days','88'],['Waste Mgmt','210 days','79']].map(v=>(<div key={v[0]} className="row items-center justify-between text-13"><span className="fw6">{v[0]}</span><span className="row items-center gap-8"><Badge tone="gray" square>{v[1]}</Badge><span className="muted text-xs">score {v[2]}</span></span></div>))}</div></Panel>
        </div>
      </div>
    );
  }

  /* ============ SETTINGS ============ */
  function Settings({ ctx }) {
    const Row = window.SettingsRow;
    const tabs = ['My profile','Reward catalog','Business partners','Notification schedules','Neighborhoods','Category routing','Point and tier policies','Guidelines','Audit log'];
    const [tab, setTab] = useState(ctx.route.tab && tabs.includes(ctx.route.tab) ? ctx.route.tab : 'My profile');
    return (
      <>
        <Head title="Settings" sub="Policies and configuration" />
        <div style={{ display:'grid', gridTemplateColumns:'200px 1fr', gap:20, alignItems:'start' }} className="settings-grid">
          <div className="card" style={{ overflow:'hidden' }}>
            {tabs.map(t=>(<button key={t} onClick={()=>setTab(t)} style={{ display:'block', width:'100%', textAlign:'left', padding:'10px 14px', background: tab===t?'var(--navy-100)':'#fff', border:'none', borderBottom:'1px solid var(--border-soft)', fontSize:13, fontWeight: tab===t?700:500, color: tab===t?'var(--navy)':'var(--text-2)', cursor:'pointer' }}>{window.titleCase(t)}</button>))}
          </div>
          <div>
            {tab==='My profile' && <Panel title="My profile and preferences"><div className="col gap-10"><Row k="Role" v={SEED.ROLES.find(r=>r.id===ctx.role).name} /><Row k="Department naming" v="Internal UI uses role and department labels" /><Row k="Email digest" v="Daily, 8:00 AM" /><Row k="Notification sound" v="On" /></div></Panel>}
            {tab==='Reward catalog' && <RewardCatalog ctx={ctx} />}
            {tab==='Audit log' && <AuditLog ctx={ctx} />}
            {tab==='Category routing' && <Panel title="Category to department routing"><table className="tbl"><thead><tr><th>Category</th><th>Routes to</th></tr></thead><tbody>{[['Roads / Pothole','Public Works'],['Drainage','Sewer'],['Parks','Parks and Recreation'],['Traffic','Police'],['Property / Blight','Building and Codes'],['Sanitation','Garbage and Recycling']].map(r=>(<tr key={r[0]}><td className="fw6">{r[0]}</td><td><Badge tone="blue" square>{r[1]}</Badge></td></tr>))}</tbody></table></Panel>}
            {tab==='Neighborhoods' && <Panel title="Neighborhood master list"><div className="row gap-8 wrap">{SEED.NEIGHBORHOODS.map(n=><Badge key={n} tone="gray" square>{n}</Badge>)}</div></Panel>}
            {!['My profile','Reward catalog','Audit log','Category routing','Neighborhoods'].includes(tab) && <Placeholder title={tab} body={`Configuration for ${tab.toLowerCase()} lives here. Most settings are restricted to the Secretary and Manager; other roles have read access.`} />}
          </div>
        </div>
      </>
    );
  }
  function RewardCatalog({ ctx }) {
    return (
      <Panel title="Reward catalog" right={<button className="btn btn-secondary btn-sm" onClick={()=>toast('Add reward (placeholder).')}><Icon name="plus" size={14} /> Add reward</button>}>
        <table className="tbl">
          <thead><tr><th>Reward</th><th>Partner</th><th>Tier</th><th>Cost</th><th>Stock</th><th>Redeemed</th></tr></thead>
          <tbody>{SEED.rewards.map(r=>(<tr key={r.id}><td className="fw6">{r.name}</td><td className="muted">{r.partner}</td><td><Badge tone="gray" square>{r.tier}</Badge></td><td className="tnum">{r.cost} pts</td><td>{r.stock<=4?<Badge tone="red" dot>{r.stock} low</Badge>:<span className="tnum">{r.stock}</span>}</td><td className="tnum muted">{r.redeemed}</td></tr>))}</tbody>
        </table>
      </Panel>
    );
  }
  function AuditLog({ ctx }) {
    const [q, setQ] = useState('');
    let rows = SEED.auditLog;
    if (q) rows = rows.filter(r=>(r.action+r.actor+r.target).toLowerCase().includes(q.toLowerCase()));
    return (
      <Panel title={`Audit log · ${SEED.auditLog.length} entries`} right={<div style={{position:'relative'}}><span style={{position:'absolute',left:8,top:7,color:'var(--text-3)'}}><Icon name="search" size={14} /></span><input className="input btn-sm" style={{paddingLeft:28,width:180}} placeholder="Search log…" value={q} onChange={e=>setQ(e.target.value)} /></div>}>
        <div style={{ maxHeight:420, overflowY:'auto' }}>
          <table className="tbl"><thead><tr><th>Time</th><th>Action</th><th>Actor</th><th>Target</th></tr></thead>
            <tbody>{rows.slice(0,60).map(r=>(<tr key={r.id}><td className="muted text-xs tnum">{r.ts}</td><td className="fw6 text-13">{r.action}</td><td><Badge tone="blue" square>{r.actor}</Badge></td><td className="muted text-xs tnum">{r.target}</td></tr>))}</tbody>
          </table>
        </div>
      </Panel>
    );
  }

  window.Insights = Insights;
  window.Settings = Settings;
})();
