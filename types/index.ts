import type { SplitScreenshots } from "./split-screenshots";

export interface Project {
  id: number;
  slug: string;
  title: string;
  tagline: string;
  type: string;
  tech: string[];
  color: string;
  featured: boolean;
  role: string;
  context: string;
  problem: string;
  solution: string;
  outcome: string;
  image_url?: string;

  // ── Media ────────────────────────────────────────────
  // New split format: { mobile: string[], desktop: string[] }
  // Legacy: flat string[] (treated as mobile-only on read)
  screenshots?: SplitScreenshots | string[];

  // mockup_type is now auto-derived from screenshots content.
  // Kept for backward compatibility but no longer manually set.
  mockup_type?: "mobile" | "desktop" | "both";

  video_url?: string;
  github_url?: string;
  live_url?: string;
}

// Re-export for convenience
export type { SplitScreenshots };
