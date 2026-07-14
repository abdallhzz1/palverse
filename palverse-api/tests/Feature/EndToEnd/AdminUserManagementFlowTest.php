<?php

namespace Tests\Feature\EndToEnd;

use App\Enums\UserStatus;

class AdminUserManagementFlowTest extends EndToEndTestCase
{
    public function test_admin_user_management_flow()
    {
        $admin = $this->createAdminUser();
        $adminToken = $admin->createToken('admin')->plainTextToken;

        // 1. Admin creates merchant.
        $merchantData = [
            'name' => 'Managed Merchant',
            'email' => 'managed@example.com',
            'password' => 'SecurePass1!',
            'password_confirmation' => 'SecurePass1!',
            'role' => 'merchant',
            'status' => UserStatus::Active->value,
        ];

        $createResponse = $this->withToken($adminToken)->postJson('/api/v1/admin/users/merchants', $merchantData);
        $this->assertApiSuccess($createResponse);
        $merchantId = $createResponse->json('data.public_id');

        // Verify Merchant can log in
        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => 'managed@example.com',
            'password' => 'SecurePass1!',
            'device_name' => 'test',
        ]);
        $this->assertApiSuccess($loginResponse);
        $merchantToken = $loginResponse->json('data.access_token');

        // 4. Admin suspends merchant.
        $suspendResponse = $this->withToken($adminToken)->patchJson("/api/v1/admin/users/{$merchantId}/suspend", [
            'name' => 'Managed Merchant',
            'status' => UserStatus::Suspended->value,
            'role' => 'merchant',
            'suspension_reason' => 'Violation',
        ]);
        $this->assertApiSuccess($suspendResponse);

        // 6. Merchant cannot log in.
        $loginResponse2 = $this->postJson('/api/v1/auth/login', [
            'email' => 'managed@example.com',
            'password' => 'SecurePass1!',
            'device_name' => 'test2',
        ]);
        $loginResponse2->assertStatus(403); // Suspended

        // 7. Admin reactivates merchant.
        $this->withToken($adminToken)->patchJson("/api/v1/admin/users/{$merchantId}/activate", [
            'name' => 'Managed Merchant',
            'status' => UserStatus::Active->value,
            'role' => 'merchant',
        ]);

        // 8. Merchant can log in again.
        $loginResponse3 = $this->postJson('/api/v1/auth/login', [
            'email' => 'managed@example.com',
            'password' => 'SecurePass1!',
            'device_name' => 'test3',
        ]);
        $this->assertApiSuccess($loginResponse3);

        // 10. Last-admin protection works.
        $suspendAdminResponse = $this->withToken($adminToken)->patchJson("/api/v1/admin/users/{$admin->public_id}/suspend", [
            'name' => 'Admin User',
            'status' => UserStatus::Suspended->value,
            'role' => 'admin',
            'suspension_reason' => 'Should fail',
        ]);
        $suspendAdminResponse->assertStatus(409); // Conflict (last admin)

        // 11. Admin resets merchant password.
        $resetResponse = $this->withToken($adminToken)->postJson("/api/v1/admin/users/{$merchantId}/reset-password", [
            'password' => 'NewAdminPass1!',
            'password_confirmation' => 'NewAdminPass1!',
        ]);
        $this->assertApiSuccess($resetResponse);

        // Merchant uses new password
        $loginResponse4 = $this->postJson('/api/v1/auth/login', [
            'email' => 'managed@example.com',
            'password' => 'NewAdminPass1!',
            'device_name' => 'test4',
        ]);
        $this->assertApiSuccess($loginResponse4);
    }
}
