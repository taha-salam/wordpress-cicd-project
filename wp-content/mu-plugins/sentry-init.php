<?php
/**
 * Plugin Name: Sentry Monitoring (PHP)
 * Description: Safe Sentry initialization for SQE project
 */
if ( file_exists( __DIR__ . '/../../vendor/autoload.php' ) ) {
    require_once __DIR__ . '/../../vendor/autoload.php';
    $dsn = getenv('SENTRY_DSN_PHP') ?: false;
    if ( $dsn && $dsn !== 'https://your-php-dsn@...' ) {
        \Sentry\init([
            'dsn'         => $dsn,
            'environment' => 'staging',
            'release'     => 'wordpress@' . get_bloginfo('version'),
            'traces_sample_rate' => 1.0,
        ]);
    }
}
