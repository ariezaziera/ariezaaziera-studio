"use client";

import { useEffect, useRef } from "react";
import { YELLOW } from "@/constants";

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", move);
    let raf: number;
    const loop = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.12;
      pos.current.y += (target.current.y - pos.current.y) * 0.12;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${pos.current.x - 18}px, ${pos.current.y - 18}px)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${target.current.x - 3}px, ${target.current.y - 3}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        style={{
          position: "fixed", top: 0, left: 0,
          width: 36, height: 36,
          border: `1.5px solid ${YELLOW}`,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9999,
          opacity: 0.4,
          transition: "opacity 0.2s",
        }}
      />
      <div
        ref={dotRef}
        style={{
          position: "fixed", top: 0, left: 0,
          width: 6, height: 6,
          background: YELLOW,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />
    </>
  );
}
