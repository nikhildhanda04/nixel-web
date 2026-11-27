// import Link from "next/link"; // back with the download button
import { Nav } from "@/components/Nav";
import { Playground } from "@/components/Playground";
import { Reveal } from "@/components/Reveal";
import { Footer } from "@/components/Footer";
import { REPO } from "@/lib/links";
import { Sprite, type Mood } from "@/components/Sprite";
import { Story } from "@/components/Story";
import { AdminDemo, AppDemo, MeetingDesk } from "@/components/Showcase";

const SHEET: { mood: Mood; label: string; when: string; c: string }[] = [
  { mood: "idle", label: "Idle", when: "Just hanging out", c: "var(--butter)" },
  { mood: "typing", label: "Typing", when: "Keeps pace with your keys", c: "var(--mint)" },
  { mood: "thinking", label: "Thinking", when: "Your agent is working", c: "var(--sky)" },
  { mood: "done", label: "Done", when: "Your agent finished", c: "var(--lilac)" },
  { mood: "dragging", label: "Dragged", when: "Wheee", c: "var(--peach)" },
  { mood: "pounce", label: "Pounce", when: "You scrolled too fast", c: "var(--blush)" },
  { mood: "petted", label: "Petted", when: "Click it. It likes that", c: "var(--butter)" },
  { mood: "alert", label: "Alert", when: "Something's due", c: "var(--mint)" },
  { mood: "recording", label: "Recording", when: "In a meeting", c: "var(--sky)" },
  { mood: "momReady", label: "MOM ready", when: "Minutes are written", c: "var(--lilac)" },
];

const USES: { who: string; moment: string; does: string; c: string }[] = [
  { who: "Founders", moment: "Back-to-back client and investor calls", does: "Minutes for each, with every decision and number, pushed to the right project before the next call starts.", c: "var(--butter)" },
  { who: "Project managers", moment: "The weekly status meeting", does: "Every action item gets an owner and a date, lands in your ERP, and overdue ones get a nudge at 9.", c: "var(--mint)" },
  { who: "Client teams", moment: "After every client call", does: "The follow-up email is drafted and a clean recap page is ready to send. You check it and hit send.", c: "var(--sky)" },
  { who: "Operations", moment: "Every client meeting needs an SOP", does: "Drop your SOP format in once. After each client call it writes one in that format and skips internal calls.", c: "var(--lilac)" },
  { who: "Developers", moment: "Planning calls and long coding days", does: "Each engineering task becomes a ready-to-paste prompt for your agent; the day summary names what you actually shipped.", c: "var(--peach)" },
  { who: "Team leads", moment: "Running more than one company", does: "Several organizations switched like Slack workspaces, each with its own people, custom roles and projects.", c: "var(--blush)" },
];

const TEAM: [string, string][] = [
  ["Push to dashboard", "Nikxel guesses which project a meeting is from. Wrong? Pick another from the dropdown."],
  ["Your day, your call", "Every night it writes up your day. Cross out anything private, then send."],
  ["Several organizations", "Switch between them from the sidebar, like Slack. Start or join one with a link."],
  ["Custom roles", "The owner decides who can invite, see every project or read teammates’ days."],
];

const INTEGRATIONS: [string, string][] = [
  ["Zoom, Meet, Teams, WhatsApp, Slack", "Calls are spotted on their own so Nikxel can offer to record."],
  ["Google Calendar", "A heads-up before each event; follow-ups become events with a Meet link."],
  ["Gmail", "Search, draft replies and tidy up from chat. Sends only when you say so."],
  ["WhatsApp", "Replies or drafts for you, schedules calls, and adds your chats to your day."],
  ["Any ERP (Odoo and more)", "Reads your open tasks, creates new ones with assignee and deadline, imports projects."],
  ["Google Tasks and Apple Reminders", "Action items filed as tasks; reminders pop up over Nikxel’s head."],
  ["Claude Code, Codex, OpenCode, Antigravity", "Your agent writes the minutes; Nikxel thinks while it works and cheers when it’s done."],
  ["Git", "Today’s commits across your repos, in your day summary."],
  ["Google Gemini", "Draws your own pixel avatar from a selfie."],
];

function Head({ tag, title, sub }: { tag: string; title: React.ReactNode; sub?: string }) {
  return (
    <Reveal className="text-center">
      <p className="tag">{tag}</p>
      <h2 className="display text-[clamp(34px,4.4vw,64px)]">{title}</h2>
      {sub && <p className="sub mx-auto mt-4">{sub}</p>}
    </Reveal>
  );
}

