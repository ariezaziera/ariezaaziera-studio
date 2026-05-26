"use client";

import type { MouseEvent as ReactMouseEvent } from "react";
import { YELLOW, BORDER, projects } from "@/constants";
import type { Project } from "@/types";
import ProjectCard from "@/components/ProjectCard";

interface FeaturedSectionProps {
  setActivePage: (page: string) => void;
  setActiveProject: (project: Project) => void;
}

export default function FeaturedSection({ setActivePage, setActiveProject }: FeaturedSectionProps) {
  const featuredProjects = projects.filter((p) => p.featured);

  return (
    <section id="projects-featured" style={{ padding: "120px 40px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: YELLOW, letterSpacing: 3 }}>03 — PROOF</div>
        <div style={{ flex: 1, height: 1, background: BORDER }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48 }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "clamp(24px, 4vw, 36px)", margin: 0, letterSpacing: -1 }}>
          Featured <span style={{ color: YELLOW }}>Work</span>
        </h2>
        <button
          onClick={() => setActivePage("projects")}
          style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#666", background: "none", border: `1px solid ${BORDER}`, padding: "8px 16px", borderRadius: 3, cursor: "pointer", letterSpacing: 1, transition: "color 0.2s, border-color 0.2s" }}
          onMouseEnter={(e: ReactMouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = YELLOW; e.currentTarget.style.borderColor = YELLOW; }}
          onMouseLeave={(e: ReactMouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = "#666"; e.currentTarget.style.borderColor = BORDER; }}
        >
          VIEW ALL →
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
        {featuredProjects.map((p, i) => (
          <ProjectCard
            key={p.id}
            project={p}
            index={i}
            featured
            onClick={(proj) => { setActiveProject(proj); setActivePage("casestudy"); }}
          />
        ))}
      </div>
    </section>
  );
}
