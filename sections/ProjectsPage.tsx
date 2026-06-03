"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { YELLOW, BORDER } from "@/constants";
import type { Project } from "@/types";
import ProjectCard from "@/components/ProjectCard";
import { useProjects } from "@/lib/hooks";

// ─── Global Styles ─────────────────────────────────────────────────────────────
function GlobalStyles() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pgSpin { to { transform: rotate(360deg); } }
      @keyframes pgSpinR { to { transform: rotate(-360deg); } }
      @keyframes pgPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(.55)} }
      @keyframes pgBlink { 50%{opacity:0} }
      @keyframes pgFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      @keyframes pgFadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
      @keyframes pgSlideLeft { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
      @keyframes pgGlitch1 {
        0%,88%,100%{clip-path:polygon(0 0,100% 0,100% 100%,0 100%);transform:translate(0);opacity:1}
        90%{clip-path:polygon(0 18%,100% 18%,100% 48%,0 48%);transform:translate(-3px,2px);opacity:.8}
        92%{clip-path:polygon(0 52%,100% 52%,100% 78%,0 78%);transform:translate(3px,-2px);opacity:.7}
        94%{opacity:0}
      }
      @keyframes pgGlitch2 {
        0%,88%,100%{clip-path:polygon(0 0,100% 0,100% 100%,0 100%);transform:translate(0);opacity:1}
        89%{clip-path:polygon(0 28%,100% 28%,100% 58%,0 58%);transform:translate(4px,-1px);opacity:.7}
        91%{clip-path:polygon(0 62%,100% 62%,100% 88%,0 88%);transform:translate(-3px,1px);opacity:.6}
        93%{opacity:0}
      }
      @keyframes pgShimmer {
        0%{background-position:-200% center}
        100%{background-position:200% center}
      }
      @keyframes pgRipple {
        0%{transform:scale(0);opacity:.5}
        100%{transform:scale(4);opacity:0}
      }
      @keyframes pgRadar {
        from{transform:rotate(0deg)}
        to{transform:rotate(360deg)}
      }
      @keyframes pgOrbit {
        from{transform:rotate(0deg) translateX(28px) rotate(0deg)}
        to{transform:rotate(360deg) translateX(28px) rotate(-360deg)}
      }
      @keyframes pgMorphBlob {
        0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}
        33%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%}
        66%{border-radius:50% 60% 30% 40%/40% 30% 70% 60%}
      }
      @keyframes pgWave {
        0%,100%{transform:scaleY(.15)}
        50%{transform:scaleY(1)}
      }
      @keyframes pgDataStream {
        0%{transform:translateY(0);opacity:0}
        8%{opacity:.7}
        92%{opacity:.3}
        100%{transform:translateY(-320px);opacity:0}
      }
      @keyframes pgCounterSlide {
        from{transform:translateY(100%);opacity:0}
        to{transform:translateY(0);opacity:1}
      }
      @keyframes pgNeonFlicker {
        0%,19%,21%,23%,25%,54%,56%,100%{opacity:1}
        20%,24%,55%{opacity:.3}
      }
      @keyframes pgBorderRun {
        0%{transform:translateX(-100%)}
        100%{transform:translateX(400%)}
      }
      @keyframes pgHexPulse {
        0%,100%{opacity:.08;transform:scale(1)}
        50%{opacity:.22;transform:scale(1.06)}
      }
      @keyframes pgScanV {
        0%{top:-4px}
        100%{top:100%}
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);
  return null;
}

// ─── Scanline CRT overlay ──────────────────────────────────────────────────────
function ScanlineOverlay() {
  return (
    <div style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9998,
      backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px)",
    }} />
  );
}

