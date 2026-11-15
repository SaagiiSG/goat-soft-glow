// 05 Soft Glow. Reads window.PLAN (goat.mjs writes it; look.mjs works out every drift, dip and card)
// and builds one paused GSAP timeline.
const P = window.PLAN;
const $ = (s) => document.querySelector(s);
const tl = gsap.timeline({ paused: true });
const FIRST = 1 / 30;
const SOFT = "sine.inOut";

// Each shot drifts in slowly from its cut (3% over 4 s, or over the shot if it is longer); the next cut resets it.
for (const d of P.drifts)
  tl.fromTo("#drift", { scale: 1 }, { scale: d.to, duration: d.len, ease: "none", force3D: false, immediateRender: false }, d.at);

// A cream dip through each cut look.mjs kept: 0.35 s to cream, 0.35 s back. One slow pulse; two never overlap.
for (const c of P.dips) {
  tl.fromTo("#dip", { opacity: 0 }, { opacity: 1, duration: 0.35, ease: SOFT, immediateRender: false }, c - 0.35);
  tl.fromTo("#dip", { opacity: 1 }, { opacity: 0, duration: 0.35, ease: SOFT, immediateRender: false }, c);
}

// The video fades in from cream over 0.6 s, starting at half so frame 0 (the thumbnail) shows the footage,
// and fades out to cream over the last 0.8 s.
gsap.set("#open", { opacity: 0.5 });
tl.fromTo("#open", { opacity: 0.5 }, { opacity: 0, duration: 0.6, ease: SOFT, immediateRender: false }, 0);
tl.fromTo("#close", { opacity: 0 }, { opacity: 1, duration: 0.8, ease: SOFT, immediateRender: false }, Math.max(FIRST, P.dur - 0.8));

// Title cards: the cream comes in over 0.8 s and leaves over 0.8 s (a card running to the end stays up).
// A card from frame 0 is already up on the thumbnail.
for (const s of P.spans) {
  if (s.start < FIRST) gsap.set("#card", { opacity: 1 });
  else tl.fromTo("#card", { opacity: 0 }, { opacity: 1, duration: 0.8, ease: SOFT, immediateRender: false }, s.start);
  if (!s.stays) tl.fromTo("#card", { opacity: 1 }, { opacity: 0, duration: 0.8, ease: SOFT, immediateRender: false }, s.end - 0.8);
}

// The words blur into focus from 8 px once the cream is mostly in (start + 0.5, over 0.7 s) and fade before
// the cream leaves (end - 0.8, over 0.6 s). Words from frame 0 are already sharp; a card at the end stays.
const els = P.words.map((w) => {
  const el = $("#words").appendChild(document.createElement("div"));
  el.className = w.role;
  for (const row of w.text.split("\n")) el.appendChild(document.createElement("div")).textContent = row.trim();
  gsap.set(el, { xPercent: -50 });
  if (w.start < FIRST) gsap.set(el, { opacity: 1 });
  else tl.fromTo(el, { opacity: 0, filter: "blur(8px)" },
    { opacity: 1, filter: "blur(0px)", duration: 0.7, ease: "sine.out", immediateRender: false }, w.start + 0.5);
  if (!w.stays) tl.fromTo(el, { opacity: 1 }, { opacity: 0, duration: 0.6, ease: "sine.in", immediateRender: false }, w.end - 0.8);
  return { el, role: w.role, rows: el.children.length };
});

tl.set({}, {}, P.dur);
window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;

// Sizes need the real fonts; the renderer waits for document.fonts.ready before the first frame.
// Title: Cormorant at line-height 1.05 puts a row's baseline 0.8435 em below its top (ascent 0.924, descent
// 0.287); the last baseline sits on y 864, where the preview card has it, and a second row grows upward.
// Sub: Manrope at line-height 1.5 puts the cap top 0.413 em below the row's top (baseline 1.133 em, caps
// 0.72 em); the first cap top sits on y 917, the preview's, and a second row grows downward.
// GOAT.fit sizes both to the safe box (840 px wide). validate's row limits keep real rows at 79 px or more
// (title) and 30 px or more (sub). The floors fit any allowed row: 24 of Cormorant's widest glyphs (1.09 em)
// make 786 px at 30 px; 28 of Manrope's (‰, 1.32 em + 0.32 em spacing) plus the padding make 832 px at 18 px.
function layout() {
  for (const w of els) {
    if (w.role === "title") {
      const s = GOAT.fit(w.el, 840, 124, 30);
      w.el.style.top = `${864 - ((w.rows - 1) * 1.05 + 0.8435) * s}px`;
    } else {
      const s = GOAT.fit(w.el, 840, 40, 18);
      w.el.style.top = `${917 - 0.413 * s}px`;
    }
  }
}
layout();
document.fonts.ready.then(layout);
