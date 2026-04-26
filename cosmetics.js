// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// cosmetics.js — shared cosmetics engine
// Inject CSS globally, expose apply helpers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { supabase } from "./supabase-auth.js";

// ── Inject animation CSS once per page ──
(function injectCSS() {
  // supabase-auth.js already injects this CSS on every page — skip if present
  if (document.getElementById("cosmetics-global-css") || document.getElementById("authModal")) return;
  const s = document.createElement("style");
  s.id = "cosmetics-global-css";
  s.textContent = `
    /* Hat above avatar */
    .cosmetic-hat {
      position: absolute;
      top: -16px; left: 50%;
      transform: translateX(-50%);
      font-size: 15px; line-height: 1;
      pointer-events: none; z-index: 2;
      white-space: nowrap;
    }

    /* ── PULSE ── slow glowing aura */
    @keyframes c-pulse {
      0%, 100% {
        box-shadow: 0 0 4px 1px rgba(255,255,255,0.12),
                    0 0 0   0   rgba(255,255,255,0.06);
      }
      50% {
        box-shadow: 0 0 18px 7px rgba(255,255,255,0.32),
                    0 0 32px 14px rgba(255,255,255,0);
      }
    }
    .c-anim-pulse { animation: c-pulse 2.6s ease-in-out infinite; }

    /* ── GHOST ── fades to near-invisible and back */
    @keyframes c-ghost {
      0%, 100% { opacity: 1; filter: none; }
      35% { opacity: 0.04; filter: blur(1.5px) brightness(0.2); }
      65% { opacity: 0.04; filter: blur(1.5px) brightness(0.2); }
    }
    .c-anim-ghost { animation: c-ghost 3.8s ease-in-out infinite; }

    /* ── STATIC ── CRT flicker with positional jitter */
    @keyframes c-static {
      0%          { filter: none; transform: none; }
      7%          { filter: brightness(2.8) saturate(0) contrast(5); transform: translate(1px, 0) scaleX(1.04); }
      8%          { filter: none; transform: none; }
      22%         { filter: brightness(0.3) contrast(2.5); }
      23%         { filter: none; }
      48%         { filter: saturate(0) brightness(2) contrast(4); transform: translate(-1px, 1px) scaleY(0.96); }
      49%         { filter: none; transform: none; }
      78%         { filter: brightness(2.2) contrast(5) saturate(0); transform: scaleY(1.04) scaleX(0.98); }
      79%         { filter: none; transform: none; }
      100%        { filter: none; transform: none; }
    }
    .c-anim-static { animation: c-static 0.95s steps(1) infinite; }

    /* ── FIRE ── orange/red glow that pulses like open flame */
    @keyframes c-fire {
      0%, 100% {
        box-shadow: 0 0  8px 3px #ff3300cc,
                    0 4px 20px 6px #ff550066,
                    0 -3px 10px 2px #ff880022;
        filter: brightness(1);
      }
      25% {
        box-shadow: 0 0 14px 5px #ff6600dd,
                    0 4px 28px 8px #ff770077,
                    0 -4px 14px 4px #ffaa0033;
        filter: brightness(1.15);
      }
      50% {
        box-shadow: 0 0  6px 2px #ff2200bb,
                    0 4px 16px 4px #ff440055,
                    0 -2px  8px 2px #ff660011;
        filter: brightness(0.95);
      }
      75% {
        box-shadow: 0 0 12px 4px #ff5500cc,
                    0 4px 24px 7px #ff660066,
                    0 -4px 12px 3px #ff990022;
        filter: brightness(1.1);
      }
    }
    .c-anim-fire { animation: c-fire 1.3s ease-in-out infinite; }

    /* ── MATRIX ── green code-rain tint that cascades in intensity */
    @keyframes c-matrix {
      0%   { filter: hue-rotate(95deg) saturate(7)  brightness(0.5) contrast(2.5); }
      20%  { filter: hue-rotate(95deg) saturate(12) brightness(1.1) contrast(4); }
      40%  { filter: hue-rotate(95deg) saturate(5)  brightness(0.3) contrast(2); }
      60%  { filter: hue-rotate(95deg) saturate(10) brightness(0.9) contrast(3.5); }
      80%  { filter: hue-rotate(95deg) saturate(6)  brightness(0.4) contrast(2.2); }
      100% { filter: hue-rotate(95deg) saturate(7)  brightness(0.5) contrast(2.5); }
    }
    .c-anim-matrix { animation: c-matrix 0.65s steps(1) infinite; }
  `;
  document.head.appendChild(s);
})();