// ─── Particle canvas background ───────────────────────────────────────────────
function ParticleBG() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();

    const COLS = [`rgba(245,197,24,`, `rgba(0,255,231,`, `rgba(191,90,242,`, `rgba(48,209,88,`];
    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.2 + 0.3,
      col: COLS[Math.floor(Math.random() * COLS.length)],
      a: Math.random() * 0.25 + 0.05,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { x: mx, y: my } = mouseRef.current;
      pts.forEach((p) => {
        const dx = p.x - mx, dy = p.y - my;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 110) { p.vx += (dx / d) * 0.06; p.vy += (dy / d) * 0.06; }
        p.vx *= 0.99; p.vy *= 0.99;
        p.x = (p.x + p.vx + canvas.width) % canvas.width;
        p.y = (p.y + p.vy + canvas.height) % canvas.height;

        pts.forEach((q) => {
          const ddx = p.x - q.x, ddy = p.y - q.y;
          const dd = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dd < 80 && dd > 0) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(255,255,255,${0.02 * (1 - dd / 80)})`;
            ctx.lineWidth = 0.4; ctx.stroke();
          }
        });
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.col + p.a + ")";
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    const onMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onLeave = () => { mouseRef.current = { x: -999, y: -999 }; };
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.6,
    }} />
  );
}

// ─── Glitch Heading ───────────────────────────────────────────────────────────
function GlitchHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div style={{
        fontFamily: "'Unbounded', 'Space Grotesk', sans-serif",
        fontWeight: 900, fontSize: "clamp(28px,6vw,52px)",
        letterSpacing: -2, color: "#fff", lineHeight: 1,
      }}>
        {children}
      </div>
      <div aria-hidden style={{
        position: "absolute", top: 0, left: 0, pointerEvents: "none",
        fontFamily: "'Unbounded', 'Space Grotesk', sans-serif",
        fontWeight: 900, fontSize: "clamp(28px,6vw,52px)",
        letterSpacing: -2, color: "#00ffe7",
        mixBlendMode: "screen" as const,
        animation: "pgGlitch1 5s ease-in-out infinite", opacity: 0,
      }}>{children}</div>
      <div aria-hidden style={{
        position: "absolute", top: 0, left: 0, pointerEvents: "none",
        fontFamily: "'Unbounded', 'Space Grotesk', sans-serif",
        fontWeight: 900, fontSize: "clamp(28px,6vw,52px)",
        letterSpacing: -2, color: "#ff375f",
        mixBlendMode: "screen" as const,
        animation: "pgGlitch2 5s ease-in-out infinite 0.08s", opacity: 0,
      }}>{children}</div>
    </div>
  );
}

// ─── Neon Divider ─────────────────────────────────────────────────────────────
function NeonDivider({ color = YELLOW, label }: { color?: string; label?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "0" }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${color}55)` }} />
      {label && (
        <span style={{
          fontFamily: "'DM Mono', monospace", fontSize: 9, color,
          letterSpacing: 3, animation: "pgNeonFlicker 8s ease-in-out infinite",
          whiteSpace: "nowrap",
        }}>{label}</span>
      )}
      <div style={{ flex: 1, height: 1, background: `linear-gradient(270deg, transparent, ${color}55)` }} />
    </div>
  );
}

