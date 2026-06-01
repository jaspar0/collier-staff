/* Tour step definitions -> window.getTour(roleId, go) */
(function () {
  // 'go' lets a step navigate the dashboard before highlighting.
  // Universal steps everyone sees (role switcher, bell, insights).
  function universal(go) {
    return [
      { sel:'[data-tour="role-switcher"]', type:'feature', placement:'bottom',
        title:'Switch how you see the dashboard',
        body:'This View As control is a demo affordance. Use it to see what other staff roles see. In production, staff only see their own role.' },
      { sel:'[data-tour="bell"]', type:'feature', placement:'bottom',
        title:'Your notifications live here',
        body:'The bell shows items relevant to your role. The red badge is your unread count. Switching roles changes what appears.' },
      { sel:'[data-tour="nav-insights"]', type:'feature', placement:'bottom',
        title:'Insights turns activity into decisions',
        body:'Quick reads, domain dashboards, and AI-surfaced insights that route straight into a workflow. Every role sees this, filtered to what they can act on.' },
    ];
  }

  const ROLE_TOURS = {
    secretary: (go) => [
      { sel:'[data-tour="today-queues"]', type:'feature', placement:'bottom',
        title:'Your home answers one question',
        body:'What do I need to do right now? These queue cards show what is waiting: tickets to triage, forms to process, events to review, comments to moderate.' },
      { sel:'[data-tour="qa-triage"]', type:'feature', placement:'top',
        title:'Triage incoming tickets',
        body:'Tickets arrive untriaged. You confirm or override an AI routing suggestion and send each one to the right department. Click here any time to start.' },
      { sel:'[data-tour="nav-incoming"]', type:'nav', placement:'bottom',
        title:'Open the Incoming section',
        body:'Everything arriving from residents and the mailed channel lands here: tickets, event requests, mailed forms, flagged comments. Tap Incoming to look.',
        pre:()=>go('today') },
      { sel:'[data-tour="subtab-forms"]', type:'feature', placement:'bottom',
        title:'Mailed forms become structured data',
        body:'Residents without the app mail back a paper feedback form. AI extracts the fields; you verify and route them across the system in one step.',
        pre:()=>go('incoming',{tab:'Mailed forms'}) },
      { sel:'[data-tour="nav-loop"]', type:'nav', placement:'bottom',
        title:'Open the Response Loop',
        body:'Once a week you aggregate resident input into themes, draft township responses, and send them to the Manager to approve. Tap Response Loop.',
        pre:()=>go('incoming') },
      { sel:'[data-tour="loop-start"]', type:'feature', placement:'bottom',
        title:'Start this week\u0027s response loop',
        body:'A four-step flow: cluster themes with AI, draft a response per theme, review, and submit for approval. You edit everything the AI drafts.',
        pre:()=>go('loop',{tab:'Draft'}) },
      { sel:'[data-tour="nav-newsletter"]', type:'nav', placement:'bottom',
        title:'Assemble the monthly newsletter',
        body:'Most of the newsletter auto-compiles from the month\u0027s activity. You draft the cover letter and hand off to the Manager to sign. Tap Newsletter.',
        pre:()=>go('loop') },
    ],
    manager: (go) => [
      { sel:'[data-tour="today-queues"]', type:'feature', placement:'bottom',
        title:'Decisions, not queues',
        body:'Your home surfaces what needs your judgment: response loop drafts to approve, escalations, budget allocations, newsletter sections to review.' },
      { sel:'[data-tour="qa-approvals"]', type:'feature', placement:'top',
        title:'Review pending approvals',
        body:'Nothing reaches a resident without a named human approving it. Here you approve, edit, or send back the Secretary\u0027s response loop drafts.' },
      { sel:'[data-tour="nav-loop"]', type:'nav', placement:'bottom',
        title:'Open the Response Loop approval queue',
        body:'See each draft alongside the resident input it answers. Approve as-is to publish, edit and approve, or reject with comments. Tap Response Loop.',
        pre:()=>go('today') },
    ],
    pubworks: (go) => [
      { sel:'[data-tour="today-queues"]', type:'feature', placement:'bottom',
        title:'Your assigned work',
        body:'Public Works carries the highest ticket volume. These cards show what is assigned to you and which projects are overdue for a resident update.' },
      { sel:'[data-tour="qa-respond"]', type:'feature', placement:'top',
        title:'Respond to a ticket',
        body:'Open a ticket, draft a response with AI, edit it in your voice, and publish. Publishing advances the ticket status and posts the reply to the resident.' },
      { sel:'[data-tour="nav-content"]', type:'nav', placement:'bottom',
        title:'Manage your projects and notices',
        body:'Capital projects, notices, and events your department owns live under Content. Projects flagged stale prompt you to post an update. Tap Content.',
        pre:()=>go('today') },
    ],
    parks: (go) => [
      { sel:'[data-tour="today-queues"]', type:'feature', placement:'bottom',
        title:'Events, tickets, and projects',
        body:'Parks and Recreation publishes events, answers parks tickets, and manages recreational projects. Your home shows all three.' },
      { sel:'[data-tour="qa-event"]', type:'feature', placement:'top',
        title:'Create an event',
        body:'Fill the basics, then let AI suggest archetype and topic tags so the event reaches the right residents\u0027 feeds. You confirm the tags before publishing.' },
    ],
    finance: (go) => [
      { sel:'[data-tour="today-queues"]', type:'feature', placement:'bottom',
        title:'An analytical home, not a queue',
        body:'Finance works in snapshots and drill-downs: capital budgets, grants, vendor contracts, reward spend. Red flags mark what is over budget.' },
      { sel:'[data-tour="qa-budget"]', type:'feature', placement:'top',
        title:'Open the capital budget tracker',
        body:'Budgeted versus actual for every active project. Drill into a flagged project to approve spending, flag for review, or request information.' },
    ],
    commissioner: (go) => [
      { sel:'[data-tour="today-queues"]', type:'feature', placement:'bottom',
        title:'A briefing book, not a queue',
        body:'As Commissioner your role is governance. Your home reads like a monthly briefing: engagement, recent themes, and upcoming votes.' },
      { sel:'[data-tour="qa-vote"]', type:'feature', placement:'top',
        title:'Cast governance votes',
        body:'Vote on policy items and the monthly $500 neighborhood budget allocation. You have read access everywhere else.' },
    ],
  };

  function getTour(roleId, go) {
    const builder = ROLE_TOURS[roleId];
    const roleSteps = builder ? builder(go) : [
      { sel:'[data-tour="today-queues"]', type:'feature', placement:'bottom',
        title:'Your department home',
        body:'These cards show what is assigned to your department and what needs your attention right now.' },
    ];
    return [...roleSteps, ...universal(go)];
  }

  window.getTour = getTour;
})();