// ── Visual lookup tables ──

export const BORDER_MAP = {
  ib_gold:    { borderClass: "c-brd-gold" },
  ib_violet:  { borderClass: "c-brd-violet" },
  ib_red:     { borderClass: "c-brd-red" },
  ib_rainbow: { borderClass: "c-brd-rainbow" },
  ib_glitch:  { borderClass: "c-brd-glitch" },
};
export const FONT_MAP = {
  cf_lime:    { color: "#39d353" },
  cf_orange:  { color: "orange" },
  cf_violet:  { color: "#9b59b6" },
  cf_red:     { color: "#e74c3c" },
  cf_rainbow: { fontClass: "c-font-rainbow" },
  cf_glitch:  { fontClass: "c-font-glitch" },
};
export const HAT_MAP = {
  ph_wizard:    "🧙",
  ph_crown:     "👑",
  ph_detective: "🕵️",
  ph_space:     "👨‍🚀",
  ph_anon:      "🎭",
};
export const ANIM_MAP = {
  an_pulse:  "c-anim-pulse",
  an_ghost:  "c-anim-ghost",
  an_static: "c-anim-static",
  an_fire:   "c-anim-fire",
  an_matrix: "c-anim-matrix",
};
export const BANNER_MAP = {
  bn_dark:     { bannerBg: "#050505" },
  bn_cipher:   { bannerBg: "linear-gradient(135deg,#0a0a18,#050510)" },
  bn_arg:      { bannerBg: "repeating-linear-gradient(0deg,#0a0a0a 0,#0a0a0a 2px,#111 2px,#111 4px)" },
  bn_violet:   { bannerBg: "linear-gradient(135deg,#1a0030,#000)" },
  bn_gold:     { bannerBg: "linear-gradient(135deg,#1a1000,#2a1800)" },
  bn_mh:       { bannerClass: "c-bn-mh" },
  bn_cassette: { bannerClass: "c-bn-cassette" },
  bn_spiral:   { bannerClass: "c-bn-spiral" },
  bn_aurora:   { bannerClass: "c-bn-aurora" },
  bn_ocean:    { bannerClass: "c-bn-ocean" },
};
export const BG_MAP = {
  bg_stars:  { bgClass: "c-bg-stars" },
  bg_matrix: { bgClass: "c-bg-matrix" },
  bg_void:   { cardBg: "#000" },
  bg_cipher: { bgClass: "c-bg-cipher" },
  bg_glitch: { bgClass: "c-bg-glitch" },
  bg_sunset: { bgClass: "c-bg-sunset" },
};

// Animation declaration values — needed to combine border + skin animations into one property
export const BORDER_ANIM = {
  'c-brd-rainbow': 'c-rainbow-brd 3s linear infinite',
  'c-brd-glitch':  'c-glitch-brd 0.4s steps(1) infinite',
};
export const SKIN_ANIM = {
  'c-anim-pulse':  'c-pulse 2.6s ease-in-out infinite',
  'c-anim-ghost':  'c-ghost 3.8s ease-in-out infinite',
  'c-anim-static': 'c-static 0.95s steps(1) infinite',
  'c-anim-fire':   'c-fire 1.3s ease-in-out infinite',
  'c-anim-matrix': 'c-matrix 0.65s steps(1) infinite',
};

// ── Cache ──
// userId → { border?, font?, hat?, anim?, banner?, bg? }
const _cache = {};

export async function prefetchCosmetics(userIds) {
  const uncached = [...new Set(userIds)].filter(id => id && !(id in _cache));
  if (!uncached.length) return;
  // Mark all as fetched immediately to prevent duplicate requests
  uncached.forEach(id => { _cache[id] = {}; });
  const { data } = await supabase
    .from("cosmetics_active")
    .select("user_id, item_id, category")
    .in("user_id", uncached);
  (data || []).forEach(({ user_id, item_id, category }) => {
    const c = _cache[user_id];
    if (!c) return;
    if (category === "icon-border"   && BORDER_MAP[item_id]) c.border = BORDER_MAP[item_id];
    if (category === "coloured-font" && FONT_MAP[item_id])   c.font   = FONT_MAP[item_id];
    if (category === "profile-hat"   && HAT_MAP[item_id])    { c.hat = HAT_MAP[item_id]; c._hatItemId = item_id; }
    if (category === "animated"      && ANIM_MAP[item_id])   c.anim   = ANIM_MAP[item_id];
    if (category === "banner"        && BANNER_MAP[item_id]) { c.bannerBg = BANNER_MAP[item_id].bannerBg || null; c.bannerClass = BANNER_MAP[item_id].bannerClass || null; }
    if (category === "background"    && BG_MAP[item_id])     c.bg     = BG_MAP[item_id];
  });
  // Normalise into flat fields for apply functions
  Object.values(_cache).forEach(c => {
    c._borderClass = c.border?.borderClass || null;
    c._bgClass     = c.bg?.bgClass        || null;
    c._cardBg      = c.bg?.cardBg         || null;
    c._fontClass   = c.font?.fontClass    || null;
    c._fontColor   = c.font?.color        || null;
  });
}

