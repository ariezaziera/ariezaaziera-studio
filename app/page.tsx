"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [activePage, setActivePageState] = useState("home");
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeSection, setActiveSection] = useState("home");
  const [isMobile, setIsMobile] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  // ── CHANGE 1: Wrap setActivePage to also push browser history ───────────────
  const setActivePage = useCallback((page: string, project?: Project | null) => {
    setActivePageState(page);
    if (project !== undefined) setActiveProject(project);
    // Push new history entry so back button works
    window.history.pushState({ page, projectId: project?.id ?? null }, "", `#${page}`);
  }, []);

  // ── CHANGE 2: Listen to browser back/forward button ─────────────────────────
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const state = e.state as { page: string; projectId: number | null } | null;
      if (state?.page) {
        setActivePageState(state.page);
        // If going back to casestudy, activeProject should still be in state
        // (it won't be cleared since we only update it on forward navigation)
      } else {
        // No state = back to very beginning, go home
        setActivePageState("home");
      }
      window.scrollTo(0, 0);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // ── CHANGE 3: Set initial history state on mount ─────────────────────────────
  useEffect(() => {
    // Replace current entry so the initial "home" state is recorded
    window.history.replaceState({ page: "home", projectId: null }, "", "#home");
  }, []);

  const handleIntroComplete = () => {
    setIntroComplete(true);
    setTimeout(() => setContentVisible(true), 80);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePage]);

  // ── IntersectionObserver for activeSection ──────────────────────────────────
  useEffect(() => {
    if (activePage !== "home") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0,
      }
    );

    const t = setTimeout(() => {
      const sections = document.querySelectorAll("section[id]");
      sections.forEach((s) => observer.observe(s));
    }, 300);

    return () => {
      clearTimeout(t);
      observer.disconnect();
    };
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

      {!introComplete && <IntroScreen onComplete={handleIntroComplete} />}

      {!isMobile && <Cursor />}
      <Noise />

      <div
        style={{
          opacity: contentVisible ? 1 : 0,
          animation: contentVisible ? "appFadeIn 0.6s ease both" : "none",
          paddingTop: isMobile ? "15px" : "80px",
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