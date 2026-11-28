import Link from "next/link";
import { Sprite } from "./Sprite";

export function Footer() {
  return (
    <footer className="overflow-hidden bg-[#1d2620] px-6 pt-16 text-center text-[#cfdcd2]">
      <div className="mx-auto mb-3 w-fit">
        <Sprite mood="idle" size={64} />
      </div>
      <p className="text-[22px] font-extrabold tracking-[-0.02em] text-white">Nikxel</p>
      <p className="mx-auto mt-2 max-w-[40ch] text-[17px] font-medium">Your meetings and your day, done for you. A pixel buddy for macOS and Windows.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2 text-[15px] font-semibold">
        <Link href="/#features" className="rounded-full px-4 py-2 hover:bg-white/10">Features</Link>
        <Link href="/#how" className="rounded-full px-4 py-2 hover:bg-white/10">How it works</Link>
        <Link href="/#team" className="rounded-full px-4 py-2 hover:bg-white/10">Teams</Link>
        {/* <Link href="/setup" className="rounded-full px-4 py-2 hover:bg-white/10">Setup</Link> */}
        <Link href="/signup" className="rounded-full px-4 py-2 text-pink-d hover:bg-white/10">Sign up</Link>
        <a href="mailto:hi@nikxel.ai" className="rounded-full px-4 py-2 hover:bg-white/10">hi@nikxel.ai</a>
      </div>
      {/* Giant wordmark, cut in half by the page's bottom edge and fading out toward the top. */}
      <p
        aria-hidden
        className="-mb-[0.36em] mt-14 select-none bg-[linear-gradient(to_top,var(--pink)_0%,var(--pink)_42%,rgb(143_217_168/.3)_75%,transparent_100%)] bg-clip-text text-[clamp(96px,36vw,640px)] font-extrabold leading-[0.78] tracking-[-0.06em] text-transparent"
      >
        nikxel
      </p>
    </footer>
  );
}
