// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// profile.js — read-only profile view modal
// Injected by community.html
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { supabase, getUser, getCoins, setCoins } from "./supabase-auth.js";
import { fetchOneUser, applyToCard, BANNER_MAP, BG_MAP, HAT_MAP } from "./cosmetics.js";

const MODERATOR_EMAIL = "damiralexsam@gmail.com";

// ── INJECT CSS + HTML ──

function injectProfileView() {
  if (document.getElementById("profileViewOverlay")) return;

  const html = `
  <style>
    #profileViewOverlay {
      display:none; position:fixed; inset:0;
      background:rgba(0,0,0,0.92); z-index:99998;
      justify-content:center; align-items:center;
    }
    #profileViewOverlay.open { display:flex; }
    #profileViewBox {
      background:#111; border:1px solid #2a2a2a; border-radius:16px;
      width:480px; max-height:90vh; overflow-y:auto; position:relative;
      font-family:'Roboto Slab',serif;
      animation:pvFadeUp 0.25s ease both;
      scrollbar-width:thin; scrollbar-color:#2a2a2a transparent;
    }
    @keyframes pvFadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    #pvClose {
      position:absolute; top:14px; right:16px; z-index:2;
      background:none; border:none; color:#555; font-size:20px; cursor:pointer;
    }
    #pvClose:hover { color:white; box-shadow:none!important; }

    /* Banner + Avatar header */
    #pvBanner { height:80px; background:#0a0a0a; border-radius:16px 16px 0 0; }
    .pv-header-body {
      padding:0 24px 20px;
      display:flex; align-items:flex-start; gap:16px;
      border-bottom:1px solid #1e1e1e;
    }
    .pv-avatar-wrap { position:relative; margin-top:-28px; flex-shrink:0; }
    .pv-hat {
      position:absolute; top:-24px; left:50%; transform:translateX(-50%);
      font-size:22px; line-height:1; text-align:center; min-width:28px;
    }
    .pv-avatar {
      width:56px; height:56px; border-radius:50%;
      background:#2a2a2a; border:4px solid #111;
      display:flex; align-items:center; justify-content:center;
      font-size:22px; font-weight:700; color:white;
    }
    .pv-info { flex:1; padding-top:14px; min-width:0; }
    .pv-name { font-size:18px; font-weight:700; color:white; margin-bottom:4px; }
    .pv-description { font-size:13px; color:#777; line-height:1.6; margin-top:6px; }

    /* Content sections */
    .pv-section { padding:16px 24px; border-bottom:1px solid #1a1a1a; }
    .pv-section:last-child { border-bottom:none; padding-bottom:24px; }
    .pv-section-label {
      font-size:10px; color:#555; letter-spacing:2px; text-transform:uppercase;
      margin-bottom:12px; display:flex; align-items:center; gap:8px;
    }
    .pv-section-label::after { content:""; flex:1; height:1px; background:#1a1a1a; }

    /* Stats */
    .pv-stats {
      display:flex; flex-wrap:wrap; gap:6px 20px;
      padding:10px 14px; background:#0d0d0d;
      border:1px solid #1a1a1a; border-radius:8px;
    }
    .pv-stat { font-size:12px; color:#666; }
    .pv-stat span { color:white; font-weight:700; }

    /* Activity graph */
    .pv-activity-wrap { overflow-x:auto; padding-bottom:4px; }
    .pv-activity-graph { display:flex; gap:2px; width:max-content; }
    .pv-ag-week { display:flex; flex-direction:column; gap:2px; }
    .pv-ag-cell { width:9px; height:9px; border-radius:2px; }

    /* Fav ARGs */
    .pv-args-grid { display:flex; flex-direction:column; gap:6px; }
    .pv-arg-card {
      display:flex; align-items:center; gap:10px;
      background:#0d0d0d; border:1px solid #1e1e1e; border-radius:8px;
      padding:8px 12px; cursor:pointer; transition:0.15s;
    }
    .pv-arg-card:hover { border-color:#333; }
    .pv-arg-name { flex:1; font-size:13px; color:white; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .pv-arg-genre { font-size:10px; color:#555; background:#1a1a1a; padding:2px 7px; border-radius:4px; flex-shrink:0; }
    .pv-empty { font-size:12px; color:#333; letter-spacing:1px; padding:8px 0; }

    /* Mod panel inside profile view */
    .pv-mod-panel { background:#0d0d0d; border:1px solid #2a1a00; border-radius:10px; padding:14px 16px; }
    .pv-mod-title {
      font-size:10px; color:orange; letter-spacing:2px; text-transform:uppercase;
      margin-bottom:12px;
    }
    .pv-mod-coin-row { display:flex; align-items:center; gap:10px; }
    .pv-mod-coin-val { font-size:14px; color:#ffcc00; flex:1; }
    .pv-mod-btns { display:flex; gap:6px; }
    .pv-mod-btn {
      padding:6px 12px; border-radius:6px; border:1px solid #2a2a2a;
      background:transparent; color:#aaa;
      font-family:'Roboto Slab',serif; font-size:13px; cursor:pointer; transition:0.2s;
    }
    .pv-mod-btn.add { border-color:#ffcc00; color:#ffcc00; }
    .pv-mod-btn.sub { border-color:#444; color:#444; }
    .pv-mod-btn.add:hover { background:#ffcc00; color:black; box-shadow:none!important; }
    .pv-mod-btn.sub:hover { background:#333; color:white; box-shadow:none!important; }
    .pv-mod-btn:disabled { opacity:0.3; cursor:not-allowed; }
    .pv-mod-msg { font-size:12px; margin-top:8px; display:none; }
    .pv-mod-msg.ok  { color:#39d353; }
    .pv-mod-msg.err { color:#e74c3c; }

    /* ARG popup */
    #pvArgPopup {
      display:none; position:fixed; inset:0;
      background:rgba(0,0,0,0.93); z-index:199999;
      justify-content:center; align-items:center;
    }
    #pvArgPopup.open { display:flex; }
    #pvArgPopupBox {
      background:#111; border:1px solid #2a2a2a; border-radius:14px;
      padding:28px 32px; width:440px; max-height:80vh; overflow-y:auto;
      position:relative; font-family:'Roboto Slab',serif;
      animation:pvFadeUp 0.2s ease both;
    }
    #pvArgPopupClose {
      position:absolute; top:12px; right:14px;
      background:none; border:none; color:#555; font-size:18px; cursor:pointer;
    }
    #pvArgPopupClose:hover { color:white; box-shadow:none!important; }
    .pvap-name   { font-size:18px; font-weight:700; color:white; margin-bottom:4px; }
    .pvap-author { font-size:12px; color:#555; margin-bottom:12px; }
    .pvap-badges { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:14px; }
    .pvap-badge  { font-size:11px; padding:3px 8px; border-radius:4px; background:#1a1a1a; color:#aaa; }
    .pvap-desc   { font-size:13px; color:#888; line-height:1.6; margin-bottom:16px; }
    .pvap-links  { display:flex; flex-direction:column; gap:8px; }
    .pvap-link   {
      display:inline-flex; align-items:center; gap:8px;
      padding:9px 14px; border-radius:8px; border:1px solid #2a2a2a;
      color:#aaa; font-size:12px; text-decoration:none; transition:0.2s;
    }
    .pvap-link:hover { border-color:#555; color:white; }
  </style>

  <div id="profileViewOverlay" onclick="_pvHandleOverlay(event)">
    <div id="profileViewBox">
      <button id="pvClose" onclick="closeProfileView()">✕</button>
      <div id="pvBanner"></div>
      <div class="pv-header-body">
        <div class="pv-avatar-wrap" style="position:relative;">
          <div class="cosmetic-hat" id="pvHat"></div>
          <div class="pv-avatar" id="pvAvatar">?</div>
        </div>
        <div class="pv-info">
          <div class="pv-name" id="pvName"></div>
          <div class="pv-description" id="pvDescription"></div>
        </div>
      </div>

      <div class="pv-section" id="pvStatsSection">
        <div class="pv-section-label">Stats</div>
        <div class="pv-stats" id="pvStats">
          <span class="pv-stat" id="pvStatComm">loading...</span>
          <span class="pv-stat" id="pvStatMsgs">loading...</span>
          <span class="pv-stat" id="pvStatJoin">loading...</span>
        </div>
      </div>

      <div class="pv-section" id="pvActivitySection">
        <div class="pv-section-label">Activity</div>
        <div class="pv-activity-wrap">
          <div id="pvActivityGraph" class="pv-activity-graph"></div>
        </div>
      </div>

      <div class="pv-section" id="pvFavArgsSection">
        <div class="pv-section-label">Favorite ARGs</div>
        <div class="pv-args-grid" id="pvFavArgs">
          <div class="pv-empty">No favorite ARGs yet.</div>
        </div>
      </div>

      <div class="pv-section" id="pvModSection" style="display:none">
        <div class="pv-section-label">Moderator</div>
        <div class="pv-mod-panel">
          <div class="pv-mod-title">⚡ Grant Coins</div>
          <div class="pv-mod-coin-row">
            <div class="pv-mod-coin-val">✦ <span id="pvModCoins">0</span> coins</div>
            <div class="pv-mod-btns">
              <button class="pv-mod-btn sub" id="pvModSub" onclick="_pvModAdjust(-1)">− 1</button>
              <button class="pv-mod-btn add" id="pvModAdd" onclick="_pvModAdjust(+5)">+ 5</button>
            </div>
          </div>
          <div class="pv-mod-msg" id="pvModMsg"></div>
        </div>
      </div>
    </div>
  </div>

  <div id="pvArgPopup" onclick="_pvArgPopupOverlay(event)">
    <div id="pvArgPopupBox">
      <button id="pvArgPopupClose" onclick="_pvCloseArgPopup()">✕</button>
      <div id="pvArgPopupContent"></div>
    </div>
  </div>
  `;

  document.body.insertAdjacentHTML("beforeend", html);
}

