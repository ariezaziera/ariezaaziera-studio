"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { YELLOW, BORDER } from "@/constants";
import type { Project } from "@/types";
import { useFeaturedProjects } from "@/lib/hooks";

interface FeaturedSectionProps {
  setActivePage: (page: string) => void;
  setActiveProject: (project: Project) => void;
}

// ─── NEW: Ambient floating orbs behind the grid ───────────────────────────────
function AmbientOrbs() {
  const orbs = [
    { size: 340, x: "8%",  y: "15%", color: YELLOW,    delay: 0,   dur: 18 },
    { size: 260, x: "72%", y: "60%", color: "#60A5FA",  delay: 4,   dur: 22 },
    { size: 200, x: "45%", y: "80%", color: "#4ADE80",  delay: 8,   dur: 16 },
    { size: 180, x: "85%", y: "10%", color: YELLOW,    delay: 2,   dur: 20 },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {orbs.map((o, i) => (
        <div key={i} style={{
          position: "absolute",
          left: o.x, top: o.y,
          width: o.size, height: o.size,
          borderRadius: "50%",
          background: o.color,
          opacity: 0.022,
          filter: "blur(80px)",
          animation: `orbFloat${i} ${o.dur}s ${o.delay}s ease-in-out infinite alternate`,
        }} />
      ))}
      <style>{`
        @keyframes orbFloat0 { from { transform: translate(0,0) scale(1); } to { transform: translate(30px,-40px) scale(1.15); } }
        @keyframes orbFloat1 { from { transform: translate(0,0) scale(1); } to { transform: translate(-25px,35px) scale(0.9); } }
        @keyframes orbFloat2 { from { transform: translate(0,0) scale(1); } to { transform: translate(20px,-20px) scale(1.1); } }
        @keyframes orbFloat3 { from { transform: translate(0,0) scale(1); } to { transform: translate(-30px,25px) scale(0.95); } }
      `}</style>
    </div>
  );
}

// ─── NEW: Grain noise texture overlay ────────────────────────────────────────
function GrainOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 200; canvas.height = 200;
    const img = ctx.createImageData(200, 200);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = v; img.data[i+1] = v; img.data[i+2] = v;
      img.data[i+3] = Math.random() * 18;
    }
    ctx.putImageData(img, 0, 0);
  }, []);
  return (
    <canvas ref={canvasRef} style={{
      position: "absolute", inset: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 1, opacity: 0.35,
      backgroundRepeat: "repeat",
      mixBlendMode: "overlay",
    }} />
  );
}

// ─── NEW: Animated count-up number hook ──────────────────────────────────────
function useCountUp(target: number, active: boolean, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const timeout = setTimeout(() => {
      let start = 0;
      const step = Math.ceil(target / 20);
      const iv = setInterval(() => {
        start = Math.min(start + step, target);
        setVal(start);
        if (start >= target) clearInterval(iv);
      }, 40);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(timeout);
  }, [active, target, delay]);
  return val;
}

// ─── NEW: Project status pill — reads project.status from DB ─────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  "live":      { label: "LIVE",      color: "#4ADE80" },
  "in-dev":    { label: "IN DEV",    color: YELLOW },
  "completed": { label: "COMPLETED", color: "#60A5FA" },
  "archived":  { label: "ARCHIVED",  color: "#555" },
};

function StatusPill({ status }: { status?: string }) {
  const cfg = STATUS_CONFIG[status ?? "live"] ?? STATUS_CONFIG["live"];
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 10px", borderRadius: 999,
      border: `1px solid ${cfg.color}22`,
      background: cfg.color + "0d",
      marginBottom: 10,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: "50%",
        background: cfg.color,
        boxShadow: `0 0 5px ${cfg.color}`,
        animation: "statusPulse 2s ease-in-out infinite",
        display: "block",
      }} />
      <span style={{
        fontFamily: "'DM Mono', monospace", fontSize: 8,
        color: cfg.color, letterSpacing: 1.5,
      }}>
        {cfg.label}
      </span>
    </div>
  );
}

// ─── NEW: Shimmer scan line (used inside card on hover) ───────────────────────
function ScanLine({ active }: { active: boolean }) {
  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden",
      borderRadius: "inherit",
    }}>
      <div style={{
        position: "absolute", left: 0, right: 0, height: "35%",
        background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.025) 50%, transparent)",
        top: active ? "120%" : "-40%",
        transition: active ? "top 0.55s cubic-bezier(0.22,1,0.36,1)" : "none",
      }} />
    </div>
  );
}