export async function fetchOneUser(userId) {
  await prefetchCosmetics([userId]);
  return _cache[userId] || {};
}

export function getCached(userId) {
  return _cache[userId] || null;
}

// ── Apply helpers ──

// Apply border + anim + hat to an avatar circle element.
// avatarEl's parent should be position:relative for the hat to position correctly.
export function applyToAvatar(userId, avatarEl) {
  const c = _cache[userId];
  if (!c || !avatarEl) return;
  if (c._borderClass) avatarEl.classList.add(c._borderClass);
  if (c.anim)         avatarEl.classList.add(c.anim);
  // When both a border animation and a skin animation are active, two classes would
  // each set `animation:` and the later one wins. Combine them into one declaration.
  const ba = c._borderClass ? BORDER_ANIM[c._borderClass] : null;
  const sa = c.anim          ? SKIN_ANIM[c.anim]           : null;
  if (ba && sa) avatarEl.style.animation = `${ba}, ${sa}`;
  if (c.hat) {
    const wrap = avatarEl.parentElement;
    if (wrap) {
      wrap.style.position = "relative";
      let hat = wrap.querySelector(".cosmetic-hat");
      if (!hat) { hat = document.createElement("div"); hat.className = "cosmetic-hat"; wrap.appendChild(hat); }
      hat.textContent = c.hat;
    }
  }
}

// Apply coloured font to a name/author text element.
export function applyToName(userId, nameEl) {
  const c = _cache[userId];
  if (!c || !nameEl) return;
  if (c._fontClass)  nameEl.classList.add(c._fontClass);
  else if (c._fontColor) nameEl.style.color = c._fontColor;
}

// For name-only contexts (no avatar): prepend hat emoji to the text node.
export function applyHatToName(userId, nameEl) {
  const c = _cache[userId];
  if (!c || !nameEl || !c.hat || nameEl.dataset.hatDone) return;
  nameEl.textContent       = c.hat + " " + nameEl.textContent;
  nameEl.dataset.hatDone   = "1";
}

// Apply everything to a full profile card.
export function applyToCard(userId, { bannerEl, containerEl, avatarEl, nameEl } = {}) {
  const c = _cache[userId];
  if (!c) return;
  if (bannerEl) {
    if (c.bannerClass) bannerEl.classList.add(c.bannerClass);
    else if (c.bannerBg) bannerEl.style.background = c.bannerBg;
  }
  if (containerEl) {
    if (c._bgClass) containerEl.classList.add(c._bgClass);
    else if (c._cardBg) containerEl.style.background = c._cardBg;
  }
  if (avatarEl)  applyToAvatar(userId, avatarEl);
  if (nameEl)    applyToName(userId, nameEl);
}

// ── Avatar URL cache (profile pictures) ──
const _avatarCache = {};

export async function prefetchAvatars(userIds) {
  const uncached = [...new Set(userIds)].filter(id => id && !(id in _avatarCache));
  if (!uncached.length) return;
  uncached.forEach(id => { _avatarCache[id] = null; });
  const { data } = await supabase.from("profiles").select("id, avatar_url").in("id", uncached);
  (data || []).forEach(r => { _avatarCache[r.id] = r.avatar_url || null; });
}

export function getAvatarUrl(userId) { return _avatarCache[userId] || null; }

// Convenience: fetch then apply to avatar + name elements tagged with data-uid.
export async function applyByUid(userId) {
  await prefetchCosmetics([userId]);
  document.querySelectorAll(`.msg-avatar[data-uid="${userId}"]`).forEach(el => applyToAvatar(userId, el));
  document.querySelectorAll(`.msg-author[data-uid="${userId}"]`).forEach(el => applyToName(userId, el));
}
