<?php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

class WP_Backend_Helper
{
    public function sanitizePostTitle(string $title): string
    {
        $title = trim(strip_tags($title));
        if (strlen($title) > 200) {
            $title = substr($title, 0, 200);
        }
        return $title;
    }

    public function isValidPostTitle(string $title): bool
    {
        // First trim and sanitize, then check length
        $title = trim(strip_tags($title));
        return strlen($title) >= 1 && strlen($title) <= 200;
    }

    public function generateSlug(string $title): string
    {
        $slug = strtolower(trim($title));
        $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
        $slug = preg_replace('/-+/', '-', $slug);
        return trim($slug, '-');
    }

    public function isValidEmail(string $email): bool
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    public function isStrongPassword(string $password): bool
    {
        return strlen($password) >= 8;
    }

    public function generateExcerpt(string $content, int $wordCount = 55): string
    {
        $words = explode(' ', strip_tags($content));
        if (count($words) <= $wordCount) {
            return $content;
        }
        $excerpt = implode(' ', array_slice($words, 0, $wordCount));
        return $excerpt . '...';
    }

    public function isValidPostStatus(string $status): bool
    {
        $validStatuses = ['publish', 'draft', 'pending', 'private', 'trash'];
        return in_array($status, $validStatuses);
    }
}

class WordPressBackendUnitTest extends TestCase
{
    private WP_Backend_Helper $helper;

    protected function setUp(): void
    {
        $this->helper = new WP_Backend_Helper();
    }

    public function test_sanitize_post_title_removes_html(): void
    {
        $dirtyTitle = '<script>alert("xss")</script>Hello World';
        $result = $this->helper->sanitizePostTitle($dirtyTitle);
        
        $this->assertSame('alert("xss")Hello World', $result);
        $this->assertStringNotContainsString('<script>', $result);
    }

    public function test_sanitize_post_title_truncates_long_titles(): void
    {
        $longTitle = str_repeat('a', 250);
        $result = $this->helper->sanitizePostTitle($longTitle);
        
        $this->assertSame(200, strlen($result));
    }

    public function test_valid_post_titles_are_accepted(): void
    {
        $this->assertTrue($this->helper->isValidPostTitle('My Blog Post'));
        $this->assertTrue($this->helper->isValidPostTitle('A'));
        $this->assertTrue($this->helper->isValidPostTitle(str_repeat('x', 200)));
    }

    public function test_invalid_post_titles_are_rejected(): void
    {
        $this->assertFalse($this->helper->isValidPostTitle(''));
        $this->assertFalse($this->helper->isValidPostTitle('   '));
        $this->assertFalse($this->helper->isValidPostTitle(str_repeat('x', 201)));
    }

    public function test_slug_generation_from_title(): void
    {
        $this->assertSame('hello-world', $this->helper->generateSlug('Hello World!'));
        $this->assertSame('test-post-2024', $this->helper->generateSlug('Test Post 2024'));
        $this->assertSame('wordpress-is-awesome', $this->helper->generateSlug('WordPress is Awesome!!!'));
    }

    public function test_slug_removes_special_characters(): void
    {
        $this->assertSame('test-post', $this->helper->generateSlug('Test@#$Post'));
        $this->assertSame('hello-world', $this->helper->generateSlug('Hello___World'));
    }

    public function test_email_validation(): void
    {
        $this->assertTrue($this->helper->isValidEmail('user@example.com'));
        $this->assertTrue($this->helper->isValidEmail('admin@wordpress.org'));
        
        $this->assertFalse($this->helper->isValidEmail('invalid-email'));
        $this->assertFalse($this->helper->isValidEmail('@example.com'));
        $this->assertFalse($this->helper->isValidEmail('user@'));
    }

    public function test_password_strength_validation(): void
    {
        $this->assertTrue($this->helper->isStrongPassword('password123'));
        $this->assertTrue($this->helper->isStrongPassword('MyStr0ng!Pass'));
        
        $this->assertFalse($this->helper->isStrongPassword('weak'));
        $this->assertFalse($this->helper->isStrongPassword('1234567'));
    }

    public function test_excerpt_generation_default_length(): void
    {
        $content = str_repeat('word ', 100);
        $excerpt = $this->helper->generateExcerpt($content);
        
        $words = explode(' ', trim(str_replace('...', '', $excerpt)));
        $this->assertSame(55, count($words));
        $this->assertStringEndsWith('...', $excerpt);
    }

    public function test_excerpt_generation_custom_length(): void
    {
        $content = str_repeat('word ', 50);
        $excerpt = $this->helper->generateExcerpt($content, 10);
        
        $words = explode(' ', trim(str_replace('...', '', $excerpt)));
        $this->assertSame(10, count($words));
    }

    public function test_excerpt_no_ellipsis_for_short_content(): void
    {
        $content = 'Short content here';
        $excerpt = $this->helper->generateExcerpt($content);
        
        $this->assertSame($content, $excerpt);
        $this->assertStringNotContainsString('...', $excerpt);
    }

    public function test_valid_post_statuses(): void
    {
        $this->assertTrue($this->helper->isValidPostStatus('publish'));
        $this->assertTrue($this->helper->isValidPostStatus('draft'));
        $this->assertTrue($this->helper->isValidPostStatus('pending'));
        $this->assertTrue($this->helper->isValidPostStatus('private'));
        $this->assertTrue($this->helper->isValidPostStatus('trash'));
    }

    public function test_invalid_post_status_rejected(): void
    {
        $this->assertFalse($this->helper->isValidPostStatus('invalid'));
        $this->assertFalse($this->helper->isValidPostStatus('approved'));
        $this->assertFalse($this->helper->isValidPostStatus(''));
    }
}
