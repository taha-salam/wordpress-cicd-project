<?php
add_filter('rest_authentication_errors', function($result) {
    if (defined('REST_REQUEST') && REST_REQUEST) return true;
    return $result;
});

