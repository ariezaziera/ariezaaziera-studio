-- ─── Profile ─────────────────────────────────────────────────────────────────

insert into profile (name, title, tagline, about, skills, email, github, linkedin)
values (
  'Long Nur Arieza',
  'Frontend Developer & Product Builder',
  'I build interactive web systems that turn ideas into usable products.',
  array[
    'Frontend developer & product builder based in Malaysia. I bridge the gap between design thinking and production code — building systems that solve real problems, not just interfaces that look good.',
    'My edge: I start with the user''s job-to-be-done, not the component library. Every product I ship is deliberately designed — I can tell you why each decision was made and what it solves.',
    'Currently focused on fintech dashboards, SaaS tools, and workflow systems. Open to roles where frontend work means owning outcomes, not just implementing tickets.'
  ],
  array['React', 'Next.js', 'TypeScript', 'Supabase', 'Framer Motion', 'Figma', 'Node.js', 'Tailwind'],
  'nurarieza@gmail.com',
  'https://github.com/ariezaziera',
  'https://linkedin.com/in/ariezaaziera'
);

-- ─── Projects ────────────────────────────────────────────────────────────────

insert into projects (slug, title, tagline, type, tech, color, featured, role, context, problem, solution, outcome)
values
(
  'savvyra',
  'Savvyra',
  'AI-powered financial insight dashboard',
  'Product',
  array['Next.js', 'Supabase', 'OpenAI', 'Tailwind'],
  '#F5C542',
  true,
  'Solo — Product Design, Frontend, AI Integration',
  'Savvyra started as a personal frustration. I was staring at my own bank exports trying to figure out where my money was going — and realising no tool actually spoke to me in plain language. I decided to build one.',
  'Most personal finance tools show you the data but make you do the thinking. Charts and tables don''t tell you what changed or why it matters — so users either ignore the dashboard or export to a spreadsheet and do it manually anyway.',
  'I built an AI layer on top of transaction data that generates plain-language summaries — not just ''you spent RM800 on food'' but ''your food spending is 34% higher than last month, mostly driven by weekday lunches.'' The interface is designed around insights, not tables.',
  'Reduced personal time-to-insight from around 15 minutes of manual spreadsheet work to under 30 seconds. The AI summary layer became the core differentiator — something users described as ''like having a financial advisor explain it to you.'''
),
(
  'optimabank',
  'OptimaBank',
  'Modern banking UI system for SMEs',
  'Systems',
  array['React', 'TypeScript', 'Figma', 'REST API'],
  '#60A5FA',
  true,
  'UI/UX Lead — Design System, Frontend Architecture',
  'OptimaBank was a GIFT programme capstone project. The brief was to redesign the core dashboard experience for a banking platform targeting Malaysian SMEs — owners managing multiple accounts, payroll, and payments through a single interface.',
  'Legacy banking dashboards were built around bank operations, not user tasks. SME owners had to navigate 4–5 screens to complete a single workflow. The cognitive load was high, errors were common, and onboarding drop-off was significant during user testing.',
  'I led the interface redesign with a task-flow-first approach — every screen was mapped to a user job-to-be-done before any visual work started. Built a component-level design system in Figma, then implemented the frontend with full TypeScript coverage and REST API integration.',
  'Onboarding drop-off reduced by 40% across user testing sessions. The design system cut frontend build time by roughly half for subsequent screens. The project was selected as a top-3 GIFT capstone submission.'
),
(
  'ordercalc',
  'OrderCalc',
  'Real-time order management calculator for F&B operations',
  'Systems',
  array['React', 'Firebase', 'Framer Motion'],
  '#4ADE80',
  true,
  'Solo — Product Design, Full Frontend Build',
  'During my internship, I watched the operations team manually calculate order totals across multiple product categories using Excel and a calculator side-by-side. Items would get missed. Prices would be wrong. Recalculating a changed order meant starting over.',
  'Manual order processing in F&B environments is slow and error-prone. A single miscalculation on a bulk order affects inventory, pricing, and client trust — and there was no lightweight tool that fit how the team actually worked.',
  'I designed and built a web-based order management tool with live inventory sync, auto-pricing rules per product category, and one-click printable order summaries. The interface was built around the team''s existing workflow — not a new system they''d have to learn.',
  'Cut order processing time by 60% for the pilot client. Calculation errors dropped to near-zero. The tool was adopted into daily operations during my internship and continued in use after I left.'
),
(
  'portfoliosys',
  'Portfolio System',
  'This portfolio — a content-driven narrative system',
  'UI',
  array['Next.js', 'TypeScript', 'Tailwind'],
  '#C084FC',
  false,
  'Solo — Product Design, Frontend',
  'Most developer portfolios are static pages that list projects. I wanted to build something that functioned as a product — one that communicated how I think, not just what I''ve shipped.',
  'A static portfolio can show your output but not your process. Recruiters and clients see the end result — they don''t see the thinking behind product decisions, architecture choices, or design rationale.',
  'Built a guided narrative system structured around case studies — each project surfaces problem, solution, role, and outcome in a format that mirrors how a real product review is presented. Animation-first design keeps it engaging without being gimmicky.',
  'Converts visitors into understanding me as a product builder, not just a frontend developer. The system is extensible — new projects slot in through a single constants file, and the CMS layer is planned for Phase 2.'
),
(
  'taskflow',
  'TaskFlow',
  'Minimal project tracker with kanban + time log',
  'Product',
  array['React', 'IndexedDB', 'CSS Modules'],
  '#FB923C',
  false,
  'Solo — Product Design, Frontend',
  'I tried every kanban tool on the market. All of them were too heavy for solo work — too many features, too much setup, no time tracking built in where I actually needed it.',
  'Popular project trackers are built for teams, not solo developers. They add overhead that slows you down rather than helping you ship. I needed something that started in under 10 seconds and didn''t require an account.',
  'Offline-first kanban with built-in time logging per task. No backend, no accounts — everything lives in IndexedDB. Tasks move across columns, time is logged per card, and weekly totals are visible at a glance.',
  'My daily active personal tool. 100% retention rate — yes, just me, but the fact that I keep using it over every other option is the real outcome.'
),
(
  'uikit',
  'Component Library',
  'Dark-mode UI kit with 40+ reusable components',
  'UI',
  array['React', 'Storybook', 'CSS Variables'],
  '#F87171',
  false,
  'Solo — Design System Architecture',
  'After rebuilding the same button, modal, and input components three projects in a row, I decided the overhead of a personal component library was worth the investment.',
  'Without a shared component base, every new project starts with a week of UI scaffolding. Inconsistencies creep in across projects. Dark mode has to be retrofitted. Typography and spacing drift.',
  'Built a personal design system — CSS variable tokens for colour and spacing, 40+ React components documented in Storybook, and dark mode as a first-class citizen from day one.',
  'Reused across 4 active projects. Saves approximately 8 hours of setup per new project. Component decisions are made once, documented, and reliable.'
);
