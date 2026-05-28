"use client";

import { useState, useEffect } from "react";
import { BG } from "@/constants";
import type { Project } from "@/types";
import Cursor from "@/components/Cursor";
import Noise from "@/components/Noise";
import Nav from "@/components/Nav";
import IntroScreen from "@/components/IntroScreen";
import HomePage from "@/sections/HomePage";
import ProjectsPage from "@/sections/ProjectsPage";
import CaseStudyPage from "@/sections/CaseStudyPage";

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeSection] = useState("home");
  const [isMobile, setIsMobile] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  const handleIntroComplete = () => {
    setIntroComplete(true);
    // Slight delay before fading in content for a clean handoff
    setTimeout(() => setContentVisible(true), 80);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePage]);

  useEffect(() => {
    const check = () =>
      setIsMobile(
        window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 640
      );
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div
      style={{
        background: BG,
        minHeight: "100vh",
        color: "#fff",
        fontFamily: "'DM Mono', monospace",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Space+Grotesk:wght@400;500;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #080808; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 1; }
        }
        @keyframes appFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @media (hover: hover) and (pointer: fine) {
          * { cursor: none !important; }
        }
      `}</style>

      {/* Intro screen — sits on top, unmounts after transition */}
      {!introComplete && <IntroScreen onComplete={handleIntroComplete} />}

      {!isMobile && <Cursor />}
      <Noise />

      {/* Nav + content fade in after intro */}
      <div
        style={{
          opacity: contentVisible ? 1 : 0,
          animation: contentVisible ? "appFadeIn 0.6s ease both" : "none",
          paddingTop: isMobile ? "20px" : "80px",
        }}
      >
        <Nav
          activePage={activePage}
          setActivePage={setActivePage}
          activeSection={activeSection}
        />

        <div style={{ opacity: 1, transition: "opacity 0.3s" }}>
          {activePage === "home" && (
            <HomePage
              setActivePage={setActivePage}
              setActiveProject={setActiveProject}
            />
          )}
          {activePage === "projects" && (
            <ProjectsPage
              setActivePage={setActivePage}
              setActiveProject={setActiveProject}
            />
          )}
          {activePage === "casestudy" && activeProject && (
            <CaseStudyPage
              project={activeProject}
              setActivePage={setActivePage}
            />
          )}
        </div>
      </div>
    </div>
  );
}