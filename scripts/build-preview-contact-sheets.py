from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PREVIEW_ROOT = ROOT / "outputs" / "phase-6-1b-preview"
CONTACT_ROOT = PREVIEW_ROOT / "contact-sheets"
CONTACT_ROOT.mkdir(parents=True, exist_ok=True)
FONT = ImageFont.load_default()

for language in ("en", "ru", "es", "pt", "ar"):
    files = sorted((PREVIEW_ROOT / language).glob("*--desktop.png"))
    if not files:
        raise RuntimeError(f"no desktop previews for {language}")
    columns = 3
    thumb_w, thumb_h, label_h, gap = 360, 250, 34, 18
    rows = (len(files) + columns - 1) // columns
    sheet = Image.new(
        "RGB",
        (
            columns * (thumb_w + gap) + gap,
            rows * (thumb_h + label_h + gap) + gap,
        ),
        "#111827",
    )
    draw = ImageDraw.Draw(sheet)
    for index, file in enumerate(files):
        image = Image.open(file).convert("RGB")
        image.thumbnail((thumb_w, thumb_h))
        x = gap + (index % columns) * (thumb_w + gap)
        y = gap + (index // columns) * (thumb_h + label_h + gap)
        sheet.paste(image, (x, y))
        draw.text(
            (x, y + thumb_h + 8),
            file.stem.replace("--desktop", ""),
            fill="white",
            font=FONT,
        )
    sheet.save(CONTACT_ROOT / f"{language}-desktop-contact-sheet.png", optimize=True)

print(f"created 5 contact sheets in {CONTACT_ROOT}")
