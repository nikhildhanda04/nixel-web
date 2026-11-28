import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Sprite, type Mood } from "@/components/Sprite";
import { API } from "@/lib/links";

export const metadata: Metadata = {
  title: "Sign up · Nikxel",
  description: "Sign up with your email or Google and we'll mail you Nikxel for Mac and Windows.",
};

const ERRORS: Record<string, string> = {
  email: "That doesn’t look like an email address. Try again?",
  link: "That link has expired or was already used. Enter your email again for a fresh one.",
  google: "Google sign-in didn’t finish. Try again, or use your email.",
  mail: "We couldn’t send the mail just now. Try again in a minute.",
};

/**
 * "Sign up to use". The form posts straight to nikxel-api, which mails a verify link (or, with
 * Google, the downloads right away) and sends the browser back here with what happened:
 * ?sent=1&email=… · ?verified=1 · ?unsubscribed=1 · ?error=email|link|google|mail
 */
// The query string is per request, so the card renders inside Suspense and the rest prerenders.
export default function Signup({ searchParams }: PageProps<"/signup">) {
  return (
    <>
      <Nav />
      <main className="grid min-h-[100svh] place-items-center px-4 pb-24 pt-32">
        <Suspense fallback={<div className="sticker h-[520px] w-full max-w-[520px]" />}>
          <Card searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

async function Card({ searchParams }: Pick<PageProps<"/signup">, "searchParams">) {
  const sp = await searchParams;
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k][0] : sp[k]) ?? "";
  const email = one("email");
  const error = ERRORS[one("error")];

  let mood: Mood = "idle", title, body;
  if (one("verified")) {
    mood = "done";
    title = <>You&apos;re <span className="bub">in</span>!</>;
    body = <>We&apos;ve mailed the download links for Mac and Windows{email ? <> to <b className="text-ink">{email}</b></> : null}. Open it on your computer and pick yours.</>;
  } else if (one("sent")) {
    mood = "alert";
    title = <>Check your <span className="bub">inbox</span>.</>;
    body = <>We&apos;ve sent a mail to <b className="text-ink">{email || "you"}</b>. Tap <b className="text-ink">Confirm my email</b> in it and the download links follow straight away. Nothing there? Check spam, or send it again below.</>;
  } else if (one("unsubscribed")) {
    title = <>You&apos;re <span className="bub">unsubscribed</span>.</>;
    body = <>No more mail from us. Your download links still work.</>;
  } else {
    mood = "petted";
    title = <>Sign up to <span className="bub">use</span> Nikxel.</>;
    body = <>Enter your email and we&apos;ll send you Nikxel for Mac and Windows.</>;
  }

  return (
    <div className="sticker grid w-full max-w-[520px] justify-items-center gap-5 px-6 py-10 text-center md:px-10">
      <div className="hopper">
        <Sprite mood={mood} size={128} />
      </div>
      <h1 className="display text-[clamp(34px,5vw,52px)]">{title}</h1>
      <p className="text-[17px] font-medium leading-relaxed text-muted">{body}</p>

      {error && (
        <p role="alert" className="w-full rounded-2xl bg-peach px-4 py-3 text-[15px] font-semibold text-ink">
          {error}
        </p>
      )}

      {!one("verified") && !one("unsubscribed") && (
        <>
          <form action={`${API}/api/signup`} method="post" className="grid w-full gap-3">
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={email}
              placeholder="you@company.com"
              className="w-full rounded-full bg-paper px-5 py-3.5 text-[16px] font-medium text-ink shadow-[inset_0_0_0_1.5px_var(--line)] outline-none focus:shadow-[inset_0_0_0_2px_var(--pink-deep)]"
            />
            <button type="submit" className="pill dark justify-center">
              {one("sent") ? "Send it again" : "Email me the download"}
            </button>
          </form>
          <div className="flex w-full items-center gap-3 text-[13px] font-semibold text-muted">
            <span className="h-px flex-1 bg-line" />
            or
            <span className="h-px flex-1 bg-line" />
          </div>
          <a href={`${API}/api/signup/google`} className="pill w-full justify-center">
            <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
            </svg>
            Continue with Google
          </a>
          <p className="text-[13px] font-medium text-muted">We&apos;ll only mail you about Nikxel. Unsubscribe any time.</p>
        </>
      )}

      {(one("verified") || one("unsubscribed")) && (
        <Link href="/" className="pill">
          ← Back to Nikxel
        </Link>
      )}
    </div>
  );
}
