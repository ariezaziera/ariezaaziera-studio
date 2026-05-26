import LandingSection from "@/sections/LandingSection";
import AboutSection from "@/sections/AboutSection";
import FeaturedSection from "@/sections/FeaturedSection";
import ContactSection from "@/sections/ContactSection";
import type { Project } from "@/types";

interface HomePageProps {
  setActivePage: (page: string) => void;
  setActiveProject: (project: Project) => void;
}

export default function HomePage({ setActivePage, setActiveProject }: HomePageProps) {
  return (
    <>
      <LandingSection setActivePage={setActivePage} />
      <AboutSection />
      <FeaturedSection setActivePage={setActivePage} setActiveProject={setActiveProject} />
      <ContactSection />
    </>
  );
}
