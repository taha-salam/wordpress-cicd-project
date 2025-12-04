<?php
/**
 * Smart REST API Auth Bypass for CI/CD only
 * - Allows authenticated requests (admin/password) to work
 * - Still returns 401/403 on missing or wrong credentials
 * - Perfect for your test suite
 */

add_filter('rest_authentication_errors', function ($result) {
    if (!empty($result)) {
        return $result; // Let real errors through (401, 403, etc.)
    }

    // Only bypass if request has correct Basic Auth credentials
    if (!isset($_SERVER['PHP_AUTH_USER']) || !isset($_SERVER['PHP_AUTH_PW'])) {
        return new WP_Error('rest_no_auth', 'Authentication required', ['status' => 401]);
    }

    if ($_SERVER['PHP_AUTH_USER'] === 'admin' && $_SERVER['PHP_AUTH_PW'] === 'password') {
        return true; // Let it through
    }

    // Wrong password → return 403
    return new WP_Error('rest_invalid_auth', 'Invalid credentials', ['status' => 403]);
});
