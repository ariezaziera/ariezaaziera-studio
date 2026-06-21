"use client";

import { useEffect, useRef } from "react";

export default function CircuitBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const COLOR = "#D4A574";
    let W: number, H: number;
    let animFrameId: number;

    interface Node {
      x: number;
      y: number;
      pulse: number;
    }

    interface Line {
      from: Node;
      to: Node;
      progress: number;
      speed: number;
      active: boolean;
    }

    let nodes: Node[] = [];
    let lines: Line[] = [];

    // ✅ Detect mobile
    const isMobile = () => window.innerWidth < 768;

    function resize() {
      W = canvas!.width = canvas!.offsetWidth;
      H = canvas!.height = canvas!.offsetHeight;
      init();
    }

    function init() {
      nodes = [];
      lines = [];

      // ✅ Smaller grid spacing on mobile
      const GRID = isMobile() ? 50 : 80;
      const MAX_DIST = isMobile() ? 100 : 160;

      const cols = Math.floor(W / GRID);
      const rows = Math.floor(H / GRID);

      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          if (Math.random() > 0.45) {
            nodes.push({
              x: c * GRID + (Math.random() - 0.5) * (isMobile() ? 12 : 20),
              y: r * GRID + (Math.random() - 0.5) * (isMobile() ? 12 : 20),
              pulse: Math.random() * Math.PI * 2,
            });
          }
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST && Math.random() > 0.5) {
            lines.push({
              from: nodes[i],
              to: nodes[j],
              progress: Math.random(),
              // ✅ Slightly slower on mobile for smoother feel
              speed: isMobile()
                ? 0.0015 + Math.random() * 0.002
                : 0.002 + Math.random() * 0.003,
              active: Math.random() > 0.6,
            });
          }
        }
      }
    }

    function drawNode(x: number, y: number, pulse: number) {
      // ✅ Slightly smaller nodes on mobile
      const baseR = isMobile() ? 1.5 : 2;
      const r = baseR + Math.sin(pulse) * 0.8;

      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, Math.PI * 2);
      ctx!.fillStyle = COLOR;
      ctx!.fill();

      ctx!.beginPath();
      ctx!.arc(x, y, r + 3, 0, Math.PI * 2);
      ctx!.strokeStyle = COLOR + "44";
      ctx!.lineWidth = 0.5;
      ctx!.stroke();
    }

    function drawLLine(from: Node, to: Node, progress: number) {
      const midX = from.x + (to.x - from.x) * 0.5;
      const totalLen = Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
      const drawn = totalLen * progress;

      ctx!.beginPath();
      ctx!.moveTo(from.x, from.y);

      if (drawn < Math.abs(to.x - from.x) / 2) {
        ctx!.lineTo(from.x + (to.x > from.x ? drawn : -drawn), from.y);
      } else if (drawn < Math.abs(to.x - from.x)) {
        ctx!.lineTo(midX, from.y);
        const rem = drawn - Math.abs(to.x - from.x) / 2;
        ctx!.lineTo(midX + (to.x > midX ? rem : -rem), from.y);
      } else {
        ctx!.lineTo(midX, from.y);
        ctx!.lineTo(to.x, from.y);
        const rem = drawn - Math.abs(to.x - from.x);
        ctx!.lineTo(to.x, from.y + (to.y > from.y ? rem : -rem));
      }

      ctx!.strokeStyle = COLOR + "55";
      // ✅ Slightly thinner lines on mobile
      ctx!.lineWidth = isMobile() ? 0.6 : 0.8;
      ctx!.stroke();
    }

    function animate() {
      ctx!.clearRect(0, 0, W, H);

      for (const line of lines) {
        if (line.active) {
          line.progress += line.speed;
          if (line.progress >= 1) {
            line.progress = 0;
            line.active = Math.random() > 0.3;
          }
        } else {
          if (Math.random() < 0.002) line.active = true;
        }
        drawLLine(line.from, line.to, line.progress);
      }

      for (const node of nodes) {
        node.pulse += 0.03;
        drawNode(node.x, node.y, node.pulse);
      }

      animFrameId = requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener("resize", resize);
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity: 0.25,
        pointerEvents: "none",
      }}
    />
  );
}