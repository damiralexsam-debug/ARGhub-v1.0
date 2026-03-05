// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUPABASE CLIENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// We load Supabase from CDN (see script tag in each HTML file).
// createClient() initialises the connection to our project.

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL  = "https://wlwvwsouoioojvemldwx.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsd3Z3c291b2lvb2p2ZW1sZHd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2Njg2OTMsImV4cCI6MjA4ODI0NDY5M30.IE7kN9CWsdsalbc5kixfGXNU9ksEorRlYsXmkHr8vrk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SESSION HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Returns the current logged-in user, or null if not logged in
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Call this on any page that needs to know who's logged in.
// Runs the callback with the user object (or null) whenever auth state changes.
export function onAuthChange(callback) {
  supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTH MODAL HTML
// Injected into the page once, reused everywhere
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function injectAuthModal() {
  if (document.getElementById("authModal")) return; // already injected

  const html = `
  <style>
    /* ── AUTH MODAL OVERLAY ── */
    #authModal {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.9);
      z-index: 99999;
      justify-content: center;
      align-items: center;
    }
    #authModal.open { display: flex; }

    #authBox {
      background: #111;
      border: 1px solid #333;
      border-radius: 16px;
      padding: 40px 44px;
      width: 440px;
      position: relative;
      animation: authFadeUp 0.3s ease both;
      font-family: 'Roboto Slab', serif;
    }
    @keyframes authFadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    #authClose {
      position: absolute;
      top: 16px; right: 20px;
      background: none; border: none;
      color: #666; font-size: 22px;
      cursor: pointer; transition: 0.2s;
      font-family: 'Roboto Slab', serif;
    }
    #authClose:hover { color: white; box-shadow: none !important; }

    /* ── TABS ── */
    .auth-tabs {
      display: flex;
      gap: 0;
      margin-bottom: 28px;
      border-bottom: 1px solid #333;
    }
    .auth-tab {
      flex: 1;
      padding: 10px;
      text-align: center;
      cursor: pointer;
      font-size: 14px;
      color: #666;
      letter-spacing: 1px;
      transition: 0.2s;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      background: none;
      border-top: none;
      border-left: none;
      border-right: none;
      font-family: 'Roboto Slab', serif;
    }
    .auth-tab.active { color: white; border-bottom-color: white; }

    /* ── FORM FIELDS ── */
    .auth-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 16px;
    }
    .auth-field label {
      font-size: 12px;
      color: #aaa;
      letter-spacing: 1px;
    }
    .auth-field input {
      padding: 11px 14px;
      border-radius: 8px;
      border: 1px solid #333;
      background: #1a1a1a;
      color: white;
      font-family: 'Roboto Slab', serif;
      font-size: 14px;
      outline: none;
      transition: 0.3s;
    }
    .auth-field input:focus {
      border-color: white;
      box-shadow: 0 0 8px rgba(255,255,255,0.1);
    }

    /* ── BUTTONS ── */
    .auth-submit {
      width: 100%;
      padding: 13px;
      border-radius: 10px;
      border: 1px solid white;
      background: transparent;
      color: white;
      font-family: 'Roboto Slab', serif;
      font-size: 15px;
      cursor: pointer;
      transition: 0.3s;
      margin-top: 4px;
    }
    .auth-submit:hover { background: white; color: black; }

    .auth-divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 18px 0;
      color: #444;
      font-size: 12px;
    }
    .auth-divider::before,
    .auth-divider::after {
      content: "";
      flex: 1;
      height: 1px;
      background: #333;
    }

    .auth-google {
      width: 100%;
      padding: 13px;
      border-radius: 10px;
      border: 1px solid #444;
      background: #1a1a1a;
      color: #ccc;
      font-family: 'Roboto Slab', serif;
      font-size: 14px;
      cursor: pointer;
      transition: 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .auth-google:hover { border-color: white; color: white; box-shadow: none !important; }

    .auth-error {
      color: red;
      font-size: 12px;
      margin-top: 8px;
      display: none;
      text-align: center;
    }
    .auth-success {
      color: lime;
      font-size: 13px;
      margin-top: 8px;
      display: none;
      text-align: center;
    }

    /* ── LOGGED-IN STATE ── */
    #authLoggedIn { display: none; text-align: center; }
    #authLoggedIn p { color: #aaa; font-size: 14px; margin-bottom: 20px; }
    #authLoggedIn strong { color: white; }
    .auth-signout {
      padding: 11px 28px;
      border-radius: 8px;
      border: 1px solid red;
      background: transparent;
      color: red;
      font-family: 'Roboto Slab', serif;
      font-size: 14px;
      cursor: pointer;
      transition: 0.2s;
    }
    .auth-signout:hover { background: red; color: white; box-shadow: none !important; }

    /* ── NAV USER INDICATOR ── */
    #navUserBtn {
      padding: 8px 18px;
      border-radius: 8px;
      border: 1px solid #444;
      background: transparent;
      color: #aaa;
      font-family: 'Roboto Slab', serif;
      font-size: 13px;
      cursor: pointer;
      transition: 0.2s;
      position: fixed;
      top: 16px;
      right: 20px;
      z-index: 9998;
    }
    #navUserBtn:hover { border-color: white; color: white; box-shadow: none !important; }
    #navUserBtn.signed-in { border-color: lime; color: lime; }
  </style>

  <!-- Fixed sign-in button top-right corner of every page -->
  <button id="navUserBtn" onclick="window.__authModal.open()">Sign In</button>

  <div id="authModal" onclick="window.__authModal.handleOverlay(event)">
    <div id="authBox">
      <button id="authClose" onclick="window.__authModal.close()">✕</button>

      <!-- LOGGED OUT VIEW -->
      <div id="authForms">
        <div class="auth-tabs">
          <button class="auth-tab active" id="tabSignIn" onclick="window.__authModal.switchTab('signin')">Sign In</button>
          <button class="auth-tab"        id="tabSignUp" onclick="window.__authModal.switchTab('signup')">Sign Up</button>
        </div>

        <!-- SIGN IN FORM -->
        <div id="formSignIn">
          <div class="auth-field">
            <label>Email</label>
            <input type="email" id="siEmail" placeholder="you@example.com">
          </div>
          <div class="auth-field">
            <label>Password</label>
            <input type="password" id="siPassword" placeholder="••••••••">
          </div>
          <button class="auth-submit" onclick="window.__authModal.signIn()">Sign In →</button>
          <p class="auth-error"  id="siError"></p>
          <p class="auth-success" id="siSuccess"></p>
        </div>

        <!-- SIGN UP FORM -->
        <div id="formSignUp" style="display:none;">
          <div class="auth-field">
            <label>Email</label>
            <input type="email" id="suEmail" placeholder="you@example.com">
          </div>
          <div class="auth-field">
            <label>Password</label>
            <input type="password" id="suPassword" placeholder="At least 6 characters">
          </div>
          <button class="auth-submit" onclick="window.__authModal.signUp()">Create Account →</button>
          <p class="auth-error"   id="suError"></p>
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

      <!-- LOGGED IN VIEW -->
      <div id="authLoggedIn">
        <p>Signed in as<br><strong id="authUserEmail"></strong></p>
        <button class="auth-signout" onclick="window.__authModal.signOut()">Sign Out</button>
      </div>

    </div>
  </div>
  `;

  document.body.insertAdjacentHTML("beforeend", html);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTH MODAL CONTROLLER
// Exposed globally as window.__authModal so non-module scripts can call it
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// pendingCallback: a function to run after the user successfully logs in
// (e.g. open the post modal, proceed to dashboard, etc.)
let pendingCallback = null;

window.__authModal = {

  // Opens the modal. Pass a callback to run after login.
  open(callback) {
    pendingCallback = callback || null;
    document.getElementById("authModal").classList.add("open");
    this._refreshView();
  },

  close() {
    document.getElementById("authModal").classList.remove("open");
  },

  handleOverlay(e) {
    if (e.target === document.getElementById("authModal")) this.close();
  },

  switchTab(tab) {
    const isSignIn = tab === "signin";
    document.getElementById("formSignIn").style.display = isSignIn ? "block" : "none";
    document.getElementById("formSignUp").style.display = isSignIn ? "none"  : "block";
    document.getElementById("tabSignIn").classList.toggle("active",  isSignIn);
    document.getElementById("tabSignUp").classList.toggle("active", !isSignIn);
  },

  // Refreshes the modal to show logged-in vs logged-out view
  async _refreshView() {
    const user = await getUser();
    const forms    = document.getElementById("authForms");
    const loggedIn = document.getElementById("authLoggedIn");
    if (user) {
      forms.style.display    = "none";
      loggedIn.style.display = "block";
      document.getElementById("authUserEmail").textContent = user.email;
    } else {
      forms.style.display    = "block";
      loggedIn.style.display = "none";
    }
  },

  async signIn() {
    const email    = document.getElementById("siEmail").value.trim();
    const password = document.getElementById("siPassword").value;
    const errEl    = document.getElementById("siError");
    errEl.style.display = "none";

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      errEl.textContent    = error.message;
      errEl.style.display  = "block";
      return;
    }
    this._onSuccess();
  },

  async signUp() {
    const email    = document.getElementById("suEmail").value.trim();
    const password = document.getElementById("suPassword").value;
    const errEl    = document.getElementById("suError");
    const sucEl    = document.getElementById("suSuccess");
    errEl.style.display = "none";
    sucEl.style.display = "none";

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      errEl.textContent   = error.message;
      errEl.style.display = "block";
      return;
    }
    // Supabase sends a confirmation email before the session activates
    sucEl.textContent   = "Check your email to confirm your account!";
    sucEl.style.display = "block";
  },

  async googleSignIn() {
    // redirectTo sends the user back to the current page after Google auth
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href }
    });
  },

  async signOut() {
    await supabase.auth.signOut();
    this._refreshView();
    updateNavBtn(null);
  },

  _onSuccess() {
    this.close();
    if (pendingCallback) {
      pendingCallback();
      pendingCallback = null;
    }
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NAV BUTTON — updates top-right corner
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function updateNavBtn(user) {
  const btn = document.getElementById("navUserBtn");
  if (!btn) return;
  if (user) {
    // Show first part of email e.g. "damir@..." → "damir"
    const name = user.email.split("@")[0];
    btn.textContent = "👤 " + name;
    btn.classList.add("signed-in");
  } else {
    btn.textContent = "Sign In";
    btn.classList.remove("signed-in");
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GATE FUNCTION — export this and call it
// wherever a login is required before an action.
//
// Usage:
//   import { requireAuth } from "./supabase-auth.js";
//   requireAuth(() => openPostModal());
//
// If the user is already logged in, runs the callback immediately.
// If not, opens the auth modal and queues the callback for after login.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function requireAuth(callback) {
  const user = await getUser();
  if (user) {
    callback();
  } else {
    window.__authModal.open(callback);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INIT — runs on every page this file is loaded on
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

injectAuthModal();

// Keep nav button and modal in sync with auth state at all times
onAuthChange((user) => {
  updateNavBtn(user);
  // If modal is open and user just logged in, close it and fire callback
  const modal = document.getElementById("authModal");
  if (modal?.classList.contains("open") && user) {
    window.__authModal._onSuccess();
  }
});
