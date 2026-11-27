import Link from "next/link";
import type { Metadata } from "next";
import { Plug, Terminal } from "@/components/Demos";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { Reveal } from "@/components/Reveal";
import { SetupSteps, Troubleshooting } from "@/components/Setup";
import { Sprite } from "@/components/Sprite";
import { Wizard } from "@/components/Wizard";
import { REPO } from "@/lib/links";

export const metadata: Metadata = {
  title: "Set up Nikxel",
  description: "Build Nikxel from source on your Mac, Windows PC or Linux box. About ten minutes.",
};

export default function SetupPage() {
  return (
    <>
      <Nav active="/setup" />

      <main>
        {/* HERO: Nikxel plugs into your Mac */}
        <section className="wrap grid items-center gap-10 pb-10 pt-36 md:grid-cols-[1.05fr_.95fr]">
          <div className="enter">
            <p className="tag">{"/* bring it to life */"}</p>
            <h1 className="display text-[clamp(46px,6vw,84px)] !leading-[.98] !tracking-[-0.05em]">
              Set up Nikxel
              <br />
              on your Mac.
            </h1>
            <p className="sub mt-5">
              It isn&apos;t on the App Store yet, so you build it yourself. Seven commands, copied and pasted. You only do it once.
            </p>
            <div className="meta">
              <span>⏱ About 10 minutes</span>
              <span>✦ Only once</span>
              <span>🍎 macOS 15+, Apple Silicon</span>
              <a href="#windows" className="underline decoration-2 underline-offset-4">🪟 Windows or 🐧 Linux? Jump down</a>
            </div>
          </div>
          <div className="enter" style={{ ["--d" as string]: ".12s" }}>
            <Plug />
          </div>
        </section>

        {/* WHAT YOU NEED */}
        <section className="wrap mt-6">
          <Reveal>
            <div className="rounded-[34px] bg-white/85 px-6 pb-10 pt-12 text-center shadow-[0_30px_70px_rgba(40,80,55,.1),inset_0_0_0_1.5px_var(--line)] md:px-12 md:pt-14">
              <h2 className="display text-[clamp(34px,4.4vw,60px)]">The one thing to know.</h2>
              <p className="sub mx-auto mt-4 max-w-[60ch]">
                Nikxel runs on your Mac, but the writing (your meeting minutes, your WhatsApp replies) comes from a{" "}
                <b className="text-ink">coding agent</b> you already use. Pick one in step 5 and Nikxel finds it on its own.
              </p>
              <div className="mx-auto mb-2 mt-9 flex flex-col items-center justify-center gap-3.5 md:flex-row">
                <div className="hw">
                  <span className="hw-ic text-[26px]">🍎</span>
                  <b>Your Mac</b>
                  <small>macOS 15+, Apple Silicon</small>
                </div>
                <i className="hw-arrow" />
                <div className="hw hot">
                  <span className="hw-ic term-ic">&gt;_</span>
                  <b>A coding agent</b>
                  <small>Claude Code, OpenCode, Codex or Antigravity</small>
                </div>
                <i className="hw-arrow" />
                <div className="hw">
                  <span className="hw-ic">
                    <Sprite mood="petted" size={48} />
                  </span>
                  <b>Nikxel</b>
                  <small>Built from source, once</small>
                </div>
              </div>
              <p className="mt-6 text-[14px] font-medium text-muted">
                Everything else (transcription, reminders, the moods) runs on your Mac. Nikxel itself is free and open source.
              </p>
            </div>
          </Reveal>
        </section>

        {/* THE STEPS */}
        <section className="wrap pb-10 pt-24">
          <SetupSteps />
        </section>

        {/* WINDOWS AND LINUX */}
        <section id="windows" className="py-24 md:py-32">
          <div className="wrap">
            <Reveal className="text-center">
              <p className="tag">{"/* not on a mac? */"}</p>
              <h2 className="display text-[clamp(34px,4.4vw,64px)]">Windows and Linux: one script.</h2>
              <p className="sub mx-auto mt-4">
                The same Nikxel, built from the same clone. You need Node.js 20+, Git and a coding agent. The script installs, builds, starts Nikxel and adds it to startup.
              </p>
            </Reveal>
            <div className="mt-14 grid gap-6 md:grid-cols-2">
              <Reveal>
                <p className="mb-3 text-[17px] font-bold">🪟 Windows 10 or 11, in PowerShell</p>
                <Terminal
                  title="PowerShell"
                  prompt="PS>"
                  script={[
                    { cmd: "git clone https://github.com/nikhildhanda04/nikxel.git" },
                    { out: "Cloning into 'nikxel'… done.", tone: "dim" },
                    { cmd: "cd nikxel\\windows" },
                    { cmd: ".\\setup.cmd" },
                    { spin: "Installing and building", ms: 2200 },
                    { out: "✓ Nikxel is running. Look for it in the tray (^).", tone: "ok" },
                  ]}
                />
                <p className="mt-3 text-[14.5px] font-medium text-muted">
                  Type the <code className="inline">{".\\"}</code> in front: PowerShell won&apos;t run a file from the current folder without it. Updates: Open Nikxel… → Advanced → Check for updates.
                </p>
              </Reveal>
              <Reveal delay={0.08}>
                <p className="mb-3 text-[17px] font-bold">🐧 Ubuntu 22.04 or 24.04 (early)</p>
                <Terminal
                  script={[
                    { cmd: "git clone https://github.com/nikhildhanda04/nikxel.git" },
                    { out: "Cloning into 'nikxel'… done.", tone: "dim" },
                    { cmd: "cd nikxel/windows" },
                    { cmd: "./setup.sh" },
                    { spin: "Installing and building", ms: 2200 },
                    { out: "✓ Nikxel is running. Tray icon: top right.", tone: "ok" },
                  ]}
                />
                <p className="mt-3 text-[14.5px] font-medium text-muted">
                  Linux is early: chat, the Nikxel window, WhatsApp and Google work; meeting audio is your mic only for now. To update, run <code className="inline">./setup.sh</code> again.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* THE SETUP WINDOW */}
        <section id="wizard" className="py-24 md:py-32">
          <div className="wrap">
            <Reveal className="text-center">
              <p className="tag">{"/* first launch */"}</p>
              <h2 className="display text-[clamp(34px,4.4vw,64px)]">Then it walks you through the rest.</h2>
              <p className="sub mx-auto mt-4">Same on every platform. A few screens, then a short practice tour of the app. Click through it right here.</p>
            </Reveal>
            <Reveal delay={0.1} y={32} className="mt-14">
              <Wizard />
            </Reveal>
          </div>
        </section>

        {/* TROUBLESHOOTING */}
        <section className="wrap py-16">
          <Reveal className="mb-10 text-center">
            <h2 className="display text-[clamp(34px,4.4vw,56px)]">If something&apos;s stuck.</h2>
          </Reveal>
          <Troubleshooting />
        </section>

        {/* END */}
        <section className="wrap grid justify-items-center pb-28 pt-16 text-center">
          <div className="hopper">
            <Sprite mood="done" size={128} />
          </div>
          <h2 className="display mt-3 text-[clamp(34px,4.4vw,60px)]">That&apos;s it. Go say hi.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={REPO} target="_blank" rel="noreferrer" className="pill dark">
              View on GitHub ↗
            </a>
            <Link href="/" className="pill">
              Back to Nikxel
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
