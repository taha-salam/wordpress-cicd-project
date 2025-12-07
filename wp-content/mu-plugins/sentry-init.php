<?php
/**
 * Plugin Name: Sentry Monitoring (PHP)
 * Description: Initializes Sentry for PHP error monitoring
 */

if ( file_exists( __DIR__ . '/../../vendor/autoload.php' ) ) {
    require_once __DIR__ . '/../../vendor/autoload.php';

    $dsn = getenv('SENTRY_DSN_PHP');
    if ( $dsn && trim($dsn) && strpos($dsn, 'your-php-dsn') === false ) {
        \Sentry\init([
            'dsn'         => $dsn,
            'environment' => getenv('WP_ENV') ?: 'development',
            'release'     => 'wordpress@' . get_bloginfo('version'),
            'traces_sample_rate' => 1.0,
        ]);
    }
}
