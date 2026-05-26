import type { Project } from "@/types";

export const YELLOW = "#F5C542";
export const BG = "#080808";
export const CARD_BG = "#0f0f0f";
export const BORDER = "#1a1a1a";

export const navLinks = ["Home", "About", "Projects", "Contact"];

export const projects: Project[] = [
  {
    id: 1,
    slug: "savvyra",
    title: "Savvyra",
    tagline: "AI-powered financial insight dashboard",
    type: "Product",
    tech: ["Next.js", "Supabase", "OpenAI", "Tailwind"],
    color: "#F5C542",
    featured: true,
    problem: "Users couldn't understand their spending patterns without a finance degree.",
    solution: "Built an AI layer that translates raw transaction data into plain-language insights with visual breakdowns.",
    outcome: "Reduced time-to-insight from 15 minutes to under 30 seconds.",
  },
  {
    id: 2,
    slug: "optimabank",
    title: "OptimaBank",
    tagline: "Modern banking UI system for SMEs",
    type: "Systems",
    tech: ["React", "TypeScript", "Figma", "REST API"],
    color: "#60A5FA",
    featured: true,
    problem: "Legacy banking interfaces frustrated SME owners managing multiple accounts.",
    solution: "Redesigned the core dashboard with task-flow thinking — built for speed, not aesthetics first.",
    outcome: "Onboarding drop-off reduced by 40% in user testing.",
  },
  {
    id: 3,
    slug: "ordercalc",
    title: "OrderCalc",
    tagline: "Real-time order management calculator",
    type: "Systems",
    tech: ["React", "Firebase", "Framer Motion"],
    color: "#4ADE80",
    featured: true,
    problem: "F&B operators were calculating orders manually — slow, error-prone.",
    solution: "Web app with live inventory sync, auto-pricing rules, and printable summaries.",
    outcome: "Cut order processing time by 60% for pilot client.",
  },
  {
    id: 4,
    slug: "portfoliosys",
    title: "Portfolio System",
    tagline: "This portfolio — a content-driven narrative system",
    type: "UI",
    tech: ["Next.js", "Framer Motion", "Supabase"],
    color: "#C084FC",
    featured: false,
    problem: "Most developer portfolios are static and forgettable.",
    solution: "Built a guided narrative system with a CMS backbone and animation-first design.",
    outcome: "Converts visitors into understanding capability as a product builder.",
  },
  {
    id: 5,
    slug: "taskflow",
    title: "TaskFlow",
    tagline: "Minimal project tracker with kanban + time log",
    type: "Product",
    tech: ["React", "IndexedDB", "CSS Modules"],
    color: "#FB923C",
    featured: false,
    problem: "Project trackers were too heavy for solo devs.",
    solution: "Offline-first kanban with built-in time logging per task.",
    outcome: "Daily active personal tool — 100% retention (just me, but still).",
  },
  {
    id: 6,
    slug: "uikit",
    title: "Component Library",
    tagline: "Dark-mode UI kit with 40+ reusable components",
    type: "UI",
    tech: ["React", "Storybook", "CSS Variables"],
    color: "#F87171",
    featured: false,
    problem: "Rebuilding the same components across every project wasted hours.",
    solution: "Built a personal design system — tokens, components, docs in Storybook.",
    outcome: "Reused across 4 active projects. Saved ~8hrs per new project.",
  },
];
