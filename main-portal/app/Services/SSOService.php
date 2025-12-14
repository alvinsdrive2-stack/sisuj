<?php

namespace App\Services;

use App\Models\SSOUser;
use App\Models\SSOUserSystem;
use App\Models\SSOLoginAttempt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class SSOService
{
    protected $connections = [
        'balai' => 'mysql_balai',
        'reguler' => 'mysql_reguler',
        'suisei' => 'mysql_fg',  // Suisei uses FG database
        'tuk' => 'mysql_tuk'
    ];

    /**
     * Check if email exists in target system (READ-ONLY)
     */
    public function checkEmailInTargetSystem($email, $systemName)
    {
        if (!isset($this->connections[$systemName])) {
            \Log::warning("Unknown system: {$systemName}");
            return null;
        }

        try {
            // Set connection to read-only mode
            DB::connection($this->connections[$systemName])->statement("SET SESSION TRANSACTION READ ONLY");

            // Read operation only - only get common fields that exist in all databases
            $user = DB::connection($this->connections[$systemName])
                ->table('users')
                ->where('email', $email)
                ->first(['id', 'name', 'email', 'role']);

            if ($user) {
                \Log::info("User found in {$systemName}: {$email}");
            } else {
                \Log::info("User not found in {$systemName}: {$email}");
            }

            return $user;
        } catch (\Exception $e) {
            \Log::error("Database READ error for {$systemName}: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Check and approve user access to system
     */
    public function checkAndApproveUserAccess($ssoUserId, $systemName, $email)
    {
        Log::info("Checking access for user {$email} to {$systemName}", ['sso_user_id' => $ssoUserId]);

        // First, check if user already has approved access
        $existingAccess = SSOUserSystem::where([
            'sso_user_id' => $ssoUserId,
            'system_name' => $systemName,
            'is_approved' => true
        ])->first();

        if ($existingAccess) {
            Log::info("User already has approved access to {$systemName}");
            // User already has approved access, no need to check database again
            SSOLoginAttempt::create([
                'sso_user_id' => $ssoUserId,
                'email' => $email,
                'system_name' => $systemName,
                'status' => 'success',
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent()
            ]);

            // Get user data from target system for fresh info
            $targetUserData = $this->checkEmailInTargetSystem($email, $systemName);

            return [
                'status' => 'approved',
                'message' => 'Akses diizinkan ke ' . ucfirst($systemName),
                'user_data' => $targetUserData
            ];
        }

        // Log login attempt
        $loginAttempt = SSOLoginAttempt::create([
            'sso_user_id' => $ssoUserId,
            'email' => $email,
            'system_name' => $systemName,
            'status' => 'pending_approval',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        // Check if email exists in target system (for first-time access)
        $targetUser = $this->checkEmailInTargetSystem($email, $systemName);

        if ($targetUser) {
            // Auto approve if email found
            $userSystem = SSOUserSystem::updateOrCreate(
                ['sso_user_id' => $ssoUserId, 'system_name' => $systemName],
                [
                    'system_user_id' => $targetUser->id,
                    'is_approved' => true,
                    'approval_method' => 'auto',
                    'approved_at' => now()
                ]
            );

            // Update login attempt status
            $loginAttempt->update(['status' => 'success']);

            return [
                'status' => 'approved',
                'message' => 'Email ditemukan di ' . ucfirst($systemName) . '. Akses di-approve otomatis.',
                'user_data' => $targetUser
            ];
        } else {
            // Email not found, require admin approval
            SSOUserSystem::updateOrCreate(
                ['sso_user_id' => $ssoUserId, 'system_name' => $systemName],
                [
                    'is_approved' => false,
                    'approval_method' => 'manual'
                ]
            );

            $loginAttempt->update(['status' => 'pending_approval']);

            return [
                'status' => 'pending_approval',
                'message' => 'Email tidak ditemukan di ' . ucfirst($systemName) . '. Menunggu approval admin.',
                'requires_admin_approval' => true
            ];
        }
    }

    /**
     * Generate SSO token
     */
    public function generateSSOToken($ssoUserId, $systemName)
    {
        $token = Str::random(60);

        // Store token in cache with 1 hour expiry
        $tokenData = [
            'sso_user_id' => $ssoUserId,
            'system_name' => $systemName,
            'expires_at' => now()->addHour()
        ];

        cache([
            "sso_token_{$token}" => $tokenData
        ], 3600);

        Log::info("SSO Token generated", [
            'token' => substr($token, 0, 10) . '...',
            'user_id' => $ssoUserId,
            'system' => $systemName,
            'expires_at' => $tokenData['expires_at']
        ]);

        return $token;
    }

    /**
     * Verify SSO token
     */
    public function verifySSOToken($token)
    {
        $cached = cache("sso_token_{$token}");

        if (!$cached || now()->greaterThan($cached['expires_at'])) {
            return null;
        }

        $ssoUser = SSOUser::find($cached['sso_user_id']);

        if (!$ssoUser) {
            return null;
        }

        // Check if user has access to the system
        $userSystem = SSOUserSystem::where([
            'sso_user_id' => $ssoUser->id,
            'system_name' => $cached['system_name'],
            'is_approved' => true
        ])->first();

        if (!$userSystem) {
            return null;
        }

        // Get user data from target system
        $targetUserData = $this->checkEmailInTargetSystem(
            $ssoUser->email,
            $cached['system_name']
        );

        return [
            'sso_user' => $ssoUser,
            'system' => $cached['system_name'],
            'user_data' => $targetUserData
        ];
    }

    /**
     * Get all available systems
     */
    public function getAvailableSystems()
    {
        return [
            'balai' => [
                'name' => 'Sistem Balai',
                'url' => 'http://localhost:8001', // Adjust port
                'description' => 'Manajemen Balai dan Sertifikasi'
            ],
            'reguler' => [
                'name' => 'Sistem Reguler',
                'url' => 'http://localhost:8002',
                'description' => 'Sistem untuk Regular Users'
            ],
            'suisei' => [
                'name' => 'Sistem FG/Suisei',
                'url' => 'http://localhost:8003',
                'description' => 'Fresh Graduate Management'
            ],
            'tuk' => [
                'name' => 'Sistem TUK',
                'url' => 'http://localhost:8004',
                'description' => 'Verifikasi TUK'
            ]
        ];
    }
}