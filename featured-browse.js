import { supabase } from "./supabase-auth.js";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BROWSE TAB — reads from Supabase instead of localStorage
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Cache used only by openPostedDetail() for the popup — always refreshed on fetch
let postedARGsCache = [];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CARD BUILDER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function buildPostedCard(arg) {
  const statusClass = arg.status === "Active" ? "badge-active" : "badge-concluded";
  const genreClass  = arg.genre  === "Horror" ? "badge-horror" : arg.genre === "Puzzle" ? "badge-puzzle" : "badge-scifi";
  const diffClass   = arg.difficulty === "Beginner" ? "badge-easy" : arg.difficulty === "Medium" ? "badge-medium" : "badge-hard";
  const platClass   = arg.platform === "IRL" ? "badge-irl" : arg.platform === "YouTube" ? "badge-horror" : "badge-web";

  const imgEl = arg.img
    ? `<img class="arg-img" src="${arg.img}" alt="${arg.name}" style="height:120px;">`
    : `<div class="arg-img" style="background:#0a0a0a; height:120px; display:flex; align-items:center; justify-content:center;">
         <span style="color:#333; font-size:11px; letter-spacing:1px;">[ IMAGE ]</span>
       </div>`;

  return `
    <div class="arg-card" onclick="openPostedDetail('${arg.id}')">
      ${imgEl}
      <div class="arg-body">
        <div class="arg-name">${arg.name}</div>
        <div class="arg-meta">
          <span class="arg-badge ${statusClass}">${arg.status}</span>
          <span class="arg-badge ${genreClass}">${arg.genre}</span>
          <span class="arg-badge ${diffClass}">${arg.difficulty}</span>
          <span class="arg-badge ${platClass}">${arg.platform}</span>
        </div>
      </div>
    </div>
  `;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DETAIL POPUP — looks up by Supabase UUID in the cache
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
window.openPostedDetail = async function(id) {
  const arg = postedARGsCache.find(a => a.id === id);
  if (!arg) return;

  const statusClass = arg.status === "Active" ? "badge-active" : "badge-concluded";
  const genreClass  = arg.genre  === "Horror" ? "badge-horror" : arg.genre === "Puzzle" ? "badge-puzzle" : "badge-scifi";
  const diffClass   = arg.difficulty === "Beginner" ? "badge-easy" : arg.difficulty === "Medium" ? "badge-medium" : "badge-hard";
  const platClass   = arg.platform === "IRL" ? "badge-irl" : arg.platform === "YouTube" ? "badge-horror" : "badge-web";

  const imgEl = arg.img
    ? `<img class="detail-img" src="${arg.img}" alt="${arg.name}">`
    : `<div class="detail-img-placeholder" style="background:#0a0a0a;">[ IMAGE ]</div>`;

  let links = "";
  if (arg.youtube || arg.website || arg.game) {
    links = `<div class="detail-links">`;
    if (arg.youtube) links += `<a href="${arg.youtube}" target="_blank" class="detail-link yt">▶ &nbsp;Watch on YouTube</a>`;
    if (arg.website) links += `<a href="${arg.website}" target="_blank" class="detail-link web">🌐 &nbsp;Visit Website</a>`;
    if (arg.game)    links += `<a href="${arg.game}"    target="_blank" class="detail-link game">🎮 &nbsp;Play the Game</a>`;
    links += `</div>`;
  }

  // Check if a community exists for this ARG by name
  const { data: community } = await supabase
    .from("communities")
    .select("id, name")
    .eq("arg_name", arg.name)
    .limit(1)
    .maybeSingle();

  const communityLink = community
    ? `<a href="community.html?id=${community.id}" class="detail-link" style="background:#1a3d1a;border-color:#2a5a2a;color:lime;margin-top:8px;display:inline-flex;align-items:center;gap:6px;">👥 &nbsp;View Community: ${community.name}</a>`
    : `<p style="font-size:12px;color:#333;margin-top:12px;letter-spacing:1px;">No community linked to this ARG yet.</p>`;

  document.getElementById("detailContent").innerHTML = `
    ${imgEl}
    <div class="detail-body">
      <div class="detail-name">${arg.name}</div>
      <div class="detail-author">by ${arg.author || "Unknown"}</div>
      <div class="detail-badges">
        <span class="arg-badge ${statusClass}">${arg.status}</span>
        <span class="arg-badge ${genreClass}">${arg.genre}</span>
        <span class="arg-badge ${diffClass}">${arg.difficulty}</span>
        <span class="arg-badge ${platClass}">${arg.platform}</span>
      </div>
      <p class="detail-desc">${arg.description || "No description provided."}</p>
      ${links}
      ${communityLink}
    </div>
  `;

  document.getElementById("detailOverlay").classList.add("open");
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RENDER BROWSE — always fetches fresh from Supabase
// then filters client-side so search/dropdowns feel instant
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
window.renderBrowse = async function() {
  const grid       = document.getElementById("browseGrid");
  const query      = document.getElementById("browseSearch").value.toLowerCase();
  const genre      = document.getElementById("filterGenre").value;
  const status     = document.getElementById("filterStatus").value;
  const difficulty = document.getElementById("filterDifficulty").value;
  const platform   = document.getElementById("filterPlatform").value;

  // Only show loading spinner on the initial page load (cache is empty)
  // Subsequent filter changes feel instant — no flash of "Loading..."
  if (postedARGsCache.length === 0) {
    grid.innerHTML = `<p class="no-results" style="color:#555;">Loading ARGs...</p>`;
  }

  // Always fetch fresh — every user always sees the latest posted ARGs
  const { data, error } = await supabase
    .from("args")
    .select("*")
    .order("posted_at", { ascending: false });

  if (error) {
    grid.innerHTML = `<p class="no-results" style="color:red;">Failed to load ARGs. Try refreshing.</p>`;
    return;
  }

  // Refresh cache so openPostedDetail always has current data too
  postedARGsCache = data || [];

  const filtered = postedARGsCache.filter(a =>
    a.name.toLowerCase().includes(query) &&
    (genre      === "" || a.genre      === genre)      &&
    (status     === "" || a.status     === status)     &&
    (difficulty === "" || a.difficulty === difficulty) &&
    (platform   === "" || a.platform   === platform)
  );

  if (postedARGsCache.length === 0) {
    grid.innerHTML = `<p class="no-results">No ARGs have been posted yet.<br>Go to your <a href="dashboard.html" style="color:lime;">Dashboard</a> and click <strong>+ Post New ARG</strong> to be the first!</p>`;
  } else if (filtered.length === 0) {
    grid.innerHTML = `<p class="no-results">No ARGs match your search or filters.</p>`;
  } else {
    grid.innerHTML = filtered.map(a => buildPostedCard(a)).join("");
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INIT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
renderBrowse();