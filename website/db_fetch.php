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

// --- Load categories ---
$categories = $pdo->query("
    SELECT id, title_english, title_spanish, description_english, description_spanish 
    FROM Category 
    ORDER BY id
")->fetchAll();

$categories = array_map(fn($c) => [
    "id" => (int)$c["id"],
    "title" => ["en" => $c["title_english"], "es" => $c["title_spanish"]],
    "description" => ["en" => $c["description_english"], "es" => $c["description_spanish"]]
], $categories);

// --- Load questions + options ---
$rows = $pdo->query("
    SELECT q.id AS question_id, q.type, q.is_demographic, q.category_id,
           q.text_english, q.text_spanish, q.min_slider_value, q.max_slider_value,
           q.min_slider_score, q.max_slider_score, q.slider_step_size,
           o.id AS option_id, o.label_english, o.label_spanish, o.weight
    FROM QuestionInfo q
    LEFT JOIN QuestionOption o ON q.id = o.question_id
    ORDER BY q.id, o.id
")->fetchAll();

$questions = [];
foreach ($rows as $r) {
    $qid = $r['question_id'];
    if (!isset($questions[$qid])) {
        $questions[$qid] = [
            "id" => (int)$qid,
            "type" => $r["type"],
            "is_demographic" => (bool)$r["is_demographic"],
            "score_maximum" => isset($r["score_maximum"]) ? (int)$r["score_maximum"] : 0,
            "category_id" => $r["category_id"] !== null ? (int)$r["category_id"] : null,
            "text" => ["en" => $r["text_english"], "es" => $r["text_spanish"]],
            "slider_config" => $r["type"] === "slider" ? [
                "min_value" => (int)$r["min_slider_value"],
                "max_value" => (int)$r["max_slider_value"],
                "min_score" => (int)$r["min_slider_score"],
                "max_score" => (int)$r["max_slider_score"],
                "step" => (int)$r["slider_step_size"]
            ] : null,
            "options" => []
        ];
    }
    if ($r["option_id"]) {
        $questions[$qid]["options"][] = [
            "id" => (int)$r["option_id"],
            "label" => ["en" => $r["label_english"], "es" => $r["label_spanish"]],
            "weight" => (int)$r["weight"]
        ];
    }
}

$questions = array_values($questions);

// --- Output JSON ---
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    "categories" => $categories,
    "questions" => $questions
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>