---
name: goat-soft-glow
description: Soft Glow · Зөөлөн гэрэл. Edits the user's phone clips into a bright, creamy, softly glowing full-screen video with lifted shadows, warm skin, a slow drift on every shot, cream fades between shots and cream title cards with thin italic serif Mongolian words that blur into focus. Renders a 1080x1920 MP4 for Reels/TikTok. Best for skincare, lash and brow, spa and massage, aesthetic clinics, dentists and women's wellness coaches. Use whenever the user wants a soft, dreamy, glowy, clean, premium beauty or "зөөлөн гэрэлтэй" look, or types /goat-soft-glow, /зөөлөн, or says "зөөлөн гэрэлтэй болгоод өг", "гоо сайхны видео шиг хий", "make it soft and glowy", "clean beauty look", even if they don't name the skill.
---

# Soft Glow · Зөөлөн гэрэл

A bright, creamy, softly glowing picture with lifted shadows and warm skin. Every shot drifts in slowly, cuts fade through cream, and title cards fade the screen to cream while thin italic serif words blur into focus. It is the only GOAT look that is brighter and softer than real life, with no grain, no black and no hard edges.

**Good for:** skincare, lash and brow, spa and massage, aesthetic clinics, dentists, women's wellness coaches. Use it for the room and the skin.
**Not for:** barbers, cars, men's gyms. For nails and hair colour, never use it on the result shot: brightening and lower saturation shift polish and dye colours. If the user's footage is one of these, say so and suggest another GOAT look.

Talk to the user in the language they write in (usually Mongolian). Keep messages short and plain; many users are not technical. `SKILL_DIR` means this skill's base directory (shown when the skill loads). Run commands from the user's project folder with absolute paths into `SKILL_DIR`.

## 1. Setup check (first time on a machine)

Run `ffmpeg -version` and `uv --version`. If either is missing, show the install command and ask before installing (it is their computer):
- Mac: `brew install ffmpeg uv`
- Windows: `winget install Gyan.FFmpeg` and `winget install astral-sh.uv`, then close and reopen the terminal.

The first render downloads a small Python package (Pillow) once. After that it is instant.

## 2. Collect the clips and words

Make `raw/` and `output/` in the current folder. Ask for:
1. **The clips.** Drag them into the chat or copy them into `raw/`. Best filmed in soft window light against a clean background, subject in the centre, camera held gently. Photos work too.
2. **The words:** a title of 1–3 words for each card (e.g. "Зөөлөн арьс") and, if they want, a small line under it (a service name, or booking phone, e.g. "Арьс арчилгаа"). Never invent a price, phone number or date. Ask.

If this folder was already edited with `goat-video-editor`, use `output/cut.mp4` as the clip and `transcript/cut_words.json` for word times.

Then run: `uv run SKILL_DIR/scripts/goatcut.py probe raw/*`
It prints each file's size, length, whether it has sound, whether it is HDR, and `speech` spans (when someone is talking). Use these to pick shots and time the words. If a clip is HDR, warn the user: this bright look shows HDR wash-out first.

## 3. Write plan.json

Write `plan.json` in the project folder. Paths are relative to it.

```json
{
  "output": "output/soft-glow.mp4",
  "clips": [
    {"src": "raw/IMG_0412.MOV", "in": 1.0, "out": 4.5},
    {"src": "raw/IMG_0415.MOV", "in": 0.0, "out": 4.0, "cy": 0.4},
    {"src": "raw/room.jpg", "dur": 3.5}
  ],
  "texts": [
    {"role": "title", "text": "Зөөлөн арьс", "start": 2.6, "end": 5.0},
    {"role": "sub", "text": "Арьс арчилгаа", "start": 2.85, "end": 5.0}
  ],
  "music": {"src": "raw/song.mp3", "volume": 0.25},
  "look": {"exposure": 0.15}
}
```

