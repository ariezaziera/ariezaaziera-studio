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

  const setActivePage = useCallback((page: string, project?: Project | null) => {
    setActivePageState(page);
    if (project !== undefined) setActiveProject(project);
    window.history.pushState({ page, projectId: project?.id ?? null }, "", `#${page}`);
  }, []);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const state = e.state as { page: string; projectId: number | null } | null;
      if (state?.page) {
        setActivePageState(state.page);
      } else {
        setActivePageState("home");
      }
      window.scrollTo(0, 0);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    window.history.replaceState({ page: "home", projectId: null }, "", "#home");
  }, []);

  const handleIntroComplete = () => {
    setIntroComplete(true);
    setTimeout(() => setContentVisible(true), 80);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePage]);

  useEffect(() => {
    if (activePage !== "home") return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
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
    <div className="min-h-screen bg-background text-foreground font-body">
      {!introComplete && <IntroScreen onComplete={handleIntroComplete} />}
      {!isMobile && <Cursor />}
      <Noise />

      <div
  className={`transition-opacity duration-600 ${contentVisible ? "opacity-100 animate-appFadeIn" : "opacity-0"}`}
  style={{ paddingTop: isMobile ? "15px" : "80px" }}
>
  <Nav
    activePage={activePage}
    setActivePage={setActivePage}
    activeSection={activeSection}
  />

  {activePage === "home" && (
    <HomePage setActivePage={setActivePage} setActiveProject={setActiveProject} />
  )}
  {activePage === "projects" && (
    <ProjectsPage setActivePage={setActivePage} setActiveProject={setActiveProject} />
  )}
  {activePage === "casestudy" && activeProject && (
    <CaseStudyPage project={activeProject} setActivePage={setActivePage} />
  )}
</div>
    </div>
  );
}