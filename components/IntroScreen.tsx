"use client";

import { useState, useEffect, useRef } from "react";

// ─── Theme tokens (rose gold glow) ─────────────────────────────────────────
import { YELLOW, AMBER, AMBER_DEEP, HIBISCUS, BG, BORDER } from "@/constants";

const GOLD        = YELLOW;
const GOLD_BRIGHT = AMBER;
const BG_BASE     = BG;
const TEXT_DIM    = `${YELLOW}b3`;
const TAGLINE     = "#F0E6D3";
const DIVIDER     = `${HIBISCUS}80`;
const BRACKET     = `${AMBER}60`;
const GLOW_SOFT   = `${HIBISCUS}66`;
const GLOW_STRONG = `${AMBER_DEEP}cc`;
// ─────────────────────────────────────────────────────────────────────────

interface IntroScreenProps {
  onComplete: () => void;
}

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [phase, setPhase] = useState<"idle" | "typing" | "reveal" | "exit">("idle");
  const [typedName, setTypedName] = useState("");
  const [showTagline, setShowTagline] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [exitStarted, setExitStarted] = useState(false);
  const [petals, setPetals] = useState<
    { x: number; y: number; size: number; delay: number; dur: number; rotate: number; opacity: number }[]
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
    setPetals(
      Array.from({ length: 10 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 50 + 30,
        delay: Math.random() * 3,
        dur: Math.random() * 6 + 6,
        rotate: Math.random() * 360,
        opacity: Math.random() * 0.25 + 0.1,
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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: `radial-gradient(ellipse at 50% 45%, #3D1116 0%, #2A080C 45%, ${BG_BASE} 100%)`,
        transform: phase === "exit" ? "translateY(-100%)" : "translateY(0)",
        transition:
          phase === "exit"
            ? "transform 0.85s cubic-bezier(0.76, 0, 0.24, 1)"
            : "none",
      }}
    >
      <style>{`
        @keyframes introPetalFloat {
          0%, 100% { opacity: var(--p-op); transform: translateY(0) rotate(var(--p-rot)); }
          50%       { opacity: calc(var(--p-op) + 0.15); transform: translateY(-18px) rotate(calc(var(--p-rot) + 8deg)); }
        }
        @keyframes introAmbientGlow {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50%       { opacity: 0.9; transform: translate(-50%, -50%) scale(1.15); }
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
        @keyframes introNameGlow {
          0%, 100% { text-shadow: 0 0 20px ${HIBISCUS}99, 0 0 45px ${GOLD}66, 0 0 8px ${GOLD_BRIGHT}; }
          50%       { text-shadow: 0 0 40px ${HIBISCUS}cc, 0 0 85px ${GOLD}aa, 0 0 16px ${GOLD_BRIGHT}; }
        }
      `}</style>

      {/* ── Hibiscus petal glows ─────────────────────────────────────────── */}
      {petals.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50% 0 50% 50%",
            background: `radial-gradient(circle at 35% 35%, ${HIBISCUS}, ${BORDER} 70%, transparent 100%)`,
            filter: "blur(1px)",
            "--p-op": p.opacity,
            "--p-rot": `${p.rotate}deg`,
            animation: `introPetalFloat ${p.dur}s ${p.delay}s ease-in-out infinite`,
            pointerEvents: "none",
          } as React.CSSProperties}
        />
      ))}

      {/* ── Rose-gold ambient glow ───────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "min(80vw, 700px)",
          height: "min(80vw, 700px)",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${GLOW_STRONG} 0%, ${GLOW_SOFT} 35%, transparent 70%)`,
          filter: "blur(40px)",
          animation: phase !== "idle" ? "introAmbientGlow 3.5s ease-in-out infinite" : "none",
          opacity: phase !== "idle" ? 1 : 0,
          transition: "opacity 1s",
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
              color: "#F0E6D3",
              animation:
                phase === "reveal"
                  ? "introGlitch 0.6s ease-out both, introNameGlow 2.5s ease-in-out infinite"
                  : "none",
              whiteSpace: "nowrap",
            }}
          >
            {/* First name — cream */}
            <span style={{ color: "#F0E6D3" }}>{typedName.slice(0, SPLIT)}</span>
            {/* Last name — GOLD accent */}
            <span style={{ color: GOLD }}>{typedName.slice(SPLIT)}</span>
            {/* Blinking cursor while typing */}
            {phase === "typing" && (
              <span
                style={{ color: GOLD, animation: "introNameGlow 0.6s infinite" }}
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
            PRODUCT &amp; UX/UI DESIGNER
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
              boxShadow: `0 0 8px ${GOLD}55`,
            }}
          >
            <div
              style={{
                height: "100%",
                background: GOLD,
                boxShadow: `0 0 12px ${GOLD_BRIGHT}`,
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
            color: TAGLINE,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "8px 12px",
            transition: "color 0.2s, text-shadow 0.2s",
            animation: "introFadeUp 0.4s both",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = GOLD;
            e.currentTarget.style.textShadow = `0 0 10px ${GOLD}aa`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = TAGLINE;
            e.currentTarget.style.textShadow = "none";
          }}
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
                borderTop: isTop ? `1px solid ${GOLD}40` : "none",
                borderBottom: !isTop ? `1px solid ${GOLD}40` : "none",
                borderLeft: isLeft ? `1px solid ${GOLD}40` : "none",
                borderRight: !isLeft ? `1px solid ${GOLD}40` : "none",
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
