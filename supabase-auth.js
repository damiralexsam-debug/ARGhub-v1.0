// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUPABASE CLIENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL  = "https://wlwvwsouoioojvemldwx.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsd3Z3c291b2lvb2p2ZW1sZHd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2Njg2OTMsImV4cCI6MjA4ODI0NDY5M30.IE7kN9CWsdsalbc5kixfGXNU9ksEorRlYsXmkHr8vrk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

const MODERATOR_EMAIL = "damiralexsam@gmail.com";

const CAT_LABELS = {
  "icon-border":   "Icon Borders",
  "animated":      "Animated Skins",
  "banner":        "Banners",
  "coloured-font": "Coloured Font",
  "profile-hat":   "Profile Hats",
  "background":    "Backgrounds",
};

// Visual properties per cosmetic item for profile card preview
const COSMETIC_VISUALS = {
  ib_gold:     { border: "3px solid #ffcc00", shadow: "0 0 12px #ffcc0066" },
  ib_violet:   { border: "3px solid #9b59b6", shadow: "0 0 12px #9b59b666" },
  ib_red:      { border: "3px solid #e74c3c", shadow: "0 0 12px #e74c3c66" },
  ib_rainbow:  { border: "3px solid #ff69b4", shadow: "0 0 12px #ff69b466" },
  ib_glitch:   { border: "3px solid #00ff00", shadow: "0 0 12px #00ff0066" },
  cf_lime:     { color: "#39d353" },
  cf_orange:   { color: "orange" },
  cf_violet:   { color: "#9b59b6" },
  cf_red:      { color: "#e74c3c" },
  cf_rainbow:  { color: "#ff69b4" },
  cf_glitch:   { color: "#00ff00" },
  bn_dark:     { bannerBg: "#050505" },
  bn_cipher:   { bannerBg: "linear-gradient(135deg,#0a0a18,#050510)" },
  bn_arg:      { bannerBg: "repeating-linear-gradient(0deg,#0a0a0a 0,#0a0a0a 2px,#111 2px,#111 4px)" },
  bn_violet:   { bannerBg: "linear-gradient(135deg,#1a0030,#000)" },
  bn_gold:     { bannerBg: "linear-gradient(135deg,#1a1000,#2a1800)" },
  bg_stars:    { cardBg: "radial-gradient(ellipse at center,#0a0a1a 0%,#000 100%)" },
  bg_matrix:   { cardBg: "#001100" },
  bg_void:     { cardBg: "#000" },
  bg_cipher:   { cardBg: "#080808" },
  bg_glitch:   { cardBg: "linear-gradient(45deg,#0a000a,#000a0a)" },
  bg_sunset:   { cardBg: "linear-gradient(135deg,#1a0030,#1a0800)" },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export function onAuthChange(callback) {
  supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}

export async function getDisplayName() {
  const user = await getUser();
  if (!user) return null;
  if (user.user_metadata?.full_name) return user.user_metadata.full_name;
  const { data } = await supabase.from("profiles").select("display_name").eq("id", user.id).single();
  if (data?.display_name) return data.display_name;
  return user.email.split("@")[0];
}

export async function getCoins(userId) {
  const { data } = await supabase.from("promotion_tickets").select("coins").eq("user_id", userId).maybeSingle();
  return data?.coins ?? 0;
}

export async function setCoins(userId, coins) {
  const { error } = await supabase.from("promotion_tickets").upsert({ user_id: userId, coins }, { onConflict: "user_id" });
  if (error) console.error("[setCoins] upsert failed:", error);
  return error;
}

export async function getActiveCosmetics(userId) {
  const { data } = await supabase.from("cosmetics_active").select("item_id, category").eq("user_id", userId);
  return data || [];
}

async function ensureProfile(user) {
  const { data } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
  if (!data) {
    const name = user.user_metadata?.full_name || user.email.split("@")[0];
    await supabase.from("profiles").insert({ id: user.id, display_name: name, email: user.email });
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTH MODAL HTML
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function injectAuthModal() {
  if (document.getElementById("authModal")) return;

  const html = `
  <style>
    /* ── BASE MODAL ── */
    #authModal {
      display:none; position:fixed; inset:0;
      background:rgba(0,0,0,0.92); z-index:99999;
      justify-content:center; align-items:center;
    }
    #authModal.open { display:flex; }
    #authBox {
      background:#111; border:1px solid #2a2a2a; border-radius:16px;
      padding:36px 40px; width:500px; max-height:92vh;
      overflow-y:auto; position:relative;
      animation:authFadeUp 0.25s ease both;
      font-family:'Roboto Slab',serif;
      scrollbar-width:thin; scrollbar-color:#2a2a2a transparent;
    }
    @keyframes authFadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    #authClose {
      position:absolute; top:14px; right:18px;
      background:none; border:none; color:#555; font-size:20px;
      cursor:pointer; transition:0.2s; font-family:'Roboto Slab',serif; z-index:2;
    }
    #authClose:hover { color:white; box-shadow:none!important; }

    /* ── SIGN IN / SIGN UP FORMS ── */
    .auth-tabs { display:flex; margin-bottom:24px; border-bottom:1px solid #222; }
    .auth-tab {
      flex:1; padding:9px; text-align:center; cursor:pointer;
      font-size:13px; color:#555; letter-spacing:1px; transition:0.2s;
      border-bottom:2px solid transparent; margin-bottom:-1px;
      background:none; border-top:none; border-left:none; border-right:none;
      font-family:'Roboto Slab',serif;
    }
    .auth-tab.active { color:white; border-bottom-color:white; }
    .auth-field { display:flex; flex-direction:column; gap:5px; margin-bottom:14px; }
    .auth-field label { font-size:11px; color:#888; letter-spacing:1px; }
    .auth-field input {
      padding:10px 13px; border-radius:8px; border:1px solid #2a2a2a;
      background:#1a1a1a; color:white; font-family:'Roboto Slab',serif;
      font-size:13px; outline:none; transition:0.3s;
    }
    .auth-field input:focus { border-color:#555; }
    .auth-submit {
      width:100%; padding:12px; border-radius:10px;
      border:1px solid white; background:transparent; color:white;
      font-family:'Roboto Slab',serif; font-size:14px;
      cursor:pointer; transition:0.3s; margin-top:4px;
    }
    .auth-submit:hover { background:white; color:black; }
    .auth-divider { display:flex; align-items:center; gap:12px; margin:16px 0; color:#333; font-size:11px; }
    .auth-divider::before,.auth-divider::after { content:""; flex:1; height:1px; background:#222; }
    .auth-google {
      width:100%; padding:12px; border-radius:10px;
      border:1px solid #333; background:#161616; color:#aaa;
      font-family:'Roboto Slab',serif; font-size:13px;
      cursor:pointer; transition:0.3s;
      display:flex; align-items:center; justify-content:center; gap:10px;
    }
    .auth-google:hover { border-color:#555; color:white; box-shadow:none!important; }
    .auth-error   { color:#e74c3c; font-size:12px; margin-top:8px; display:none; text-align:center; }
    .auth-success { color:#39d353; font-size:12px; margin-top:8px; display:none; text-align:center; }

    /* ── LOGGED-IN VIEW ── */
    #authLoggedIn { display:none; }

    /* ── PROFILE PREVIEW CARD ── */
    .pp-card {
      border-radius:12px; overflow:hidden; border:1px solid #222;
      margin-bottom:20px; position:relative;
    }
    .pp-banner { height:64px; background:#0a0a0a; }
    .pp-body {
      padding:0 16px 14px;
      display:flex; align-items:flex-start; gap:14px;
    }
    .pp-avatar-wrap { position:relative; margin-top:-22px; flex-shrink:0; }
    .pp-hat {
      position:absolute; top:-20px; left:50%; transform:translateX(-50%);
      font-size:18px; line-height:1; text-align:center; min-width:24px;
    }
    .pp-avatar {
      width:44px; height:44px; border-radius:50%;
      background:#2a2a2a; border:3px solid #111;
      display:flex; align-items:center; justify-content:center;
      font-size:18px; font-weight:700; color:white; flex-shrink:0;
      transition:0.3s;
    }
    .pp-info { flex:1; min-width:0; padding-top:10px; }
    .pp-name { font-size:16px; font-weight:700; color:white; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .pp-meta { font-size:11px; color:#555; margin-top:3px; }

    /* ── PROFILE TABS ── */
    .profile-tabs {
      display:flex; border-bottom:1px solid #1e1e1e; margin-bottom:18px; gap:0;
    }
    .profile-tab {
      flex:1; padding:9px 4px; background:none; border:none;
      border-bottom:2px solid transparent; margin-bottom:-1px;
      color:#555; font-family:'Roboto Slab',serif; font-size:12px;
      letter-spacing:0.5px; cursor:pointer; transition:0.2s; text-align:center;
    }
    .profile-tab:hover { color:#aaa; box-shadow:none!important; }
    .profile-tab.active { color:white; border-bottom-color:white; }
    .profile-tab-pane { display:none; }
    .profile-tab-pane.active { display:block; }

    /* ── PROFILE TAB CONTENT ── */
    .profile-section-label {
      font-size:10px; color:#555; letter-spacing:2px; text-transform:uppercase;
      margin-bottom:8px; margin-top:2px;
    }
    .profile-desc-input {
      width:100%; box-sizing:border-box;
      padding:10px 13px; border-radius:8px; border:1px solid #2a2a2a;
      background:#161616; color:white; font-family:'Roboto Slab',serif;
      font-size:13px; outline:none; resize:vertical; min-height:72px;
      transition:0.2s; margin-bottom:10px;
    }
    .profile-desc-input:focus { border-color:#555; }
    .profile-actions { display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap; }
    .profile-action-btn {
      padding:8px 16px; border-radius:8px; border:1px solid #444;
      background:transparent; color:#aaa; font-family:'Roboto Slab',serif;
      font-size:12px; cursor:pointer; transition:0.2s; white-space:nowrap;
    }
    .profile-action-btn:hover { border-color:white; color:white; box-shadow:none!important; }
    .profile-action-btn.primary { border-color:white; color:white; }
    .profile-msg { font-size:12px; margin-bottom:12px; display:none; }
    .profile-msg.ok  { color:#39d353; }
    .profile-msg.err { color:#e74c3c; }

    /* ── STATS ── */
    .profile-stats-row {
      display:flex; flex-wrap:wrap; gap:6px 16px;
      padding:10px 14px; background:#0d0d0d; border:1px solid #1e1e1e;
      border-radius:8px; margin-bottom:16px;
    }
    .profile-stat { font-size:12px; color:#777; }
    .profile-stat span { color:white; font-weight:700; }

    /* ── ACTIVITY GRAPH ── */
    .activity-graph-wrap { margin-bottom:20px; overflow-x:auto; padding-bottom:4px; }
    .activity-graph { display:flex; gap:2px; width:max-content; }
    .ag-week { display:flex; flex-direction:column; gap:2px; }
    .ag-cell {
      width:9px; height:9px; border-radius:2px; cursor:default;
      transition:0.1s;
    }
    .ag-cell:hover { opacity:0.8; }
    .ag-loading { font-size:11px; color:#444; letter-spacing:1px; padding:8px 0; }

    /* ── SIGN OUT ── */
    .auth-signout {
      width:100%; padding:11px; border-radius:8px;
      border:1px solid #4a1a1a; background:transparent; color:#e74c3c;
      font-family:'Roboto Slab',serif; font-size:13px;
      cursor:pointer; transition:0.2s; margin-top:4px;
    }
    .auth-signout:hover { background:#e74c3c; color:white; box-shadow:none!important; }

    /* ── WARDROBE ── */
    .wardrobe-empty { font-size:12px; color:#333; letter-spacing:1px; text-align:center; padding:20px 0; }
    .wardrobe-cat { margin-bottom:16px; }
    .wardrobe-cat-label {
      font-size:10px; color:#555; letter-spacing:1.5px; text-transform:uppercase;
      margin-bottom:8px; display:flex; align-items:center; gap:8px;
    }
    .wardrobe-cat-label::after { content:""; flex:1; height:1px; background:#1a1a1a; }
    .wardrobe-items { display:flex; flex-direction:column; gap:5px; }
    .wardrobe-item {
      display:flex; align-items:center; gap:10px;
      background:#0d0d0d; border:1px solid #1e1e1e;
      border-radius:8px; padding:7px 12px; transition:0.15s;
    }
    .wardrobe-item.active-item { border-color:#ffcc00; }
    .wardrobe-item-emoji { font-size:18px; flex-shrink:0; }
    .wardrobe-item-info { flex:1; min-width:0; }
    .wardrobe-item-name { font-size:12px; color:white; }
    .wardrobe-item-status { font-size:10px; color:#444; margin-top:1px; }
    .wardrobe-item.active-item .wardrobe-item-status { color:#ffcc00; }
    .wardrobe-toggle {
      padding:4px 10px; border-radius:5px;
      font-family:'Roboto Slab',serif; font-size:11px;
      cursor:pointer; transition:0.2s; flex-shrink:0;
      border:1px solid #2a2a2a; background:transparent; color:#555;
    }
    .wardrobe-item.active-item .wardrobe-toggle { border-color:#555; color:#555; }
    .wardrobe-toggle:hover { border-color:white; color:white; box-shadow:none!important; }
    .wardrobe-toggle.preview-btn { border-color:#444; color:#aaa; }
    .wardrobe-toggle.preview-btn:hover { border-color:white; color:white; box-shadow:none!important; }

    /* ── COSMETIC PREVIEW ── */
    #cosmeticPreview {
      background:#0a0a0a; border:1px solid #2a2a1a;
      border-radius:10px; padding:14px 16px; margin-bottom:16px;
    }
    .cosmetic-preview-label {
      font-size:10px; color:#ffcc00; letter-spacing:2px; text-transform:uppercase;
      margin-bottom:10px;
    }
    .cp-preview-actions { display:flex; gap:8px; margin-top:12px; }
    .cp-confirm-btn {
      flex:1; padding:9px; border-radius:7px; border:1px solid #39d353;
      background:transparent; color:#39d353; font-family:'Roboto Slab',serif;
      font-size:12px; cursor:pointer; transition:0.2s;
    }
    .cp-confirm-btn:hover { background:#39d353; color:black; box-shadow:none!important; }
    .cp-cancel-btn {
      flex:1; padding:9px; border-radius:7px; border:1px solid #333;
      background:transparent; color:#777; font-family:'Roboto Slab',serif;
      font-size:12px; cursor:pointer; transition:0.2s;
    }
    .cp-cancel-btn:hover { border-color:#777; color:white; box-shadow:none!important; }

    /* ── MY ARGs TAB ── */
    .arg-search-wrap { position:relative; margin-bottom:14px; }
    .arg-search-input {
      width:100%; box-sizing:border-box;
      padding:9px 13px; border-radius:8px; border:1px solid #2a2a2a;
      background:#161616; color:white; font-family:'Roboto Slab',serif;
      font-size:13px; outline:none; transition:0.2s;
    }
    .arg-search-input:focus { border-color:#555; }
    .arg-search-dropdown {
      position:absolute; top:100%; left:0; right:0; z-index:10;
      background:#161616; border:1px solid #2a2a2a; border-top:none;
      border-radius:0 0 8px 8px; max-height:180px; overflow-y:auto;
    }
    .arg-search-result {
      padding:9px 13px; cursor:pointer; font-size:13px; color:#aaa;
      transition:0.15s; border-bottom:1px solid #1e1e1e;
    }
    .arg-search-result:last-child { border-bottom:none; }
    .arg-search-result:hover { background:#1e1e1e; color:white; }
    .arg-search-result small { color:#555; font-size:11px; }
    .fav-args-grid { display:flex; flex-direction:column; gap:6px; }
    .fav-arg-card {
      display:flex; align-items:center; gap:10px;
      background:#0d0d0d; border:1px solid #1e1e1e; border-radius:8px;
      padding:8px 12px; cursor:pointer; transition:0.15s;
    }
    .fav-arg-card:hover { border-color:#333; }
    .fav-arg-name { flex:1; font-size:13px; color:white; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .fav-arg-genre { font-size:10px; color:#555; background:#1a1a1a; padding:2px 7px; border-radius:4px; flex-shrink:0; }
    .fav-arg-remove {
      background:none; border:none; color:#444; font-size:16px;
      cursor:pointer; padding:0 2px; flex-shrink:0; transition:0.15s; line-height:1;
    }
    .fav-arg-remove:hover { color:#e74c3c; box-shadow:none!important; }
    .fav-args-empty { font-size:12px; color:#333; letter-spacing:1px; padding:16px 0; text-align:center; }
    .fav-args-limit { font-size:11px; color:#444; text-align:center; padding:8px 0; }

    /* ── COIN METER ── */
    .auth-coin-meter {
      display:flex; align-items:center; gap:10px;
      background:#0a0a0a; border:1px solid #2a2a1a;
      border-radius:8px; padding:10px 14px; margin-bottom:14px;
    }
    .auth-coin-icon { font-size:18px; color:#ffcc00; }
    .auth-coin-info { flex:1; }
    .auth-coin-label { font-size:10px; color:#555; letter-spacing:2px; text-transform:uppercase; }
    .auth-coin-value { font-size:18px; font-weight:900; color:#ffcc00; }

    /* ── MOD PANEL ── */
    .mod-panel { margin-top:20px; padding-top:20px; border-top:1px solid #2a1a00; }
    .mod-panel-title {
      font-size:10px; color:orange; letter-spacing:2px; text-transform:uppercase;
      margin-bottom:14px; display:flex; align-items:center; gap:8px;
    }
    .mod-panel-title::after { content:""; flex:1; height:1px; background:#2a1a00; }
    .mod-search-wrap { display:flex; gap:8px; margin-bottom:10px; }
    .mod-input {
      flex:1; padding:9px 12px; border-radius:7px;
      border:1px solid #2a2a2a; background:#161616;
      color:white; font-family:'Roboto Slab',serif;
      font-size:13px; outline:none; transition:0.2s;
    }
    .mod-input:focus { border-color:orange; }
    .mod-search-btn {
      padding:9px 14px; border-radius:7px;
      border:1px solid orange; background:transparent; color:orange;
      font-family:'Roboto Slab',serif; font-size:13px;
      cursor:pointer; transition:0.2s; white-space:nowrap;
    }
    .mod-search-btn:hover { background:orange; color:black; box-shadow:none!important; }
    .mod-user-card {
      display:none; background:#0d0d0d; border:1px solid #2a2a2a;
      border-radius:10px; padding:14px 16px; margin-top:8px;
    }
    .mod-user-card.visible { display:block; }
    .mod-user-card-name { font-size:14px; font-weight:700; color:white; margin-bottom:3px; }
    .mod-user-card-email { font-size:11px; color:#444; margin-bottom:12px; }
    .mod-coin-row { display:flex; align-items:center; gap:10px; }
    .mod-coin-current { font-size:13px; color:#ffcc00; flex:1; }
    .mod-coin-btns { display:flex; gap:6px; }
    .mod-coin-btn {
      padding:6px 12px; border-radius:6px; border:1px solid #2a2a2a;
      background:transparent; color:#aaa;
      font-family:'Roboto Slab',serif; font-size:13px;
      cursor:pointer; transition:0.2s;
    }
    .mod-coin-btn.add { border-color:#ffcc00; color:#ffcc00; }
    .mod-coin-btn.sub { border-color:#444; color:#444; }
    .mod-coin-btn.add:hover { background:#ffcc00; color:black; box-shadow:none!important; }
    .mod-coin-btn.sub:hover { background:#333; color:white; box-shadow:none!important; }
    .mod-coin-btn:disabled { opacity:0.3; cursor:not-allowed; }
    .mod-msg { font-size:12px; margin-top:8px; display:none; }
    .mod-msg.ok { color:#39d353; }
    .mod-msg.err { color:#e74c3c; }

    /* ── NAV BUTTON ── */
    #navUserBtn {
      padding:7px 16px; border-radius:8px;
      border:1px solid #333; background:#0a0a0a; color:#888;
      font-family:'Roboto Slab',serif; font-size:13px;
      cursor:pointer; transition:0.2s;
      position:fixed; top:14px; right:18px; z-index:9998;
    }
    #navUserBtn:hover { border-color:#555; color:white; box-shadow:none!important; }
    #navUserBtn.signed-in { border-color:#39d353; color:#39d353; }

    /* ── ARG POPUP ── */
    #argPopup {
      display:none; position:fixed; inset:0;
      background:rgba(0,0,0,0.92); z-index:199999;
      justify-content:center; align-items:center;
    }
    #argPopup.open { display:flex; }
    #argPopupBox {
      background:#111; border:1px solid #2a2a2a; border-radius:14px;
      padding:28px 32px; width:440px; max-height:80vh; overflow-y:auto;
      position:relative; font-family:'Roboto Slab',serif;
      animation:authFadeUp 0.2s ease both;
    }
    #argPopupClose {
      position:absolute; top:12px; right:14px;
      background:none; border:none; color:#555; font-size:18px; cursor:pointer;
    }
    #argPopupClose:hover { color:white; box-shadow:none!important; }
    .ap-name { font-size:18px; font-weight:700; color:white; margin-bottom:4px; }
    .ap-author { font-size:12px; color:#555; margin-bottom:12px; }
    .ap-badges { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:14px; }
    .ap-badge { font-size:11px; padding:3px 8px; border-radius:4px; background:#1a1a1a; color:#aaa; }
    .ap-desc { font-size:13px; color:#888; line-height:1.6; margin-bottom:16px; }
    .ap-links { display:flex; flex-direction:column; gap:8px; }
    .ap-link {
      display:inline-flex; align-items:center; gap:8px;
      padding:9px 14px; border-radius:8px; border:1px solid #2a2a2a;
      color:#aaa; font-size:12px; text-decoration:none; transition:0.2s;
    }
    .ap-link:hover { border-color:#555; color:white; }
  </style>

  <button id="navUserBtn" onclick="window.__authModal.open()">Sign In</button>

  <div id="authModal" onclick="window.__authModal.handleOverlay(event)">
    <div id="authBox">
      <button id="authClose" onclick="window.__authModal.close()">✕</button>

      <!-- SIGN IN / SIGN UP FORMS -->
      <div id="authForms">
        <div class="auth-tabs">
          <button class="auth-tab active" id="tabSignIn" onclick="window.__authModal.switchTab('signin')">Sign In</button>
          <button class="auth-tab"        id="tabSignUp" onclick="window.__authModal.switchTab('signup')">Sign Up</button>
        </div>
        <div id="formSignIn">
          <div class="auth-field"><label>Email</label><input type="email" id="siEmail" placeholder="you@example.com"></div>
          <div class="auth-field"><label>Password</label><input type="password" id="siPassword" placeholder="••••••••"></div>
          <button class="auth-submit" onclick="window.__authModal.signIn()">Sign In →</button>
          <p class="auth-error" id="siError"></p>
        </div>
        <div id="formSignUp" style="display:none;">
          <div class="auth-field"><label>Your Name</label><input type="text" id="suName" placeholder="What should we call you?"></div>
          <div class="auth-field"><label>Email</label><input type="email" id="suEmail" placeholder="you@example.com"></div>
          <div class="auth-field"><label>Password</label><input type="password" id="suPassword" placeholder="At least 6 characters"></div>
          <button class="auth-submit" onclick="window.__authModal.signUp()">Create Account →</button>
          <p class="auth-error" id="suError"></p>
          <p class="auth-success" id="suSuccess"></p>
        </div>
        <div class="auth-divider">or</div>
        <button class="auth-google" onclick="window.__authModal.googleSignIn()">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </div>

      <!-- LOGGED-IN VIEW -->
      <div id="authLoggedIn">

        <!-- Profile Preview Card -->
        <div class="pp-card" id="ppCard">
          <div class="pp-banner" id="ppBanner"></div>
          <div class="pp-body">
            <div class="pp-avatar-wrap">
              <div class="pp-hat" id="ppHat"></div>
              <div class="pp-avatar" id="ppAvatar">?</div>
            </div>
            <div class="pp-info">
              <div class="pp-name" id="ppName"></div>
              <div class="pp-meta" id="ppMeta"></div>
            </div>
          </div>
        </div>

        <!-- Coin Meter -->
        <div class="auth-coin-meter">
          <div class="auth-coin-icon">✦</div>
          <div class="auth-coin-info">
            <div class="auth-coin-label">Promotion Tickets</div>
            <div class="auth-coin-value" id="authCoinValue">0</div>
          </div>
        </div>

        <!-- Profile Tabs -->
        <div class="profile-tabs">
          <button class="profile-tab active" onclick="window.__authModal._switchProfileTab('profile',this)">Profile</button>
          <button class="profile-tab" onclick="window.__authModal._switchProfileTab('wardrobe',this)">Wardrobe</button>
          <button class="profile-tab" onclick="window.__authModal._switchProfileTab('myargs',this)">My ARGs</button>
        </div>

        <!-- PROFILE TAB -->
        <div class="profile-tab-pane active" id="ptProfile">
          <div class="profile-section-label">About</div>
          <textarea class="profile-desc-input" id="profileDesc" placeholder="Tell the community who you are..."></textarea>
          <div class="profile-actions">
            <button class="profile-action-btn primary" onclick="window.__authModal._saveDescription()">Save description</button>
            <button class="profile-action-btn" onclick="window.__authModal._sendPasswordReset()">Reset password</button>
          </div>
          <div class="profile-msg" id="profileDescMsg"></div>

          <div class="profile-stats-row" id="profileStats">
            <span class="profile-stat" id="statCommunities">loading...</span>
            <span class="profile-stat" id="statMessages">loading...</span>
            <span class="profile-stat" id="statJoined">loading...</span>
          </div>

          <div class="profile-section-label">Activity</div>
          <div class="activity-graph-wrap">
            <div id="activityGraph" class="ag-loading">Loading activity...</div>
          </div>

          <button class="auth-signout" onclick="window.__authModal.signOut()">Sign Out</button>
        </div>

        <!-- WARDROBE TAB -->
        <div class="profile-tab-pane" id="ptWardrobe">
          <div id="cosmeticPreview" style="display:none">
            <div class="cosmetic-preview-label">Previewing cosmetic</div>
            <div id="cpCardWrap"></div>
            <div class="cp-preview-actions">
              <button class="cp-confirm-btn" onclick="window.__authModal._confirmCosmetic()">✓ Confirm</button>
              <button class="cp-cancel-btn"  onclick="window.__authModal._cancelPreview()">Cancel</button>
            </div>
          </div>
          <div id="wardrobeContent"><div class="wardrobe-empty">Loading cosmetics...</div></div>
        </div>

        <!-- MY ARGs TAB -->
        <div class="profile-tab-pane" id="ptMyargs">
          <div class="profile-section-label">Favorite ARGs <span style="color:#333;font-size:9px;">MAX 6</span></div>
          <div class="arg-search-wrap">
            <input class="arg-search-input" id="argSearchInput" placeholder="Search ARGs on ARGhub..." autocomplete="off">
            <div class="arg-search-dropdown" id="argSearchDropdown" style="display:none"></div>
          </div>
          <div class="fav-args-grid" id="favArgsList"></div>
        </div>

        <!-- MOD PANEL -->
        <div class="mod-panel" id="modPanel" style="display:none">
          <div class="mod-panel-title">⚡ Moderator — Grant Coins</div>
          <div class="mod-search-wrap">
            <input class="mod-input" id="modSearchInput" placeholder="Email or display name...">
            <button class="mod-search-btn" onclick="window.__authModal._modSearch()">Find</button>
          </div>
          <div class="mod-user-card" id="modUserCard">
            <div class="mod-user-card-name" id="modCardName"></div>
            <div class="mod-user-card-email" id="modCardEmail"></div>
            <div class="mod-coin-row">
              <div class="mod-coin-current">✦ <span id="modCardCoins">0</span> coins</div>
              <div class="mod-coin-btns">
                <button class="mod-coin-btn sub" id="modSubBtn" onclick="window.__authModal._modAdjust(-1)">− 1</button>
                <button class="mod-coin-btn add" id="modAddBtn" onclick="window.__authModal._modAdjust(+5)">+ 5</button>
              </div>
            </div>
            <div class="mod-msg" id="modMsg"></div>
          </div>
        </div>

      </div><!-- /authLoggedIn -->
    </div>
  </div>

  <!-- ARG detail popup (for favorite ARG cards) -->
  <div id="argPopup" onclick="window.__authModal._handleArgPopupOverlay(event)">
    <div id="argPopupBox">
      <button id="argPopupClose" onclick="window.__authModal._closeArgPopup()">✕</button>
      <div id="argPopupContent"></div>
    </div>
  </div>
  `;

  document.body.insertAdjacentHTML("beforeend", html);

  // Attach arg search listener after injection
  const argInp = document.getElementById("argSearchInput");
  if (argInp) {
    argInp.addEventListener("input", () => window.__authModal._argSearchInput(argInp.value));
    argInp.addEventListener("blur", () => setTimeout(() => {
      const dd = document.getElementById("argSearchDropdown");
      if (dd) dd.style.display = "none";
    }, 200));
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTROLLER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let pendingCallback  = null;
let _modTargetUserId = null;
let _modTargetCoins  = 0;
let _currentUser     = null;
let _pendingPreview  = null; // { itemId, category, currentlyActive }
let _argSearchTimer  = null;
let _favArgIds       = new Set();

window.__authModal = {

  open(callback) {
    pendingCallback = callback || null;
    document.getElementById("authModal").classList.add("open");
    this._refreshView();
  },

  close() {
    document.getElementById("authModal").classList.remove("open");
    _modTargetUserId = null;
    _modTargetCoins  = 0;
    _pendingPreview  = null;
    const card = document.getElementById("modUserCard");
    if (card) card.classList.remove("visible");
    const inp = document.getElementById("modSearchInput");
    if (inp) inp.value = "";
    const msg = document.getElementById("modMsg");
    if (msg) msg.style.display = "none";
    const cp = document.getElementById("cosmeticPreview");
    if (cp) cp.style.display = "none";
    const dd = document.getElementById("argSearchDropdown");
    if (dd) dd.style.display = "none";
  },

  handleOverlay(e) { if (e.target === document.getElementById("authModal")) this.close(); },

  switchTab(tab) {
    const s = tab === "signin";
    document.getElementById("formSignIn").style.display = s ? "block" : "none";
    document.getElementById("formSignUp").style.display = s ? "none"  : "block";
    document.getElementById("tabSignIn").classList.toggle("active",  s);
    document.getElementById("tabSignUp").classList.toggle("active", !s);
  },

  _switchProfileTab(tab, btn) {
    document.querySelectorAll(".profile-tab").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".profile-tab-pane").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("pt" + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add("active");
    if (tab === "myargs" && _currentUser) this._loadMyARGs(_currentUser.id);
  },

  async _refreshView() {
    const user  = await getUser();
    const forms = document.getElementById("authForms");
    const li    = document.getElementById("authLoggedIn");
    if (user) {
      _currentUser = user;
      await ensureProfile(user);
      forms.style.display = "none";
      li.style.display    = "block";
      const name  = await getDisplayName();
      const coins = await getCoins(user.id);
      this._renderCoins(coins);
      // Populate profile tab description
      const { data: prof } = await supabase.from("profiles").select("description").eq("id", user.id).maybeSingle();
      const descEl = document.getElementById("profileDesc");
      if (descEl) descEl.value = prof?.description || "";
      // Render profile preview card
      const cosmetics = await getActiveCosmetics(user.id);
      this._renderProfileCard(name, user.email, coins, cosmetics);
      document.getElementById("modPanel").style.display = user.email === MODERATOR_EMAIL ? "block" : "none";
      this._loadStats(user.id, user.created_at);
      this._loadWardrobe(user.id);
    } else {
      _currentUser = null;
      forms.style.display = "block";
      li.style.display    = "none";
    }
  },

  _renderCoins(coins) {
    document.getElementById("authCoinValue").textContent = coins;
    const meta = document.getElementById("ppMeta");
    if (meta) meta.textContent = `✦ ${coins} tickets`;
  },

  _renderProfileCard(name, email, coins, cosmetics, pendingAdd = null, pendingRemove = null) {
    const catalogue = window.__shopCatalogue || [];
    // Build active cosmetics map, applying pending changes
    const activeMap = {};
    cosmetics.forEach(c => { activeMap[c.category] = c.item_id; });
    if (pendingAdd)    activeMap[pendingAdd.category]    = pendingAdd.itemId;
    if (pendingRemove) delete activeMap[pendingRemove.category];

    const bannerItem  = activeMap["banner"];
    const bgItem      = activeMap["background"];
    const hatItem     = activeMap["profile-hat"];
    const borderItem  = activeMap["icon-border"];
    const fontItem    = activeMap["coloured-font"];

    const vis = COSMETIC_VISUALS;
    const bannerBg  = bannerItem ? (vis[bannerItem]?.bannerBg || "#0a0a0a") : "#0a0a0a";
    const cardBg    = bgItem     ? (vis[bgItem]?.cardBg      || "#111")     : "#111";
    const hatEmoji  = hatItem    ? (catalogue.find(c => c.id === hatItem)?.emoji || "") : "";
    const borderStyle = borderItem
      ? `border:${vis[borderItem]?.border || "3px solid #333"};box-shadow:${vis[borderItem]?.shadow || "none"};`
      : "border:3px solid transparent;";
    const nameColor = fontItem ? (vis[fontItem]?.color || "white") : "white";
    const initial   = (name || "?")[0].toUpperCase();

    // Update main profile preview card
    const ppBanner = document.getElementById("ppBanner");
    const ppAvatar = document.getElementById("ppAvatar");
    const ppHat    = document.getElementById("ppHat");
    const ppName   = document.getElementById("ppName");
    const ppCard   = document.getElementById("ppCard");
    if (ppBanner) ppBanner.style.background = bannerBg;
    if (ppCard)   ppCard.style.background   = cardBg;
    if (ppAvatar) { ppAvatar.textContent = initial; ppAvatar.setAttribute("style", borderStyle); }
    if (ppHat)    ppHat.textContent = hatEmoji;
    if (ppName)   { ppName.textContent = name; ppName.style.color = nameColor; }

    // Return mini card HTML for preview panel
    return `
      <div style="background:${cardBg};border-radius:10px;overflow:hidden;border:1px solid #1e1e1e;">
        <div style="height:50px;background:${bannerBg};"></div>
        <div style="padding:0 14px 12px;display:flex;align-items:flex-start;gap:12px;">
          <div style="position:relative;margin-top:-18px;flex-shrink:0;">
            ${hatEmoji ? `<div style="position:absolute;top:-16px;left:50%;transform:translateX(-50%);font-size:16px;">${hatEmoji}</div>` : ""}
            <div style="width:38px;height:38px;border-radius:50%;background:#2a2a2a;${borderStyle}display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:white;">${initial}</div>
          </div>
          <div style="padding-top:8px;flex:1;min-width:0;">
            <div style="font-size:14px;font-weight:700;color:${nameColor};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${name}</div>
            <div style="font-size:10px;color:#555;margin-top:2px;">preview</div>
          </div>
        </div>
      </div>`;
  },

  async _loadStats(userId, authCreatedAt) {
    const [commRes, msgRes] = await Promise.all([
      supabase.from("community_members").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("messages").select("id", { count: "exact", head: true }).eq("user_id", userId),
    ]);
    const communities = commRes.count ?? 0;
    const messages    = msgRes.count    ?? 0;
    const joined = authCreatedAt
      ? new Date(authCreatedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      : "—";

    const sc = document.getElementById("statCommunities");
    const sm = document.getElementById("statMessages");
    const sj = document.getElementById("statJoined");
    if (sc) sc.innerHTML = `<span>${communities}</span> communities`;
    if (sm) sm.innerHTML = `<span>${messages}</span> messages`;
    if (sj) sj.innerHTML = `joined <span>${joined}</span>`;

    this._loadActivityGraph(userId);
  },

  async _loadActivityGraph(userId) {
    const el = document.getElementById("activityGraph");
    if (!el) return;

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const { data: msgs } = await supabase
      .from("messages")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", oneYearAgo.toISOString());

    // Group by day
    const byDay = {};
    (msgs || []).forEach(m => {
      const key = m.created_at.slice(0, 10);
      byDay[key] = (byDay[key] || 0) + 1;
    });

    // Build 52-week grid ending today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Align to Sunday
    const endSunday = new Date(today);
    endSunday.setDate(today.getDate() + (6 - today.getDay()));
    const startSunday = new Date(endSunday);
    startSunday.setDate(endSunday.getDate() - 51 * 7);

    const weeks = [];
    for (let w = 0; w < 52; w++) {
      let cells = "";
      for (let d = 0; d < 7; d++) {
        const dt = new Date(startSunday);
        dt.setDate(startSunday.getDate() + w * 7 + d);
        const key   = dt.toISOString().slice(0, 10);
        const count = byDay[key] || 0;
        const col   = count === 0 ? "#1a1a1a"
          : count <= 2 ? "#1a3a1a"
          : count <= 5 ? "#2d6a2d"
          : "#39d353";
        cells += `<div class="ag-cell" style="background:${col}" title="${key}: ${count} messages"></div>`;
      }
      weeks.push(`<div class="ag-week">${cells}</div>`);
    }

    el.className = "activity-graph";
    el.innerHTML = weeks.join("");
  },

  async _saveDescription() {
    if (!_currentUser) return;
    const val  = (document.getElementById("profileDesc")?.value || "").trim();
    const msgEl = document.getElementById("profileDescMsg");
    const { error } = await supabase.from("profiles")
      .upsert({ id: _currentUser.id, description: val }, { onConflict: "id" });
    if (msgEl) {
      msgEl.textContent    = error ? "❌ Failed to save." : "✓ Description saved.";
      msgEl.className      = error ? "profile-msg err" : "profile-msg ok";
      msgEl.style.display  = "block";
      clearTimeout(this._descMsgTimer);
      this._descMsgTimer   = setTimeout(() => { msgEl.style.display = "none"; }, 3000);
    }
  },

  async _sendPasswordReset() {
    if (!_currentUser) return;
    const msgEl = document.getElementById("profileDescMsg");
    const { error } = await supabase.auth.resetPasswordForEmail(_currentUser.email, {
      redirectTo: window.location.origin + "/reset-password.html",
    });
    if (msgEl) {
      msgEl.textContent   = error ? `❌ ${error.message}` : "✓ Password reset email sent — check your inbox.";
      msgEl.className     = error ? "profile-msg err" : "profile-msg ok";
      msgEl.style.display = "block";
      clearTimeout(this._descMsgTimer);
      this._descMsgTimer  = setTimeout(() => { msgEl.style.display = "none"; }, 5000);
    }
  },

  async _loadWardrobe(userId) {
    const content = document.getElementById("wardrobeContent");
    if (!content) return;
    const { data: owned } = await supabase
      .from("cosmetics_owned").select("item_id, category, name").eq("user_id", userId);
    if (!owned || owned.length === 0) {
      content.innerHTML = `<div class="wardrobe-empty">No cosmetics yet — visit the shop on the homepage!</div>`;
      return;
    }
    const { data: active } = await supabase
      .from("cosmetics_active").select("item_id").eq("user_id", userId);
    const activeIds = new Set((active || []).map(r => r.item_id));
    const catalogue = window.__shopCatalogue || [];
    const emojiFor  = id => catalogue.find(c => c.id === id)?.emoji || "?";

    const grouped = {};
    owned.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });

    content.innerHTML = Object.entries(grouped).map(([cat, items]) => `
      <div class="wardrobe-cat">
        <div class="wardrobe-cat-label">${CAT_LABELS[cat] || cat}</div>
        <div class="wardrobe-items">
          ${items.map(item => {
            const on = activeIds.has(item.item_id);
            return `<div class="wardrobe-item ${on ? "active-item" : ""}" id="wi-${item.item_id}">
              <div class="wardrobe-item-emoji">${emojiFor(item.item_id)}</div>
              <div class="wardrobe-item-info">
                <div class="wardrobe-item-name">${item.name}</div>
                <div class="wardrobe-item-status">${on ? "✓ Active" : "Inactive"}</div>
              </div>
              ${on
                ? `<button class="wardrobe-toggle" onclick="window.__authModal._toggleCosmetic('${userId}','${item.item_id}','${item.category}',true)">Disable</button>`
                : `<button class="wardrobe-toggle preview-btn" onclick="window.__authModal._previewCosmetic('${userId}','${item.item_id}','${item.category}')">Preview</button>`
              }
            </div>`;
          }).join("")}
        </div>
      </div>`).join("");
  },

  async _previewCosmetic(userId, itemId, category) {
    _pendingPreview = { userId, itemId, category };
    const cosmetics = await getActiveCosmetics(userId);
    const name      = await getDisplayName();
    const previewHtml = this._renderProfileCard(name, "", 0, cosmetics, { itemId, category });
    const cpWrap = document.getElementById("cpCardWrap");
    if (cpWrap) cpWrap.innerHTML = previewHtml;
    const cpEl = document.getElementById("cosmeticPreview");
    if (cpEl) cpEl.style.display = "block";
    // Scroll to top of wardrobe tab
    document.getElementById("authBox")?.scrollTo({ top: 0, behavior: "smooth" });
  },

  async _confirmCosmetic() {
    if (!_pendingPreview) return;
    const { userId, itemId, category } = _pendingPreview;
    await this._toggleCosmetic(userId, itemId, category, false);
    _pendingPreview = null;
    const cpEl = document.getElementById("cosmeticPreview");
    if (cpEl) cpEl.style.display = "none";
  },

  _cancelPreview() {
    _pendingPreview = null;
    const cpEl = document.getElementById("cosmeticPreview");
    if (cpEl) cpEl.style.display = "none";
    // Restore profile card to real active cosmetics
    if (_currentUser) {
      getActiveCosmetics(_currentUser.id).then(async cosmetics => {
        const name = await getDisplayName();
        this._renderProfileCard(name, _currentUser.email, 0, cosmetics);
      });
    }
  },

  async _toggleCosmetic(userId, itemId, category, currentlyActive) {
    if (currentlyActive) {
      await supabase.from("cosmetics_active").delete().eq("user_id", userId).eq("item_id", itemId);
    } else {
      await supabase.from("cosmetics_active").delete().eq("user_id", userId).eq("category", category);
      await supabase.from("cosmetics_active").insert({ user_id: userId, item_id: itemId, category });
    }
    await this._loadWardrobe(userId);
    // Update profile preview card
    const cosmetics = await getActiveCosmetics(userId);
    const name      = await getDisplayName();
    const coins     = await getCoins(userId);
    this._renderProfileCard(name, _currentUser?.email || "", coins, cosmetics);
  },

  // ── MY ARGs ──

  async _loadMyARGs(userId) {
    const listEl = document.getElementById("favArgsList");
    if (!listEl) return;
    const { data } = await supabase
      .from("profile_favorite_args")
      .select("arg_id, args(id, name, genre)")
      .eq("user_id", userId)
      .order("added_at");
    const rows = (data || []).filter(r => r.args);
    _favArgIds = new Set(rows.map(r => r.arg_id));
    if (!rows.length) {
      listEl.innerHTML = `<div class="fav-args-empty">No favorite ARGs yet. Search above to add some.</div>`;
      return;
    }
    listEl.innerHTML = `<div class="fav-args-grid">` +
      rows.map(r => `
        <div class="fav-arg-card" onclick="window.__authModal._openArgPopup('${r.args.id}')">
          <div class="fav-arg-name">${r.args.name}</div>
          ${r.args.genre ? `<div class="fav-arg-genre">${r.args.genre}</div>` : ""}
          <button class="fav-arg-remove" onclick="event.stopPropagation();window.__authModal._removeFavoriteARG('${r.arg_id}')" title="Remove">×</button>
        </div>`).join("") +
      `</div>`;
    if (rows.length >= 6) {
      listEl.insertAdjacentHTML("beforeend", `<div class="fav-args-limit">Maximum 6 favorite ARGs reached.</div>`);
    }
  },

  async _argSearchInput(val) {
    clearTimeout(_argSearchTimer);
    const dd = document.getElementById("argSearchDropdown");
    if (!val.trim()) { if (dd) dd.style.display = "none"; return; }
    _argSearchTimer = setTimeout(async () => {
      const { data } = await supabase
        .from("args")
        .select("id, name, genre")
        .ilike("name", `%${val}%`)
        .limit(8);
      if (!dd) return;
      if (!data || !data.length) { dd.style.display = "none"; return; }
      dd.innerHTML = data.map(a => `
        <div class="arg-search-result" onclick="window.__authModal._addFavoriteARG('${a.id}','${(a.name||"").replace(/'/g,"\\'")}')">
          ${a.name} <small>${a.genre || ""}</small>
        </div>`).join("");
      dd.style.display = "block";
    }, 300);
  },

  async _addFavoriteARG(argId, argName) {
    if (!_currentUser) return;
    if (_favArgIds.size >= 6) return;
    if (_favArgIds.has(argId)) { document.getElementById("argSearchDropdown").style.display = "none"; return; }
    await supabase.from("profile_favorite_args").upsert(
      { user_id: _currentUser.id, arg_id: argId },
      { onConflict: "user_id,arg_id", ignoreDuplicates: true }
    );
    document.getElementById("argSearchInput").value = "";
    document.getElementById("argSearchDropdown").style.display = "none";
    await this._loadMyARGs(_currentUser.id);
  },

  async _removeFavoriteARG(argId) {
    if (!_currentUser) return;
    await supabase.from("profile_favorite_args")
      .delete().eq("user_id", _currentUser.id).eq("arg_id", argId);
    await this._loadMyARGs(_currentUser.id);
  },

  async _openArgPopup(argId) {
    if (typeof window.openPostedDetail === "function") {
      window.openPostedDetail(argId);
      return;
    }
    const { data: arg } = await supabase.from("args").select("*").eq("id", argId).maybeSingle();
    if (!arg) return;
    const links = [
      arg.youtube ? `<a class="ap-link" href="${arg.youtube}" target="_blank">▶ YouTube</a>` : "",
      arg.website ? `<a class="ap-link" href="${arg.website}" target="_blank">🌐 Website</a>` : "",
      arg.game    ? `<a class="ap-link" href="${arg.game}"    target="_blank">🎮 Game</a>`    : "",
    ].filter(Boolean).join("");
    document.getElementById("argPopupContent").innerHTML = `
      <div class="ap-name">${arg.name}</div>
      <div class="ap-author">by ${arg.author || "Unknown"}</div>
      <div class="ap-badges">
        ${arg.status     ? `<span class="ap-badge">${arg.status}</span>`     : ""}
        ${arg.genre      ? `<span class="ap-badge">${arg.genre}</span>`      : ""}
        ${arg.difficulty ? `<span class="ap-badge">${arg.difficulty}</span>` : ""}
        ${arg.platform   ? `<span class="ap-badge">${arg.platform}</span>`   : ""}
      </div>
      <div class="ap-desc">${arg.description || "No description provided."}</div>
      ${links ? `<div class="ap-links">${links}</div>` : ""}
    `;
    document.getElementById("argPopup").classList.add("open");
  },

  _closeArgPopup() { document.getElementById("argPopup").classList.remove("open"); },
  _handleArgPopupOverlay(e) { if (e.target === document.getElementById("argPopup")) this._closeArgPopup(); },

  // ── MOD PANEL ──

  async _modSearch() {
    const query = document.getElementById("modSearchInput").value.trim();
    const card  = document.getElementById("modUserCard");
    const msgEl = document.getElementById("modMsg");
    msgEl.style.display = "none";
    card.classList.remove("visible");
    _modTargetUserId = null;
    if (!query) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, email")
      .or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(1);

    if (error || !data || data.length === 0) {
      card.classList.add("visible");
      msgEl.textContent   = "No user found. Make sure they have signed up.";
      msgEl.className     = "mod-msg err";
      msgEl.style.display = "block";
      return;
    }

    const target = data[0];
    _modTargetUserId = target.id;
    _modTargetCoins  = await getCoins(target.id);
    document.getElementById("modCardName").textContent  = target.display_name || "Unknown";
    document.getElementById("modCardEmail").textContent = target.email || target.id.slice(0, 8) + "...";
    document.getElementById("modCardCoins").textContent = _modTargetCoins;
    document.getElementById("modSubBtn").disabled = _modTargetCoins <= 0;
    card.classList.add("visible");
  },

  async _modAdjust(delta) {
    if (!_modTargetUserId) return;
    const msgEl  = document.getElementById("modMsg");
    msgEl.style.display = "none";
    const newCoins = Math.max(0, _modTargetCoins + delta);
    const saveErr  = await setCoins(_modTargetUserId, newCoins);
    if (saveErr) {
      msgEl.textContent   = `❌ Save failed: ${saveErr.message}`;
      msgEl.className     = "mod-msg err";
      msgEl.style.display = "block";
      clearTimeout(this._modMsgTimer);
      this._modMsgTimer   = setTimeout(() => { msgEl.style.display = "none"; }, 5000);
      return;
    }
    _modTargetCoins = newCoins;
    document.getElementById("modCardCoins").textContent = newCoins;
    document.getElementById("modSubBtn").disabled = newCoins <= 0;
    msgEl.textContent   = delta > 0 ? `✓ Granted ${delta} coins. Total: ${newCoins}` : `✓ Removed 1 coin. Total: ${newCoins}`;
    msgEl.className     = "mod-msg ok";
    msgEl.style.display = "block";
    clearTimeout(this._modMsgTimer);
    this._modMsgTimer   = setTimeout(() => { msgEl.style.display = "none"; }, 3000);
    const self = await getUser();
    if (self && self.id === _modTargetUserId) {
      this._renderCoins(newCoins);
      updateNavBtn(self);
    }
  },

  // ── AUTH ──

  async signIn() {
    const email = document.getElementById("siEmail").value.trim();
    const pw    = document.getElementById("siPassword").value;
    const errEl = document.getElementById("siError");
    errEl.style.display = "none";
    if (!email || !pw) { errEl.textContent = "Email and password are required."; errEl.style.display = "block"; return; }
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) { errEl.textContent = error.message; errEl.style.display = "block"; return; }
    this._onSuccess();
  },

  async signUp() {
    const name  = document.getElementById("suName").value.trim();
    const email = document.getElementById("suEmail").value.trim();
    const pw    = document.getElementById("suPassword").value;
    const errEl = document.getElementById("suError");
    const sucEl = document.getElementById("suSuccess");
    errEl.style.display = "none"; sucEl.style.display = "none";
    if (!name) { errEl.textContent = "Please enter your name."; errEl.style.display = "block"; return; }
    const { data, error } = await supabase.auth.signUp({ email, password: pw, options: { data: { full_name: name } } });
    if (error) { errEl.textContent = error.message; errEl.style.display = "block"; return; }
    if (data.user) await supabase.from("profiles").upsert({ id: data.user.id, display_name: name, email });
    sucEl.textContent   = "✓ Check your email (and Spam!) to confirm your account.";
    sucEl.style.display = "block";
    document.querySelector("#formSignUp .auth-submit").disabled     = true;
    document.querySelector("#formSignUp .auth-submit").style.opacity = "0.4";
  },

  async googleSignIn() {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.href } });
  },

  async signOut() {
    await supabase.auth.signOut();
    _currentUser = null;
    this._refreshView();
    updateNavBtn(null);
  },

  _onSuccess() {
    this.close();
    if (pendingCallback) { pendingCallback(); pendingCallback = null; }
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NAV + BOOTSTRAP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function updateNavBtn(user) {
  const btn = document.getElementById("navUserBtn");
  if (!btn) return;
  if (user) {
    const name  = await getDisplayName();
    const coins = await getCoins(user.id);
    btn.textContent = `👤 ${name}  ✦ ${coins}`;
    btn.classList.add("signed-in");
  } else {
    btn.textContent = "Sign In";
    btn.classList.remove("signed-in");
  }
}

export async function requireAuth(callback) {
  const user = await getUser();
  if (user) { callback(); } else { window.__authModal.open(callback); }
}

injectAuthModal();

supabase.auth.onAuthStateChange((event, session) => {
  const user = session?.user ?? null;
  updateNavBtn(user);
  const modal = document.getElementById("authModal");
  if (event === "SIGNED_IN") {
    if (modal?.classList.contains("open")) window.__authModal._onSuccess();
    else updateNavBtn(user);
  }
});
