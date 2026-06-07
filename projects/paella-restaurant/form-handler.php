<?php
/**
 * Brasa y Mar — Reservation & newsletter handler
 * Drop into public_html/ alongside the HTML files. Requires PHP mail()
 * (available on Hostinger and most shared hosts).
 *
 * ┌─ EDIT THESE THREE BEFORE LAUNCH ──────────────────────────────────────────┐
 * │  RECIPIENT   — where reservation/newsletter emails are delivered.          │
 * │  SITE_NAME   — appears in the email subject.                               │
 * │  SITE_DOMAIN — your live domain (used for the From: address).              │
 * └────────────────────────────────────────────────────────────────────────────┘
 *
 * Design notes (hardened for non-technical shared-hosting deploys):
 *  - The origin check FAILS OPEN: it never blocks a real submission, so a
 *    forgotten SITE_DOMAIN can't 403 your guests. It only sets CORS headers.
 *  - Rate limiting FAILS OPEN: any filesystem hiccup allows the send rather
 *    than dropping a booking. It is a courtesy throttle, not a security gate.
 *  - If mail() fails, the request is logged to mail-fallback.log next to this
 *    file (if writable) so no reservation is silently lost.
 */

header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');

// ── Config — EDIT THESE ──────────────────────────────────────────────────────
const RECIPIENT   = 'heyimellizabeth@gmail.com'; // ← change to the restaurant's inbox
const SITE_NAME   = 'Brasa y Mar';
const SITE_DOMAIN = 'example.com';               // ← change to your live domain (no https://)

// ── Helpers ──────────────────────────────────────────────────────────────────

function json_out(int $code, array $body): void {
    http_response_code($code);
    echo json_encode($body);
    exit;
}

function sanitize(string $val): string {
    return htmlspecialchars(strip_tags(trim($val)), ENT_QUOTES, 'UTF-8');
}

function valid_email(string $email): bool {
    return strlen($email) <= 254 && filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Best-effort per-IP throttle. FAILS OPEN — returns true (allow) on any error.
function rate_ok(string $key): bool {
    try {
        $file = sys_get_temp_dir() . '/brasa_form_rate.json';
        $data = [];
        if (is_readable($file)) {
            $data = json_decode((string) @file_get_contents($file), true) ?: [];
        }
        $now = time();
        if (isset($data[$key]) && ($now - (int) $data[$key]) < 20) {
            return false; // submitted under 20s ago
        }
        $data[$key] = $now;
        @file_put_contents($file, json_encode($data), LOCK_EX);
        return true;
    } catch (\Throwable $e) {
        return true; // never block a booking because of a temp-file problem
    }
}

// Record a booking locally if mail() fails, so nothing is lost.
function log_fallback(string $subject, string $message): void {
    $line = '[' . date('Y-m-d H:i:s T') . "] {$subject}\n{$message}\n" . str_repeat('-', 60) . "\n";
    @file_put_contents(__DIR__ . '/mail-fallback.log', $line, FILE_APPEND | LOCK_EX);
}

function send_or_log(string $subject, string $message, string $replyTo): bool {
    $headers  = 'From: ' . SITE_NAME . ' <no-reply@' . SITE_DOMAIN . ">\r\n";
    $headers .= 'Reply-To: ' . $replyTo . "\r\n";
    $headers .= 'X-Mailer: PHP/' . phpversion();
    $sent = @mail(RECIPIENT, $subject, $message, $headers);
    if (!$sent) log_fallback($subject, $message);
    return (bool) $sent;
}

// ── CORS — set headers, but FAIL OPEN (never reject the request) ─────────────
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = ['https://' . SITE_DOMAIN, 'http://' . SITE_DOMAIN,
            'https://www.' . SITE_DOMAIN, 'http://www.' . SITE_DOMAIN];
if ($origin && in_array($origin, $allowed, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
}
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    json_out(204, []);
}

// ── Only POST ────────────────────────────────────────────────────────────────
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_out(405, ['ok' => false, 'message' => 'Method not allowed']);
}

// ── Parse body (form-encoded or JSON) ────────────────────────────────────────
$ct   = $_SERVER['CONTENT_TYPE'] ?? '';
$body = str_contains($ct, 'application/json')
    ? (json_decode((string) file_get_contents('php://input'), true) ?: [])
    : $_POST;

// ── Honeypot — bots fill the hidden "company" field; absorb silently ─────────
if (!empty($body['company'])) {
    json_out(200, ['ok' => true, 'message' => 'Thank you!']);
}

$type   = sanitize($body['_type'] ?? 'reservation');
$ip     = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

// ── Newsletter ───────────────────────────────────────────────────────────────
if ($type === 'newsletter') {
    $email = sanitize($body['email'] ?? '');
    if (!valid_email($email)) {
        json_out(422, ['ok' => false, 'message' => 'Please enter a valid email address.']);
    }
    if (!rate_ok('nl_' . $ip)) {
        json_out(429, ['ok' => false, 'message' => 'One moment — you just submitted. Please try again shortly.']);
    }
    $subject = SITE_NAME . ' — newsletter signup';
    $message = "New newsletter signup\n\nEmail: {$email}\nTime: " . date('Y-m-d H:i:s T');
    $ok = send_or_log($subject, $message, $email);
    json_out(200, ['ok' => true, 'message' => $ok
        ? "You're on the list — gracias!"
        : "You're on the list! (We'll confirm shortly.)"]);
}

// ── Reservation ──────────────────────────────────────────────────────────────
if ($type === 'reservation') {
    $name  = sanitize($body['name']  ?? '');
    $email = sanitize($body['email'] ?? '');
    $phone = sanitize($body['phone'] ?? '');
    $date  = sanitize($body['date']  ?? '');
    $time  = sanitize($body['time']  ?? '');
    $party = sanitize($body['party'] ?? '');
    $notes = sanitize($body['notes'] ?? '');

    if (!$name || !valid_email($email) || !$phone || !$date || !$time || !$party) {
        json_out(422, ['ok' => false, 'message' => 'Please fill in name, email, phone, date, time and party size.']);
    }
    if (strlen($notes) > 2000) {
        json_out(422, ['ok' => false, 'message' => 'Please shorten your notes a little.']);
    }
    if (!rate_ok('res_' . $ip)) {
        json_out(429, ['ok' => false, 'message' => 'We just received a request from you — please give it a moment.']);
    }

    $subject = SITE_NAME . " — reservation request from {$name}";
    $message =
        "New reservation request\n" .
        "------------------------\n" .
        "Name:    {$name}\n" .
        "Email:   {$email}\n" .
        "Phone:   {$phone}\n" .
        "Date:    {$date}\n" .
        "Time:    {$time}\n" .
        "Party:   {$party}\n" .
        "Notes:   " . ($notes ?: '—') . "\n\n" .
        "Submitted: " . date('Y-m-d H:i:s T');

    send_or_log($subject, $message, $email);
    // Always reassure the guest; delivery issues are captured in the fallback log.
    json_out(200, ['ok' => true, 'message' => "Thank you, {$name}! We'll confirm your table by email or phone shortly."]);
}

json_out(400, ['ok' => false, 'message' => 'Unknown form type.']);
