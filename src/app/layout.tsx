import type { Metadata } from "next";
import { Caveat, DM_Sans } from "next/font/google";
import "./globals.css";

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

const hand = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "Nikxel — your meetings and your day, done for you",
  description:
    "Nikxel is a pixel buddy on your desktop that records your calls, writes the minutes, pushes them to the right project, runs your follow-ups, answers WhatsApp and writes up your day. On macOS and Windows, with your own AI agent.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${body.variable} ${hand.variable}`}>
      <body className="min-h-full overflow-x-clip">
        {/* Turbulence filters that give pills, blobs and cards their hand-cut edges. */}
        <svg width="0" height="0" className="absolute" aria-hidden>
          <filter id="wob">
            <feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="2" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="6" />
          </filter>
          <filter id="wobs">
            <feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="9" />
            <feDisplacementMap in="SourceGraphic" scale="3" />
          </filter>
        </svg>
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
