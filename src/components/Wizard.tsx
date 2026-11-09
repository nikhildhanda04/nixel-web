"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { Sprite } from "./Sprite";

type Nav = { next: () => void; back: () => void };

// Mirrors OnboardingWindow.swift: welcome → avatar → deps → whatsapp → agent,
// followed by the macOS permission prompts the features trigger.
const STAGES: { name: string; what: string; screen: (nav: Nav) => ReactNode }[] = [
  {
    name: "Welcome",
    what: "Tell it your name. It labels your voice in every meeting note.",
    screen: (nav) => (
      <>
        <Title>Welcome to Nikxel</Title>
        <Sub>Pick your avatar, check transcription tools, connect WhatsApp and choose a coding agent.</Sub>
        <Field label="What should Nikxel call you in your notes?" placeholder="Your first name (optional)" />
        <Buttons nav={nav} primary="Get started" />
      </>
    ),
  },
  {
    name: "Avatar",
    what: "Keep the default, or load the PNG Gemini makes from your selfie. Nikxel strips the magenta and cuts the frames.",
    screen: (nav) => (
      <>
        <Title>Your avatar</Title>
        <div className="flex items-center gap-4">
          <div className="rounded-[22px] bg-butter p-1">
            <Sprite mood="petted" size={96} />
          </div>
          <div className="grid gap-2">
            <AppOnly>Copy Gemini prompt</AppOnly>
            <AppOnly>Use my own sprite sheet…</AppOnly>
          </div>
        </div>
        <Buttons nav={nav} back primary="Next" />
      </>
    ),
  },
  {
    name: "Transcription",
    what: "Checks for whisper and ffmpeg, installs them with Homebrew if missing, and downloads the 466 MB speech model.",
    screen: (nav) => (
      <>
        <Title>Transcription tools</Title>
        <Row ok name="whisper" note="speech-to-text" />
        <Row ok name="ffmpeg" note="audio decoding" />
        <Row name="speech model" note="ggml-small · 466 MB" action="Download" />
        <Radios
          legend="Spoken language"
          options={["English · handles Hindi + Hinglish", "Hindi", "Auto-detect"]}
        />
        <Buttons nav={nav} back primary="Next" />
      </>
    ),
  },
  {
    name: "WhatsApp",
    what: "Chrome opens WhatsApp Web. Scan the QR with your phone so Nikxel can reply while you're in a call.",
    screen: (nav) => (
      <>
        <Title>Connect WhatsApp</Title>
        <div className="flex items-center gap-4">
          <Qr />
          <div className="grid gap-2 text-[15px]">
            <span className="flex items-center gap-2">
              <span className="rec-dot h-2.5 w-2.5 rounded-full bg-sky-d" /> Waiting for QR scan…
            </span>
            <AppOnly>Connect WhatsApp</AppOnly>
          </div>
        </div>
        <Buttons nav={nav} back primary="Next" />
      </>
    ),
  },
  {
    name: "Agent",
    what: "Choose Claude Code, OpenCode or Codex. Missing one? The window shows its install command and a Re-check button.",
    screen: (nav) => (
      <>
        <Title>Choose your coding agent</Title>
        <Radios legend="Coding agent" options={["Claude Code", "OpenCode", "Codex · not installed"]} />
        <Buttons nav={nav} back primary="Finish" />
      </>
    ),
  },
  {
    name: "Permissions",
    what: "After setup, macOS asks once for each feature as you first use it. Say yes and you're done.",
    screen: (nav) => (
      <>
        <Title>Then macOS asks</Title>
        <Perm name="Accessibility" why="react to your typing" />
        <Perm name="Microphone" why="record your side of a meeting" />
        <Perm name="Screen Recording" why="capture the meeting's audio" />
        <Perm name="Calendars + Reminders" why="alerts and to-do bubbles" />
        <Perm name="Automation" why="spot a Google Meet tab" />
        <Buttons nav={nav} back primary="Start over" />
      </>
    ),
  },
];

const SCREENS = STAGES.length - 1; // the last stage happens after the window closes

export function Wizard() {
  const [i, setI] = useState(0);
  const stage = STAGES[i];
  const nav: Nav = {
    next: () => setI((v) => (v + 1) % STAGES.length),
    back: () => setI((v) => Math.max(0, v - 1)),
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
      {/* Stage select */}
      <ol className="sticker grid self-start gap-1 overflow-hidden p-2" aria-label="Setup window screens">
        {STAGES.map((s, j) => (
          <li key={s.name} className={j === SCREENS ? "mt-1 border-t border-line pt-1" : ""}>
            <button
              type="button"
              aria-current={i === j ? "step" : undefined}
              onClick={() => setI(j)}
              className={`flex w-full items-center gap-4 rounded-[18px] px-4 py-3.5 text-left transition-colors ${
                i === j ? "bg-ink text-white" : "hover:bg-blush"
              }`}
            >
              <span className="label w-6 text-[13px] opacity-60">{j === SCREENS ? "★" : j + 1}</span>
              <span className="text-[17px] font-bold">{s.name}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] xl:items-start">
        {/* The setup window */}
        <div className="window">
          <div className="flex items-center gap-2 border-b border-[#dfeadf] bg-[#eff5ee] px-4 py-2.5 text-muted">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff6158]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="label ml-2 flex-1 text-[11px]">{i === SCREENS ? "macOS" : "Set up Nikxel"}</span>
            <span className="label text-[11px] text-pink-deep">{i === SCREENS ? "After setup" : `${i + 1}/${SCREENS}`}</span>
          </div>
          <div className="relative min-h-[340px] p-5 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="grid gap-4"
              >
                {stage.screen(nav)}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* What happens */}
        <div className="sticker !bg-butter p-6" aria-live="polite">
          <div className="tag !mb-0">{"/* what happens */"}</div>
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 text-[21px] font-semibold leading-snug"
          >
            {stage.what}
          </motion.p>
          <p className="mt-4 text-[14px] text-muted">
            Dashed buttons only work in the real app.
          </p>
        </div>
      </div>
    </div>
  );
}