// ─── NEW: Hover metric strip ──────────────────────────────────────────────────
function MetricStrip({ project, visible }: { project: Project; visible: boolean }) {
  const metrics = (project as any).metrics as Array<{ label: string; value: string }> | undefined;
  if (!metrics?.length) return null;
  return (
    <div style={{
      display: "flex", gap: 0,
      borderTop: "1px solid #1a1a1a",
      marginTop: 16,
      paddingTop: 14,
      opacity: visible ? 1 : 0,
      maxHeight: visible ? 60 : 0,
      overflow: "hidden",
      transition: "opacity 0.35s 0.05s, max-height 0.35s",
    }}>
      {metrics.slice(0, 3).map((m, i) => (
        <div key={i} style={{
          flex: 1,
          borderRight: i < metrics.slice(0,3).length - 1 ? "1px solid #1a1a1a" : "none",
          padding: "0 12px",
          ...(i === 0 ? { paddingLeft: 0 } : {}),
        }}>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: 15,
            color: (project as any).color || YELLOW,
            letterSpacing: -0.5,
          }}>
            {m.value}
          </div>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 8, color: "#3a3a3a",
            letterSpacing: 1, marginTop: 2,
          }}>
            {m.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function FeaturedCard({ project, onClick, index, large = false }: {
  project: Project;
  onClick: (p: Project) => void;
  index: number;
  large?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // NEW: count-up for corner number
  const countedIndex = useCountUp(index + 1, visible, index * 120);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x: px, y: py });
    const tx = ((e.clientX - rect.left) / rect.width - 0.5) * (large ? 8 : 10);
    const ty = ((e.clientY - rect.top) / rect.height - 0.5) * -(large ? 8 : 10);
    setTilt({ x: tx, y: ty });
  };

  return (
    <div
      ref={ref}
      onClick={() => onClick(project)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setTilt({ x: 0, y: 0 }); setHovered(false); setMousePos({ x: 50, y: 50 }); }}
      style={{
        position: "relative",
        background: "#0a0a0a",
        border: `1px solid ${hovered ? project.color + "40" : "#1c1c1c"}`,
        borderRadius: large ? 20 : 16,
        padding: large ? "36px 32px" : "24px 22px",
        cursor: "pointer",
        overflow: "hidden",
        transform: visible
          ? `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateY(${hovered ? -6 : 0}px)`
          : `translateY(40px)`,
        opacity: visible ? 1 : 0,
        transition: `opacity 0.7s ${index * 0.12}s ease, transform 0.4s ease, border-color 0.3s`,
        gridColumn: large ? "span 2" : "span 1",
      }}
    >
      {/* Spotlight glow that follows mouse */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(320px circle at ${mousePos.x}% ${mousePos.y}%, ${project.color}12, transparent 65%)`,
        transition: hovered ? "none" : "opacity 0.4s",
        opacity: hovered ? 1 : 0,
      }} />

      {/* Top accent bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${project.color}, ${project.color}00)`,
        opacity: hovered ? 1 : 0.25,
        transition: "opacity 0.3s",
      }} />

      {/* Corner number — NEW: uses count-up value */}
      <div style={{
        position: "absolute", top: large ? 28 : 20, right: large ? 28 : 20,
        fontFamily: "'DM Mono', monospace", fontSize: large ? 48 : 36,
        color: project.color, opacity: hovered ? 0.08 : 0.04,
        fontWeight: 700, lineHeight: 1,
        transition: "opacity 0.3s",
        userSelect: "none",
      }}>
        {String(countedIndex).padStart(2, "0")}
      </div>

      {/* NEW: scan line sweep on hover */}
      <ScanLine active={hovered} />

      {/* Type badge */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6, marginBottom: large ? 24 : 18,
        fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: 2,
        color: project.color, border: `1px solid ${project.color}30`,
        background: project.color + "10",
        padding: "4px 10px", borderRadius: 20,
      }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: project.color }} />
        {project.type.toUpperCase()}
      </div>

      {/* NEW: status pill — reads from project.status */}
      <div style={{ marginBottom: large ? 8 : 4 }}>
        <StatusPill status={project.status} />
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 800,
        fontSize: large ? "clamp(28px, 4vw, 38px)" : "clamp(18px, 3vw, 22px)",
        color: "#fff",
        margin: `0 0 ${large ? 10 : 8}px`,
        letterSpacing: -1,
        lineHeight: 1.1,
        transition: "color 0.2s",
      }}>
        {project.title}
      </h3>

      {/* Tagline */}
      <p style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: large ? 12 : 11,
        color: "#555",
        margin: `0 0 ${large ? 28 : 20}px`,
        lineHeight: 1.7,
        maxWidth: large ? 420 : "100%",
      }}>
        {project.tagline}
      </p>

      {/* Tech chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: large ? 32 : 22 }}>
        {project.tech.slice(0, large ? 6 : 3).map((t: string) => (
          <span key={t} style={{
            fontFamily: "'DM Mono', monospace", fontSize: 9,
            color: "#666",
            background: "#ffffff08",
            padding: "3px 10px", borderRadius: 4,
            border: "1px solid #ffffff0d",
          }}>
            {t}
          </span>
        ))}
        {project.tech.length > (large ? 6 : 3) && (
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#444",
            padding: "3px 8px",
          }}>
            +{project.tech.length - (large ? 6 : 3)} more
          </span>
        )}
      </div>

      {/* CTA */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        fontFamily: "'DM Mono', monospace", fontSize: 10,
        color: project.color, fontWeight: 700, letterSpacing: 1.5,
      }}>
        <span style={{ opacity: hovered ? 1 : 0.45, transition: "opacity 0.2s" }}>
          VIEW CASE STUDY
        </span>
        <span style={{
          display: "inline-block",
          transform: `translateX(${hovered ? 6 : 0}px)`,
          transition: "transform 0.25s ease",
          opacity: hovered ? 1 : 0.45,
        }}>→</span>
      </div>

      {/* NEW: metric strip revealed on hover */}
      <MetricStrip project={project} visible={hovered} />
    </div>
  );
}

