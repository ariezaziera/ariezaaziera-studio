"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { YELLOW, CARD_BG, BORDER } from "@/constants";
import { useProfile } from "@/lib/hooks";

/* ─── tiny hooks ─────────────────────────────────────────── */
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── Glitch text ─────────────────────────────────────────── */
function GlitchText({ children, style }: { children: string; style?: React.CSSProperties }) {
  const [glitching, setGlitching] = useState(false);
  useEffect(() => {
    const run = () => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 300 + Math.random() * 200);
    };
    const id = setInterval(run, 3000 + Math.random() * 4000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className={`glitch-text${glitching ? " glitching" : ""}`} data-text={children} style={style}>
      {children}
    </span>
  );
}

/* ─── Animated counter ─────────────────────────────────────── */
function Counter({ to, label }: { to: number; label: string }) {
  const [val, setVal] = useState(0);
  const { ref, visible } = useInView(0.2);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(to / 60);
    const id = setInterval(() => {
      start = Math.min(start + step, to);
      setVal(start);
      if (start >= to) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [visible, to]);
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "clamp(22px, 4vw, 36px)", fontWeight: 700, color: YELLOW, letterSpacing: -1 }}>
        {val}+
      </div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#555", letterSpacing: 3, marginTop: 4 }}>{label}</div>
    </div>
  );
}

/* ─── Particle canvas ──────────────────────────────────────── */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.5 + 0.5,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(230,200,100,0.35)";
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(230,200,100,${0.12 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);
  return (
    <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />
  );
}

/* ─── Scanning line ────────────────────────────────────────── */
function ScanLine() {
  return (
    <div aria-hidden style={{
      position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", borderRadius: 8,
    }}>
      <div className="scan-line" />
    </div>
  );
}

/* ─── Morphing border card ─────────────────────────────────── */
function MorphCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="morph-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        padding: "20px 22px",
        background: CARD_BG,
        borderRadius: 8,
        transition: "transform 0.3s ease",
        transform: hovered ? "translateX(6px) scale(1.01)" : "none",
        cursor: "default",
        animationDelay: `${delay}ms`,
      }}
    >
      <div
        className="morph-border"
        style={{
          position: "absolute", inset: 0, borderRadius: 8,
          background: hovered
            ? `linear-gradient(135deg, ${YELLOW}44, transparent 60%)`
            : "transparent",
          border: `1px solid ${hovered ? YELLOW : BORDER}`,
          transition: "all 0.3s ease",
          pointerEvents: "none",
        }}
      />
      {children}
    </div>
  );
}

/* ─── Typewriter ───────────────────────────────────────────── */
function Typewriter({ text, speed = 50, started }: { text: string; speed?: number; started: boolean }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!started) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, started]);
  return (
    <span>
      {displayed}
      {displayed.length < text.length && started && (
        <span className="cursor-blink">▌</span>
      )}
    </span>
  );
}

/* ─── Orbiting dot decoration ──────────────────────────────── */
function OrbitDecor() {
  return (
    <div aria-hidden className="orbit-wrapper" style={{ width: 80, height: 80, position: "relative" }}>
      <div className="orbit-ring" />
      <div className="orbit-dot" />
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'DM Mono', monospace", fontSize: 8, color: YELLOW, letterSpacing: 2,
      }}>OPEN</div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────── */
