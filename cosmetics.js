// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// cosmetics.js — shared cosmetics engine
// Inject CSS globally, expose apply helpers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { supabase } from "./supabase-auth.js";

// ── Inject animation CSS once per page ──
(function injectCSS() {
  if (document.getElementById("cosmetics-global-css")) return;
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
  ib_gold:    { border: "2px solid #ffcc00", shadow: "0 0 10px #ffcc0077" },
  ib_violet:  { border: "2px solid #9b59b6", shadow: "0 0 10px #9b59b677" },
  ib_red:     { border: "2px solid #e74c3c", shadow: "0 0 10px #e74c3c77" },
  ib_rainbow: { border: "2px solid #ff69b4", shadow: "0 0 10px #ff69b477" },
  ib_glitch:  { border: "2px solid #00ff00", shadow: "0 0 10px #00ff0077" },
};
export const FONT_MAP = {
  cf_lime:    "#39d353",
  cf_orange:  "orange",
  cf_violet:  "#9b59b6",
  cf_red:     "#e74c3c",
  cf_rainbow: "#ff69b4",
  cf_glitch:  "#00ff00",
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
  bn_dark:   "#050505",
  bn_cipher: "linear-gradient(135deg,#0a0a18,#050510)",
  bn_arg:    "repeating-linear-gradient(0deg,#0a0a0a 0,#0a0a0a 2px,#111 2px,#111 4px)",
  bn_violet: "linear-gradient(135deg,#1a0030,#000)",
  bn_gold:   "linear-gradient(135deg,#1a1000,#2a1800)",
};
export const BG_MAP = {
  bg_stars:  "radial-gradient(ellipse at center,#0a0a1a 0%,#000 100%)",
  bg_matrix: "#001100",
  bg_void:   "#000",
  bg_cipher: "#080808",
  bg_glitch: "linear-gradient(45deg,#0a000a,#000a0a)",
  bg_sunset: "linear-gradient(135deg,#1a0030,#1a0800)",
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
    if (category === "profile-hat"   && HAT_MAP[item_id])    c.hat    = HAT_MAP[item_id];
    if (category === "animated"      && ANIM_MAP[item_id])   c.anim   = ANIM_MAP[item_id];
    if (category === "banner"        && BANNER_MAP[item_id]) c.banner = BANNER_MAP[item_id];
    if (category === "background"    && BG_MAP[item_id])     c.bg     = BG_MAP[item_id];
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
  if (c.border) {
    avatarEl.style.border    = c.border.border;
    avatarEl.style.boxShadow = c.border.shadow;
  }
  if (c.anim) avatarEl.classList.add(c.anim);
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
  if (c.font) nameEl.style.color = c.font;
}

// For name-only contexts (no avatar): prepend hat emoji to the text node.
export function applyHatToName(userId, nameEl) {
  const c = _cache[userId];
  if (!c || !nameEl || !c.hat || nameEl.dataset.hatDone) return;
  nameEl.textContent       = c.hat + " " + nameEl.textContent;
  nameEl.dataset.hatDone   = "1";
}

// Apply everything to a full profile card.
// Pass elements as an object — any can be null/undefined and will be skipped.
export function applyToCard(userId, { bannerEl, containerEl, avatarEl, nameEl } = {}) {
  const c = _cache[userId];
  if (!c) return;
  if (bannerEl    && c.banner) bannerEl.style.background    = c.banner;
  if (containerEl && c.bg)     containerEl.style.background = c.bg;
  if (avatarEl)  applyToAvatar(userId, avatarEl);
  if (nameEl)    applyToName(userId, nameEl);
}

// Convenience: fetch then apply to avatar + name elements tagged with data-uid.
export async function applyByUid(userId) {
  await prefetchCosmetics([userId]);
  document.querySelectorAll(`.msg-avatar[data-uid="${userId}"]`).forEach(el => applyToAvatar(userId, el));
  document.querySelectorAll(`.msg-author[data-uid="${userId}"]`).forEach(el => applyToName(userId, el));
}
