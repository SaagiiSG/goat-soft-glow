// 05 Soft Glow: full-screen clips made bright, creamy and softly glowing (lifted shadows, low contrast,
// warm skin, a screen-blended bloom, all baked by ffmpeg in prep; really dark clips get an extra lift).
// Every shot drifts in slowly, cuts fade through cream, and cream title cards carry thin italic serif
// titles and widely spaced small subs that blur into focus.
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { missing } from "./scripts/fonts.mjs";
import { ffmpeg } from "./scripts/media.mjs";
await import("./scripts/goat-lib.js"); // GOAT.spaced, the same one the template uses

export const NAME = "soft-glow";
export const TALKS = false;

const SKILL_DIR = dirname(fileURLToPath(import.meta.url));
const FONTS = { title: ["CormorantGaramond-Italic[wght].ttf", "Cormorant Garamond"], sub: ["Manrope[wght].ttf", "Manrope"] };
// The v1 grade: gentle exposure, low contrast, less saturation, warm, lifted blacks and soft highlights, then
// the bloom: the picture blurred at quarter size (sigma 10 there = 40 at full size) and screen-blended at 18%.
const SOFTEN = "eq=contrast=0.88:saturation=0.85:gamma=1.05,colorbalance=rm=0.03:bm=-0.02," +
  "curves=master='0/0.08 0.3/0.38 0.6/0.66 0.85/0.86 1/0.93'";
const DARK = 80, TARGET = 125; // a clip darker than DARK (mean 0-255) is lifted toward TARGET
const SAMPLES = 5; // frames measured per video clip
// Longest row that fits the safe box (840 px) at the smallest regular size, from HarfBuzz widths at weight 300.
// Title (Cormorant italic): real mixed Mongolian runs 0.37-0.44 em a letter, so 24 letters fit at 79 px;
// rows of capitals (0.63 em) go to about 55 px. Sub (Manrope capitals + 0.32 em spacing): 0.84-0.96 em a
// letter, so 28 fit at 30 px. look.js holds the sizes and the floors that make any allowed row fit.
const ROW = { title: 24, sub: 28 };
const ROWS = 2;
const DRIFT = 0.03; // every shot drifts in 3%, at most that fast as over 4 s
const DIP = 0.35, OPEN = 0.6, CLOSE = 0.8; // cream: each way at a cut, the fade in, the fade out
const CARD_MIN = 2; // words in focus 1.2 s after a card starts, fading from 0.8 s before it ends
// Clean footage between two cream events (a dip, a card, the fade in or out). With less, the shot between
// them shows for a blink and reads as a flicker; with the sine ramps' near-clean ends it shows about 1 s.
const CLEAR = 0.8;
const FIRST = 1 / 30;
const EPS = 1e-9;

const isNum = (n) => typeof n === "number" && Number.isFinite(n);
const r3 = (n) => Math.round(n * 1000) / 1000;

function exposure(plan) {
  const e = plan.look?.exposure ?? 0.15;
  if (!isNum(e) || e < 0 || e > 1.5)
    throw new Error("look exposure must be a number from 0 to 1.5 (default 0.15; really dark clips are lifted automatically)");
  return e;
}

export function validate(plan) {
  exposure(plan);
  for (const t of plan.texts ?? []) {
    if (!FONTS[t.role]) throw new Error(`text role "${t.role}" is not used by this look. Use "title" or "sub".`);
    const text = String(t.text ?? "");
    if (!text.trim()) throw new Error(`a "${t.role}" text is empty`);
    if (t.start !== undefined && !(isNum(t.start) && t.start >= 0)) throw new Error(`"${text}": "start" must be seconds, 0 or more`);
    if (t.end !== undefined && !(isNum(t.end) && t.end > Number(t.start ?? 0))) throw new Error(`"${text}" must end after it starts`);
    // subs are drawn in capitals, so they are measured and checked that way
    const drawn = (x) => (t.role === "sub" ? x.toUpperCase() : x);
    const rows = text.split("\n");
    if (rows.some((r) => !r.trim())) throw new Error(`"${text}" has an empty row: remove the extra \\n`);
    if (rows.length > ROWS) throw new Error(`"${text}" has ${rows.length} rows: a ${t.role} takes ${ROWS} rows at most`);
    for (const row of rows)
      if ([...drawn(row.trim())].length > ROW[t.role])
        throw new Error(`"${row.trim()}" is too long for one ${t.role} row (${ROW[t.role]} characters at most): ` +
          "shorten it, or split it into 2 rows with \\n");
    const [file, name] = FONTS[t.role];
    const bad = missing(drawn(text), join(SKILL_DIR, "fonts", file));
    if (bad.length) throw new Error(`"${text}" uses ${bad.join(" ")}, which ${name} can't draw`);
  }
}

// The gamma that lifts a clip of this mean brightness toward TARGET, or null when it isn't really dark.
// Only clearly dark clips: an average fooled by dark clothes would blow out the face.
export function liftGamma(mean) {
  if (mean >= DARK) return null;
  const m = Math.max(8, mean);
  return Math.min(1, Math.max(0.6, Math.round((Math.log(TARGET / 255) / Math.log(m / 255)) * 1e4) / 1e4));
}

