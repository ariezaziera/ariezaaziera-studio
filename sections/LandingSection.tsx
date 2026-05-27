"use client";

import { useState, useEffect } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { YELLOW, BORDER } from "@/constants";

interface LandingSectionProps {
  setActivePage: (page: string) => void;
}

export default function LandingSection({ setActivePage }: LandingSectionProps) {
  const [typed, setTyped] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const fullText = "Frontend Developer\n& Product Builder";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullText.length) {
        setTyped(fullText.slice(0, i));
        i++;
      } else clearInterval(interval);
    }, 45);
    const blink = setInterval(() => setShowCursor((c) => !c), 530);
    return () => { clearInterval(interval); clearInterval(blink); };
  }, []);

  const lines = typed.split("\n");

  return (
    <section
      id="home"
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 clamp(20px, 6vw, 40px)", position: "relative", overflow: "hidden" }}
    >
      {/* Grid background */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(${BORDER} 1px, transparent 1px), linear-gradient(90deg, ${BORDER} 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
        opacity: 0.4,
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
      }} />

      {/* Yellow glow */}
      <div style={{ position: "absolute", top: "40%", left: "20%", width: "min(400px, 80vw)", height: "min(400px, 80vw)", background: `radial-gradient(circle, ${YELLOW}18 0%, transparent 70%)`, pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 900, margin: "0 auto", width: "100%" }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: YELLOW, letterSpacing: 3, marginBottom: 24, opacity: 0, animation: "fadeUp 0.6s 0.2s forwards" }}>
          LONG NUR ARIEZA
        </div>

        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "clamp(38px, 10vw, 88px)", lineHeight: 1.0, margin: "0 0 32px", letterSpacing: -2 }}>
          {lines.map((line, i) => (
            <div key={i} style={{ display: "block" }}>
              {i === 1 ? <span style={{ color: YELLOW }}>{line}</span> : line}
              {i === lines.length - 1 && showCursor && (
                <span style={{ color: YELLOW, opacity: 0.8 }}>|</span>
              )}
            </div>
          ))}
        </h1>

        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "clamp(11px, 2.5vw, 13px)", color: "#666", maxWidth: 480, lineHeight: 1.8, marginBottom: 48, opacity: 0, animation: "fadeUp 0.6s 0.8s forwards" }}>
          I build interactive web systems that turn ideas into real products. Not just UI — full product thinking, front to back.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", opacity: 0, animation: "fadeUp 0.6s 1s forwards" }}>
          <button
            onClick={() => setActivePage("projects")}
            style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 700, letterSpacing: 2, background: YELLOW, color: "#000", border: "none", padding: "14px 28px", borderRadius: 4, cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}
            onMouseEnter={(e: ReactMouseEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${YELLOW}40`; }}
            onMouseLeave={(e: ReactMouseEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
          >
            VIEW WORK →
          </button>
          <button
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 700, letterSpacing: 2, background: "transparent", color: "#fff", border: `1px solid ${BORDER}`, padding: "14px 28px", borderRadius: 4, cursor: "pointer", transition: "border-color 0.2s, color 0.2s" }}
            onMouseEnter={(e: ReactMouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = YELLOW; e.currentTarget.style.color = YELLOW; }}
            onMouseLeave={(e: ReactMouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = "#fff"; }}
          >
            GET IN TOUCH
          </button>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: -120, left: 0, display: "flex", alignItems: "center", gap: 12, opacity: 0, animation: "fadeUp 0.6s 1.4s forwards" }}>
          <div style={{ width: 1, height: 48, background: `linear-gradient(transparent, ${YELLOW})`, animation: "scrollPulse 2s infinite" }} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#555", letterSpacing: 2, writingMode: "vertical-rl" }}>SCROLL</span>
        </div>
      </div>
    </section>
  );
}
