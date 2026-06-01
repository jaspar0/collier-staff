/* Geometric line icons - no emoji. window.Icon */
(function () {
  const P = { fill:'none', stroke:'currentColor', strokeWidth:1.7, strokeLinecap:'round', strokeLinejoin:'round' };
  const paths = {
    hub: <g {...P}><circle cx="12" cy="12" r="3"/><circle cx="12" cy="4" r="1.6"/><circle cx="12" cy="20" r="1.6"/><circle cx="4" cy="12" r="1.6"/><circle cx="20" cy="12" r="1.6"/><path d="M12 7v2M12 15v3.4M9 12H5.6M15 12h3.4"/></g>,
    gavel: <g {...P}><path d="M14 5l5 5-3 3-5-5z"/><path d="M11 8l-6 6"/><path d="M4 20h8"/><path d="M6.5 15.5l2 2"/></g>,
    broadcast: <g {...P}><circle cx="12" cy="12" r="2"/><path d="M7.8 7.8a6 6 0 000 8.4M16.2 7.8a6 6 0 010 8.4M5 5a9 9 0 000 14M19 5a9 9 0 010 14"/></g>,
    coins: <g {...P}><ellipse cx="9" cy="7" rx="5" ry="2.4"/><path d="M4 7v5c0 1.3 2.2 2.4 5 2.4s5-1.1 5-2.4V7"/><path d="M10 14.6c.5 1.1 2.5 1.9 5 1.9 2.8 0 5-1.1 5-2.4v-5"/><ellipse cx="15" cy="9.1" rx="5" ry="2.4"/></g>,
    ruler: <g {...P}><rect x="3" y="8" width="18" height="8" rx="1"/><path d="M7 8v3M11 8v4M15 8v3M19 8v4"/></g>,
    shield: <g {...P}><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9.5 12l1.8 1.8L15 10"/></g>,
    cone: <g {...P}><path d="M10 4h4l4 16H6z"/><path d="M8 13h8M7 9h10" /></g>,
    wave: <g {...P}><path d="M3 8c2 0 2 1.5 4 1.5S9 8 11 8s2 1.5 4 1.5S17 8 19 8"/><path d="M3 13c2 0 2 1.5 4 1.5S9 13 11 13s2 1.5 4 1.5S17 13 19 13"/><path d="M3 18c2 0 2 1.5 4 1.5S9 18 11 18"/></g>,
    map: <g {...P}><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/></g>,
    recycle: <g {...P}><path d="M9 6l2-3 2 3"/><path d="M11 3.4L7 10l-3-1 1.5 5"/><path d="M19 9l1.5 3.5-2.8 1.6"/><path d="M14.5 20l-5 0-1.5-3"/><path d="M20 13l-2.5 6-3.5 0"/></g>,
    tree: <g {...P}><path d="M12 3l5 7h-3l4 6H6l4-6H7z"/><path d="M12 16v5"/></g>,
    star: <g {...P}><path d="M12 3l2.6 5.5 6 .8-4.4 4.2 1.1 6L12 16.8 6.7 19.5l1.1-6L3.4 9.3l6-.8z"/></g>,
    ticket: <g {...P}><path d="M4 7h16v3a2 2 0 000 4v3H4v-3a2 2 0 000-4z"/><path d="M14 7v10" strokeDasharray="2 2"/></g>,
    doc: <g {...P}><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M9.5 12h6M9.5 15h6M9.5 9h3"/></g>,
    calendar: <g {...P}><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 9h16M8 3v4M16 3v4"/></g>,
    flag: <g {...P}><path d="M6 21V4M6 4h11l-2 4 2 4H6"/></g>,
    loop: <g {...P}><path d="M4 9a8 8 0 0114-5l2 2"/><path d="M20 4v4h-4"/><path d="M20 15a8 8 0 01-14 5l-2-2"/><path d="M4 20v-4h4"/></g>,
    alert: <g {...P}><path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/></g>,
    project: <g {...P}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h6M7 13h10M7 17h4"/></g>,
    grant: <g {...P}><circle cx="12" cy="9" r="5"/><path d="M9 13.5L8 21l4-2 4 2-1-7.5"/></g>,
    bell: <g {...P}><path d="M6 9a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 004 0"/></g>,
    search: <g {...P}><circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/></g>,
    chevDown: <g {...P}><path d="M6 9l6 6 6-6"/></g>,
    chevRight: <g {...P}><path d="M9 6l6 6-6 6"/></g>,
    chevLeft: <g {...P}><path d="M15 6l-6 6 6 6"/></g>,
    x: <g {...P}><path d="M6 6l12 12M18 6L6 18"/></g>,
    check: <g {...P}><path d="M5 12l5 5L20 7"/></g>,
    plus: <g {...P}><path d="M12 5v14M5 12h14"/></g>,
    arrowUp: <g {...P}><path d="M12 19V5M6 11l6-6 6 6"/></g>,
    arrowDown: <g {...P}><path d="M12 5v14M6 13l6 6 6-6"/></g>,
    arrowRight: <g {...P}><path d="M5 12h14M13 6l6 6-6 6"/></g>,
    home: <g {...P}><path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/></g>,
    inbox: <g {...P}><path d="M4 13l2.5-8h11L20 13v6H4z"/><path d="M4 13h4l1.5 3h5L16 13h4"/></g>,
    layers: <g {...P}><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/></g>,
    chart: <g {...P}><path d="M4 4v16h16"/><path d="M8 16l3-4 3 2 4-7"/></g>,
    gear: <g {...P}><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2 2M17.8 17.8l2 2M2 12h3M19 12h3M4.2 19.8l2-2M17.8 6.2l2-2"/></g>,
    pin: <g {...P}><path d="M12 21s6-5.3 6-10a6 6 0 10-12 0c0 4.7 6 10 6 10z"/><circle cx="12" cy="11" r="2"/></g>,
    user: <g {...P}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></g>,
    eye: <g {...P}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/></g>,
    sparkle: <g {...P}><path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z"/><path d="M18 14l.8 2 .8-2 2-.8-2-.8z"/></g>,
    clock: <g {...P}><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></g>,
    merge: <g {...P}><path d="M7 4v6c0 3 2 4 5 4h5"/><path d="M14 11l3 3-3 3"/><path d="M7 4L4 7M7 4l3 3"/></g>,
    photo: <g {...P}><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.6"/><path d="M5 17l5-4 3 2 3-3 4 4"/></g>,
    money: <g {...P}><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v6M18 9v6"/></g>,
  };
  function Icon({ name, size=18, color, style, className }) {
    const p = paths[name];
    if (!p) return null;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className}
        style={{ color, display:'block', flex:'none', ...style }} aria-hidden="true">{p}</svg>
    );
  }
  window.Icon = Icon;
})();
