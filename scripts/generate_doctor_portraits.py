from pathlib import Path
import argparse

import fitz
from PIL import Image, ImageChops


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "src" / "assets" / "generated" / "doctors"
DEFAULT_PDF = Path("/Users/pragyan/Downloads/Doctors.pdf")
CANVAS_SIZE = (420, 420)

DOCTOR_PAGE_MAP = {
    "dr-aisha-rahman": 1,
    "dr-meera-joseph": 2,
    "dr-sana-qureshi": 3,
    "dr-priya-nair": 4,
    "dr-farah-siddiqui": 5,
    "dr-nandini-rao": 6,
    "dr-isha-kapoor": 7,
    "dr-karan-sood": 8,
    "dr-rohan-iyer": 9,
    "dr-dev-malhotra": 10,
    "dr-harsh-bedi": 11,
    "dr-vikram-khanna": 12,
    "dr-kabir-ali": 13,
}


def crop_whitespace(image):
    background = Image.new("RGB", image.size, "white")
    diff = ImageChops.difference(image, background)
    bbox = diff.getbbox()
    return image.crop(bbox) if bbox else image


def prepare_page_image(document, page_number):
    page = document.load_page(page_number - 1)
    pixmap = page.get_pixmap(matrix=fitz.Matrix(2.2, 2.2), alpha=False)
    rendered = Image.frombytes("RGB", [pixmap.width, pixmap.height], pixmap.samples)
    return crop_whitespace(rendered)


def fit_export_size(image):
    image.thumbnail(CANVAS_SIZE)
    return image


def build_portraits(pdf_path):
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    document = fitz.open(pdf_path)

    for doctor_id, page_number in DOCTOR_PAGE_MAP.items():
        prepared = prepare_page_image(document, page_number)
        final_image = fit_export_size(prepared)
        final_image.save(OUTPUT_DIR / f"{doctor_id}.png", optimize=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", type=Path, default=DEFAULT_PDF)
    args = parser.parse_args()
    build_portraits(args.pdf)


if __name__ == "__main__":
    main()
