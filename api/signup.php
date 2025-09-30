<?php
// ===========================
// signup.php – Tilmeldingsformular backend
// ===========================

// Indlæs PHPMailer
require __DIR__ . '/lib/PHPMailer/PHPMailer.php';
require __DIR__ . '/lib/PHPMailer/SMTP.php';
require __DIR__ . '/lib/PHPMailer/Exception.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// ====== SMTP INDSTILLINGER ======
const SMTP_HOST = 'mail.sikringsdagen.dk';
const SMTP_PORT = 587;
const SMTP_USER = 'info@sikringsdagen.dk';
const SMTP_PASS = 'DIN_EMAIL_ADGANGSKODE';
const MAIL_FROM = 'info@sikringsdagen.dk';
const MAIL_FROM_NAME = 'Sikringsdagen';
const ADMIN_EMAIL = 'info@sikringsdagen.dk';

// ====== HJÆLPEFUNKTION ======
function sendMail(string $to, string $subject, string $html, string $text = ''): bool {
  $m = new PHPMailer(true);
  try {
    $m->isSMTP();
    $m->Host = SMTP_HOST;
    $m->SMTPAuth = true;
    $m->Username = SMTP_USER;
    $m->Password = SMTP_PASS;
    $m->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $m->Port = SMTP_PORT;
    $m->CharSet = 'UTF-8';

    $m->setFrom(MAIL_FROM, MAIL_FROM_NAME);
    $m->addAddress($to);
    $m->isHTML(true);
    $m->Subject = $subject;
    $m->Body    = $html;
    $m->AltBody = $text ?: strip_tags($html);
    return $m->send();
  } catch (Exception $e) {
    error_log('Mail error: ' . $e->getMessage());
    return false;
  }
}

// ====== HÅNDTERING AF FORMULAR ======
header('Content-Type: application/json; charset=utf-8');

// 1) Honeypot – stop bots
if (!empty($_POST['website'] ?? '')) {
  echo json_encode(['ok' => true]);
  exit;
}

// 2) Hent og tjek felter
$fornavn   = trim((string)($_POST['fornavn'] ?? ''));
$efternavn = trim((string)($_POST['efternavn'] ?? ''));
$email     = trim((string)($_POST['email'] ?? ''));
$session   = trim((string)($_POST['session'] ?? ''));
$besked    = trim((string)($_POST['besked'] ?? ''));
$consent   = isset($_POST['consent']);

if ($fornavn === '' || $efternavn === '' || $session === '' || !$consent || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  echo json_encode(['error' => 'Udfyld alle felter korrekt.']);
  exit;
}

// 3) Send mail til arrangør
$okAdmin = sendMail(
  ADMIN_EMAIL,
  'Ny tilmelding – ' . $fornavn . ' ' . $efternavn,
  "<h3>Ny tilmelding til Sikringsdagen</h3>
   <ul>
     <li><b>Navn:</b> " . htmlspecialchars($fornavn . ' ' . $efternavn, ENT_QUOTES, 'UTF-8') . "</li>
     <li><b>E-mail:</b> " . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . "</li>
     <li><b>Session:</b> " . htmlspecialchars($session, ENT_QUOTES, 'UTF-8') . "</li>
     <li><b>Besked:</b> " . nl2br(htmlspecialchars($besked, ENT_QUOTES, 'UTF-8')) . "</li>
   </ul>"
);

// 4) Send bekræftelsesmail til deltager
$okUser = sendMail(
  $email,
  'Tak for din tilmelding til Sikringsdagen',
  "<p>Hej " . htmlspecialchars($fornavn, ENT_QUOTES, 'UTF-8') . ",</p>
   <p>Tak for din tilmelding til <b>Sikringsdagen</b>. Du er registreret til: <b>" . htmlspecialchars($session, ENT_QUOTES, 'UTF-8') . "</b>.</p>
   <p>Vi glæder os til at se dig!</p>
   <p>Venlig hilsen<br>Sikringsdagen Team</p>"
);

// 5) Giv svar til JavaScript (frontend)
if (!$okAdmin) {
  echo json_encode(['error' => 'Kunne ikke sende notifikation til arrangør.']);
  exit;
}
echo json_encode(['ok' => true]);
