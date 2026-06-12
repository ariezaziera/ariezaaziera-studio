"use client";

import { useState, useEffect, useRef } from "react";

// ── Theme tokens (maroon–gold palette) ───────────────────────────────
const BG = "#4B1C2F";        // deep maroon background
const BG_GRID = "#FFD70020"; // faint gold grid lines
const SCAN_COLOR = "#FFD70066"; // gold scan line
const DOT_COLOR = "#FFD700"; // gold ambient dots
const TEXT_DIM = "#F5C6D6";  // soft pink for labels
const DIVIDER = "#FFD70099"; // gold divider line
const BRACKET = "#FFD70080"; // gold brackets
const TAGLINE = "#F0E6D3";   // cream tagline text
const SKIP_DIM = "#F5C6D6";  // soft pink skip button
const CORNER = "#FFD70060";  // gold corner accents
const GLITCH_BG = "#FA6B86"; // hibiscus ghost layer

interface IntroScreenProps {
  onComplete: () => void;
}

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [phase, setPhase] = useState<"idle" | "typing" | "reveal" | "exit">("idle");
  const [typedName, setTypedName] = useState("");
  const [showTagline, setShowTagline] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [exitStarted, setExitStarted] = useState(false);

  const [dots, setDots] = useState<
    { x: number; y: number; size: number; delay: number; dur: number }[]
  >([]);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const fullName = "ARIEZA AZIERA";
  const SPLIT = 6;

  const scheduleExit = () => {
    const t = setTimeout(() => triggerExit(), 1400);
    timeouts.current.push(t);
  };

  const triggerExit = () => {
    if (exitStarted) return;
    setExitStarted(true);
    setPhase("exit");
    timeouts.current.push(setTimeout(onComplete, 900));
  };

  useEffect(() => {
    setDots(
      Array.from({ length: 28 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 2,
        dur: Math.random() * 3 + 2,
      }))
    );
    const t0 = setTimeout(() => setPhase("typing"), 300);
    timeouts.current.push(t0);
    return () => timeouts.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase !== "typing") return;
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullName.length) {
        setTypedName(fullName.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        const t1 = setTimeout(() => {
          setPhase("reveal");
          setShowTagline(true);
          const t2 = setTimeout(() => setShowSkip(true), 600);
          timeouts.current.push(t2);
          scheduleExit();
        }, 300);
        timeouts.current.push(t1);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: BG,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        transform: phase === "exit" ? "translateY(-100%)" : "translateY(0)",
        transition:
          phase === "exit"
            ? "transform 0.85s cubic-bezier(0.76, 0, 0.24, 1)"
            : "none",
      }}
    >
      {/* Ambient dots */}
      {dots.map((dot, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: dot.size,
            height: dot.size,
            borderRadius: "50%",
            background: DOT_COLOR,
            animation: `introDotPulse ${dot.dur}s ${dot.delay}s ease-in-out infinite`,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Scan line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${SCAN_COLOR}, transparent)`,
          animation: "introScan 3s linear infinite",
          pointerEvents: "none",
        }}
      />

      {/* Main content */}
      <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
        {/* Portrait */}
        <div className="relative mb-8">
          <img
            src="/profile.jpg"
            alt="Arieza Aziera"
            className="w-48 h-48 rounded-full border-4 border-gold shadow-lg animate-scrollPulse"
          />
          <img src="/hibiscus.png" alt="" className="absolute -top-6 -left-6 w-12 animate-fadeUp" />
          <img src="/hibiscus.png" alt="" className="absolute -bottom-6 -right-6 w-12 animate-fadeUp" />
        </div>

        {/* Name block */}
        <h1
          style={{
            fontFamily: "Playfair Display, serif",
            fontWeight: 900,
            fontSize: "clamp(36px, 10vw, 96px)",
            margin: 0,
            color: "#fff",
            animation: phase === "reveal" ? "introGlitch 0.6s ease-out both" : "none",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: "#fff" }}>{typedName.slice(0, SPLIT)}</span>
          <span style={{ color: DOT_COLOR }}>{typedName.slice(SPLIT)}</span>
          {phase === "typing" && (
            <span style={{ color: DOT_COLOR, animation: "introDotPulse 0.6s infinite" }}>
              _
            </span>
          )}
        </h1>

        {/* Divider */}
        {phase === "reveal" && (
          <div
            style={{
              height: 1,
              background: `linear-gradient(90deg, transparent, ${DIVIDER}, transparent)`,
              margin: "20px auto",
              animation: "introLineGrow 0.6s 0.2s both",
            }}
          />
        )}

        {/* Tagline */}
        {showTagline && (
          <p
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: "clamp(12px, 2vw, 18px)",
              color: TAGLINE,
              letterSpacing: 3,
              marginTop: 8,
              animation: "introFadeUp 0.5s 0.1s both",
            }}
          >
            PRODUCT & UX/UI DESIGNER
          </p>
        )}

        {/* CTA button */}
        {phase === "reveal" && (
          <button
            onClick={triggerExit}
            className="btn-gold mt-6 animate-fadeUp"
          >
            View My Work
          </button>
        )}
      </div>

      {/* Skip button */}
      {showSkip && !exitStarted && (
        <button
          onClick={triggerExit}
          style={{
            position: "absolute",
            bottom: 32,
            right: 32,
            fontFamily: "DM Sans, sans-serif",
            fontSize: 12,
            letterSpacing: 2,
            color: SKIP_DIM,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "8px 12px",
            transition: "color 0.2s",
            animation: "introFadeUp 0.4s both",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = DOT_COLOR)}
          onMouseLeave={(e) => (e.currentTarget.style.color = SKIP_DIM)}
        >
          SKIP →
        </button>
      )}
    </div>
  );
}