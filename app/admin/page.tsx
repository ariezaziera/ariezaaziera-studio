"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { LoginScreen } from "./components/LoginScreen";
import { Dashboard } from "./components/Dashboard";

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!supabase) { setAuthed(false); return; }
    supabase.auth.getSession().then(({ data }) => { setAuthed(!!data.session); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (authed === null) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 11, color: "#c8c8c8", letterSpacing: 2 }}>...</div>
    </div>
  );

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  return <Dashboard onLogout={() => setAuthed(false)} />;
}
