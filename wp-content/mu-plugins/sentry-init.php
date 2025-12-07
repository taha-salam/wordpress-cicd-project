<?php
/**
 * Plugin Name: Sentry Monitoring (PHP) - Safe for SQE Project
 * Description: Only initializes Sentry if a valid DSN is provided
 */
if ( file_exists( __DIR__ . '/../../vendor/autoload.php' ) ) {
    require_once __DIR__ . '/../../vendor/autoload.php';

    $dsn = getenv('SENTRY_DSN_PHP') ?: '';
    if ( $dsn && $dsn !== '' && strpos($dsn, 'your-php-dsn') === false && filter_var($dsn, FILTER_VALIDATE_URL) ) {
        \Sentry\init([
            'dsn'         => $dsn,
            'environment' => getenv('WP_ENV') ?: 'development',
            'release'     => 'wordpress@' . get_bloginfo('version'),
            'traces_sample_rate' => 1.0,
        ]);
    }
}
