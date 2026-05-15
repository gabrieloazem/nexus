<?php
$host = 'localhost';
$user = 'root';
$pass = '';
$db   = 'nexus';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    die(json_encode(['error' => 'Falha na conexão: ' . $e->getMessage()]));
}