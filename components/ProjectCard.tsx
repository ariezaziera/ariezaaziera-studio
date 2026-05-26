"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { CARD_BG, BORDER } from "@/constants";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
  index: number;
  featured?: boolean;
}

export default function ProjectCard({ project, onClick, index, featured = false }: ProjectCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
    setTilt({ x, y });
  };

  return (
    <div
      ref={ref}
      onClick={() => onClick(project)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setTilt({ x: 0, y: 0 }); setHovered(false); }}
      style={{
        background: CARD_BG,
        border: `1px solid ${hovered ? project.color + "55" : BORDER}`,
        borderRadius: 12,
        padding: featured ? 28 : 22,
        cursor: "pointer",
        transform: visible
          ? `perspective(800px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateY(${hovered ? -4 : 0}px)`
          : "translateY(24px)",
        opacity: visible ? 1 : 0,
        transition: `opacity 0.6s ${index * 0.1}s ease, border-color 0.3s ease, transform 0.3s ease`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Color accent top */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: project.color, opacity: hovered ? 1 : 0.3, transition: "opacity 0.3s" }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: project.color + "22", border: `1px solid ${project.color}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: project.color, opacity: 0.8 }} />
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#555", letterSpacing: 1, padding: "4px 8px", border: `1px solid ${BORDER}`, borderRadius: 3 }}>
          {project.type.toUpperCase()}
        </div>
      </div>

      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: featured ? 22 : 18, color: "#fff", margin: "0 0 8px", letterSpacing: -0.5 }}>
        {project.title}
      </h3>
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#666", margin: "0 0 20px", lineHeight: 1.6 }}>
        {project.tagline}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
        {project.tech.map((t: string) => (
          <span key={t} style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: project.color, background: project.color + "15", padding: "3px 8px", borderRadius: 3, border: `1px solid ${project.color}30` }}>
            {t}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, color: project.color, fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: 1, opacity: hovered ? 1 : 0.5, transition: "opacity 0.2s" }}>
        VIEW CASE STUDY →
      </div>
    </div>
  );
}
