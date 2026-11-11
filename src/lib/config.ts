/**
 * Central runtime configuration. Server-only secrets are read lazily inside
 * server modules — never import secret values into client components.
 */
export const siteConfig = {
  name: "Y Connector",
  tagline: "Connecting the next generation of builders.",
  description:
    "A grassroots UK community connecting young founders, students and graduates with practical AI and digital skills, each other, and real opportunities.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contactEmail: "hello@yconnector.example", // PLACEHOLDER — replace before launch
  /**
   * Set to "/brand/y-connector-logo.png" (or .svg) once the official logo file
   * is added to /public/brand. Until then a faithful SVG recreation is used.
   */
  logoSrc: process.env.NEXT_PUBLIC_LOGO_SRC ?? "",
  socials: {
    linkedin: "#", // PLACEHOLDER
    instagram: "#", // PLACEHOLDER
    x: "#", // PLACEHOLDER
    tiktok: "#", // PLACEHOLDER
  },
};

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export const isStripeConfigured = Boolean(
  process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_PRICE_ESSEX_ALUMNI &&
    process.env.STRIPE_PRICE_STANDARD,
);

/** Demo mode = no Supabase credentials; uses an in-memory store with sample personas. */
export const isDemoMode = !isSupabaseConfigured;
