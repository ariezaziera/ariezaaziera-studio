"use client";

import { useState, useEffect, useRef } from "react";
import { YELLOW, BORDER } from "@/constants";

// ─── Theme tokens (derived from constants) ───────────────────────────────────
const BG         = "#0a0800";          // near-black with warm tint, matches YELLOW hue
const BG_GRID    = `${YELLOW}06`;      // ultra-faint grid lines
const SCAN_COLOR = `${YELLOW}44`;      // scan line
const DOT_COLOR  = YELLOW;
const TEXT_DIM   = `${YELLOW}b3`;      // "PORTFOLIO — 2025" label
const DIVIDER    = `${YELLOW}60`;
const BRACKET    = `${YELLOW}40`;
const TAGLINE    = "#d4d4d4";
const SKIP_DIM   = "#c8c8c8";
const CORNER     = `${YELLOW}30`;
const GLITCH_BG  = `${YELLOW}15`;      // ghost layer behind name
// ─────────────────────────────────────────────────────────────────────────────

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
  // "ARIEZA" (6 chars) stays white — surname "AZIERA" gets YELLOW accent
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
      <style>{`
        @keyframes introDotPulse {
          0%, 100% { opacity: 0.08; transform: scale(1); }
          50%       { opacity: 0.22; transform: scale(1.5); }
        }
        @keyframes introLineGrow {
          from { width: 0; }
          to   { width: 100%; }
        }
        @keyframes introFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes introGlitch {
          0%   { clip-path: inset(0 0 100% 0); transform: skewX(0deg); }
          10%  { clip-path: inset(15% 0 72% 0); transform: skewX(-2deg); }
          20%  { clip-path: inset(40% 0 40% 0); transform: skewX(1.5deg); }
          30%  { clip-path: inset(60% 0 20% 0); transform: skewX(-1deg); }
          40%  { clip-path: inset(80% 0 5% 0); transform: skewX(0.5deg); }
          50%  { clip-path: inset(0 0 0 0); transform: skewX(0deg); }
          100% { clip-path: inset(0 0 0 0); transform: skewX(0deg); }
        }
        @keyframes introScan {
          0%   { top: -4px; opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 0.7; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes introBracketLeft {
          from { transform: translateY(-50%) translateX(-12px); opacity: 0; }
          to   { transform: translateY(-50%) translateX(0);     opacity: 1; }
        }
        @keyframes introBracketRight {
          from { transform: translateY(-50%) translateX(12px); opacity: 0; }
          to   { transform: translateY(-50%) translateX(0);    opacity: 1; }
        }
        @keyframes introBarFill {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>

      {/* ── Ambient dots ─────────────────────────────────────────────────── */}
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

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${BG_GRID} 1px, transparent 1px),
            linear-gradient(90deg, ${BG_GRID} 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          pointerEvents: "none",
        }}
      />

      {/* ── Scan line ────────────────────────────────────────────────────── */}
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

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          padding: "0 clamp(32px, 8vw, 64px)",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Top label */}
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            letterSpacing: 5,
            color: TEXT_DIM,
            marginBottom: 32,
            opacity: phase !== "idle" ? 1 : 0,
            transition: "opacity 0.6s 0.2s",
          }}
        >
          PORTFOLIO — {new Date().getFullYear()}
        </div>

        {/* Name block */}
        <div
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            padding: "0 clamp(28px, 5vw, 48px)",
          }}
        >
          {/* Ghost / glitch layer */}
          {phase === "reveal" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 900,
                fontSize: "clamp(36px, 10vw, 96px)",
                letterSpacing: -1,
                color: GLITCH_BG,
                transform: "translate(3px, -2px)",
                userSelect: "none",
                pointerEvents: "none",
              }}
            >
              {fullName}
            </div>
          )}

          {/* Bracket left */}
          {phase === "reveal" && (
            <span
              style={{
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                fontFamily: "'DM Mono', monospace",
                fontSize: "clamp(24px, 6vw, 64px)",
                lineHeight: 1,
                color: BRACKET,
                animation: "introBracketLeft 0.5s 0.1s both",
              }}
            >
              {"["}
            </span>
          )}

          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(36px, 10vw, 96px)",
              letterSpacing: -1,
              margin: 0,
              color: "#fff",
              animation:
                phase === "reveal" ? "introGlitch 0.6s ease-out both" : "none",
              whiteSpace: "nowrap",
            }}
          >
            {/* First name — white */}
            <span style={{ color: "#fff" }}>{typedName.slice(0, SPLIT)}</span>
            {/* Last name — YELLOW accent */}
            <span style={{ color: YELLOW }}>{typedName.slice(SPLIT)}</span>
            {/* Blinking cursor while typing */}
            {phase === "typing" && (
              <span
                style={{ color: YELLOW, animation: "introDotPulse 0.6s infinite" }}
              >
                _
              </span>
            )}
          </h1>

          {/* Bracket right */}
          {phase === "reveal" && (
            <span
              style={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                fontFamily: "'DM Mono', monospace",
                fontSize: "clamp(24px, 6vw, 64px)",
                lineHeight: 1,
                color: BRACKET,
                animation: "introBracketRight 0.5s 0.1s both",
              }}
            >
              {"]"}
            </span>
          )}
        </div>

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
              fontFamily: "'DM Mono', monospace",
              fontSize: "clamp(7px, 2vw, 13px)",
              color: TAGLINE,
              letterSpacing: 3,
              marginTop: 8,
              animation: "introFadeUp 0.5s 0.1s both",
            }}
          >
            FRONTEND DEVELOPER &nbsp;·&nbsp; PRODUCT BUILDER
          </p>
        )}

        {/* Loading bar */}
        {phase === "reveal" && (
          <div
            style={{
              margin: "40px auto 0",
              width: "clamp(120px, 30vw, 200px)",
              height: 1,
              background: BORDER,
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: YELLOW,
                animation:
                  "introBarFill 1.2s 0.1s cubic-bezier(0.4, 0, 0.2, 1) both",
              }}
            />
          </div>
        )}
      </div>

      {/* ── Skip button ──────────────────────────────────────────────────── */}
      {showSkip && !exitStarted && (
        <button
          onClick={triggerExit}
          style={{
            position: "absolute",
            bottom: 32,
            right: 32,
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            letterSpacing: 2,
            color: SKIP_DIM,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "8px 12px",
            transition: "color 0.2s",
            animation: "introFadeUp 0.4s both",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = YELLOW)}
          onMouseLeave={(e) => (e.currentTarget.style.color = SKIP_DIM)}
        >
          SKIP →
        </button>
      )}

      {/* ── Corner accents ───────────────────────────────────────────────── */}
      {(["top-left", "top-right", "bottom-left", "bottom-right"] as const).map(
        (corner) => {
          const isTop = corner.includes("top");
          const isLeft = corner.includes("left");
          return (
            <div
              key={corner}
              style={{
                position: "absolute",
                [isTop ? "top" : "bottom"]: 20,
                [isLeft ? "left" : "right"]: 20,
                width: 20,
                height: 20,
                borderTop: isTop ? `1px solid ${CORNER}` : "none",
                borderBottom: !isTop ? `1px solid ${CORNER}` : "none",
                borderLeft: isLeft ? `1px solid ${CORNER}` : "none",
                borderRight: !isLeft ? `1px solid ${CORNER}` : "none",
                opacity: phase !== "idle" ? 1 : 0,
                transition: "opacity 0.8s 0.4s",
              }}
            />
          );
        }
      )}
    </div>
  );
}