"use client";

import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Sprite, type Mood } from "./Sprite";

type Bubble = { id: number; kind: "calendar" | "reminder" | "whatsapp" | "mom"; text: string };

const SIZE = 192;

// Touch-first devices get tap wording instead of click/cursor wording.
const TOUCH_QUERY = "(hover: none)";
const subscribeTouch = (cb: () => void) => {
  const m = window.matchMedia(TOUCH_QUERY);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const useTouch = () =>
  useSyncExternalStore(subscribeTouch, () => window.matchMedia(TOUCH_QUERY).matches, () => false);

export function Playground() {
  const deskRef = useRef<HTMLDivElement>(null);
  const [mood, setMood] = useState<Mood>("idle");
  const [faceLeft, setFaceLeft] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [text, setText] = useState("");
  const [hot, setHot] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const moodTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const keyTimes = useRef<number[]>([]);
  const coolTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const dragged = useRef(false);
  const lastTap = useRef(0);
  const avatarX = useMotionValue(0);
  const avatarY = useMotionValue(0);
  const touch = useTouch();
  const bubbleId = useRef(0);

  // Recording is sticky, same as StateMachine.setState in the app.
  // The ref mirrors `recording` synchronously so back-to-back taps see it.
  const recordingRef = useRef(false);

  const flash = (m: Mood, ms: number, then: Mood = "idle") => {
    if (recordingRef.current) return;
    setMood(m);
    clearTimeout(moodTimer.current);
    moodTimer.current = setTimeout(() => !recordingRef.current && setMood(then), ms);
  };

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const pushBubble = (kind: Bubble["kind"], text: string, ttl = 4500) => {
    const id = ++bubbleId.current;
    setBubbles((b) => [...b.slice(-2), { id, kind, text }]);
    later(() => setBubbles((b) => b.filter((x) => x.id !== id)), ttl);
  };

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      clearTimeout(moodTimer.current);
      clearTimeout(coolTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  // Face the cursor, like StateMachine.updateMouse.
  const onDeskMove = (e: React.PointerEvent) => {
    const desk = deskRef.current;
    if (!desk) return;
    const r = desk.getBoundingClientRect();
    const center = r.left + r.width / 2 + avatarX.get();
    if (Math.abs(e.clientX - center) > 24) setFaceLeft(e.clientX < center);
  };

  const onType = (v: string, now: number) => {
    setText(v);
    keyTimes.current = [...keyTimes.current.filter((t) => now - t < 3000), now];
    // ~30 WPM over a 3 s window = overheat, as in NikxelView.
    setHot(keyTimes.current.length / 5 / (3 / 60) > 30);
    clearTimeout(coolTimer.current);
    coolTimer.current = setTimeout(() => setHot(false), 1500);
    flash("typing", 400);
  };

  const toggleRecording = () => {
    if (!recording) {
      setElapsed(0);
      setRecording(true);
      recordingRef.current = true;
      setMood("recording");
      return;
    }
    setRecording(false);
    recordingRef.current = false;
    setMood("typing"); // writingMOM reuses the typing row
    clearTimeout(moodTimer.current);
    moodTimer.current = setTimeout(() => {
      setMood("momReady");
      pushBubble("mom", "Minutes saved to Meetings/");
      moodTimer.current = setTimeout(() => setMood("idle"), 2000);
    }, 2600);
  };

  const runAgent = () => {
    if (recordingRef.current) return;
    setMood("thinking");
    clearTimeout(moodTimer.current);
    moodTimer.current = setTimeout(() => flash("done", 1500), 2800);
  };

  const run = (id: ActionId) => {
    switch (id) {
      case "meeting":
        return toggleRecording();
      case "agent":
        return runAgent();
      case "calendar":
        flash("alert", 2000);
        return pushBubble("calendar", "Design sync · starts in 5 min");
      case "whatsapp":
        pushBubble(
          "whatsapp",
          recordingRef.current ? "Replying for you: in a meeting, back at 4" : "New message · replies only during meetings",
          5000,
        );
        return flash("typing", 1200);
      case "reminder":
        pushBubble("reminder", "Send the invoice · due today", 6000);
        return flash("alert", 1200);
    }
  };

  const pet = () => flash("petted", 2500);

  const reset = () => {
    clearTimeout(moodTimer.current);
    timers.current.forEach(clearTimeout);
    timers.current = [];
    recordingRef.current = false;
    setRecording(false);
    setBubbles([]);
    setText("");
    setHot(false);
    setMood("idle");
    avatarX.set(0);
    avatarY.set(0);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_350px] lg:gap-8">
      {/* Fake macOS desktop */}
      <div className="window">
        <div className="flex items-center justify-between border-b border-[#dfeadf] bg-[#eff5ee] px-4 py-2 font-mono text-[12px] text-muted">
          <div className="flex items-center gap-4">
            <span className="font-bold">Finder</span>
            <span className="hidden sm:inline">File</span>
            <span className="hidden sm:inline">Edit</span>
            <span className="hidden sm:inline">View</span>
          </div>
          <div className="flex items-center gap-3">
            {recording && (
              <span className="flex items-center gap-1.5 font-bold">
                <span className="rec-dot h-2 w-2 rounded-full bg-[#ff6158]" />
                {fmt(elapsed)}
              </span>
            )}
            <Sprite mood="idle" size={16} />
            <span>Sat 4:12 PM</span>
          </div>
        </div>

        <div
          ref={deskRef}
          onPointerMove={onDeskMove}
          className="relative h-[340px] bg-[#f3f9f1] sm:h-[520px]"
          style={{
            backgroundImage: "radial-gradient(var(--dot) 1.4px, transparent 1.6px)",
            backgroundSize: "22px 22px",
          }}
        >
          {/* Decorative stickers on the wallpaper */}
          <span className="hand absolute right-8 top-6 hidden rotate-6 text-[34px] text-pink-deep sm:inline-block">
            hi!
          </span>

          {/* A text window to type into */}
          <div className="sticker absolute left-4 top-4 z-10 w-[min(340px,calc(100%-2.5rem))] overflow-hidden !rounded-2xl focus-within:outline focus-within:outline-[2.5px] focus-within:outline-offset-2 focus-within:outline-pink">
            <div className="flex items-center gap-1.5 border-b border-line bg-[#eff5ee] px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff6158]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="label ml-2 text-muted">notes.md</span>
            </div>
            <textarea
              value={text}
              onChange={(e) => onType(e.target.value, e.timeStamp)}
              placeholder="Type here. Fast."
              aria-label="Type to make Nikxel type"
              className="h-20 w-full resize-none sm:h-24 bg-transparent p-3 font-mono text-[14px] text-ink outline-none placeholder:text-muted"
            />
          </div>

          {/* The avatar */}
          <motion.div
            drag
            dragConstraints={deskRef}
            dragElastic={0}
            dragMomentum={false}
            style={{ x: avatarX, y: avatarY }}
            role="button"
            tabIndex={0}
            aria-label="Nikxel. Enter pets it, R starts or stops a meeting."
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                pet();
              } else if (e.key === "r" || e.key === "R") {
                toggleRecording();
              }
            }}
            onDragStart={() => {
              dragged.current = true;
              if (!recordingRef.current) setMood("dragging");
            }}
            onDragEnd={() => {
              if (!recordingRef.current) setMood("idle");
              setTimeout(() => (dragged.current = false), 50);
            }}
            whileDrag={{ scaleY: 1.12, scaleX: 0.92 }}
            onTap={(e) => {
              if (dragged.current) return;
              const now = e.timeStamp;
              if (now - lastTap.current < 320) {
                lastTap.current = 0;
                toggleRecording();
              } else {
                lastTap.current = now;
                pet();
              }
            }}
            className="absolute bottom-2 left-1/2 -ml-[96px] cursor-grab touch-none rounded-2xl active:cursor-grabbing sm:bottom-6"
          >
            <div className="absolute bottom-full left-1/2 flex w-[270px] -translate-x-1/2 flex-col items-center gap-2 pb-2">
              <AnimatePresence>
                {recording && (
                  <motion.span
                    key="rec"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="label flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-soft"
                  >
                    <span className="rec-dot h-2.5 w-2.5 rounded-full bg-[#ff6158]" />
                    Rec {fmt(elapsed)}
                  </motion.span>
                )}
                {bubbles.map((b) => (
                  <motion.button
                    key={b.id}
                    layout
                    onClick={() => setBubbles((all) => all.filter((x) => x.id !== b.id))}
                    aria-label={`${b.text}. Dismiss`}
                    initial={{ opacity: 0, y: 12, scale: 0.85, rotate: -4 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, y: -8, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 380, damping: 22 }}
                    className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-left text-[13px] font-bold shadow-soft"
                  >
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT[b.kind]}`} />
                    {b.text}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
            <div style={{ filter: hot ? "drop-shadow(0 0 16px rgba(80,210,130,.95)) saturate(1.4)" : undefined }}>
              <Sprite mood={mood} size={SIZE} faceLeft={faceLeft} />
            </div>
            <div className="mx-auto -mt-3 h-4 w-28 rounded-[50%] bg-black/10 blur-md" />
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 content-start gap-3 lg:grid-cols-1 lg:gap-4">
        <div className="sticker col-span-2 !bg-blush p-4 sm:p-5 lg:col-span-1" aria-live="polite">
          <div className="tag !mb-0">{"/* right now */"}</div>
          <motion.div
            key={`${mood}-${hot}`}
            initial={{ opacity: 0, y: 10, rotate: -3 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 20 }}
            className="display mt-2 text-[32px] sm:text-[44px]"
          >
            {hot && mood === "typing" ? "Overheat" : LABEL[mood]}
          </motion.div>
        </div>
        {ACTIONS.map((a, i) => (
          <button
            key={a.id}
            type="button"
            onClick={() => run(a.id)}
            className={`btn !m-0 !justify-between !px-4 !py-3.5 !text-[13px] text-left sm:!px-5 sm:!text-[15px] ${
              i === 0 ? "btn-red col-span-2 lg:col-span-1" : ""
            }`}
          >
            <span>{a.id === "meeting" && recording ? "Stop meeting" : a.label}</span>
            <span className={`hidden font-mono text-[10px] font-normal normal-case tracking-normal sm:inline ${i === 0 ? "text-white/60" : "text-muted"}`}>
              {a.id === "meeting" && touch ? "or double-tap it" : a.hint}
            </span>
          </button>
        ))}
        <div className="col-span-2 flex items-center justify-between gap-4 pt-1 lg:col-span-1">
          <p className="text-[15px] text-muted">
            {touch ? "Tap it to pet it. Drag it around." : "Click it to pet it. Drag it around. It watches your cursor."}
          </p>
          <button type="button" onClick={reset} className="link-draw shrink-0 text-[14px] font-bold">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

type ActionId = "meeting" | "agent" | "calendar" | "whatsapp" | "reminder";

const ACTIONS: { id: ActionId; label: string; hint: string }[] = [
  { id: "meeting", label: "Join a meeting", hint: "or double-click it" },
  { id: "agent", label: "Run Claude Code", hint: "agent thinking" },
  { id: "calendar", label: "Meeting in 5 min", hint: "calendar alert" },
  { id: "whatsapp", label: "WhatsApp ping", hint: "auto-reply" },
  { id: "reminder", label: "Due today", hint: "Apple Reminders" },
];

const DOT: Record<Bubble["kind"], string> = {
  calendar: "bg-sky-d",
  reminder: "bg-butter-d",
  whatsapp: "bg-[#25d366]",
  mom: "bg-pink",
};

const LABEL: Record<Mood, string> = {
  idle: "Idle",
  typing: "Typing",
  thinking: "Thinking",
  done: "Done!",
  dragging: "Wheee",
  pounce: "Pounce",
  petted: "Happy",
  alert: "Alert!",
  recording: "Listening",
  momReady: "MOM ready",
};

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
