<?php

/**
 * Palverse API v1.0.0 Release Smoke Test
 *
 * Safely tests the liveness and basic public contracts against a deployed API.
 * Requires PALVERSE_SMOKE_BASE_URL.
 */
$baseUrl = getenv('PALVERSE_SMOKE_BASE_URL') ?: 'http://127.0.0.1:8000';
$baseUrl = rtrim($baseUrl, '/');

echo "Starting Smoke Test against {$baseUrl}...\n\n";

function request(string $method, string $path, array $headers = [])
{
    global $baseUrl;
    $url = $baseUrl.$path;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    $formattedHeaders = [
        'Accept: application/json',
        'X-Request-ID: smoke-test-'.uniqid(),
    ];

    foreach ($headers as $key => $value) {
        $formattedHeaders[] = "$key: $value";
    }

    curl_setopt($ch, CURLOPT_HTTPHEADER, $formattedHeaders);

    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'status' => $status,
        'body' => json_decode($response, true) ?? ['_raw' => $response],
    ];
}

$tests = [
    [
        'name' => 'Health Endpoint',
        'method' => 'GET',
        'path' => '/api/v1/health',
        'expectedStatus' => 200,
    ],
    [
        'name' => 'Readiness Endpoint',
        'method' => 'GET',
        'path' => '/api/v1/ready',
        'expectedStatus' => 200,
    ],
    [
        'name' => 'Public Bootstrap',
        'method' => 'GET',
        'path' => '/api/v1/bootstrap',
        'expectedStatus' => 200,
    ],
    [
        'name' => 'Categories Listing',
        'method' => 'GET',
        'path' => '/api/v1/categories',
        'expectedStatus' => 200,
    ],
    [
        'name' => 'Missing Route (404 Test)',
        'method' => 'GET',
        'path' => '/api/v1/this-route-does-not-exist',
        'expectedStatus' => 404,
    ],
    [
        'name' => 'Unauthorized Access (401 Test)',
        'method' => 'GET',
        'path' => '/api/v1/auth/me',
        'expectedStatus' => 401,
    ],
];

$failed = 0;

foreach ($tests as $test) {
    echo str_pad("Testing {$test['name']}...", 40);

    $result = request($test['method'], $test['path']);

    if ($result['status'] === $test['expectedStatus']) {
        echo "✅ [{$result['status']}]\n";
    } else {
        echo "❌ [Expected {$test['expectedStatus']}, Got {$result['status']}]\n";
        $failed++;
    }
}

if ($failed > 0) {
    echo "\nSmoke test FAILED with {$failed} errors.\n";
    exit(1);
}

echo "\nSmoke test PASSED! ✅\n";
exit(0);
