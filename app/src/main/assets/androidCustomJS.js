/* Custom JavaScript for IDLIX Android Application */
(function() {
    'use strict';

    // 1. Silent / Stealth Popup & Popunder Blocker
    // Overrides window.open so external ad popups are silently absorbed without breaking the player.
    const originalWindowOpen = window.open;
    window.open = function(url, target, features) {
        if (!url || url === 'about:blank') {
            return {
                closed: false,
                focus: function() {},
                blur: function() {},
                close: function() { this.closed = true; },
                location: { href: '', replace: function() {}, assign: function() {} },
                document: { write: function() {}, open: function() {}, close: function() {} }
            };
        }

        try {
            const parsed = new URL(url, window.location.href);
            // Allow internal navigation within IDLIX
            if (parsed.hostname.includes('idlixku') || parsed.hostname.includes('idlix')) {
                return originalWindowOpen.call(window, url, target, features);
            }
        } catch (e) {}

        // External ad popunder detected - silently absorb
        console.log('[AdBlock-Stealth] Absorbed external ad popup:', url);
        return {
            closed: false,
            focus: function() {},
            blur: function() {},
            close: function() { this.closed = true; },
            location: { href: '', replace: function() {}, assign: function() {} },
            document: { write: function() {}, open: function() {}, close: function() {} }
        };
    };

    // 2. Intercept Click Hijacking on Fake Ad Overlays / External Links
    document.addEventListener('click', function(e) {
        try {
            const anchor = e.target && e.target.closest ? e.target.closest('a') : null;
            if (anchor && anchor.href) {
                const targetUrl = new URL(anchor.href, window.location.href);
                // If it's an HTTP/HTTPS link to an external site (not IDLIX)
                if (targetUrl.protocol.startsWith('http') &&
                    !targetUrl.hostname.includes('idlixku') &&
                    !targetUrl.hostname.includes('idlix')) {
                    console.log('[AdBlock-Stealth] Blocked ad click redirect:', anchor.href);
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                }
            }
        } catch (err) {}
    }, true); // Capture phase: intercepts before player/ad scripts

    // 3. Orientation Change & Fullscreen Exit Protection
    // Prevents player scripts from triggering exitFullscreen when phone is tilted or held upright
    window.addEventListener('orientationchange', function(e) {
        e.stopImmediatePropagation();
    }, true);

})();
