# Installing Aurox Admin

This guide takes you from download to a working Aurox admin area, step by step. It's written for cPanel's File Manager, but any FTP app (FileZilla, WinSCP) or SSH works the same way.

**Time needed:** about 10 minutes.
**You need:** WHMCS 8.x, PHP 7.4 or newer, and access to your WHMCS files.

---

## Before you start

**1. Know where your WHMCS lives.** This is the folder with `configuration.php` in it, for example `public_html/billing` or `public_html` for a subdomain like `app.yourdomain.com`.

**2. Know your admin folder's name.** It's `admin` unless you renamed it (some people do, for security). Wherever this guide says `admin/`, use your folder's name.

**3. Make a quick backup.** Aurox doesn't replace any WHMCS file, but backing up `admin/templates/` takes seconds and is good habit.

---

## Step 1: Download Aurox

Get the latest `aurox-admin-vX.Y.Z.zip` from the [Releases page](https://github.com/GreatsLab/aurox/releases), or click **Code › Download ZIP** on the repository page.

Inside you'll find:

```
admin/templates/aurox/        the template
modules/addons/auroxadmin/    the optional companion addon
```

## Step 2: Create the aurox folder from Blend

Aurox is a complete admin template. Some of what a WHMCS admin template needs, though, is WHMCS's own core code: the admin JavaScript that powers ticket replies, client pages and pop-ups, plus WHMCS's page files. That code belongs to WHMCS and can't be published on GitHub. Every WHMCS install already has it inside the default **Blend** template, so you copy it once:

1. In File Manager, open `admin/templates/`.
2. Right-click the **blend** folder › **Copy**.
3. As the destination, type the same path but ending in `aurox`, for example
   `/public_html/billing/admin/templates/aurox`, and confirm.

You now have `admin/templates/aurox/` with WHMCS's files in it. From now on Aurox is fully standalone: it never reads from the Blend folder again.

> Using SSH? It's one command, run inside `admin/templates`:
> `cp -r blend aurox`

## Step 3: Upload the Aurox files over it

1. Upload the downloaded zip to your WHMCS folder and **Extract** it there.
2. When File Manager asks about existing files, choose **overwrite**.

Check that these files exist:

- `admin/templates/aurox/header.tpl`, the Aurox version. Open it and you'll see "Aurox Admin" at the top.
- `admin/templates/aurox/aurox/js/aurox-admin.js`
- `admin/templates/aurox/js/scripts.min.js`, copied from Blend in step 2.

> If your admin folder is renamed, the zip's `admin/` folder won't land in the right place. Upload the contents of `admin/templates/aurox/` from the zip into `YOUR-ADMIN-FOLDER/templates/aurox/` instead.

## Step 4: Switch your account to Aurox

1. Log in to WHMCS.
2. Go to **Configuration** (wrench icon) › **System Settings** › **Administrators**. On older versions it's **Setup › Staff Management › Administrator Users**.
3. Click **Edit** next to your user.
4. Set **Template** to **aurox** and click **Save Changes**.
5. Go to **Utilities › System › System Cleanup** and click **Empty Template Cache**. WHMCS keeps compiled copies of templates, and this makes sure you see the new files.
6. Hard refresh your browser (Ctrl + F5, or Cmd + Shift + R on a Mac). The footer should say **Aurox Admin 3.0.0**.

Start with just your own account. Once you're happy, move your team over, either from each user's Edit page or in one click with the companion addon (next step).

## Step 5 (optional): Turn on the companion addon

The template works on its own. The addon adds the **live dashboard** (income, revenue chart, what needs attention, tickets waiting, recent orders), live counters in the menu, a settings screen and one-click switching for your whole team. It only reads from your database.

1. The zip already put it at `modules/addons/auroxadmin/`.
2. Go to **Configuration › System Settings › Addon Modules**.
3. Find **Aurox Admin** and click **Activate**.
4. Click **Configure**, tick the admin roles that may open it under **Access Control**, adjust the settings, and **Save Changes**.
5. Open **Addons › Aurox Admin**. The status card should say "uploaded and complete". Use **Use Aurox for everyone** to switch your team.

The addon won't switch anyone to Aurox unless the template folder is complete, so nobody gets locked out by a half-finished upload.

---

## Make it yours

| What | Where |
|---|---|
| Brand name, logo, colour, starting theme and spacing | `admin/templates/aurox/settings.tpl`, or the addon settings if the addon is active |
| Dashboard shortcuts | `admin/templates/aurox/quicklinks.tpl` |
| Your own menu links | `admin/templates/aurox/menulinks.tpl` |
| Extra styles | the addon's *Custom CSS* setting |

Each file explains itself at the top. Open it in File Manager's editor, change the values in quotes, and save.

Each admin also has personal choices that live in their own browser: light or dark, comfortable or compact, pinned pages, snippets and page notes. They change these from the menu footer and the Help menu.

---

## Updating

### When WHMCS releases an update

Updating WHMCS updates Blend, but not your `aurox` copy of WHMCS's files. After a WHMCS update, refresh those files:

1. Update WHMCS as normal.
2. In File Manager, open `admin/templates/blend/` and select:
   - the folders `css`, `js`, `fonts`, `img`, `images` and `affiliates`
   - every `.tpl` file **except** `header.tpl`, `footer.tpl`, `nav.tpl` and `homepage.tpl`
3. **Copy** them to `admin/templates/aurox/` and **overwrite** when asked.
4. Clear WHMCS's template cache: **Utilities › System › System Cleanup › Empty Template Cache**.
5. Refresh.

Your Aurox files and settings aren't touched, because those four `.tpl` files and the `aurox/` folder are left alone.

**Big WHMCS releases** (a new major or minor version, like 8.13 to 9.0) sometimes change the admin header. If something looks wrong after one, check the [Releases page](https://github.com/GreatsLab/aurox/releases) for a matching Aurox update.

### When a new Aurox version comes out

1. Download the new zip.
2. **Keep copies** of your `settings.tpl`, `quicklinks.tpl` and `menulinks.tpl` (or use the addon for settings).
3. Upload and extract it over your current install, overwriting files.
4. Put your three files back.
5. Clear the template cache (see above) and refresh.

---

## Troubleshooting

**The page is blank, or shows a Smarty error about a missing file.**
Step 2 was skipped or didn't finish, so WHMCS's page files aren't in `admin/templates/aurox/`. Copy them from `blend` as described under "When WHMCS releases an update".

**It still looks like Blend, or like an older Aurox.**
Check the footer: it shows the Aurox version you're running. If it's old or missing:
1. Make sure your admin user is set to **aurox** (step 4).
2. Empty the template cache: **Utilities › System › System Cleanup › Empty Template Cache**.
3. Hard refresh (Ctrl + F5) or open a private window.
4. Still old? The new files didn't land. Check that `admin/templates/aurox/aurox/css/aurox-dashboard.css` exists on the server.

**The dashboard has no income chart or "Needs attention" card.**
Those come from the companion addon. Activate it (step 5) and make sure **Live dashboard** is ticked in its settings. Your admin role also needs the *View Income Totals* permission to see income figures.

**My changes to settings.tpl don't show.**
If the companion addon is active, its settings win over `settings.tpl`. Otherwise, empty the template cache (see Updating).

**I can't get into the admin area at all.**
Switch your user back to Blend from the database. In cPanel › phpMyAdmin, open your WHMCS database, click **SQL**, and run this (change the username):

```sql
UPDATE tbladmins SET template = 'blend' WHERE username = 'yourusername';
```

Then please [open an issue](https://github.com/GreatsLab/aurox/issues) with your WHMCS version and what you saw.

**Some third-party addon pages look light in dark mode.**
Some addons hard-code white backgrounds. Aurox catches most of them. If one slips through, tell me which addon in an issue.

---

## Removing Aurox

1. Switch everyone back to Blend: **Addons › Aurox Admin › Everyone back to Blend**, or edit each admin.
2. Deactivate the addon under **Addon Modules**.
3. Delete `admin/templates/aurox/` and `modules/addons/auroxadmin/`.

---

Aurox Admin is designed and built by **Chimnadindu Great Chibueze** · [github.com/GreatsLab/aurox](https://github.com/GreatsLab/aurox)
