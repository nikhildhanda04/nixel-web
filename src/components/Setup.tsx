"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState, type ReactNode } from "react";
import { Keychain, Launch, Spotlight, Terminal } from "./Demos";
import { Reveal } from "./Reveal";

import { REPO } from "@/lib/links";

// Install commands match CodingAgent.installCommand in NikxelSettings.swift.
const AGENTS = [
  { name: "Claude Code", cmd: "npm install -g @anthropic-ai/claude-code" },
  { name: "OpenCode", cmd: "curl -fsSL https://opencode.ai/install | bash" },
  { name: "Codex", cmd: "npm install -g @openai/codex" },
];

const VERIFY_CERT = "security find-identity -p codesigning | grep Nikxel";
const BREW = '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"';

type Step = { title: string; body: ReactNode; cmds?: { label?: string; cmd: string }[]; aside?: ReactNode; tag?: string; art: ReactNode; tabs?: boolean };

/** The install guide: copy on one side, a little live demo of that step on the other. */
export function SetupSteps() {
  const [agent, setAgent] = useState(0);
  const a = AGENTS[agent];

  const steps: Step[] = [
    {
      title: "Open Terminal.",
      body: (
        <>
          Press <kbd>⌘</kbd> <kbd>Space</kbd>, type <b>Terminal</b>, and press <kbd>Return</kbd>. It&apos;s the
          Mac&apos;s little text window. Every step below happens in there.
        </>
      ),
      art: <Spotlight />,
    },
    {
      title: "Have the basics.",
      body: <>Apple&apos;s command line tools build the app; Homebrew installs the rest. Paste each line and press <kbd>Return</kbd>.</>,
      cmds: [
        { label: "Command line tools", cmd: "xcode-select --install" },
        { label: "Homebrew", cmd: BREW },
      ],
      aside: <>Already have both? Skip ahead to step 3.</>,
      art: (
        <Terminal
          script={[
            { cmd: "xcode-select --install" },
            { out: "A window pops up. Click Install.", tone: "dim" },
            { spin: "Installing command line tools…", ms: 2000 },
            { out: "✓ Command line tools installed", tone: "ok" },
            { cmd: "brew --version" },
            { out: "✓ Homebrew is ready", tone: "ok" },
          ]}
        />
      ),
    },
    {
      title: "Clone it.",
      body: <>Grab the source from GitHub and step into the folder.</>,
      cmds: [{ cmd: `git clone ${REPO} && cd nikxel` }],
      art: (
        <Terminal
          script={[
            { cmd: "git clone github.com/nikhildhanda04/nikxel" },
            { out: "Cloning into 'nikxel'…", tone: "dim" },
            { spin: "Receiving objects…", ms: 1600 },
            { out: "✓ Done", tone: "ok" },
            { cmd: "cd nikxel" },
          ]}
        />
      ),
    },
    {
      title: "Get the tools.",
      tag: "Optional",
      body: <>Whisper turns speech into text right on your Mac; ffmpeg reads the audio.</>,
      cmds: [{ cmd: "brew install whisper-cpp ffmpeg" }],
      aside: <>Skip this and the setup window installs them for you.</>,
      art: (
        <Terminal
          prompt="~/nikxel %"
          script={[
            { cmd: "brew install whisper-cpp ffmpeg" },
            { spin: "Installing whisper-cpp…", ms: 1500 },
            { spin: "Installing ffmpeg…", ms: 1500 },
            { out: "✓ whisper-cpp and ffmpeg installed", tone: "ok" },
          ]}
        />
      ),
    },
    {
      title: "Pick a coding agent.",
      body: <>It writes your meeting minutes (MOM) and your WhatsApp replies. Use whichever you already like.</>,
      tabs: true,
      cmds: [{ cmd: a.cmd }],
      art: (
        <Terminal
          prompt="~/nikxel %"
          script={[{ cmd: a.cmd }, { spin: `Installing ${a.name}…`, ms: 2200 }, { out: `✓ ${a.name} installed`, tone: "ok" }]}
        />
      ),
    },
    {
      title: "Sign it, once.",
      body: (
        <>
          Open <b>Keychain Access</b> → Certificate Assistant → <b>Create a Certificate</b>. Name it <b>Nikxel</b>, set the type to{" "}
          <b>Code Signing</b> and click Create. Your permissions then survive every rebuild.
        </>
      ),
      cmds: [{ label: "Check it worked", cmd: VERIFY_CERT }],
      art: <Keychain />,
    },
    {
      title: "Build it.",
      body: <>One script compiles the app and signs it with your certificate.</>,
      cmds: [{ cmd: "./build.sh" }],
      aside: (
        <>
          On macOS 26, run <code className="inline">GLASS=1 ./build.sh</code> for Liquid Glass bubbles.
        </>
      ),
      art: (
        <Terminal
          prompt="~/nikxel %"
          script={[
            { cmd: "./build.sh" },
            { spin: "Compiling Swift sources…", ms: 2200 },
            { out: "Signing with “Nikxel”…", tone: "dim" },
            { out: "✓ Built Nikxel.app", tone: "ok" },
          ]}
        />
      ),
    },
    {
      title: "Say hi.",
      body: <>Launch it. Nikxel puffs onto your desktop and the setup window opens: five screens, about a minute.</>,
      cmds: [{ cmd: "open Nikxel.app" }],
      art: <Launch />,
    },
  ];

  return (
    <div className="grid gap-[90px]">
      {steps.map((s, i) => (
        <article key={s.title} className="step">
          <Reveal y={32} className="st-copy min-w-0">
            <span className="st-n">{i + 1}</span>
            <h3>
              {s.title}
              {s.tag && <span className="label ml-3 inline-block -translate-y-2 rounded-full bg-butter px-2.5 py-1 align-middle text-[12px] tracking-normal">{s.tag}</span>}
            </h3>
            <p>{s.body}</p>
            {s.tabs && (
              <div className="mt-5 flex flex-wrap gap-2" role="radiogroup" aria-label="Coding agent">
                {AGENTS.map((ag, j) => (
                  <button
                    key={ag.name}
                    type="button"
                    role="radio"
                    aria-checked={agent === j}
                    onClick={() => setAgent(j)}
                    className={`rounded-full px-4 py-2 text-[14px] font-bold transition-colors ${
                      agent === j ? "bg-ink text-white" : "bg-white shadow-[inset_0_0_0_1.5px_var(--line)] hover:bg-blush"
                    }`}
                  >
                    {ag.name}
                  </button>
                ))}
              </div>
            )}
            {s.cmds?.map((c) => (
              <div key={c.label ?? c.cmd} className="mt-5">
                {c.label && <div className="label mb-2 text-muted">{c.label}</div>}
                <Command cmd={c.cmd} />
              </div>
            ))}
            {s.aside && <p className="aside">{s.aside}</p>}
          </Reveal>
          <Reveal y={32} delay={0.08} className="st-art">
            {s.art}
          </Reveal>
        </article>
      ))}
    </div>
  );
}

