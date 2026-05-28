"use client";

import { useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { YELLOW, BORDER } from "@/constants";
import type { Project } from "@/types";
import ProjectCard from "@/components/ProjectCard";
import { useProjects } from "@/lib/hooks";

interface ProjectsPageProps {
  setActivePage: (page: string) => void;
  setActiveProject: (project: Project) => void;
}

export default function ProjectsPage({ setActivePage, setActiveProject }: ProjectsPageProps) {
  const projects = useProjects();
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Product", "Systems", "UI"];
  const filtered = filter === "All" ? projects : projects.filter((p) => p.type === filter);

  return (
    <div style={{ minHeight: "100vh", maxWidth: 1100, margin: "0 auto", padding: "clamp(20px,6vw,40px)", paddingTop: "clamp(80px, 10vw, 100px)" }}>
      <button
        onClick={() => setActivePage("home")}
        style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#555", background: "none", border: "none", cursor: "pointer", letterSpacing: 1, marginBottom: 40, padding: 0, display: "flex", alignItems: "center", gap: 8 }}
        onMouseEnter={(e: ReactMouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = YELLOW; }}
        onMouseLeave={(e: ReactMouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = "#555"; }}
      >
        ← BACK
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: YELLOW, letterSpacing: 3, whiteSpace: "nowrap" }}>04 — ALL WORK</div>
        <div style={{ flex: 1, height: 1, background: BORDER }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40, flexWrap: "wrap", gap: 20 }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "clamp(26px, 6vw, 48px)", margin: 0, letterSpacing: -1 }}>
          All <span style={{ color: YELLOW }}>Projects</span>
        </h1>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 1,
                padding: "7px 12px", borderRadius: 4, cursor: "pointer",
                background: filter === f ? YELLOW : "transparent",
                color: filter === f ? "#000" : "#666",
                border: `1px solid ${filter === f ? YELLOW : BORDER}`,
                fontWeight: filter === f ? 700 : 400,
                transition: "all 0.2s",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))", gap: 16 }}>
        {filtered.map((p, i) => (
          <ProjectCard
            key={p.id}
            project={p}
            index={i}
            onClick={(proj: Project) => { setActiveProject(proj); setActivePage("casestudy"); }}
          />
        ))}
      </div>
    </div>
  );
}