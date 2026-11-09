"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Sprite, type Mood } from "./Sprite";

/**
 * The scroll story at the top of the page. Three tall sections each pin a
 * full-screen stage and drive it from how far you've scrolled through them:
 * the hero window rises and settles, the day's bits orbit Nikxel, and the
 * feature shelf slides sideways. Phones and reduced motion get a still layout.
 */
export function Story() {
  const root = useRef<HTMLDivElement>(null);
  const core = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current!;
    const $ = <T extends HTMLElement>(s: string) => el.querySelector<T>(s)!;
    const $$ = (s: string) => Array.from(el.querySelectorAll<HTMLElement>(s));
    const hero = $(".hero"), win = $(".hero-win"), copy = $(".hero-copy"), floats = $$(".hero-win .float");
    const orbit = $(".orbit"), cards = $$(".ob"), line = $(".orbit-line");
    const forms = $(".forms"), shelf = $(".shelf");
    const rings = [cards.filter((c) => c.dataset.ring === "0"), cards.filter((c) => c.dataset.ring === "1")];
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phone = matchMedia("(max-width: 900px)");

    // 0 at the section's top, 1 when its pinned stage is about to leave
    const prog = (s: HTMLElement) => {
      const r = s.getBoundingClientRect();
      return clamp(-r.top / (r.height - innerHeight));
    };

    // Cursor play: orbit cards drift away from the mouse; the one under it lifts and tilts.
    const mouse = { x: -9999, y: -9999 };
    const springs = new Map<HTMLElement, { x: number; y: number; r: number; s: number; vx: number; vy: number }>();
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") Object.assign(mouse, { x: e.clientX, y: e.clientY });
    };
    const onLeave = () => Object.assign(mouse, { x: -9999, y: -9999 });
    addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    const nudge = (c: HTMLElement) => {
      let sp = springs.get(c);
      if (!sp) springs.set(c, (sp = { x: 0, y: 0, r: 0, s: 1, vx: 0, vy: 0 }));
      if (calm) return sp;
      const b = c.getBoundingClientRect();
      const cx = b.left + b.width / 2 - sp.x, cy = b.top + b.height / 2 - sp.y;
      const dx = cx - mouse.x, dy = cy - mouse.y, d = Math.hypot(dx, dy);
      const over = mouse.x > b.left && mouse.x < b.right && mouse.y > b.top && mouse.y < b.bottom;
      const push = d < 230 ? (1 - d / 230) ** 2 * 46 : 0;
      const tx = d ? (dx / d) * push : 0, ty = d ? (dy / d) * push : 0;
      sp.vx = (sp.vx + (tx - sp.x) * 0.09) * 0.8;
      sp.vy = (sp.vy + (ty - sp.y) * 0.09) * 0.8;
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.r += ((over ? ((mouse.x - (b.left + b.width / 2)) / b.width) * -8 : 0) - sp.r) * 0.12;
      sp.s += ((over ? 1.07 : 1) - sp.s) * 0.14;
      c.style.zIndex = over ? "3" : "";
      return sp;
    };

    const hop = (n: HTMLElement | null) => {
      if (!n || calm) return;
      n.classList.remove("hop");
      void n.offsetWidth;
      n.classList.add("hop");
    };

    let raf = 0, lastHop = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const vh = innerHeight, vw = innerWidth;
      if (phone.matches) {
        [win, copy, shelf, line, ...floats, ...cards].forEach((n) => {
          n.style.transform = "";
          n.style.opacity = "";
        });
        return;
      }
      // 1 · the window rises and straightens; the copy lifts away; the notes drift out
      const p = calm ? 1 : ease(prog(hero));
      win.style.transform = `translateY(${lerp(-vh * 0.3, -vh * 0.9, p)}px) scale(${lerp(0.82, 1, p)}) rotate(${lerp(2.5, 0, p)}deg)`;
      copy.style.opacity = String(1 - clamp(p * 1.8));
      copy.style.transform = `translateY(${-p * 140}px) scale(${1 - p * 0.06})`;
      floats.forEach((f, i) => {
        const [dx, dy] = DRIFT[i] ?? [0, 0];
        f.style.transform = `translate(${dx * p * vw * 0.08}px, ${dy * p * vh * 0.1}px)`;
      });

      // 2 · two rings turn opposite ways and pull in close as you scroll
      const q = calm ? 0.5 : prog(orbit);
      const R = Math.min(vw, vh), rad = lerp(R * 0.7, R * 0.5, ease(q)), turn = q * 140;
      rings.forEach((ring, r) =>
        ring.forEach((c, i) => {
          const a = ((i * 360) / ring.length + (r ? -turn * 0.8 + 18 : turn)) * (Math.PI / 180);
          const k = r ? 0.58 : 1;
          const x = Math.cos(a) * rad * k * 1.55, y = Math.sin(a) * rad * k * (r ? 0.78 : 0.8);
          const o = nudge(c), base = lerp(0.8, r ? 0.92 : 1, ease(q));
          c.style.transform = `translate(calc(-50% + ${x + o.x}px), calc(-50% + ${y + o.y}px)) rotate(${Math.sin(a * 2 + i) * 7 + o.r}deg) scale(${base * o.s})`;
        }),
      );
      line.style.opacity = String(clamp(q * 4) * (1 - clamp((q - 0.82) * 6)));
      line.style.transform = `translateY(${(1 - clamp(q * 3)) * 30}px)`;
      if (q > 0 && q < 1 && performance.now() - lastHop > 1400) {
        hop(core.current);
        lastHop = performance.now();
      }

      // 3 · the shelf slides left as you scroll down
      const s = ease(prog(forms)), max = Math.max(0, shelf.scrollWidth - vw);
      shelf.style.transform = `translateX(${-s * max}px)`;
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={root}>
      {/* 1 · HERO */}
      <section id="top" className="hero">
        <div className="hero-sticky">
          <div className="hero-copy">
            <div className="enter mx-auto mb-3 w-fit">
              <div className="hopper">
                <Sprite mood="idle" size={128} />
              </div>
            </div>
            <h1 className="display enter text-[clamp(46px,6vw,92px)] !leading-[.98] !tracking-[-0.05em]" style={{ ["--d" as string]: ".08s" }}>
              A tiny pixel <span className="bub">you</span>
              <br />
              on your Mac.
            </h1>
            <p className="enter mx-auto mb-7 mt-6 max-w-[46ch] text-[clamp(17px,1.5vw,20px)] font-medium leading-normal text-muted" style={{ ["--d" as string]: ".16s" }}>
              Nikxel lives on your desktop. It reacts while you type, records your meetings,
              writes the minutes and nudges you before the next one.
            </p>
            <div className="enter flex flex-wrap justify-center gap-3" style={{ ["--d" as string]: ".24s" }}>
              <Link href="/setup" className="pill dark">
                Set it up free
              </Link>
              <a href="#play" className="pill">
                Play with it ↓
              </a>
            </div>
            <p className="enter mt-[18px] text-[14px] font-medium text-muted" style={{ ["--d" as string]: ".3s" }}>
              Free and open source · <b className="text-ink">10 moods</b> · macOS 15+ on Apple Silicon
            </p>
          </div>

          <div className="hero-win">
            <div className="window">
              <div className="bar">
                <i />
                <i />
                <i />
                <span>Desktop</span>
              </div>
              <HeroDesk />
            </div>
            <div className="float f1">
              <Note fill="var(--butter)" title="Design sync">
                starts in 5 min · Google Meet
              </Note>
            </div>
            <div className="float f2">
              <Note fill="var(--mint)">
                <span className="hand text-[22px] leading-none text-ink">replied for you ✦</span>
              </Note>
            </div>
            <div className="float f3">
              <Doc title="Minutes · Design sync" lines={["Ship onboarding Friday", "Sam owns the copy"]} />
            </div>
            <div className="float f4">
              <Todo title="Today" items={[["Standup", true], ["Send the invoice", false], ["Review PR #42", false]]} />
            </div>
          </div>
        </div>
      </section>

      {/* 2 · ORBIT */}
      <section className="orbit" aria-label="Everything Nikxel keeps track of">
        <div className="orbit-sticky">
          <p className="orbit-line">
            Your whole day, all over the place.
            <br />
            <span>Nikxel keeps an eye on it.</span>
          </p>
          <div className="orbit-ring">
            {ORBIT.map((o, i) => (
              <div key={i} className="ob" data-ring={o.ring}>
                {o.node}
              </div>
            ))}
          </div>
          <div ref={core} className="orbit-core">
            <Sprite mood="petted" size={256} />
          </div>
        </div>
      </section>

      {/* 3 · FEATURES SHELF */}
      <section id="features" className="forms">
        <div className="forms-sticky">
          <div className="wrap">
            <p className="tag">{"/* cute, also useful */"}</p>
            <h2 className="display text-[clamp(34px,4.4vw,64px)]">Everything it does for you.</h2>
          </div>
          <div className="shelf">
            {FEATURES.map((f) => (
              <article key={f.title} className="kind">
                <div className="demo" style={{ ["--bg" as string]: f.bg }}>
                  {f.demo}
                </div>
                <b>{f.title}</b>
                <small>{f.body}</small>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- the little desktop inside the hero window ---------- */

const SCENES: { mood: Mood; say: string; dot: string }[] = [
  { mood: "typing", say: "You're on a roll. 82 wpm!", dot: "var(--pink)" },
  { mood: "alert", say: "Design sync starts in 5 min", dot: "var(--sky-d)" },
  { mood: "recording", say: "Listening… 12:04", dot: "#ff6158" },
  { mood: "momReady", say: "Minutes saved to Meetings/", dot: "var(--mint-d)" },
  { mood: "thinking", say: "Claude Code is working…", dot: "var(--lilac-d)" },
  { mood: "done", say: "Done! Tests pass ✦", dot: "var(--butter-d)" },
];

function HeroDesk() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((v) => (v + 1) % SCENES.length), 2600);
    return () => clearInterval(id);
  }, []);
  const s = SCENES[i];
  return (
    <div
      className="relative aspect-[16/10] w-full overflow-hidden bg-[#f8fbf7]"
      style={{ backgroundImage: "radial-gradient(var(--dot) 1.4px, transparent 1.6px)", backgroundSize: "22px 22px" }}
    >
      {/* an editor window to give the desktop something to do */}
      <div className="absolute left-[6%] top-[9%] w-[44%] overflow-hidden rounded-2xl bg-white shadow-[0_20px_44px_rgba(40,80,55,.12),inset_0_0_0_1px_#e1eee0]">
        <div className="flex items-center gap-1.5 border-b border-line bg-[#eff5ee] px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff6158]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="label ml-2 text-muted">notes.md</span>
        </div>
        <div className="grid gap-2 p-[6%]">
          {[92, 74, 86, 40, 66].map((w, k) => (
            <span key={k} className="h-2.5 rounded-full bg-[#e3ede2]" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
      <div className="absolute bottom-[12%] left-[12%] hidden -rotate-2 md:block">
        <Term lines={["$ claude", "› tidy up the settings screen", "  editing 3 files…", "✓ done in 1m 52s"]} />
      </div>
      <div className="absolute bottom-[8%] right-[10%] flex flex-col items-center">
        <div
          key={i}
          className="enter mb-2 flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-4 py-2.5 text-[clamp(11px,1.2vw,15px)] font-bold shadow-[0_12px_26px_rgba(40,80,55,.14)]"
        >
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.dot }} />
          {s.say}
        </div>
        <Sprite mood={s.mood} size={128} className="lg:hidden" />
        <Sprite mood={s.mood} size={192} className="hidden lg:block" />
        <div className="-mt-3 h-4 w-1/2 rounded-[50%] bg-black/10 blur-md" />
      </div>
    </div>
  );
}

