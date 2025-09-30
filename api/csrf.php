<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
if (empty($_SESSION['csrf'])) {
  $_SESSION['csrf'] = bin2hex(random_bytes(32));
}
echo json_encode(['token' => $_SESSION['csrf']]);
