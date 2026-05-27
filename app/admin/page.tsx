"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/types";
import type { Profile } from "@/lib/data";

const YELLOW = "#F5C542";
const BORDER = "#1a1a1a";
const CARD = "#0f0f0f";

// ─── Auth ─────────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!supabase) { setError("Supabase not configured."); return; }
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else onLogin();
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: -1, marginBottom: 8 }}>
            AA<span style={{ color: YELLOW }}>.</span> Admin
          </div>
          <div style={{ fontSize: 11, color: "#555", letterSpacing: 1 }}>PORTFOLIO CMS</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={inputStyle}
          />
          {error && <div style={{ fontSize: 11, color: "#f87171", letterSpacing: 0.5 }}>{error}</div>}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ ...btnStyle, background: YELLOW, color: "#000", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "SIGNING IN..." : "SIGN IN →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ label, value, onChange, multiline = false }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 6 }}>{label}</div>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        />
      )}
    </div>
  );
}

// ─── Project Editor ───────────────────────────────────────────────────────────

function ProjectEditor({ project, onSave, onClose }: {
  project: Project;
  onSave: (p: Project) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ ...project });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (key: keyof Project) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  const handleSave = async () => {
    if (!supabase) return;
    setSaving(true);
    const { error } = await supabase
      .from("projects")
      .update({
        title: form.title,
        tagline: form.tagline,
        role: form.role,
        context: form.context,
        problem: form.problem,
        solution: form.solution,
        outcome: form.outcome,
        tech: typeof form.tech === "string"
          ? (form.tech as string).split(",").map((t: string) => t.trim())
          : form.tech,
        featured: form.featured,
        color: form.color,
        type: form.type,
      })
      .eq("id", project.id);

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSave({ ...form });
    }
  };

  const techString = Array.isArray(form.tech) ? form.tech.join(", ") : form.tech;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, overflowY: "auto", padding: "40px 24px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>{project.title}</div>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 1, marginTop: 4 }}>EDITING PROJECT</div>
          </div>
          <button onClick={onClose} style={{ ...btnStyle, padding: "6px 14px", fontSize: 10 }}>✕ CLOSE</button>
        </div>

        <Field label="TITLE" value={form.title} onChange={set("title")} />
        <Field label="TAGLINE" value={form.tagline} onChange={set("tagline")} />
        <Field label="ROLE" value={form.role} onChange={set("role")} />
        <Field label="TYPE" value={form.type} onChange={set("type")} />
        <Field label="TECH (comma separated)" value={techString} onChange={set("tech" as keyof Project)} />
        <Field label="ACCENT COLOR (hex)" value={form.color} onChange={set("color")} />
        <Field label="CONTEXT" value={form.context} onChange={set("context")} multiline />
        <Field label="PROBLEM" value={form.problem} onChange={set("problem")} multiline />
        <Field label="SOLUTION" value={form.solution} onChange={set("solution")} multiline />
        <Field label="OUTCOME" value={form.outcome} onChange={set("outcome")} multiline />

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#888", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
              style={{ accentColor: YELLOW }}
            />
            FEATURED
          </label>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ ...btnStyle, background: YELLOW, color: "#000", flex: 1, opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "SAVING..." : saved ? "✓ SAVED" : "SAVE CHANGES"}
          </button>
          <button onClick={onClose} style={{ ...btnStyle, flex: 0 }}>CANCEL</button>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Editor ───────────────────────────────────────────────────────────

