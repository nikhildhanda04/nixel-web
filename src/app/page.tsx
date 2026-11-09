import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Playground } from "@/components/Playground";
import { Reveal } from "@/components/Reveal";
import { Footer } from "@/components/Footer";
import { REPO } from "@/lib/links";
import { Sprite, type Mood } from "@/components/Sprite";
import { Story } from "@/components/Story";

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

        {/* SETUP TEASER */}
        <section id="setup" className="py-24 md:py-32">
          <div className="wrap">
            <Reveal>
              <div className="sticker mx-auto grid max-w-[980px] items-center gap-8 p-7 md:grid-cols-[1fr_auto] md:p-12">
                <div>
                  <p className="tag">{"/* about ten minutes */"}</p>
                  <h2 className="display text-[clamp(30px,3.6vw,52px)]">
                    Seven commands and it&apos;s <span className="bub">yours</span>.
                  </h2>
                  <p className="mt-4 max-w-[48ch] text-[17px] font-medium text-muted">
                    Clone, build, say hi. The guide walks you through every step, with a little demo of each one.
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
                <p className="sub mx-auto mt-4">Free, open source, and happiest sitting in the corner of your screen.</p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link href="/setup" className="pill dark">
                    Set it up
                  </Link>
                  <a href={REPO} target="_blank" rel="noreferrer" className="pill">
                    View on GitHub ↗
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
