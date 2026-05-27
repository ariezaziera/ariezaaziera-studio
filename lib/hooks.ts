"use client";

import { useState, useEffect } from "react";
import { projects as localProjects } from "@/constants";
import type { Project } from "@/types";
import type { Profile } from "./data";

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

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(localProjects);

  useEffect(() => {
    import("./data").then(({ getProjects }) => {
      getProjects().then((data) => {
        if (data && data.length > 0) setProjects(data);
      });
    });
  }, []);

  return projects;
}

export function useFeaturedProjects() {
  const [projects, setProjects] = useState<Project[]>(
    localProjects.filter((p) => p.featured)
  );

  useEffect(() => {
    import("./data").then(({ getFeaturedProjects }) => {
      getFeaturedProjects().then((data) => {
        if (data && data.length > 0) setProjects(data);
      });
    });
  }, []);

  return projects;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);

  useEffect(() => {
    import("./data").then(({ getProfile }) => {
      getProfile().then((data) => {
        if (data) setProfile(data);
      });
    });
  }, []);

  return profile;
}
