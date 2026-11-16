---
name: goat-soft-glow
description: Soft Glow · Зөөлөн гэрэл. Edits the user's phone clips into a bright, creamy, softly glowing full-screen video with lifted shadows, warm skin, a slow drift on every shot, cream fades between shots and cream title cards with thin italic serif Mongolian words that blur into focus. Built on HyperFrames. Renders a 1080x1920 MP4 for Reels/TikTok. Best for skincare, lash and brow, spa and massage, aesthetic clinics, dentists and women's wellness coaches. Use whenever the user wants a soft, dreamy, glowy, clean, premium beauty or "зөөлөн гэрэлтэй" look, or types /goat-soft-glow, /зөөлөн, or says "зөөлөн гэрэлтэй болгоод өг", "гоо сайхны видео шиг хий", "make it soft and glowy", "clean beauty look", even if they don't name the skill.
---

# Soft Glow · Зөөлөн гэрэл

A bright, creamy, softly glowing picture with lifted shadows and warm skin. Every shot drifts in slowly, cuts fade through cream, and title cards fade the screen to cream while thin italic serif words blur into focus. It is the only GOAT look that is brighter and softer than real life, with no grain, no black and no hard edges.

**Good for:** skincare, lash and brow, spa and massage, aesthetic clinics, dentists, women's wellness coaches. Use it for the room and the skin.
**Not for:** barbers, cars, men's gyms. For nails and hair colour, never use it on the result shot: brightening and lower saturation shift polish and dye colours. If the user's footage is one of these, say so and suggest another GOAT look.

Talk to the user in the language they write in (usually Mongolian). Keep messages short and plain; many users are not technical. `SKILL_DIR` means this skill's base directory (shown when the skill loads). Run commands from the user's project folder with absolute paths into `SKILL_DIR`. `goat` below means `node SKILL_DIR/scripts/goat.mjs`.

## 1. Setup check (first time on a machine)

**Every new video, first:** run `claude plugin marketplace update goat-soft-glow`, then `claude plugin update goat-soft-glow@goat-soft-glow`. If it installs a new version, tell the user a new version was installed and ask them to type `/reload-plugins` before you go on. If either command fails (offline, or installed from a zip), carry on and don't mention it.

Run `node --version` (needs 22 or newer) and `ffmpeg -version`. If either is missing, show the install command and ask before installing (it is their computer):
- Mac: `brew install node ffmpeg`
- Windows: `winget install OpenJS.NodeJS.LTS` and `winget install Gyan.FFmpeg`, then close and reopen the terminal.

The words here are titles the user writes, not speech, so this look needs no speech model. The first render downloads, once, a private copy of Chrome that draws the frames. Tell the user the first run takes a while; after that it starts at once. Nothing is uploaded: everything runs on their computer, with no account.

**Long steps:** the first `render` (the Chrome download) can run longer than a normal command timeout. Run it in the background, or with a 600000 ms timeout, and wait for it to end. Never stop it and start it again.

**Windows has not been tested yet.** If a step fails there, show the error to the user in plain words.

## 2. Collect the clips and words

Make `raw/` and `output/` in the current folder. Ask for:
1. **The clips.** Drag them into the chat or copy them into `raw/`. Best filmed in soft window light against a clean background, subject in the centre, camera held gently. Photos work too.
2. **The words:** a title of 1–3 words for each card (e.g. "Зөөлөн арьс") and, if they want, a small line under it (a service name or a booking phone, e.g. "Арьс арчилгаа"). Never invent a price, phone number or date. Ask.

If this folder was already edited with `goat-video-editor`, use `output/cut.mp4` as the clip.

Then run `goat probe raw/*`. It prints each file's size, length, whether it has sound, whether it is HDR, and `speech` spans (when someone is talking). Use these to pick shots and time the words. If a clip is HDR, warn the user: this bright look shows HDR wash-out first.

## 3. Prepare

Write `plan.json` in the project folder (paths are relative to it):

```json
{
  "output": "output/soft-glow.mp4",
  "clips": [
    {"src": "raw/IMG_0412.MOV", "in": 1.0, "out": 4.5},
    {"src": "raw/IMG_0415.MOV", "in": 0.0, "out": 4.0, "cy": 0.4},
    {"src": "raw/room.jpg", "dur": 4.0}
  ],
  "texts": [
    {"role": "title", "text": "Зөөлөн арьс", "start": 2.3, "end": 5.3},
    {"role": "sub", "text": "Арьс арчилгаа", "start": 2.5, "end": 5.3},
    {"role": "title", "text": "Өөртөө цаг гарга", "start": 9.0},
    {"role": "sub", "text": "Захиалга нээлттэй", "start": 9.2}
  ],
  "look": {"exposure": 0.15}
}
```

