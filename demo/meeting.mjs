// Makes public/demo/app/meeting.html, the sample summary the website's Nikxel
// window opens: the head (styles) and tail (task ticks, Share, the edit bar) of
// a real Nikxel meeting page around a made-up meeting. The page's local token
// and server are swapped out; its calls get a demo answer instead.
// Run once with: node demo/meeting.mjs <a real ~/Documents/nikxel/meetings/*.html>
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const src = process.argv[2];
if (!src) throw new Error("pass a real meeting page");
const real = fs.readFileSync(src, "utf8");
let head = real.slice(0, real.indexOf("<body"));
let tail = real.slice(real.indexOf("</main>"));
head = head.replace(/<title>[\s\S]*?<\/title>/, "<title>Meeting — Design sync</title>");
tail = tail.replace(/var T = "[^"]*", P = "[^"]*"/, 'var T = "demo", P = "https://demo.nikxel/"');
if (/var T = "(?!demo")/.test(tail) || tail.includes("127.0.0.1")) throw new Error("the page's token or server is still in it");

const av = (cls, name) => `<span class="chip who"><span class="av ${cls} sm" aria-hidden="true">${name[0]}</span>${name}</span>`;
const task = (i, text, who, due) =>
  `<li class="task"><input type="checkbox" id="task-${i}">\n<label for="task-${i}"><span class="t">${text}</span><span class="chips">${who}<span class="chip${due ? "" : " unset"}">Due ${due || "Not specified"}</span></span></label></li>`;
const person = (cls, name, role, lines) =>
  `<article class="person"><div class="ph"><span class="av ${cls}" aria-hidden="true">${name[0]}</span><div><p class="pn">${name}</p><p class="pr">${role}</p></div></div>\n<div class="pb"><ul>${lines.map((l) => `<li>${l}</li>`).join("")}</ul></div></article>`;

const body = `<body>
<main>
<header class="hero">
<p class="eyebrow"><span>Minutes of meeting</span><span class="when">Today · 11:00 AM</span></p>
<p class="scribble" aria-hidden="true">in short</p><h1>Onboarding ships Friday, without the video tour; Mei owns the copy.</h1>
<div class="summary"><p>Sam showed the new five-screen onboarding on staging. Everyone liked the practice tour at the end; the video tour is cut for now because it isn’t ready and would push the date. Mei takes over the copy, and Priya wants the pricing page checked against the new plans before anything goes out.</p></div>
</header>

<div class="client-cta"><button type="button" class="nx-project">Share to project →</button>
<p>Send these minutes to a project on your team dashboard, so everyone on it can read them.</p></div>
<nav class="glance"><a href="#action-items"><b>3</b> Action Items</a><a href="#decisions"><b>2</b> Decisions</a><a href="#blockers-risks"><b>1</b> Blockers &amp; Risks</a><a href="#open-questions"><b>2</b> Open Questions</a><a href="#speakers">People</a></nav>
<section id="action-items" class="sec">
<h2>Action Items <span class="n">3</span></h2>
<ul class="tasks">
${task(1, "Finish the onboarding copy for all five screens", av("t1", "Mei"), "Thursday")}
${task(2, "Check the pricing page against the new plans", av("t2", "Priya"), "Wednesday")}
${task(3, "Write the release note for onboarding", av("t4", "Sam (Me)"), "Friday")}
</ul>
</section>
<section id="decisions" class="sec">
<h2>Decisions <span class="n">2</span></h2>
<ul class="decisions"><li>Ship the new onboarding on <b>Friday</b>.</li><li><b>No video tour</b> in this release; the practice tour stays.</li></ul>
</section>
<section id="blockers-risks" class="sec">
<h2>Blockers &amp; Risks <span class="n">1</span></h2>
<div class="risks"><div class="risk"><span class="mark" aria-hidden="true">!</span><p><b>Pricing page is out of date</b> — it still shows last year’s plans; shipping onboarding before it’s fixed sends new people to the wrong prices.</p></div></div>
</section>
<section id="open-questions" class="sec">
<h2>Open Questions <span class="n">2</span></h2>
<div class="questions"><div class="q"><span class="mark" aria-hidden="true">?</span><p>Does the practice tour need a skip button on the first screen?</p></div><div class="q"><span class="mark" aria-hidden="true">?</span><p>When does the video tour come back: next release or the one after?</p></div></div>
</section>
<section id="speakers" class="sec">
<h2>People</h2>
<div class="people">${person("t4", "Sam (Me)", "Ran the demo and took the release note.", ["Showed the five screens on staging", "Proposed cutting the video tour to keep Friday"])}${person("t1", "Mei", "Owns the onboarding copy.", ["Will rewrite the copy by Thursday", "Asked for a skip button on the tour"])}${person("t2", "Priya", "Checks pricing before launch.", ["Flagged the old prices on the pricing page"])}</div>
</section>
`;

// The page's calls to Nikxel get an answer that says what the real app does.
const stub = `<script>(function () {
  var real = window.fetch;
  var say = { chats: "In Nikxel, your WhatsApp chats show up here to send this to.", edit: "In Nikxel, the page rewrites itself here. This is a demo.", mic: "In Nikxel, you can say the change instead." };
  window.fetch = function (u, o) {
    if (String(u).indexOf("https://demo.nikxel/") !== 0) return real.apply(this, arguments);
    var route = String(u).slice(20).split("?")[0];
    return Promise.resolve(new Response(JSON.stringify({ error: say[route] || "That works in the Nikxel app. This is a demo." }), { headers: { "content-type": "application/json" } }));
  };
})();</script>`;

const out = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "demo", "app", "meeting.html");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, head.replace(/<head>/i, "<head>" + stub) + body + tail);
console.log("✓", path.relative(process.cwd(), out));
