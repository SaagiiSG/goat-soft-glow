# /// script
# requires-python = ">=3.10,<3.13"
# dependencies = ["pillow>=10.4", "numpy>=1.26"]
# ///
"""Soft Glow · Зөөлөн гэрэл.

A bright, creamy, softly glowing picture with lifted shadows and warm skin, a slow 3% drift on every shot,
cream fades between shots, and cream title cards whose thin italic serif words blur in.
Usage: uv run render.py plan.json
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import goatcut as g  # noqa: E402
from PIL import Image, ImageFilter, ImageOps  # noqa: E402

NAME = "soft-glow"
# The bloom is blurred at quarter size (sigma 10 there = 40 at full size), which is much faster.
SOFTEN = ("eq=contrast=0.88:saturation=0.85:gamma=1.05,colorbalance=rm=0.03:bm=-0.02,curves=master='0/0.08 0.3/0.38 0.6/0.66 0.85/0.86 1/0.93',"
          "split[sg][sb];[sb]scale=270:480,gblur=sigma=10,scale=1080:1920[sl];[sg][sl]blend=all_mode=screen:all_opacity=0.18")
CREAM = (251, 248, 243)
COCOA, LATTE = (74, 63, 56), (122, 107, 96)
DRIFT = 0.03          # every shot drifts in 3%, at most that fast as over 4 s
DIP = 0.35            # each cut fades to cream and back over 2 x this
PAD = 24              # room around words for the blur-in
DARK, TARGET = 80, 125  # a clip darker than DARK (mean 0-255) is lifted toward TARGET
SERIF, SANS = "CormorantGaramond-Italic[wght].ttf", "Manrope[wght].ttf"


def GRADE(ctx):
    # gentle by default; dark clips get an extra lift per clip in frame(), so bright ones don't blow out
    e = ctx.opt("exposure", 0.15)
    if isinstance(e, bool) or not isinstance(e, (int, float)) or not 0 <= e <= 1.5:
        g.die("look.exposure must be a number from 0 to 1.5 (default 0.15; really dark clips are lifted automatically)")
    return f"exposure=exposure={e},{SOFTEN}"


def setup(ctx):
    ctx.cream = Image.new("RGB", (g.W, g.H), CREAM)
    ctx.lifts = {}
    ctx.cards = ctx.texts("title") + ctx.texts("sub")


def SFX(ctx):
    # a soft shimmer as each title's words come into focus
    return [{"sound": "shimmer", "at": x.get("start", 0) + 0.5, "volume": 0.8} for x in ctx.texts("title")]


def ends(ctx, item):
    return item.get("end", ctx.dur) >= ctx.dur - 0.05


def word_sprite(ctx, role, text, blur):
    if blur:
        sharp = ctx.cache((role, text, 0), lambda: word_sprite(ctx, role, text, 0))
        return sharp.filter(ImageFilter.GaussianBlur(blur))
    if role == "title":
        f = ctx.fit(text, SERIF, 860, 124, axes={"wght": 300})
        s = g.text_sprite(text, f, fill=COCOA + (255,))
        col = COCOA
    else:
        text = text.upper()
        f = ctx.fit(text, SANS, 840, 34, axes={"wght": 300}, tracking=0.32)
        s = g.text_sprite(text, f, fill=LATTE + (255,), tracking=0.32)
        col = LATTE
    return ImageOps.expand(s, PAD, fill=col + (0,))  # transparent border in the text colour, so blur stays clean


def lift(ctx, i, img):
    """Lift a clip that is really dark (night, dim room); leave the rest alone. Measured once per clip.
    Only clearly dark clips: an average fooled by dark clothes would blow out the face."""
    if i not in ctx.lifts:
        m = max(8, sum(img.convert("L").resize((54, 96)).getdata()) / (54 * 96))
        gamma = g.clamp(math.log(TARGET / 255) / math.log(m / 255), 0.6, 1.0) if m < DARK else 1.0
        ctx.lifts[i] = None if gamma > 0.97 else [round(255 * (v / 255) ** gamma) for v in range(256)] * 3
    return img.point(ctx.lifts[i]) if ctx.lifts[i] else img


def frame(img, t, ctx):
    i, lt = ctx.clip_at(t)
    img = lift(ctx, i, img)
    z = 1 + DRIFT * lt / max(ctx.clips[i]["dur"], 4)
    cw, ch = g.W / z, g.H / z
    img = img.resize((g.W, g.H), Image.BILINEAR, box=((g.W - cw) / 2, (g.H - ch) / 2, (g.W + cw) / 2, (g.H + ch) / 2))

    d = min([abs(t - c) for c in ctx.cuts[1:]] or [1])
    # a card that runs to the end stays up: the video ends on it
    a = max(1 - d / DIP, 1 - t / 0.6, 1 - (ctx.dur - t) / 0.8,
            *(g.fade(t, x, 0.8, 0 if ends(ctx, x) else 0.8) for x in ctx.cards))
    if a > 0:
        img = Image.blend(img, ctx.cream, min(a, 1))

    canvas = img.convert("RGBA")
    for role, y, anchor in (("title", 760 + PAD, "mb"), ("sub", 800 - PAD, "mt")):
        for item in ctx.active(t, role)[-1:]:
            s, e = item.get("start", 0), item.get("end", ctx.dur)
            come = g.clamp((t - s - 0.5) / 0.7)  # words arrive once the cream is mostly in, blurred to sharp
            blur = round(8 * (1 - come) * 2) / 2
            sp = ctx.cache((role, item["text"], blur), lambda: word_sprite(ctx, role, item["text"], blur))
            out = 1 if ends(ctx, item) else g.clamp((e - 0.2 - t) / 0.6)
            g.paste(canvas, sp, 540, y, min(come, out), anchor=anchor)
    return canvas


if __name__ == "__main__":
    g.run(sys.modules[__name__])