**clips** play in order, full screen. `in`/`out` trim a video (seconds); `dur` sets how long a photo shows. `cx`/`cy` (0–1, default 0.5) choose which part of a wider frame (or a photo of another shape) the phone screen keeps; an upright 9:16 phone clip is kept whole. Add `"sound": false` to mute one clip.

Then run these in order. Each one says what to run first if a step is missing.
1. `goat prep plan.json`: crops every clip to the full 1080x1920 screen, grades it and joins them into `.work-soft-glow/main.mp4`. The grade: a gentle exposure lift, low contrast, saturation 0.85, a warm balance, lifted blacks and soft highlights, and a bloom (the picture blurred and screened over itself at 18%). Each clip's brightness is measured once, from 5 frames spread through it (1 for a photo): a really dark one (night, a dim room; on average under 80 of 255) is lifted first. **Run it again whenever `clips` change.**
2. `goat cut plan.json`: this look never cuts pauses; the step only readies the video (`.work-soft-glow/cut.mp4`) and takes a second.

**Check the framing** before writing the words. For each shot of 0.5 s or more, pull one frame from inside it, 0.4 s after it starts (never at a cut: that frame may already be the next shot). A shot starts where the shots before it end; for the second shot above (3.5 to 7.5 s):
`ffmpeg -y -loglevel error -ss 3.9 -i .work-soft-glow/cut.mp4 -frames:v 1 output/frame-3.9.jpg`
Read it. Check that the face or the skin is in frame (fix with `cy`, or pick another moment with `in`/`out`) and that skin still shows detail. If skin or white walls are flat white, lower `exposure`; if it looks dull, raise it. Run `prep` again after any change.

## 4. Write the words

**texts:** a `title` or `sub` turns the screen into a cream title card for as long as it shows: the cream fades in over 0.8 s, the words blur into focus (sharp 1.2 s after the start), fade from 0.8 s before the end, and the cream fades back out to the footage. The footage is hidden behind the card. Only one of each role shows at a time: a later one ends the one before.
- `title`: thin italic serif (Cormorant Garamond Italic Light), dark cocoa, up to 124 px, centred just above the middle of the screen. **At most 24 characters a row** (spaces count), 2 rows at most; with two, the last row stays in place and the first sits above it.
- `sub`: small, widely spaced capitals (Manrope Light, latte brown, up to 40 px) just under the title. Written in capitals automatically. **At most 28 characters a row** (counted in capitals), 2 rows at most; a second row goes below. Start it about 0.2 s after the title. A price or booking phone can go here; it sits inside the area no app buttons cover.

Break a row yourself with `\n`. A longer row is refused with a message: shorten it or split it. An empty row (a stray `\n`) is refused too. Long rows shrink to fit: ordinary text stays at about 80 px or more for a title and 30 px or more for a sub; a row in capitals or with wide symbols gets smaller type (a 24-letter title in capitals is about 55 px). Two rows use one size.

**Card timing:** each `title` and `sub` must show for **2 s at least**, counted to the next one of its role or to the end of the video; the render refuses a shorter one. 3 s reads best. Place a card across a cut with the cut in its middle (at least 0.8 s after the card starts and 0.8 s before it ends, where the cream is full), or at the start or end. A card without an `end`, or ending in the last 0.8 s, stays up to the end: the video ends on it. Two cards less than 0.8 s apart share one cream, which stays up between them.

**The first frame is the Reels thumbnail.** Without a card at the start, the video opens on the first shot half washed in cream, clearing over 0.6 s. To open on the words instead, give the first title (and its sub) `"start": 0`: the card is then already up and sharp on frame 0.

**look** options:
- `exposure`: how much the whole video is brightened, 0 to 1.5. Default `0.15`. Really dark clips are lifted automatically and the grade keeps highlights from clipping, so most videos never need it. If the check frames look dull, try `0.4`; if skin or white walls turn flat white, try `0`.

