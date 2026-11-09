"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Sprite, type Mood } from "./Sprite";

const BASE = 320; // rendered sprite size; scaled down while cruising

// Horizontal waypoints (fraction of viewport width) across the page after the hero.
const PATH_X = [1, 0, 1, 0, 1, 1];

/**
 * The avatar starts big in the hero (at #hero-anchor), shrinks as you leave it,
 * then floats down the page zig-zagging between edges. Its mood follows the
 * section in view (data-mood), it pounces when you scroll fast, faces the way
 * it's travelling, and can be petted while it's in the hero. Once it leaves
 * the hero it's click-through, so it never blocks the page's own controls.
 */
export function FloatingNikxel() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const [vw, setVw] = useState(1440);
  const [vh, setVh] = useState(900);
  const [docH, setDocH] = useState(4000);
  const [anchor, setAnchor] = useState({ x: 0.72, y: 0.22, size: 320 });
  const [sectionMood, setSectionMood] = useState<Mood>("idle");
  const [hidden, setHidden] = useState(false);
  const [fast, setFast] = useState(false);
  const [override, setOverride] = useState<Mood | null>(null);
  const [faceLeft, setFaceLeft] = useState(true);
  const overrideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const play = (m: Mood, ms: number) => {
    setOverride(m);
    clearTimeout(overrideTimer.current);
    overrideTimer.current = setTimeout(() => setOverride(null), ms);
  };

  useEffect(() => {
    const measure = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
      setDocH(document.documentElement.scrollHeight);
      const a = document.getElementById("hero-anchor");
      if (a) {
        const r = a.getBoundingClientRect();
        const top = r.top + window.scrollY;
        const size = Math.min(r.width, r.height);
        setAnchor({
          x: (r.left + r.width / 2) / window.innerWidth,
          y: top + r.height / 2,
          size,
        });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, []);

  // Mood + visibility from whichever section owns the middle of the viewport.
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-mood]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          setSectionMood((el.dataset.mood as Mood) ?? "idle");
          setHidden(el.dataset.float === "hide");
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const mobile = vw < 768;
  const cruise = mobile ? 80 : 128;
  // On a phone the hero sticker sits below the fold: stay on it until it's
  // mid-screen, then leave. On desktop heroStart is 0.
  const heroStart = Math.max(0, anchor.y - vh * 0.5);
  const heroEnd = heroStart + vh * 0.85;

  const pos = (y: number) => {
    const glued = { x: anchor.x * vw, y: anchor.y - y, s: anchor.size / BASE };
    // Reduced motion: it just sits on the hero sticker and scrolls away with it.
    if (reduce || y <= heroStart) return glued;
    if (y <= heroEnd) {
      const t = easeInOut((y - heroStart) / (heroEnd - heroStart));
      const ex = (1 - (cruise / 2 + 4) / vw) * vw;
      const ey = vh * (mobile ? 0.78 : 0.68);
      return {
        x: lerp(glued.x, ex, t),
        y: lerp(glued.y, ey, t),
        s: lerp(anchor.size, cruise, t) / BASE,
      };
    }
    const span = Math.max(1, docH - vh - heroEnd);
    const p = clamp((y - heroEnd) / span, 0, 1);
    const seg = p * (PATH_X.length - 1);
    const i = Math.min(Math.floor(seg), PATH_X.length - 2);
    // Rest at an edge, then dash across mid-segment (it pounces while crossing).
    const t = easeInOut((seg - i - 0.42) / 0.16);
    const margin = (cruise / 2 + 4) / vw;
    const fx = clamp(lerp(PATH_X[i], PATH_X[i + 1], t), margin, 1 - margin);
    const bob = Math.sin(p * Math.PI * 10) * (mobile ? 16 : 36);
    return {
      x: fx * vw,
      y: vh * (mobile ? 0.78 : 0.68) + bob,
      s: cruise / BASE,
    };
  };

  const x = useTransform(scrollY, (y) => pos(y).x - BASE / 2);
  const y = useTransform(scrollY, (y) => pos(y).y - BASE / 2);
  const scale = useTransform(scrollY, (y) => pos(y).s);
  const sx = useSpring(x, { stiffness: 120, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 120, damping: 22, mass: 0.6 });
  const sScale = useSpring(scale, { stiffness: 140, damping: 24 });

  // Face the direction of travel; pounce when the page is flung.
  const xVel = useVelocity(sx);
  useMotionValueEvent(xVel, "change", (v) => {
    if (Math.abs(v) > 40) setFaceLeft(v < 0);
  });
  const scrollVel = useVelocity(scrollY);
  useMotionValueEvent(scrollVel, "change", (v) => setFast(Math.abs(v) > 1800));

  const tilt = useTransform(xVel, [-1500, 0, 1500], [-10, 0, 10]);
  const [crossing, setCrossing] = useState(false);
  useMotionValueEvent(xVel, "change", (v) => setCrossing(Math.abs(v) > 600));

  const [inHero, setInHero] = useState(true);
  useMotionValueEvent(scrollY, "change", (v) => setInHero(v < heroStart + vh * 0.35));
  const clickable = inHero && !hidden;

  const mood: Mood = override ?? ((fast || crossing) && !reduce ? "pounce" : sectionMood);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-40"
      style={{
        x: sx,
        y: sy,
        scale: sScale,
        rotate: reduce ? 0 : tilt,
        width: BASE,
        height: BASE,
      }}
    >
      <motion.button
        type="button"
        tabIndex={-1}
        onClick={() => play("petted", 2500)}
        className="relative block cursor-grab"
        animate={{ opacity: hidden ? 0 : 1, scale: hidden ? 0.6 : 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ pointerEvents: clickable ? "auto" : "none" }}
      >
        <motion.div
          animate={reduce ? undefined : { y: [0, -10, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sprite mood={mood} size={BASE} faceLeft={faceLeft} />
        </motion.div>
        <div className="absolute -bottom-2 left-1/2 h-5 w-1/2 -translate-x-1/2 rounded-[50%] bg-ink/15 blur-md" />
        <AnimatePresence>
          {mood === "recording" && (
            <motion.span
              key="rec"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rec-dot absolute left-1/2 top-2 h-8 w-8 -translate-x-1/2 rounded-full border-[3px] border-ink bg-red"
            />
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const easeInOut = (t: number) => {
  const c = clamp(t, 0, 1);
  return c < 0.5 ? 2 * c * c : 1 - Math.pow(-2 * c + 2, 2) / 2;
};
