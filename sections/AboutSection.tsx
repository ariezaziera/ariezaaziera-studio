"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { YELLOW, CARD_BG, BORDER } from "@/constants";
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
    { num: `${projects.length}`, label: "Products shipped" },
    { num: "60%", label: "Ops time saved (OrderCalc)" },
    { num: "40%", label: "Drop-off reduced (OptimaBank)" },
  ];

  return (
    <section id="about" ref={ref} style={{ padding: "clamp(40px, 8vw, 80px) clamp(20px, 6vw, 40px)", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: YELLOW, letterSpacing: 3, whiteSpace: "nowrap" }}>02 — ABOUT</div>
        <div style={{ flex: 1, height: 1, background: BORDER }} />
      </div>

      {/* Responsive grid: 2 cols on desktop, 1 col on mobile */}
      <div className="about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
        {/* Left */}
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(32px)", transition: "all 0.7s ease" }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "clamp(26px, 5vw, 42px)", lineHeight: 1.1, marginBottom: 24, letterSpacing: -1 }}>
            I think in<br /><span style={{ color: YELLOW }}>systems.</span><br />Build in code.
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {blurbs.map((t, i) => (
              <p key={i} style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#888", lineHeight: 1.8, margin: 0, opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(16px)", transition: `all 0.6s ${0.1 + i * 0.1}s ease` }}>
                {t}
              </p>
            ))}
          </div>
        </div>

        {/* Right */}
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(32px)", transition: "all 0.7s 0.3s ease" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 20 }}>STACK</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 40 }}>
            {skills.map((s, i) => (
              <div
                key={s}
                style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#aaa", border: `1px solid ${BORDER}`, padding: "6px 12px", borderRadius: 3, opacity: visible ? 1 : 0, transition: `all 0.4s ${0.3 + i * 0.05}s ease`, cursor: "default" }}
                onMouseEnter={(e: ReactMouseEvent<HTMLDivElement>) => { e.currentTarget.style.borderColor = YELLOW; e.currentTarget.style.color = YELLOW; }}
                onMouseLeave={(e: ReactMouseEvent<HTMLDivElement>) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = "#aaa"; }}
              >
                {s}
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {stats.map(({ num, label }, i) => (
              <div key={i} style={{ padding: "18px", background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 8, opacity: visible ? 1 : 0, transition: `all 0.5s ${0.4 + i * 0.1}s ease` }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 28, color: YELLOW, lineHeight: 1 }}>{num}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#555", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </section>
  );
}