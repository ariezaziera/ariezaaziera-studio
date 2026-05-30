"use client";

import { useEffect, useRef, useState } from "react";
import { YELLOW, BORDER } from "@/constants";
import { useProfile, useProjects } from "@/lib/hooks";

export default function AboutSection() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const profile = useProfile();
  const projects = useProjects();

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const skills = profile.skills;
  const blurbs = profile.about;

  const stats = [
    { num: "3+", label: "Years building" },
    { num: `${projects.length}+`, label: "Products shipped" },
    { num: "60%", label: "Ops time saved (OrderCalc)" },
    { num: "40%", label: "Drop-off reduced (OptimaBank)" },
  ];

  return (
    <section id="about" ref={ref} style={{ padding: "clamp(40px, 8vw, 80px) clamp(20px, 6vw, 40px)", maxWidth: 900, margin: "0 auto" }}>
      <style>{`
        @keyframes skillSlide {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes statCount {
          from { opacity: 0; transform: translateY(16px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes barFill {
          from { width: 0%; }
          to { width: var(--bar-w); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0 0 transparent; }
          50% { box-shadow: 0 0 16px 2px var(--glow-c); }
        }
        @media (max-width: 640px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>

      {/* Section label */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: YELLOW, letterSpacing: 3, whiteSpace: "nowrap" }}>02 — ABOUT</div>
        <div style={{ flex: 1, height: 1, background: BORDER }} />
      </div>

      <div className="about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 48 }}>

        {/* LEFT — text */}
        <div>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800,
            fontSize: "clamp(26px, 5vw, 38px)", letterSpacing: -1,
            margin: "0 0 24px",
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(20px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}>
            Building things that <span style={{ color: YELLOW }}>actually work.</span>
          </h2>

          {blurbs.map((text: string, i: number) => (
            <p key={i} style={{
              fontFamily: "'DM Mono', monospace", fontSize: 12,
              color: "#666", lineHeight: 1.9, margin: "0 0 16px",
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(16px)",
              transition: `opacity 0.6s ${0.1 + i * 0.1}s ease, transform 0.6s ${0.1 + i * 0.1}s ease`,
            }}>
              {text}
            </p>
          ))}

          {/* Animated skill chips */}
          <div style={{ marginTop: 32 }}>
            <div style={{
              fontFamily: "'DM Mono', monospace", fontSize: 9,
              color: "#444", letterSpacing: 2, marginBottom: 14,
              opacity: visible ? 1 : 0, transition: "opacity 0.5s 0.3s",
            }}>
              STACK
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {skills.map((s: string, i: number) => (
                <div
                  key={s}
                  style={{
                    fontFamily: "'DM Mono', monospace", fontSize: 10,
                    color: "#aaa",
                    padding: "6px 12px",
                    border: `1px solid #222`,
                    borderRadius: 4,
                    background: "#0d0d0d",
                    cursor: "default",
                    animation: visible ? `skillSlide 0.5s ${0.35 + i * 0.04}s both` : "none",
                    transition: "color 0.2s, border-color 0.2s, background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.color = YELLOW;
                    (e.currentTarget as HTMLDivElement).style.borderColor = YELLOW + "55";
                    (e.currentTarget as HTMLDivElement).style.background = YELLOW + "0d";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.color = "#aaa";
                    (e.currentTarget as HTMLDivElement).style.borderColor = "#222";
                    (e.currentTarget as HTMLDivElement).style.background = "#0d0d0d";
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — stats */}
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
            {stats.map((s, i) => (
              <StatCard key={i} stat={s} index={i} visible={visible} />
            ))}
          </div>

          {/* Animated progress bars */}
          <SkillBars visible={visible} />
        </div>
      </div>
    </section>
  );
}

function StatCard({ stat, index, visible }: { stat: { num: string; label: string }; index: number; visible: boolean }) {
  const [hovered, setHovered] = useState(false);
  const color = [YELLOW, "#60A5FA", YELLOW, "#4ADE80"][index] || YELLOW;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "20px 18px",
        background: "#0a0a0a",
        border: `1px solid ${hovered ? color + "40" : "#181818"}`,
        borderRadius: 12,
        position: "relative",
        overflow: "hidden",
        cursor: "default",
        animation: visible ? `statCount 0.6s ${0.2 + index * 0.1}s both` : "none",
        transition: "border-color 0.3s",
      }}
    >
      {/* glow on hover */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(circle at 50% 100%, ${color}15, transparent 70%)`,
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.4s",
      }} />
      {/* top bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: color,
        transform: `scaleX(${hovered ? 1 : 0})`,
        transformOrigin: "left",
        transition: "transform 0.4s ease",
      }} />

      <div style={{
        fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800,
        fontSize: "clamp(24px, 4vw, 32px)", color,
        letterSpacing: -1, lineHeight: 1, marginBottom: 6,
      }}>
        {stat.num}
      </div>
      <div style={{
        fontFamily: "'DM Mono', monospace", fontSize: 9,
        color: "#555", letterSpacing: 1, lineHeight: 1.5,
      }}>
        {stat.label}
      </div>
    </div>
  );
}

function SkillBars({ visible }: { visible: boolean }) {
  const bars = [
    { label: "Frontend Dev", pct: 92 },
    { label: "Product Design", pct: 80 },
    { label: "Backend / API", pct: 65 },
    { label: "UI Animation", pct: 75 },
  ];

  return (
    <div style={{
      padding: "20px",
      background: "#0a0a0a",
      border: "1px solid #181818",
      borderRadius: 12,
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : "translateY(16px)",
      transition: "opacity 0.7s 0.5s, transform 0.7s 0.5s",
    }}>
      <div style={{
        fontFamily: "'DM Mono', monospace", fontSize: 9,
        color: "#444", letterSpacing: 2, marginBottom: 16,
      }}>
        PROFICIENCY
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {bars.map((b, i) => (
          <div key={b.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#666" }}>{b.label}</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#444" }}>{b.pct}%</span>
            </div>
            <div style={{ height: 3, background: "#151515", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: visible ? `${b.pct}%` : "0%",
                background: `linear-gradient(90deg, ${YELLOW}aa, ${YELLOW})`,
                borderRadius: 2,
                transition: `width 1s ${0.6 + i * 0.12}s cubic-bezier(0.22, 1, 0.36, 1)`,
                boxShadow: `0 0 8px ${YELLOW}66`,
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
