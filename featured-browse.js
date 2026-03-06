import { supabase } from "./supabase-auth.js";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BROWSE TAB — reads from Supabase instead of localStorage
// Replaces the renderBrowse() and openDetail("posted", ...) logic
// in featured.js for user-posted ARGs.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Cache of fetched ARGs — used by openPostedDetail() to avoid re-fetching
let postedARGsCache = [];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CARD BUILDER (mirrors featured.js buildCard but for posted ARGs)
// Uses the ARG's Supabase id instead of array index for detail lookup
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function buildPostedCard(arg) {
  const statusClass = arg.status === "Active" ? "badge-active" : "badge-concluded";
  const genreClass  = arg.genre  === "Horror" ? "badge-horror" : arg.genre === "Puzzle" ? "badge-puzzle" : "badge-scifi";
  const diffClass   = arg.difficulty === "Beginner" ? "badge-easy" : arg.difficulty === "Medium" ? "badge-medium" : "badge-hard";
  const platClass   = arg.platform === "IRL" ? "badge-irl" : arg.platform === "YouTube" ? "badge-horror" : "badge-web";

  // img field: base64 string uploaded by user, or null = show placeholder block
  const imgEl = arg.img
    ? `<img class="arg-img" src="${arg.img}" alt="${arg.name}" style="height:120px;">`
    : `<div class="arg-img" style="background:#0a0a0a; height:120px; display:flex; align-items:center; justify-content:center;">
         <span style="color:#333; font-size:11px; letter-spacing:1px;">[ IMAGE ]</span>
       </div>`;

  // Pass the Supabase UUID so openPostedDetail can find it in the cache
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
// DETAIL POPUP for posted ARGs
// Called by onclick in buildPostedCard — looks up arg by id in cache
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
window.openPostedDetail = function(id) {
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
    </div>
  `;

  document.getElementById("detailOverlay").classList.add("open");
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RENDER BROWSE — fetches from Supabase, filters client-side
// Exposed globally so the HTML oninput/onchange handlers still work
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
window.renderBrowse = async function() {
  const grid       = document.getElementById("browseGrid");
  const query      = document.getElementById("browseSearch").value.toLowerCase();
  const genre      = document.getElementById("filterGenre").value;
  const status     = document.getElementById("filterStatus").value;
  const difficulty = document.getElementById("filterDifficulty").value;
  const platform   = document.getElementById("filterPlatform").value;

  // Show loading state while fetching
  grid.innerHTML = `<p class="no-results" style="color:#555;">Loading ARGs...</p>`;

  // Only fetch if cache is empty — avoids re-fetching on every filter change
  if (postedARGsCache.length === 0) {
    const { data, error } = await supabase
      .from("args")
      .select("*")
      .order("posted_at", { ascending: false });

    if (error) {
      grid.innerHTML = `<p class="no-results" style="color:red;">Failed to load ARGs. Try refreshing.</p>`;
      return;
    }

    postedARGsCache = data || [];
  }

  // Filter client-side so search/dropdowns feel instant after first load
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
// INIT — run on page load
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
renderBrowse();
