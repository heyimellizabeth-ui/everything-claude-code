<?php
require_once __DIR__ . '/lib/mail.php';

define('SECRET_SALT', 'Kx7mP2nQ9vR4sT8wY3cL6dJ1eF5hG0uA');
define('CSV_PATH',    __DIR__ . '/data/subscribers.csv');
define('RL_PATH',     __DIR__ . '/data/rl_subscribe.json');

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

$email  = trim((string) filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL));
$gotcha = trim($_POST['_gotcha'] ?? '');

if ($gotcha !== '') {
    respond(false, 'bad request', 422);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254) {
    respond(false, 'Invalid email address', 422);
}

// Rate limiting — SHA-256 hash of IP so raw IPs are never stored
$ipHash = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . SECRET_SALT);
$rl     = [];
if (is_file(RL_PATH)) {
    $rl = json_decode(file_get_contents(RL_PATH), true) ?: [];
}
$now = time();
foreach ($rl as $k => $ts) {
    if ($now - $ts > 3600) unset($rl[$k]);
}
if (isset($rl[$ipHash]) && $now - $rl[$ipHash] < 60) {
    respond(false, 'Too many requests', 429);
}

// Duplicate check + append with exclusive lock
$fh = fopen(CSV_PATH, 'c');
if (!$fh || !flock($fh, LOCK_EX)) {
    respond(false, 'Server error', 500);
}
$existing = file(CSV_PATH, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
foreach ($existing as $line) {
    $parts = str_getcsv($line);
    if (isset($parts[1]) && strtolower($parts[1]) === strtolower($email)) {
        flock($fh, LOCK_UN);
        fclose($fh);
        respond(false, 'Already subscribed', 422);
    }
}
$escaped = '"' . str_replace('"', '""', $email) . '"';
fseek($fh, 0, SEEK_END);
fwrite($fh, date('c') . ',' . $escaped . "\n");
flock($fh, LOCK_UN);
fclose($fh);

// Non-blocking notification — subscriber is already saved; mail failure is acceptable
$body = "New subscriber:\n\nEmail: {$email}\nTime:  " . date('Y-m-d H:i:s T') . "\n";
if (!sendMail('New newsletter signup: ' . $email, $body)) {
    error_log('[subscribe.php] sendMail failed for: ' . $email);
}

$rl[$ipHash] = $now;
file_put_contents(RL_PATH, json_encode($rl));

respond(true);
