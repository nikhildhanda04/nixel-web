// Answers the team dashboard's /api calls with a sample team, so the website
// can run the real dashboard (nikxel-admin) with no server. Imported first by
// demo/build.mjs; writes change the sample in memory only.
const pad = (n) => String(n).padStart(2, '0');
const day = (back) => { const d = new Date(); d.setDate(d.getDate() - back); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

const me = { userId: 'u-priya', name: 'Priya Shah', role: 'owner', orgId: 'o1' };
const members = [
  { user_id: 'u-priya', name: 'Priya Shah', email: 'priya@studio.example', role: 'owner' },
  { user_id: 'u-sam', name: 'Sam Lee', email: 'sam@studio.example', role: 'admin' },
  { user_id: 'u-mei', name: 'Mei Tan', email: 'mei@studio.example', role: 'member' },
  { user_id: 'u-dev', name: 'Dev Patel', email: 'dev@studio.example', role: 'member' },
];
const who = (id) => members.find((m) => m.user_id === id);

let n = 0;
const it = (what, type, minutes, section, project, details) => ({ id: 'i' + ++n, what, type, minutes, section, project, details });
const days = {
  'u-priya': [
    { date: day(0), headline: 'Pricing page signed off and the offsite venues shortlisted.', stats: { coding: 0, meetings: 4, messages: 38 }, items: [
      it('Signed off the new pricing page with Sam — done', 'review', 45, 'what you worked on', 'Pricing'),
      it('Shortlisted three venues for the March offsite — open', 'planning', 50, 'what you worked on', 'Offsite', ['Two in the hills, one in town', 'Visits booked for next week']),
      it('Design sync: onboarding ships Friday without the video tour', 'meeting', 30, 'meetings', 'Onboarding'),
      it('1:1 with Sam: offsite plan and Q1 hiring', 'meeting', 30, 'meetings'),
      it('Answered Acme on seats for the annual plan', 'comms', 15, 'whatsapp', 'Pricing'),
    ] },
    { date: day(1), headline: 'Pricing call with Acme; plans settled at $12 for Pro.', stats: { coding: 0, meetings: 3, messages: 52 }, items: [
      it('Pricing call with Acme: keep the free plan, Pro to $12', 'meeting', 45, 'meetings', 'Pricing'),
      it('Wrote the plan comparison for the pricing page — done', 'writing', 70, 'what you worked on', 'Pricing'),
      it('Reviewed Mei’s onboarding copy, left notes', 'review', 25, 'what you worked on', 'Onboarding'),
    ] },
  ],
  'u-sam': [
    { date: day(0), name: 'Sam Lee', headline: 'Onboarding flow is on staging; release note drafted.', stats: { coding: 190, meetings: 3, messages: 41 }, items: [
      it('Shipped the new onboarding flow to staging — done', 'shipped', 130, 'what you worked on', 'Onboarding', ['Five screens, about a minute', 'Practice tour at the end']),
      it('Fixed the Windows click bug on the avatar — done', 'coding', 60, 'what you worked on', 'Windows app'),
      it('Drafted the onboarding release note — open', 'writing', 30, 'what you worked on', 'Onboarding'),
      it('Design sync: Mei owns the copy, ship Friday', 'meeting', 30, 'meetings', 'Onboarding'),
      it('Reviewed PR #42 and asked for changes', 'review', 25, 'what you worked on'),
    ] },
    { date: day(1), name: 'Sam Lee', headline: 'Pricing call and the first pass of the plan picker.', stats: { coding: 150, meetings: 2, messages: 33 }, items: [
      it('Built the plan picker for the pricing page — done', 'coding', 150, 'what you worked on', 'Pricing'),
      it('Pricing call with Acme', 'meeting', 45, 'meetings', 'Pricing'),
    ] },
  ],
  'u-mei': [
    { date: day(0), name: 'Mei Tan', headline: 'Onboarding copy, first full draft.', stats: { coding: 0, meetings: 2, messages: 19 }, items: [
      it('Wrote the onboarding copy, all five screens — open', 'writing', 140, 'what you worked on', 'Onboarding'),
      it('Design sync', 'meeting', 30, 'meetings', 'Onboarding'),
    ] },
  ],
  'u-dev': [
    { date: day(0), name: 'Dev Patel', headline: 'Linux build runs; tray icon fixed on Ubuntu.', stats: { coding: 240, meetings: 1, messages: 12 }, items: [
      it('Got the Linux build running under XWayland — done', 'shipped', 150, 'what you worked on', 'Windows app'),
      it('Researched whisper builds for Linux', 'research', 60, 'what you worked on', 'Windows app'),
      it('Standup', 'meeting', 15, 'meetings'),
    ] },
  ],
};
let pid = 0;
const projects = [
  { id: 'p-onb', name: 'Onboarding', description: 'The new first run and its practice tour', members: [members[1], members[2], members[0]] },
  { id: 'p-price', name: 'Pricing', description: 'Plans, the pricing page and Acme', members: [members[0], members[1]] },
  { id: 'p-win', name: 'Windows app', description: 'Windows and Linux builds', members: [members[3], members[1]] },
  { id: 'p-off', name: 'Offsite', description: 'March, somewhere quiet', members: [members[0]] },
].map((p) => ({ ...p, members: p.members.map((m) => ({ user_id: m.user_id, name: m.name })), archived: false }));

function feed(p) {
  const byDate = new Map();
  for (const [uid, list] of Object.entries(days)) for (const d of list) for (const i of d.items) {
    if (i.project !== p.name) continue;
    if (!byDate.has(d.date)) byDate.set(d.date, { date: d.date, items: [], meetings: [] });
    byDate.get(d.date).items.push({ ...i, name: who(uid).name });
  }
  if (p.id === 'p-onb') {
    const d = byDate.get(day(0));
    d && d.meetings.push({ id: 'mt1', title: 'Design sync', name: 'Sam Lee', body: '## Decisions\n- Ship onboarding on Friday, without the video tour.\n## Action items\n- Mei: finish the copy by Thursday\n- Priya: check the pricing page\n- Sam: write the release note' });
  }
  return [...byDate.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
}
const lastActivity = (p) => feed(p)[0]?.date || null;

function route(method, url, body) {
  const p = url.replace(/^.*?\/api/, '').split('?')[0];
  let m;
  if (p === '/me') return me;
  if (p === '/auth/logout') return {};
  if (p === '/members' && method === 'GET') return members;
  if ((m = /^\/members\/(.+)$/.exec(p))) {
    const id = decodeURIComponent(m[1]), i = members.findIndex((x) => x.user_id === id);
    if (method === 'DELETE' && i >= 0) members.splice(i, 1); else if (i >= 0) members[i].role = body.role;
    return {};
  }
  if (p === '/summaries/mine') return days[me.userId].map((d, k) => ({ id: 'd' + k, ...d }));
  if ((m = /^\/summaries\/user\/(.+)$/.exec(p))) return (days[decodeURIComponent(m[1])] || []).map((d, k) => ({ id: m[1] + k, ...d }));
  if (p === '/invites') return { token: 'demo-invite' };
  if (p === '/pairing-code') return { code: 'NX-4821' };
  if (p === '/projects' && method === 'GET') return projects.map((x) => ({ ...x, last_activity: lastActivity(x) }));
  if (p === '/projects' && method === 'POST') {
    if (projects.some((x) => x.name.toLowerCase() === body.name.toLowerCase())) throw 409;
    const x = { id: 'p-new' + ++pid, name: body.name, description: body.description || '', members: [{ user_id: me.userId, name: me.name }], archived: false };
    projects.push(x);
    return { id: x.id };
  }
  if ((m = /^\/projects\/([^/]+)(?:\/members\/(.+))?$/.exec(p))) {
    const x = projects.find((y) => y.id === decodeURIComponent(m[1]));
    if (!x) throw 404;
    if (m[2]) {
      const uid = decodeURIComponent(m[2]);
      if (method === 'PUT') x.members.push({ user_id: uid, name: who(uid).name });
      else x.members = x.members.filter((y) => y.user_id !== uid);
      return {};
    }
    if (method === 'PATCH') { Object.assign(x, body); return {}; }
    return { project: { ...x, can_edit: true }, days: feed(x) };
  }
  throw 404;
}

const real = window.fetch.bind(window);
window.fetch = async (input, init = {}) => {
  const url = typeof input === 'string' ? input : input.url;
  if (!/\/api\//.test(url)) return real(input, init);
  const method = (init.method || 'GET').toUpperCase();
  await new Promise((r) => setTimeout(r, 120));
  try {
    const data = route(method, url, init.body ? JSON.parse(init.body) : undefined);
    return new Response(JSON.stringify(data), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (status) {
    return new Response(JSON.stringify({ error: status === 409 ? 'taken' : 'Not in the demo' }), { status: typeof status === 'number' ? status : 500 });
  }
};
