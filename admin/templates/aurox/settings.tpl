{*
 ==========================================================================
  Aurox Admin - your settings
 ==========================================================================
  Change the values in quotes below, save, and refresh the admin area.

  Using the optional "Aurox Admin" addon? Then you can change these in
  WHMCS instead (Addons > Aurox Admin) and this file is ignored.

  Tip: keep a copy of this file before you upload a new Aurox version,
  so your settings are not overwritten.
 ==========================================================================
*}

{* Name shown at the top of the menu *}
{if empty($auroxBrand)}{assign var="auroxBrand" value="WHMCS" scope="parent"}{/if}

{* Square logo (SVG or PNG). Leave empty for the built-in mark.
   Example: https://example.com/logo.png *}
{if empty($auroxLogo)}{assign var="auroxLogo" value="" scope="parent"}{/if}

{* Your brand colour as a hex code, e.g. #6d4aff *}
{if empty($auroxAccent)}{assign var="auroxAccent" value="#6d4aff" scope="parent"}{/if}

{* Starting theme for new admins: system, light or dark *}
{if empty($auroxMode)}{assign var="auroxMode" value="system" scope="parent"}{/if}

{* Starting spacing: comfortable or compact *}
{if empty($auroxDensity)}{assign var="auroxDensity" value="comfortable" scope="parent"}{/if}