**clips** play in order. `in`/`out` trim a video (seconds); `dur` sets how long a photo shows. `cx`/`cy` (0–1, default 0.5) choose which part of a wide frame the phone screen keeps. Add `"sound": false` to mute one clip.
**texts:** a `title` or `sub` turns the screen into a cream title card for as long as it shows: the cream fades in over 0.8 s, then the words blur into focus, and at the end the cream fades back out to the footage. The footage is hidden behind the card, so place cards across a cut or at the start or end, and keep them 2–3 s. A card whose `end` is the end of the video stays up, so the video ends on it.
- `title`: thin italic serif (Cormorant Garamond Italic Light), dark cocoa, large, in the upper middle of the screen. Long words shrink to fit.
- `sub`: small, widely spaced capitals (Manrope Light, latte brown) just under the title. Written in capitals automatically. Start it about 0.25 s after the title. A price or booking phone can go here; it sits inside the area no app buttons cover.
Only one of each shows at a time.
**Auto sound effects:** a soft shimmer as each title's words come into focus.
**look** options:
- `exposure`: how much the whole video is brightened, 0 to 1.5. Default `0.15`. Really dark clips are lifted automatically and the grade keeps highlights from clipping, so most videos never need it. If the check frames look dull, try `0.4`; if skin or white walls turn flat white, try `0`.

**Timing:** hold each shot 3–4 s. Slow is the point. The video fades in from cream over 0.6 s, every cut fades through cream (0.35 s out, 0.35 s in), and the end fades to cream over 0.8 s. Shots shorter than 1 s make the cream flicker, so don't use them.

Before rendering, tell the user the plan in plain words (shot list + the cards) and ask "OK?". This is the only approval needed.

<!-- audio: this section is copied from core/skill-audio.md by build.py; edit it there -->
## Sound effects, voice-over and music

**Sound effects are on by default.** The look adds its own (see "Auto sound effects" above). They are made in code, so there's nothing to license, and they sit quietly under the voice.
- Turn them off: `"sfx": false`. Make them quieter or louder: `"sfx": {"volume": 0.6}`.
- Add one: `"sfx": {"add": [{"sound": "ding", "at": 4.2}]}`. Sounds: whoosh, swish, pop, click, type, shutter, boom, thud, hit, riser, ding, notify, shimmer, paper, tape, marker, projector, tick. `type`, `marker`, `projector` and `riser` also take `"dur"` in seconds; a riser should end on the moment it builds to.
- Let the user hear one render before adding more. Too many sounds feel cheap.

**Voice-over.** If the user wants to talk over the video, ask them to record it on their phone (a voice memo is fine: m4a, mp3 or wav) and copy it into `raw/`. Then add `"voiceover": {"src": "raw/vo.m4a", "at": 0.5}` (`at` = when it starts; optional `"volume"`). While the voice plays, the clips' own sound and the music dip automatically. Run `goatcut.py probe raw/vo.m4a` to get its `speech` spans and time the words on screen to them. The clips must add up to at least the voice-over's length (the render warns if not). Recording tips for the user: a small quiet room (a parked car or a wardrobe works), phone about 20 cm from the mouth, read the script out loud once before recording.

**Music.** `"music": {"src": "raw/song.mp3", "volume": 0.25}`. Only use music the user has the rights to. Music added inside the Instagram/TikTok app is the safe choice, so suggest that first.
<!-- /audio -->

## 4. Render and check

`uv run SKILL_DIR/scripts/render.py plan.json`

A 30 s video takes about 70 s. Then look at three frames before saying it is done:
`ffmpeg -y -loglevel error -ss 2 -i output/soft-glow.mp4 -frames:v 1 output/check-1.jpg` (and two more times, one during a title card). Read them. Check that words are not cut off, faces are in frame (fix with `cy`), and skin still shows detail (if it is flat white, lower `exposure`).

If a render fails twice, stop and explain the error in plain words. Don't loop.

## 5. Hand over

Tell the user where the file is (`output/soft-glow.mp4`) and that it is ready to post. Captions and music can be added in the Instagram/TikTok app.

## Rules

- Keep the proof real: use Soft Glow for the room and the skin, not for a colour result (nail shade, hair dye).
- Anything the viewer must read goes on a title card (`title` or `sub`), which sits inside the area no app buttons cover.
- Use only the fonts bundled in `SKILL_DIR/fonts` (they have Ө ө Ү ү and ₮). Don't swap in other fonts.
- The output is 1080x1920, 30 fps, H.264, sound normalised to -14 LUFS (Instagram/TikTok level).