// ── STATE ──

let _pvTargetUserId = null;
let _pvTargetCoins  = 0;
let _pvModMsgTimer  = null;

// ── PUBLIC ENTRY POINT ──

window.openProfile = async function(targetUserId) {
  const viewer = await getUser();
  if (!targetUserId) return;

  // Own profile → open auth modal
  if (viewer && viewer.id === targetUserId) {
    window.__authModal?.open();
    return;
  }

  // Load and show read-only view
  _pvTargetUserId = targetUserId;
  await _pvLoad(targetUserId, viewer);
  document.getElementById("profileViewOverlay").classList.add("open");
};

window.closeProfileView = function() {
  document.getElementById("profileViewOverlay")?.classList.remove("open");
  _pvTargetUserId = null;
  _pvTargetCoins  = 0;
  document.getElementById("pvModMsg").style.display = "none";
};

window._pvHandleOverlay = function(e) {
  if (e.target === document.getElementById("profileViewOverlay")) closeProfileView();
};

// ── LOAD PROFILE DATA ──

async function _pvLoad(userId, viewer) {
  // Fetch profile
  const { data: prof } = await supabase
    .from("profiles")
    .select("display_name, description, created_at")
    .eq("id", userId)
    .maybeSingle();

  const name   = prof?.display_name || "Unknown User";
  const desc   = prof?.description  || "";
  const joined = prof?.created_at
    ? new Date(prof.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—";

  document.getElementById("pvName").textContent        = name;
  document.getElementById("pvDescription").textContent = desc || "No description set.";
  if (!desc) document.getElementById("pvDescription").style.color = "#444";

  // Cosmetics
  await fetchOneUser(userId);
  _pvApplyCosmetics(userId, name);

  // Stats (parallel)
  const [commRes, msgRes] = await Promise.all([
    supabase.from("community_members").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("messages").select("id",           { count: "exact", head: true }).eq("user_id", userId),
  ]);
  document.getElementById("pvStatComm").innerHTML = `<span>${commRes.count ?? 0}</span> communities`;
  document.getElementById("pvStatMsgs").innerHTML = `<span>${msgRes.count ?? 0}</span> messages`;
  document.getElementById("pvStatJoin").innerHTML = `joined <span>${joined}</span>`;

  // Activity graph
  _pvLoadActivityGraph(userId);

  // Favorite ARGs
  _pvLoadFavARGs(userId);

  // Mod panel
  const isMod = viewer?.email === MODERATOR_EMAIL;
  const modSection = document.getElementById("pvModSection");
  if (isMod && viewer.id !== userId) {
    modSection.style.display = "block";
    _pvTargetCoins = await getCoins(userId);
    document.getElementById("pvModCoins").textContent = _pvTargetCoins;
    document.getElementById("pvModSub").disabled = _pvTargetCoins <= 0;
  } else {
    modSection.style.display = "none";
  }
}

function _pvApplyCosmetics(userId, name) {
  const avatarEl = document.getElementById("pvAvatar");
  if (avatarEl) avatarEl.textContent = (name || "?")[0].toUpperCase();
  applyToCard(userId, {
    bannerEl:    document.getElementById("pvBanner"),
    containerEl: document.getElementById("profileViewBox"),
    avatarEl,
    nameEl:      document.getElementById("pvName"),
  });
}

async function _pvLoadActivityGraph(userId) {
  const el = document.getElementById("pvActivityGraph");
  if (!el) return;

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const { data: msgs } = await supabase
    .from("messages")
    .select("created_at")
    .eq("user_id", userId)
    .gte("created_at", oneYearAgo.toISOString());

  const byDay = {};
  (msgs || []).forEach(m => {
    const key = m.created_at.slice(0, 10);
    byDay[key] = (byDay[key] || 0) + 1;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endSunday = new Date(today);
  endSunday.setDate(today.getDate() + (6 - today.getDay()));
  const startSunday = new Date(endSunday);
  startSunday.setDate(endSunday.getDate() - 51 * 7);

  let html = "";
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
      cells += `<div class="pv-ag-cell" style="background:${col}" title="${key}: ${count} messages"></div>`;
    }
    html += `<div class="pv-ag-week">${cells}</div>`;
  }
  el.innerHTML = html;
}

async function _pvLoadFavARGs(userId) {
  const el = document.getElementById("pvFavArgs");
  if (!el) return;
  const { data } = await supabase
    .from("profile_favorite_args")
    .select("arg_id, args(id, name, genre)")
    .eq("user_id", userId)
    .order("added_at");
  const rows = (data || []).filter(r => r.args);
  if (!rows.length) {
    el.innerHTML = `<div class="pv-empty">No favorite ARGs added yet.</div>`;
    return;
  }
  el.innerHTML = rows.map(r => `
    <div class="pv-arg-card" onclick="_pvOpenArgPopup('${r.args.id}')">
      <div class="pv-arg-name">${r.args.name}</div>
      ${r.args.genre ? `<div class="pv-arg-genre">${r.args.genre}</div>` : ""}
    </div>`).join("");
}

// ── ARG POPUP ──

window._pvOpenArgPopup = async function(argId) {
  if (typeof window.openPostedDetail === "function") {
    window.openPostedDetail(argId);
    return;
  }
  const { data: arg } = await supabase.from("args").select("*").eq("id", argId).maybeSingle();
  if (!arg) return;
  const links = [
    arg.youtube ? `<a class="pvap-link" href="${arg.youtube}" target="_blank">▶ YouTube</a>` : "",
    arg.website ? `<a class="pvap-link" href="${arg.website}" target="_blank">🌐 Website</a>` : "",
    arg.game    ? `<a class="pvap-link" href="${arg.game}"    target="_blank">🎮 Game</a>`    : "",
  ].filter(Boolean).join("");
  document.getElementById("pvArgPopupContent").innerHTML = `
    <div class="pvap-name">${arg.name}</div>
    <div class="pvap-author">by ${arg.author || "Unknown"}</div>
    <div class="pvap-badges">
      ${arg.status     ? `<span class="pvap-badge">${arg.status}</span>`     : ""}
      ${arg.genre      ? `<span class="pvap-badge">${arg.genre}</span>`      : ""}
      ${arg.difficulty ? `<span class="pvap-badge">${arg.difficulty}</span>` : ""}
      ${arg.platform   ? `<span class="pvap-badge">${arg.platform}</span>`   : ""}
    </div>
    <div class="pvap-desc">${arg.description || "No description provided."}</div>
    ${links ? `<div class="pvap-links">${links}</div>` : ""}
  `;
  document.getElementById("pvArgPopup").classList.add("open");
};

window._pvCloseArgPopup    = function() { document.getElementById("pvArgPopup").classList.remove("open"); };
window._pvArgPopupOverlay  = function(e) { if (e.target === document.getElementById("pvArgPopup")) _pvCloseArgPopup(); };

// ── MOD COIN PANEL ──

window._pvModAdjust = async function(delta) {
  if (!_pvTargetUserId) return;
  const msgEl    = document.getElementById("pvModMsg");
  const newCoins = Math.max(0, _pvTargetCoins + delta);
  const saveErr  = await setCoins(_pvTargetUserId, newCoins);
  if (saveErr) {
    msgEl.textContent   = `❌ ${saveErr.message}`;
    msgEl.className     = "pv-mod-msg err";
    msgEl.style.display = "block";
    clearTimeout(_pvModMsgTimer);
    _pvModMsgTimer      = setTimeout(() => { msgEl.style.display = "none"; }, 5000);
    return;
  }
  _pvTargetCoins = newCoins;
  document.getElementById("pvModCoins").textContent = newCoins;
  document.getElementById("pvModSub").disabled      = newCoins <= 0;
  msgEl.textContent   = delta > 0 ? `✓ Granted ${delta} coins. Total: ${newCoins}` : `✓ Removed 1 coin. Total: ${newCoins}`;
  msgEl.className     = "pv-mod-msg ok";
  msgEl.style.display = "block";
  clearTimeout(_pvModMsgTimer);
  _pvModMsgTimer      = setTimeout(() => { msgEl.style.display = "none"; }, 3000);
};

// ── BOOTSTRAP ──

injectProfileView();
