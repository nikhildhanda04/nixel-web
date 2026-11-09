"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { Sprite } from "./Sprite";

/**
 * Little looping demos for the setup page. Each one plays while it's on
 * screen, starts clean when it comes back, and with reduced motion jumps
 * straight to its last frame.
 */

const STALE = Symbol("stale");
type Wait = (ms: number) => Promise<void>;

function useLoop(ref: RefObject<HTMLElement | null>, run: (w: Wait) => Promise<void>) {
  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let gen = 0;
    let live = false;
    const go = async () => {
      const my = ++gen;
      const w: Wait = (ms) =>
        new Promise((res, rej) => setTimeout(() => (my === gen ? res() : rej(STALE)), calm ? 0 : ms));
      try {
        do {
          await runRef.current(w);
          await w(1600);
        } while (live && my === gen && !calm);
      } catch (e) {
        if (e !== STALE) throw e;
      }
    };
    const io = new IntersectionObserver(
      ([e]) => {
        live = e.isIntersecting;
        if (live) go();
        else gen++;
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      gen++;
      io.disconnect();
    };
  }, [ref]);
}

const jitter = (base: number) => base + Math.random() * 30;

/* ---------- Terminal ---------- */

export type Line = { cmd: string } | { spin: string; ms?: number } | { out: string; tone?: "ok" | "dim" } | { wait: number };
type Shown = { text: string; tone?: "ok" | "dim" | "cmd" };

const SPIN = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏";

export function Terminal({ script, title = "Terminal", prompt = "~ %" }: { script: Line[]; title?: string; prompt?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<Shown[]>([]);
  const [typing, setTyping] = useState("");
  // While a command runs there's no prompt, like a real terminal.
  const [busy, setBusy] = useState(false);

  useLoop(ref, async (w) => {
    const acc: Shown[] = [];
    setLines([]);
    setTyping("");
    setBusy(false);
    await w(700);
    for (const step of script) {
      if ("cmd" in step) {
        setBusy(false);
        for (let i = 1; i <= step.cmd.length; i++) {
          setTyping(step.cmd.slice(0, i));
          await w(jitter(step.cmd.length > 30 ? 16 : 40));
        }
        await w(350);
        acc.push({ text: step.cmd, tone: "cmd" });
        setTyping("");
        setBusy(true);
      } else if ("spin" in step) {
        const frames = Math.round((step.ms ?? 1800) / 90);
        for (let k = 0; k < frames; k++) {
          setLines([...acc, { text: `${SPIN[k % 10]} ${step.spin}`, tone: "dim" }]);
          await w(90);
        }
        continue;
      } else if ("out" in step) {
        acc.push({ text: step.out, tone: step.tone });
        await w(260);
      } else {
        await w(step.wait);
      }
      setLines([...acc]);
    }
    setLines([...acc]);
    setBusy(false);
    await w(2600);
  });

  return (
    <div ref={ref} className="term">
      <div className="tbar">
        <i />
        <i />
        <i />
        <span>{title}</span>
      </div>
      <pre className="tbody">
        {lines.map((l, i) =>
          l.tone === "cmd" ? (
            <div key={i}>
              <span className="pr">{prompt}</span> {l.text}
            </div>
          ) : (
            <div key={i} className={l.tone}>
              {l.text}
            </div>
          ),
        )}
        {busy ? (
          <span className="cur" />
        ) : (
          <div>
            <span className="pr">{prompt}</span> {typing}
            <span className="cur" />
          </div>
        )}
      </pre>
    </div>
  );
}

/* ---------- Spotlight: ⌘ Space, "Terminal", Return ---------- */

export function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");
  const [press, setPress] = useState(false);

  useLoop(ref, async (w) => {
    setQ("");
    await w(700);
    for (const ch of "Terminal") {
      setQ((v) => v + ch);
      await w(110 + Math.random() * 60);
    }
    await w(700);
    setPress(true);
    await w(160);
    setPress(false);
    await w(1600);
  });

  return (
    <div ref={ref} className="spot">
      <div className="sp-bar">
        <svg viewBox="0 0 24 24" className="h-6 w-6 flex-none fill-none stroke-[#7f8a82]" strokeWidth="2" strokeLinecap="round">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m15.5 15.5 5 5" />
        </svg>
        <span>{q}</span>
        <span className="cur !-ml-2 !w-[2px] !bg-[#2b7bff]" />
      </div>
      <div className={`sp-hit ${q.length >= 3 ? "on" : ""}`}>
        <span className="term-ic grid h-[38px] w-[38px] place-items-center rounded-[9px] text-[14px]">&gt;_</span>
        <div>
          <b className="block text-[16px] font-bold leading-tight">Terminal</b>
          <small className="text-[12.5px] opacity-80">Application</small>
        </div>
        <kbd className={press ? "press" : ""}>↩</kbd>
      </div>
    </div>
  );
}

/* ---------- Keychain: Create a Certificate ---------- */

