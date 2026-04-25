// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUPABASE CLIENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL  = "https://wlwvwsouoioojvemldwx.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsd3Z3c291b2lvb2p2ZW1sZHd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2Njg2OTMsImV4cCI6MjA4ODI0NDY5M30.IE7kN9CWsdsalbc5kixfGXNU9ksEorRlYsXmkHr8vrk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

const MODERATOR_EMAIL = "damiralexsam@gmail.com";

const CAT_LABELS = {
  "icon-border":   "🔲 Icon Borders",
  "animated":      "✨ Animated Skins",
  "banner":        "🖼 Banners",
  "coloured-font": "🎨 Coloured Font",
  "profile-hat":   "🎩 Profile Hats",
  "background":    "🌌 Backgrounds",
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
  await supabase.from("promotion_tickets").upsert({ user_id: userId, coins }, { onConflict: "user_id" });
}

export async function getActiveCosmetics(userId) {
  const { data } = await supabase.from("cosmetics_active").select("item_id, category").eq("user_id", userId);
  return data || [];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTH MODAL HTML
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function injectAuthModal() {
  if (document.getElementById("authModal")) return;

  const html = `
  <style>
    #authModal {
      display:none; position:fixed; inset:0;
      background:rgba(0,0,0,0.9); z-index:99999;
      justify-content:center; align-items:center;
    }
    #authModal.open { display:flex; }
    #authBox {
      background:#111; border:1px solid #333; border-radius:16px;
      padding:40px 44px; width:480px; max-height:92vh;
      overflow-y:auto; position:relative;
      animation:authFadeUp 0.3s ease both;
      font-family:'Roboto Slab',serif;
      scrollbar-width:thin; scrollbar-color:#333 transparent;
    }
    @keyframes authFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    #authClose {
      position:absolute; top:16px; right:20px;
      background:none; border:none; color:#666; font-size:22px;
      cursor:pointer; transition:0.2s; font-family:'Roboto Slab',serif;
    }
    #authClose:hover { color:white; box-shadow:none!important; }
    .auth-tabs { display:flex; margin-bottom:28px; border-bottom:1px solid #333; }
    .auth-tab {
      flex:1; padding:10px; text-align:center; cursor:pointer;
      font-size:14px; color:#666; letter-spacing:1px; transition:0.2s;
      border-bottom:2px solid transparent; margin-bottom:-1px;
      background:none; border-top:none; border-left:none; border-right:none;
      font-family:'Roboto Slab',serif;
    }
    .auth-tab.active { color:white; border-bottom-color:white; }
    .auth-field { display:flex; flex-direction:column; gap:6px; margin-bottom:16px; }
    .auth-field label { font-size:12px; color:#aaa; letter-spacing:1px; }
    .auth-field input {
      padding:11px 14px; border-radius:8px; border:1px solid #333;
      background:#1a1a1a; color:white; font-family:'Roboto Slab',serif;
      font-size:14px; outline:none; transition:0.3s;
    }
    .auth-field input:focus { border-color:white; box-shadow:0 0 8px rgba(255,255,255,0.1); }
    .auth-submit {
      width:100%; padding:13px; border-radius:10px;
      border:1px solid white; background:transparent; color:white;
      font-family:'Roboto Slab',serif; font-size:15px;
      cursor:pointer; transition:0.3s; margin-top:4px;
    }
    .auth-submit:hover { background:white; color:black; }
    .auth-divider { display:flex; align-items:center; gap:12px; margin:18px 0; color:#444; font-size:12px; }
    .auth-divider::before,.auth-divider::after { content:""; flex:1; height:1px; background:#333; }
    .auth-google {
      width:100%; padding:13px; border-radius:10px;
      border:1px solid #444; background:#1a1a1a; color:#ccc;
      font-family:'Roboto Slab',serif; font-size:14px;
      cursor:pointer; transition:0.3s;
      display:flex; align-items:center; justify-content:center; gap:10px;
    }
    .auth-google:hover { border-color:white; color:white; box-shadow:none!important; }
    .auth-error { color:red; font-size:12px; margin-top:8px; display:none; text-align:center; }
    .auth-success { color:lime; font-size:13px; margin-top:8px; display:none; text-align:center; }

    #authLoggedIn { display:none; }
    .auth-profile-header { text-align:center; padding-bottom:20px; border-bottom:1px solid #1a1a1a; margin-bottom:20px; }
    #authLoggedIn p { color:#aaa; font-size:13px; margin-bottom:4px; }
    .auth-name { color:white; font-size:22px; font-weight:700; display:block; margin-bottom:4px; }
    .auth-email-small { color:#555; font-size:12px; display:block; margin-bottom:16px; }

    .auth-coin-meter {
      display:flex; align-items:center; gap:10px;
      background:#0a0a0a; border:1px solid #2a2a1a;
      border-radius:10px; padding:12px 16px; margin-bottom:16px;
    }
    .auth-coin-icon { font-size:22px; }
    .auth-coin-info { flex:1; text-align:left; }
    .auth-coin-label { font-size:10px; color:#555; letter-spacing:2px; text-transform:uppercase; }
    .auth-coin-value { font-size:20px; font-weight:900; color:#ffcc00; }
    .auth-coin-pips { display:flex; gap:5px; }
    .auth-coin-pip { width:12px; height:12px; border-radius:50%; border:1px solid #333; background:#1a1a1a; transition:0.2s; }
    .auth-coin-pip.filled { background:#ffcc00; border-color:#ffcc00; box-shadow:0 0 6px #ffcc00; }

    .auth-signout {
      width:100%; padding:11px; border-radius:8px;
      border:1px solid red; background:transparent; color:red;
      font-family:'Roboto Slab',serif; font-size:14px;
      cursor:pointer; transition:0.2s; margin-top:8px;
    }
    .auth-signout:hover { background:red; color:white; box-shadow:none!important; }

    /* WARDROBE */
    .wardrobe-section { margin-top:20px; padding-top:20px; border-top:1px solid #1a1a1a; }
    .wardrobe-title {
      font-size:10px; color:#ffcc00; letter-spacing:2px; text-transform:uppercase;
      margin-bottom:14px; display:flex; align-items:center; gap:8px;
    }
    .wardrobe-title::after { content:""; flex:1; height:1px; background:#2a2a1a; }
    .wardrobe-empty { font-size:12px; color:#333; letter-spacing:1px; text-align:center; padding:16px 0; }
    .wardrobe-cat { margin-bottom:16px; }
    .wardrobe-cat-label { font-size:10px; color:#555; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:8px; }
    .wardrobe-items { display:flex; flex-direction:column; gap:6px; }
    .wardrobe-item {
      display:flex; align-items:center; gap:10px;
      background:#0f0f0f; border:1px solid #1e1e1e;
      border-radius:8px; padding:8px 12px; transition:0.15s;
    }
    .wardrobe-item.active-item { border-color:#ffcc00; }
    .wardrobe-item-emoji { font-size:20px; flex-shrink:0; }
    .wardrobe-item-info { flex:1; min-width:0; }
    .wardrobe-item-name { font-size:13px; color:white; }
    .wardrobe-item-status { font-size:10px; color:#555; margin-top:1px; }
    .wardrobe-item.active-item .wardrobe-item-status { color:#ffcc00; }
    .wardrobe-toggle {
      padding:4px 12px; border-radius:5px;
      font-family:'Roboto Slab',serif; font-size:11px;
      cursor:pointer; transition:0.2s; flex-shrink:0;
      border:1px solid #333; background:transparent; color:#555;
    }
    .wardrobe-item.active-item .wardrobe-toggle { border-color:#ffcc00; color:#ffcc00; }
    .wardrobe-toggle:hover { border-color:white; color:white; box-shadow:none!important; }

    /* MOD PANEL */
    .mod-panel { margin-top:20px; padding-top:20px; border-top:1px solid #2a1a00; }
    .mod-panel-title {
      font-size:10px; color:orange; letter-spacing:2px; text-transform:uppercase;
      margin-bottom:14px; display:flex; align-items:center; gap:8px;
    }
    .mod-panel-title::after { content:""; flex:1; height:1px; background:#2a1a00; }
    .mod-search-wrap { display:flex; gap:8px; margin-bottom:10px; }
    .mod-input {
      flex:1; padding:9px 12px; border-radius:7px;
      border:1px solid #2a2a2a; background:#1a1a1a;
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
      display:none; background:#0f0f0f; border:1px solid #2a2a2a;
      border-radius:10px; padding:14px 16px; margin-top:8px;
    }
    .mod-user-card.visible { display:block; }
    .mod-user-card-name { font-size:15px; font-weight:700; color:white; margin-bottom:4px; }
    .mod-user-card-email { font-size:11px; color:#555; margin-bottom:12px; }
    .mod-coin-row { display:flex; align-items:center; gap:10px; }
    .mod-coin-current { font-size:13px; color:#ffcc00; flex:1; }
    .mod-coin-btns { display:flex; gap:6px; }
    .mod-coin-btn {
      padding:6px 12px; border-radius:6px; border:1px solid #333;
      background:transparent; color:#aaa;
      font-family:'Roboto Slab',serif; font-size:13px;
      cursor:pointer; transition:0.2s;
    }
    .mod-coin-btn.add { border-color:#ffcc00; color:#ffcc00; }
    .mod-coin-btn.sub { border-color:#555; color:#555; }
    .mod-coin-btn.add:hover { background:#ffcc00; color:black; box-shadow:none!important; }
    .mod-coin-btn.sub:hover { background:#333; color:white; box-shadow:none!important; }
    .mod-coin-btn:disabled { opacity:0.3; cursor:not-allowed; }
    .mod-msg { font-size:12px; margin-top:8px; display:none; }
    .mod-msg.ok { color:lime; }
    .mod-msg.err { color:red; }

    #navUserBtn {
      padding:7px 16px; border-radius:8px;
      border:1px solid #444; background:#0a0a0a; color:#aaa;
      font-family:'Roboto Slab',serif; font-size:13px;
      cursor:pointer; transition:0.2s;
      position:fixed; top:14px; right:18px; z-index:9998;
    }
    #navUserBtn:hover { border-color:white; color:white; box-shadow:none!important; }
    #navUserBtn.signed-in { border-color:lime; color:lime; }
  </style>

  <button id="navUserBtn" onclick="window.__authModal.open()">Sign In</button>

  <div id="authModal" onclick="window.__authModal.handleOverlay(event)">
    <div id="authBox">
      <button id="authClose" onclick="window.__authModal.close()">✕</button>

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

      <div id="authLoggedIn">
        <div class="auth-profile-header">
          <p>Signed in as</p>
          <span class="auth-name" id="authUserName"></span>
          <span class="auth-email-small" id="authUserEmail"></span>
          <div class="auth-coin-meter">
            <div class="auth-coin-icon">✦</div>
            <div class="auth-coin-info">
              <div class="auth-coin-label">Promotion Tickets</div>
              <div class="auth-coin-value" id="authCoinValue">0</div>
            </div>
            <div class="auth-coin-pips" id="authCoinPips">
              <div class="auth-coin-pip" data-pip="1"></div>
              <div class="auth-coin-pip" data-pip="2"></div>
              <div class="auth-coin-pip" data-pip="3"></div>
              <div class="auth-coin-pip" data-pip="4"></div>
              <div class="auth-coin-pip" data-pip="5"></div>
            </div>
          </div>
          <button class="auth-signout" onclick="window.__authModal.signOut()">Sign Out</button>
        </div>

        <div class="wardrobe-section">
          <div class="wardrobe-title">👗 My Wardrobe</div>
          <div id="wardrobeContent"><div class="wardrobe-empty">Loading cosmetics...</div></div>
        </div>

        <div class="mod-panel" id="modPanel" style="display:none;">
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
      </div>

    </div>
  </div>
  `;

  document.body.insertAdjacentHTML("beforeend", html);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONTROLLER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let pendingCallback  = null;
let _modTargetUserId = null;
let _modTargetCoins  = 0;

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
    const card = document.getElementById("modUserCard");
    if (card) card.classList.remove("visible");
    const inp = document.getElementById("modSearchInput");
    if (inp) inp.value = "";
    const msg = document.getElementById("modMsg");
    if (msg) msg.style.display = "none";
  },
  handleOverlay(e) { if (e.target === document.getElementById("authModal")) this.close(); },
  switchTab(tab) {
    const s = tab === "signin";
    document.getElementById("formSignIn").style.display = s ? "block" : "none";
    document.getElementById("formSignUp").style.display = s ? "none"  : "block";
    document.getElementById("tabSignIn").classList.toggle("active",  s);
    document.getElementById("tabSignUp").classList.toggle("active", !s);
  },

  async _refreshView() {
    const user  = await getUser();
    const forms = document.getElementById("authForms");
    const li    = document.getElementById("authLoggedIn");
    if (user) {
      forms.style.display = "none";
      li.style.display    = "block";
      const name = await getDisplayName();
      document.getElementById("authUserName").textContent  = name;
      document.getElementById("authUserEmail").textContent = user.email;
      const coins = await getCoins(user.id);
      this._renderCoins(coins);
      document.getElementById("modPanel").style.display =
        user.email === MODERATOR_EMAIL ? "block" : "none";
      await this._loadWardrobe(user.id);
    } else {
      forms.style.display = "block";
      li.style.display    = "none";
    }
  },

  _renderCoins(coins) {
    document.getElementById("authCoinValue").textContent = coins;
    document.querySelectorAll(".auth-coin-pip").forEach(p =>
      p.classList.toggle("filled", parseInt(p.dataset.pip) <= coins));
  },

  async _loadWardrobe(userId) {
    const content = document.getElementById("wardrobeContent");
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
    const emojiFor  = id => catalogue.find(c => c.id === id)?.emoji || "🎁";

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
            return `<div class="wardrobe-item ${on?"active-item":""}" id="wi-${item.item_id}">
              <div class="wardrobe-item-emoji">${emojiFor(item.item_id)}</div>
              <div class="wardrobe-item-info">
                <div class="wardrobe-item-name">${item.name}</div>
                <div class="wardrobe-item-status">${on?"✓ Active":"Inactive"}</div>
              </div>
              <button class="wardrobe-toggle" onclick="window.__authModal._toggleCosmetic('${userId}','${item.item_id}','${item.category}',${on})">
                ${on?"Disable":"Enable"}
              </button>
            </div>`;
          }).join("")}
        </div>
      </div>`).join("");
  },

  async _toggleCosmetic(userId, itemId, category, currentlyActive) {
    if (currentlyActive) {
      await supabase.from("cosmetics_active").delete().eq("user_id", userId).eq("item_id", itemId);
    } else {
      await supabase.from("cosmetics_active").delete().eq("user_id", userId).eq("category", category);
      await supabase.from("cosmetics_active").insert({ user_id: userId, item_id: itemId, category });
    }
    await this._loadWardrobe(userId);
  },

  // ── FIXED MOD SEARCH — queries profiles by display_name OR email ──
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
      msgEl.textContent   = "No user found. Make sure they've signed up and their profile is saved.";
      msgEl.className     = "mod-msg err";
      msgEl.style.display = "block";
      return;
    }

    const target = data[0];
    _modTargetUserId = target.id;
    _modTargetCoins  = await getCoins(target.id);
    document.getElementById("modCardName").textContent  = target.display_name || "Unknown";
    document.getElementById("modCardEmail").textContent = target.email || target.id.slice(0,8)+"...";
    document.getElementById("modCardCoins").textContent = _modTargetCoins;
    document.getElementById("modSubBtn").disabled = _modTargetCoins <= 0;
    card.classList.add("visible");
  },

  async _modAdjust(delta) {
    if (!_modTargetUserId) return;
    const msgEl    = document.getElementById("modMsg");
    msgEl.style.display = "none";
    const newCoins = Math.max(0, _modTargetCoins + delta);
    await setCoins(_modTargetUserId, newCoins);
    _modTargetCoins = newCoins;
    document.getElementById("modCardCoins").textContent = newCoins;
    document.getElementById("modSubBtn").disabled = newCoins <= 0;
    msgEl.textContent   = delta > 0 ? `✓ Granted ${delta} coins. Total: ${newCoins}` : `✓ Removed 1 coin. Total: ${newCoins}`;
    msgEl.className     = "mod-msg ok";
    msgEl.style.display = "block";
    clearTimeout(this._modMsgTimer);
    this._modMsgTimer = setTimeout(() => { msgEl.style.display = "none"; }, 3000);
    const self = await getUser();
    if (self && self.id === _modTargetUserId) {
      this._renderCoins(newCoins);
      updateNavBtn(self);
    }
  },

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
    // Store email in profiles so mod search works
    if (data.user) await supabase.from("profiles").upsert({ id: data.user.id, display_name: name, email });
    sucEl.textContent   = "✓ Check your Spam folder! Confirm your email to finish signing up.";
    sucEl.style.display = "block";
    document.querySelector("#formSignUp .auth-submit").disabled     = true;
    document.querySelector("#formSignUp .auth-submit").style.opacity = "0.4";
  },

  async googleSignIn() {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.href } });
  },

  async signOut() {
    await supabase.auth.signOut();
    this._refreshView();
    updateNavBtn(null);
  },

  _onSuccess() {
    this.close();
    if (pendingCallback) { pendingCallback(); pendingCallback = null; }
  }
};

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