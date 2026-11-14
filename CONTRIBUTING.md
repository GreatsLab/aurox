# Contributing

Thanks for wanting to help make Aurox better. A few things that make life easier for both of us:

## Reporting a bug

Open an issue and tell me:

- your WHMCS version and PHP version
- which admin page it happened on (the address is perfect)
- what you expected, and what actually happened
- a screenshot if it's a visual thing

If you can, check the same page on Blend (Configuration › Administrators › Template). If the problem is still there, it's probably WHMCS or another module, not Aurox.

## Suggesting a feature

Open an issue and describe the problem you're trying to solve, not just the feature. "I keep losing track of which clients I promised to call back" tells me more than "add reminders".

## Sending a pull request

1. Fork the repo and create a branch from `main`.
2. Keep changes focused. One fix or feature per pull request.
3. Match the style that's already there: plain JavaScript (no build step, no frameworks), PHP that runs on 7.4 and 8.x, CSS scoped under `html.aurox`.
4. Never commit WHMCS's own files (anything that comes from the Blend template: `css/`, `js/`, `fonts/`, WHMCS's page `.tpl` files). Users copy those from their own install; see INSTALL.md.
5. The addon only reads from WHMCS tables, apart from the template-switch buttons. Keep it that way.
6. Check your work: `php -l` on any PHP you touched, `node --check` on the JS, `python3 tools/build-icons.py` if you added an icon, `python3 tools/build-dark-css.py <blend css folder>` if dark mode needs regenerating, and test on a real WHMCS if you can.
7. Add a line to `CHANGELOG.md` under an "Unreleased" heading.

## Adding a page guide

Page guides live in the `GUIDE` list in `admin/templates/aurox/aurox/js/aurox-tools.js`. Keep them short: one sentence on what the page is for, one or two tips, and a few related pages. Write like you're explaining it to a new teammate.

Thanks again.
Chimnadindu