/* ---------- board cards ---------- */

function Frame({ fill, className, style, children }: { fill?: string; className?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <div className={`mcard ${className ?? ""}`} style={{ ["--fill" as string]: fill, ...style }}>
      <i className="fr" />
      {children}
    </div>
  );
}

function Note({ fill = "#fff", title, children, w }: { fill?: string; title?: string; children: ReactNode; w?: number }) {
  return (
    <Frame fill={fill} className="note" style={w ? { width: w } : undefined}>
      {title && <b>{title}</b>}
      {children}
    </Frame>
  );
}

function Doc({ title, lines }: { title: string; lines: string[] }) {
  return (
    <Frame className="w-[200px] p-4">
      <div className="flex items-center gap-2 text-[13px] font-bold text-ink">
        <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 2.5h6.5L15.5 6.5v11h-10.5zM11.5 2.5v4h4M8 10.5h5M8 13.5h4" />
        </svg>
        {title}
      </div>
      <ul className="mt-2 grid gap-1 text-[12.5px] leading-snug">
        {lines.map((l) => (
          <li key={l} className="flex gap-1.5">
            <span className="text-pink-deep">•</span>
            {l}
          </li>
        ))}
      </ul>
    </Frame>
  );
}

function Todo({ title, items }: { title: string; items: [string, boolean][] }) {
  return (
    <Frame className="w-[190px] p-4">
      <div className="hand text-[24px] leading-none text-ink">{title}</div>
      <ul className="mt-2 grid gap-1.5 text-[13px]">
        {items.map(([t, done]) => (
          <li key={t} className={`flex items-center gap-2 ${done ? "text-muted line-through" : ""}`}>
            <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-[5px] text-[10px] text-white ${done ? "bg-pink-deep" : "shadow-[inset_0_0_0_1.5px_#c5d8c6]"}`}>
              {done ? "✓" : ""}
            </span>
            {t}
          </li>
        ))}
      </ul>
    </Frame>
  );
}

function Chat({ from, msg, reply }: { from: string; msg: string; reply?: string }) {
  return (
    <Frame className="grid w-[210px] gap-2 p-3.5 text-[12.5px] leading-snug">
      <div className="flex items-center gap-2 text-[12px] font-bold text-ink">
        <span className="h-2.5 w-2.5 rounded-full bg-[#25d366]" />
        {from}
      </div>
      <span className="w-fit max-w-[90%] rounded-2xl rounded-tl-md bg-[#edf3ec] px-3 py-1.5">{msg}</span>
      {reply && <span className="ml-auto w-fit max-w-[90%] rounded-2xl rounded-tr-md bg-mint px-3 py-1.5">{reply}</span>}
    </Frame>
  );
}

function Rec({ label, time }: { label: string; time: string }) {
  return (
    <Frame className="w-[200px] p-3.5">
      <div className="flex items-center justify-between text-[12px] font-bold text-ink">
        <span className="flex items-center gap-1.5">
          <span className="rec-dot h-2 w-2 rounded-full bg-[#ff6158]" />
          {label}
        </span>
        <span className="label text-muted">{time}</span>
      </div>
      <div className="wave mt-3 flex h-8 items-center gap-[3px]">
        {Array.from({ length: 26 }, (_, k) => (
          <i key={k} style={{ height: `${30 + ((k * 37) % 70)}%`, animationDelay: `${(k % 7) * -0.13}s` }} />
        ))}
      </div>
    </Frame>
  );
}

function Term({ lines }: { lines: string[] }) {
  return (
    <div className="w-[230px] overflow-hidden rounded-2xl bg-ink p-3.5 font-mono text-[11.5px] leading-relaxed text-[#e2ece4] shadow-[0_14px_34px_rgba(30,45,35,.28)]">
      {lines.map((l, k) => (
        <div key={k} className={k === lines.length - 1 ? "text-mint-d" : ""}>
          {l}
        </div>
      ))}
    </div>
  );
}

function Stamp({ mood, size = 64 }: { mood: Mood; size?: number }) {
  return (
    <div className="drop-shadow-[0_10px_18px_rgba(40,80,55,.18)]">
      <Sprite mood={mood} size={size} />
    </div>
  );
}

function Chip({ children, bg = "#fff" }: { children: ReactNode; bg?: string }) {
  return (
    <span className="block whitespace-nowrap rounded-full px-4 py-2.5 text-[14px] font-bold text-ink shadow-[0_12px_26px_rgba(40,80,55,.14)]" style={{ background: bg }}>
      {children}
    </span>
  );
}

const ORBIT: { ring: 0 | 1; node: ReactNode }[] = [
  { ring: 0, node: <Note fill="var(--butter)" title="Design sync">starts in 5 min · Google Meet</Note> },
  { ring: 0, node: <Rec label="Recording" time="12:04" /> },
  { ring: 0, node: <Chat from="Mom" msg="call me when you're free" reply="In a meeting, back at 4 ✦" /> },
  { ring: 0, node: <Stamp mood="done" /> },
  { ring: 0, node: <Term lines={["$ claude", "› refactor the auth flow", "  editing 4 files…", "✓ done in 2m 14s"]} /> },
  { ring: 0, node: <Todo title="Today" items={[["Standup", true], ["Send the invoice", false], ["Review PR #42", false]]} /> },
  { ring: 0, node: <Doc title="Minutes · Design sync" lines={["Ship onboarding Friday", "Sam owns the copy", "Next sync: Tue"]} /> },
  { ring: 0, node: <Stamp mood="alert" /> },
  { ring: 0, node: <Note fill="var(--lilac)" title="Your day">3h 20m coding · 2 meetings · 41 messages</Note> },
  { ring: 0, node: <Chip bg="var(--blush)">⌨ 82 wpm</Chip> },
  { ring: 0, node: <Note fill="var(--mint)"><span className="hand text-[22px] leading-none text-ink">nice work today ✦</span></Note> },
  { ring: 1, node: <Note fill="var(--blush)" w={150}>send the invoice · due today</Note> },
  { ring: 1, node: <Stamp mood="typing" /> },
  { ring: 1, node: <Chip>Hindi + Hinglish ✓</Chip> },
  { ring: 1, node: <Note fill="var(--sky)" w={150}>“what did we decide about pricing?”</Note> },
  { ring: 1, node: <Stamp mood="thinking" /> },
  { ring: 1, node: <span className="hand block -rotate-6 text-[44px] leading-none text-ink">Nikxel ✦</span> },
  { ring: 1, node: <Chip bg="var(--butter)">10 pm · day summary</Chip> },
  { ring: 1, node: <Stamp mood="recording" /> },
];

const FEATURES: { title: string; body: string; bg: string; demo: ReactNode }[] = [
  {
    title: "Records meetings",
    body: "Double-click it. It listens and transcribes on your Mac, per speaker.",
    bg: "var(--blush)",
    demo: (
      <div className="grid justify-items-center">
        <Rec label="Design sync" time="24:18" />
        <Sprite mood="recording" size={128} />
      </div>
    ),
  },
  {
    title: "Writes the minutes",
    body: "Your coding agent turns the transcript into minutes of the meeting (MOM).",
    bg: "var(--butter)",
    demo: (
      <div className="grid justify-items-center">
        <div className="rotate-[-3deg]">
          <Doc title="Minutes · Design sync" lines={["Ship onboarding Friday", "Sam owns the copy", "Next sync: Tue"]} />
        </div>
        <Sprite mood="momReady" size={128} />
      </div>
    ),
  },
  {
    title: "Answers WhatsApp",
    body: "Replies for you while you're stuck in a call.",
    bg: "var(--mint)",
    demo: (
      <div className="grid justify-items-center">
        <div className="rotate-2">
          <Chat from="Mom" msg="call me when you're free" reply="In a meeting, back at 4 ✦" />
        </div>
        <Sprite mood="typing" size={128} />
      </div>
    ),
  },
  {
    title: "Keeps you on time",
    body: "Google Calendar and Apple Reminders pop up over its head.",
    bg: "var(--sky)",
    demo: (
      <div className="grid justify-items-center gap-2">
        <Chip>📅 Design sync · in 5 min</Chip>
        <Sprite mood="alert" size={128} />
      </div>
    ),
  },
  {
    title: "Watches your agent",
    body: "Thinks while Claude Code, OpenCode or Codex work. Jumps when they finish.",
    bg: "var(--lilac)",
    demo: (
      <div className="grid justify-items-center">
        <div className="-rotate-2">
          <Term lines={["$ claude", "› fix the flaky test", "  running 128 tests…", "✓ all green"]} />
        </div>
        <Sprite mood="done" size={128} />
      </div>
    ),
  },
  {
    title: "Sums up your day",
    body: "Where your time went, written up every night at 10.",
    bg: "var(--peach)",
    demo: (
      <div className="grid justify-items-center">
        <div className="rotate-3">
          <Note fill="#fff" title="Today, in short" w={200}>
            3h 20m coding · 2 meetings · 41 messages
          </Note>
        </div>
        <Sprite mood="petted" size={128} />
      </div>
    ),
  },
];

const DRIFT: [number, number][] = [
  [-1, -0.4],
  [1, -0.6],
  [1, 0.5],
  [-1, 0.45],
];

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (k: number) => {
  k = clamp(k);
  return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
};
