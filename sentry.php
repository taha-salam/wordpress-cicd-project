<?php
// sentry.php - Load this in wp-config.php
if (!class_exists('Sentry\SentrySdk')) {
    require_once __DIR__ . '/vendor/autoload.php';
}

use Sentry\SentrySdk;
use Sentry\State\Hub;
use Sentry\ClientBuilder;

$options = [
    'dsn' => getenv('SENTRY_DSN_PHP') ?: 'https://your-php-dsn-here@o123456.ingest.sentry.io/1234567',
    'environment' => getenv('WP_ENV') ?: 'development',
    'release' => getenv('SENTRY_RELEASE') ?: 'wordpress@local',
    'traces_sample_rate' => 1.0,
];

$client = ClientBuilder::create($options)->getClient();
SentrySdk::setCurrentHub(new Hub($client));
