"use client";

import { useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/types";
import { YELLOW, BORDER, CARD, GREEN, RED, inputStyle, btnStyle } from "../layout";
import { Field } from "./Field";
import { SectionDivider } from "./SectionDivider";
import { MockupTypeSelector } from "./MockupTypeSelector";
import { ScreenshotsUpload } from "./ScreenshotsUpload";
import { ImageUpload } from "./ImageUpload";

export function ProjectEditor({
  project,
  onSave,
  onClose,
}: {
  project: Project;
  onSave: (p: Project) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    ...project,
    screenshots: project.screenshots || [],
    mockup_type: project.mockup_type || "desktop",
    video_url: project.video_url || "",
    github_url: project.github_url || "",
    live_url: project.live_url || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Track original media values to detect unsaved changes
  const originalMedia = useMemo(() => ({
    screenshots: JSON.stringify(project.screenshots || []),
    image_url: project.image_url || "",
  }), [project]);

  const hasUnsavedMedia =
    JSON.stringify(form.screenshots) !== originalMedia.screenshots ||
    (form.image_url || "") !== originalMedia.image_url;

  const set = (key: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

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
        tech:
          typeof form.tech === "string"
            ? (form.tech as string).split(",").map((t: string) => t.trim())
            : form.tech,
        featured: form.featured,
        color: form.color,
        type: form.type,
        image_url: form.image_url || null,
        screenshots: form.screenshots || [],
        mockup_type: form.mockup_type || "desktop",
        video_url: form.video_url || null,
        github_url: form.github_url || null,
        live_url: form.live_url || null,
      })
      .eq("id", project.id);
    setSaving(false);
    if (error) { setSaveError(error.message); }
    else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSave({ ...form });
    }
  };

  const techString = Array.isArray(form.tech) ? form.tech.join(", ") : form.tech;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 200, overflowY: "auto", padding: "40px 24px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 32 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>{project.title}</div>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 1, marginTop: 4 }}>EDITING PROJECT</div>
          </div>
          <button onClick={onClose} style={{ ...btnStyle, padding: "6px 14px", fontSize: 10 }}>✕ CLOSE</button>
        </div>

        {/* ── MEDIA ─────────────────────────────────────── */}
        <SectionDivider label="01 — MEDIA" />

        {/* Unsaved media warning */}
        {hasUnsavedMedia && (
          <div style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            background: "#F5C54210",
            border: `1px solid ${YELLOW}40`,
            borderRadius: 8,
            padding: "12px 14px",
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 14, lineHeight: 1, marginTop: 1 }}>⚠</div>
            <div>
              <div style={{ fontSize: 10, color: YELLOW, letterSpacing: 1, fontWeight: 700, marginBottom: 3 }}>
                UNSAVED MEDIA CHANGES
              </div>
              <div style={{ fontSize: 10, color: "#888", lineHeight: 1.6 }}>
                Screenshots or image changes won't take effect until you hit <span style={{ color: "#fff" }}>SAVE CHANGES</span> below. Closing without saving will discard them.
              </div>
            </div>
          </div>
        )}

        <MockupTypeSelector
          value={form.mockup_type}
          onChange={(v) => setForm((f) => ({ ...f, mockup_type: v as "mobile" | "desktop" | "both" }))}
        />
        <ScreenshotsUpload
          projectSlug={project.slug}
          currentScreenshots={form.screenshots}
          onUpdate={(urls) => setForm((f) => ({ ...f, screenshots: urls }))}
        />
        <ImageUpload
          label="LEGACY HERO IMAGE (optional — overridden by screenshots)"
          storagePath={`projects/${project.slug}`}
          currentUrl={form.image_url}
          onUploaded={(url) => setForm((f) => ({ ...f, image_url: url }))}
        />

        {/* ── LINKS ─────────────────────────────────────── */}
        <SectionDivider label="02 — LINKS" />
        <Field label="GITHUB REPO URL" value={form.github_url} onChange={set("github_url")} placeholder="https://github.com/ariezaziera/project" />
        <Field label="LIVE / DEPLOYED URL" value={form.live_url} onChange={set("live_url")} placeholder="https://yourproject.vercel.app" />
        <Field label="PROMO VIDEO URL (YouTube or direct MP4)" value={form.video_url} onChange={set("video_url")} placeholder="https://youtu.be/..." />

        {/* Preview links */}
        <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          {form.github_url && (
            <a href={form.github_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: YELLOW, background: YELLOW + "12", border: `1px solid ${YELLOW}30`, padding: "4px 10px", borderRadius: 4, textDecoration: "none", letterSpacing: 1 }}>
              GITHUB ↗
            </a>
          )}
          {form.live_url && (
            <a href={form.live_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: GREEN, background: GREEN + "12", border: `1px solid ${GREEN}30`, padding: "4px 10px", borderRadius: 4, textDecoration: "none", letterSpacing: 1 }}>
              LIVE SITE ↗
            </a>
          )}
          {form.video_url && (
            <a href={form.video_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: "#60A5FA", background: "#60A5FA12", border: "1px solid #60A5FA30", padding: "4px 10px", borderRadius: 4, textDecoration: "none", letterSpacing: 1 }}>
              VIDEO ↗
            </a>
          )}
        </div>

        {/* ── CONTENT ───────────────────────────────────── */}
        <SectionDivider label="03 — CONTENT" />
        <Field label="TITLE" value={form.title} onChange={set("title")} />
        <Field label="TAGLINE" value={form.tagline} onChange={set("tagline")} />
        <Field label="ROLE" value={form.role} onChange={set("role")} />
        <Field label="TYPE" value={form.type} onChange={set("type")} />
        <Field label="TECH (comma separated)" value={techString} onChange={set("tech" as keyof typeof form)} />

        {/* Color + featured */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 6 }}>ACCENT COLOR</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="text"
                value={form.color}
                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                style={{ ...inputStyle, flex: 1 }}
              />
              <div style={{ width: 32, height: 32, borderRadius: 6, background: form.color, border: `1px solid ${BORDER}`, flexShrink: 0 }} />
            </div>
          </div>
          <div style={{ paddingTop: 26 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#888", cursor: "pointer", whiteSpace: "nowrap" }}>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                style={{ accentColor: YELLOW, width: 14, height: 14 }}
              />
              FEATURED
            </label>
          </div>
        </div>

        <Field label="CONTEXT" value={form.context} onChange={set("context")} multiline />
        <Field label="PROBLEM" value={form.problem} onChange={set("problem")} multiline />
        <Field label="SOLUTION" value={form.solution} onChange={set("solution")} multiline />
        <Field label="OUTCOME" value={form.outcome} onChange={set("outcome")} multiline />

        {saveError && <div style={{ fontSize: 11, color: RED, marginTop: 12 }}>{saveError}</div>}

        {/* Repeat warning near save button if unsaved media */}
        {hasUnsavedMedia && (
          <div style={{ fontSize: 10, color: YELLOW, marginTop: 16, letterSpacing: 0.5 }}>
            ⚠ Media changes pending — save below to apply.
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button onClick={handleSave} disabled={saving} style={{ ...btnStyle, background: YELLOW, color: "#000", flex: 1, opacity: saving ? 0.6 : 1 }}>
            {saving ? "SAVING..." : saved ? "✓ SAVED" : "SAVE CHANGES"}
          </button>
          <button onClick={onClose} style={{ ...btnStyle, flex: 0 }}>CANCEL</button>
        </div>

      </div>
    </div>
  );
}