export default function Home() {
  return (
    <>
      <Nav />

      <main>
        <Story />

        {/* AVATAR CHAT */}
        <section id="chat" className="py-24 md:py-32">
          <div className="wrap">
            <Head
              tag="/* click it */"
              title={
                <>
                  Click it. <span className="bub">Ask</span> anything.
                </>
              }
              sub="Mid-call, click Nikxel and ask. It answers from your last two weeks of meetings, days, WhatsApp, Gmail, ERP tasks and any file you drop in. It drafts what you need and never sends without you."
            />
            <Reveal delay={0.1} y={48} className="mt-14">
              <MeetingDesk />
            </Reveal>
          </div>
        </section>

        {/* USE CASES */}
        <section id="uses" className="py-24 md:py-32">
          <div className="wrap">
            <Head tag="/* who it's for */" title={<>Made for people who live in <span className="bub">calls</span>.</>} sub="Founders, project managers, client teams, developers. Anyone who loses the details between meetings." />
            <Reveal delay={0.1} className="mt-14 grid gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
              {USES.map((u) => (
                <div key={u.who} className="tile grid content-start gap-2 p-6" style={{ ["--c" as string]: u.c }}>
                  <p className="label text-pink-deep">{u.who}</p>
                  <b className="text-[19px] leading-tight">{u.moment}</b>
                  <p className="text-[15px] font-medium leading-snug text-muted">{u.does}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* THE NIKXEL APP */}
        <section id="app" className="py-24 md:py-32">
          <div className="wrap">
            <Head
              tag="/* one window for all of it */"
              title={
                <>
                  The <span className="bub">Nikxel</span> app.
                </>
              }
              sub="Your day, every summary, your tasks and every setting in one window. This is the real app with a made-up week. Click around."
            />
            <Reveal delay={0.1} y={48} className="mt-14">
              <AppDemo />
            </Reveal>
            <Reveal delay={0.1} className="mt-10">
              <ul className="mx-auto grid max-w-[980px] gap-4 text-[15.5px] font-medium text-muted sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Library", "Meetings, notes, days and weeks open in a tab. Push any of them to your team."],
                  ["Edit by asking", "Type a change at the bottom of any summary. Undo if you don’t like it."],
                  ["Tasks and people", "Every action item, who owes what, ticked once everywhere."],
                  ["Automations", "“After every client call, write the SOP in my format.” It does, every time."],
                ].map(([t, b]) => (
                  <li key={t}>
                    <b className="block text-[16px] text-ink">{t}</b>
                    {b}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* TEAM */}
        <section id="team" className="py-24 md:py-32">
          <div className="wrap">
            <Head
              tag="/* for teams */"
              title={
                <>
                  Your whole <span className="bub">team</span>, in sync.
                </>
              }
              sub="Push a meeting to its project in one click, send your day item by item, and see everyone’s work by person and by project. This is the real dashboard, with a sample team."
            />
            <Reveal delay={0.1} y={48} className="mt-14">
              <AdminDemo />
            </Reveal>
            <Reveal delay={0.1} className="mt-10">
              <ul className="mx-auto grid max-w-[980px] gap-4 text-[15.5px] font-medium text-muted sm:grid-cols-2 lg:grid-cols-4">
                {TEAM.map(([t, b]) => (
                  <li key={t}>
                    <b className="block text-[16px] text-ink">{t}</b>
                    {b}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* INTEGRATIONS + PRIVACY */}
        <section id="integrations" className="py-24 md:py-32">
          <div className="wrap">
            <Head tag="/* plugs into your day */" title={<>Works with what you <span className="bub">already</span> use.</>} sub="Every connection is optional. Turn on the ones you live in." />
            <Reveal delay={0.1} className="mt-14">
              <ul className="mx-auto grid max-w-[1040px] gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {INTEGRATIONS.map(([n, d]) => (
                  <li key={n} className="sticker p-5">
                    <b className="block text-[16px]">{n}</b>
                    <span className="text-[14.5px] font-medium leading-snug text-muted">{d}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.1} className="mt-16">
              <div className="sticker mx-auto grid max-w-[980px] gap-8 p-7 md:grid-cols-[1fr_1.3fr] md:p-10">
                <div>
                  <p className="tag">{"/* private by default */"}</p>
                  <h3 className="display text-[clamp(28px,3.2vw,44px)]">
                    Your calls stay on <span className="bub">your</span> computer.
                  </h3>
                </div>
                <ul className="grid gap-3 text-[16px] font-medium text-muted">
                  <li><b className="text-ink">Recorded and transcribed locally.</b> Audio and transcripts never leave your machine.</li>
                  <li><b className="text-ink">Your own AI agent.</b> Claude Code, Codex, OpenCode or Antigravity writes everything, on your account.</li>
                  <li><b className="text-ink">Nothing goes out until you click.</b> You pick what your team sees, and can unshare it any time.</li>
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        {/* PLAYGROUND */}
        <section id="play" className="py-24 md:py-32">
          <div className="wrap">
            <Head
              tag="/* poke it */"
              title={
                <>
                  Go on, <span className="bub">pet it</span>.
                </>
              }
              sub="The real sprite sheet, running the same moods as the app. Type, drag it, start a meeting."
            />
            <Reveal delay={0.1} y={48} className="mt-14">
              <Playground />
            </Reveal>
          </div>
        </section>

        {/* MOODS */}
        <section id="moods" className="py-24 md:py-32">
          <div className="wrap">
            <Head tag="/* ten moods, forty frames */" title="It always looks how you feel." sub="Each mood is four hand-drawn frames. It picks one from whatever's going on." />
            <div className="mt-14 flex flex-wrap justify-center gap-[18px]">
              {SHEET.map((s) => (
                <div key={s.mood} className="tile grid w-[200px] justify-items-center gap-1 px-4 pb-5 pt-4 text-center" style={{ ["--c" as string]: s.c }}>
                  <Sprite mood={s.mood} size={128} />
                  <b className="text-[18px] font-bold">{s.label}</b>
                  <small className="text-[14px] font-medium text-muted">{s.when}</small>
                </div>
              ))}
            </div>

            <Reveal delay={0.1} className="mt-20">
              <div className="sticker mx-auto grid max-w-[980px] items-center gap-8 p-7 md:grid-cols-[1fr_auto] md:p-10">
                <div>
                  <p className="tag">{"/* make it yours */"}</p>
                  <h3 className="display text-[clamp(28px,3.2vw,44px)]">
                    Make it look like <span className="bub">you</span>.
                  </h3>
                  <p className="mt-4 max-w-[52ch] text-[17px] font-medium text-muted">
                    Copy the prompt from the setup window, give Gemini a selfie, drop the PNG back in.
                    Nikxel strips the background and cuts the frames.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[14px] font-bold">
                  {[
                    ["Selfie", "var(--butter)"],
                    ["Gemini", "var(--sky)"],
                    ["You ✦", "var(--pink)"],
                  ].map(([s, c], i) => (
                    <span key={s} className="flex items-center gap-3">
                      <span className="rounded-full px-4 py-2.5" style={{ background: c, rotate: `${[-3, 2, -2][i]}deg` }}>
                        {s}
                      </span>
                      {i < 2 && <span aria-hidden className="text-muted">→</span>}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* SETUP TEASER: off until the exe/dmg download flow replaces it
        <section id="setup" className="py-24 md:py-32">
          <div className="wrap">
            <Reveal>
              <div className="sticker mx-auto grid max-w-[980px] items-center gap-8 p-7 md:grid-cols-[1fr_auto] md:p-12">
                <div>
                  <p className="tag">{"about ten minutes"}</p>
                  <h2 className="display text-[clamp(30px,3.6vw,52px)]">
                    Mac, Windows or <span className="bub">Linux</span>.
                  </h2>
                  <p className="mt-4 max-w-[48ch] text-[17px] font-medium text-muted">
                    Clone, build, say hi. On a Mac it&apos;s seven commands; on Windows and Linux one script does it all. Then a guided first run shows you around.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link href="/setup" className="pill dark">
                      Open the setup guide →
                    </Link>
                  </div>
                </div>
                <div className="term hidden w-[300px] md:block" aria-hidden>
                  <div className="tbar">
                    <i />
                    <i />
                    <i />
                    <span>Terminal</span>
                  </div>
                  <pre className="tbody !min-h-0 !text-[13px]">
                    <div>
                      <span className="pr">~ %</span> git clone …/nikxel
                    </div>
                    <div>
                      <span className="pr">~ %</span> ./build.sh
                    </div>
                    <div className="ok">✓ Built Nikxel.app</div>
                    <div>
                      <span className="pr">~ %</span> open Nikxel.app<span className="cur" />
                    </div>
                  </pre>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
        */}

        {/* CLOSE */}
        <section className="pb-28 pt-16">
          <div className="wrap">
            <Reveal>
              <div className="sticker relative mx-auto grid max-w-[980px] justify-items-center overflow-hidden px-6 pb-14 pt-10 text-center">
                <div className="hopper">
                  <Sprite mood="done" size={192} />
                </div>
                <h2 className="display mt-2 text-[clamp(40px,5.4vw,76px)]">
                  Say hi to <span className="bub">Nikxel</span>.
                </h2>
                <p className="sub mx-auto mt-4">Your meetings written up, your day summed up, your team kept in the loop. Free, open source, on macOS, Windows and Linux.</p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  {/* <Link href="/setup" className="pill dark">
                    Set it up
                  </Link> */}
                  <a href={REPO} target="_blank" rel="noreferrer" className="pill">
                    View on GitHub ↗
                  </a>
                  <a href="mailto:hi@nikxel.ai" className="pill">
                    hi@nikxel.ai
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
