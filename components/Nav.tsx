"use client";

import { useState, useEffect } from "react";
import { YELLOW, BORDER, navLinks } from "@/constants";

interface NavProps {
  activePage: string;
  setActivePage: (page: string) => void;
  activeSection: string;
}

export default function Nav({ activePage, setActivePage, activeSection }: NavProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 40px",
        height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(8,8,8,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? `1px solid ${BORDER}` : "1px solid transparent",
        transition: "all 0.4s ease",
      }}
    >
      <button
        onClick={() => setActivePage("home")}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 18, color: "#fff", letterSpacing: -0.5 }}>
          AA<span style={{ color: YELLOW }}>.</span>
        </span>
      </button>

      <div style={{ display: "flex", gap: 8 }}>
        {navLinks.map((l) => {
          const key = l.toLowerCase();
          const isActive = activePage === key || (activePage === "home" && activeSection === key);
          return (
            <button
              key={l}
              onClick={() => {
                if (l === "Projects") setActivePage("projects");
                else if (l === "Home") setActivePage("home");
                else {
                  setActivePage("home");
                  setTimeout(() => {
                    document.getElementById(key)?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }
              }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 500,
                color: isActive ? YELLOW : "#666",
                letterSpacing: 1.5, padding: "6px 12px",
                position: "relative",
                transition: "color 0.2s",
              }}
            >
              {l.toUpperCase()}
              {isActive && (
                <div style={{ position: "absolute", bottom: 2, left: 12, right: 12, height: 1, background: YELLOW }} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
