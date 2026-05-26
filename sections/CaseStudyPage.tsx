"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { YELLOW, CARD_BG, BORDER } from "@/constants";
import type { Project } from "@/types";

interface CaseStudyPageProps {
  project: Project;
  setActivePage: (page: string) => void;
}

interface CaseSectionProps {
  label: string;
  content: string;
  color: string;
  index: number;
}

function CaseSection({ label, content, color, index }: CaseSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ marginBottom: 48, opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)", transition: `all 0.7s ${index * 0.1}s ease` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color, letterSpacing: 2 }}>{label.toUpperCase()}</div>
      </div>
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#aaa", lineHeight: 1.9, margin: 0, paddingLeft: 18 }}>{content}</p>
    </div>
  );
}

export default function CaseStudyPage({ project, setActivePage }: CaseStudyPageProps) {
  const [scrollPct, setScrollPct] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const steps = ["Context", "Problem", "Solution", "Outcome"];

  useEffect(() => {
    window.scrollTo(0, 0);
    const onScroll = () => {
      const el = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollPct(pct);
      setActiveStep(Math.floor((pct / 100) * steps.length));
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const sections = [
    { label: "Context", content: `${project.title} was built to address a real gap in the market. The product targets users who need a better experience — faster, clearer, and more intuitive than existing solutions.` },
    { label: "Problem", content: project.problem },
    { label: "Solution", content: project.solution },
    { label: "Outcome", content: project.outcome },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Progress bar */}
      <div style={{ position: "fixed", top: 64, left: 0, height: 2, background: YELLOW, width: `${scrollPct}%`, zIndex: 99, transition: "width 0.1s linear" }} />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "120px 40px 80px" }}>
        <button
          onClick={() => setActivePage("projects")}
          style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#555", background: "none", border: "none", cursor: "pointer", letterSpacing: 1, marginBottom: 40, padding: 0, display: "flex", alignItems: "center", gap: 8 }}
          onMouseEnter={(e: ReactMouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = YELLOW; }}
          onMouseLeave={(e: ReactMouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = "#555"; }}
        >
          ← ALL PROJECTS
        </button>

        {/* Hero */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: project.color, background: project.color + "15", padding: "4px 10px", borderRadius: 3, border: `1px solid ${project.color}30`, letterSpacing: 1 }}>CASE STUDY</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#555", padding: "4px 10px", borderRadius: 3, border: `1px solid ${BORDER}`, letterSpacing: 1 }}>{project.type.toUpperCase()}</span>
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "clamp(36px, 7vw, 72px)", lineHeight: 1.0, margin: "0 0 20px", letterSpacing: -2 }}>
            {project.title}<span style={{ color: project.color }}>.</span>
          </h1>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "#888", lineHeight: 1.7, margin: 0, maxWidth: 500 }}>{project.tagline}</p>
        </div>

        {/* Hero visual */}
        <div style={{ width: "100%", height: 280, background: `linear-gradient(135deg, ${project.color}18 0%, transparent 60%), ${CARD_BG}`, border: `1px solid ${BORDER}`, borderRadius: 12, marginBottom: 48, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ width: 120, height: 120, borderRadius: 24, background: project.color + "22", border: `1px solid ${project.color}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: project.color, opacity: 0.7 }} />
          </div>
          <div style={{ position: "absolute", bottom: 20, right: 20, fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#333", letterSpacing: 1 }}>PROJECT PREVIEW</div>
        </div>

        {/* Steps nav */}
        <div style={{ display: "flex", gap: 4, marginBottom: 56, overflowX: "auto", paddingBottom: 4 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, padding: "5px 12px", borderRadius: 3, background: i <= activeStep ? project.color : CARD_BG, color: i <= activeStep ? "#000" : "#555", border: `1px solid ${i <= activeStep ? project.color : BORDER}`, fontWeight: 700, letterSpacing: 1, whiteSpace: "nowrap", transition: "all 0.3s" }}>
                {s.toUpperCase()}
              </div>
              {i < steps.length - 1 && (
                <div style={{ width: 20, height: 1, background: i < activeStep ? project.color : BORDER, transition: "background 0.3s" }} />
              )}
            </div>
          ))}
        </div>

        {/* Tech stack */}
        <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "20px 24px", marginBottom: 48, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#555", letterSpacing: 2, flexShrink: 0 }}>TECH</div>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {project.tech.map((t: string) => (
              <span key={t} style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: project.color, background: project.color + "15", padding: "4px 10px", borderRadius: 3, border: `1px solid ${project.color}30` }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Content sections */}
        {sections.map((sec, i) => (
          <CaseSection key={i} label={sec.label} content={sec.content} color={project.color} index={i} />
        ))}

        {/* CTA */}
        <div style={{ marginTop: 80, padding: 40, background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, textAlign: "center" }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 12 }}>Interested in working together?</div>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#666", marginBottom: 28 }}>Let's build something real.</p>
          <button
            onClick={() => { setActivePage("home"); setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 100); }}
            style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 700, letterSpacing: 2, background: YELLOW, color: "#000", border: "none", padding: "12px 28px", borderRadius: 4, cursor: "pointer" }}
          >
            GET IN TOUCH →
          </button>
        </div>
      </div>
    </div>
  );
}
