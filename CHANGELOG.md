# Changelog

All notable changes to this project are listed here. Versions follow [Semantic Versioning](https://semver.org/).

## [3.0.0] - 2026-11-20

A new dashboard and a phone experience that works like an app. Aurox now has its own look from top to bottom instead of restyled Blend parts.

### Added
- **Live dashboard** (with the companion addon): income today with a 30-day sparkline, this month against the same point last month, pending orders, tickets waiting, overdue invoices and active clients.
- **Revenue chart** with 7, 14 and 30-day views and a hover/tap tooltip. No chart library, so nothing extra to load.
- **Needs attention** card (pending orders, tickets waiting, overdue invoices, cancellations, failed module actions, domains expiring soon), **Tickets waiting** (oldest first) and **Recent orders**.
- New `Dashboard.php` in the addon. Read-only queries, cached for 60 seconds, and every query fails safe. Income figures respect the *View Income Totals* permission. Turn it off with the new **Live dashboard** setting.
- **Phone layout:** bottom tab bar (Home, Clients, +, Support, Menu), a "Create new" sheet, full-screen search with Cancel, a slide-in menu drawer with a close button, and tables shown as labelled cards.
- Breadcrumbs on every page, and a light/dark switch in the top bar.

### Changed
- Quick actions and your `quicklinks.tpl` shortcuts are now compact chips with coloured icons.
- WHMCS's own dashboard widgets sit below the live dashboard under "More from WHMCS".
- INSTALL.md now includes emptying the template cache, which fixes "it still looks like the old version".

### Fixed
- The search icon was hidden behind the field on phones.
- The Customise button was pulled up into the header by a WHMCS style.
- Nothing scrolls sideways at any screen width from 360px to 1920px, in light or dark mode.

## [2.1.0] - 2026-11-14

Aurox is now a fully standalone admin template: it no longer reads anything from the Blend folder at runtime.

### Added
- **New dashboard**: a greeting with the date and WHMCS version, one-click quick actions (including Generate Due Invoices and Attempt CC Captures), and WHMCS's dashboard tiles and widgets redesigned as clean cards. The dashboard now uses the full page width.
- **Complete dark mode** for WHMCS's own pages, widgets, forms and plugins, from a generated layer (`aurox/css/aurox-dark.css`, built by `tools/build-dark-css.py`).
- `quicklinks.tpl` (your dashboard shortcuts) and `menulinks.tpl` (a "Your links" section in the menu).
- **INSTALL.md**: full installation, update, troubleshooting and removal guide.
- Wide tables scroll sideways inside their card instead of being cut off.
- Tabs scroll sideways on phones instead of wrapping into several rows.

### Fixed
- The search icon sat above the search field. WHMCS's spinner now only shows while searching.
- Fields with an add-on or button attached (input groups) were misaligned.
- WHMCS settings forms overflowed on medium screens, and wide text boxes pushed past the card.
- Plain WHMCS inputs and selects were cramped.
- Uneven dashboard tile heights.
- The avatar now falls back to an icon when there's no Gravatar.

### Changed
- The template ships only Aurox's own files. Installing means copying Blend to `aurox` once, then uploading Aurox over it (see INSTALL.md).
- The companion addon checks for the complete template, including WHMCS's core files, before switching anyone to it.

## [2.0.0] - 2026-11-14

Aurox is now a real WHMCS admin template: upload `admin/templates/aurox`, pick it under Configuration › Administrators, done.

### Added
- **Standalone admin template** with its own layout: one grouped menu, a top bar (WHMCS search, New menu, automation status, update notice, Help and account menus), the WHMCS page panel restyled as a card, and a content card.
- **Permission-aware menu** rendered by WHMCS, using WHMCS's own language strings and routes, with every admin seeing only what their role allows.
- **Child-template design**: WHMCS's page files, styles and scripts are used live from the built-in Blend template, so WHMCS updates keep working with no reinstall and no WHMCS code in this repo.
- `settings.tpl` for brand, logo, colour, starting theme and spacing without the addon.
- Mobile layout: slide-out menu and a two-row top bar.
- `tools/build-icons.py` to keep the menu icons and script icons in sync.

### Changed
- The addon is now an optional **companion**: live counters, a settings screen, and "Use Aurox for me / everyone" and "Switch back to Blend" buttons (CSRF-protected, Full Administrators only for everyone).
- "Notes" is now "Page notes" so it isn't confused with WHMCS's own My Notes.
- Jump-to-page reads its pages from the menu, so it matches each admin's permissions.
- Table tools only appear on tables with 8 or more rows.

### Removed
- The hook-based overlay mode from 1.x. The template replaces it.

## [1.1.0] - 2026-11-13

### Added
- **Page guide** (press `I`): explains the page you're on, with tips and related pages, for 30+ common WHMCS pages.
- **Toolbox** (press `B`): password generator, date calculator, pricing and tax planner with pro-rata, data size and transfer time, timestamp converter, and encode/decode (Base64, URL, HTML, JSON).
- **Snippets** (press `S`): saved replies that insert at your cursor, with `{admin}`, `{brand}`, `{date}` and `{time}` placeholders. Export to JSON.
- **Notes** (press `M`): private notes per page or record plus a scratchpad, with a badge when the current page has a note.
- **Welcome tour** for new admins, and a "Take the tour" button you can use anytime.
- **Table tools**: filter rows as you type, copy or download the visible rows as CSV.
- **Unsaved changes warning** when leaving an edited form.
- New settings to switch each of these on or off.
- Help window now lists the new shortcuts and the author credit.
- CONTRIBUTING, SECURITY, issue and pull request templates.

### Changed
- Credits, license and module details now name Chimnadindu Great Chibueze (GreatsLab) as the author.
- README rewritten.

## [1.0.0] - 2026-11-12

### Added
- Docked sidebar navigation with grouped sections, active-page highlighting, collapsible icon rail and mobile drawer.
- Command palette (Ctrl/⌘ + K or `/`) with fuzzy page search, open-by-ID (`c`, `i`, `o`, `t`, `s`, `d`), quick-create actions and hand-off to the WHMCS search box.
- Two-key keyboard shortcuts and a `?` help window.
- Pinned pages and recent pages, saved per admin in the browser.
- Live counters for pending orders, unpaid/overdue invoices, tickets awaiting reply and cancellation requests.
- Light, dark and follow-device themes; comfortable and compact density.
- Restyle of Blend: panels, buttons, forms, `table.form`, `.datatable`, tabs, alerts, labels, dropdowns, pagination and modals.
- Addon settings: brand name, logo, accent colour, defaults, feature toggles, hide-selector, extra links and custom CSS.
- Module page with personal preference controls and the shortcut list.
- Offline preview page and GitHub release workflow.
