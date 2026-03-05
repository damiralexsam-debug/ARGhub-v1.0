import { supabase, requireAuth, getUser } from "./supabase-auth.js";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODAL HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

function handleOverlayClick(e, id) {
  if (e.target === document.getElementById(id)) closeModal(id);
}

// Make these available to inline onclick attributes in the HTML
window.closeModal         = closeModal;
window.handleOverlayClick = handleOverlayClick;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST NEW ARG MODAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let pendingImageData = "";

// Called by the "+ Post New ARG" button
// requireAuth gates it — if not logged in, auth modal appears first
window.openPostModal = function() {
  requireAuth(_openPostForm);
};

function _openPostForm() {
  document.getElementById("formView").style.display    = "block";
  document.getElementById("successView").style.display = "none";
  document.querySelectorAll(".field-error").forEach(e => e.style.display = "none");

  ["argName","argAuthor","argYoutube","argWebsite","argGame","argDesc"].forEach(id => {
    document.getElementById(id).value = "";
  });
  ["argGenre","argStatus","argDifficulty","argPlatform"].forEach(id => {
    document.getElementById(id).selectedIndex = 0;
  });

  const preview = document.getElementById("imgPreview");
  preview.src = "";
  preview.style.display = "none";
  document.getElementById("argImgFile").value = "";
  pendingImageData = "";

  document.getElementById("postModal").classList.add("open");
}

// Called when user picks a banner image — reads it as base64 for preview
window.previewImage = function(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    pendingImageData = e.target.result;
    const preview = document.getElementById("imgPreview");
    preview.src = pendingImageData;
    preview.style.display = "block";
  };
  reader.readAsDataURL(file);
};

window.submitARG = async function() {
  document.querySelectorAll(".field-error").forEach(e => e.style.display = "none");

  const name       = document.getElementById("argName").value.trim();
  const author     = document.getElementById("argAuthor").value.trim();
  const youtube    = document.getElementById("argYoutube").value.trim();
  const website    = document.getElementById("argWebsite").value.trim();
  const game       = document.getElementById("argGame").value.trim();
  const desc       = document.getElementById("argDesc").value.trim();
  const genre      = document.getElementById("argGenre").value;
  const status     = document.getElementById("argStatus").value || "Active";
  const difficulty = document.getElementById("argDifficulty").value;
  const platform   = document.getElementById("argPlatform").value;

  // ── Validation ──
  let valid = true;
  if (!name)                          { document.getElementById("errName").style.display   = "block"; valid = false; }
  if (!author)                        { document.getElementById("errAuthor").style.display = "block"; valid = false; }
  if (!youtube && !website && !game)  { document.getElementById("errUrl").style.display    = "block"; valid = false; }
  if (!genre || !difficulty || !platform) { document.getElementById("errTags").style.display = "block"; valid = false; }
  if (!valid) return;

  // ── Get logged-in user ──
  const user = await getUser();
  if (!user) { window.__authModal.open(); return; }

  // ── Insert into Supabase ──
  // user_id links this ARG to the logged-in user (enforced by row-level security)
  const { error } = await supabase.from("args").insert({
    user_id:     user.id,
    name,
    author,
    youtube:     youtube || null,
    website:     website || null,
    game:        game    || null,
    img:         pendingImageData || null,
    description: desc    || "No description provided.",
    genre,
    status,
    difficulty,
    platform,
    trending:    false
  });

  if (error) {
    console.error("Submit error:", error);
    alert("Something went wrong saving your ARG. Please try again.");
    return;
  }

  document.getElementById("formView").style.display    = "none";
  document.getElementById("successView").style.display = "block";
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MY ARGs MODAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

window.openMyARGs = function() {
  requireAuth(_loadMyARGs);
};

async function _loadMyARGs() {
  const list = document.getElementById("myARGsList");
  list.innerHTML = `<p class="no-args-msg" style="color:#555;">Loading...</p>`;
  document.getElementById("myARGsModal").classList.add("open");

  const user = await getUser();

  // Fetch only this user's ARGs from Supabase
  // .eq("user_id", user.id) filters by the logged-in user — RLS also enforces this server-side
  const { data: args, error } = await supabase
    .from("args")
    .select("*")
    .eq("user_id", user.id)
    .order("posted_at", { ascending: false });

  if (error) {
    list.innerHTML = `<p class="no-args-msg" style="color:red;">Failed to load ARGs.</p>`;
    return;
  }

  if (!args || args.length === 0) {
    list.innerHTML = `<p class="no-args-msg">You haven't posted any ARGs yet.</p>`;
    return;
  }

  list.innerHTML = args.map(a => `
    <div class="my-arg-row">
      <div>
        <div class="my-arg-row-name">${a.name}</div>
        <div class="my-arg-row-meta">${a.genre} · ${a.status} · ${a.difficulty} · ${a.platform}</div>
      </div>
      <div class="my-arg-actions">
        <button class="row-btn edit"   onclick="openEdit('${a.id}')">Edit</button>
        <button class="row-btn delete" onclick="deleteARG('${a.id}')">Delete</button>
      </div>
    </div>
  `).join("");
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EDIT ARG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

window.openEdit = async function(id) {
  // Fetch just this one ARG by its UUID
  const { data, error } = await supabase
    .from("args")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) { alert("Couldn't load ARG for editing."); return; }

  document.getElementById("editIndex").value       = id; // store UUID instead of array index
  document.getElementById("editDesc").value        = data.description;
  document.getElementById("editGenre").value       = data.genre;
  document.getElementById("editStatus").value      = data.status;
  document.getElementById("editDifficulty").value  = data.difficulty;
  document.getElementById("editPlatform").value    = data.platform;

  closeModal("myARGsModal");
  document.getElementById("editModal").classList.add("open");
};

window.saveEdit = async function() {
  const id = document.getElementById("editIndex").value;

  // .update() only touches the fields we pass — name/URLs stay unchanged
  const { error } = await supabase.from("args").update({
    description: document.getElementById("editDesc").value.trim() || "No description provided.",
    genre:       document.getElementById("editGenre").value,
    status:      document.getElementById("editStatus").value,
    difficulty:  document.getElementById("editDifficulty").value,
    platform:    document.getElementById("editPlatform").value,
  }).eq("id", id);

  if (error) { alert("Save failed. Try again."); return; }

  closeModal("editModal");
  _loadMyARGs(); // refresh the list
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DELETE ARG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

window.deleteARG = async function(id) {
  if (!confirm("Are you sure you want to delete this ARG? This cannot be undone.")) return;

  // .delete() removes the row — RLS ensures you can only delete your own
  const { error } = await supabase.from("args").delete().eq("id", id);
  if (error) { alert("Delete failed. Try again."); return; }

  _loadMyARGs(); // refresh list
};