"use client";

import { useState, useEffect, useRef } from "react";
import { YELLOW, AMBER_DEEP, HIBISCUS, BG } from "@/constants";

interface IntroScreenProps {
  onComplete: () => void;
}

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const add = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  };

  const exit = () => {
    if (exiting) return;
    setExiting(true);
    add(onComplete, 700);
  };

  useEffect(() => {
    add(() => setVisible(true), 80);
    add(exit, 2200);
    return () => timers.current.forEach(clearTimeout);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BG,
        opacity: exiting ? 0 : 1,
        transition: exiting ? "opacity 0.65s ease" : "none",
        pointerEvents: exiting ? "none" : "auto",
      }}
    >
      <style>{`
        @keyframes nameFade {
          from { opacity: 0; letter-spacing: 0.25em; }
          to   { opacity: 1; letter-spacing: 0.12em; }
        }
        @keyframes lineGrow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes subFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      <div style={{ textAlign: "center" }}>
        {/* Name */}
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(28px, 8vw, 72px)",
            margin: 0,
            letterSpacing: "0.12em",
            color: "#F0E6D3",
            opacity: visible ? 1 : 0,
            animation: visible ? "nameFade 0.9s cubic-bezier(0.16, 1, 0.3, 1) both" : "none",
          }}
        >
          ARIEZA{" "}
          <span style={{ color: YELLOW }}>AZIERA</span>
        </h1>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, transparent, ${HIBISCUS}90, transparent)`,
            margin: "18px auto",
            transformOrigin: "center",
            transform: "scaleX(0)",
            animation: visible
              ? "lineGrow 0.7s 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards"
              : "none",
          }}
        />

        {/* Tagline */}
        <p
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "clamp(8px, 1.8vw, 11px)",
            letterSpacing: "0.3em",
            color: `${AMBER_DEEP}cc`,
            margin: 0,
            opacity: 0,
            animation: visible ? "subFade 0.5s 1s ease forwards" : "none",
          }}
        >
          PRODUCT DESIGNER &amp; DEVELOPER
        </p>
      </div>

      {/* Skip */}
      {visible && !exiting && (
        <button
          onClick={exit}
          style={{
            position: "absolute",
            bottom: 28,
            right: 28,
            fontFamily: "'DM Mono', monospace",
            fontSize: 9,
            letterSpacing: "0.2em",
            color: `${YELLOW}60`,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "6px 10px",
            transition: "color 0.2s",
            opacity: 0,
            animation: "subFade 0.4s 1.2s ease forwards",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = YELLOW)}
          onMouseLeave={(e) => (e.currentTarget.style.color = `${YELLOW}60`)}
        >
          SKIP →
        </button>
      )}
    </div>
  );
}
