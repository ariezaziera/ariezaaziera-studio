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
    { label: "EMAIL", value: profile.email, href: `mailto:${profile.email}` },
    { label: "GITHUB", value: profile.github.replace("https://", ""), href: profile.github },
    { label: "LINKEDIN", value: profile.linkedin.replace("https://", ""), href: profile.linkedin },
  ];

  return (
    <section id="contact" ref={ref} style={{ padding: "80px clamp(20px, 6vw, 40px) 60px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 56 }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: YELLOW, letterSpacing: 3, whiteSpace: "nowrap" }}>06 — CONTACT</div>
        <div style={{ flex: 1, height: 1, background: BORDER }} />
      </div>

      <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(32px)", transition: "all 0.7s ease" }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 6vw, 52px)", lineHeight: 1.0, margin: "0 0 24px", letterSpacing: -1.5 }}>
            Let's build<br />something<br /><span style={{ color: YELLOW }}>together.</span>
          </h2>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#666", lineHeight: 1.8 }}>
            Open to freelance projects, full-time roles, and interesting collabs. If you have something real to build — let's talk.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: visible ? 1 : 0, transition: "all 0.7s 0.2s ease" }}>
          {links.map((l, i) => (
            <a
              key={i}
              href={l.href}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 8, textDecoration: "none", transition: "border-color 0.2s, transform 0.2s" }}
              onMouseEnter={(e: ReactMouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.borderColor = YELLOW; e.currentTarget.style.transform = "translateX(4px)"; }}
              onMouseLeave={(e: ReactMouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = ""; }}
            >
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 4 }}>{l.label}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#aaa" }}>{l.value}</div>
              </div>
              <div style={{ color: YELLOW, fontSize: 16 }}>→</div>
            </a>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 64, paddingTop: 28, borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#333" }}>© 2025 ARIEZA AZIERA — BUILT WITH CARE</div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#333" }}>FRONTEND DEVELOPER & PRODUCT BUILDER</div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </section>
  );
}