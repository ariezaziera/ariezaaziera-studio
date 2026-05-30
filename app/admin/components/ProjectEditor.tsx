"use client";

import { useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/types";
import { YELLOW, BORDER, CARD, GREEN, RED, inputStyle, btnStyle } from "../layout";
import { Field } from "./Field";
import { SectionDivider } from "./SectionDivider";
import { ScreenshotsUpload } from "./ScreenshotsUpload";
import type { SplitScreenshots } from "./ScreenshotsUpload";
import { ImageUpload } from "./ImageUpload";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalise whatever is in DB (flat array or split object) into SplitScreenshots */
function normScreenshots(raw: Project["screenshots"]): SplitScreenshots {
  if (!raw) return { mobile: [], desktop: [] };
  if (Array.isArray(raw)) return { mobile: raw, desktop: [] };
  return { mobile: raw.mobile ?? [], desktop: raw.desktop ?? [] };
}

/** Derive mockup_type from split screenshots */
function deriveMockupType(ss: SplitScreenshots): "mobile" | "desktop" | "both" {
  const hasMobile = ss.mobile.length > 0;
  const hasDesktop = ss.desktop.length > 0;
  if (hasMobile && hasDesktop) return "both";
  if (hasDesktop) return "desktop";
  return "mobile";
}

// ─── NEW: Status config ───────────────────────────────────────────────────────
const STATUS_OPTIONS: Array<{
  value: string;
  label: string;
  color: string;
  dot: string;
  desc: string;
}> = [
  { value: "live",      label: "LIVE",       color: "#4ADE80", dot: "#4ADE80", desc: "Deployed & publicly accessible" },
  { value: "in-dev",    label: "IN DEV",     color: "#F5C518", dot: "#F5C518", desc: "Still being built" },
  { value: "completed", label: "COMPLETED",  color: "#60A5FA", dot: "#60A5FA", desc: "Done, not necessarily public" },
  { value: "archived",  label: "ARCHIVED",   color: "#555",    dot: "#555",    desc: "No longer maintained" },
];

function StatusSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const current = STATUS_OPTIONS.find((s) => s.value === value) ?? STATUS_OPTIONS[0];

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 8 }}>
        PROJECT STATUS
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {STATUS_OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              title={opt.desc}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "7px 14px",
                borderRadius: 6,
                border: `1px solid ${active ? opt.color + "55" : "#1e1e1e"}`,
                background: active ? opt.color + "12" : "#0a0a0a",
                cursor: "pointer",
                transition: "all 0.18s",
              }}
            >
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: opt.dot,
                opacity: active ? 1 : 0.3,
                boxShadow: active ? `0 0 6px ${opt.dot}` : "none",
                flexShrink: 0,
                transition: "all 0.18s",
              }} />
              <span style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 9, letterSpacing: 1.5,
                color: active ? opt.color : "#444",
                transition: "color 0.18s",
              }}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Description of selected */}
      <div style={{
        marginTop: 8, fontSize: 10, color: "#444",
        fontFamily: "'DM Mono', monospace", letterSpacing: 0.5,
      }}>
        → {current.desc}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ProjectEditor({
  project,
  onSave,
  onClose,
  onDelete,
}: {
  project: Project;
  onSave: (p: Project) => void;
  onClose: () => void;
  onDelete?: (id: number) => void;
}) {
  const [form, setForm] = useState({
    ...project,
    screenshots: normScreenshots(project.screenshots),
    video_url: project.video_url || "",
    github_url: project.github_url || "",
    live_url: project.live_url || "",
    image_url: project.image_url || "",
    status: project.status || "live",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Detect unsaved media changes
  const originalMedia = useMemo(() => ({
    screenshots: JSON.stringify(normScreenshots(project.screenshots)),
    image_url: project.image_url || "",
  }), [project]);

  const hasUnsavedMedia =
    JSON.stringify(form.screenshots) !== originalMedia.screenshots ||
    form.image_url !== originalMedia.image_url;

  const set = (key: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  const handleSave = async () => {
    if (!supabase) return;
    setSaving(true);
    setSaveError("");

    const mockupType = deriveMockupType(form.screenshots);

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
        status: form.status,
        image_url: form.image_url || null,
        // Store as JSONB split object in DB
        screenshots: form.screenshots,
        // Auto-derived — no longer manually set
        mockup_type: mockupType,
        video_url: form.video_url || null,
        github_url: form.github_url || null,
        live_url: form.live_url || null,
      })
      .eq("id", project.id);

    setSaving(false);
    if (error) {
      setSaveError(error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSave({ ...form, mockup_type: mockupType });
    }
  };

  const handleDelete = async () => {
    if (!supabase || !onDelete) return;
    setDeleting(true);
    const { error } = await supabase.from("projects").delete().eq("id", project.id);
    setDeleting(false);
    if (!error) {
      onDelete(project.id);
      onClose();
    }
  };

  const techString = Array.isArray(form.tech) ? form.tech.join(", ") : form.tech;
  const mockupPreview = deriveMockupType(form.screenshots);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)",
      zIndex: 200, overflowY: "auto", padding: "40px 24px",
    }}>
      <div style={{
        maxWidth: 720, margin: "0 auto", background: CARD,
        border: `1px solid ${BORDER}`, borderRadius: 12, padding: 32,
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>
              {project.title}
            </div>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 1, marginTop: 4 }}>EDITING PROJECT</div>
          </div>
          <button onClick={onClose} style={{ ...btnStyle, padding: "6px 14px", fontSize: 10 }}>✕ CLOSE</button>
        </div>

        {/* ── MEDIA ─────────────────────────────────────── */}
        <SectionDivider label="01 — MEDIA" />

        {/* Unsaved media warning */}
        {hasUnsavedMedia && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            background: "#F5C54210", border: `1px solid ${YELLOW}40`,
            borderRadius: 8, padding: "12px 14px", marginBottom: 16,
          }}>
            <div style={{ fontSize: 14, lineHeight: 1, marginTop: 1 }}>⚠</div>
            <div>
              <div style={{ fontSize: 10, color: YELLOW, letterSpacing: 1, fontWeight: 700, marginBottom: 3 }}>
                UNSAVED MEDIA CHANGES
              </div>
              <div style={{ fontSize: 10, color: "#888", lineHeight: 1.6 }}>
                Screenshots or image changes won't take effect until you hit{" "}
                <span style={{ color: "#fff" }}>SAVE CHANGES</span> below.
              </div>
            </div>
          </div>
        )}

        {/* Mockup type auto-indicator */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
          padding: "8px 14px", background: "#0a0a0a", borderRadius: 7,
          border: `1px solid #1a1a1a`,
        }}>
          <div style={{ fontSize: 9, color: "#555", letterSpacing: 1 }}>AUTO-DETECTED MOCKUP</div>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
          <div style={{
            fontSize: 9, letterSpacing: 1, fontWeight: 700,
            color: mockupPreview === "both" ? GREEN
              : mockupPreview === "mobile" ? "#C084FC" : "#60A5FA",
          }}>
            {mockupPreview === "both" ? "📱 MOBILE + 🖥 DESKTOP"
              : mockupPreview === "mobile" ? "📱 MOBILE ONLY"
                : "🖥 DESKTOP ONLY"}
          </div>
        </div>

        <ScreenshotsUpload
          projectSlug={project.slug}
          currentScreenshots={form.screenshots}
          onUpdate={(ss: SplitScreenshots) =>
            setForm((f) => ({ ...f, screenshots: ss }))
          }
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
            <a href={form.github_url} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 10, color: YELLOW, background: YELLOW + "12", border: `1px solid ${YELLOW}30`, padding: "4px 10px", borderRadius: 4, textDecoration: "none", letterSpacing: 1 }}>
              GITHUB ↗
            </a>
          )}
          {form.live_url && (
            <a href={form.live_url} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 10, color: GREEN, background: GREEN + "12", border: `1px solid ${GREEN}30`, padding: "4px 10px", borderRadius: 4, textDecoration: "none", letterSpacing: 1 }}>
              LIVE SITE ↗
            </a>
          )}
          {form.video_url && (
            <a href={form.video_url} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 10, color: "#60A5FA", background: "#60A5FA12", border: "1px solid #60A5FA30", padding: "4px 10px", borderRadius: 4, textDecoration: "none", letterSpacing: 1 }}>
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

        {/* NEW: Status selector */}
        <StatusSelector
          value={form.status}
          onChange={(v) => setForm((f) => ({ ...f, status: v as "live" | "in-dev" | "archived" | "completed" }))}
        />

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

        {hasUnsavedMedia && (
          <div style={{ fontSize: 10, color: YELLOW, marginTop: 16, letterSpacing: 0.5 }}>
            ⚠ Media changes pending — save below to apply.
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ ...btnStyle, background: YELLOW, color: "#000", flex: 1, opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "SAVING..." : saved ? "✓ SAVED" : "SAVE CHANGES"}
          </button>
          <button onClick={onClose} style={{ ...btnStyle, flex: 0 }}>CANCEL</button>
        </div>

        {onDelete && (
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${BORDER}` }}>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                style={{ ...btnStyle, fontSize: 10, color: RED, borderColor: RED + "44", width: "100%" }}
              >
                DELETE PROJECT
              </button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 11, color: RED, letterSpacing: 0.5, textAlign: "center" }}>
                  Are you sure? This cannot be undone.
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{ ...btnStyle, background: RED, color: "#fff", flex: 1, opacity: deleting ? 0.6 : 1 }}
                  >
                    {deleting ? "DELETING..." : "YES, DELETE"}
                  </button>
                  <button onClick={() => setConfirmDelete(false)} style={{ ...btnStyle, flex: 1 }}>CANCEL</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
