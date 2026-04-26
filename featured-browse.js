import { supabase, getUser, getCoins, setCoins } from "./supabase-auth.js";
import { prefetchCosmetics, applyToName, applyHatToName } from "./cosmetics.js";

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
    : `<div class="arg-img" style="background:#0a0a0a;height:120px;display:flex;align-items:center;justify-content:center;">
         <span style="color:#333;font-size:11px;letter-spacing:1px;">[ IMAGE ]</span>
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
    </div>`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DETAIL POPUP
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

  const { data: community } = await supabase
    .from("communities").select("id, name")
    .eq("arg_name", arg.name).limit(1).maybeSingle();

  const communityLink = community
    ? `<a href="community.html?id=${community.id}" class="detail-link" style="background:#1a3d1a;border-color:#2a5a2a;color:lime;margin-top:8px;display:inline-flex;align-items:center;gap:6px;">👥 &nbsp;View Community: ${community.name}</a>`
    : `<p style="font-size:12px;color:#333;margin-top:12px;letter-spacing:1px;">No community linked to this ARG yet.</p>`;

  // Check if current user owns this ARG and build boost button
  const user = await getUser();
  let boostBtn = "";
  if (user && arg.user_id === user.id) {
    boostBtn = await buildBoostButton(arg, user);
  }

  document.getElementById("detailContent").innerHTML = `
    ${imgEl}
    <div class="detail-body">
      <div class="detail-name">${arg.name}</div>
      <div class="detail-author" id="detail-author-name" data-uid="${arg.user_id || ""}">by ${arg.author || "Unknown"}</div>
      <div class="detail-badges">
        <span class="arg-badge ${statusClass}">${arg.status}</span>
        <span class="arg-badge ${genreClass}">${arg.genre}</span>
        <span class="arg-badge ${diffClass}">${arg.difficulty}</span>
        <span class="arg-badge ${platClass}">${arg.platform}</span>
      </div>
      <p class="detail-desc">${arg.description || "No description provided."}</p>
      ${links}
      ${communityLink}
      ${boostBtn}
    </div>`;

  document.getElementById("detailOverlay").classList.add("open");

  // Apply font cosmetic to author name
  if (arg.user_id) {
    prefetchCosmetics([arg.user_id]).then(() => {
      const nameEl = document.getElementById("detail-author-name");
      if (nameEl) { applyToName(arg.user_id, nameEl); applyHatToName(arg.user_id, nameEl); }
    });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BOOST BUTTON
// Shows only to the ARG owner
// Disabled (greyed) if already in top 10, active otherwise
// Costs 1 coin — sets a random boost_rank between 1–10
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function buildBoostButton(arg, user) {
  // top 10 = args ordered by boost_rank ASC nulls last, then posted_at
  const { data: top10 } = await supabase
    .from("args")
    .select("id")
    .not("boost_rank", "is", null)
    .order("boost_rank", { ascending: true })
    .limit(10);

  const inTop10 = (top10 || []).some(a => a.id === arg.id);
  const coins   = await getCoins(user.id);

  if (inTop10) {
    return `
      <div style="margin-top:16px;padding:12px 16px;background:#0a1a0a;border:1px solid #1a3d1a;border-radius:10px;font-size:13px;color:lime;letter-spacing:1px;">
        ✦ Your ARG is already in the top 10!
      </div>`;
  }

  const canAfford = coins >= 1;
  return `
    <div style="margin-top:16px;padding:14px 16px;background:#0a0a1a;border:1px solid #1a1a3a;border-radius:10px;">
      <div style="font-size:11px;color:#555;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">🚀 Boost to Top 10</div>
      <div style="font-size:13px;color:#aaa;margin-bottom:12px;line-height:1.6;">
        Spend <span style="color:#ffcc00;font-weight:bold;">1 🪙</span> to jump your ARG to a random spot in the top 10 of the Browse section.
        ${!canAfford ? '<br><span style="color:red;font-size:12px;">You need at least 1 Promotion Ticket.</span>' : ''}
      </div>
      <button
        id="boostBtn"
        onclick="boostARG('${arg.id}')"
        style="padding:9px 20px;border-radius:7px;border:1px solid ${canAfford ? '#ffcc00' : '#333'};background:transparent;color:${canAfford ? '#ffcc00' : '#444'};font-family:'Roboto Slab',serif;font-size:13px;cursor:${canAfford ? 'pointer' : 'not-allowed'};transition:0.2s;"
        ${!canAfford ? "disabled" : ""}
      >
        ${canAfford ? "Boost for 1 🪙" : "Not enough tickets"}
      </button>
    </div>`;
}

window.boostARG = async function(argId) {
  const user = await getUser();
  if (!user) { window.__authModal && window.__authModal.open(); return; }

  const coins = await getCoins(user.id);
  if (coins < 1) {
    alert("You need at least 1 Promotion Ticket to boost.");
    return;
  }

  // Pick a random rank 1–10 that isn't already taken
  const { data: taken } = await supabase
    .from("args").select("boost_rank")
    .not("boost_rank", "is", null)
    .lte("boost_rank", 10);

  const takenRanks  = new Set((taken || []).map(a => a.boost_rank));
  const available   = Array.from({ length: 10 }, (_, i) => i + 1).filter(r => !takenRanks.has(r));

  let newRank;
  if (available.length > 0) {
    newRank = available[Math.floor(Math.random() * available.length)];
  } else {
    // All spots taken — bump the highest rank and take its place
    newRank = Math.floor(Math.random() * 10) + 1;
  }

  // Deduct coin and set boost rank
  await setCoins(user.id, coins - 1);
  await supabase.from("args").update({ boost_rank: newRank }).eq("id", argId);

  // Update button state in the detail popup
  const btn = document.getElementById("boostBtn");
  if (btn) {
    btn.textContent        = "✓ Boosted!";
    btn.style.borderColor  = "lime";
    btn.style.color        = "lime";
    btn.disabled           = true;
  }

  // Refresh browse so the user sees the change
  await renderBrowse();
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RENDER BROWSE
// Ordered by boost_rank first (top 10), then rest by posted_at
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
window.renderBrowse = async function() {
  const grid       = document.getElementById("browseGrid");
  const query      = document.getElementById("browseSearch").value.toLowerCase();
  const genre      = document.getElementById("filterGenre").value;
  const status     = document.getElementById("filterStatus").value;
  const difficulty = document.getElementById("filterDifficulty").value;
  const platform   = document.getElementById("filterPlatform").value;

  if (postedARGsCache.length === 0) {
    grid.innerHTML = `<p class="no-results" style="color:#555;">Loading ARGs...</p>`;
  }

  // Fetch boosted (top 10) first, then rest
  const { data: boosted } = await supabase
    .from("args").select("*")
    .not("boost_rank", "is", null)
    .order("boost_rank", { ascending: true })
    .limit(10);

  const { data: rest, error } = await supabase
    .from("args").select("*")
    .is("boost_rank", null)
    .order("posted_at", { ascending: false });

  if (error) {
    grid.innerHTML = `<p class="no-results" style="color:red;">Failed to load ARGs. Try refreshing.</p>`;
    return;
  }

  // Merge: boosted first, then the rest
  postedARGsCache = [...(boosted || []), ...(rest || [])];

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

renderBrowse();