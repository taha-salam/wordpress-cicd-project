<?php
add_filter('rest_authentication_errors', function($result) {
    if (!empty($result)) return $result;
    return true;
});
