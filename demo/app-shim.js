// Stands in for the Mac app behind the Nikxel window's page (src/DashboardPage.swift),
// so the real page runs on the website with sample data. It answers the page's
// webkit.messageHandlers.nx messages the way DashboardWindow.swift does.
(function () {
  var pad = function (n) { return ('0' + n).slice(-2); };
  var day = function (back) { var d = new Date(); d.setDate(d.getDate() - back); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  var at = function (back, hm) { return day(back) + ' ' + hm; };
  var unix = function (h, m) { var d = new Date(); d.setHours(h, m, 0, 0); return Math.floor(d / 1000); };
  var now = Math.floor(Date.now() / 1000);

  var page = 'meeting.html';
  var M = {
    design: { id: 'm-design', title: 'Design sync', date: at(0, '11:00') },
    acme: { id: 'm-acme', title: 'Pricing call with Acme', date: at(1, '16:30') },
    priya: { id: 'm-priya', title: '1:1 with Priya', date: at(3, '15:30') },
    sprint: { id: 'm-sprint', title: 'Sprint planning', date: at(6, '10:00') },
  };
  var library = [
    { id: M.design.id, kind: 'meetings', title: M.design.title, date: M.design.date, snippet: 'Onboarding ships Friday without the video tour; Mei owns the copy.', ext: 'html' },
    { id: M.acme.id, kind: 'meetings', title: M.acme.title, date: M.acme.date, snippet: 'Keep the free plan, Pro goes to $12. Ali wants the quote in writing by Friday.', ext: 'html' },
    { id: M.priya.id, kind: 'meetings', title: M.priya.title, date: M.priya.date, snippet: 'Offsite in March; Priya shortlists venues.', ext: 'html' },
    { id: M.sprint.id, kind: 'meetings', title: M.sprint.title, date: M.sprint.date, snippet: 'Onboarding, pricing page and the Windows build this sprint.', ext: 'html' },
    { id: 'n-talk', kind: 'notes', title: 'Talk: shipping small', date: at(2, '20:10'), snippet: 'Cut scope before cutting quality. Ship on a fixed day.', ext: 'html' },
    { id: 'n-pod', kind: 'notes', title: 'Podcast: pricing for startups', date: at(5, '09:40'), snippet: 'Charge more, earlier. Anchor on the annual plan.', ext: 'html' },
    { id: 'd-1', kind: 'daily', title: 'Onboarding shipped to staging, Acme pricing agreed', date: at(1, '00:00'), snippet: '', ext: 'html' },
    { id: 'd-2', kind: 'daily', title: 'Pricing page draft and a long design review', date: at(2, '00:00'), snippet: '', ext: 'html' },
    { id: 'd-3', kind: 'daily', title: 'Mostly meetings; the Windows click bug fixed', date: at(3, '00:00'), snippet: '', ext: 'html' },
    { id: 'w-1', kind: 'weekly', title: 'Onboarding week: shipped, priced, planned', date: at(4, '00:00'), snippet: '', ext: 'html' },
  ];
  var task = function (text, meeting, o) {
    return Object.assign({ text: text, mine: false, owner: '', due: '', done: false, md: meeting.id, n: 0, meeting: meeting }, o);
  };
  var tasks = [
    task('Send Acme the revised quote in writing', M.acme, { mine: true, due: 'Friday', n: 1 }),
    task('Write the release note for onboarding', M.design, { mine: true, due: 'Friday', n: 3 }),
    task('Book two venues to visit for the offsite', M.priya, { mine: true, n: 2 }),
    task('Finish the onboarding copy', M.design, { owner: 'Mei Tan', due: 'Thursday', n: 1 }),
    task('Check the pricing page against the new plans', M.design, { owner: 'Priya Shah', due: 'Wednesday', n: 2 }),
    task('Shortlist venues for the March offsite', M.priya, { owner: 'Priya Shah', n: 1 }),
    task('Confirm seat count for the annual plan', M.acme, { owner: 'Ali Raza', n: 2 }),
    task('Share the sprint board with the team', M.sprint, { mine: true, done: true, n: 1 }),
  ];
  var person = function (name, ms, mine, theirs) {
    return { name: name, meetings: ms, last: ms[0].date, mine: mine, theirs: theirs };
  };
  var people = [
    person('Priya Shah', [M.design, M.priya, M.sprint], [tasks[2]], [tasks[4], tasks[5]]),
    person('Mei Tan', [M.design, M.sprint], [tasks[1]], [tasks[3]]),
    person('Ali Raza', [M.acme], [tasks[0]], [tasks[6]]),
    person('Sam Lee', [M.sprint], [], []),
  ];
  var usageDays = [];
  for (var b = 13; b >= 0; b--) usageDays.push({ day: day(b), cost: [0.31, 0.52, 0.18, 0.74, 0.44, 0.06, 0.02, 0.39, 0.61, 0.57, 0.22, 0.48, 0.66, 0.35][13 - b], calls: [9, 14, 5, 19, 12, 2, 1, 11, 16, 15, 6, 13, 17, 10][13 - b] });

  var S = {
    platform: 'mac', section: 'home', library: library, tabs: [], active: null, sideCollapsed: false,
    recording: false, micMuted: false, visible: true, templateShipped: true, openInApp: true, appearance: 'light', tour: false,
    tasks: tasks, people: people,
    today: {
      google: true,
      events: [
        { start: unix(9, 30), end: unix(9, 45), title: 'Standup', link: 'https://meet.google.com/' },
        { start: unix(11, 0), end: unix(11, 30), title: 'Design sync', link: 'https://meet.google.com/' },
        { start: unix(15, 30), end: unix(16, 0), title: '1:1 with Priya', link: 'https://meet.google.com/' },
      ],
      dayId: 'd-1', dayDate: at(1, '00:00'),
      openTasks: [{ i: 0, text: 'Send Acme the revised quote in writing' }, { i: 1, text: 'Reply to Mei about the onboarding copy' }, { i: 2, text: 'Review PR #42' }],
    },
    recordingSince: 0, captureLabel: 'Meeting',
    botReplies: [
      { t: unix(10, 12), name: 'Mom', text: 'In a meeting right now, I’ll call you back after 4.' },
      { t: unix(11, 8), name: 'Ali Raza', text: 'Got it. The revised quote will be with you by Friday.' },
      { t: unix(13, 40), name: 'Gym group', text: 'Can’t make it today, see you Thursday.' },
    ],
    neverReply: [], usageDays: usageDays,
    automations: [
      { id: 'a1', name: 'Client follow-up', instruction: 'After a call with a client, draft an email with what we agreed and the next steps. Leave it in Gmail drafts.', when: 'After every meeting', trigger: 'meeting', enabled: true },
      { id: 'a2', name: 'Monday plan', instruction: 'List what’s still open from last week, most urgent first, and who I’m waiting on.', when: 'Mondays at 09:00', trigger: 'schedule', days: 'mon', time: '09:00', enabled: true },
      { id: 'a3', name: 'Standup tasks to ERP', instruction: 'Make an ERP task for each action item I own from a standup.', when: 'After every meeting', trigger: 'meeting', enabled: false },
    ],
    automationRuns: [
      { t: now - 3000, name: 'Client follow-up', text: 'Drafted **“Acme: pricing and next steps”** in Gmail. Nothing sent.', file: M.acme.id, skipped: false },
      { t: now - 90000, name: 'Monday plan', text: '1. Revised quote for Acme (due Friday)\n2. Onboarding release note\n3. Waiting on Priya: venue shortlist', file: '', skipped: false },
    ],
    automationRunning: '',
    nikxelSuggested: [
      { t: now - 7200, kind: 'offer', key: 'k1', title: 'Follow-ups after client calls', line: 'You write a follow-up after most client calls. Want me to draft it each time?', answer: '' },
      { t: now - 172800, kind: 'idea', key: 'k2', title: 'Fewer meetings on Tuesday', line: 'Tuesdays had four meetings and the least coding all week.', answer: '' },
    ],
    ideas: [
      { name: 'Weekly client update', when: 'Fridays at 16:00', trigger: 'schedule', days: 'fri', time: '16:00', why: '', instruction: 'Write a short update for each client from this week’s meetings, as Gmail drafts.' },
      { name: 'Prep for tomorrow', when: 'After my day summary', trigger: 'day', why: '', instruction: 'Look at tomorrow’s calendar and list what I need for each meeting.' },
    ],
    editor: null, hour: new Date().getHours(), name: 'Sam', waOwnName: 'Sam',
    userContext: 'Product lead at a small studio. This month: ship the new onboarding and settle pricing.',
    language: 'auto', transcriptionLanguage: 'auto', avatarSize: 1,
    agent: 'claude', agents: [{ id: 'claude', name: 'Claude Code' }, { id: 'opencode', name: 'OpenCode' }, { id: 'codex', name: 'Codex' }, { id: 'agy', name: 'Antigravity' }],
    captureMode: 'meeting', noteFormat: 'page',
    noteFormats: [{ id: 'page', name: 'Page (.html)' }, { id: 'pdf', name: 'PDF' }, { id: 'docx', name: 'Word' }, { id: 'md', name: 'Markdown' }],
    autoRecordCalls: false, forceMeeting: false, summaryMinutes: 1320, summaryTemplate: 'pm',
    templates: [{ id: 'developer', name: 'Developer' }, { id: 'pm', name: 'Product manager' }, { id: 'hr', name: 'HR' }, { id: 'cofounder', name: 'Co-founder' }],
    googleSyncEnabled: true, botEnabled: true, waBotMode: 'meetings',
    waModes: [{ id: 'meetings', name: 'In meetings' }, { id: 'away', name: 'When I’m away' }, { id: 'always', name: 'All day' }],
    waUnattendedMinutes: 10, waGroupReplies: false, waDraftOnly: false, waQuietHours: true, waQuietFrom: 23, waQuietTo: 7,
    waWorkContext: true, waChatTasks: true, botMemoryDays: 7, projectsRoot: '~/Desktop',
    status: { whatsapp: true, google: true, slack: false, reminders: true, dashboard: true, erp: false },
    erp: { connected: false, waiting: false, problem: '', url: '' },
    usageToday: '$0.35 · 10 runs', usageAverage: '$0.40 · 11 runs',
  };

  var ANSWERS = [
    [/promise|owe|ali/i, 'You owe **Ali Raza** one thing from yesterday’s pricing call: **the revised quote, in writing, by Friday**. It’s still open.\n\nWant me to draft the email?'],
    [/agree|decid|today/i, 'From today’s **Design sync**:\n\n- Onboarding ships **Friday**, without the video tour.\n- **Mei** finishes the copy by Thursday.\n- **Priya** checks the pricing page first.\n\nYou took the release note.'],
    [/whatsapp|waiting/i, '**Mom** asked you to call when you’re free (I said you’d call after 4). **Ali** is waiting on the quote. Nobody else needs you.'],
    [/week|work/i, 'This week: the new onboarding went to staging, pricing with Acme was settled, and the Windows click bug got fixed. About 9 hours of coding across 6 meetings.'],
    [/inbox|mail|urgent/i, 'One thing looks urgent: **Acme** replied asking for the quote before their Friday board call. Two newsletters and a calendar invite otherwise.'],
    [/draft|email/i, 'Drafted **“Acme: revised quote”** in Gmail with the new pricing. Nothing sent; it’s in your drafts.'],
  ];
  function answer(q) {
    for (var i = 0; i < ANSWERS.length; i++) if (ANSWERS[i][0].test(q)) return ANSWERS[i][1];
    return 'This is a demo with sample data, so I only know Sam’s made-up week. Try “what did we decide today?” or “what do I owe Ali?”.';
  }

  var orgData = {
    '/api/org': { org: { name: 'Small Studio' }, me: { user_id: 'u-sam', name: 'Sam Lee', role: 'admin' } },
    '/api/members': [
      { user_id: 'u-sam', name: 'Sam Lee', email: 'sam@studio.example', role: 'admin' },
      { user_id: 'u-priya', name: 'Priya Shah', email: 'priya@studio.example', role: 'owner' },
      { user_id: 'u-mei', name: 'Mei Tan', email: 'mei@studio.example', role: 'member' },
      { user_id: 'u-ali', name: 'Dev Patel', email: 'dev@studio.example', role: 'member' },
    ],
    '/api/projects': [
      { id: 'p1', name: 'Onboarding', description: 'The new first run', members: [{ user_id: 'u-sam', name: 'Sam Lee' }, { user_id: 'u-mei', name: 'Mei Tan' }], leads: ['u-sam'], last_activity: day(0) },
      { id: 'p2', name: 'Pricing', description: 'Plans and the pricing page', members: [{ user_id: 'u-priya', name: 'Priya Shah' }, { user_id: 'u-sam', name: 'Sam Lee' }], leads: ['u-priya'], last_activity: day(1) },
    ],
    '/api/shared/mine': { meetings: [], days: [] },
  };

  // The template dialog's files, kept in memory.
  var tplFiles = {
    developer: '# Developer: for standups, design talks and handoffs.\n\nKeep the Agent Prompts section; it is the main reason this call was recorded.\n\nIn Decisions, record the option chosen and the ones rejected, each with the reason given.\n',
    pm: '# Product manager: owners, dates and what moved.\n\nOpen with three to five bullets: what is on track, what slipped, what needs attention this week.\n\nEvery action item carries an owner and a date.\n\nDrop the Agent Prompts section.\n',
    hr: '# HR: 1:1s, interviews and policy talks.\n\nDrop the Agent Prompts section entirely.\n\nKeep the tone factual and neutral throughout.\n',
    cofounder: '# Co-founder: short, decision-first, money-aware.\n\nLead the Summary with the decision or the number that mattered.\n'
  };
  var shippedTpl = ['developer', 'pm', 'hr', 'cofounder'], tplRev = 0;
  function openTpl(slug, creating) { S.templateEditor = { slug: slug, name: (S.templates.filter(function (t) { return t.id === slug; })[0] || {}).name || slug, shipped: shippedTpl.indexOf(slug) >= 0, text: tplFiles[slug] || '', rev: ++tplRev, creating: !!creating, error: '' }; }
  function templateOp(m) {
    if (S.templateEditor) S.templateEditor.error = '';
    switch (m.op) {
      case 'open': openTpl(m.slug); break;
      case 'save': tplFiles[m.slug] = m.text; if (m.use) S.summaryTemplate = m.slug; S.templateEditor = null; break;
      case 'new':
        var slug = String(m.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        if (!slug || tplFiles[slug] != null) { S.templateEditor.error = slug ? 'There’s already a template called that. Pick another name, or edit that one.' : 'Give it a name with at least one letter or number in it.'; break; }
        tplFiles[slug] = '# ' + m.name.trim() + '\n\n' + (m.copy ? tplFiles[m.copy].replace(/^(#.*\n|\s*\n)*/, '') : '');
        S.templates.push({ id: slug, name: m.name.trim() }); S.summaryTemplate = slug; openTpl(slug); break;
      case 'reset': openTpl(m.slug); break;
      case 'delete': delete tplFiles[m.slug]; S.templates = S.templates.filter(function (t) { return t.id !== m.slug; }); if (S.summaryTemplate === m.slug) S.summaryTemplate = 'pm'; openTpl(S.summaryTemplate); break;
      default: S.templateEditor = null;
    }
    push();
  }

  function push() { setTimeout(function () { window.nx && nx.state(JSON.parse(JSON.stringify(S))); }, 0); }
  var tabTitle = function (id) { var e = library.filter(function (x) { return x.id === id; })[0]; return e || { id: id, title: 'Summary', date: '', kind: 'meetings' }; };

  // The open summary: a real Nikxel meeting page in a frame over the main column, as the app overlays a web view.
  var frame;
  function reader() {
    if (!frame) {
      frame = document.createElement('iframe');
      frame.title = 'Summary';
      frame.style.cssText = 'position:fixed;border:0;background:#fff;z-index:5';
      document.body.appendChild(frame);
      addEventListener('resize', place);
    }
    frame.hidden = !S.active;
    if (S.active && frame.dataset.id !== S.active) { frame.dataset.id = S.active; frame.src = page; }
    place();
  }
  function place() {
    if (!frame || frame.hidden) return;
    var main = document.getElementById('main'), bar = document.getElementById('tabbar');
    var r = main.getBoundingClientRect(), top = bar && !bar.hidden ? bar.getBoundingClientRect().bottom : r.top;
    frame.style.left = r.left + 'px'; frame.style.top = top + 'px';
    frame.style.width = r.width + 'px'; frame.style.height = (innerHeight - top) + 'px';
  }

  window.webkit = { messageHandlers: { nx: { postMessage: function (m) {
    switch (m.type) {
      case 'section': S.section = m.id; break;
      case 'set': S[m.key] = m.value; if (m.key === 'userName') S.name = m.value; push(); break;
      case 'side': S.sideCollapsed = m.collapsed; break;
      case 'open':
        if (!S.tabs.some(function (t) { return t.id === m.id; })) { var e = tabTitle(m.id); S.tabs.push({ id: e.id, title: e.title, date: e.date, kind: e.kind }); }
        S.active = m.id; push(); setTimeout(reader, 30); break;
      case 'tab': S.active = m.id; push(); setTimeout(reader, 30); break;
      case 'closeTab':
        S.tabs = S.tabs.filter(function (t) { return t.id !== m.id; });
        if (S.active === m.id) S.active = S.tabs.length ? S.tabs[S.tabs.length - 1].id : null;
        push(); setTimeout(reader, 30); break;
      case 'action':
        if (m.name === 'closeSummary') { S.active = null; push(); setTimeout(reader, 30); }
        else if (m.name === 'toggleRecording') { S.recording = !S.recording; S.recordingSince = Math.floor(Date.now() / 1000); push(); }
        else if (m.name === 'toggleMicMute') { S.micMuted = !S.micMuted; push(); }
        else if (m.name === 'toggleVisibility') { S.visible = !S.visible; push(); }
        else if (m.name === 'editTemplate' || m.name === 'newTemplate') { openTpl(S.summaryTemplate, m.name === 'newTemplate'); push(); }
        break;
      case 'template': templateOp(m); break;
      case 'erp':   // the sign-in window is the real app's; here it signs in after a moment
        if (m.op === 'connect') {
          var u = String(m.url || '').trim();
          if (!/^(https?:\/\/)?[^\s\/]+\.[^\s\/]+/.test(u)) { S.erp.problem = 'That doesn’t look like a web address. Try something like erp.yourcompany.com.'; push(); break; }
          S.erp = { connected: false, waiting: true, problem: '', url: /:\/\//.test(u) ? u : 'https://' + u }; push();
          setTimeout(function () { if (!S.erp.waiting) return; S.erp.waiting = false; S.erp.connected = true; S.status.erp = true; push(); }, 2500);
        } else if (m.op === 'cancel') { S.erp.waiting = false; S.erp.problem = 'The window closed before you signed in.'; push(); }
        else if (m.op === 'disconnect') { S.erp.connected = false; S.status.erp = false; push(); }
        break;
      case 'task': S.tasks.forEach(function (t) { if (t.md === m.md && t.n === m.n) t.done = m.done; }); push(); break;
      case 'dayTask': S.today.openTasks = S.today.openTasks.filter(function (t) { return t.i !== m.i; }); push(); break;
      case 'autoToggle': S.automations.forEach(function (a) { if (a.id === m.id) a.enabled = m.on; }); push(); break;
      case 'autoDelete': S.automations = S.automations.filter(function (a) { return a.id !== m.id; }); push(); break;
      case 'autoSave':
        var a = Object.assign({}, m.a, { id: m.a.id || 'a' + Date.now(), enabled: true, when: { meeting: 'After every meeting', day: 'After my day summary', week: 'After my week summary', schedule: 'On a schedule' }[m.a.trigger] });
        S.automations = S.automations.filter(function (x) { return x.id !== a.id; }).concat([a]); push(); break;
      case 'neverReply': S.neverReply.push(m.name); push(); break;
      case 'learnDecide': S.nikxelSuggested.forEach(function (x) { if (x.key === m.key) x.answer = m.yes ? 'yes' : 'no'; }); push(); break;
      case 'chatStart': case 'chatNew':
        setTimeout(function () {
          nx.sources([
            { name: 'Meetings and notes', detail: 'Last two weeks, 12 summaries', on: true },
            { name: 'Your days', detail: '14 day summaries', on: true },
            { name: 'WhatsApp', detail: '23 chats today', on: true },
            { name: 'Gmail', detail: 'Inbox, last 7 days', on: true },
            { name: 'Team projects', detail: 'Onboarding, Pricing', on: true },
            { name: 'ERP', detail: 'Not connected', on: false },
          ]);
        }, 500);
        break;
      case 'chat': setTimeout(function () { nx.reply(m.id, { text: answer(m.text) }); }, 1100); break;
      case 'chatMic': setTimeout(function () { nx.reply(m.id, 'busy'); }, 200); break;
      case 'autoMake': case 'autoSuggest':
        setTimeout(function () { nx.reply(m.id, { error: 'Making automations needs the real app. Try one of the ideas below.' }); }, 600); break;
      case 'org':
        var d = orgData[m.path];
        if (!d && m.path.indexOf('/api/projects/') === 0) {
          var p = orgData['/api/projects'].filter(function (x) { return '/api/projects/' + x.id === m.path; })[0];
          d = p && { project: Object.assign({ can_edit: true }, p), days: [] };
        }
        setTimeout(function () { nx.reply(m.id, d ? { status: 200, data: d } : { status: 403, data: { error: 'Not in the demo.' } }); }, 250);
        break;
      case 'search': setTimeout(function () { nx.found(m.q, []); }, 100); break;
    }
  } } } };

  // The sprite sheet cut into rows of frames, as PageAssets.spriteRows does.
  function frames() {
    var img = new Image();
    img.onload = function () {
      var rows = [], c = document.createElement('canvas'), x = c.getContext('2d');
      c.width = c.height = 64;
      for (var r = 0; r < 10; r++) {
        var row = [];
        for (var k = 0; k < 4; k++) { x.clearRect(0, 0, 64, 64); x.drawImage(img, k * 64, r * 64, 64, 64, 0, 0, 64, 64); row.push(c.toDataURL()); }
        rows.push(row);
      }
      nx.frames(rows);
    };
    img.src = '/sprites.png';
  }
  addEventListener('DOMContentLoaded', function () { push(); frames(); });
})();
