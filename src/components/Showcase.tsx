"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLoop } from "./Demos";
import { Sprite, type Mood } from "./Sprite";

/* ---------- the real apps, running sample data (built by demo/build.mjs) ---------- */

/** A desktop-sized frame. Narrower than that, it's drawn at desktop size and scaled down to fit, like a screenshot you can still click. */
function Frame({ src, title }: { src: string; title: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(1);
  useEffect(() => {
    const el = box.current!;
    const ro = new ResizeObserver(([e]) => setK(Math.min(1, e.contentRect.width / DESK_W)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} className="overflow-hidden" style={k < 1 ? { height: DESK_H * k } : undefined}>
      <iframe
        src={src}
        title={title}
        className="demo-frame"
        loading="eager"
        style={k < 1 ? { width: DESK_W, height: DESK_H, transform: `scale(${k})`, transformOrigin: "0 0" } : undefined}
      />
    </div>
  );
}
const DESK_W = 1100;
const DESK_H = 720;

/** The Nikxel window: its own page from the Mac app, in a Mac window. */
export function AppDemo() {
  return (
    <div className="window">
      <div className="bar">
        <i />
        <i />
        <i />
        <span>Nikxel</span>
      </div>
      <Frame src="/demo/app/index.html" title="The Nikxel app, with sample data" />
    </div>
  );
}

/** The team dashboard, in a browser window. */
export function AdminDemo() {
  return (
    <div className="window">
      <div className="bar">
        <i />
        <i />
        <i />
        <span>
          <em className="url">your-team.nikxel.app</em>
        </span>
      </div>
      <Frame src="/demo/admin/index.html" title="The Nikxel team dashboard, with sample data" />
    </div>
  );
}

/* ---------- a meeting on a Mac, and Nikxel answering about the last two ---------- */

type Msg = { me: boolean; text: ReactNode };

const Q1 = "what did we discuss in the last 2 meetings?";
const A1 = (
  <>
    <b className="block">Pricing call with Acme, yesterday</b>
    <ul>
      <li>Free plan stays; Pro goes to $12 from March.</li>
      <li>Ali wants the quote in writing by Friday. That one’s yours.</li>
    </ul>
    <b className="mt-1.5 block">1:1 with Priya, Monday</b>
    <ul>
      <li>Offsite is in March; Priya shortlists venues.</li>
      <li>You said you’d book two to visit.</li>
    </ul>
  </>
);
const Q2 = "draft the quote email to Ali";
const A2 = <>Done. “Acme: revised quote” is in your Gmail drafts with the new prices. Nothing sent.</>;

export function MeetingDesk() {
  const ref = useRef<HTMLDivElement>(null);
  const [log, setLog] = useState<Msg[]>([]);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [mood, setMood] = useState<Mood>("recording");

  useLoop(ref, async (w) => {
    setLog([]);
    setTyped("");
    setBusy(false);
    setMood("recording");
    await w(1600);
    for (const [q, a] of [
      [Q1, A1],
      [Q2, A2],
    ] as const) {
      setMood("petted");
      for (let c = 1; c <= q.length; c++) {
        setTyped(q.slice(0, c));
        await w(30 + Math.random() * 35);
      }
      await w(350);
      setTyped("");
      setLog((l) => [...l, { me: true, text: q }]);
      setBusy(true);
      setMood("thinking");
      await w(1700);
      setBusy(false);
      setLog((l) => [...l, { me: false, text: a }]);
      setMood("done");
      await w(q === Q1 ? 4200 : 3000);
      setMood("recording");
    }
    await w(1400);
  });

  return (
    <div ref={ref} className="mac">
      <div className="mac-screen">
        <div className="mac-menu">
          <b>Google Chrome</b>
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span className="ml-auto flex items-center gap-[0.8cqw]">
            <span className="rec-dot inline-block h-[0.9cqw] w-[0.9cqw] rounded-full bg-[#ff3b30]" />
            Thu 11:04
          </span>
        </div>

        {/* Google Meet in Chrome */}
        <div className="meet">
          <div className="meet-bar">
            <i />
            <i />
            <i />
            <span>meet.google.com/qvk-hrnd-pzt</span>
          </div>
          <div className="meet-grid">
            {(
              [
                ["Priya Shah", "#7b5ea7", true],
                ["Mei Tan", "#2f7d6d", false],
                ["Dev Patel", "#b5653a", false],
                ["You", "#3b6ea5", false],
              ] as const
            ).map(([n, c, talking]) => (
              <div key={n} className={`tile-v ${talking ? "talk" : ""}`}>
                <span className="face" style={{ background: c }}>
                  {n[0]}
                </span>
                <small>{n}</small>
              </div>
            ))}
          </div>
          <div className="meet-ctl">
            <span>11:04 | Design sync</span>
            <span className="flex gap-[1cqw]">
              <i />
              <i />
              <i className="end" />
            </span>
            <span />
          </div>
        </div>

        {/* Nikxel on the desktop, recording the call */}
        <div className="desk-nikxel">
          <span className="rec-pill">
            <span className="rec-dot inline-block h-[0.9cqw] w-[0.9cqw] rounded-full bg-[#ff3b30]" />
            Recording 24:18
          </span>
          <Sprite mood={mood} size={64} className="md:hidden" />
          <Sprite mood={mood} size={128} className="hidden md:block" />
        </div>
      </div>

      {/* Nikxel's chat, the same glass bubbles as the app's */}
      <div className="avchat" aria-live="polite">
        <div className="avlog">
          {log.map((m, i) => (
            <div key={i} className={`avmsg ${m.me ? "me" : "bot"}`}>
              {m.text}
            </div>
          ))}
          {busy && (
            <div className="avmsg bot">
              <span className="avdots">
                <i />
                <i />
                <i />
              </span>
            </div>
          )}
        </div>
        <div className="avform">
          <span className="min-w-0 flex-1 truncate">{typed || <span className="opacity-60">Ask Nikxel…</span>}</span>
          <span className="avsend">↑</span>
        </div>
      </div>
    </div>
  );
}
