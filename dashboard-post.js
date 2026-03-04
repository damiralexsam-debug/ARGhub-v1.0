// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODAL HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

// Closes the modal if the user clicks the dark overlay behind it
function handleOverlayClick(e, id) {
  if (e.target === document.getElementById(id)) closeModal(id);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST NEW ARG MODAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Stores the base64 image data when the user picks a file
// base64 = a way of encoding image bytes as a text string so it can be saved in localStorage
let pendingImageData = "";

function openPostModal() {
  // Reset everything each time
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

// Called when user picks an image file — reads it and shows a preview
// FileReader is a built-in browser API that reads files from the user's computer
function previewImage(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    // e.target.result is the base64 string of the image
    pendingImageData = e.target.result;
    const preview = document.getElementById("imgPreview");
    preview.src = pendingImageData;
    preview.style.display = "block";
  };
  reader.readAsDataURL(file); // converts image to base64 text
}

function submitARG() {
  document.querySelectorAll(".field-error").forEach(e => e.style.display = "none");

  const name       = document.getElementById("argName").value.trim();
  const author     = document.getElementById("argAuthor").value.trim();
  const youtube    = document.getElementById("argYoutube").value.trim();
  const website    = document.getElementById("argWebsite").value.trim();
  const game       = document.getElementById("argGame").value.trim();
  const desc       = document.getElementById("argDesc").value.trim();
  const genre      = document.getElementById("argGenre").value;
  const status     = document.getElementById("argStatus").value;
  const difficulty = document.getElementById("argDifficulty").value;
  const platform   = document.getElementById("argPlatform").value;

  // ── Validation ──
  let valid = true;

  if (!name) {
    document.getElementById("errName").style.display = "block";
    valid = false;
  }
  if (!author) {
    document.getElementById("errAuthor").style.display = "block";
    valid = false;
  }
  if (!youtube && !website && !game) {
    document.getElementById("errUrl").style.display = "block";
    valid = false;
  }
  if (!genre || !status || !difficulty || !platform) {
    document.getElementById("errTags").style.display = "block";
    valid = false;
  }
  if (!valid) return;

  // ── Build ARG object ──
  const newARG = {
    id:          Date.now(), // unique ID based on timestamp, used for editing/deleting
    name, author, youtube, website, game,
    img:         pendingImageData || "placeholder",
    color:       "#0a0a0a",
    desc:        desc || "No description provided.",
    genre, status, difficulty, platform,
    trending:    false,
    newForYou:   false,
    recommended: false,
    posted:      true
  };

  // ── Save to localStorage ──
  const existing = JSON.parse(localStorage.getItem("postedARGs") || "[]");
  existing.push(newARG);
  localStorage.setItem("postedARGs", JSON.stringify(existing));

  document.getElementById("formView").style.display    = "none";
  document.getElementById("successView").style.display = "block";
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MY ARGs MODAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function openMyARGs() {
  const list = document.getElementById("myARGsList");
  const args = JSON.parse(localStorage.getItem("postedARGs") || "[]");

  if (args.length === 0) {
    list.innerHTML = `<p class="no-args-msg">You haven't posted any ARGs yet.</p>`;
  } else {
    list.innerHTML = args.map((a, i) => `
      <div class="my-arg-row">
        <div>
          <div class="my-arg-row-name">${a.name}</div>
          <div class="my-arg-row-meta">${a.genre} · ${a.status} · ${a.difficulty} · ${a.platform}</div>
        </div>
        <div class="my-arg-actions">
          <button class="row-btn edit"   onclick="openEdit(${i})">Edit</button>
          <button class="row-btn delete" onclick="deleteARG(${i})">Delete</button>
        </div>
      </div>
    `).join("");
  }

  document.getElementById("myARGsModal").classList.add("open");
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EDIT ARG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function openEdit(index) {
  const args = JSON.parse(localStorage.getItem("postedARGs") || "[]");
  const arg  = args[index];

  // Pre-fill the edit form with current values
  document.getElementById("editIndex").value      = index;
  document.getElementById("editDesc").value       = arg.desc;
  document.getElementById("editGenre").value      = arg.genre;
  document.getElementById("editStatus").value     = arg.status;
  document.getElementById("editDifficulty").value = arg.difficulty;
  document.getElementById("editPlatform").value   = arg.platform;

  // Close My ARGs, open Edit
  closeModal("myARGsModal");
  document.getElementById("editModal").classList.add("open");
}

function saveEdit() {
  const index      = parseInt(document.getElementById("editIndex").value);
  const args       = JSON.parse(localStorage.getItem("postedARGs") || "[]");

  // Update only the editable fields — name and URLs stay locked
  args[index].desc       = document.getElementById("editDesc").value.trim() || "No description provided.";
  args[index].genre      = document.getElementById("editGenre").value;
  args[index].status     = document.getElementById("editStatus").value;
  args[index].difficulty = document.getElementById("editDifficulty").value;
  args[index].platform   = document.getElementById("editPlatform").value;

  localStorage.setItem("postedARGs", JSON.stringify(args));

  closeModal("editModal");
  openMyARGs(); // re-open My ARGs so the list refreshes
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DELETE ARG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function deleteARG(index) {
  // confirm() shows a browser dialog asking "are you sure?"
  // It returns true if the user clicks OK, false if they cancel
  if (!confirm("Are you sure you want to delete this ARG? This cannot be undone.")) return;

  const args = JSON.parse(localStorage.getItem("postedARGs") || "[]");
  args.splice(index, 1); // removes 1 item at position `index`
  localStorage.setItem("postedARGs", JSON.stringify(args));

  openMyARGs(); // refresh the list
}
