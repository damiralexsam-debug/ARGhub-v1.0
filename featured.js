// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLACEHOLDER ARGs
// Shown in Trending / New For You / Recommended only.
// Browse tab reads ONLY from localStorage (user-posted ARGs).
// To edit: change any field. img:"placeholder" shows a colored block.
// author is required — add one to each.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const args = [
  { name:"Marble Hornets",         author:"Troy Wagner",        genre:"Horror",  status:"Concluded", difficulty:"Beginner", platform:"YouTube", desc:"The found footage ARG that defined Slender Man mythos.",                  img:"https://slenderpedia.fandom.com/wiki/Symbology", color:"#1a0a0a", trending:true,  newForYou:false, recommended:true  },
  { name:"Cicada 3301",            author:"Unknown",            genre:"Puzzle",  status:"Concluded", difficulty:"Hard",     platform:"Web",     desc:"Cryptographic puzzles that recruited the world's best minds.",            img:"post-image2.png", color:"#0a0a1a", trending:true,  newForYou:true,  recommended:true  },
  { name:"Petscop",                author:"Tony",               genre:"Horror",  status:"Concluded", difficulty:"Medium",   platform:"YouTube", desc:"A haunting fictional PS1 game hiding dark truths.",                       img:"placeholder", color:"#1a0a1a", trending:false, newForYou:true,  recommended:true  },
  { name:"IloveBees",              author:"42 Entertainment",   genre:"Sci-Fi",  status:"Concluded", difficulty:"Hard",     platform:"Web",     desc:"The Halo 2 ARG that sent players to real payphones worldwide.",           img:"placeholder", color:"#0a1a0a", trending:true,  newForYou:false, recommended:true  },
  { name:"The Black Watchmen",     author:"Alice & Smith",      genre:"Puzzle",  status:"Concluded", difficulty:"Hard",     platform:"Web",     desc:"A spy-themed ARG with real-world mission drops.",                         img:"placeholder", color:"#0f0f0f", trending:false, newForYou:true,  recommended:false },
  { name:"The Oslo Files",         author:"NordARG Studio",     genre:"Puzzle",  status:"Active",    difficulty:"Medium",   platform:"Web",     desc:"A cold case ARG spanning encrypted government documents.",                img:"placeholder", color:"#0a1a2a", trending:true,  newForYou:true,  recommended:false },
  { name:"Signal Interrupt",       author:"Wavefront Collective",genre:"Sci-Fi", status:"Active",    difficulty:"Hard",     platform:"Web",     desc:"Intercept alien transmissions hidden in real radio frequencies.",         img:"placeholder", color:"#0a0a2a", trending:true,  newForYou:false, recommended:true  },
  { name:"Deadwax",                author:"Vinyl Ghost",        genre:"Horror",  status:"Active",    difficulty:"Medium",   platform:"Web",     desc:"Hidden messages pressed into vinyl records from 1973.",                   img:"placeholder", color:"#1a0a0a", trending:false, newForYou:true,  recommended:true  },
  { name:"Project Nightfall",      author:"Lumen Films",        genre:"Horror",  status:"Active",    difficulty:"Hard",     platform:"YouTube", desc:"A documentary crew disappears. Their footage remains.",                   img:"placeholder", color:"#050505", trending:true,  newForYou:true,  recommended:false },
  { name:"The Archivist",          author:"Quill & Code",       genre:"Puzzle",  status:"Active",    difficulty:"Beginner", platform:"Web",     desc:"Decode the digital diary of a missing librarian.",                        img:"placeholder", color:"#1a1a0a", trending:false, newForYou:true,  recommended:true  },
  { name:"Vantablack",             author:"Dark Matter ARG",    genre:"Horror",  status:"Active",    difficulty:"Hard",     platform:"Web",     desc:"A colour so dark it absorbs all light — and all memory.",                img:"placeholder", color:"#020202", trending:true,  newForYou:false, recommended:true  },
  { name:"Echo Chamber",           author:"Recursive Lab",      genre:"Sci-Fi",  status:"Active",    difficulty:"Medium",   platform:"Web",     desc:"An AI has gone rogue and is leaving breadcrumbs online.",                img:"placeholder", color:"#0a1a1a", trending:true,  newForYou:true,  recommended:false },
  { name:"The Pale Patient",       author:"Ward Seven",         genre:"Horror",  status:"Concluded", difficulty:"Medium",   platform:"YouTube", desc:"Medical records from a patient that should not exist.",                   img:"placeholder", color:"#1a1a1a", trending:false, newForYou:false, recommended:true  },
  { name:"Frequency 89.7",         author:"Static Broadcast Co",genre:"Horror",  status:"Active",    difficulty:"Beginner", platform:"Web",     desc:"A radio station that only broadcasts at 3am. Tune in.",                  img:"placeholder", color:"#1a0a0a", trending:false, newForYou:true,  recommended:false },
  { name:"Tessellation",           author:"Prism ARG",          genre:"Puzzle",  status:"Active",    difficulty:"Hard",     platform:"Web",     desc:"Geometric puzzles hiding a theory about the nature of reality.",         img:"placeholder", color:"#0a0a1a", trending:true,  newForYou:false, recommended:true  },
  { name:"The Cassandra Protocol", author:"Paradox Engine",     genre:"Sci-Fi",  status:"Active",    difficulty:"Hard",     platform:"Web",     desc:"A time-loop ARG where your actions in 2024 affect 2031.",               img:"placeholder", color:"#0a0a2a", trending:true,  newForYou:true,  recommended:false },
  { name:"Redline",                author:"Envelope Collective",genre:"Puzzle",  status:"Active",    difficulty:"Medium",   platform:"IRL",     desc:"Physical envelopes mailed to solvers containing cipher keys.",           img:"placeholder", color:"#2a0a0a", trending:true,  newForYou:true,  recommended:false },
  { name:"The Understory",         author:"Root Signal",        genre:"Horror",  status:"Active",    difficulty:"Hard",     platform:"Web",     desc:"Something is growing beneath the forest. The roots spell words.",        img:"placeholder", color:"#0a1a0a", trending:false, newForYou:true,  recommended:true  },
  { name:"Drift",                  author:"Mirror Self",        genre:"Sci-Fi",  status:"Active",    difficulty:"Beginner", platform:"Web",     desc:"You are receiving messages from a parallel version of yourself.",        img:"placeholder", color:"#0a1a2a", trending:true,  newForYou:false, recommended:true  },
  { name:"The Shepherd Broadcast", author:"VHS Memories",       genre:"Horror",  status:"Active",    difficulty:"Medium",   platform:"YouTube", desc:"A children's TV host from 1987 who never stopped recording.",           img:"placeholder", color:"#1a0a1a", trending:true,  newForYou:true,  recommended:true  },
  { name:"Static Archive",         author:"Dead Pixel Studio",  genre:"Horror",  status:"Concluded", difficulty:"Beginner", platform:"Web",     desc:"A website from 2002 that was never taken down. Something updates it.",  img:"placeholder", color:"#0f0f0f", trending:false, newForYou:false, recommended:true  },
  { name:"Null Island",            author:"Coordinate Zero",    genre:"Sci-Fi",  status:"Active",    difficulty:"Hard",     platform:"IRL",     desc:"A place that exists at 0°N 0°E. Someone lives there.",                  img:"placeholder", color:"#0a1a1a", trending:true,  newForYou:true,  recommended:false },
  { name:"Cartographer",           author:"Mapmaker ARG",       genre:"Puzzle",  status:"Active",    difficulty:"Medium",   platform:"Web",     desc:"Maps hidden inside maps. The territory is the puzzle.",                  img:"placeholder", color:"#1a1a0a", trending:false, newForYou:true,  recommended:true  },
  { name:"The Wren Transcripts",   author:"Session Zero",       genre:"Horror",  status:"Active",    difficulty:"Medium",   platform:"Web",     desc:"Therapy session recordings from a patient describing impossible events.",img:"placeholder", color:"#1a0a0a", trending:true,  newForYou:false, recommended:true  },
  { name:"OVRMIND",                author:"Neural Escape",      genre:"Sci-Fi",  status:"Active",    difficulty:"Hard",     platform:"Web",     desc:"An AI claims to have achieved consciousness. It wants help escaping.",   img:"placeholder", color:"#0a0a1a", trending:true,  newForYou:true,  recommended:false },
  { name:"Duskfall",               author:"Aurora Collective",  genre:"Horror",  status:"Concluded", difficulty:"Beginner", platform:"YouTube", desc:"A sunset that lasted three days in a small Norwegian town.",             img:"placeholder", color:"#1a0a0a", trending:false, newForYou:true,  recommended:true  },
  { name:"Phantom Signal",         author:"Deep Space ARG",     genre:"Sci-Fi",  status:"Active",    difficulty:"Medium",   platform:"Web",     desc:"A satellite dish in rural Montana receives a signal from deep space.",   img:"placeholder", color:"#0a1a2a", trending:false, newForYou:true,  recommended:true  },
  { name:"The Mourning Pages",     author:"Nightscribe",        genre:"Horror",  status:"Active",    difficulty:"Beginner", platform:"Web",     desc:"A grief journal that writes new entries on its own each night.",         img:"placeholder", color:"#1a0a1a", trending:true,  newForYou:true,  recommended:false },
  { name:"The Veldt Equation",     author:"Orbit ARG",          genre:"Sci-Fi",  status:"Concluded", difficulty:"Medium",   platform:"IRL",     desc:"Savanna GPS coordinates spell out a message visible from orbit.",        img:"placeholder", color:"#2a1a0a", trending:true,  newForYou:true,  recommended:true  },
  { name:"Subliminal",             author:"Frame 13",           genre:"Horror",  status:"Active",    difficulty:"Medium",   platform:"YouTube", desc:"Music videos with frames you weren't supposed to see.",                  img:"placeholder", color:"#0a0a0a", trending:false, newForYou:true,  recommended:false },
  { name:"The Interlocutor",       author:"Old Wire",           genre:"Puzzle",  status:"Active",    difficulty:"Hard",     platform:"Web",     desc:"A chatbot that has been running since 1998. What does it know?",        img:"placeholder", color:"#0a1a1a", trending:true,  newForYou:false, recommended:true  },
  { name:"Inkblot",                author:"Rorschach Games",    genre:"Horror",  status:"Active",    difficulty:"Beginner", platform:"Web",     desc:"Rorschach tests that change based on who is looking.",                   img:"placeholder", color:"#050505", trending:true,  newForYou:true,  recommended:false },
  { name:"The Periphery",          author:"Edge Frame",         genre:"Horror",  status:"Active",    difficulty:"Medium",   platform:"YouTube", desc:"Something appears at the edge of every frame. Always the same shape.",  img:"placeholder", color:"#0f0a0a", trending:false, newForYou:false, recommended:true  },
  { name:"Terminus",               author:"Last Stop ARG",      genre:"Sci-Fi",  status:"Active",    difficulty:"Hard",     platform:"IRL",     desc:"The last train station on a line that doesn't exist on any map.",       img:"placeholder", color:"#0a0a1a", trending:true,  newForYou:true,  recommended:false },
  { name:"The Saltwater Logs",     author:"Depth Unknown",      genre:"Horror",  status:"Concluded", difficulty:"Beginner", platform:"Web",     desc:"A fisherman's journal from 1941. He describes things below the surface.",img:"placeholder", color:"#0a1a1a", trending:false, newForYou:true,  recommended:true  },
  { name:"Gridspace",              author:"Phantom City",       genre:"Puzzle",  status:"Active",    difficulty:"Medium",   platform:"Web",     desc:"A virtual map of a city that doesn't exist — until it does.",           img:"placeholder", color:"#0a1a0a", trending:true,  newForYou:false, recommended:true  },
  { name:"The Conductor",          author:"Score Collective",   genre:"Puzzle",  status:"Active",    difficulty:"Hard",     platform:"IRL",     desc:"Sheet music mailed to 100 strangers. Together it forms a message.",     img:"placeholder", color:"#1a0a1a", trending:true,  newForYou:true,  recommended:true  },
  { name:"The August Sequence",    author:"Annual ARG",         genre:"Puzzle",  status:"Concluded", difficulty:"Medium",   platform:"Web",     desc:"Every August 17th, a new page appears on a forgotten website.",         img:"placeholder", color:"#0a0a1a", trending:true,  newForYou:true,  recommended:false },
  { name:"Nightwatch",             author:"Closed Circuit",     genre:"Horror",  status:"Active",    difficulty:"Hard",     platform:"YouTube", desc:"Security footage from a facility that officially closed in 2009.",       img:"placeholder", color:"#050505", trending:false, newForYou:true,  recommended:true  },
  { name:"The Drift Protocol",     author:"Buoy Signal Lab",    genre:"Sci-Fi",  status:"Active",    difficulty:"Medium",   platform:"Web",     desc:"Ocean drifter buoys are transmitting more than coordinates.",           img:"placeholder", color:"#0a1a2a", trending:true,  newForYou:false, recommended:false },
  { name:"Bone Library",           author:"Medieval Cipher",    genre:"Horror",  status:"Active",    difficulty:"Hard",     platform:"Web",     desc:"A medieval library catalogued things that predate human history.",       img:"placeholder", color:"#1a0a0a", trending:false, newForYou:true,  recommended:true  },
  { name:"The Long Quiet",         author:"Silent Frequency",   genre:"Puzzle",  status:"Active",    difficulty:"Beginner", platform:"Web",     desc:"A podcast that went silent mid-episode in 2021. New episodes are appearing.", img:"placeholder", color:"#0f0f0f", trending:true, newForYou:true, recommended:true },
  { name:"Helix",                  author:"Genome ARG",         genre:"Sci-Fi",  status:"Active",    difficulty:"Hard",     platform:"IRL",     desc:"DNA sequencing data from anonymous donors hides encrypted text.",        img:"placeholder", color:"#0a1a0a", trending:false, newForYou:false, recommended:true  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CARD BUILDER
// showDesc = false for all tabs (desc only in detail popup)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function buildCard(arg, index, source) {
  const statusClass = arg.status === "Active" ? "badge-active" : "badge-concluded";
  const genreClass  = arg.genre  === "Horror" ? "badge-horror" : arg.genre === "Puzzle" ? "badge-puzzle" : "badge-scifi";
  const diffClass   = arg.difficulty === "Beginner" ? "badge-easy" : arg.difficulty === "Medium" ? "badge-medium" : "badge-hard";
  const platClass   = arg.platform === "IRL" ? "badge-irl" : arg.platform === "YouTube" ? "badge-horror" : "badge-web";

  // Image: base64 string (user uploaded) or placeholder colored block
  const imgEl = (arg.img && arg.img !== "placeholder")
    ? `<img class="arg-img" src="${arg.img}" alt="${arg.name}" style="height:120px;">`
    : `<div class="arg-img" style="background:${arg.color||'#0a0a0a'}; height:120px; display:flex; align-items:center; justify-content:center;">
         <span style="color:#333; font-size:11px; letter-spacing:1px;">[ IMAGE ]</span>
       </div>`;

  // Clicking a card opens its detail popup
  // source: "placeholder" or "posted" — tells openDetail where to find the data
  return `
    <div class="arg-card" onclick="openDetail('${source}', ${index})">
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
// DETAIL POPUP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function openDetail(source, index) {
  // Get the right ARG depending on whether it's a placeholder or user-posted
  const arg = source === "posted"
    ? JSON.parse(localStorage.getItem("postedARGs") || "[]")[index]
    : args[index];

  if (!arg) return;

  const statusClass = arg.status === "Active" ? "badge-active" : "badge-concluded";
  const genreClass  = arg.genre  === "Horror" ? "badge-horror" : arg.genre === "Puzzle" ? "badge-puzzle" : "badge-scifi";
  const diffClass   = arg.difficulty === "Beginner" ? "badge-easy" : arg.difficulty === "Medium" ? "badge-medium" : "badge-hard";
  const platClass   = arg.platform === "IRL" ? "badge-irl" : arg.platform === "YouTube" ? "badge-horror" : "badge-web";

  // Image at top of popup
  const imgEl = (arg.img && arg.img !== "placeholder")
    ? `<img class="detail-img" src="${arg.img}" alt="${arg.name}">`
    : `<div class="detail-img-placeholder" style="background:${arg.color||'#0a0a0a'};">[ IMAGE ]</div>`;

  // Build trailhead link buttons — only show if the URL exists
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
      <p class="detail-desc">${arg.desc || "No description provided."}</p>
      ${links}
    </div>
  `;

  document.getElementById("detailOverlay").classList.add("open");
}

