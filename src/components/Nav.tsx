import Link from "next/link";
import { REPO } from "@/lib/links";
import { Sprite } from "./Sprite";

const LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#play", label: "Play" },
  { href: "/#moods", label: "Moods" },
  { href: "/setup", label: "Setup" },
  { href: REPO, label: "GitHub" },
];

/** Frosted pill that floats over the board. */
export function Nav({ active }: { active?: string }) {
  return (
    <header className="fixed left-1/2 top-3.5 z-50 flex w-[min(1240px,calc(100%-32px))] -translate-x-1/2 items-center justify-between gap-4 rounded-full bg-white/80 py-2 pl-3 pr-2.5 shadow-[0_10px_30px_rgba(60,100,70,.1),inset_0_0_0_1px_#e1eee0] backdrop-blur-lg">
      <Link href="/" className="flex items-center gap-2 text-[18px] font-extrabold tracking-[-0.02em]">
        <Sprite mood="idle" size={36} />
        Nikxel
      </Link>
      <nav className="hidden gap-1 text-[15px] font-semibold md:flex">
        {LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className={`link-draw ${active === l.href ? "!bg-blush !text-ink" : ""}`}
            {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
          >
            {l.label}
          </a>
        ))}
      </nav>
      <Link href="/setup" className="pill dark small">
        Set it up
      </Link>
    </header>
  );
}