**Auto sound effects** (soft, so they sit under the clips' own sound; raise them with `"sfx": {"volume": 1.5}`): a shimmer as each title's words come into focus (none for a title already up on frame 0).

**Timing:** hold each shot 3–4 s. Slow is the point: every shot drifts in 3% over 4 s (or over the shot, if it is longer). The video fades in from cream over 0.6 s, every cut fades through cream (0.35 s out, 0.35 s in) and the end fades to cream over 0.8 s. Each cream dip is one slow pulse and two never overlap: a cut less than 0.7 s after the last dip, in the first 1.75 s, in the last 1.95 s, or under or within 1.15 s of a card cuts straight (a card already hides the cuts under it). That way the footage always shows clean for about a second between two cream fades, and never flickers between them. So shots under 0.7 s (and especially under 0.35 s) never stack into a flicker, but they sit partly under the cream of the cut next to them and barely show: don't use them.

Before rendering, tell the user the plan in plain words (shot list + the cards) and ask "OK?". This is the only approval needed.

<!-- audio: this section is copied from core/skill-audio-node.md by build.py; edit it there -->
## Sound effects, voice-over and music

**Sound effects are on by default.** The look adds its own (see "Auto sound effects" above). They are made in code, so there's nothing to license, and they sit quietly under the voice.
- Turn them off: `"sfx": false`. Make them quieter or louder: `"sfx": {"volume": 0.6}`.
- Add one: `"sfx": {"add": [{"sound": "ding", "at": 4.2}]}`. Sounds: whoosh, swish, pop, click, type, shutter, boom, thud, hit, riser, ding, notify, shimmer, paper, tape, marker, projector, tick. `type`, `marker`, `projector` and `riser` also take `"dur"` in seconds; a riser should end on the moment it builds to.
- Let the user hear one render before adding more. Too many sounds feel cheap.

**Voice-over.** If the user wants to talk over the video, ask them to record it on their phone (a voice memo is fine: m4a, mp3 or wav) and copy it into `raw/`. Then add `"voiceover": {"src": "raw/vo.m4a", "at": 0.5}` (`at` = when it starts; optional `"volume"`). While the voice plays, the clips' own sound and the music dip automatically. Run `node SKILL_DIR/scripts/goat.mjs probe raw/vo.m4a` to get its `speech` spans and time the words on screen to them. The clips must add up to at least the voice-over's length (the render warns if not). Recording tips for the user: a small quiet room (a parked car or a wardrobe works), phone about 20 cm from the mouth, read the script out loud once before recording.

**Music.** `"music": {"src": "raw/song.mp3", "volume": 0.25}`. Only use music the user has the rights to. Music added inside the Instagram/TikTok app is the safe choice, so suggest that first.
<!-- /audio -->

## 5. Render and check

`goat render plan.json`

It draws the drifts, cream fades and title cards over the graded footage, mixes the sound and writes the MP4 plus a contact sheet (one frame per second) at `.work-soft-glow/sheet.jpg`. On our test Mac a 14.7 s video with 5 shots took 22–24 s to render and 18–20 s to prep (a 12.4 s video with 12 shots and a photo: 19–21 s and 20 s). Longer videos take longer. Run the next render only after the last one ends. Read the contact sheet, the first frame, one full-size frame inside each shot of 0.8 s or more, 0.4 s after it starts (0.7 s for the first shot, after the fade in; skip a pull that lands in the last 0.8 s, which fades to cream). That is after the cream fade into the shot and before the one out of it; a shot under a card shows the card. Pull one more on each card, 1.3 s after it starts (words sharp):
`ffmpeg -y -loglevel error -i output/soft-glow.mp4 -frames:v 1 output/check-0.jpg`
`ffmpeg -y -loglevel error -ss 7.9 -i output/soft-glow.mp4 -frames:v 1 output/check-7.9.jpg` (the third shot, 7.5 to 11.5 s; and one per shot)
`ffmpeg -y -loglevel error -ss 3.6 -i output/soft-glow.mp4 -frames:v 1 output/check-3.6.jpg` (the first card: its start 2.3 + 1.3)
Check that:
- the first frame (the thumbnail) shows the footage or the opening card;
- each card's words are whole and readable;
- faces are in frame (fix with `cy`) and skin still shows detail (if it is flat white, lower `exposure`).

If a render fails twice, stop and explain the error in plain words. Don't loop.

## 6. Hand over

Tell the user where the file is (`output/soft-glow.mp4`) and that it is ready to post. Captions and music can be added in the Instagram/TikTok app.

## Rules

- Every word and graphic on screen comes from what this video says or shows, or from what the user gave you. The examples in this file are only examples: never put them in a video. If the user hasn't given the words, ask.
- Keep the proof real: use Soft Glow for the room and the skin, not for a colour result (nail shade, hair dye).
- Anything the viewer must read (price, phone, offer) goes on a title card (`title` or `sub`), which sits inside the area no app buttons cover. Never invent a price, phone number or date; ask.
- Use only the fonts bundled in `SKILL_DIR/fonts` (Cormorant Garamond and Manrope have Ө ө Ү ү and ₮). Don't swap in other fonts. Emoji and symbols such as ★ can't be drawn.
- The output is 1080x1920, 30 fps, H.264. The clips' own sound (and any voice-over or music) is normalised to -14 LUFS (Instagram/TikTok level); clips without sound stay silent under the effects, so such a reel is quieter than that.
