#!/usr/bin/env python3
"""
Builds admin/templates/aurox/aurox/css/aurox-dark.css

WHMCS's admin stylesheets hard-code light backgrounds, light borders and dark
text in hundreds of places. This script reads them and writes a dark-mode
layer that maps each of those colours to Aurox's theme variables, so every
WHMCS page, widget and plugin follows light/dark mode.

Usage:  python3 tools/build-dark-css.py /path/to/admin/templates/blend/css
        (reads all.css and theme.css from that folder)

Author: Chimnadindu Great Chibueze (https://github.com/GreatsLab)
License: MIT
"""
import colorsys
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "admin/templates/aurox/aurox/css/aurox-dark.css"
PREFIX = 'html.aurox[data-ax-mode="dark"]'

NAMED = {"white": "#ffffff", "black": "#000000", "whitesmoke": "#f5f5f5", "gainsboro": "#dcdcdc",
         "lightgray": "#d3d3d3", "lightgrey": "#d3d3d3", "silver": "#c0c0c0", "gray": "#808080",
         "grey": "#808080", "dimgray": "#696969", "darkgray": "#a9a9a9", "ghostwhite": "#f8f8ff",
         "snow": "#fffafa", "aliceblue": "#f0f8ff", "ivory": "#fffff0", "linen": "#faf0e6"}
COLOR_RE = re.compile(r"#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|\b(?:%s)\b" % "|".join(NAMED), re.I)


def parse_color(tok):
    t = tok.strip().lower()
    t = NAMED.get(t, t)
    if t.startswith("#"):
        h = t[1:]
        if len(h) in (3, 4):
            h = "".join(c * 2 for c in h[:3]) + (h[3] * 2 if len(h) == 4 else "ff")
        if len(h) == 6:
            h += "ff"
        if len(h) != 8:
            return None
        r, g, b, a = (int(h[i:i + 2], 16) for i in (0, 2, 4, 6))
        return r, g, b, a / 255
    m = re.match(r"rgba?\(([^)]*)\)", t)
    if m:
        parts = [p.strip() for p in re.split(r"[,\s/]+", m.group(1)) if p.strip()]
        try:
            r, g, b = (float(p.rstrip("%")) for p in parts[:3])
            a = float(parts[3]) if len(parts) > 3 else 1.0
            return r, g, b, a
        except ValueError:
            return None
    return None


def hls(c):
    r, g, b, _ = c
    return colorsys.rgb_to_hls(r / 255, g / 255, b / 255)


def map_bg(c):
    h, l, s = hls(c)
    if c[3] < 0.35:
        return None
    if l >= 0.97:
        return "var(--ax-surface)"
    if l >= 0.85:
        return "var(--ax-surface-2)" if s < 0.35 else "rgba(var(--ax-accent-rgb), .08)"
    if l >= 0.75 and s < 0.15:
        return "var(--ax-surface-3)"
    return None


def map_border(c):
    h, l, s = hls(c)
    if l >= 0.7 and s < 0.35:
        return "var(--ax-border)"
    return None


def map_text(c):
    h, l, s = hls(c)
    if l <= 0.22:
        return "var(--ax-text)"
    if l <= 0.42 and s < 0.25:
        return "var(--ax-text-2)"
    if l <= 0.30:
        return "var(--ax-text-2)"
    return None


def strip_comments(css):
    return re.sub(r"/\*.*?\*/", "", css, flags=re.S)


def blocks(css):
    """Yield (selector, body, media) for each rule, walking @media blocks."""
    i, n = 0, len(css)
    stack = []
    while i < n:
        j = css.find("{", i)
        k = css.find("}", i)
        if k != -1 and (j == -1 or k < j):
            if stack:
                stack.pop()
            i = k + 1
            continue
        if j == -1:
            break
        head = css[i:j].strip()
        if head.startswith("@media") or head.startswith("@supports"):
            stack.append(head)
            i = j + 1
            continue
        if head.startswith("@"):
            depth, p = 1, j + 1
            while p < n and depth:
                if css[p] == "{":
                    depth += 1
                elif css[p] == "}":
                    depth -= 1
                p += 1
            i = p
            continue
        end = css.find("}", j)
        yield head, css[j + 1:end], (stack[-1] if stack else None)
        i = end + 1


def convert(sel, body):
    out = []
    for decl in body.split(";"):
        if ":" not in decl:
            continue
        prop, val = decl.split(":", 1)
        prop, val = prop.strip().lower(), val.strip()
        imp = " !important" if "!important" in val else ""
        val = val.replace("!important", "").strip()
        if prop in ("background", "background-color"):
            if "gradient(" in val:
                cols = [parse_color(x) for x in COLOR_RE.findall(val)]
                if cols and all(c and hls(c)[1] >= 0.85 for c in cols):
                    out.append("background-image:none" + imp)
                    out.append("background-color:var(--ax-surface-2)" + imp)
                continue
            cols = COLOR_RE.findall(val)
            if len(cols) == 1:
                c = parse_color(cols[0])
                new = map_bg(c) if c else None
                if new:
                    out.append("background-color:%s%s" % (new, imp))
        elif prop in ("border", "border-top", "border-bottom", "border-left", "border-right", "border-color",
                      "border-top-color", "border-bottom-color", "border-left-color", "border-right-color", "outline-color"):
            cols = COLOR_RE.findall(val)
            if len(cols) == 1:
                c = parse_color(cols[0])
                new = map_border(c) if c else None
                if new:
                    cp = prop if prop.endswith("color") else prop + "-color"
                    out.append("%s:%s%s" % (cp, new, imp))
        elif prop == "color":
            # Leave link colours to Aurox's accent styles.
            last = sel.split(",")[-1].strip()
            if re.search(r"(^|\s|>)a(\b|:|\.)", last):
                continue
            c = parse_color(val)
            new = map_text(c) if c else None
            if new:
                out.append("color:%s%s" % (new, imp))
    return out


def scoped(sel):
    parts = []
    for s in sel.split(","):
        s = s.strip()
        if not s or s.startswith(("html", ":root")):
            continue
        if s == "body" or s.startswith("body"):
            parts.append(PREFIX + " " + s)
        else:
            parts.append(PREFIX + " " + s)
    return ",\n".join(parts)


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    src = pathlib.Path(sys.argv[1])
    rules, seen = [], set()
    for name in ("all.css", "theme.css"):
        css = strip_comments((src / name).read_text(encoding="utf-8", errors="ignore"))
        for sel, body, media in blocks(css):
            if not sel or "@" in sel or (media and "print" in media):
                continue
            if re.match(r"^\s*(from|to|\d+%)", sel):
                continue
            decls = convert(sel, body)
            if not decls:
                continue
            s = scoped(sel)
            if not s:
                continue
            key = (s, tuple(decls), media)
            if key in seen:
                continue
            seen.add(key)
            rules.append((media, s, decls))

    lines = [
        "/*!",
        " * Aurox Admin for WHMCS - dark mode layer for WHMCS's own components.",
        " * Generated by tools/build-dark-css.py. Do not edit by hand; edit the script.",
        " * Author: Chimnadindu Great Chibueze (https://github.com/GreatsLab) - License: MIT",
        " */",
    ]
    for media, sel, decls in rules:
        rule = "%s{%s}" % (sel, ";".join(decls))
        lines.append("%s{%s}" % (media, rule) if media else rule)
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("wrote %s: %d rules" % (OUT.relative_to(ROOT), len(rules)))


if __name__ == "__main__":
    main()
