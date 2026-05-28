<?php
require_once __DIR__ . '/lib/mail.php';
require_once __DIR__ . '/lib/config.php';
define('RL_PATH', __DIR__ . '/data/rl_contact.json');

ob_start();
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');

function respond(bool $ok, string $error = '', int $status = 200): void {
    http_response_code($status);
    echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $error]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed', 405);
}

$name    = trim(strip_tags($_POST['name']    ?? ''));
$email   = trim((string) filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL));
$subject = trim(strip_tags($_POST['subject'] ?? ''));
$message = trim(strip_tags($_POST['message'] ?? ''));
$gotcha  = trim($_POST['_gotcha'] ?? '');

if ($gotcha !== '') {
    respond(false, 'bad request', 422);
}

$allowed_subjects = ['collaboration', 'press', 'booking', 'sponsor', 'general', ''];
if ($name === '' || strlen($name) > 100) {
    respond(false, 'Name is required', 422);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254) {
    respond(false, 'Valid email is required', 422);
}
if (!in_array($subject, $allowed_subjects, true)) {
    respond(false, 'Invalid subject', 422);
}
if ($message === '' || strlen($message) > 5000) {
    respond(false, 'Message is required', 422);
}

// Rate limiting — 300s window (5 min)
$ipHash = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . SECRET_SALT);
$rl     = [];
if (is_file(RL_PATH)) {
    $rl = json_decode(file_get_contents(RL_PATH), true) ?: [];
}
$now = time();
foreach ($rl as $k => $ts) {
    if ($now - $ts > 3600) unset($rl[$k]);
}
if (isset($rl[$ipHash]) && $now - $rl[$ipHash] < 300) {
    respond(false, 'Too many requests', 429);
}

$labels = [
    'collaboration' => 'Samenwerking / Collaboration',
    'press'         => 'Press & Media',
    'booking'       => 'Booking',
    'sponsor'       => 'Sponsor',
    'general'       => 'General',
    ''              => 'General',
];
$subjectLabel = $labels[$subject] ?? 'General';

$body = "Contact form submission from clubkudt.nl\n\n"
      . "Name:    {$name}\n"
      . "Email:   {$email}\n"
      . "Subject: {$subjectLabel}\n"
      . "Message:\n{$message}\n\n"
      . "---\nSent: " . date('Y-m-d H:i:s T');

$sent = sendMail("[KUDT Contact] {$subjectLabel}: {$name}", $body, $email, $name);
if (!$sent) {
    respond(false, 'Could not send message. Please email us directly at info@clubkudt.nl', 500);
}

$rl[$ipHash] = $now;
file_put_contents(RL_PATH, json_encode($rl), LOCK_EX);

respond(true);
