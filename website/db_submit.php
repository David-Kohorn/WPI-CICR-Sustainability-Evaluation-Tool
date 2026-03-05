<?php
require 'env_loader.php';

// --- PDO connection ---
$pdo = new PDO(
    "mysql:host={$_ENV['DB_HOST']};dbname={$_ENV['DB_NAME']};charset=utf8mb4",
    $_ENV['DB_USER'],
    $_ENV['DB_PASS'],
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]
);

// --- Get JSON payload ---
$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['answersList']) || !isset($data['categoryScoresList'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid request"]);
    exit;
}

$answersList = $data['answersList'];
$categoryScoresList = $data['categoryScoresList'];

try {
    $pdo->beginTransaction();

    // 1. Create a new submission
    $pdo->exec("INSERT INTO Submission (submission_date) VALUES (DEFAULT)");
    $submissionId = $pdo->lastInsertId();

    // 2. Insert answers
    $stmtAnswer = $pdo->prepare("
        INSERT INTO Answer 
            (submission_id, question_id, option_id, slider_value, text_value, was_skipped) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    foreach ($answersList as $a) {
        $stmtAnswer->execute([
            $submissionId,
            $a['question_id'],
            $a['option_id'],
            $a['slider_value'],
            $a['text_value'],
            $a['was_skipped']
        ]);
    }

    // 3. Insert category scores
    $stmtScore = $pdo->prepare("
        INSERT INTO CategoryScore 
            (submission_id, category_id, score) 
        VALUES (?, ?, ?)
    ");
    foreach ($categoryScoresList as $s) {
        $stmtScore->execute([
            $submissionId,
            $s['category_id'],
            $s['score']
        ]);
    }

    $pdo->commit();

    // 4. Respond with success
    echo json_encode(["success" => true, "submission_id" => $submissionId]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}