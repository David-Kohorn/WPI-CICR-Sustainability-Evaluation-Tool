<?php

//Put all variables from .env into an accessable list with format
// [NameOfVar] -> value

$_ENV = [];

//.env exists 1 level above main/public code folder to keep it hidden 
$envPath = __DIR__ . '/../.env';

$lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

foreach ($lines as $line) {
    $line = trim($line);

    if ($line === '' || str_starts_with($line, '#')) {
        continue;
    }

    [$name, $value] = explode('=', $line, 2);

    $name = trim($name);
    $value = trim($value);
    $value = trim($value, "\"'");

    $_ENV[$name] = $value;
}
