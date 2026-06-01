/* Shared UI components -> window.* */
(function () {
  const { useState, useEffect, useRef } = React;
  const Icon = window.Icon;
  const SEED = window.SEED;

  const TC_SMALL = new Set(['a','an','and','as','at','but','by','for','in','of','on','or','the','to','vs','via','with','per']);
  function titleCase(s) {
    return String(s).split(' ').map((w,i,arr) => {
      const lw = w.toLowerCase();
      if (i!==0 && i!==arr.length-1 && TC_SMALL.has(lw)) return lw;
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');
  }

  // ---- toast bus ----
  const toastListeners = [];
  function toast(msg, opts={}) { toastListeners.forEach(fn => fn(msg, opts)); }
  function ToastHost() {
    const [items, setItems] = useState([]);
    useEffect(() => {
      const fn = (msg, opts) => {
        const id = Math.random();
        setItems(x => [...x, { id, msg, ...opts }]);
        setTimeout(() => setItems(x => x.filter(i => i.id !== id)), opts.duration || 3400);
      };
      toastListeners.push(fn);
      return () => { const i = toastListeners.indexOf(fn); if (i>=0) toastListeners.splice(i,1); };
    }, []);
    return (
      <div className="toast-wrap">
        {items.map(i => (
          <div className="toast" key={i.id}>
            <Icon name={i.icon || 'check'} size={16} color="#9fc0e8" />
            <span>{i.msg}</span>
          </div>
        ))}
      </div>
    );
  }

  // ---- Badge ----
  function Badge({ children, tone='gray', dot, square }) {
    return (
      <span className={`badge badge-${tone} ${square?'badge-sq':''}`}>
        {dot && <span className="dot" style={{ background:'currentColor' }} />}
        {children}
      </span>
    );
  }
  function PhaseBadge({ phase }) {
    return <Badge tone={SEED.phaseBadge[phase] || 'gray'} dot>{phase}</Badge>;
  }

  // ---- Spinner ----
  function Spinner({ size=16 }) { return <span className="spinner" style={{ width:size, height:size }} />; }

  // ---- AI label ----
  function AILabel({ children='AI-generated' }) {
    return <span className="ai-label"><Icon name="sparkle" size={11} /> {children}</span>;
  }

  /* AIButton: click -> spinner (delay) -> calls onResult.
     label while idle, "Working…" while loading. */
  function AIButton({ label, loadingLabel='Working…', onResult, delay=1700, className='btn btn-secondary btn-sm', icon='sparkle', disabled }) {
    const [loading, setLoading] = useState(false);
    return (
      <button className={className} disabled={loading||disabled} onClick={() => {
        setLoading(true);
        setTimeout(() => { setLoading(false); onResult && onResult(); }, delay);
      }}>
        {loading ? <Spinner size={14} /> : <Icon name={icon} size={14} />}
        {loading ? loadingLabel : label}
      </button>
    );
  }

  // ---- Modal ----
  function Modal({ title, sub, onClose, children, footer, wide }) {
    useEffect(() => {
      const onKey = e => { if (e.key === 'Escape') onClose && onClose(); };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, []);
    return (
      <div className="modal-overlay" onMouseDown={e => { if (e.target===e.currentTarget) onClose && onClose(); }}>
        <div className="modal" style={wide?{maxWidth:920}:null}>
          <div className="modal-head">
            <div>
              <div className="subhead">{title}</div>
              {sub && <div className="muted text-sm mt-4">{sub}</div>}
            </div>
            {onClose && <button className="btn btn-ghost" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>}
          </div>
          {children}
          {footer && <div className="modal-foot">{footer}</div>}
        </div>
      </div>
    );
  }

  // ---- Stat / snapshot widget ----
  function StatWidget({ label, value, sub, trend, trendDir, tone='navy', flag, onClick }) {
    const colorMap = { navy:'var(--navy)', green:'var(--green)', red:'var(--red)', orange:'var(--orange)', blue:'var(--blue)' };
    return (
      <div className="card card-pad" style={{ cursor:onClick?'pointer':'default', position:'relative' }} onClick={onClick}>
        {flag && <span style={{ position:'absolute', top:12, right:12 }}><Badge tone="red" dot>{flag}</Badge></span>}
        <div className="eyebrow" style={{ marginBottom:8 }}>{label}</div>
        <div className="row items-end gap-8">
          <div style={{ fontSize:28, fontWeight:700, lineHeight:1, color:colorMap[tone] }}>{value}</div>
          {trend && (
            <div className="row items-center gap-4" style={{ color: trendDir==='up'?'var(--green)':trendDir==='down'?'var(--red)':'var(--text-3)', fontSize:12, fontWeight:600, paddingBottom:2 }}>
              {trendDir && <Icon name={trendDir==='up'?'arrowUp':'arrowDown'} size={13} />}{trend}
            </div>
          )}
        </div>
        {sub && <div className="muted text-sm mt-8">{sub}</div>}
      </div>
    );
  }

  // ---- Queue widget (count card with action) ----
  function QueueWidget({ count, label, tone='navy', cta='Review', onClick, icon }) {
    const toneColor = { navy:'var(--navy)', red:'var(--red)', orange:'var(--orange)', green:'var(--green)', purple:'var(--purple)', blue:'var(--blue)' }[tone];
    return (
      <button className="card card-pad" onClick={onClick} style={{ textAlign:'left', border:'1px solid var(--border-soft)', background:'#fff', display:'flex', flexDirection:'column', gap:10, minHeight:118 }}>
        <div className="row items-center justify-between">
          <div style={{ width:34, height:34, borderRadius:8, background:'var(--gray-100)', display:'grid', placeItems:'center', color:toneColor }}>
            <Icon name={icon||'ticket'} size={18} />
          </div>
          <span style={{ fontSize:30, fontWeight:700, color:toneColor, lineHeight:1 }}>{count}</span>
        </div>
        <div style={{ fontSize:13, fontWeight:500, color:'var(--text)', lineHeight:1.35 }}>{typeof label==='string' ? label.charAt(0).toUpperCase()+label.slice(1) : label}</div>
        <div className="row items-center gap-4" style={{ color:'var(--blue)', fontSize:12, fontWeight:600, marginTop:'auto' }}>
          {cta} <Icon name="arrowRight" size={13} />
        </div>
      </button>
    );
  }

  // ---- Sparkline ----
  function Sparkline({ data, w=120, h=34, color='var(--blue)', fill=true }) {
    const min = Math.min(...data), max = Math.max(...data), range = max-min || 1;
    const pts = data.map((v,i) => [ (i/(data.length-1))*w, h - ((v-min)/range)*(h-6) - 3 ]);
    const d = pts.map((p,i)=> (i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
    const area = d + ` L ${w} ${h} L 0 ${h} Z`;
    return (
      <svg width={w} height={h} style={{ display:'block' }}>
        {fill && <path d={area} fill={color} opacity="0.10" />}
        <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="2.4" fill={color} />
      </svg>
    );
  }

  // ---- Bar chart ----
  function BarChart({ data, labels, w=520, h=180, color='var(--navy)', highlightLast }) {
    const max = Math.max(...data) || 1;
    const pad = 24, bw = (w - pad) / data.length;
    return (
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display:'block' }}>
        {[0,0.5,1].map((g,i)=>(<line key={i} x1="0" x2={w} y1={(h-20)*(1-g)} y2={(h-20)*(1-g)} stroke="var(--border-soft)" strokeWidth="1" />))}
        {data.map((v,i)=>{
          const bh = (v/max)*(h-36);
          const isLast = highlightLast && i===data.length-1;
          return <g key={i}>
            <rect x={i*bw+pad/2} y={(h-20)-bh} width={bw-8} height={bh} rx="2" fill={isLast?'var(--orange)':color} opacity={isLast?1:0.85} />
            {labels && <text x={i*bw+pad/2+(bw-8)/2} y={h-6} textAnchor="middle" fontSize="9" fill="var(--text-3)">{labels[i]}</text>}
          </g>;
        })}
      </svg>
    );
  }

  // ---- Line chart ----
  function LineChart({ series, labels, w=520, h=180, format }) {
    const all = series.flatMap(s=>s.data);
    const min = Math.min(...all), max = Math.max(...all), range = max-min||1;
    const pad = 28;
    const xy = (v,i,len)=>[ pad + (i/(len-1))*(w-pad-8), (h-24) - ((v-min)/range)*(h-44) ];
    return (
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display:'block' }}>
        {[0,0.5,1].map((g,i)=>(<line key={i} x1={pad} x2={w} y1={(h-24)*(1-g)+0} y2={(h-24)*(1-g)+0} stroke="var(--border-soft)" />))}
        {series.map((s,si)=>{
          const pts = s.data.map((v,i)=>xy(v,i,s.data.length));
          const d = pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
          return <g key={si}>
            <path d={d} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r="2" fill={s.color} />)}
          </g>;
        })}
        {labels && labels.map((l,i)=>{
          const x = pad + (i/(labels.length-1))*(w-pad-8);
          return <text key={i} x={x} y={h-6} textAnchor="middle" fontSize="9" fill="var(--text-3)">{l}</text>;
        })}
      </svg>
    );
  }

  // ---- Filter bar ----
  function FilterBar({ chips, active, onChip, search, onSearch, right }) {
    return (
      <div className="filter-bar" style={{ marginBottom:14 }}>
        {chips && chips.map(c => (
          <button key={c} className={`chip ${active===c?'active':''}`} onClick={()=>onChip&&onChip(c)}>{c}</button>
        ))}
        {onSearch && (
          <div style={{ position:'relative', marginLeft:'auto', minWidth:200 }}>
            <span style={{ position:'absolute', left:9, top:7, color:'var(--text-3)' }}><Icon name="search" size={15} /></span>
            <input className="input" style={{ paddingLeft:30 }} placeholder="Search…" value={search||''} onChange={e=>onSearch(e.target.value)} />
          </div>
        )}
        {right}
      </div>
    );
  }

  // ---- Empty state ----
  function Empty({ icon='inbox', title, sub }) {
    return (
      <div className="col items-center justify-center" style={{ padding:'48px 20px', color:'var(--text-3)', textAlign:'center' }}>
        <div style={{ width:48, height:48, borderRadius:12, background:'var(--gray-100)', display:'grid', placeItems:'center', marginBottom:12 }}>
          <Icon name={icon} size={24} color="var(--text-3)" />
        </div>
        <div className="fw6" style={{ color:'var(--text-2)', fontSize:14 }}>{title}</div>
        {sub && <div className="text-sm mt-4" style={{ maxWidth:320 }}>{sub}</div>}
      </div>
    );
  }

  // ---- Section placeholder (for not-yet-deep features) ----
  function Placeholder({ title, body }) {
    return (
      <div className="card card-pad" style={{ borderStyle:'dashed', background:'var(--gray-50)', textAlign:'center', padding:'34px 24px' }}>
        <div className="subhead mb-8">{title}</div>
        <div className="muted text-13" style={{ maxWidth:520, margin:'0 auto' }}>{body}</div>
      </div>
    );
  }

  // ---- Avatar (dept initials, no photo) ----
  function DeptTag({ dept, size='sm' }) {
    return <Badge tone="blue" square>{dept}</Badge>;
  }

  Object.assign(window, {
    toast, ToastHost, Badge, PhaseBadge, Spinner, AILabel, AIButton, Modal,
    StatWidget, QueueWidget, Sparkline, BarChart, LineChart, FilterBar, Empty, Placeholder, DeptTag,
    titleCase,
  });
})();