export default function FeaturedSection({ setActivePage, setActiveProject }: FeaturedSectionProps) {
  const featuredProjects = useFeaturedProjects();
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setHeaderVisible(true); },
      { threshold: 0.1 }
    );
    if (headerRef.current) obs.observe(headerRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="projects-featured" style={{ padding: "80px clamp(20px, 6vw, 40px)", maxWidth: 900, margin: "0 auto", position: "relative" }}>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes statusPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.8); }
        }
        @media (max-width: 640px) {
          .featured-grid {
            grid-template-columns: 1fr !important;
          }
          .featured-grid > div[style*="span 2"] {
            grid-column: span 1 !important;
          }
        }
      `}</style>

      {/* NEW: ambient orbs */}
      <AmbientOrbs />

      {/* NEW: grain overlay */}
      <GrainOverlay />

      {/* Header */}
      <div ref={headerRef} style={{ position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: YELLOW, letterSpacing: 3, whiteSpace: "nowrap" }}>03 — PROOF</div>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-end",
          marginBottom: 40, flexWrap: "wrap", gap: 16,
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? "none" : "translateY(16px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800,
            fontSize: "clamp(22px, 5vw, 36px)", margin: 0, letterSpacing: -1,
          }}>
            Featured <span style={{ color: YELLOW }}>Work</span>
          </h2>
          <button
            onClick={() => setActivePage("projects")}
            style={{
              fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#666",
              background: "none", border: `1px solid ${BORDER}`,
              padding: "8px 16px", borderRadius: 3, cursor: "pointer",
              letterSpacing: 1, transition: "color 0.2s, border-color 0.2s", whiteSpace: "nowrap",
            }}
            onMouseEnter={(e: ReactMouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = YELLOW; e.currentTarget.style.borderColor = YELLOW; }}
            onMouseLeave={(e: ReactMouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = "#666"; e.currentTarget.style.borderColor = BORDER; }}
          >
            VIEW ALL →
          </button>
        </div>
      </div>

      {/* Bento grid */}
      <div
        className="featured-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
          position: "relative",
          zIndex: 2,
        }}
      >
        {featuredProjects.map((p, i) => (
          <FeaturedCard
            key={p.id}
            project={p}
            index={i}
            large={i === 0}
            onClick={(proj) => { setActiveProject(proj); setActivePage("casestudy"); }}
          />
        ))}
      </div>

      {/* Marquee ticker */}
      <div style={{
        marginTop: 40, overflow: "hidden",
        borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`,
        padding: "12px 0",
        maskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
        position: "relative", zIndex: 2,
      }}>
        <div style={{
          display: "flex", gap: 0,
          animation: "marquee 22s linear infinite",
          width: "max-content",
        }}>
          {[...Array(2)].map((_, ri) => (
            <div key={ri} style={{ display: "flex", alignItems: "center", gap: 0 }}>
              {featuredProjects.flatMap((p) =>
                p.tech.map((t: string, ti: number) => (
                  <span key={`${ri}-${p.id}-${ti}`} style={{
                    fontFamily: "'DM Mono', monospace", fontSize: 10,
                    color: "#333", letterSpacing: 2, padding: "0 20px",
                    display: "flex", alignItems: "center", gap: 20, whiteSpace: "nowrap",
                  }}>
                    {t}
                    <span style={{ color: "#222", fontSize: 6 }}>◆</span>
                  </span>
                ))
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
