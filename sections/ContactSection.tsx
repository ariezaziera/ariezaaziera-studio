"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { YELLOW, CARD_BG, BORDER } from "@/constants";
import { useProfile } from "@/lib/hooks";

export default function ContactSection() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const profile = useProfile();

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const links = [
    { label: "EMAIL", value: profile.email, href: `mailto:${profile.email}`, icon: "✉" },
    { label: "GITHUB", value: profile.github.replace("https://", ""), href: profile.github, icon: "⌥" },
    { label: "LINKEDIN", value: profile.linkedin.replace("https://", ""), href: profile.linkedin, icon: "in" },
  ];

  return (
    <section id="contact" ref={ref} style={{ padding: "80px clamp(20px, 6vw, 40px) 60px", maxWidth: 900, margin: "0 auto", position: "relative" }}>
      <style>{`
        @keyframes contactGlow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes linkEnter {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @media (max-width: 640px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>

      {/* Ambient background glow */}
      <div style={{
        position: "absolute", bottom: "10%", left: "30%",
        width: 400, height: 300, pointerEvents: "none",
        background: `radial-gradient(ellipse, ${YELLOW}07, transparent 70%)`,
        animation: "contactGlow 6s ease-in-out infinite",
      }} />

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 56 }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: YELLOW, letterSpacing: 3, whiteSpace: "nowrap" }}>06 — CONTACT</div>
        <div style={{ flex: 1, height: 1, background: BORDER }} />
      </div>

      <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>

        {/* LEFT */}
        <div style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "none" : "translateY(32px)",
          transition: "all 0.7s ease",
        }}>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800,
            fontSize: "clamp(28px, 6vw, 52px)", lineHeight: 1.0,
            margin: "0 0 24px", letterSpacing: -1.5,
          }}>
            Let's build<br />something<br /><span style={{ color: YELLOW }}>together.</span>
          </h2>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#666", lineHeight: 1.8 }}>
            Open to freelance projects, full-time roles, and interesting collabs. If you have something real to build — let's talk.
          </p>

          {/* Availability badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            marginTop: 24, padding: "8px 14px",
            border: `1px solid ${YELLOW}30`,
            background: YELLOW + "0a", borderRadius: 20,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: YELLOW,
              boxShadow: `0 0 8px ${YELLOW}`,
              display: "inline-block",
              animation: "contactGlow 1.5s ease-in-out infinite",
            }} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: YELLOW, letterSpacing: 2 }}>
              AVAILABLE FOR WORK
            </span>
          </div>
        </div>

        {/* RIGHT — animated link cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {links.map((l, i) => (
            <ContactLink key={i} link={l} index={i} visible={visible} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 64, paddingTop: 28,
        borderTop: `1px solid ${BORDER}`,
        display: "flex", justifyContent: "space-between",
        alignItems: "center", flexWrap: "wrap", gap: 12,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.7s 0.5s",
      }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#2a2a2a" }}>© 2025 ARIEZA AZIERA — BUILT WITH CARE</div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#2a2a2a" }}>FRONTEND DEVELOPER & PRODUCT BUILDER</div>
      </div>
    </section>
  );
}

function ContactLink({ link, index, visible }: {
  link: { label: string; value: string; href: string; icon: string };
  index: number;
  visible: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={link.href}
      target={link.href.startsWith("mailto") ? undefined : "_blank"}
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", padding: "18px 20px",
        background: hovered ? YELLOW + "08" : CARD_BG,
        border: `1px solid ${hovered ? YELLOW + "40" : BORDER}`,
        borderRadius: 10, textDecoration: "none",
        transform: hovered ? "translateX(6px)" : "none",
        animation: visible ? `linkEnter 0.5s ${0.2 + index * 0.1}s both` : "none",
        transition: "border-color 0.25s, transform 0.25s, background 0.25s",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* sliding fill */}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(90deg, ${YELLOW}05, transparent)`,
        transform: `translateX(${hovered ? "0%" : "-100%"})`,
        transition: "transform 0.4s ease",
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: hovered ? YELLOW + "18" : "#111",
          border: `1px solid ${hovered ? YELLOW + "40" : "#1e1e1e"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'DM Mono', monospace", fontSize: 11, color: hovered ? YELLOW : "#444",
          transition: "all 0.25s",
          flexShrink: 0,
        }}>
          {link.icon}
        </div>
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 3 }}>{link.label}</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: hovered ? "#ccc" : "#666", transition: "color 0.2s" }}>{link.value}</div>
        </div>
      </div>

      <div style={{
        color: YELLOW, fontSize: 16,
        transform: `translateX(${hovered ? 0 : -4}px)`,
        opacity: hovered ? 1 : 0.3,
        transition: "transform 0.25s, opacity 0.25s",
      }}>→</div>
    </a>
  );
}
