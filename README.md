# 🐐 Soft Glow · Зөөлөн гэрэл

<p align="center"><img src="assets/poster.jpg" width="300" alt="Soft Glow · Зөөлөн гэрэл"></p>

**Claude Code дотор ажилладаг видео эдитийн skill.** Бичлэгийг зөөлөн, гэрэлтсэн, үнэтэй харагдуулна: гэрэл зөөлөн тархаж, арьс цэвэр, өнгө тайван.

Reels, TikTok-д бэлэн 1080×1920 MP4 гаргана. GOAT Academy-гийн 14 эдитийн стилийн нэг.

---

## Юунд тохирох вэ?

- **Тохирно:** гоо сайхан, арьс арчилгаа, салон, хумс, сүйт бүсгүйн будалт, эрүүл мэнд
- **Тохирохгүй:** машин, хурдан хэмнэлтэй бичлэг, харанхуй бичлэг

---

## Шаардлага

- **Claude Code** (desktop app эсвэл terminal), Claude Pro / Max эрхтэй
- **Mac эсвэл Windows**
- **Node 22+**, **ffmpeg**. Байхгүй бол Claude өөрөө шалгаад, суулгах командыг хэлж өгнө.
- **Компьютер:** Mac эсвэл 64-bit Windows 10/11. Apple чиптэй Mac (M1+) дээр туршсан. Windows дээр одоогоор туршаагүй.
- Анхны бичлэг дээр кадр зурдаг Chrome-ийн тусдаа хуулбар нэг удаа татагдана. Бүх зүйл таны компьютер дээр ажиллана, юу ч интернэтэд илгээгдэхгүй.

---

## Суулгах

**Хамгийн хялбар:** Claude Code-оо нээгээд энэ мөрийг хуулж бичнэ:
```
Энэ plugin-ийг суулгаад өг: https://github.com/SaagiiSG/goat-soft-glow
```
Claude өөрөө суулгана. Дараа нь `/reload-plugins` гэж бичих эсвэл Claude Code-оо хаагаад дахин нээнэ.

**Эсвэл өөрөө:** Claude Code дотор энэ 2 мөрийг ээлжлэн бичнэ:
```
/plugin marketplace add SaagiiSG/goat-soft-glow
/plugin install goat-soft-glow@goat-soft-glow
```

**Zip файлаар авсан бол:**
1. `goat-soft-glow.zip`-ийг задална. Задалсан `goat-soft-glow` хавтсаа устгалгүй үлдээгээрэй.
2. Claude Code-д "Энэ хавтсан дахь plugin-ийг суулгаад өг:" гэж бичээд задалсан `goat-soft-glow` хавтсаа чирж оруулна.
3. `/reload-plugins` гэж бичнэ.

**Шинэ хувилбар гарвал:** Claude-д "goat-soft-glow plugin-ийг шинэчил" гэж хэлэхэд болно.

> **For Claude Code:** to install this plugin, run `claude plugin marketplace add SaagiiSG/goat-soft-glow` (or, from an unzipped copy, `claude plugin marketplace add <path to the goat-soft-glow folder>`) and then `claude plugin install goat-soft-glow@goat-soft-glow`, then tell the user to type `/reload-plugins`. To update it: `claude plugin marketplace update goat-soft-glow` and then `claude plugin update goat-soft-glow@goat-soft-glow`.

---

## Хэрэглэх

1. Видео бүрд **шинэ хоосон хавтас** үүсгэ.
2. Claude Code-ийг тэр хавтсанд нээ.
3. Бичнэ: `/goat-soft-glow:goat-soft-glow` эсвэл энгийнээр: **"энэ бичлэгийг зөөлөн гэрэлтэй, тансаг болгоод өг"**
4. Бичлэгээ чирж оруулаад гарчиг болон нэг мөр (үнэ, утас) бичнэ.
5. Claude юу хийхээ товч хэлнэ. Таалагдвал "ок" гэхэд л болно.
6. `output/soft-glow.mp4` бэлэн. Instagram, TikTok руу шууд оруулна.

---

## Дуу

- **Дуу эффект** автоматаар орно. Кодоор хийсэн учир лицензийн асуудалгүй. Хэрэггүй бол "дуу эффектгүй болго" гэж хэлэхэд болно.
- **Өөрийн дуугаар ярих (voice-over):** утсаараа дуугаа бичээд (voice memo) өгнө. Таны дуу гарах үед бичлэгийн дуу, хөгжим өөрөө намсна.
- **Хөгжим:** Instagram, TikTok апп дотроос нэмбэл зохиогчийн эрхийн асуудалгүй.

---

## Бичлэг хийх зөвлөгөө

- Цонхны гэрэл эсвэл цагаан гэрэлтэй газар ав.
- Удаан, тайван хөдөлгөөн илүү сайн.

---

Фонтууд нь Google Fonts-оос (OFL лиценз). Лицензийн файлууд `fonts/` хавтсанд байгаа.
