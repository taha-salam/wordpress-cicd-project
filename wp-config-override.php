<?php
// Enable Application Passwords (built-in since WP 5.6)
define('APPLICATION_PASSWORDS_ENABLED', true);

// Allow Basic Auth for REST API
add_filter('application_password_is_api_request', '__return_true');

// Optional: Better error messages
define('REST_AUTHENTICATION_REQUIRE_HTTPS', false);
EOF
