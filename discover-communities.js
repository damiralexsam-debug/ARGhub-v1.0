import { supabase, requireAuth, getUser, getDisplayName } from "./supabase-auth.js";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CACHE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let allCommunities = [];   // fetched from Supabase
let argNames       = [];   // fetched from args table for the search dropdown

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODAL OPEN / CLOSE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
window.openCreateCommunity = function() {
  requireAuth(_openForm);
};

async function _openForm() {
  // Reset form
  document.getElementById("ccName").value        = "";
  document.getElementById("ccArgSearch").value   = "";
  document.getElementById("ccArgResults").innerHTML = "";
  document.getElementById("ccArgResults").style.display = "none";
  document.getElementById("ccArgHidden").value   = "";
  document.getElementById("ccDesc").value        = "";
  document.getElementById("ccType").value        = "Public";
  document.getElementById("ccError").style.display  = "none";
  document.getElementById("ccSuccess").style.display = "none";
  document.querySelector("#createCommunityModal .modal-submit").disabled = false;
  document.querySelector("#createCommunityModal .modal-submit").style.opacity = "1";

  // Check freemium limit — max 2 communities per account
  const user = await getUser();
  const { count } = await supabase
    .from("communities")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (count >= 2) {
    document.getElementById("ccError").textContent  = "You've reached the Freemium limit of 2 communities. Upgrade to Premium to create more.";
    document.getElementById("ccError").style.display = "block";
    document.querySelector("#createCommunityModal .modal-submit").disabled = true;
    document.querySelector("#createCommunityModal .modal-submit").style.opacity = "0.4";
  }

  // Auto-fill author
  const name = await getDisplayName();
  document.getElementById("ccAuthor").value = name || "";

  // Load ARG names for the search dropdown
  const { data } = await supabase.from("args").select("name").order("name");
  argNames = data ? data.map(a => a.name) : [];

  document.getElementById("createCommunityModal").classList.add("open");
}

window.closeCreateCommunity = function() {
  document.getElementById("createCommunityModal").classList.remove("open");
};

window.handleCreateOverlay = function(e) {
  if (e.target === document.getElementById("createCommunityModal")) window.closeCreateCommunity();
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ARG NAME SEARCH — live dropdown as user types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
window.filterArgNames = function() {
  const query   = document.getElementById("ccArgSearch").value.toLowerCase().trim();
  const results = document.getElementById("ccArgResults");

  if (!query) { results.style.display = "none"; return; }

  const matches = argNames.filter(n => n.toLowerCase().includes(query)).slice(0, 6);

  if (matches.length === 0) {
    results.style.display = "none";
    return;
  }

  results.innerHTML = matches.map(n => `
    <div class="arg-result-item" onclick="selectArg('${n.replace(/'/g, "\\'")}')">
      ${n}
    </div>
  `).join("");
  results.style.display = "block";
};

window.selectArg = function(name) {
  document.getElementById("ccArgSearch").value          = name;
  document.getElementById("ccArgHidden").value          = name;
  document.getElementById("ccArgResults").style.display = "none";
};

// Close dropdown if clicking outside
document.addEventListener("click", function(e) {
  const wrap = document.getElementById("ccArgWrap");
  if (wrap && !wrap.contains(e.target)) {
    document.getElementById("ccArgResults").style.display = "none";
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUBMIT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
window.submitCommunity = async function() {
  const errEl = document.getElementById("ccError");
  errEl.style.display = "none";

  const name    = document.getElementById("ccName").value.trim();
  const argName = document.getElementById("ccArgHidden").value.trim()
               || document.getElementById("ccArgSearch").value.trim();
  const desc    = document.getElementById("ccDesc").value.trim();
  const type    = document.getElementById("ccType").value;
  const author  = document.getElementById("ccAuthor").value.trim();

  if (!name) {
    errEl.textContent   = "Please enter a community name.";
    errEl.style.display = "block";
    return;
  }

  const user = await getUser();
  if (!user) { window.__authModal.open(); return; }

  // Double-check limit server-side before inserting
  const { count } = await supabase
    .from("communities")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (count >= 2) {
    errEl.textContent   = "Freemium limit reached. Upgrade to Premium to create more communities.";
    errEl.style.display = "block";
    return;
  }

  const { error } = await supabase.from("communities").insert({
    user_id:     user.id,
    name,
    arg_name:    argName || null,
    description: desc    || null,
    type,
    author,
    members:     1
  });

  if (error) {
    errEl.textContent   = "Something went wrong. Please try again.";
    errEl.style.display = "block";
    console.error(error);
    return;
  }

  // Show success, close modal after a beat, refresh grid
  document.getElementById("ccSuccess").style.display = "block";
  document.querySelector("#createCommunityModal .modal-submit").disabled = true;
  document.querySelector("#createCommunityModal .modal-submit").style.opacity = "0.4";

  setTimeout(() => {
    window.closeCreateCommunity();
    loadCommunities();
  }, 1200);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOAD & RENDER COMMUNITIES FROM SUPABASE
// Merges with the hardcoded placeholder communities already in discover.html
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function loadCommunities() {
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) { console.error("Failed to load communities:", error); return; }

  allCommunities = data || [];

  // Inject real communities into the top of the existing hardcoded array
  // We expose them via a global so the existing renderPage() can pick them up
  window.__supabaseCommunities = allCommunities.map(c => ({
    id:      c.id,
    name:    c.name,
    type:    c.type,
    members: c.members,
    desc:    c.description || (c.arg_name ? `A community for ${c.arg_name}.` : "No description provided."),
    argName: c.arg_name,
    ownerId: c.user_id,
    real:    true
  }));

  if (typeof window.refreshWithReal === "function") window.refreshWithReal();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INIT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
loadCommunities();