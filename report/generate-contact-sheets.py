#!/usr/bin/env python3
"""Generate contact sheet thumbnails for art picture/ and picture/."""

import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, UnidentifiedImageError

# ── Config ──────────────────────────────────────────────────────────
ART_DIR = Path(r"D:\xia zai\AI project\7.1 React\art picture")
PICTURE_DIR = Path(r"D:\xia zai\AI project\7.1 React\picture")
OUTPUT_DIR = Path(r"D:\xia zai\AI project\7.1 React\report")

THUMB_W = 220
THUMB_H = 320
COLS = 4
PAD = 14
LABEL_H = 42
BG_COLOR = (10, 12, 22)
BORDER_COLOR = (35, 45, 70)
TEXT_COLOR = (200, 210, 240)
ACCENT = (86, 228, 255)  # cyan accent for numbers

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Font ────────────────────────────────────────────────────────────
try:
    # Try a common monospace font
    font_small = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 14)
    font_num = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 16)
except Exception:
    font_small = ImageFont.load_default()
    font_num = ImageFont.load_default()

# ── Helpers ─────────────────────────────────────────────────────────
SUPPORTED = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".gif"}


def try_open_image(path):
    """Try to open an image, return (img, error_str)."""
    ext = path.suffix.lower()
    if ext == ".heic":
        return None, "HEIC (not supported)"
    if ext not in SUPPORTED:
        return None, f"unsupported: {ext}"
    try:
        img = Image.open(path)
        img.thumbnail((THUMB_W, THUMB_H), Image.LANCZOS)
        return img, None
    except (UnidentifiedImageError, Exception) as e:
        return None, str(e)[:40]


def fit_into(img, width, height):
    """Fit image into box, centering, filling remaining with black."""
    w, h = img.size
    ratio = min(width / w, height / h)
    nw = int(w * ratio)
    nh = int(h * ratio)
    img = img.resize((nw, nh), Image.LANCZOS)
    bg = Image.new("RGB", (width, height), (0, 0, 0))
    bg.paste(img, ((width - nw) // 2, (height - nh) // 2))
    return bg


def get_orientation(w, h):
    ratio = w / h
    if ratio > 1.15:
        return "横图"
    elif ratio < 0.87:
        return "竖图"
    else:
        return "方图"


def format_size(size_bytes):
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.0f} KB"
    else:
        return f"{size_bytes / (1024*1024):.1f} MB"


# ── Generate single contact sheet ────────────────────────────────────
def generate_contact_sheet(images, title, output_path):
    """
    images: list of (index, Path, error_or_none)
    """
    n = len(images)
    rows = (n + COLS - 1) // COLS
    cell_w = THUMB_W + PAD * 2
    cell_h = THUMB_H + LABEL_H + PAD * 2

    sheet_w = COLS * cell_w + PAD
    sheet_h = rows * cell_h + PAD + 60  # extra top margin for title

    sheet = Image.new("RGB", (sheet_w, sheet_h), BG_COLOR)
    draw = ImageDraw.Draw(sheet)

    # Title
    draw.text((PAD, PAD - 4), title, fill=ACCENT, font=font_num)

    y0 = PAD + 30

    for i, (idx, path, err) in enumerate(images):
        col = i % COLS
        row = i // COLS
        x = PAD + col * cell_w
        y = y0 + row * cell_h

        # Cell background
        draw.rounded_rectangle(
            [x, y, x + cell_w - PAD, y + cell_h - PAD],
            radius=6,
            fill=(15, 20, 35),
            outline=BORDER_COLOR,
            width=1,
        )

        # Image or placeholder
        ix = x + (cell_w - PAD - THUMB_W) // 2
        iy = y + 8

        if err:
            draw.text((ix + 20, iy + THUMB_H // 2 - 10), err, fill=(180, 60, 60), font=font_small)
        else:
            img, _ = try_open_image(path)
            if img:
                thumb = fit_into(img, THUMB_W, THUMB_H)
                sheet.paste(thumb, (ix, iy))

        # Label: number
        num_y = iy + THUMB_H + 4
        draw.text((ix + 4, num_y), f"#{idx}", fill=ACCENT, font=font_num)

        # Label: filename (truncated)
        name = path.name
        if len(name) > 26:
            name = name[:24] + "…"
        draw.text((ix + 40, num_y + 2), name, fill=TEXT_COLOR, font=font_small)

        # Label: size + orientation below
        info_y = num_y + 20
        size_str = format_size(path.stat().st_size)
        orient = ""
        if not err:
            try:
                with Image.open(path) as tmp:
                    orient = get_orientation(*tmp.size)
            except:
                pass
        draw.text((ix + 4, info_y), f"{size_str}  {orient}", fill=(140, 150, 180), font=font_small)

    sheet.save(output_path, quality=90)
    return output_path


# ── Scan directories ────────────────────────────────────────────────
def scan_directory(directory):
    files = []
    for f in sorted(directory.iterdir()):
        if f.is_file() and f.suffix.lower() in SUPPORTED | {".heic"}:
            ext = f.suffix.lower()
            err = None
            if ext == ".heic":
                err = "HEIC (not supported)"
            files.append((f, err))
    return files


print("Scanning directories...")
art_files = scan_directory(ART_DIR)
pic_files = scan_directory(PICTURE_DIR)

print(f"  art picture/  : {len(art_files)} files")
print(f"  picture/      : {len(pic_files)} files")

# ── Prepare indexed lists ──────────────────────────────────────────
art_indexed = [(i + 1, path, err) for i, (path, err) in enumerate(art_files)]
pic_indexed = [(i + 1, path, err) for i, (path, err) in enumerate(pic_files)]

# ── Generate art picture contact sheet ──────────────────────────────
print("\nGenerating art picture contact sheet...")
out = OUTPUT_DIR / "contact-sheet-art-picture.jpg"
generate_contact_sheet(art_indexed, f"Art Picture — {len(art_indexed)} images", out)
print(f"  → {out}")

# ── Generate picture contact sheets (split if > 40) ─────────────────
print("\nGenerating picture contact sheets...")
batch_size = 35  # ~4 cols x 9 rows

for batch_start in range(0, len(pic_indexed), batch_size):
    batch = pic_indexed[batch_start : batch_start + batch_size]
    part = batch_start // batch_size + 1
    total_parts = (len(pic_indexed) + batch_size - 1) // batch_size

    if total_parts == 1:
        out_name = "contact-sheet-picture.jpg"
    else:
        out_name = f"contact-sheet-picture-{part:02d}.jpg"

    out = OUTPUT_DIR / out_name
    generate_contact_sheet(
        batch,
        f"Picture — Part {part}/{total_parts} ({len(batch)} images)",
        out,
    )
    print(f"  → {out}  ({batch_start+1}–{batch_start+len(batch)})")

print("\nDone.")