// Mean brightness (0-255) of a clip, from a few frames spread through it (one frame for a photo), in one
// ffmpeg run that seeks to each instead of decoding the whole clip.
// shortcut: measures the whole source frame, not the cx/cy crop; a wide clip with a dark side may be judged off.
export async function brightness(clip) {
  const ts = clip.still ? [null] : Array.from({ length: SAMPLES }, (_, k) => clip.start + (clip.dur * (k + 0.5)) / SAMPLES);
  const args = ts.flatMap((t) => [...(t === null ? [] : ["-ss", t.toFixed(3), "-t", "0.1"]), "-i", clip.path]);
  const graph = ts.map((_, k) => `[${k}:v]scale=54:96,format=gray[m${k}]`).join(";") + ";" +
    ts.map((_, k) => `[m${k}]`).join("") + `concat=n=${ts.length}:v=1:a=0,signalstats,` +
    "metadata=print:key=lavfi.signalstats.YAVG:file=-";
  const r = await ffmpeg([...args, "-filter_complex", graph, "-f", "null", "-"], "measure how bright a clip is");
  const ys = [...r.stdout.matchAll(/YAVG=([\d.]+)/g)].map((m) => Number(m[1]));
  return ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : 255; // nothing read: treat as bright, no lift
}

// Once per clip: the dark-clip lift (if any), then the v1 grade and bloom at the look's exposure. Labels carry
// the clip's index: every clip's chain sits in one filter graph.
export async function clipFilter(clip, ctx) {
  const e = exposure(ctx.plan);
  const g = liftGamma(await brightness(clip));
  const i = clip.index, a = `sg${i}a`, b = `sg${i}b`, l = `sg${i}l`;
  return (g ? `lutrgb=r=gammaval(${g}):g=gammaval(${g}):b=gammaval(${g}),` : "") +
    `exposure=exposure=${e},${SOFTEN},split[${a}][${b}];` +
    `[${b}]scale=270:480,gblur=sigma=10,scale=1080:1920[${l}];[${a}][${l}]blend=all_mode=screen:all_opacity=0.18`;
}

// Each shot drifts in from 1 to `to` over its length: 3% over 4 s, or over the shot if it is longer.
export function drifts(cuts, dur) {
  return cuts.map((at, i) => {
    const len = r3((cuts[i + 1] ?? dur) - at);
    return { at, len, to: Math.round((1 + (DRIFT * len) / Math.max(4, len)) * 1e5) / 1e5 };
  }).filter((d) => d.len > EPS);
}

// Title and sub cards. One of each role at a time: a later one ends the one before. A card that ends in
// the last 0.8 s stays up, so the video ends on it (its cream would otherwise fight the fade out).
// Words come into focus from start + 0.5 to + 1.2 and fade from end - 0.8 to - 0.2, so a card needs 2 s
// to be read sharp at all. Each card's cream: one span per run of cards less than CLEAR apart (the cream stays
// up between them), in over 0.8 s, out over 0.8 s.
export function cards(texts, dur) {
  const words = [];
  for (const role of ["title", "sub"]) {
    const list = texts.filter((t) => t.role === role).sort((a, b) => (a.start ?? 0) - (b.start ?? 0));
    list.forEach((t, i) => {
      const start = t.start ?? 0;
      let end = Math.min(t.end ?? dur, list[i + 1]?.start ?? dur, dur);
      const stays = end >= dur - CLOSE - EPS;
      if (stays) end = dur;
      if (end - start < CARD_MIN - EPS)
        throw new Error(`"${t.text}" shows for ${(end - start).toFixed(2)} s: a ${role} needs ${CARD_MIN} s at least ` +
          `(1.2 s to come into focus, 0.8 s to leave). Move its start or end${list[i + 1] ? `, or the next ${role}'s start` : ""}.`);
      words.push({ role, text: String(t.text), start, end, stays });
    });
  }
  const spans = [];
  for (const w of [...words].sort((a, b) => a.start - b.start)) {
    const last = spans.at(-1);
    if (last && w.start < last.end + CLEAR - EPS) last.end = Math.max(last.end, w.end);
    else spans.push({ start: w.start, end: w.end });
  }
  return { words, spans: spans.map((s) => ({ ...s, stays: s.end >= dur - EPS })) };
}

// A cream dip at a cut: 0.35 s to cream, 0.35 s back, so it hides the cut. One slow pulse; two never overlap,
// so a cut less than 0.7 s after the last dip cuts straight (very short shots never stack into a strobe).
// None on frame 0, and none within CLEAR of the fade in, the fade out or a card's cream (a card already hides
// the cuts under it): those cut straight.
export function dipTimes(cuts, dur, spans = []) {
  return GOAT.spaced(cuts.filter((c) => c - DIP >= OPEN + CLEAR - EPS && c + DIP <= dur - CLOSE - CLEAR + EPS &&
    spans.every((s) => c + DIP <= s.start - CLEAR + EPS || c - DIP >= s.end + CLEAR - EPS)), 2 * DIP);
}

export async function prepare(ctx) {
  const cuts = ctx.cuts.length ? ctx.cuts : [0];
  const { words, spans } = cards(ctx.plan.texts ?? [], ctx.dur);
  return { drifts: drifts(cuts, ctx.dur), dips: dipTimes(cuts, ctx.dur, spans), spans, words };
}

// About 30% of v1's 0.8 (Saagii, 16 Nov: "bring the sounds effects down a bit"); members raise it with
// "sfx": {"volume": …}. A title already up on frame 0 doesn't come into focus, so it gets none. Titles are 2 s apart
// at least (CARD_MIN), so two shimmers never come within 0.5 s.
export function sfx(plan, ctx) {
  return cards(plan.texts ?? [], ctx.dur).words.filter((w) => w.role === "title" && w.start >= FIRST)
    .map((w) => ({ sound: "shimmer", at: r3(w.start + 0.5), volume: 0.24 }));
}
