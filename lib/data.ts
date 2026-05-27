import { supabase } from "./supabase";
import { projects as localProjects } from "@/constants";
import type { Project } from "@/types";

export interface Profile {
  name: string;
  title: string;
  tagline: string;
  about: string[];
  skills: string[];
  email: string;
  github: string;
  linkedin: string;
}

const defaultProfile: Profile = {
  name: "Long Nur Arieza",
  title: "Frontend Developer & Product Builder",
  tagline: "I build interactive web systems that turn ideas into usable products.",
  about: [
    "Frontend developer & product builder based in Malaysia. I bridge the gap between design thinking and production code — building systems that solve real problems, not just interfaces that look good.",
    "My edge: I start with the user's job-to-be-done, not the component library. Every product I ship is deliberately designed — I can tell you why each decision was made and what it solves.",
    "Currently focused on fintech dashboards, SaaS tools, and workflow systems. Open to roles where frontend work means owning outcomes, not just implementing tickets.",
  ],
  skills: ["React", "Next.js", "TypeScript", "Supabase", "Framer Motion", "Figma", "Node.js", "Tailwind"],
  email: "nurarieza@gmail.com",
  github: "https://github.com/ariezaziera",
  linkedin: "https://linkedin.com/in/ariezaaziera",
};

// ─── Projects ────────────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  if (!supabase) return localProjects;

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("id", { ascending: true });

  if (error || !data || data.length === 0) return localProjects;
  return data as Project[];
}

export async function getFeaturedProjects(): Promise<Project[]> {
  if (!supabase) return localProjects.filter((p) => p.featured);

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("featured", true)
    .order("id", { ascending: true });

  if (error || !data || data.length === 0) {
    return localProjects.filter((p) => p.featured);
  }
  return data as Project[];
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (!supabase) {
    return localProjects.find((p) => p.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return localProjects.find((p) => p.slug === slug) ?? null;
  }
  return data as Project;
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function getProfile(): Promise<Profile> {
  if (!supabase) return defaultProfile;

  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .single();

  if (error || !data) return defaultProfile;
  return {
    ...defaultProfile,
    ...data,
    about: Array.isArray(data.about) ? data.about : defaultProfile.about,
    skills: Array.isArray(data.skills) ? data.skills : defaultProfile.skills,
  };
}
