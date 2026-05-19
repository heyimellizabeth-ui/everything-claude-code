<?php
/**
 * {{SITE_NAME}} — Form Handler
 * Drop into public_html/ alongside the HTML files.
 * Handles: newsletter signup, contact/booking form.
 * Requires PHP mail() — available on Hostinger and most shared hosts.
 */

header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');

// ── Config ─────────────────────────────────────────────────────────────────
const RECIPIENT   = '{{FORMS_RECIPIENT_EMAIL}}';
const SITE_NAME   = '{{SITE_NAME}}';
const SITE_DOMAIN = '{{SITE_DOMAIN}}';
const RATE_FILE   = sys_get_temp_dir() . '/form_rate_{{SITE_SHORT}}.json';

// ── Helpers ─────────────────────────────────────────────────────────────────

function json_out(int $code, array $body): void {
    http_response_code($code);
    echo json_encode($body);
    exit;
}

function sanitize(string $val): string {
    return htmlspecialchars(strip_tags(trim($val)), ENT_QUOTES, 'UTF-8');
}

function validate_email(string $email): bool {
    return strlen($email) <= 254 && filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// ── Rate limiting (per IP, 30 s window per form type) ──────────────────────

function rate_check(string $key): bool {
    $data = [];
    if (file_exists(RATE_FILE)) {
        $raw = file_get_contents(RATE_FILE);
        $data = json_decode($raw, true) ?? [];
    }
    $now   = time();
    $entry = $data[$key] ?? 0;
    if ($now - $entry < 30) return false; // too fast
    $data[$key] = $now;
    file_put_contents(RATE_FILE, json_encode($data));
    return true;
}

// ── CORS — only accept from own domain ─────────────────────────────────────

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== 'https://' . SITE_DOMAIN && $origin !== 'http://' . SITE_DOMAIN) {
    json_out(403, ['error' => 'forbidden']);
}
header('Access-Control-Allow-Origin: ' . $origin);
header('Access-Control-Allow-Methods: POST');

// ── Only POST ───────────────────────────────────────────────────────────────

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_out(405, ['error' => 'method not allowed']);
}

// ── Parse body ──────────────────────────────────────────────────────────────

$body = [];
$ct   = $_SERVER['CONTENT_TYPE'] ?? '';
if (str_contains($ct, 'application/json')) {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
} else {
    $body = $_POST;
}

$type = sanitize($body['_type'] ?? 'newsletter');

// ── Honeypot ────────────────────────────────────────────────────────────────

if (!empty($body['_gotcha'])) {
    json_out(200, ['ok' => true]); // silent absorb
}

// ── Newsletter signup ───────────────────────────────────────────────────────

if ($type === 'newsletter') {
    $email = sanitize($body['email'] ?? '');
    if (!validate_email($email)) {
        json_out(422, ['error' => 'invalid email']);
    }
    $ip_key = 'nl_' . ($_SERVER['REMOTE_ADDR'] ?? 'x');
    if (!rate_check($ip_key)) {
        json_out(429, ['error' => 'too many requests']);
    }

    $to      = RECIPIENT;
    $subject = SITE_NAME . ' — New newsletter signup';
    $message = "New newsletter signup from " . SITE_DOMAIN . "\n\nEmail: {$email}\nTime: " . date('Y-m-d H:i:s T');
    $headers = "From: no-reply@" . SITE_DOMAIN . "\r\nReply-To: {$email}\r\nX-Mailer: PHP/" . phpversion();

    $sent = mail($to, $subject, $message, $headers);
    json_out($sent ? 200 : 500, $sent ? ['ok' => true] : ['error' => 'mail failed']);
}

// ── Contact / booking form ──────────────────────────────────────────────────

if ($type === 'contact') {
    $name    = sanitize($body['name']    ?? '');
    $email   = sanitize($body['email']   ?? '');
    $subject = sanitize($body['subject'] ?? 'Enquiry');
    $message = sanitize($body['message'] ?? '');

    if (!$name || !validate_email($email) || !$message) {
        json_out(422, ['error' => 'missing required fields']);
    }
    if (strlen($message) > 4000) {
        json_out(422, ['error' => 'message too long']);
    }

    $ip_key = 'contact_' . ($_SERVER['REMOTE_ADDR'] ?? 'x');
    if (!rate_check($ip_key)) {
        json_out(429, ['error' => 'too many requests']);
    }

    $to       = RECIPIENT;
    $sub      = SITE_NAME . " — {$subject} from {$name}";
    $body_txt = "Name: {$name}\nEmail: {$email}\nSubject: {$subject}\n\n{$message}\n\nSent from: " . SITE_DOMAIN;
    $headers  = "From: no-reply@" . SITE_DOMAIN . "\r\nReply-To: {$email}\r\nX-Mailer: PHP/" . phpversion();

    $sent = mail($to, $sub, $body_txt, $headers);
    json_out($sent ? 200 : 500, $sent ? ['ok' => true] : ['error' => 'mail failed']);
}

json_out(400, ['error' => 'unknown form type']);
