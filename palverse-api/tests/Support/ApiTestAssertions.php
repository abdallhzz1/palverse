<?php

namespace Tests\Support;

use Illuminate\Testing\TestResponse;

trait ApiTestAssertions
{
    /**
     * Assert that the API response envelope matches the standard success structure.
     */
    protected function assertApiSuccess(TestResponse $response, ?string $expectedMessage = null): void
    {
        $response->assertSuccessful()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['success', 'message', 'data']);

        if ($expectedMessage !== null) {
            $response->assertJsonPath('message', $expectedMessage);
        }
    }

    /**
     * Recursively assert that the given response data does not contain
     * any forbidden keys that would expose internal state or secrets.
     *
     * Forbidden keys include: 'id' (numeric), 'password', 'remember_token',
     * 'tokenable_id', 'tokenable_type', 'path', 'access_token' (unless explicitly expected).
     *
     * @param  array  $allowList  Keys to temporarily allow (e.g., 'access_token' during login)
     */
    protected function assertNoInternalIds(TestResponse $response, array $allowList = []): void
    {
        $content = json_decode($response->getContent(), true);

        if (! is_array($content)) {
            return;
        }

        $this->walkAndAssertNoForbiddenKeys($content, $allowList);
    }

    /**
     * Helper to traverse arrays recursively and check for forbidden keys.
     */
    private function walkAndAssertNoForbiddenKeys(array $data, array $allowList, string $path = ''): void
    {
        $forbiddenKeys = [
            'id', // Internal numeric ID (should use public_id instead)
            'password',
            'remember_token',
            'tokenable_id',
            'tokenable_type',
            'access_token',
            'path', // Internal storage paths
        ];

        // Some legitimate pagination/system keys that might legitimately be 'id' or contain 'id'
        // But strict rule: "id" by itself is an internal numeric primary key and must not be exposed.
        $exceptions = [
            'public_id',
            'request_id',
            'client_id',
            'transaction_id',
        ];

        foreach ($data as $key => $value) {
            $currentPath = $path ? "{$path}.{$key}" : $key;

            if (in_array($key, $forbiddenKeys, true) && ! in_array($key, $allowList, true)) {
                $this->fail("Forbidden key '{$key}' found in response at '{$currentPath}'. Internal IDs or secrets must not be exposed.");
            }

            if (is_array($value)) {
                $this->walkAndAssertNoForbiddenKeys($value, $allowList, $currentPath);
            }
        }
    }
}