// ─── Holographic Filter Button ────────────────────────────────────────────────
function HoloFilterBtn({
  label, active, onClick, color = YELLOW,
}: { label: string; active: boolean; onClick: () => void; color?: string }) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    const rect = ref.current!.getBoundingClientRect();
    const id = Date.now();
    setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 700);
    onClick();
  };

  return (
    <button
      ref={ref}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", overflow: "hidden",
        padding: "8px 18px", borderRadius: 4,
        background: active ? `${color}18` : hovered ? `${color}0a` : "transparent",
        border: `1px solid ${active || hovered ? color : BORDER}`,
        color: active ? color : hovered ? `${color}cc` : "#c8c8c8",
        fontFamily: "'DM Mono', monospace", fontSize: 10,
        letterSpacing: 2, fontWeight: active ? 700 : 400,
        cursor: "pointer", outline: "none",
        boxShadow: active ? `0 0 20px ${color}33, inset 0 0 20px ${color}0a` : hovered ? `0 0 12px ${color}22` : "none",
        textShadow: active ? `0 0 10px ${color}88` : "none",
        transition: "all 0.25s",
      }}
    >
      {/* Shimmer on active */}
      {active && (
        <span style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(90deg, transparent, ${color}22, transparent)`,
          backgroundSize: "200% 100%",
          animation: "pgShimmer 2s linear infinite",
          pointerEvents: "none",
        }} />
      )}
      {/* Running border line */}
      <span style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        opacity: active ? 0.8 : 0,
        transition: "opacity 0.3s",
        pointerEvents: "none",
      }} />
      {/* Ripples */}
      {ripples.map((rp) => (
        <span key={rp.id} style={{
          position: "absolute",
          left: rp.x, top: rp.y,
          width: 8, height: 8, marginLeft: -4, marginTop: -4,
          borderRadius: "50%", background: color,
          animation: "pgRipple 0.7s ease-out forwards",
          pointerEvents: "none",
        }} />
      ))}
      {/* Corner marks when active */}
      {active && ["tl","tr","bl","br"].map((c) => (
        <span key={c} style={{
          position: "absolute", width: 5, height: 5,
          top: c.startsWith("t") ? 2 : "auto",
          bottom: c.startsWith("b") ? 2 : "auto",
          left: c.endsWith("l") ? 2 : "auto",
          right: c.endsWith("r") ? 2 : "auto",
          borderTop: c.startsWith("t") ? `1px solid ${color}` : "none",
          borderBottom: c.startsWith("b") ? `1px solid ${color}` : "none",
          borderLeft: c.endsWith("l") ? `1px solid ${color}` : "none",
          borderRight: c.endsWith("r") ? `1px solid ${color}` : "none",
        }} />
      ))}
      <span style={{ position: "relative", zIndex: 1 }}>{label}</span>
    </button>
  );
}

// ─── Radar Orb (decorative header element) ────────────────────────────────────
function RadarOrb({ size = 80, color = "#00ffe7" }: { size?: number; color?: string }) {
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {[1, 0.66, 0.33].map((s, i) => (
        <div key={i} style={{
          position: "absolute",
          width: size * s, height: size * s,
          top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          borderRadius: "50%",
          border: `1px solid ${color}${["44","2a","18"][i]}`,
        }} />
      ))}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: `conic-gradient(from 0deg, ${color}00 270deg, ${color}44 360deg)`,
        animation: "pgRadar 3s linear infinite",
      }} />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{
          position: "absolute", top: "50%", left: "50%",
          width: 4, height: 4, marginTop: -2, marginLeft: -2,
          borderRadius: "50%", background: color,
          boxShadow: `0 0 6px ${color}`,
          animation: `pgOrbit ${2.2 + i * 0.6}s linear infinite`,
          animationDelay: `${i * 0.4}s`,
        }} />
      ))}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: 6, height: 6, borderRadius: "50%",
        background: color, boxShadow: `0 0 10px ${color}`,
        transform: "translate(-50%,-50%)",
        animation: "pgPulse 2s ease-in-out infinite",
      }} />
    </div>
  );
}

// ─── Waveform ─────────────────────────────────────────────────────────────────
function Waveform({ bars = 28, color = YELLOW, height = 28 }: { bars?: number; color?: string; height?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, height }}>
      {Array.from({ length: bars }).map((_, i) => {
        const h = 20 + Math.sin(i * 0.8) * 14 + Math.sin(i * 0.3) * 8;
        return (
          <div key={i} style={{
            flex: 1,
            height: `${h}%`,
            background: color,
            borderRadius: 1,
            opacity: 0.5 + Math.sin(i * 0.6) * 0.3,
            transformOrigin: "center",
            boxShadow: `0 0 4px ${color}`,
            animation: `pgWave ${0.5 + Math.sin(i * 0.9) * 0.35}s ease-in-out infinite alternate`,
            animationDelay: `${(i / bars) * 1.2}s`,
          }} />
        );
      })}
    </div>
  );
}

// ─── Status chip ──────────────────────────────────────────────────────────────
function StatusChip({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 999,
      background: `${color}0d`, border: `1px solid ${color}2a`,
    }}>
      <span style={{
        width: 4, height: 4, borderRadius: "50%", background: color,
        boxShadow: `0 0 6px ${color}`, animation: "pgPulse 2s ease-in-out infinite",
        display: "block",
      }} />
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color, letterSpacing: 1.5 }}>{label}</span>
    </span>
  );
}

// ─── Data stream mini ─────────────────────────────────────────────────────────
function DataStreamMini({ color = "#00ffe7" }: { color?: string }) {
  const chars = "01◈◉▸♦";
  const cols = 6;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: "inherit", opacity: 0.18, pointerEvents: "none" }}>
      {Array.from({ length: cols }).map((_, ci) => (
        <div key={ci} style={{
          position: "absolute",
          left: `${(ci / cols) * 100 + 5}%`,
          top: 0,
          animation: `pgDataStream ${1.8 + Math.random() * 2}s linear infinite`,
          animationDelay: `${Math.random() * 2}s`,
          opacity: 0,
        }}>
          {Array.from({ length: 8 }).map((_, ri) => (
            <div key={ri} style={{
              fontFamily: "'DM Mono', monospace", fontSize: 8,
              color: ri === 7 ? "#fff" : color,
              opacity: 1 - ri * 0.1,
              animation: `pgBlink ${0.4 + Math.random() * 0.6}s step-end infinite`,
              animationDelay: `${Math.random() * 0.5}s`,
              lineHeight: 1.6,
            }}>
              {chars[Math.floor(Math.random() * chars.length)]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Cyber Spinner ────────────────────────────────────────────────────────────
function CyberSpinner({ size = 18, color = YELLOW }: { size?: number; color?: string }) {
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        border: `1px solid ${color}22`,
        borderTop: `1.5px solid ${color}`,
        animation: "pgSpin 1s linear infinite",
      }} />
      <div style={{
        position: "absolute", inset: "28%", borderRadius: "50%",
        border: `1px solid ${color}15`,
        borderBottom: `1px solid ${color}88`,
        animation: "pgSpinR 0.7s linear infinite",
      }} />
    </div>
  );
}

// ─── Count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target: number, active: boolean, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => {
      const duration = 1200;
      const start = performance.now();
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        setVal(Math.round(ease(p) * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(t);
  }, [active, target, delay]);
  return val;
}

// ─── Stats Bar (header) ───────────────────────────────────────────────────────
function StatsBar({ total, filtered, filter }: { total: number; filtered: number; filter: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);
  const countFiltered = useCountUp(filtered, visible, 100);
  const countTotal = useCountUp(total, visible, 200);

  return (
    <div ref={ref} style={{
      display: "flex", gap: 24, flexWrap: "wrap",
      padding: "16px 20px",
      background: "rgba(255,255,255,0.02)",
      border: `1px solid ${BORDER}`,
      borderRadius: 8,
      position: "relative", overflow: "hidden",
    }}>
      <DataStreamMini color="#00ffe7" />
      {[
        { label: "SHOWING", value: countFiltered, color: YELLOW },
        { label: "TOTAL", value: countTotal, color: "#00ffe7" },
        { label: "FILTER", value: filter.toUpperCase(), color: "#bf5af2", raw: true },
      ].map((s, i) => (
        <div key={i} style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: 8, color: "#c0c0c0",
            letterSpacing: 2, marginBottom: 4,
          }}>{s.label}</div>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800,
            fontSize: 20, color: s.color, letterSpacing: -1,
            textShadow: `0 0 16px ${s.color}66`,
            overflow: "hidden", height: 24,
          }}>
            <span style={{ animation: `pgCounterSlide 0.4s ease ${i * 0.06}s both` }}>
              {s.raw ? s.value : s.value}
            </span>
          </div>
        </div>
      ))}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 1 }}>
        <Waveform bars={18} color={YELLOW} height={24} />
        <StatusChip label="LIVE" color="#30d158" />
      </div>
    </div>
  );
}

// ─── Hex Grid decoration ──────────────────────────────────────────────────────
function HexDecor({ color = YELLOW }: { color?: string }) {
  return (
    <div style={{ position: "absolute", right: -20, top: -20, width: 120, height: 120, overflow: "hidden", pointerEvents: "none", opacity: 0.4 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} style={{
            width: 22, height: 26,
            background: `${color}06`,
            border: `1px solid ${color}18`,
            clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
            animation: `pgHexPulse ${2 + (i % 3) * 0.7}s ease-in-out infinite`,
            animationDelay: `${(i % 4) * 0.3}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── Animated Project Card Wrapper ────────────────────────────────────────────
function AnimatedCardWrapper({
  project, index, onClick,
}: { project: Project; index: number; onClick: (p: Project) => void }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.05 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const onMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
    setTilt({
      x: ((e.clientX - r.left) / r.width - 0.5) * 9,
      y: ((e.clientY - r.top) / r.height - 0.5) * -9,
    });
  };

  const onLeave = () => { setTilt({ x: 0, y: 0 }); setHovered(false); setMousePos({ x: 50, y: 50 }); };

  const handleClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((rp) => [...rp, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setRipples((rp) => rp.filter((r) => r.id !== id)), 700);
    onClick(project);
  };

  const color = (project as any).color || YELLOW;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onLeave}
      onMouseMove={onMove}
      onClick={handleClick}
      style={{
        position: "relative", overflow: "hidden",
        borderRadius: 14, cursor: "pointer",
        background: hovered
          ? `conic-gradient(from 200deg at ${mousePos.x}% ${mousePos.y}%, ${color}44, #00ffe733, #bf5af244, ${color}44)`
          : `linear-gradient(135deg, ${color}22, transparent 60%)`,
        padding: 1,
        transform: visible
          ? `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateY(${hovered ? -4 : 0}px) scale(${hovered ? 1.01 : 1})`
          : `translateY(32px) scale(0.97)`,
        opacity: visible ? 1 : 0,
        transition: `opacity 0.55s ${index * 0.07}s ease, transform 0.35s ease`,
        boxShadow: hovered ? `0 16px 48px ${color}22, 0 0 0 1px ${color}22` : "none",
      }}
    >
      {/* Inner bg */}
      <div style={{ background: "#0a0a0a", borderRadius: 13, position: "relative", overflow: "hidden" }}>
        {/* Mouse spotlight */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
          background: `radial-gradient(260px at ${mousePos.x}% ${mousePos.y}%, ${color}10, transparent 60%)`,
          opacity: hovered ? 1 : 0, transition: hovered ? "none" : "opacity 0.4s",
        }} />
        {/* Top accent */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2, zIndex: 2,
          background: `linear-gradient(90deg, ${color}, ${color}00)`,
          opacity: hovered ? 1 : 0.2, transition: "opacity 0.3s",
        }} />
        {/* Scan sweep on hover */}
        {hovered && (
          <div style={{
            position: "absolute", left: 0, right: 0, height: 1, zIndex: 2,
            background: `linear-gradient(90deg, transparent, ${color}66, transparent)`,
            top: `${mousePos.y}%`, pointerEvents: "none",
            transition: "top 0.08s",
          }} />
        )}
        {/* Ripples */}
        {ripples.map((rp) => (
          <span key={rp.id} style={{
            position: "absolute", left: rp.x, top: rp.y,
            width: 8, height: 8, marginLeft: -4, marginTop: -4,
            borderRadius: "50%", background: color, zIndex: 3,
            animation: "pgRipple 0.7s ease-out forwards",
            pointerEvents: "none",
          }} />
        ))}
        {/* Running bottom border */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 1, zIndex: 2, overflow: "hidden",
          opacity: hovered ? 1 : 0, transition: "opacity 0.3s",
        }}>
          <div style={{
            width: "30%", height: "100%", background: color,
            animation: hovered ? "pgBorderRun 1.5s linear infinite" : "none",
          }} />
        </div>

        {/* The actual ProjectCard */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <ProjectCard
            project={project}
            index={index}
            onClick={() => onClick(project)}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Back button ──────────────────────────────────────────────────────────────
function BackButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        fontFamily: "'DM Mono', monospace", fontSize: 10,
        color: hovered ? YELLOW : "#c8c8c8",
        background: hovered ? `${YELLOW}0a` : "none",
        border: `1px solid ${hovered ? YELLOW + "44" : "transparent"}`,
        cursor: "pointer", letterSpacing: 2,
        padding: "8px 14px", borderRadius: 4,
        marginBottom: 40,
        boxShadow: hovered ? `0 0 16px ${YELLOW}22` : "none",
        transition: "all 0.25s",
      }}
    >
      <span style={{
        display: "inline-block",
        transform: `translateX(${hovered ? -4 : 0}px)`,
        transition: "transform 0.25s",
      }}>←</span>
      <span>BACK</span>
      {hovered && <CyberSpinner size={12} color={YELLOW} />}
    </button>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