function Title({ children }: { children: ReactNode }) {
  return <h3 className="text-[24px] font-bold tracking-[-0.03em] sm:text-[28px]">{children}</h3>;
}
function Sub({ children }: { children: ReactNode }) {
  return <p className="text-[15px] leading-snug text-muted">{children}</p>;
}
function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="grid gap-1.5 text-[14px] text-muted">
      {label}
      <input
        type="text"
        placeholder={placeholder}
        className="rounded-full border border-line bg-white px-4 py-2.5 text-[15px] text-ink placeholder:text-muted"
      />
    </label>
  );
}
/** Controls that only do something inside the real app: dashed so they don't read as broken. */
function AppOnly({ children }: { children: ReactNode }) {
  return (
    <span
      title="Works in the real app"
      className="inline-block cursor-default rounded-full border-[1.5px] border-dashed border-ink/25 px-3 py-1.5 text-[13px] font-bold text-ink/80"
    >
      {children}
    </span>
  );
}
function Buttons({ nav, primary, back }: { nav: Nav; primary: string; back?: boolean }) {
  return (
    <div className="mt-2 flex flex-wrap justify-end gap-2">
      {back && (
        <button
          type="button"
          onClick={nav.back}
          className="rounded-full border border-line bg-white px-4 py-2 text-[13px] font-bold transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
        >
          Back
        </button>
      )}
      <button
        type="button"
        onClick={nav.next}
        className="rounded-full bg-ink px-4 py-2 text-[13px] font-bold text-white shadow-soft transition-transform hover:-translate-y-0.5 active:scale-95"
      >
        {primary}
      </button>
    </div>
  );
}
function Row({ ok, name, note, action }: { ok?: boolean; name: string; note: string; action?: string }) {
  return (
    <div className="flex items-center gap-3 text-[15px]">
      <span className={`grid h-6 w-6 place-items-center rounded-full text-[12px] font-bold ${ok ? "bg-mint-d" : "bg-white shadow-[inset_0_0_0_1.5px_var(--line)]"}`}>
        {ok ? "✓" : "·"}
      </span>
      <span className="font-bold">{name}</span>
      <span className="text-muted">{note}</span>
      {action && <span className="ml-auto"><AppOnly>{action}</AppOnly></span>}
    </div>
  );
}
function Radios({ legend, options }: { legend: string; options: string[] }) {
  const [on, setOn] = useState(0);
  return (
    <fieldset className="grid gap-1.5 text-[15px]">
      <legend className="label mb-1 text-[11px]">{legend}</legend>
      {options.map((o, k) => (
        <label key={o} className="flex cursor-pointer items-center gap-3">
          <input type="radio" name={legend} checked={on === k} onChange={() => setOn(k)} className="peer sr-only" />
          <span className="grid h-5 w-5 place-items-center rounded-full border border-line peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-pink-deep">
            {on === k && <span className="h-2 w-2 rounded-full bg-pink-deep" />}
          </span>
          {o}
        </label>
      ))}
    </fieldset>
  );
}
function Perm({ name, why }: { name: string; why: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 text-[15px]">
      <span className="font-bold">✓ {name}</span>
      <span className="text-muted">{why}</span>
    </div>
  );
}

// Decorative QR-style block (not a real code).
function Qr() {
  const n = 15;
  // 5x5 corner markers (ring + centre), pseudo-random fill elsewhere.
  const marker = (x: number, y: number, cx: number, cy: number) => {
    const dx = x - cx;
    const dy = y - cy;
    if (dx < 0 || dy < 0 || dx > 4 || dy > 4) return null;
    return dx === 0 || dy === 0 || dx === 4 || dy === 4 || (dx === 2 && dy === 2);
  };
  const cells = Array.from({ length: n * n }, (_, k) => {
    const x = k % n;
    const y = Math.floor(k / n);
    const m = marker(x, y, 0, 0) ?? marker(x, y, 10, 0) ?? marker(x, y, 0, 10);
    if (m !== null) return m;
    if ((x === 5 && y < 6) || (y === 5 && x < 6) || (x === 9 && y < 6) || (y === 9 && x < 6)) return false;
    return (x * 7 + y * 13 + x * y) % 3 === 0;
  });
  return (
    <div className="grid shrink-0 rounded-xl bg-white p-2 shadow-soft" style={{ gridTemplateColumns: `repeat(${n}, 6px)` }}>
      {cells.map((on, k) => (
        <span key={k} className={`h-[6px] w-[6px] ${on ? "bg-ink" : ""}`} />
      ))}
    </div>
  );
}
