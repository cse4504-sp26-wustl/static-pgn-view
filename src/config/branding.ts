/**
 * Tournament-specific presentation. Organizers fork the template and edit this file
 * (and optionally add assets under public/branding/). Parsing and PGN loading do not import this module.
 */
export const branding = {
  siteTitle: "Tournament games",
  /** Shown under the title on the home page. */
  tagline: "Sample static viewer — customize in src/config/branding.ts",
  /** Optional image under public/, e.g. "branding/logo.png" */
  logoSrc: null as string | null,
  /** CSS color strings for the header shell only. */
  headerBackground: "#1a365d",
  headerText: "#f7fafc",
  accent: "#ecc94b",
  linkColor: "#bee3f8",
} as const;
