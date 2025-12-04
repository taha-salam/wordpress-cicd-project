<?php
/**
 * Plugin Name: Force Enable REST API
 * Description: Ensures REST API is always enabled in CI
 */
add_filter('rest_authentication_errors', function ($result) {
    if (!empty($result)) {
        return $result;
    }
    // Allow unauthenticated access to REST API in CI
    if (defined('REST_REQUEST') && REST_REQUEST) {
        return true;
    }
    return $result;
});

// Ensure pretty permalinks work even if .htaccess is missing
add_action('generate_rewrite_rules', function ($wp_rewrite) {
    $wp_rewrite->non_wp_rules = array_merge(
        $wp_rewrite->non_wp_rules,
        [
            'index.php/.+' => 'index.php',
        ]
    );
});
