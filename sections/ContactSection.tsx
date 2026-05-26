"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { YELLOW, CARD_BG, BORDER } from "@/constants";

export default function ContactSection() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const links = [
    { label: "EMAIL", value: "arieza@email.com", href: "mailto:arieza@email.com" },
    { label: "GITHUB", value: "github.com/arieza", href: "#" },
    { label: "LINKEDIN", value: "linkedin.com/in/arieza", href: "#" },
  ];

  return (
    <section id="contact" ref={ref} style={{ padding: "120px 40px 80px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 80 }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: YELLOW, letterSpacing: 3 }}>06 — CONTACT</div>
        <div style={{ flex: 1, height: 1, background: BORDER }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(32px)", transition: "all 0.7s ease" }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "clamp(32px, 5vw, 52px)", lineHeight: 1.0, margin: "0 0 24px", letterSpacing: -1.5 }}>
            Let's build<br />something<br /><span style={{ color: YELLOW }}>together.</span>
          </h2>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#666", lineHeight: 1.8 }}>
            Open to freelance projects, full-time roles, and interesting collabs. If you have something real to build — let's talk.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: visible ? 1 : 0, transition: "all 0.7s 0.2s ease" }}>
          {links.map((l, i) => (
            <a
              key={i}
              href={l.href}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 8, textDecoration: "none", transition: "border-color 0.2s, transform 0.2s" }}
              onMouseEnter={(e: ReactMouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.borderColor = YELLOW; e.currentTarget.style.transform = "translateX(4px)"; }}
              onMouseLeave={(e: ReactMouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = ""; }}
            >
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 4 }}>{l.label}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#aaa" }}>{l.value}</div>
              </div>
              <div style={{ color: YELLOW, fontSize: 16 }}>→</div>
            </a>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 80, paddingTop: 32, borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#333" }}>© 2025 ARIEZA AZIERA — BUILT WITH CARE</div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#333" }}>FRONTEND DEVELOPER & PRODUCT BUILDER</div>
      </div>
    </section>
  );
}
