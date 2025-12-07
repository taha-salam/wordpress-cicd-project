// wp-content/themes/twentytwentyfive/sentry-browser.js
(function() {
    var script = document.createElement('script');
    script.src = 'https://browser.sentry-cdn.com/8.0.0/bundle.min.js';
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);

    script.onload = function() {
        Sentry.init({
            dsn: '<?php echo getenv("SENTRY_DSN_JS") ?: "https://your-default-js-dsn@o123456.ingest.sentry.io/1234567"; ?>',  // Replace fallback
            release: 'wordpress-frontend@<?php echo substr(sha1(time()), 0, 7); ?>',
            environment: '<?php echo defined("WP_ENV") ? WP_ENV : "development"; ?>',
            integrations: [Sentry.browserTracingIntegration()],
            tracesSampleRate: 1.0,
        });
    };
})();
