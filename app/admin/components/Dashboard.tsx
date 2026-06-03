"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/types";
import type { Profile } from "@/lib/data";
import { YELLOW, BORDER, CARD, GREEN, RED, btnStyle } from "../layout";
import { ProjectEditor } from "./ProjectEditor";
import { ProfileEditor } from "./ProfileEditor";
import { AddProjectModal } from "./AddProjectModal";

export function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addError, setAddError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    Promise.all([
      supabase.from("projects").select("*").order("id"),
      supabase.from("profile").select("*").single(),
    ]).then(([{ data: pData }, { data: prData }]) => {
      if (pData) setProjects(pData as Project[]);
      if (prData) setProfile(prData as Profile);
      setLoading(false);
    });
  }, []);

  const handleAddProject = () => {
    setAddError("");
    if (!supabase) {
      setAddError("Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.");
      return;
    }
    setShowAddModal(true);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 11, color: "#c8c8c8", letterSpacing: 2 }}>LOADING...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", padding: "40px clamp(16px, 5vw, 48px)" }}>

      {/* Supabase not configured warning */}
      {!supabase && (
        <div style={{
          marginBottom: 32, padding: "14px 18px",
          background: "#F5C54210", border: "1px solid #F5C54240",
          borderRadius: 10, fontSize: 11, color: "#F5C542", lineHeight: 1.8,
        }}>
          <div style={{ fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>⚠ SUPABASE NOT CONFIGURED</div>
          <div style={{ color: "#888" }}>
            Admin CMS requires Supabase. Add <code style={{ background: "#ffffff10", padding: "1px 6px", borderRadius: 3 }}>NEXT_PUBLIC_SUPABASE_URL</code> and <code style={{ background: "#ffffff10", padding: "1px 6px", borderRadius: 3 }}>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your <code style={{ background: "#ffffff10", padding: "1px 6px", borderRadius: 3 }}>.env.local</code> file and restart the dev server.
          </div>
        </div>
      )}
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 48 }}>
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: -1 }}>
            AA<span style={{ color: YELLOW }}>.</span> Admin
          </div>
          <div style={{ fontSize: 10, color: "#c8c8c8", letterSpacing: 1, marginTop: 4 }}>PORTFOLIO CMS</div>
        </div>
        <button
          onClick={async () => { if (supabase) await supabase.auth.signOut(); onLogout(); }}
          style={{ ...btnStyle, fontSize: 10 }}
        >
          SIGN OUT
        </button>
      </div>

      {/* Profile */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: YELLOW, letterSpacing: 3 }}>01 — PROFILE</div>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
        </div>
        {profile && (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16 }}>{profile.name}</div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{profile.title}</div>
              <div style={{ fontSize: 10, color: "#c0c0c0", marginTop: 6 }}>{profile.email}</div>
            </div>
            <button onClick={() => setEditingProfile(true)} style={{ ...btnStyle, border: `1px solid ${YELLOW}`, color: YELLOW }}>
              EDIT PROFILE
            </button>
          </div>
        )}
      </div>

      {/* Projects */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: YELLOW, letterSpacing: 3 }}>02 — PROJECTS</div>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
          <div style={{ fontSize: 10, color: "#c8c8c8" }}>{projects.length} TOTAL</div>
          <button
            onClick={handleAddProject}
            style={{ ...btnStyle, background: YELLOW, color: "#000", fontSize: 10, padding: "6px 14px" }}
          >
            + ADD PROJECT
          </button>
        </div>

        {addError && (
          <div style={{
            marginBottom: 16, padding: "12px 16px",
            background: "#ff000010", border: "1px solid #ff000040",
            borderRadius: 8, fontSize: 11, color: "#ff6b6b", lineHeight: 1.6,
          }}>
            ⚠ {addError}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {projects.map((p) => {
            const screenshotCount = !p.screenshots ? 0
              : Array.isArray(p.screenshots)
                ? p.screenshots.length
                : p.screenshots.mobile.length + p.screenshots.desktop.length;
            const hasScreenshots = screenshotCount > 0;
            const hasGithub = !!p.github_url;
            const hasLive = !!p.live_url;
            const hasVideo = !!p.video_url;

            return (
              <div key={p.id} onClick={() => setEditingProject(p)} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14 }}>{p.title}</div>
                      {p.featured && <span style={{ fontSize: 8, color: YELLOW, background: YELLOW + "15", border: `1px solid ${YELLOW}30`, padding: "2px 7px", borderRadius: 3, letterSpacing: 1 }}>FEATURED</span>}
                      {hasScreenshots && <span style={{ fontSize: 8, color: GREEN, background: GREEN + "15", border: `1px solid ${GREEN}30`, padding: "2px 7px", borderRadius: 3, letterSpacing: 1 }}>{screenshotCount} SHOTS</span>}
                      {hasGithub && <span style={{ fontSize: 8, color: "#aaa", background: "#ffffff10", border: "1px solid #c8c8c8", padding: "2px 7px", borderRadius: 3, letterSpacing: 1 }}>GH</span>}
                      {hasLive && <span style={{ fontSize: 8, color: "#60A5FA", background: "#60A5FA15", border: "1px solid #60A5FA30", padding: "2px 7px", borderRadius: 3, letterSpacing: 1 }}>LIVE</span>}
                      {hasVideo && <span style={{ fontSize: 8, color: "#C084FC", background: "#C084FC15", border: "1px solid #C084FC30", padding: "2px 7px", borderRadius: 3, letterSpacing: 1 }}>VIDEO</span>}
                    </div>
                    <div style={{ fontSize: 10, color: "#c0c0c0", marginTop: 3 }}>{p.tagline}</div>
                  </div>
                </div>
                <button onClick={() => setEditingProject(p)} style={{ ...btnStyle, fontSize: 10, padding: "6px 14px" }}>EDIT →</button>
              </div>
            );
          })}
        </div>
      </div>

      {showAddModal && (
        <AddProjectModal
          onCreated={(p) => {
            setProjects((ps) => [...ps, p]);
            setShowAddModal(false);
            setEditingProject(p);
          }}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {editingProject && (
        <ProjectEditor
          project={editingProject}
          onSave={(updated) => { setProjects((ps) => ps.map((p) => p.id === updated.id ? updated : p)); setEditingProject(null); }}
          onClose={() => setEditingProject(null)}
          onDelete={(id) => { setProjects((ps) => ps.filter((p) => p.id !== id)); }}
        />
      )}
      {editingProfile && profile && (
        <ProfileEditor profile={profile} onClose={() => setEditingProfile(false)} />
      )}
    </div>
  );
}