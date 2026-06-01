/* ============================================================
   Collier Connect - seeded data (8 months of activity)
   Exposed as window.SEED
   ============================================================ */
(function () {
  // ---------- ROLES ----------
  const ROLES = [
    { id: 'secretary', name: "Township Secretary's Office", short: 'Township Secretary', dept: 'Secretary',
      desc: 'The operational hub. Triage incoming tickets, process mailed forms, coordinate the weekly response loop, assemble the monthly newsletter. Most varied dashboard.', icon: 'hub' },
    { id: 'manager', name: "Township Manager's Office", short: 'Township Manager', dept: 'Manager',
      desc: 'Decision-maker and approver. Review response loop publications, approve escalations, sign the newsletter, make budget allocations.', icon: 'gavel' },
    { id: 'comms', name: 'Comms and IT Coordinator', short: 'Comms & IT', dept: 'Comms',
      desc: 'Content, partners, and engagement. Manage reward catalog, onboard business partners, coordinate content tagging, run anti-abuse review.', icon: 'broadcast' },
    { id: 'finance', name: 'Finance Department', short: 'Finance', dept: 'Finance',
      desc: 'Budget and grants. Review financial implications of proposals, track grant applications, manage vendor contracts, monitor reward costs.', icon: 'coins' },
    { id: 'codes', name: 'Building and Codes', short: 'Building & Codes', dept: 'Building & Codes',
      desc: 'Code enforcement and construction oversight. Process building permit reviews and property and blight tickets.', icon: 'ruler' },
    { id: 'police', name: 'Police Department', short: 'Police', dept: 'Police',
      desc: 'Public safety and community policing. Respond to traffic, safety, and disturbance tickets. Publish community policing events.', icon: 'shield' },
    { id: 'pubworks', name: 'Public Works', short: 'Public Works', dept: 'Public Works',
      desc: 'Roads, infrastructure, maintenance. Highest ticket volume. Respond to pothole reports, lighting issues, road damage. Manage capital projects.', icon: 'cone' },
    { id: 'sewer', name: 'Sewer Department', short: 'Sewer', dept: 'Sewer',
      desc: 'Stormwater, drainage, sanitation infrastructure. Respond to drainage tickets, manage stormwater projects, coordinate with Public Works.', icon: 'wave' },
    { id: 'planning', name: 'Planning, Zoning, and Land Development', short: 'Planning & Zoning', dept: 'Planning',
      desc: 'Zoning proposals and development reviews. Manage the proposal pipeline from draft through board vote, coordinate planning commission meetings.', icon: 'map' },
    { id: 'garbage', name: 'Garbage and Recycling', short: 'Garbage & Recycling', dept: 'Garbage & Recycling',
      desc: 'Collection schedules and recycling programs. Post notices about pickup delays, holiday schedules, brush collection windows.', icon: 'recycle' },
    { id: 'parks', name: 'Parks and Recreation', short: 'Parks & Recreation', dept: 'Parks',
      desc: 'Parks, trails, recreational facilities, programming. Publish events, respond to parks tickets, manage recreational projects.', icon: 'tree' },
    { id: 'commissioner', name: 'Commissioner', short: 'Commissioner', dept: 'Commissioner',
      desc: 'Read-only governance role. View strategic dashboards and monthly engagement summaries. Vote on policy items and the monthly neighborhood budget allocation.', icon: 'star' },
  ];

  // ---------- PHASES ----------
  const PHASES = ['Submitted','Received','Under Review','Approved for Work','Planning','Being Worked On','Resolved','Declined'];
  const phaseBadge = {
    'Submitted':'gray','Received':'blue','Under Review':'orange','Approved for Work':'purple',
    'Planning':'purple','Being Worked On':'orange','Resolved':'green','Declined':'red'
  };

  const NEIGHBORHOODS = ['Hilltop','Webb','Chartiers','Settlers Ridge','Boyce','Washington Pike','Creekside','Old Village','Route 50 Corridor','Parkview'];
  const NAMES = ['M. Alvarez','D. Brenner','S. Okonkwo','J. Petrakis','L. Nguyen','R. Caldwell','T. Schaffer','A. Romano','K. Dubois','P. Whitlock','C. Esposito','H. Bauer','G. Mancini','V. Patel','B. Lindqvist','E. Floyd','N. Sokolova','W. Tran','F. Mendez','O. Halloran'];

  function daysAgo(n){ const d = new Date('2026-05-30'); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); }
  function rand(a){ return a[Math.floor(Math.random()*a.length)]; }

  // ---------- TICKETS ----------
  const seededTickets = [
    { id:'CT-2041', title:'Pothole on Boyce Road near the bridge', cat:'Roads', sub:'Pothole', dept:'Public Works',
      phase:'Planning', loc:'Boyce Rd @ Chartiers Creek bridge', nbhd:'Boyce', submitter:'M. Alvarez', date:daysAgo(19),
      desc:'Large pothole has been growing for weeks at the approach to the bridge. It has already damaged at least one tire on my street. Several neighbors have hit it.',
      photo:true, affects:14, response:'Public Works has scheduled this segment for full-depth patching as part of the Boyce Road resurfacing program. Work is in the planning phase and expected within the month.', staffResp:true,
      comments:[ {who:'D. Brenner', text:'Hit this last Tuesday, bent a rim. Please prioritize.', staff:false},
                 {who:'Public Works', text:'Thanks for the reports. This is being folded into the Boyce Road resurfacing project rather than a one-off patch so the fix lasts.', staff:true} ] },
    { id:'CT-2088', title:'Overgrown trail brush near Webb Park', cat:'Parks', sub:'Trail maintenance', dept:'Parks',
      phase:'Received', loc:'Webb Park north trailhead', nbhd:'Webb', submitter:'S. Okonkwo', date:daysAgo(6),
      desc:'The brush along the first quarter mile of the north trail is overgrown to the point where you have to walk single file. Some poison ivy starting to creep in too.',
      photo:true, affects:5, response:'', staffResp:false,
      comments:[ {who:'L. Nguyen', text:'Same on the east connector. Would love a cleanup day.', staff:false} ] },
    { id:'CT-1990', title:'Broken streetlight on Chartiers Creek Road', cat:'Lighting', sub:'Streetlight out', dept:'Public Works',
      phase:'Resolved', loc:'Chartiers Creek Rd @ Mill St', nbhd:'Chartiers', submitter:'J. Petrakis', date:daysAgo(34),
      desc:'Streetlight at the corner has been out for two weeks. Dark stretch for the kids at the bus stop in the morning.',
      photo:false, affects:8, response:'Replaced the failed photocell and lamp on May 12. The light is back in service. Thank you for the report and for noting the bus stop, which is why we expedited it.', staffResp:true,
      comments:[ {who:'Public Works', text:'Crew confirmed the fixture is working as of this morning. Closing this out.', staff:true} ] },
    { id:'CT-2103', title:'Standing water at Webb Park entrance', cat:'Drainage', sub:'Standing water', dept:'Sewer',
      phase:'Under Review', loc:'Webb Park main entrance', nbhd:'Webb', submitter:'R. Caldwell', date:daysAgo(4),
      desc:'After any real rain the entrance floods ankle-deep and stays for a day. The storm grate looks clogged or undersized.', needsInfo:true,
      photo:true, affects:6, response:'', staffResp:false,
      comments:[ {who:'Sewer', text:'Could you confirm whether the water reaches the parking lot or stays at the curb? It helps us scope the grate work.', staff:true} ] },
    { id:'CT-2009', title:'Request: traffic signal at Route 50 and Hill', cat:'Traffic', sub:'New signal', dept:'Police',
      phase:'Declined', loc:'Route 50 @ Hill Church Rd', nbhd:'Route 50 Corridor', submitter:'T. Schaffer', date:daysAgo(28),
      desc:'This intersection needs a real traffic signal. Hard to turn left during rush hour and there have been a couple of near misses.',
      photo:false, affects:11, response:'A signal at this location is governed by PennDOT warrants based on traffic counts and crash history. A 2025 study did not meet the threshold. We have requested a follow-up count and added enhanced signage in the interim.', staffResp:true, declined:true,
      comments:[] },
  ];

  // generate more tickets to fill queues
  const cats = [
    ['Roads','Pothole','Public Works'],['Roads','Road damage','Public Works'],['Lighting','Streetlight out','Public Works'],
    ['Drainage','Standing water','Sewer'],['Drainage','Storm grate','Sewer'],['Parks','Trail maintenance','Parks'],
    ['Parks','Playground','Parks'],['Traffic','Speeding','Police'],['Safety','Disturbance','Police'],
    ['Property','Blight','Building & Codes'],['Property','Permit question','Building & Codes'],['Sanitation','Missed pickup','Garbage & Recycling'],
    ['Sanitation','Recycling','Garbage & Recycling'],['Roads','Sidewalk','Public Works'],['Lighting','Park lighting','Parks'],
  ];
  const titles = {
    'Pothole':['Pothole forming on','Deep pothole on','Cluster of potholes on'],
    'Road damage':['Crumbling shoulder on','Pavement cracking on','Washout along'],
    'Streetlight out':['Streetlight out on','Dark streetlight at','Flickering light on'],
    'Standing water':['Water pooling on','Flooding at','Standing water near'],
    'Storm grate':['Clogged storm grate on','Collapsed grate at','Blocked drain on'],
    'Trail maintenance':['Overgrown trail at','Washed-out trail near','Fallen tree on trail at'],
    'Playground':['Damaged equipment at','Broken swing at','Worn surface at'],
    'Speeding':['Speeding concern on','Cars racing on','Reckless driving on'],
    'Disturbance':['Noise complaint near','Late-night disturbance at','Gathering concern at'],
    'Blight':['Blighted property on','Overgrown lot at','Abandoned structure on'],
    'Permit question':['Permit question for','Unclear permit status on','Construction question at'],
    'Missed pickup':['Missed pickup on','Skipped collection at','Trash not collected on'],
    'Recycling':['Recycling question for','Bin request on','Contamination notice at'],
    'Sidewalk':['Heaved sidewalk on','Cracked sidewalk at','Missing sidewalk on'],
    'Park lighting':['Dim park lighting at','Light out at','Path lighting at'],
  };
  const streets = ['Maple Ave','Settlers Ridge Rd','Washington Pike','Hilltop Dr','Mill St','Creekside Ln','Parkview Blvd','Old Village Rd','Chartiers Creek Rd','Hill Church Rd','Boyce Rd','Webb Ln','Route 50','Quail Run','Birch Ct'];
  let tid = 2110;
  const moreTickets = [];
  for (let i=0;i<32;i++){
    const c = rand(cats);
    const phase = rand(['Submitted','Received','Received','Under Review','Approved for Work','Being Worked On','Resolved','Resolved']);
    const st = rand(streets);
    moreTickets.push({
      id:'CT-'+(tid++), title: rand(titles[c[1]]) + ' ' + st, cat:c[0], sub:c[1], dept:c[2],
      phase, loc: st, nbhd: rand(NEIGHBORHOODS), submitter: rand(NAMES), date: daysAgo(2+Math.floor(Math.random()*40)),
      desc:'Resident-submitted report regarding '+c[1].toLowerCase()+' at '+st+'. Details captured at intake; see location and photo where attached.',
      photo: Math.random()>0.5, affects: Math.floor(Math.random()*12), response: phase==='Resolved'?'Resolved by the responsible department. Thank you for the report.':'', staffResp: phase==='Resolved',
      comments: Math.random()>0.6 ? [{who:rand(NAMES),text:'This affects my street too.',staff:false}] : []
    });
  }
  // untriaged tickets (no dept yet) for the Secretary triage queue
  const triageQueue = [];
  for (let i=0;i<8;i++){
    const c = rand(cats);
    const st = rand(streets);
    triageQueue.push({
      id:'CT-'+(tid++), title: rand(titles[c[1]]) + ' ' + st, cat:c[0], sub:c[1], dept:null, suggestedDept:c[2],
      confidence: 70+Math.floor(Math.random()*28),
      phase:'Submitted', loc:st, nbhd:rand(NEIGHBORHOODS), submitter:rand(NAMES), date:daysAgo(Math.floor(Math.random()*3)),
      desc:'New resident submission awaiting triage. Category '+c[0]+' / '+c[1]+' detected at intake. Routing suggested by pattern match against historical assignments.',
      photo:Math.random()>0.5, affects:Math.floor(Math.random()*6), response:'', staffResp:false, comments:[], untriaged:true
    });
  }
  // a finance-routed example (billing/fee keywords trigger a Finance suggestion)
  triageQueue.unshift({
    id:'CT-'+(tid++), title:'Question about a stormwater fee on my tax bill', cat:'Billing', sub:'Fee question', dept:null, suggestedDept:'Finance',
    confidence:84, phase:'Submitted', loc:'312 Hilltop Dr', nbhd:'Hilltop', submitter:'D. Brenner', date:daysAgo(1),
    desc:'I noticed a new stormwater fee on my quarterly tax bill and I am not sure what it covers or how it was assessed. Can someone explain the charge and whether grant funding offsets any of it?',
    photo:false, affects:3, response:'', staffResp:false, comments:[], untriaged:true
  });
  const tickets = [...seededTickets, ...moreTickets];

  // ---------- PROJECTS ----------
  const projects = [
    { id:'P-101', name:'Washington Pike Crosswalks', dept:'Public Works', phase:'Being Worked On', updated:daysAgo(8), budget:185000, spent:96000,
      note:'Curb cuts poured on the north side; signal-head install scheduled for next week.', followers:42 },
    { id:'P-102', name:'Boyce Road Stormwater Design', dept:'Sewer', phase:'Under Review', updated:daysAgo(36), budget:240000, spent:252000, overBudget:true, stale:true,
      note:'Engineering study returned higher-than-expected scope on the culvert replacement.', followers:31 },
    { id:'P-103', name:'Hilltop Park Recreational Expansion', dept:'Parks', phase:'Planning', updated:daysAgo(12), budget:610000, spent:120000,
      note:'Schematic design under community review; comment window open through July.', followers:58 },
    { id:'P-104', name:'Chartiers Creek Bridge Inspection', dept:'Public Works', phase:'Under Review', updated:daysAgo(5), budget:45000, spent:21000,
      note:'Inspection underway; preliminary findings expected end of month.', followers:19 },
    { id:'P-105', name:'Webb Park Trail Improvement', dept:'Parks', phase:'Approved for Work', updated:daysAgo(38), budget:88000, spent:14000, stale:true,
      note:'Grading bids received; awaiting notice to proceed.', followers:27 },
    { id:'P-106', name:'Settlers Ridge Sidewalk Repair', dept:'Public Works', phase:'Being Worked On', updated:daysAgo(9), budget:130000, spent:74000,
      note:'Phase 1 panels replaced; Phase 2 mobilization begins Monday.', followers:23 },
    { id:'P-107', name:'Route 50 Corridor Signal Study', dept:'Police', phase:'Planning', updated:daysAgo(15), budget:35000, spent:9000,
      note:'PennDOT count request submitted; awaiting scheduling.', followers:16 },
    { id:'P-108', name:'Parkview Drainage Regrade', dept:'Sewer', phase:'Approved for Work', updated:daysAgo(11), budget:97000, spent:30000,
      note:'Survey complete; construction window targeted for August.', followers:14 },
    { id:'P-109', name:'Old Village Streetlight Conversion', dept:'Public Works', phase:'Being Worked On', updated:daysAgo(7), budget:210000, spent:140000,
      note:'LED conversion 70% complete across the district.', followers:21 },
    { id:'P-110', name:'Creekside Playground Resurfacing', dept:'Parks', phase:'Resolved', updated:daysAgo(20), budget:64000, spent:61000,
      note:'Poured-in-place surface installed and inspected; playground reopened.', followers:30 },
  ];

  // ---------- PROPOSALS ----------
  const proposalStages = ['Drafted','Public Comment','Department Review','Board Review','Board Vote','Adopted'];
  const proposals = [
    { id:'PR-01', name:'Hilltop Park Recreational Facilities Expansion', dept:'Planning', stage:'Public Comment', cat:'Parks', comments:34, opened:daysAgo(40) },
    { id:'PR-02', name:'Webb Park Community Garden Plots', dept:'Planning', stage:'Department Review', cat:'Parks', comments:18, opened:daysAgo(55) },
    { id:'PR-03', name:'Speed Limit Reduction in School Zones', dept:'Planning', stage:'Board Review', cat:'Traffic', comments:47, opened:daysAgo(70) },
    { id:'PR-04', name:'Downtown Mixed-Use Zoning Amendment', dept:'Planning', stage:'Public Comment', cat:'Zoning', comments:29, opened:daysAgo(33) },
    { id:'PR-05', name:'Small-Scale Mixed-Use Development Standards', dept:'Planning', stage:'Drafted', cat:'Zoning', comments:6, opened:daysAgo(12) },
    { id:'PR-06', name:'Expanded Recycling Pickup', dept:'Garbage & Recycling', stage:'Board Vote', cat:'Sanitation', comments:52, opened:daysAgo(80), voteDate:'2026-07-28' },
    { id:'PR-07', name:'Boyce Road Stormwater Drainage Upgrade', dept:'Sewer', stage:'Department Review', cat:'Drainage', comments:21, opened:daysAgo(44) },
    { id:'PR-08', name:'Police Body Camera Program Funding', dept:'Police', stage:'Board Review', cat:'Public Safety', comments:38, opened:daysAgo(62) },
  ];

  // ---------- RESPONSE LOOP ----------
  const months = ['May 2026','Apr 2026','Mar 2026','Feb 2026','Jan 2026','Dec 2025','Nov 2025','Oct 2025','Sep 2025','Aug 2025','Jul 2025','Jun 2025'];
  const rlArchive = months.map((m,i)=>({
    id:'RL-'+(months.length-i), month:m, themes: 5+Math.floor(Math.random()*4),
    drafted:'Township Secretary', approved:'Township Manager', published: daysAgo(i*30+3),
    summary:'Published responses covering road maintenance, drainage, parks programming, and recycling questions raised by residents during the month.'
  }));
  const rlDraftThemes = [
    { id:'t1', name:'Boyce Road conditions', count:9, quotes:['"How long until Boyce Road actually gets fixed?"','"Third tire this year from that stretch."'], draft:'' },
    { id:'t2', name:'Drainage after storms', count:7, quotes:['"Webb Park entrance floods every time it rains."','"The grate on Mill Street is clogged again."'], draft:'' },
    { id:'t3', name:'Trail and park upkeep', count:6, quotes:['"North trail is impassable with the brush."','"Would love a volunteer cleanup day."'], draft:'' },
    { id:'t4', name:'Recycling expansion questions', count:11, quotes:['"When does the expanded pickup start?"','"Will glass be included?"'], draft:'' },
    { id:'t5', name:'School zone speeding', count:8, quotes:['"Cars fly past the elementary at pickup."','"Please lower the limit on Hill Church."'], draft:'' },
    { id:'t6', name:'Streetlight outages', count:4, quotes:['"Corner of Mill is pitch black."','"Bus stop needs the light fixed."'], draft:'' },
  ];

  // ---------- NEWSLETTERS (8 past issues, Nov 2025 - Jun 2026) ----------
  const nlPastMonths = ['Jun 2026','May 2026','Apr 2026','Mar 2026','Feb 2026','Jan 2026','Dec 2025','Nov 2025'];
  const newsletters = nlPastMonths.map((m,i)=>({
    id:'NL-'+(nlPastMonths.length-i), month:m, sent: daysAgo((i+1)*30+5), recipients: 2700+Math.floor(Math.random()*200),
    responseRate: 12+Math.floor(Math.random()*8)
  }));

  // ---------- EVENTS / NOTICES ----------
  const events = [
    { id:'E-1', name:'Independence Day Parade', date:'2026-07-04', loc:'Main St', host:'Township', type:'event' },
    { id:'E-2', name:'Township Board Meeting', date:'2026-07-14', loc:'Municipal Building', host:'Township', type:'event' },
    { id:'E-3', name:'Movies in the Park', date:'2026-07-11', loc:'Webb Park', host:'Parks', type:'event' },
    { id:'E-4', name:'Movies in the Park', date:'2026-07-25', loc:'Hilltop Park', host:'Parks', type:'event' },
    { id:'E-5', name:'Summer Concert Series', date:'2026-07-18', loc:'Hilltop Amphitheater', host:'Parks', type:'event' },
    { id:'E-6', name:'Recycling Expansion Vote', date:'2026-07-28', loc:'Municipal Building', host:'Township', type:'event' },
  ];
  const notices = [
    { id:'N-1', title:'Trash delay: collection one day later this week', type:'alert', range:'Jul 6 - Jul 10', nbhds:'All', dept:'Garbage & Recycling' },
    { id:'N-2', title:'Brush Collection Week', type:'notice', range:'Jul 13 - Jul 17', nbhds:'All', dept:'Garbage & Recycling' },
    { id:'N-3', title:'Washington Pike construction - lane shifts', type:'alert', range:'Jul 1 - Aug 15', nbhds:'Washington Pike', dept:'Public Works' },
    { id:'N-4', title:'Boyce Road resurfacing - expect delays', type:'alert', range:'Jul 20 - Jul 31', nbhds:'Boyce', dept:'Public Works' },
    { id:'N-5', title:'Hilltop Road crack-seal', type:'notice', range:'Jul 9', nbhds:'Hilltop', dept:'Public Works' },
  ];

  // ---------- REWARD CATALOG ----------
  const rewards = [
    { id:'R-1', name:'Free drip coffee', partner:'Grist House', tier:'Bronze', cost:50, stock:4, redeemed:38 },
    { id:'R-2', name:'Bakery dozen discount', partner:'Mediterra', tier:'Bronze', cost:60, stock:22, redeemed:25 },
    { id:'R-3', name:'Trail water bottle', partner:'Township', tier:'Bronze', cost:75, stock:60, redeemed:41 },
    { id:'R-4', name:'Pool day pass', partner:'Parks & Rec', tier:'Silver', cost:150, stock:30, redeemed:19 },
    { id:'R-5', name:'Farmers market tokens', partner:'Collier Market', tier:'Silver', cost:200, stock:3, redeemed:22 },
    { id:'R-6', name:'Native plant kit', partner:'Hollow Oak', tier:'Silver', cost:220, stock:15, redeemed:11 },
    { id:'R-7', name:'Rec class voucher', partner:'Parks & Rec', tier:'Gold', cost:400, stock:12, redeemed:8 },
    { id:'R-8', name:'Local artisan box', partner:'Makers Collective', tier:'Gold', cost:450, stock:9, redeemed:6 },
    { id:'R-9', name:'Family pool season pass', partner:'Parks & Rec', tier:'Platinum', cost:900, stock:5, redeemed:3 },
    { id:'R-10', name:'Name a park bench', partner:'Township', tier:'Platinum', cost:1200, stock:2, redeemed:1 },
    { id:'R-11', name:'Reusable tote', partner:'Township', tier:'Bronze', cost:40, stock:80, redeemed:54 },
    { id:'R-12', name:'Ice cream voucher', partner:'Sarris', tier:'Bronze', cost:55, stock:2, redeemed:33 },
  ];

  // ---------- MAILED FORMS ----------
  const mailedForms = [
    { id:'MF-1', from:'P. Whitlock', nbhd:'Hilltop', received:daysAgo(2), summary:'Proposal feedback + reward selection',
      fields:{ A:{label:'Proposal feedback', val:'Recycling expansion - Support with conditions. Wants glass included and confirmation that costs will not raise the per-household fee.'},
               B:{label:'Issue report', val:'Pothole on Boyce Road near the bridge approach. Getting worse.'},
               C:{label:'Event request', val:''},
               D:{label:'General feedback', val:'Appreciates the streetlight fix on Chartiers Creek. Thanks the crew.'},
               E:{label:'Reward selection', val:'Free drip coffee at Grist House'},
               F:{label:'Contact info', val:'P. Whitlock, 214 Hilltop Dr, pwhitlock@example.com, prefers email'},
               G:{label:'Delivery preference', val:'Email me the redemption code'} } },
    { id:'MF-2', from:'C. Esposito', nbhd:'Webb', received:daysAgo(3), summary:'Issue report + event request',
      fields:{ A:{label:'Proposal feedback', val:''},
               B:{label:'Issue report', val:'Standing water at the Webb Park entrance after every rain. Grate looks clogged.'},
               C:{label:'Event request', val:'Neighborhood trail cleanup day, Webb Park, late July. Open to all.'},
               D:{label:'General feedback', val:'Loves Movies in the Park. More dates please.'},
               E:{label:'Reward selection', val:'Trail water bottle'},
               F:{label:'Contact info', val:'C. Esposito, 19 Webb Ln, cesposito@example.com, prefers email'},
               G:{label:'Delivery preference', val:'Mail me the redemption code'} } },
    { id:'MF-3', from:'H. Bauer', nbhd:'Settlers Ridge', received:daysAgo(4), summary:'General feedback + reward',
      fields:{ A:{label:'Proposal feedback', val:'Speed limit reduction in school zones - Strongly support.'},
               B:{label:'Issue report', val:''},
               C:{label:'Event request', val:''},
               D:{label:'General feedback', val:'The newsletter is genuinely useful. Reads it cover to cover.'},
               E:{label:'Reward selection', val:'Reusable tote'},
               F:{label:'Contact info', val:'H. Bauer, 7 Quail Run, hbauer@example.com, prefers email'},
               G:{label:'Delivery preference', val:'Email me the redemption code'} } },
  ];

  // ---------- EVENT REQUESTS ----------
  const eventRequests = [
    { id:'ER-1', name:'Webb Park Trail Cleanup Day', org:'Friends of Webb Park', date:'2026-07-26', loc:'Webb Park', status:'pending',
      desc:'Volunteer cleanup of the north and east trails, open to all residents. Tools provided.', qualifies:true },
    { id:'ER-2', name:'Hilltop Block Party', org:'Hilltop Neighbors Assoc.', date:'2026-08-02', loc:'Hilltop cul-de-sac', status:'pending',
      desc:'Annual block party with food trucks and a bounce house. Street closure requested.', qualifies:true, flag:'Street closure needs Police coordination.' },
    { id:'ER-3', name:'Creekside 5K Fun Run', org:'Esposito family', date:'2026-08-16', loc:'Creekside Trail', status:'needs-info',
      desc:'Charity 5K along the creek trail.', qualifies:null, flag:'Missing insurance/permit details.' },
    { id:'ER-4', name:'Summer Reading at the Park', org:'Collier Library', date:'2026-07-19', loc:'Webb Park', status:'approved', date2:daysAgo(7),
      desc:'Weekly outdoor story time for kids.', qualifies:true },
    { id:'ER-5', name:'Private Wedding Reception', org:'R. Caldwell', date:'2026-08-09', loc:'Hilltop Park pavilion', status:'declined', date2:daysAgo(14),
      desc:'Private event, not open to the public.', qualifies:false, reason:'Event is not open to the public; please use the pavilion rental process instead.' },
  ];

  // ---------- FLAGGED COMMENTS ----------
  const flaggedComments = [
    { id:'FC-1', source:'auto', on:'CT-2009 (Route 50 signal)', text:'This whole township is run by idiots who never listen to anybody.', reason:'Incivility pattern match' },
    { id:'FC-2', source:'auto', on:'PR-06 (Recycling Expansion)', text:'Call me at 412-555-0148 and I will explain why this is a scam!!!', reason:'Personal contact info + spam pattern' },
    { id:'FC-3', source:'reported', on:'CT-2088 (Webb trail)', text:'Maybe if certain neighbors did not dump yard waste here it would not be overgrown.', reason:'Reported by resident as targeting' },
    { id:'FC-4', source:'staff', on:'PR-03 (School zones)', text:'[withheld pending review]', reason:'Staff-flagged for off-topic political content' },
  ];

  // ---------- INSIGHTS (12 months) ----------
  const monthLabels = ['Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May'];
  const ticketVolume = [31,38,42,36,55,44,29,33,41,47,52,61];
  const responseTime = [3.8,3.6,3.5,3.3,3.4,3.0,2.9,2.8,2.7,2.6,2.5,2.3];
  const engagement   = [22,26,29,31,34,33,30,35,38,41,44,47];
  const sentiment    = [0.42,0.48,0.51,0.50,0.39,0.46,0.55,0.58,0.57,0.60,0.62,0.59];
  const redemptions  = [60,72,88,96,110,98,84,102,118,124,135,142];

  const aiInsights = [
    { id:'AI-1', head:'5 tickets in the same location in the past 2 weeks', body:'Cluster near the Chartiers Creek bridge on Boyce Road. Possible candidate for escalation to a township project.', actions:['View cluster','Create proposal'] },
    { id:'AI-2', head:'Stormwater tickets up 40% this quarter', body:'Concentrated in Webb and Boyce neighborhoods. Possibly seasonal, possibly drainage-system stress.', actions:['View trend'] },
    { id:'AI-3', head:'18 comments mention school-zone safety', body:'Across multiple proposals and tickets. Threshold reached for proposal consideration.', actions:['Draft proposal'] },
    { id:'AI-4', head:'Webb neighborhood engagement dropped 35% this month', body:'Participation fell after a strong April. Worth investigating before the next newsletter.', actions:['Investigate'] },
    { id:'AI-5', head:'Recycling proposal feedback suggests a close vote', body:'Sentiment is split with conditions. Expect a close vote at the July 28 board meeting.', actions:['Review feedback'] },
  ];

  // ---------- AUDIT LOG ----------
  const auditActions = ['Ticket assigned','Response published','Content tagged','Comment removed','Setting changed','Role assigned','Form processed','Proposal advanced','Newsletter sent','Reward redeemed'];
  const auditLog = [];
  for (let i=0;i<220;i++){
    auditLog.push({
      id:'L'+(10000+i), action: rand(auditActions), actor: rand(ROLES).dept,
      target: 'CT-'+(2000+Math.floor(Math.random()*120)),
      ts: daysAgo(Math.floor(Math.random()*240)) + ' ' + String(8+Math.floor(Math.random()*9)).padStart(2,'0')+':'+String(Math.floor(Math.random()*60)).padStart(2,'0')
    });
  }
  auditLog.sort((a,b)=> a.ts<b.ts?1:-1);

  // ---------- NOTIFICATIONS per role ----------
  const notifications = {
    secretary: [
      { icon:'doc', text:'Mailed form ready for processing: P. Whitlock (Hilltop)', t:'18m', unread:true, important:true },
      { icon:'calendar', text:'Community event request pending review: Webb Park Trail Cleanup', t:'1h', unread:true },
      { icon:'flag', text:'4 comments flagged for moderation', t:'2h', unread:true },
      { icon:'loop', text:"This week's response loop draft is ready to assemble", t:'3h', unread:false },
      { icon:'ticket', text:'8 tickets awaiting triage', t:'5h', unread:false },
    ],
    manager: [
      { icon:'loop', text:'Response loop draft awaiting your approval (4 themes)', t:'25m', unread:true, important:true },
      { icon:'alert', text:'Escalation decision needed: Boyce Road cluster', t:'1h', unread:true, important:true },
      { icon:'doc', text:'Newsletter cover letter awaiting your signature', t:'2h', unread:true },
      { icon:'coins', text:'Budget allocation pending: $500 neighborhood fund', t:'4h', unread:false },
    ],
    pubworks: [
      { icon:'ticket', text:'New ticket assigned: Pothole on Boyce Road', t:'12m', unread:true, important:true },
      { icon:'project', text:'Project phase update overdue: Webb Park Trail Improvement', t:'1h', unread:true },
      { icon:'project', text:'Project phase update overdue: Boyce Road Stormwater', t:'1h', unread:true },
      { icon:'ticket', text:'3 tickets in your queue need a response', t:'3h', unread:false },
    ],
    finance: [
      { icon:'coins', text:'Capital project over budget: Boyce Road Stormwater (+$12K)', t:'40m', unread:true, important:true },
      { icon:'doc', text:'Vendor contract renewal in 30 days: Hollow Oak', t:'2h', unread:true },
      { icon:'grant', text:'Grant deadline this month: Green Infrastructure', t:'5h', unread:false },
    ],
    parks: [
      { icon:'calendar', text:'3 events ready to publish', t:'30m', unread:true },
      { icon:'ticket', text:'5 parks tickets assigned', t:'2h', unread:true },
      { icon:'project', text:'Hilltop Park Expansion: comment window closing soon', t:'4h', unread:false },
    ],
  };
  // default fallback for roles without bespoke notifications
  const defaultNotifs = [
    { icon:'ticket', text:'New items in your department queue', t:'1h', unread:true },
    { icon:'bell', text:'Welcome. Your notifications will appear here.', t:'1d', unread:false },
  ];

  // ---------- NEWSLETTER ASSEMBLY (July 2026 issue) ----------
  const nlLoopThemes = [
    { id:'lt1', title:'Recycling expansion questions', count:19, sentiment:'positive', nbhds:'All neighborhoods', dept:'Garbage & Recycling',
      youSaid:'When does the expanded pickup start, and will it raise our fees?',
      weDid:'The expanded pickup proposal goes to a board vote on July 28. Details on materials and any fee impact are posted on the proposal page, and there is no per-household increase in the base scenario.',
      summary:'Expanded recycling pickup heads to a July 28 board vote. No fee increase in the base scenario; details are on the proposal page.',
      confidence:'High', conf:'Most-engaged topic this cycle (19 inputs).', include:true },
    { id:'lt2', title:'Boyce Road conditions', count:14, sentiment:'negative', nbhds:'Boyce, Chartiers', dept:'Public Works',
      youSaid:'How long until Boyce Road actually gets fixed? It has cost neighbors tires.',
      weDid:'The worst stretch near the bridge is being folded into the Boyce Road resurfacing project so the repair lasts, rather than a temporary patch. Work is scheduled for July 21 to 23.',
      summary:'The worst stretch of Boyce Road is folded into the resurfacing project for a lasting fix. Work is scheduled July 21 to 23.',
      confidence:'High', conf:'High volume and clear resolution.', include:true },
    { id:'lt3', title:'School zone speeding', count:12, sentiment:'negative', nbhds:'Settlers Ridge, Hilltop', dept:'Police',
      youSaid:'Cars fly past the elementary at pickup. Please lower the limit on Hill Church.',
      weDid:'A school-zone speed-limit reduction is under board review, and enhanced signage is going up in the interim.',
      summary:'A school-zone speed-limit reduction is under board review, with enhanced signage going up in the interim.',
      confidence:'High', conf:'Recurring safety concern across two neighborhoods.', include:true },
    { id:'lt4', title:'Drainage after storms', count:11, sentiment:'neutral', nbhds:'Webb, Boyce', dept:'Sewer',
      youSaid:'The Webb Park entrance floods every time it rains and the Mill Street grate is clogged.',
      weDid:'Sewer is inspecting the flagged grates at Webb Park and Mill Street and will clear or resize them as needed.',
      summary:'Sewer is inspecting and clearing the flagged storm grates at Webb Park and Mill Street.',
      confidence:'Moderate', conf:'Seasonal; resolution in progress.', include:true },
    { id:'lt5', title:'Trail and park upkeep', count:9, sentiment:'positive', nbhds:'Webb', dept:'Parks',
      youSaid:'The north trail is impassable with the brush. Would love a volunteer cleanup day.',
      weDid:'Parks has scheduled brush clearing on the north trail and is coordinating a volunteer cleanup day later this month.',
      summary:'Parks scheduled brush clearing on the Webb north trail and is organizing a volunteer cleanup day.',
      confidence:'Moderate', conf:'Positive sentiment; community-building angle.', include:false },
    { id:'lt6', title:'Streetlight outages', count:7, sentiment:'neutral', nbhds:'Chartiers', dept:'Public Works',
      youSaid:'The corner of Mill Street is pitch black and the bus stop needs the light fixed.',
      weDid:'The reported outages on Mill Street have been logged and the photocells are scheduled for replacement this week.',
      summary:'Reported Mill Street streetlight outages are logged and scheduled for repair this week.',
      confidence:'Low', conf:'Lower volume; already resolved.', include:false },
    { id:'lt7', title:'Newsletter praise', count:6, sentiment:'positive', nbhds:'Various', dept:'Secretary',
      youSaid:'The newsletter is genuinely useful. I read it cover to cover.',
      weDid:'Thank you. We keep refining it based on your mailed-back feedback, and this issue adds a short cover question.',
      summary:'Thank you for the kind words on the newsletter; we keep refining it from your feedback.',
      confidence:'Low', conf:'Nice-to-have; low news value.', include:false },
    { id:'lt8', title:'Event turnout', count:5, sentiment:'positive', nbhds:'Hilltop', dept:'Parks',
      youSaid:'Movies in the Park was wonderful. More dates please.',
      weDid:'We added a second Movies in the Park date on July 25 at Hilltop Park by popular demand.',
      summary:'By popular demand, a second Movies in the Park was added July 25 at Hilltop Park.',
      confidence:'Low', conf:'Light but warm; optional.', include:false },
  ];
  const nlProposals = [
    { id:'np1', name:'Expanded Recycling Pickup', deadline:'2026-07-28', daysLeft:12, comments:52, followers:188,
      summary:'Twice-monthly recycling pickup township-wide, with an option to add glass collection.', cost:'$182,000/yr',
      affected:'All households', benefits:['No base fee increase','Higher diversion from landfill'], considerations:['Glass adds $32K/yr','Requires new vendor route'], include:true, urgent:true,
      rec:'Most-engaged active proposal this cycle. Recommended for the newsletter.' },
    { id:'np2', name:'Boyce Road Stormwater Drainage Upgrade', deadline:'2026-08-10', daysLeft:25, comments:21, followers:96,
      summary:'Culvert replacement and regrading to stop recurring flooding near the Chartiers Creek bridge.', cost:'$240,000',
      affected:'Boyce, Chartiers', benefits:['Ends repeat flooding','Protects the bridge approach'], considerations:['Engineering came in over estimate','August lane closures'], include:true, urgent:false,
      rec:'Ties directly to the top resident concern this month.' },
    { id:'np3', name:'Speed Limit Reduction in School Zones', deadline:'2026-08-18', daysLeft:33, comments:47, followers:142,
      summary:'Lower the school-zone limit and add flashing beacons at three elementary schools.', cost:'$46,000',
      affected:'Settlers Ridge, Hilltop', benefits:['Safer pickup and drop-off','Backed by resident reports'], considerations:['PennDOT coordination','Beacon lead time'], include:false, urgent:false,
      rec:'Strong engagement; consider if space allows.' },
    { id:'np4', name:'Hilltop Park Recreational Facilities Expansion', deadline:'2026-09-01', daysLeft:47, comments:34, followers:201,
      summary:'New courts, an inclusive playground, and a looped walking trail at Hilltop Park.', cost:'$610,000',
      affected:'Hilltop, Parkview', benefits:['Most-followed proposal','Inclusive design'], considerations:['Largest capital ask','Multi-year build'], include:false, urgent:false,
      rec:'High follower count but a distant deadline.' },
    { id:'np5', name:'Webb Park Community Garden Plots', deadline:'2026-08-25', daysLeft:40, comments:18, followers:73,
      summary:'Thirty rentable garden plots with shared water and tool storage at Webb Park.', cost:'$28,000',
      affected:'Webb', benefits:['Low cost','Strong local support'], considerations:['Plot demand unknown','Water tie-in needed'], include:false, urgent:false,
      rec:'Smaller scope; local interest.' },
    { id:'np6', name:'Downtown Mixed-Use Zoning Amendment', deadline:'2026-08-05', daysLeft:20, comments:29, followers:88,
      summary:'Allow ground-floor retail with apartments above along the Washington Pike corridor.', cost:'No direct cost',
      affected:'Washington Pike', benefits:['Encourages local business','No capital cost'], considerations:['Parking concerns','Design standards needed'], include:false, urgent:false,
      rec:'Policy item; moderate engagement.' },
    { id:'np7', name:'Police Body Camera Program Funding', deadline:'2026-08-30', daysLeft:45, comments:38, followers:120,
      summary:'Fund body cameras and storage for the department over three years.', cost:'$210,000/3yr',
      affected:'All households', benefits:['Transparency','Evidence quality'], considerations:['Ongoing storage cost','Policy updates'], include:false, urgent:false,
      rec:'Steady engagement; not deadline-urgent.' },
    { id:'np8', name:'Small-Scale Mixed-Use Development Standards', deadline:'2026-09-12', daysLeft:58, comments:6, followers:31,
      summary:'Objective standards for small mixed-use infill projects.', cost:'No direct cost',
      affected:'Township-wide', benefits:['Predictable review','No capital cost'], considerations:['Technical topic','Low public interest'], include:false, urgent:false,
      rec:'Early stage; low engagement.' },
  ];
  const nlComingUp = [
    { id:'cu1', kind:'event', name:'Independence Day Parade', date:'Jul 4', loc:'Main St', rsvp:0, recurring:false, hot:false, include:true },
    { id:'cu2', kind:'event', name:'Movies in the Park', date:'Jul 11', loc:'Webb Park', rsvp:47, recurring:true, hot:true, include:true },
    { id:'cu3', kind:'event', name:'Township Board Meeting', date:'Jul 14', loc:'Municipal Building', rsvp:0, recurring:true, hot:false, include:true },
    { id:'cu4', kind:'event', name:'Summer Concert Series', date:'Jul 18', loc:'Hilltop Amphitheater', rsvp:32, recurring:true, hot:false, include:true },
    { id:'cu5', kind:'event', name:'Movies in the Park', date:'Jul 25', loc:'Hilltop Park', rsvp:21, recurring:true, hot:false, include:true },
    { id:'cu6', kind:'event', name:'Recycling Expansion Vote', date:'Jul 28', loc:'Municipal Building', rsvp:0, recurring:false, hot:false, include:true },
    { id:'cu7', kind:'alert', name:'Trash delay: collection one day later', date:'Jul 6-10', loc:'All', rsvp:0, recurring:false, hot:false, include:true },
    { id:'cu8', kind:'notice', name:'Brush Collection Week', date:'Jul 13-17', loc:'All', rsvp:0, recurring:false, hot:false, include:true },
    { id:'cu9', kind:'alert', name:'Washington Pike construction lane shifts', date:'Jul 1-Aug 15', loc:'Washington Pike', rsvp:0, recurring:false, hot:false, include:true },
    { id:'cu10', kind:'alert', name:'Boyce Road resurfacing', date:'Jul 21-23', loc:'Boyce', rsvp:0, recurring:false, hot:false, include:true },
    { id:'cu11', kind:'notice', name:'Hilltop Road crack-seal', date:'Jul 9', loc:'Hilltop', rsvp:0, recurring:false, hot:false, include:false },
  ];
  const nlSeed = {
    month:'July 2026', mailDate:'July 30, 2026', status:'assembly', managerComments:null, sentToManagerAt:null,
    cover:{
      letterDrafted:true,
      letter:'Neighbors,\n\nThis month brought heavy rain and a surge of stormwater reports, and our crews have been out clearing grates from Webb Park to Mill Street. We are also resurfacing the worst of Boyce Road on July 21 to 23, and the expanded recycling proposal heads to a vote on July 28. Thank you for staying engaged, and please use the form in the back to weigh in.\n\nWarmly,\nThe Township of Collier',
      oneQuestion:'Should we expand recycling pickup to twice monthly?',
    },
    loopThemes: nlLoopThemes,
    proposals: nlProposals,
    comingUp: nlComingUp,
    engage:{ examplePair:0, rewardIntro:'Mail back the form and earn points toward local rewards from our partner businesses.', specialNote:'' },
    form:{ rewardIds:['R-1','R-4','R-5','R-11'] },
    complete:{ cover:false, loop:false, proposals:false, comingup:false, engage:true, form:true, back:true },
    predictedRate:14,
  };
  const nlExamplePairs = [
    { id:0, label:'Events + proposal feedback', a:'Post a photo from Movies in the Park to share with neighbors.', b:'Use the form to weigh in on the recycling expansion before July 28.' },
    { id:1, label:'Issue report + reward', a:'Report a pothole with a photo and the exact cross street.', b:'Redeem your points for a free coffee at one of our partner shops.' },
    { id:2, label:'Trail cleanup + event RSVP', a:'Sign up for the Webb Park trail cleanup day.', b:'RSVP to the Summer Concert Series so we can plan seating.' },
  ];

  window.SEED = {
    ROLES, PHASES, phaseBadge, NEIGHBORHOODS, NAMES, daysAgo,
    tickets, triageQueue, projects, proposals, proposalStages,
    rlArchive, rlDraftThemes, newsletters, events, notices, rewards,
    mailedForms, eventRequests, flaggedComments, auditLog,
    insights: { monthLabels, ticketVolume, responseTime, engagement, sentiment, redemptions, aiInsights },
    notifications, defaultNotifs,
    nlSeed, nlExamplePairs,
  };
})();
