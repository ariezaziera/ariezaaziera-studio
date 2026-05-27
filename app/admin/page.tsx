"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} style={inputStyle} />
          {error && <div style={{ fontSize: 11, color: "#f87171", letterSpacing: 0.5 }}>{error}</div>}
          <button onClick={handleLogin} disabled={loading} style={{ ...btnStyle, background: YELLOW, color: "#000", opacity: loading ? 0.6 : 1 }}>
            {loading ? "SIGNING IN..." : "SIGN IN →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ label, value, onChange, multiline = false }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 6 }}>{label}</div>
      {multiline
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }} />
        : <input type="text" value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
      }
    </div>
  );
}

// ─── Image Upload with Preview ────────────────────────────────────────────────

function ImageUpload({ projectSlug, currentUrl, onUploaded }: {
  projectSlug: string;
  currentUrl?: string;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // localPreview = base64 blob URL shown before upload
  // confirmedUrl = the saved Supabase URL after upload
  const [localPreview, setLocalPreview] = useState<string>("");
  const [confirmedUrl, setConfirmedUrl] = useState<string>(currentUrl || "");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const selectFile = (file: File) => {
    setError("");
    if (!file.type.startsWith("image/")) { setError("Only image files allowed."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Max file size is 5MB."); return; }
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setPendingFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) selectFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) selectFile(file);
  };

  const handleConfirmUpload = useCallback(async () => {
    if (!pendingFile || !supabase) return;
    setUploading(true);
    setError("");

    const ext = pendingFile.name.split(".").pop();
    const path = `projects/${projectSlug}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("portfolio-images")
      .upload(path, pendingFile, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("portfolio-images").getPublicUrl(path);
    setConfirmedUrl(data.publicUrl);
    setLocalPreview("");
    setPendingFile(null);
    onUploaded(data.publicUrl);
    setUploading(false);
  }, [pendingFile, projectSlug, onUploaded]);

  const handleCancelPreview = () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview("");
    setPendingFile(null);
    setError("");
  };

  const handleRemove = () => {
    setConfirmedUrl("");
    setLocalPreview("");
    setPendingFile(null);
    onUploaded("");
  };

  const shownImage = localPreview || confirmedUrl;
  const isPending = !!localPreview && !!pendingFile;

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 8 }}>PROJECT IMAGE</div>

      {shownImage ? (
        <div style={{ border: `1px solid ${isPending ? YELLOW + "60" : BORDER}`, borderRadius: 8, overflow: "hidden", position: "relative" }}>
          {/* Preview image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shownImage} alt="Preview" style={{ width: "100%", height: 200, objectFit: "cover", display: "block", filter: isPending ? "brightness(0.7)" : "none", transition: "filter 0.2s" }} />

          {/* Pending badge */}
          {isPending && (
            <div style={{ position: "absolute", top: 10, left: 10, fontSize: 9, letterSpacing: 1, color: YELLOW, background: "rgba(0,0,0,0.85)", border: `1px solid ${YELLOW}60`, padding: "4px 10px", borderRadius: 4 }}>
              ● PREVIEW — NOT UPLOADED YET
            </div>
          )}

          {/* Confirmed badge */}
          {!isPending && confirmedUrl && (
            <div style={{ position: "absolute", top: 10, left: 10, fontSize: 9, letterSpacing: 1, color: "#4ADE80", background: "rgba(0,0,0,0.85)", border: "1px solid #4ADE8060", padding: "4px 10px", borderRadius: 4 }}>
              ✓ UPLOADED
            </div>
          )}

          {/* Action buttons */}
          <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 6 }}>
            {isPending ? (
              <>
                <button
                  onClick={handleConfirmUpload}
                  disabled={uploading}
                  style={{ ...btnStyle, fontSize: 9, padding: "5px 12px", background: uploading ? "rgba(0,0,0,0.8)" : YELLOW, color: uploading ? "#888" : "#000", border: `1px solid ${YELLOW}`, opacity: uploading ? 0.7 : 1 }}
                >
                  {uploading ? "UPLOADING..." : "CONFIRM UPLOAD ↑"}
                </button>
                <button
                  onClick={handleCancelPreview}
                  style={{ ...btnStyle, fontSize: 9, padding: "5px 10px", background: "rgba(0,0,0,0.8)", border: "1px solid #555" }}
                >
                  CANCEL
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => inputRef.current?.click()}
                  style={{ ...btnStyle, fontSize: 9, padding: "5px 10px", background: "rgba(0,0,0,0.8)", border: "1px solid #333" }}
                >
                  REPLACE
                </button>
                <button
                  onClick={handleRemove}
                  style={{ ...btnStyle, fontSize: 9, padding: "5px 10px", background: "rgba(0,0,0,0.8)", border: "1px solid #f87171", color: "#f87171" }}
                >
                  REMOVE
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        // Drop zone
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `1px dashed ${dragOver ? YELLOW : BORDER}`,
            borderRadius: 8,
            padding: "36px 24px",
            textAlign: "center",
            cursor: "pointer",
            background: dragOver ? YELLOW + "08" : "transparent",
            transition: "all 0.2s",
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 10, color: "#444" }}>↑</div>
          <div style={{ fontSize: 11, color: "#666", letterSpacing: 1 }}>CLICK OR DRAG IMAGE HERE</div>
          <div style={{ fontSize: 10, color: "#333", marginTop: 6 }}>PNG, JPG, WEBP — MAX 5MB</div>
          <div style={{ fontSize: 10, color: "#555", marginTop: 4 }}>Preview will appear before upload</div>
        </div>
      )}

      {error && <div style={{ fontSize: 10, color: "#f87171", marginTop: 6, letterSpacing: 0.5 }}>{error}</div>}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileInput} style={{ display: "none" }} />
    </div>
  );
}

// ─── Project Editor ───────────────────────────────────────────────────────────

function ProjectEditor({ project, onSave, onClose }: {
  project: Project; onSave: (p: Project) => void; onClose: () => void;
}) {
  const [form, setForm] = useState({ ...project });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  const set = (key: keyof Project) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const handleSave = async () => {
    if (!supabase) return;
    setSaving(true);
    setSaveError("");
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
        image_url: form.image_url || null,
      })
      .eq("id", project.id);

    setSaving(false);
    if (error) { 
      console.log("SAVE ERROR:", error);
      setSaveError(error.message); 
    }
    else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSave({ ...form });
    }
  };

  const techString = Array.isArray(form.tech) ? form.tech.join(", ") : form.tech;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 200, overflowY: "auto", padding: "40px 24px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>{project.title}</div>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 1, marginTop: 4 }}>EDITING PROJECT</div>
          </div>
          <button onClick={onClose} style={{ ...btnStyle, padding: "6px 14px", fontSize: 10 }}>✕ CLOSE</button>
        </div>

        {/* Image upload — confirm before saving */}
        <ImageUpload
          projectSlug={project.slug}
          currentUrl={form.image_url}
          onUploaded={(url) => setForm((f) => ({ ...f, image_url: url }))}
        />

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
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} style={{ accentColor: YELLOW }} />
            FEATURED
          </label>
        </div>

        {saveError && <div style={{ fontSize: 11, color: "#f87171", marginTop: 12 }}>{saveError}</div>}

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={handleSave} disabled={saving} style={{ ...btnStyle, background: YELLOW, color: "#000", flex: 1, opacity: saving ? 0.6 : 1 }}>
            {saving ? "SAVING..." : saved ? "✓ SAVED" : "SAVE CHANGES"}
          </button>
          <button onClick={onClose} style={{ ...btnStyle, flex: 0 }}>CANCEL</button>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Editor ───────────────────────────────────────────────────────────

function ProfilePhotoUpload({ currentUrl, onUploaded }: {
  currentUrl?: string;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [localPreview, setLocalPreview] = useState<string>("");
  const [confirmedUrl, setConfirmedUrl] = useState<string>(currentUrl || "");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const selectFile = (file: File) => {
    setError("");
    if (!file.type.startsWith("image/")) { setError("Only image files allowed."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Max file size is 5MB."); return; }
    setLocalPreview(URL.createObjectURL(file));
    setPendingFile(file);
  };

  const handleConfirm = async () => {
    if (!pendingFile || !supabase) return;
    setUploading(true);
    setError("");
    const ext = pendingFile.name.split(".").pop();
    const path = `profile/photo-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("portfolio-images")
      .upload(path, pendingFile, { upsert: true });
    if (uploadError) { setError(uploadError.message); setUploading(false); return; }
    const { data } = supabase.storage.from("portfolio-images").getPublicUrl(path);
    setConfirmedUrl(data.publicUrl);
    setLocalPreview("");
    setPendingFile(null);
    onUploaded(data.publicUrl);
    setUploading(false);
  };

  const handleCancel = () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview("");
    setPendingFile(null);
  };

  const handleRemove = () => {
    setConfirmedUrl("");
    setLocalPreview("");
    setPendingFile(null);
    onUploaded("");
  };

  const shownImage = localPreview || confirmedUrl;
  const isPending = !!localPreview && !!pendingFile;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 8 }}>PROFILE PHOTO</div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>

        {/* Avatar preview circle */}
        <div
          onClick={() => !shownImage && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) selectFile(f); }}
          style={{
            width: 96, height: 96, borderRadius: "50%", flexShrink: 0,
            border: `2px ${shownImage ? "solid" : "dashed"} ${isPending ? YELLOW : dragOver ? YELLOW : shownImage ? BORDER : "#333"}`,
            overflow: "hidden", cursor: shownImage ? "default" : "pointer",
            background: "#0a0a0a", position: "relative",
            transition: "border-color 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {shownImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shownImage} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover", filter: isPending ? "brightness(0.6)" : "none", transition: "filter 0.2s" }} />
          ) : (
            <div style={{ fontSize: 28, color: "#333" }}>+</div>
          )}
          {/* Pending ring pulse */}
          {isPending && (
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${YELLOW}`, animation: "cornerPulse 1.2s ease-in-out infinite" }} />
          )}
        </div>

        {/* Right side info + actions */}
        <div style={{ flex: 1 }}>
          {isPending ? (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: YELLOW, letterSpacing: 1, marginBottom: 8 }}>● PREVIEW — NOT UPLOADED YET</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleConfirm} disabled={uploading} style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: 1, padding: "5px 12px", borderRadius: 4, cursor: "pointer", whiteSpace: "nowrap", borderWidth: 1, borderStyle: "solid", borderColor: YELLOW, background: uploading ? "transparent" : YELLOW, color: uploading ? "#888" : "#000", opacity: uploading ? 0.7 : 1 }}>
                  {uploading ? "UPLOADING..." : "CONFIRM ↑"}
                </button>
                <button onClick={handleCancel} style={{ ...btnStyle, fontSize: 9, padding: "5px 10px" }}>CANCEL</button>
              </div>
            </div>
          ) : confirmedUrl ? (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: "#4ADE80", letterSpacing: 1, marginBottom: 8 }}>✓ UPLOADED</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => inputRef.current?.click()} style={{ ...btnStyle, fontSize: 9, padding: "5px 10px" }}>REPLACE</button>
                <button onClick={handleRemove} style={{ ...btnStyle, fontSize: 9, padding: "5px 10px", border: "1px solid #f87171", color: "#f87171" }}>REMOVE</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>Click circle or drag photo here</div>
              <div style={{ fontSize: 10, color: "#333" }}>PNG, JPG, WEBP — MAX 5MB</div>
              <button onClick={() => inputRef.current?.click()} style={{ ...btnStyle, fontSize: 9, padding: "5px 12px", marginTop: 10 }}>BROWSE FILE</button>
            </div>
          )}
          {error && <div style={{ fontSize: 10, color: "#f87171", marginTop: 6 }}>{error}</div>}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) selectFile(f); e.target.value = ""; }} style={{ display: "none" }} />
    </div>
  );
}

function ProfileEditor({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const [form, setForm] = useState({
    ...profile,
    about: profile.about.join("\n\n"),
    skills: profile.skills.join(", "),
    photo_url: (profile as Profile & { photo_url?: string }).photo_url || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

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
        photo_url: form.photo_url || null,
      })
      .eq("id", 1);

    setSaving(false);
    if (error) setError(error.message);
    else { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 200, overflowY: "auto", padding: "40px 24px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>Profile</div>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 1, marginTop: 4 }}>EDITING PROFILE</div>
          </div>
          <button onClick={onClose} style={{ ...btnStyle, padding: "6px 14px", fontSize: 10 }}>✕ CLOSE</button>
        </div>

        <ProfilePhotoUpload
          currentUrl={form.photo_url}
          onUploaded={(url) => setForm((f) => ({ ...f, photo_url: url }))}
        />

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
          <button onClick={handleSave} disabled={saving} style={{ ...btnStyle, background: YELLOW, color: "#000", flex: 1, opacity: saving ? 0.6 : 1 }}>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 48 }}>
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: -1 }}>
            AA<span style={{ color: YELLOW }}>.</span> Admin
          </div>
          <div style={{ fontSize: 10, color: "#555", letterSpacing: 1, marginTop: 4 }}>PORTFOLIO CMS</div>
        </div>
        <button onClick={handleLogout} style={{ ...btnStyle, fontSize: 10 }}>SIGN OUT</button>
      </div>

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
            <button onClick={() => setEditingProfile(true)} style={{ ...btnStyle, border: `1px solid ${YELLOW}`, color: YELLOW }}>EDIT PROFILE</button>
          </div>
        )}
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: YELLOW, letterSpacing: 3 }}>02 — PROJECTS</div>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
          <div style={{ fontSize: 10, color: "#555" }}>{projects.length} TOTAL</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {projects.map((p) => (
            <div key={p.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14 }}>{p.title}</div>
                    {p.image_url && (
                      <div style={{ fontSize: 9, color: "#4ADE80", background: "#4ADE8015", border: "1px solid #4ADE8040", padding: "2px 7px", borderRadius: 3, letterSpacing: 1 }}>IMG ✓</div>
                    )}
                    {p.featured && (
                      <div style={{ fontSize: 9, color: YELLOW, background: YELLOW + "15", border: `1px solid ${YELLOW}40`, padding: "2px 8px", borderRadius: 3, letterSpacing: 1 }}>FEATURED</div>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: "#555", marginTop: 3 }}>{p.tagline}</div>
                </div>
              </div>
              <button onClick={() => setEditingProject(p)} style={{ ...btnStyle, fontSize: 10, padding: "6px 14px" }}>EDIT →</button>
            </div>
          ))}
        </div>
      </div>

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
        <ProfileEditor profile={profile} onClose={() => setEditingProfile(false)} />
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
    supabase.auth.getSession().then(({ data }) => { setAuthed(!!data.session); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => { setAuthed(!!session); });
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