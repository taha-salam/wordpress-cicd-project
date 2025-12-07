<?php
/**
 * Twenty Twenty-Five functions and definitions
 *
 * @package WordPress
 * @subpackage Twenty_Twenty_Five
 * @since Twenty Twenty-Five 1.0
 */

if ( ! function_exists( 'twentytwentyfive_setup' ) ) :
	/**
	 * Sets up theme defaults and registers support for various WordPress features.
	 */
	function twentytwentyfive_setup() {
		// Add default posts and comments RSS feed links to head.
		add_theme_support( 'automatic-feed-links' );

		// Let WordPress manage the document title.
		add_theme_support( 'title-tag' );

		// Enable support for Post Thumbnails on posts and pages.
		add_theme_support( 'post-thumbnails' );

		// Add support for Block Styles.
		add_theme_support( 'wp-block-styles' );

		// Add support for editor styles.
		add_theme_support( 'editor-styles' );

		// Enqueue editor styles.
		add_editor_style( 'style.css' );

		// Add support for responsive embedded content.
		add_theme_support( 'responsive-embeds' );

		// Add support for custom line height.
		add_theme_support( 'custom-line-height' );

		// Add support for experimental link color control.
		add_theme_support( 'experimental-link-color' );

		// Add support for experimental spacing control.
		add_theme_support( 'custom-spacing' );
	}
endif;
add_action( 'after_setup_theme', 'twentytwentyfive_setup' );

/**
 * Enqueue theme styles and scripts.
 */
function twentytwentyfive_scripts() {
	// Enqueue theme stylesheet.
	wp_enqueue_style(
		'twentytwentyfive-style',
		get_stylesheet_uri(),
		array(),
		wp_get_theme()->get( 'Version' )
	);
}
add_action( 'wp_enqueue_scripts', 'twentytwentyfive_scripts' );

/**
 * === SENTRY BROWSER (FRONTEND) ERROR MONITORING ===
 * This part is added for your SQE project – it loads Sentry JavaScript SDK
 * on the frontend so that JavaScript errors are captured.
 */
function twentytwentyfive_enqueue_sentry_browser() {
	// Only load on frontend (not in admin or login pages)
	if ( is_admin() || $GLOBALS['pagenow'] === 'wp-login.php' ) {
		return;
	}

	// Load Sentry Browser SDK
	wp_enqueue_script(
		'sentry-browser-sdk',
		'https://browser.sentry-cdn.com/8.30.0/bundle.min.js',
		array(),
		null,
		false
	);

	// Inline initialization script (runs after SDK loads)
	wp_add_inline_script( 'sentry-browser-sdk', '
		Sentry.onLoad(function() {
			Sentry.init({
				dsn: "' . (getenv('SENTRY_DSN_JS') ?: 'https://your-js-dsn@o123456.ingest.sentry.io/1234567') . '",
				release: "wordpress-frontend@' . wp_get_theme()->get('Version') . '-' . substr(sha1(rand()), 0, 7) . '",
				environment: "' . (defined('WP_ENV') ? WP_ENV : 'development') . '",
				integrations: [Sentry.browserTracingIntegration()],
				tracesSampleRate: 1.0,
			});
		});
	' );
}
add_action( 'wp_enqueue_scripts', 'twentytwentyfive_enqueue_sentry_browser', 20 );
