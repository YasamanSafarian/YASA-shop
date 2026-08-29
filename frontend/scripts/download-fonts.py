#!/usr/bin/env python3
"""Download & self-host the Google Fonts used by the YASA frontend.

Fetches the exact family/weight CSS previously loaded via <link> tags, then
downloads each subset woff2 into src/assets/fonts and emits a fonts.scss with
rewritten @font-face rules (keeping unicode-range + display: swap).

Run from the frontend/ directory:
    python3 scripts/download-fonts.py
"""
import os
import re
import sys
import time
import urllib.request
from collections import defaultdict

FRONTEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS_DIR = os.path.join(FRONTEND_DIR, "src", "assets", "fonts")
OUT_SCSS = os.path.join(FRONTEND_DIR, "src", "styles", "_Fonts.scss")

URLS = [
    "https://fonts.googleapis.com/css2?"
    "family=Inter:wght@400;500;600"
    "&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500"
    "&family=Vazirmatn:wght@400;500;600;700"
    "&display=swap",
    "https://fonts.googleapis.com/css2?family=Courgette&family=Homemade+Apple&display=swap",
]

# Minimum @font-face blocks expected per URL (Google sometimes returns a
# truncated/rate-limited CSS with only some weights — retry until complete).
EXPECTED_BLOCKS = [49, 3]
MAX_ATTEMPTS = 8

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8")


def download(url: str, dest: str):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = resp.read()
    with open(dest, "wb") as fh:
        fh.write(data)
    return len(data)


def parse_fontfaces(css: str):
    blocks = []
    for m in re.finditer(r"@font-face\s*\{(.*?)\}", css, re.S):
        body = m.group(1)
        defs = dict(re.findall(r"([a-z-]+):\s*([^;]+);", body, re.S))
        src_url = None
        for sm in re.finditer(r"url\(([^)]+)\)\s*format\('([^']+)'\)", body, re.S):
            src_url = sm.group(1)
        if not src_url:
            continue
        blocks.append(
            {
                "family": defs.get("font-family", "").strip("\"' "),
                "weight": defs.get("font-weight", "400").strip(),
                "style": defs.get("font-style", "normal").strip(),
                "display": defs.get("font-display", "swap").strip(),
                "unicode": defs.get("unicode-range", "").strip(),
                "url": src_url,
            }
        )
    return blocks


def slug(family: str):
    return re.sub(r"[^a-z0-9]+", "-", family.lower()).strip("-")


def main():
    os.makedirs(FONTS_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(OUT_SCSS), exist_ok=True)

    all_blocks = []
    for url, expected in zip(URLS, EXPECTED_BLOCKS):
        blocks: list = []
        for attempt in range(MAX_ATTEMPTS):
            try:
                blocks = parse_fontfaces(fetch(url))
            except Exception as exc:  # noqa: BLE001 - transient network errors
                blocks = []
                print(f"fetch attempt {attempt + 1} failed: {exc}", file=sys.stderr)
            if len(blocks) >= expected:
                break
            print(
                f"got {len(blocks)} blocks (expected >= {expected}); retrying...",
                file=sys.stderr,
            )
            time.sleep(1.5 * (attempt + 1))
        if len(blocks) < expected:
            print(
                f"WARNING: only got {len(blocks)} blocks for {url}",
                file=sys.stderr,
            )
        all_blocks.extend(blocks)

    seen = set()
    unique = []
    for b in all_blocks:
        if b["url"] in seen:
            continue
        seen.add(b["url"])
        unique.append(b)

    # Each unique (family, style, url) is one unicode-range subset file. Google
    # serves a variable-font woff2 that covers several weights for a single
    # subset, so a URL may appear across many weights — emit it only once and
    # declare the full weight range it supports.
    weights_by_key: dict = defaultdict(set)  # (family, style, url) -> {weights}
    meta: dict = {}  # (family, style, url) -> {unicode, display}
    for b in all_blocks:
        key = (b["family"], b["style"], b["url"])
        weights_by_key[key].add(b["weight"])
        if key not in meta:
            meta[key] = {"unicode": b["unicode"], "display": b["display"]}

    ordered = sorted(weights_by_key.keys())
    subset_counters: dict = {}
    lines = []
    for key in ordered:
        family, style, remote = key
        weights = sorted(int(w) for w in weights_by_key[key])
        subset_counters[(family, style)] = (
            subset_counters.get((family, style), 0) + 1
        )
        idx = subset_counters[(family, style)]
        fname = f"{slug(family)}-{slug(style)}-{idx}"
        download(remote, os.path.join(FONTS_DIR, fname + ".woff2"))
        local = f"/assets/fonts/{fname}.woff2"
        weight_decl = (
            f"{weights[0]} {weights[-1]}" if len(weights) > 1 else str(weights[0])
        )
        block = (
            "@font-face {\n"
            f'  font-family: "{family}";\n'
            f"  font-style: {style};\n"
            f"  font-weight: {weight_decl};\n"
            f"  font-display: {meta[key]['display']};\n"
            f"  src: url('{local}') format('woff2');\n"
        )
        if meta[key]["unicode"]:
            block += f"  unicode-range: {meta[key]['unicode']};\n"
        block += "}\n"
        lines.append(block)

    with open(OUT_SCSS, "w") as fh:
        fh.write("/* Auto-generated self-hosted fonts — do not edit manually. */\n")
        fh.write("\n".join(lines) + "\n")

    print(f"Wrote {len(ordered)} @font-face rules -> {OUT_SCSS}")
    print(f"Downloaded {len(ordered)} woff2 files -> {FONTS_DIR}")


if __name__ == "__main__":
    sys.exit(main())