interface ProjectsPageProps {
  setActivePage: (page: string) => void;
  setActiveProject: (project: Project) => void;
}

export default function ProjectsPage({ setActivePage, setActiveProject }: ProjectsPageProps) {
  const projects = useProjects();
  const [filter, setFilter] = useState("All");
  const [headerVisible, setHeaderVisible] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  const filters = ["All", "Product", "Systems", "UI"];
  const filtered = filter === "All" ? projects : projects.filter((p) => p.type === filter);

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <GlobalStyles />
      <ScanlineOverlay />
      <ParticleBG />

      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "clamp(20px,6vw,40px)",
        paddingTop: "clamp(80px,10vw,100px)",
        position: "relative", zIndex: 2,
      }}>

        {/* Back */}
        <BackButton onClick={() => setActivePage("home")} />

        {/* Section label */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: YELLOW, letterSpacing: 3, whiteSpace: "nowrap", animation: "pgNeonFlicker 10s ease-in-out infinite" }}>
            04 — ALL WORK
          </div>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
          <RadarOrb size={40} color="#00ffe7" />
        </div>

        {/* Header row */}
        <div
          ref={headerRef}
          style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-end", flexWrap: "wrap", gap: 20,
            marginBottom: 24,
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? "none" : "translateY(20px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
            position: "relative",
          }}
        >
          <HexDecor color={YELLOW} />
          <GlitchHeading>
            All <span style={{ color: YELLOW }}>Projects</span>
          </GlitchHeading>

          {/* Filter buttons */}
          <div style={{
            display: "flex", gap: 6, flexWrap: "wrap",
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? "none" : "translateX(16px)",
            transition: "opacity 0.6s 0.15s ease, transform 0.6s 0.15s ease",
          }}>
            {filters.map((f) => (
              <HoloFilterBtn
                key={f}
                label={f}
                active={filter === f}
                onClick={() => setFilter(f)}
                color={f === "All" ? YELLOW : f === "Product" ? "#00ffe7" : f === "Systems" ? "#bf5af2" : "#30d158"}
              />
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          marginBottom: 32,
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? "none" : "translateY(12px)",
          transition: "opacity 0.6s 0.25s ease, transform 0.6s 0.25s ease",
        }}>
          <StatsBar total={projects.length} filtered={filtered.length} filter={filter} />
        </div>

        <NeonDivider color={YELLOW} label={`${filtered.length} PROJECTS LOADED`} />
        <div style={{ marginBottom: 28 }} />

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))",
          gap: 16,
        }}>
          {filtered.map((p, i) => (
            <AnimatedCardWrapper
              key={p.id}
              project={p}
              index={i}
              onClick={(proj) => { setActiveProject(proj); setActivePage("casestudy"); }}
            />
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{
            textAlign: "center", padding: "80px 0",
            animation: "pgFadeUp 0.5s ease both",
          }}>
            <div style={{ fontSize: 48, marginBottom: 16, animation: "pgFloat 3s ease-in-out infinite" }}>◈</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#c8c8c8", letterSpacing: 3 }}>
              NO PROJECTS FOUND FOR <span style={{ color: YELLOW }}>"{filter.toUpperCase()}"</span>
            </div>
          </div>
        )}

        {/* Footer waveform */}
        {filtered.length > 0 && (
          <div style={{
            marginTop: 48,
            borderTop: `1px solid ${BORDER}`,
            paddingTop: 24,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 16,
          }}>
            <Waveform bars={32} color={YELLOW} height={32} />
            <div style={{ display: "flex", gap: 8 }}>
              <StatusChip label="ALL SYSTEMS NOMINAL" color="#30d158" />
              <StatusChip label={`${filtered.length} LOADED`} color={YELLOW} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
