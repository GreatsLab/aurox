{*
 * Aurox Admin for WHMCS - page footer
 *
 * Author:  Chimnadindu Great Chibueze (https://github.com/GreatsLab)
 * Project: https://github.com/GreatsLab/aurox
 * License: MIT
 *}
            </div>{* /#contentarea *}
        </div>{* /.ax-body-wrap *}

        <footer class="footerbar ax-footer">
            <div class="copyright">
                <!-- Removal of the WHMCS copyright notice is strictly prohibited -->
                <!-- Branding removal entitlement does not permit this line to be removed -->
                Copyright &copy;
                <a href="https://www.whmcs.com/" target="_blank">WHMCS</a> {date('Y')}.
                All Rights Reserved.
            </div>
            <div class="links">
                <a href="https://www.whmcs.com/report-a-bug" target="_blank">Report a Bug</a>
                <span aria-hidden="true">·</span>
                <a href="https://go.whmcs.com/1893/docs" target="_blank">Documentation</a>
                <span aria-hidden="true">·</span>
                <a href="https://www.whmcs.com/contact" target="_blank">Contact Us</a>
                <span aria-hidden="true">·</span>
                <span class="ax-credit-line">Aurox Admin 3.1.0 by <a href="https://github.com/GreatsLab" target="_blank" rel="noopener">Chimnadindu Great Chibueze</a></span>
            </div>
        </footer>
    </div>{* /.ax-main *}

    {include file="$template/intellisearch-results.tpl"}
    {include file="$template/includes.tpl"}

    <script src="templates/{$template}/aurox/js/aurox-admin.js?v=3.1.0-{$versionHash}"></script>
    <script src="templates/{$template}/aurox/js/aurox-tools.js?v=3.1.0-{$versionHash}"></script>
    <script src="templates/{$template}/aurox/js/aurox-pages.js?v=3.1.0-{$versionHash}"></script>
    <script src="templates/{$template}/aurox/js/aurox-dashboard.js?v=3.1.0-{$versionHash}"></script>

    {$footeroutput}

</body>
</html>