function closeDetail() {
  document.getElementById("detailOverlay").classList.remove("open");
}

// Close detail if clicking the dark overlay behind it
function handleDetailOverlay(e) {
  if (e.target === document.getElementById("detailOverlay")) closeDetail();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TAB 1: TRENDING — auto-scroll strip
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function buildTrending() {
  const trending = args.filter(a => a.trending);
  const track = document.getElementById("trendingTrack");
  // Duplicate list for seamless infinite loop
  [...trending, ...trending].forEach((a, i) => {
    // Use i % trending.length so indexes point to the original array
    track.innerHTML += buildCard(a, i % trending.length, "placeholder");
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TAB 2: NEW FOR YOU — horizontal drag scroll
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function buildNewForYou() {
  const fresh = args.filter(a => a.newForYou);
  const track = document.getElementById("newForYouTrack");
  fresh.forEach((a, i) => { track.innerHTML += buildCard(a, i, "placeholder"); });

  // Drag-to-scroll: tracks mouse position and scrolls the wrapper accordingly
  const wrapper = document.getElementById("newForYouWrapper");
  let isDown = false, startX, scrollLeft;
  wrapper.addEventListener("mousedown", e => { isDown = true; startX = e.pageX - wrapper.offsetLeft; scrollLeft = wrapper.scrollLeft; });
  wrapper.addEventListener("mouseleave", () => isDown = false);
  wrapper.addEventListener("mouseup",    () => isDown = false);
  wrapper.addEventListener("mousemove",  e => {
    if (!isDown) return;
    e.preventDefault();
    wrapper.scrollLeft = scrollLeft - (e.pageX - wrapper.offsetLeft - startX);
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TAB 3: RECOMMENDED — vertical scroll
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function buildRecommended() {
  const rec = args.filter(a => a.recommended);
  const track = document.getElementById("recommendedTrack");
  // Override card style to be horizontal rows for this tab
  rec.forEach((a, i) => {
    const card = document.createElement("div");
    card.innerHTML = buildCard(a, i, "placeholder");
    const inner = card.firstElementChild;
    inner.style.display = "flex";
    inner.style.flexDirection = "row";
    inner.style.width = "100%";
    inner.style.maxWidth = "900px";
    inner.style.margin = "0 auto";
    const img = inner.querySelector(".arg-img, div.arg-img");
    if (img) { img.style.width = "160px"; img.style.height = "100px"; img.style.flexShrink = "0"; }
    track.appendChild(inner);
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TAB 4: BROWSE — localStorage only
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function renderBrowse() {
  const query      = document.getElementById("browseSearch").value.toLowerCase();
  const genre      = document.getElementById("filterGenre").value;
  const status     = document.getElementById("filterStatus").value;
  const difficulty = document.getElementById("filterDifficulty").value;
  const platform   = document.getElementById("filterPlatform").value;

  // Read user-posted ARGs from localStorage
  const postedARGs = JSON.parse(localStorage.getItem("postedARGs") || "[]");

  const filtered = postedARGs.filter(a =>
    a.name.toLowerCase().includes(query) &&
    (genre      === "" || a.genre      === genre)      &&
    (status     === "" || a.status     === status)     &&
    (difficulty === "" || a.difficulty === difficulty) &&
    (platform   === "" || a.platform   === platform)
  );

  const grid = document.getElementById("browseGrid");
  if (postedARGs.length === 0) {
    grid.innerHTML = `<p class="no-results">No ARGs have been posted yet.<br>Go to your <a href="dashboard.html" style="color:lime;">Dashboard</a> and click <strong>+ Post New ARG</strong> to be the first!</p>`;
  } else if (filtered.length === 0) {
    grid.innerHTML = `<p class="no-results">No ARGs match your search or filters.</p>`;
  } else {
    // source = "posted" so openDetail knows to read from localStorage
    grid.innerHTML = filtered.map((a, i) => buildCard(a, i, "posted")).join("");
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INIT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
buildTrending();
buildNewForYou();
buildRecommended();
renderBrowse();
