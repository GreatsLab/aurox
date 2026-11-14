# Aurox Admin template

Designed and built by **Chimnadindu Great Chibueze** · https://github.com/GreatsLab/aurox

## Install in short

1. In `admin/templates/`, copy the `blend` folder and name the copy `aurox`.
2. Upload these Aurox files into `admin/templates/aurox/` and overwrite.
3. In WHMCS: **Configuration › Administrators** › edit your user › **Template: aurox**.

The full guide is in INSTALL.md on GitHub.

## Your files

- `settings.tpl`: brand name, logo, colour, starting theme and spacing
- `quicklinks.tpl`: your dashboard shortcuts
- `menulinks.tpl`: your own menu links

## After a WHMCS update

Copy `css`, `js`, `fonts`, `img`, `images`, `affiliates` and every `.tpl` file
except `header.tpl`, `footer.tpl`, `nav.tpl` and `homepage.tpl` from `blend`
into `aurox`, overwrite, then empty the template cache
(Utilities › System › System Cleanup).

MIT License · Copyright (c) 2026 Chimnadindu Great Chibueze (GreatsLab)
