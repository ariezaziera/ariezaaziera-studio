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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on page change
  useEffect(() => { setMenuOpen(false); }, [activePage]);

  const handleNav = (l: string) => {
    const key = l.toLowerCase();
    if (l === "Projects") setActivePage("projects");
    else if (l === "Home") setActivePage("home");
    else {
      setActivePage("home");
      setTimeout(() => {
        document.getElementById(key)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
    setMenuOpen(false);
  };

  return (
    <>
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          padding: "0 clamp(16px, 5vw, 40px)",
          height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: scrolled || menuOpen ? "rgba(8,8,8,0.96)" : "transparent",
          backdropFilter: scrolled || menuOpen ? "blur(12px)" : "none",
          borderBottom: scrolled ? `1px solid ${BORDER}` : "1px solid transparent",
          transition: "all 0.4s ease",
        }}
      >
        <button
          onClick={() => setActivePage("home")}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, zIndex: 101 }}
        >
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>
            AA<span style={{ color: YELLOW }}>.</span>
          </span>
        </button>

        {/* Desktop nav */}
        <div style={{ display: "flex", gap: 8 }} className="desktop-nav">
          {navLinks.map((l) => {
            const key = l.toLowerCase();
            const isActive = activePage === key || (activePage === "home" && activeSection === key);
            return (
              <button
                key={l}
                onClick={() => handleNav(l)}
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

        {/* Hamburger button — mobile only */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="hamburger-btn"
          style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "8px", zIndex: 101,
            display: "none",
            flexDirection: "column", gap: 5, alignItems: "flex-end",
          }}
          aria-label="Toggle menu"
        >
          <span style={{ display: "block", width: 22, height: 1.5, background: menuOpen ? YELLOW : "#fff", transition: "all 0.3s", transform: menuOpen ? "rotate(45deg) translate(4.5px, 4.5px)" : "none" }} />
          <span style={{ display: "block", width: 16, height: 1.5, background: menuOpen ? YELLOW : "#fff", transition: "all 0.3s", opacity: menuOpen ? 0 : 1 }} />
          <span style={{ display: "block", width: 22, height: 1.5, background: menuOpen ? YELLOW : "#fff", transition: "all 0.3s", transform: menuOpen ? "rotate(-45deg) translate(4.5px, -4.5px)" : "none" }} />
        </button>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className="mobile-menu"
        style={{
          position: "fixed", top: 64, left: 0, right: 0, zIndex: 99,
          background: "rgba(8,8,8,0.97)",
          backdropFilter: "blur(16px)",
          borderBottom: `1px solid ${BORDER}`,
          padding: "24px clamp(16px, 5vw, 40px) 32px",
          display: "none",
          flexDirection: "column", gap: 4,
          transform: menuOpen ? "translateY(0)" : "translateY(-8px)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "opacity 0.25s ease, transform 0.25s ease",
        }}
      >
        {navLinks.map((l) => {
          const key = l.toLowerCase();
          const isActive = activePage === key || (activePage === "home" && activeSection === key);
          return (
            <button
              key={l}
              onClick={() => handleNav(l)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500,
                color: isActive ? YELLOW : "#888",
                letterSpacing: 2, padding: "14px 0",
                textAlign: "left",
                borderBottom: `1px solid ${BORDER}`,
                position: "relative",
                transition: "color 0.2s",
              }}
            >
              {l.toUpperCase()}
              {isActive && <span style={{ color: YELLOW, marginLeft: 8 }}>●</span>}
            </button>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 600px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: flex !important; }
          .mobile-menu { display: flex !important; }
        }
      `}</style>
    </>
  );
}
