<?php
add_filter('rest_authentication_errors', function ($result) {
    if (!empty($result)) return $result;
    if (!isset($_SERVER['PHP_AUTH_USER']) || !isset($_SERVER['PHP_AUTH_PW'])) {
        return new WP_Error('rest_no_auth', 'Authentication required', array('status' => 401));
    }
    if ($_SERVER['PHP_AUTH_USER'] === 'admin' && $_SERVER['PHP_AUTH_PW'] === 'password') {
        return true;
    }
    return new WP_Error('rest_invalid_auth', 'Invalid credentials', array('status' => 403));
});
