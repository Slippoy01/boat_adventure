<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

$host = 'localhost';
$dbname = 'btsbmuww_scores';
$username = 'btsbmuww_scores';
$password = 'E2m2i1r1###';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Cek apakah request ambil komentar
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (isset($_GET['comments'])) {
            $stmt = $pdo->query('SELECT comment, timestamp FROM comments ORDER BY id DESC LIMIT 20');
            $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($comments);
        } else {
            $stmt = $pdo->query('SELECT name, score FROM leaderboard ORDER BY score DESC LIMIT 10');
            $leaderboard = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($leaderboard);
        }
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($data['name']) && isset($data['score'])) {
            // Simpan skor
            $stmt = $pdo->prepare('INSERT INTO leaderboard (name, score) VALUES (:name, :score)');
            $stmt->execute([
                ':name' => $data['name'],
                ':score' => $data['score']
            ]);
            echo json_encode(['message' => 'Score added successfully']);
        } elseif (isset($data['comment'])) {
            // Simpan komentar
            $stmt = $pdo->prepare('INSERT INTO comments (comment) VALUES (:comment)');
            $stmt->execute([':comment' => $data['comment']]);
            echo json_encode(['message' => 'Comment added successfully']);
        } else {
            echo json_encode(['error' => 'Invalid POST data']);
        }

        exit;
    }
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}
