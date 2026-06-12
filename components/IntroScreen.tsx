import type { Project } from "@/types";

export const YELLOW = "#E3C896";        // Champagne Gold — headers, accents
export const GOLD_DEEP = "#B89A6C";     // Deep Gold — secondary labels
export const AMBER = "#FFE054";         // Neon Amber — glows, skill bars, metrics
export const AMBER_DEEP = "#FFAE00";    // Deep Amber — hover states
export const HIBISCUS = "#FA6B86";      // Soft Hibiscus Pink — decorative accents
export const STATUS_GREEN = "#39FF14";  // Tech Green — available badge, UI indicators
export const BG = "#1E0305";            // Deep Wine — main background
export const CARD_BG = "#2B0A0D";       // Dark Maroon — cards
export const BORDER = "#7A202C";        // Muted Crimson — borders
export const SHADOW = "#52131C";        // Rust Shadow — floating shadows

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
    role: "Solo — Product Design, Frontend, AI Integration",
    context: "Savvyra started as a personal frustration. I was staring at my own bank exports trying to figure out where my money was going — and realising no tool actually spoke to me in plain language. I decided to build one.",
    problem: "Most personal finance tools show you the data but make you do the thinking. Charts and tables don't tell you what changed or why it matters — so users either ignore the dashboard or export to a spreadsheet and do it manually anyway.",
    solution: "I built an AI layer on top of transaction data that generates plain-language summaries — not just 'you spent RM800 on food' but 'your food spending is 34% higher than last month, mostly driven by weekday lunches.' The interface is designed around insights, not tables.",
    outcome: "Reduced personal time-to-insight from around 15 minutes of manual spreadsheet work to under 30 seconds. The AI summary layer became the core differentiator — something users described as 'like having a financial advisor explain it to you.'",
    mockup_type: "both",
    screenshots: [],        // Add your screenshot URLs here
    github_url: "",         // Add your GitHub repo URL here
    live_url: "",           // Add your live URL here
    video_url: "",          // Add your promo video URL here
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
    role: "UI/UX Lead — Design System, Frontend Architecture",
    context: "OptimaBank was a GIFT programme capstone project. The brief was to redesign the core dashboard experience for a banking platform targeting Malaysian SMEs — owners managing multiple accounts, payroll, and payments through a single interface.",
    problem: "Legacy banking dashboards were built around bank operations, not user tasks. SME owners had to navigate 4–5 screens to complete a single workflow. The cognitive load was high, errors were common, and onboarding drop-off was significant during user testing.",
    solution: "I led the interface redesign with a task-flow-first approach — every screen was mapped to a user job-to-be-done before any visual work started. Built a component-level design system in Figma, then implemented the frontend with full TypeScript coverage and REST API integration.",
    outcome: "Onboarding drop-off reduced by 40% across user testing sessions. The design system cut frontend build time by roughly half for subsequent screens. The project was selected as a top-3 GIFT capstone submission.",
    mockup_type: "desktop",
    screenshots: [],
    github_url: "",
    live_url: "",
    video_url: "",
  },
  {
    id: 3,
    slug: "ordercalc",
    title: "OrderCalc",
    tagline: "Real-time order management calculator for F&B operations",
    type: "Systems",
    tech: ["React", "Firebase", "Framer Motion"],
    color: "#4ADE80",
    featured: true,
    role: "Solo — Product Design, Full Frontend Build",
    context: "During my internship, I watched the operations team manually calculate order totals across multiple product categories using Excel and a calculator side-by-side. Items would get missed. Prices would be wrong. Recalculating a changed order meant starting over.",
    problem: "Manual order processing in F&B environments is slow and error-prone. A single miscalculation on a bulk order affects inventory, pricing, and client trust — and there was no lightweight tool that fit how the team actually worked.",
    solution: "I designed and built a web-based order management tool with live inventory sync, auto-pricing rules per product category, and one-click printable order summaries. The interface was built around the team's existing workflow — not a new system they'd have to learn.",
    outcome: "Cut order processing time by 60% for the pilot client. Calculation errors dropped to near-zero. The tool was adopted into daily operations during my internship and continued in use after I left.",
    mockup_type: "desktop",
    screenshots: [],
    github_url: "",
    live_url: "",
    video_url: "",
  },
  {
    id: 4,
    slug: "portfoliosys",
    title: "Portfolio System",
    tagline: "This portfolio — a content-driven narrative system",
    type: "UI",
    tech: ["Next.js", "TypeScript", "Tailwind"],
    color: "#C084FC",
    featured: false,
    role: "Solo — Product Design, Frontend",
    context: "Most developer portfolios are static pages that list projects. I wanted to build something that functioned as a product — one that communicated how I think, not just what I've shipped.",
    problem: "A static portfolio can show your output but not your process. Recruiters and clients see the end result — they don't see the thinking behind product decisions, architecture choices, or design rationale.",
    solution: "Built a guided narrative system structured around case studies — each project surfaces problem, solution, role, and outcome in a format that mirrors how a real product review is presented. Animation-first design keeps it engaging without being gimmicky.",
    outcome: "Converts visitors into understanding me as a product builder, not just a frontend developer. The system is extensible — new projects slot in through a single constants file, and the CMS layer is planned for Phase 2.",
    mockup_type: "desktop",
    screenshots: [],
    github_url: "https://github.com/ariezaziera",
    live_url: "https://ariezaaziera-studio.vercel.app",
    video_url: "",
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
    role: "Solo — Product Design, Frontend",
    context: "I tried every kanban tool on the market. All of them were too heavy for solo work — too many features, too much setup, no time tracking built in where I actually needed it.",
    problem: "Popular project trackers are built for teams, not solo developers. They add overhead that slows you down rather than helping you ship. I needed something that started in under 10 seconds and didn't require an account.",
    solution: "Offline-first kanban with built-in time logging per task. No backend, no accounts — everything lives in IndexedDB. Tasks move across columns, time is logged per card, and weekly totals are visible at a glance.",
    outcome: "My daily active personal tool. 100% retention rate — yes, just me, but the fact that I keep using it over every other option is the real outcome.",
    mockup_type: "mobile",
    screenshots: [],
    github_url: "",
    live_url: "",
    video_url: "",
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
    role: "Solo — Design System Architecture",
    context: "After rebuilding the same button, modal, and input components three projects in a row, I decided the overhead of a personal component library was worth the investment.",
    problem: "Without a shared component base, every new project starts with a week of UI scaffolding. Inconsistencies creep in across projects. Dark mode has to be retrofitted. Typography and spacing drift.",
    solution: "Built a personal design system — CSS variable tokens for colour and spacing, 40+ React components documented in Storybook, and dark mode as a first-class citizen from day one.",
    outcome: "Reused across 4 active projects. Saves approximately 8 hours of setup per new project. Component decisions are made once, documented, and reliable.",
    mockup_type: "desktop",
    screenshots: [],
    github_url: "",
    live_url: "",
    video_url: "",
  },
];
