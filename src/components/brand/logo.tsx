import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

/**
 * Y CONNECTOR logo.
 * ─────────────────────────────────────────────────────────────────────
 * TEMPORARY SVG RECREATION of the supplied logo (bold Y with yellow offset
 * strokes, yellow figure, orbital swoosh, script "outh", spaced CONNECTOR).
 * REPLACE: add the official file to /public/brand/ and set
 * NEXT_PUBLIC_LOGO_SRC=/brand/<file> — the official asset is then used.
 */

const Y_MAIN = "345,340 420,340 538,478 725,250 780,250 566,515 566,708 512,708 512,535";
const Y_SECOND = "775,318 828,318 647,545 647,708 597,708 597,535";

function MarkShapes({ swoosh = true }: { swoosh?: boolean }) {
  return (
    <>
      {swoosh && (
        <g fill="#FFCC00">
          <path d="M770 293 C 900 220, 1180 160, 1222 235 C 1252 292, 1180 362, 1080 436 C 1150 360, 1182 300, 1140 262 C 1090 214, 905 232, 770 293 Z" />
          <path d="M445 515 C 330 600, 228 722, 290 782 C 362 842, 562 792, 728 733 C 560 776, 382 792, 336 736 C 296 682, 360 592, 445 515 Z" />
        </g>
      )}
      <g fill="#FFCC00" transform="translate(-17 0)">
        <polygon points={Y_MAIN} />
        <polygon points={Y_SECOND} />
      </g>
      <polygon points="455,340 471,340 562,426 548,446" fill="#FFCC00" />
      <circle cx="555" cy="328" r="42" fill="#FFCC00" />
      <g fill="#111111">
        <polygon points={Y_MAIN} />
        <polygon points={Y_SECOND} />
      </g>
    </>
  );
}

/** Compact mark (Y + figure + orbit). */
export function LogoMark({ className, title = "Y Connector" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="250 170 1010 640" className={className} role="img" aria-label={title}>
      <MarkShapes />
    </svg>
  );
}

/** Full lock-up as supplied (Y + script "outh" + CONNECTOR). */
export function LogoFull({ className }: { className?: string }) {
  if (siteConfig.logoSrc) {
    return (
      <Image src={siteConfig.logoSrc} alt="Y Connector" width={1024} height={651} className={cn("h-auto w-full", className)} priority />
    );
  }
  return (
    <svg viewBox="240 160 1060 680" className={className} role="img" aria-label="Y Connector">
      <MarkShapes />
      <text x="668" y="628" fill="#111111" style={{ fontFamily: "var(--font-script), cursive", fontSize: 250 }}>
        outh
      </text>
      <text x="680" y="708" fill="#111111" style={{ fontFamily: "var(--font-geist-sans), sans-serif", fontSize: 50, fontWeight: 500, letterSpacing: "0.42em" }}>
        CONNECTOR
      </text>
    </svg>
  );
}

/** Header lock-up: the official logo, or the SVG mark + wordmark fallback. */
export function Logo({ className, imgClassName, inverted = false, href = "/" }: { className?: string; imgClassName?: string; inverted?: boolean; href?: string }) {
  if (siteConfig.logoSrc) {
    return (
      <Link href={href} className={cn("inline-flex shrink-0 items-center", className)} aria-label="Y Connector — home">
        <Image src={siteConfig.logoSrc} alt="Y Connector" width={1024} height={651} className={cn("h-14 w-auto", imgClassName)} priority />
      </Link>
    );
  }
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)} aria-label="Y Connector — home">
      <LogoMark className="h-9 w-auto transition-transform duration-500 group-hover:rotate-[-4deg]" title="" />
      <span className={cn("text-[15px] font-extrabold tracking-[0.14em]", inverted ? "text-white" : "text-ink")}>
        Y&nbsp;CONNECTOR
      </span>
    </Link>
  );
}
