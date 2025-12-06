<?php
/**
 * Plugin Name: CI Fixes — Force REST API + Debug
 */
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', '/tmp/wp-debug.log');
define('WP_DEBUG_DISPLAY', false);

// Force REST API to be accessible
add_filter('rest_authentication_errors', function($result) {
    if (!empty($result)) return $result;
    if (defined('REST_REQUEST') && REST_REQUEST) return true;
    return $result;
});

// Prevent "Are you sure you want to do this?" on REST API
add_filter('nonce_life', function() { return 86400; });
