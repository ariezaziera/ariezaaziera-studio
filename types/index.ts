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
  // New media fields
  screenshots?: string[];          // Array of image URLs
  mockup_type?: "mobile" | "desktop" | "both";  // Which device frame to show
  video_url?: string;              // Promo video URL (YouTube, direct mp4, etc)
  github_url?: string;             // GitHub repo link
  live_url?: string;               // Deployed/live URL
}