function ProfileEditor({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const [form, setForm] = useState({
    ...profile,
    about: profile.about.join("\n\n"),
    skills: profile.skills.join(", "),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  const handleSave = async () => {
    if (!supabase) return;
    setSaving(true);
    setError("");
    const { error } = await supabase
      .from("profile")
      .update({
        name: form.name,
        title: form.title,
        tagline: form.tagline,
        about: form.about.split("\n\n").map((s) => s.trim()).filter(Boolean),
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        email: form.email,
        github: form.github,
        linkedin: form.linkedin,
      })
      .eq("id", 1);

    setSaving(false);
    if (error) setError(error.message);
    else { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, overflowY: "auto", padding: "40px 24px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>Profile</div>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 1, marginTop: 4 }}>EDITING PROFILE</div>
          </div>
          <button onClick={onClose} style={{ ...btnStyle, padding: "6px 14px", fontSize: 10 }}>✕ CLOSE</button>
        </div>

        <Field label="NAME" value={form.name} onChange={set("name")} />
        <Field label="TITLE" value={form.title} onChange={set("title")} />
        <Field label="TAGLINE" value={form.tagline} onChange={set("tagline")} />
        <Field label="ABOUT (separate paragraphs with a blank line)" value={form.about} onChange={set("about")} multiline />
        <Field label="SKILLS (comma separated)" value={form.skills} onChange={set("skills")} />
        <Field label="EMAIL" value={form.email} onChange={set("email")} />
        <Field label="GITHUB URL" value={form.github} onChange={set("github")} />
        <Field label="LINKEDIN URL" value={form.linkedin} onChange={set("linkedin")} />

        {error && <div style={{ fontSize: 11, color: "#f87171", marginBottom: 12 }}>{error}</div>}

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ ...btnStyle, background: YELLOW, color: "#000", flex: 1, opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "SAVING..." : saved ? "✓ SAVED" : "SAVE CHANGES"}
          </button>
          <button onClick={onClose} style={{ ...btnStyle, flex: 0 }}>CANCEL</button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    Promise.all([
      supabase.from("projects").select("*").order("id"),
      supabase.from("profile").select("*").single(),
    ]).then(([{ data: pData }, { data: prData }]) => {
      if (pData) setProjects(pData as Project[]);
      if (prData) setProfile(prData as Profile);
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    onLogout();
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 11, color: "#555", letterSpacing: 2 }}>LOADING...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "40px clamp(16px, 5vw, 48px)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 48 }}>
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: -1 }}>
            AA<span style={{ color: YELLOW }}>.</span> Admin
          </div>
          <div style={{ fontSize: 10, color: "#555", letterSpacing: 1, marginTop: 4 }}>PORTFOLIO CMS</div>
        </div>
        <button onClick={handleLogout} style={{ ...btnStyle, fontSize: 10 }}>SIGN OUT</button>
      </div>

      {/* Profile section */}
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
              <div style={{ fontSize: 10, color: "#444", marginTop: 6 }}>{profile.email}</div>
            </div>
            <button onClick={() => setEditingProfile(true)} style={{ ...btnStyle, borderColor: YELLOW, color: YELLOW }}>
              EDIT PROFILE
            </button>
          </div>
        )}
      </div>

      {/* Projects section */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: YELLOW, letterSpacing: 3 }}>02 — PROJECTS</div>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
          <div style={{ fontSize: 10, color: "#555" }}>{projects.length} TOTAL</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {projects.map((p) => (
            <div
              key={p.id}
              style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14 }}>{p.title}</div>
                  <div style={{ fontSize: 10, color: "#555", marginTop: 3 }}>{p.tagline}</div>
                </div>
                {p.featured && (
                  <div style={{ fontSize: 9, color: YELLOW, background: YELLOW + "20", border: `1px solid ${YELLOW}40`, padding: "2px 8px", borderRadius: 3, letterSpacing: 1 }}>
                    FEATURED
                  </div>
                )}
              </div>
              <button
                onClick={() => setEditingProject(p)}
                style={{ ...btnStyle, fontSize: 10, padding: "6px 14px" }}
              >
                EDIT →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {editingProject && (
        <ProjectEditor
          project={editingProject}
          onSave={(updated) => {
            setProjects((ps) => ps.map((p) => p.id === updated.id ? updated : p));
            setEditingProject(null);
          }}
          onClose={() => setEditingProject(null)}
        />
      )}
      {editingProfile && profile && (
        <ProfileEditor
          profile={profile}
          onClose={() => setEditingProfile(false)}
        />
      )}
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#0a0a0a",
  border: `1px solid ${BORDER}`,
  borderRadius: 6,
  padding: "10px 14px",
  color: "#fff",
  fontFamily: "'DM Mono', monospace",
  fontSize: 12,
  outline: "none",
};

const btnStyle: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: 11,
  letterSpacing: 1,
  padding: "9px 18px",
  borderRadius: 4,
  border: `1px solid ${BORDER}`,
  background: "transparent",
  color: "#888",
  cursor: "pointer",
  whiteSpace: "nowrap" as const,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!supabase) { setAuthed(false); return; }
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (authed === null) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 11, color: "#555", letterSpacing: 2 }}>...</div>
      </div>
    );
  }

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;
  return <Dashboard onLogout={() => setAuthed(false)} />;
}