export default function ContactSection() {
  const { ref, visible } = useInView(0.1);
  const profile = useProfile();

  const links = [
    { label: "EMAIL", icon: "✉", value: profile.email, href: `mailto:${profile.email}` },
    { label: "GITHUB", icon: "◈", value: profile.github.replace("https://", ""), href: profile.github },
    { label: "LINKEDIN", icon: "◉", value: profile.linkedin.replace("https://", ""), href: profile.linkedin },
  ];

  return (
    <section
      id="contact"
      ref={ref}
      style={{ padding: "80px clamp(20px, 6vw, 40px) 60px", maxWidth: 900, margin: "0 auto", position: "relative", overflow: "hidden" }}
    >
      {/* ── Section label ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 56 }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: YELLOW, letterSpacing: 3, whiteSpace: "nowrap" }}>
          06 — CONTACT
        </div>
        <div className="section-line" style={{ flex: 1, height: 1, background: BORDER, position: "relative", overflow: "hidden" }}>
          {visible && <div className="line-sweep" />}
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>

        {/* Left col */}
        <div style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "none" : "translateY(40px)",
          transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
            <OrbitDecor />
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#c8c8c8", letterSpacing: 3, lineHeight: 2 }}>
              STATUS: AVAILABLE<br />
              <span style={{ color: YELLOW }}>◉ ACTIVE</span>
            </div>
          </div>

          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800,
            fontSize: "clamp(28px, 6vw, 52px)", lineHeight: 1.0, margin: "0 0 12px", letterSpacing: -1.5,
          }}>
            Let's build<br />something<br />
            <GlitchText style={{ color: YELLOW }}>together.</GlitchText>
          </h2>

          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#d4d4d4", lineHeight: 1.8, marginBottom: 32 }}>
            <Typewriter
              text="Open to freelance projects, full-time roles, and interesting collabs. If you have something real to build — let's talk."
              speed={28}
              started={visible}
            />
          </p>

          {/* Stats row */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16,
            padding: "20px 0", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`,
            opacity: visible ? 1 : 0, transition: "opacity 0.6s 0.4s ease",
          }}>
            <Counter to={24} label="PROJECTS" />
            <Counter to={5} label="YEARS EXP" />
            <Counter to={12} label="CLIENTS" />
          </div>
        </div>

        {/* Right col — link cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {links.map((l, i) => (
            <div
              key={i}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "none" : "translateX(40px)",
                transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + i * 0.12}s`,
              }}
            >
              <MorphCard delay={i * 120}>
                <ScanLine />
                <a
                  href={l.href}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", textDecoration: "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 36, height: 36, border: `1px solid ${BORDER}`, borderRadius: 6,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, color: YELLOW, flexShrink: 0,
                    }}>{l.icon}</div>
                    <div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 4 }}>{l.label}</div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#aaa" }}>{l.value}</div>
                    </div>
                  </div>
                  <div className="arrow-btn" style={{ color: YELLOW, fontSize: 18, fontFamily: "monospace" }}>→</div>
                </a>
              </MorphCard>
            </div>
          ))}

          {/* Availability badge */}
          <div style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.6s 0.55s ease",
          }}>
            <div style={{
              padding: "14px 18px", border: `1px dashed ${BORDER}`, borderRadius: 8,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div className="pulse-dot" />
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#555", lineHeight: 1.6 }}>
                RESPONSE TIME<br />
                <span style={{ color: YELLOW }}>{"< 24 HOURS"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{
        marginTop: 64, paddingTop: 28, borderTop: `1px solid ${BORDER}`,
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
        opacity: visible ? 1 : 0, transition: "opacity 0.6s 0.7s ease",
      }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#333" }}>
          © 2025 ARIEZA AZIERA — BUILT WITH CARE
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#333" }}>
          FRONTEND DEVELOPER &amp; PRODUCT BUILDER
        </div>
      </div>

      {/* ── Global styles ── */}
      <style>{`
        /* Glitch effect */
        .glitch-text {
          position: relative;
          display: inline-block;
        }
        .glitch-text.glitching::before,
        .glitch-text.glitching::after {
          content: attr(data-text);
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          overflow: hidden;
          color: ${YELLOW};
        }
        .glitch-text.glitching::before {
          animation: glitch-before 0.25s steps(2) forwards;
          clip-path: polygon(0 0, 100% 0, 100% 40%, 0 40%);
          color: #ff4c4c;
          left: 2px;
        }
        .glitch-text.glitching::after {
          animation: glitch-after 0.3s steps(3) forwards;
          clip-path: polygon(0 60%, 100% 60%, 100% 100%, 0 100%);
          color: #4cf4ff;
          left: -2px;
        }
        @keyframes glitch-before {
          0%  { transform: translateX(-3px); }
          50% { transform: translateX(3px); }
          100%{ transform: translateX(0); }
        }
        @keyframes glitch-after {
          0%  { transform: translateX(3px); }
          50% { transform: translateX(-3px); }
          100%{ transform: translateX(0); }
        }

        /* Scan line */
        .scan-line {
          position: absolute;
          left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, ${YELLOW}44, transparent);
          animation: scan 3s linear infinite;
          pointer-events: none;
        }
        @keyframes scan {
          from { top: -2px; }
          to   { top: 100%; }
        }

        /* Line sweep on section divider */
        .line-sweep {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, ${YELLOW}88, transparent);
          animation: sweep 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          transform-origin: left;
        }
        @keyframes sweep {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }

        /* Cursor blink */
        .cursor-blink {
          animation: blink 0.8s step-start infinite;
          color: ${YELLOW};
        }
        @keyframes blink {
          50% { opacity: 0; }
        }

        /* Orbit decoration */
        .orbit-wrapper {
          flex-shrink: 0;
        }
        .orbit-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1px solid ${BORDER};
          animation: spin-ring 8s linear infinite;
        }
        .orbit-ring::before {
          content: '';
          position: absolute;
          top: -3px; left: 50%;
          transform: translateX(-50%);
          width: 6px; height: 6px;
          border-radius: 50%;
          background: ${YELLOW};
        }
        @keyframes spin-ring {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .orbit-dot {
          position: absolute;
          inset: 10px;
          border-radius: 50%;
          border: 1px dashed ${BORDER};
          animation: spin-ring 5s linear infinite reverse;
        }

        /* Pulse dot */
        .pulse-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: ${YELLOW};
          flex-shrink: 0;
          position: relative;
        }
        .pulse-dot::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1px solid ${YELLOW};
          animation: pulse-ring 1.8s ease-out infinite;
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        /* Arrow hover */
        .arrow-btn {
          transition: transform 0.25s ease;
        }
        a:hover .arrow-btn {
          transform: translateX(5px);
          text-shadow: 0 0 12px ${YELLOW};
        }

        /* Responsive */
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