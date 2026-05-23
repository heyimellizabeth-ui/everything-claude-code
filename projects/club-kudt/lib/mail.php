<?php
// ── Mail config ───────────────────────────────────────────────────────────
// Default: mail() — works out of the box, no setup needed.
//
// To switch to SMTP (better deliverability on shared hosting):
//   Step 1. Fill in SMTP_HOST, SMTP_USER, SMTP_PASS below.
//           Use your Hostinger email credentials from hPanel → Email → Manage.
//   Step 2. Upload PHPMailer.php, SMTP.php, Exception.php into this lib/ folder.
//           Download from: https://github.com/PHPMailer/PHPMailer/tree/master/src
//   Step 3. Uncomment the PHPMailer block inside sendMail() below.
// ─────────────────────────────────────────────────────────────────────────
define('SMTP_HOST', '');        // e.g. smtp.hostinger.com
define('SMTP_PORT', 587);
define('SMTP_USER', '');        // e.g. noreply@clubkudt.nl
define('SMTP_PASS', '');
define('MAIL_FROM',      'noreply@clubkudt.nl');
define('MAIL_FROM_NAME', 'Club KUDT');
define('MAIL_TO',        'info@clubkudt.nl');

function sendMail(
    string $subject,
    string $body,
    string $replyToEmail = '',
    string $replyToName  = ''
): bool {
    if (SMTP_HOST !== '') {
        // ── Step 3: uncomment this block once PHPMailer files are in lib/ ──
        //
        // require_once __DIR__ . '/PHPMailer.php';
        // require_once __DIR__ . '/SMTP.php';
        // require_once __DIR__ . '/Exception.php';
        // $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        // try {
        //     $mail->isSMTP();
        //     $mail->Host       = SMTP_HOST;
        //     $mail->SMTPAuth   = true;
        //     $mail->Username   = SMTP_USER;
        //     $mail->Password   = SMTP_PASS;
        //     $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        //     $mail->Port       = SMTP_PORT;
        //     $mail->setFrom(MAIL_FROM, MAIL_FROM_NAME);
        //     $mail->addAddress(MAIL_TO);
        //     if ($replyToEmail) $mail->addReplyTo($replyToEmail, $replyToName);
        //     $mail->Subject = $subject;
        //     $mail->Body    = $body;
        //     return $mail->send();
        // } catch (\Exception $e) {
        //     return false;
        // }
        return false; // PHPMailer not yet installed — uncomment block above first
    }

    // mail() path — active until SMTP_HOST is filled in
    $headers = 'From: ' . MAIL_FROM . "\r\n";
    if ($replyToEmail) {
        $name    = $replyToName ? "{$replyToName} <{$replyToEmail}>" : $replyToEmail;
        $headers .= "Reply-To: {$name}\r\n";
    }
    $headers .= 'X-Mailer: PHP/' . phpversion();
    return mail(MAIL_TO, $subject, $body, $headers);
}