export function Keychain() {
  const ref = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLSpanElement>(null);
  const [name, setName] = useState("");
  const [step, setStep] = useState(0);
  const [hand, setHand] = useState({ x: 380, y: 300, on: false });
  const [press, setPress] = useState(false);

  useLoop(ref, async (w) => {
    setName("");
    setStep(0);
    setPress(false);
    setHand({ x: 380, y: 300, on: false });
    await w(700);
    for (const ch of "Nikxel") {
      setName((v) => v + ch);
      await w(jitter(110));
    }
    await w(400);
    setStep(1); // identity type
    await w(700);
    setStep(2); // certificate type: Code Signing
    await w(900);
    const b = btn.current!.getBoundingClientRect();
    const r = ref.current!.getBoundingClientRect();
    setHand({ x: 380, y: 300, on: true });
    await w(60);
    setHand({ x: b.left - r.left + b.width / 2 - 11, y: b.top - r.top + b.height / 2 - 2, on: true });
    await w(1000);
    setPress(true);
    await w(160);
    setPress(false);
    setStep(3);
    await w(2400);
  });

  return (
    <div ref={ref} className="relative grid w-full place-items-center">
      <div className="dialog">
        <div className="tbar !bg-[#eff5ee]">
          <i />
          <i />
          <i />
          <span className="!text-muted">Certificate Assistant</span>
        </div>
        <p className="px-5 pt-4 text-[14px] font-bold">Create Your Certificate</p>
        <div className="row">
          <span>Name:</span>
          <span className={`field ${step === 0 ? "hl" : ""}`}>
            {name}
            {step === 0 && <span className="cur !h-[1em] !w-[2px] !bg-ink" />}
          </span>
        </div>
        <div className="row">
          <span>Identity Type:</span>
          <span className={`field ${step === 1 ? "hl" : ""}`}>{step >= 1 ? "Self Signed Root" : ""}</span>
        </div>
        <div className="row">
          <span>Certificate Type:</span>
          <span className={`field ${step === 2 ? "hl" : ""}`}>{step >= 2 ? "Code Signing" : ""}</span>
        </div>
        <div className="flex justify-end gap-2 px-5 pb-5 pt-5">
          <span className="rounded-[9px] px-4 py-2 text-[13.5px] font-semibold text-muted shadow-[inset_0_0_0_1px_var(--line)]">Cancel</span>
          <span ref={btn} className={`go ${press ? "press" : ""}`}>
            Create
          </span>
        </div>
      </div>
      <span className="px-hand left-0 top-0" style={{ transform: `translate(${hand.x}px, ${hand.y}px)`, opacity: hand.on && step < 3 ? 1 : 0 }} />
      <span className={`toast ${step === 3 ? "on" : ""}`}>✓ Certificate “Nikxel” created</span>
    </div>
  );
}

/* ---------- Launch: Nikxel puffs onto the desktop ---------- */

export function Launch() {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  useLoop(ref, async (w) => {
    setStep(0);
    await w(900);
    setStep(1); // puff
    await w(1100);
    setStep(2); // says hi
    await w(1200);
    setStep(3); // setup window
    await w(3200);
  });

  return (
    <div ref={ref} className="relative h-[260px] w-full max-w-[480px]">
      <div
        className={`absolute left-0 top-0 w-[62%] overflow-hidden rounded-2xl bg-white shadow-[0_24px_50px_rgba(40,80,55,.18),inset_0_0_0_1px_var(--line)] transition-all duration-500 ${
          step >= 3 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        <div className="tbar !h-7 !bg-[#eff5ee]">
          <i />
          <i />
          <i />
          <span className="!text-[11px] !leading-7 !text-muted">Set up Nikxel</span>
        </div>
        <div className="grid gap-2 p-4">
          <b className="text-[16px] tracking-[-0.02em]">Welcome to Nikxel</b>
          <span className="h-2 w-[90%] rounded-full bg-[#e3ede2]" />
          <span className="h-2 w-[70%] rounded-full bg-[#e3ede2]" />
          <span className="mt-1 h-7 w-full rounded-full shadow-[inset_0_0_0_1px_var(--line)]" />
          <span className="ml-auto mt-1 rounded-full bg-ink px-3 py-1.5 text-[11px] font-bold text-white">Get started</span>
        </div>
      </div>
      <div className="absolute bottom-0 right-2 flex flex-col items-center">
        <div
          className={`mb-1 whitespace-nowrap rounded-full bg-white px-4 py-2.5 text-[13px] font-bold shadow-[0_12px_26px_rgba(40,80,55,.14)] transition-all duration-300 ${
            step >= 2 ? "scale-100 opacity-100" : "scale-75 opacity-0"
          }`}
        >
          Hi! Let&apos;s get you set up ✦
        </div>
        <div className={`transition-all duration-500 [transition-timing-function:var(--spring)] ${step >= 1 ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}>
          <div className={step === 1 ? "hop" : ""}>
            <Sprite mood={step >= 2 ? "petted" : "pounce"} size={128} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Hero plug: a spark runs from Nikxel to your Mac ---------- */

export function Plug() {
  const ref = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const [on, setOn] = useState(false);
  const [spark, setSpark] = useState({ x: 0, y: 30 });

  useLoop(ref, async (w) => {
    setOn(false);
    await w(900);
    setOn(true);
    const p = path.current!;
    const L = p.getTotalLength();
    for (let k = 0; k <= 40; k++) {
      const pt = p.getPointAtLength((L * k) / 40);
      setSpark({ x: pt.x, y: pt.y });
      await w(18);
    }
    await w(2600);
  });

  return (
    <div ref={ref} className={`plug ${on ? "on" : ""}`} aria-hidden>
      <div className="node">
        <div className={on ? "hop" : ""}>
          <Sprite mood={on ? "done" : "idle"} size={64} />
        </div>
        <b>Nikxel</b>
      </div>
      <svg className="wire" viewBox="0 0 200 60" preserveAspectRatio="none">
        <path ref={path} d="M0 30 C 40 30, 50 6, 80 10 S 120 54, 150 46 S 185 30, 200 30" />
        <circle className="spark" r="5" cx={spark.x} cy={spark.y} />
      </svg>
      <div className="node">
        <span className="term-ic grid h-16 w-16 place-items-center rounded-[18px] text-[22px]">&gt;_</span>
        <b>Your Mac</b>
      </div>
      <span className="status">{on ? "connected ✦" : "connecting…"}</span>
    </div>
  );
}
