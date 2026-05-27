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
}