const FIXES: { q: string; a: ReactNode; cmd?: string }[] = [
  {
    q: "Terminal says “swiftc: command not found”.",
    a: "The command line tools are missing. Install them, then run the build again.",
    cmd: "xcode-select --install",
  },
  {
    q: "The build says “no identity found”.",
    a: "The certificate has to be named exactly Nikxel, with type Code Signing. Check it, then run ./build.sh again.",
    cmd: VERIFY_CERT,
  },
  {
    q: "macOS won’t open Nikxel.",
    a: (
      <>
        Open <b>System Settings → Privacy &amp; Security</b>, scroll down and click <b>Open Anyway</b>. You only do this once.
      </>
    ),
  },
  {
    q: "I said no to a permission.",
    a: (
      <>
        <b>System Settings → Privacy &amp; Security</b> → Accessibility, Microphone or Screen Recording. Turn Nikxel on, then quit and
        reopen it.
      </>
    ),
  },
  {
    q: "The WhatsApp QR code won’t connect.",
    a: (
      <>
        Click Nikxel in the menu bar → <b>Setup Wizard…</b>, go to Connect WhatsApp and scan the new code with WhatsApp → Linked
        devices.
      </>
    ),
  },
  {
    q: "Does it send my meetings anywhere?",
    a: "Transcription runs on your Mac with Whisper. Only the transcript goes to the coding agent you picked, to write the minutes.",
  },
];

export function Troubleshooting() {
  return (
    <div className="faq mx-auto grid max-w-[860px] gap-3">
      {FIXES.map((f) => (
        <details key={f.q}>
          <summary>{f.q}</summary>
          <div className="grid gap-4">
            <p>{f.a}</p>
            {f.cmd && <Command cmd={f.cmd} />}
          </div>
        </details>
      ))}
    </div>
  );
}

function Command({ cmd }: { cmd: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const codeRef = useRef<HTMLElement>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cmd);
      setState("copied");
    } catch {
      // Clipboard blocked: select the text so ⌘C still works.
      const el = codeRef.current;
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2200);
  };

  return (
    <div>
      <div className="flex items-center gap-2.5 rounded-2xl bg-[#1d2620] py-2 pl-[18px] pr-2 shadow-[0_14px_30px_rgba(30,45,35,.2)]">
        <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-[15px] font-semibold leading-normal text-[#e6efe8] [scrollbar-width:none]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={cmd}
              ref={codeRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
            >
              {cmd}
            </motion.span>
          </AnimatePresence>
        </code>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-[11px] bg-pink px-4 py-2.5 text-[14px] font-bold text-ink transition-transform hover:-translate-y-0.5 active:scale-95"
        >
          {state === "copied" ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <p role="status" className={state === "failed" ? "mt-1.5 text-[13px] font-semibold text-ink" : "sr-only"}>
        {state === "failed" ? "Couldn't copy. It's selected: press ⌘C." : ""}
      </p>
    </div>
  );
}
