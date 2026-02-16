import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://elfxuuyhaswzombgaqyh.supabase.co",
  "sb_publishable_vCse9y1Z3j-MHxZq_4ifUg_4G84oZnw"
);

// ======================
// SESSION (via URL)
// ======================
export function getSessionName() {
  const params = new URLSearchParams(window.location.search);
  return (
    params.get("session") ||
    localStorage.getItem("aqm_session") ||
    "Session_Test"
  );
}


// ======================
// NAV
// ======================
export function goHome(session) {
  const url = `${location.origin}${location.pathname}?form=home&session=${encodeURIComponent(session)}`;
  location.href = url;
}

export function goForm(form, session) {
  const url = `${location.origin}${location.pathname}?form=${form}&session=${encodeURIComponent(session)}`;
  location.href = url;
}

// ======================
// TITLE CASE
// ======================
export function titleCaseName(s) {
  const v = (s || "").trim();
  if (!v) return "";
  return v
    .toLowerCase()
    .split(/(\s+|-|')/g)
    .map((part) => {
      if (part.trim() === "" || part === "-" || part === "'") return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join("");
}

// ======================
// PROGRESSION CLOUD (aqm_progress)
// ======================
export async function getProgress(session) {
  const { data } = await supabase
    .from("aqm_progress")
    .select("*")
    .eq("session", session)
    .single();

  return data || { pre: false, post: false, eval: false };
}

export async function markDone(session, step) {
  const { data } = await supabase
    .from("aqm_progress")
    .select("*")
    .eq("session", session)
    .single();

  const next = {
    session,
    pre: data?.pre || false,
    post: data?.post || false,
    eval: data?.eval || false,
    [step]: true,
    updated_at: new Date().toISOString(),
  };

  await supabase.from("aqm_progress").upsert(next);
}

export async function resetProgress(session) {
  await supabase.from("aqm_progress").delete().eq("session", session);
}

// ======================
// PROFILE CLOUD (aqm_profiles)
// ======================
export async function loadProfile(session) {
  const { data } = await supabase
    .from("aqm_profiles")
    .select("*")
    .eq("session", session)
    .single();

  return data || {};
}

export function setSessionName(name) {
  // optionnel: petit cache local pour confort
  try { localStorage.setItem("aqm_session", name); } catch {}
}

export async function upsertProfile(session, patch) {
  const cur = await loadProfile(session);
  const next = { ...cur, ...patch, session, updated_at: new Date().toISOString() };
  await supabase.from("aqm_profiles").upsert(next);
  return next;
}
