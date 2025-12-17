<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\SSOUser;
use App\Models\SSOUserSystem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserManagementController extends Controller
{
    public function index()
    {
        return view('admin.user-management.index');
    }

    /**
     * Check user existence in all databases
     */
    public function checkUser(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $email = $request->email;
        $databases = [
            'balai' => 'mysql_balai',
            'reguler' => 'mysql_reguler',
            'fg' => 'mysql_fg',
            'tuk' => 'mysql_tuk'
        ];

        $results = [];

        foreach ($databases as $key => $connection) {
            try {
                $user = DB::connection($connection)
                    ->table('users')
                    ->where('email', $email)
                    ->first();

                $results[$key] = [
                    'found' => $user ? true : false,
                    'user' => $user,
                    'connection' => $connection
                ];
            } catch (\Exception $e) {
                $results[$key] = [
                    'found' => false,
                    'error' => $e->getMessage(),
                    'connection' => $connection
                ];
            }
        }

        return response()->json($results);
    }

    /**
     * Get structure and roles for specific database
     */
    public function getSystemInfo($system)
    {
        $connections = [
            'balai' => 'mysql_balai',
            'reguler' => 'mysql_reguler',
            'fg' => 'mysql_fg',
            'tuk' => 'mysql_tuk'
        ];

        if (!isset($connections[$system])) {
            return response()->json(['error' => 'Invalid system'], 400);
        }

        try {
            // Get table structure
            $structure = DB::connection($connections[$system])
                ->select("DESCRIBE users");

            // Get available roles
            $roles = DB::connection($connections[$system])
                ->table('users')
                ->select('role')
                ->distinct()
                ->pluck('role')
                ->filter()
                ->values()
                ->toArray();

            return response()->json([
                'structure' => $structure,
                'roles' => $roles
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Create user in target system
     */
    public function createUser(Request $request)
    {
        $request->validate([
            'system' => 'required|in:balai,reguler,fg,tuk',
            'email' => 'required|email',
            'name' => 'required|string|max:255',
            'role' => 'required|string',
            'password' => 'required|string|min:6'
        ]);

        $connections = [
            'balai' => 'mysql_balai',
            'reguler' => 'mysql_reguler',
            'fg' => 'mysql_fg',
            'tuk' => 'mysql_tuk'
        ];

        $system = $request->system;
        $connection = $connections[$system];

        try {
            // Check if user already exists
            $existing = DB::connection($connection)
                ->table('users')
                ->where('email', $request->email)
                ->first();

            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => 'User with this email already exists in ' . strtoupper($system)
                ], 400);
            }

            // Prepare user data
            $userData = [
                'email' => $request->email,
                'name' => $request->name,
                'role' => $request->role,
                'password' => Hash::make($request->password),
                'created_at' => now(),
                'updated_at' => now()
            ];

            // Add system-specific fields
            if ($system === 'tuk') {
                $userData['username'] = $request->username ?? $request->email;
                $userData['email_verified_at'] = now();
            }

            // Insert user
            $userId = DB::connection($connection)
                ->table('users')
                ->insertGetId($userData);

            return response()->json([
                'success' => true,
                'message' => 'User successfully created in ' . strtoupper($system),
                'user_id' => $userId
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to create user in {$system}: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error creating user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all users from a system with pagination (or all systems)
     */
    public function getUsers($system, Request $request)
    {
        $connections = [
            'balai' => 'mysql_balai',
            'reguler' => 'mysql_reguler',
            'fg' => 'mysql_fg',
            'tuk' => 'mysql_tuk'
        ];

        if ($system !== 'all' && !isset($connections[$system])) {
            return response()->json(['error' => 'Invalid system'], 400);
        }

        try {
            $search = $request->get('search', '');
            $perPage = $request->get('per_page', 25);

            if ($system === 'all') {
                // Get users from all systems
                $allUsers = [];
                $systems = ['balai', 'reguler', 'fg', 'tuk'];

                foreach ($systems as $systemName) {
                    try {
                        $query = DB::connection($connections[$systemName])
                            ->table('users');

                        if ($search) {
                            $query->where(function($q) use ($search) {
                                $q->where('name', 'like', "%{$search}%")
                                  ->orWhere('email', 'like', "%{$search}%");
                            });
                        }

                        $userData = $query->orderBy('created_at', 'desc')
                            ->limit($perPage)
                            ->get();

                        // Convert to array and add system info
                        foreach ($userData as $user) {
                            $userArray = [
                                'id' => $user->id,
                                'name' => $user->name,
                                'email' => $user->email,
                                'role' => $user->role,
                                'created_at' => $user->created_at,
                                'updated_at' => $user->updated_at,
                                'system' => $systemName,
                                'system_display' => strtoupper($systemName)
                            ];
                            $allUsers[] = $userArray;
                        }
                    } catch (\Exception $e) {
                        Log::error("Error fetching users from {$systemName}: " . $e->getMessage());
                    }
                }

                // Sort by name
                usort($allUsers, function($a, $b) {
                    return strcmp($a['name'] ?? '', $b['name'] ?? '');
                });

                return response()->json([
                    'data' => $allUsers,
                    'current_page' => 1,
                    'total' => count($allUsers),
                    'system' => 'all'
                ]);

            } else {
                // Get users from specific system
                $query = DB::connection($connections[$system])
                    ->table('users');

                if ($search) {
                    $query->where(function($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
                    });
                }

                $users = $query->orderBy('created_at', 'desc')
                    ->get();

                // Add system info to each user
                $usersWithSystem = $users->map(function($user) use ($system) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'created_at' => $user->created_at,
                        'updated_at' => $user->updated_at,
                        'system' => $system,
                        'system_display' => strtoupper($system)
                    ];
                });

                return response()->json([
                    'data' => $usersWithSystem->toArray(),
                    'current_page' => 1,
                    'total' => $usersWithSystem->count(),
                    'system' => $system
                ]);
            }

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get users available for import from target systems
     */
    public function getImportUsers(Request $request)
    {
        $request->validate([
            'system' => 'required|in:balai,reguler,fg,tuk,all',
            'search' => 'nullable|string',
            'per_page' => 'nullable|integer|max:100'
        ]);

        $system = $request->system;
        $search = $request->get('search', '');
        $perPage = $request->get('per_page', 50);

        $connections = [
            'balai' => 'mysql_balai',
            'reguler' => 'mysql_reguler',
            'fg' => 'mysql_fg',
            'tuk' => 'mysql_tuk'
        ];

        try {
            $importableUsers = [];
            $systems = $system === 'all' ? ['balai', 'reguler', 'fg', 'tuk'] : [$system];

            foreach ($systems as $systemName) {
                if (!isset($connections[$systemName])) continue;

                try {
                    $query = DB::connection($connections[$systemName])
                        ->table('users');

                    if ($search) {
                        $query->where(function($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%")
                              ->orWhere('email', 'like', "%{$search}%");
                        });
                    }

                    $users = $query->orderBy('name')
                        ->limit($perPage)
                        ->get();

                    foreach ($users as $user) {
                        // Check if user already exists in SSO
                        $existsInSSO = SSOUser::where('email', $user->email)->exists();

                        // Get additional system-specific fields
                        $userData = [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                            'role' => $user->role ?? 'user',
                            'system' => $systemName,
                            'system_display' => ucfirst($systemName),
                            'exists_in_sso' => $existsInSSO,
                            'can_import' => !$existsInSSO
                        ];

                        // Add system-specific fields
                        if ($systemName === 'tuk' && isset($user->username)) {
                            $userData['username'] = $user->username;
                        }

                        $importableUsers[] = $userData;
                    }
                } catch (\Exception $e) {
                    Log::error("Error fetching import users from {$systemName}: " . $e->getMessage());
                }
            }

            // Sort by name and system
            usort($importableUsers, function($a, $b) {
                $nameCompare = strcmp($a['name'] ?? '', $b['name'] ?? '');
                if ($nameCompare === 0) {
                    return strcmp($a['system'], $b['system']);
                }
                return $nameCompare;
            });

            return response()->json([
                'data' => $importableUsers,
                'total' => count($importableUsers),
                'system' => $system
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Import users from target system to main SSO
     */
    public function importUsers(Request $request)
    {
        $request->validate([
            'users' => 'required|array|min:1|max:50',
            'users.*.id' => 'required|integer',
            'users.*.name' => 'required|string|max:255',
            'users.*.email' => 'required|email',
            'users.*.system' => 'required|in:balai,reguler,fg,tuk',
            'create_password' => 'boolean',
            'default_password' => 'nullable|string|min:6'
        ]);

        $usersToImport = $request->users;
        $createPassword = $request->get('create_password', false);
        $defaultPassword = $request->get('default_password', 'password123');

        $connections = [
            'balai' => 'mysql_balai',
            'reguler' => 'mysql_reguler',
            'fg' => 'mysql_fg',
            'tuk' => 'mysql_tuk'
        ];

        $importResults = [];
        $successCount = 0;
        $errorCount = 0;

        DB::beginTransaction();

        try {
            foreach ($usersToImport as $userData) {
                $system = $userData['system'];
                $userId = $userData['id'];

                // Check if SSO user already exists
                if (SSOUser::where('email', $userData['email'])->exists()) {
                    $importResults[] = [
                        'email' => $userData['email'],
                        'name' => $userData['name'],
                        'status' => 'exists',
                        'message' => 'User already exists in SSO system'
                    ];
                    $errorCount++;
                    continue;
                }

                // Create SSO user
                $ssoUser = SSOUser::create([
                    'name' => $userData['name'],
                    'email' => $userData['email'],
                    'password' => Hash::make($createPassword ? $defaultPassword : 'password123'),
                    'email_verified_at' => now(),
                    'is_active' => true,
                    'approval_method' => 'auto',
                    'approved_at' => now(),
                    'approved_by' => auth()->id(),
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                // Create system connection
                SSOUserSystem::create([
                    'sso_user_id' => $ssoUser->id,
                    'system_name' => $system,
                    'system_user_id' => $userId,
                    'system_email' => $userData['email'],
                    'system_role' => $userData['role'] ?? 'user',
                    'is_active' => true,
                    'connection_status' => 'connected',
                    'connected_at' => now(),
                    'connected_by' => auth()->id(),
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                $importResults[] = [
                    'email' => $userData['email'],
                    'name' => $userData['name'],
                    'status' => 'success',
                    'message' => 'Successfully imported',
                    'sso_user_id' => $ssoUser->id
                ];
                $successCount++;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Import completed: {$successCount} successful, {$errorCount} errors",
                'results' => $importResults,
                'summary' => [
                    'total_processed' => count($usersToImport),
                    'successful' => $successCount,
                    'errors' => $errorCount
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Import users failed: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mass update SSO users
     */
    public function massUpdateUsers(Request $request)
    {
        $request->validate([
            'users' => 'required|array|min:1|max:100',
            'users.*.id' => 'required|integer|exists:sso_users,id',
            'operation' => 'required|in:activate,deactivate,delete,update_role,reset_password',
            'new_role' => 'required_if:operation,update_role|nullable|string|max:100',
            'send_email' => 'boolean'
        ]);

        $usersToUpdate = $request->users;
        $operation = $request->operation;
        $sendEmail = $request->get('send_email', false);
        $newRole = $request->get('new_role');

        $updateResults = [];
        $successCount = 0;
        $errorCount = 0;

        DB::beginTransaction();

        try {
            foreach ($usersToUpdate as $userData) {
                $ssoUser = SSOUser::find($userData['id']);

                if (!$ssoUser) {
                    $updateResults[] = [
                        'id' => $userData['id'],
                        'status' => 'not_found',
                        'message' => 'User not found'
                    ];
                    $errorCount++;
                    continue;
                }

                switch ($operation) {
                    case 'activate':
                        $ssoUser->is_active = true;
                        $ssoUser->save();
                        $message = 'User activated';
                        break;

                    case 'deactivate':
                        $ssoUser->is_active = false;
                        $ssoUser->save();
                        $message = 'User deactivated';
                        break;

                    case 'delete':
                        // Also delete user systems
                        SSOUserSystem::where('sso_user_id', $ssoUser->id)->delete();
                        $ssoUser->delete();
                        $message = 'User deleted';
                        break;

                    case 'update_role':
                        if ($newRole) {
                            // Update role in connected systems
                            SSOUserSystem::where('sso_user_id', $ssoUser->id)
                                ->update(['system_role' => $newRole]);
                            $message = "Role updated to {$newRole}";
                        } else {
                            $message = 'No role specified';
                            $errorCount++;
                            break;
                        }
                        break;

                    case 'reset_password':
                        $newPassword = substr(str_shuffle('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 12);
                        $ssoUser->password = Hash::make($newPassword);
                        $ssoUser->save();
                        $message = 'Password reset';

                        // In real implementation, send email with new password
                        if ($sendEmail) {
                            // TODO: Implement email sending
                            Log::info("Password reset email sent to {$ssoUser->email}");
                        }
                        break;

                    default:
                        $message = 'Invalid operation';
                        $errorCount++;
                        break;
                }

                $updateResults[] = [
                    'id' => $userData['id'],
                    'email' => $ssoUser->email ?? 'deleted',
                    'name' => $ssoUser->name ?? 'deleted',
                    'status' => $operation === 'delete' ? 'deleted' : 'success',
                    'message' => $message
                ];

                if ($operation !== 'delete') {
                    $successCount++;
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Mass update completed: {$successCount} successful, {$errorCount} errors",
                'results' => $updateResults,
                'summary' => [
                    'total_processed' => count($usersToUpdate),
                    'successful' => $successCount,
                    'errors' => $errorCount
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Mass update failed: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Mass update failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get SSO users for management
     */
    public function getSSOUsers(Request $request)
    {
        $search = $request->get('search', '');
        $perPage = $request->get('per_page', 25);
        $status = $request->get('status', 'all'); // all, active, inactive

        try {
            // Debug log
            Log::info("getSSOUsers called with params", [
                'search' => $search,
                'perPage' => $perPage,
                'status' => $status
            ]);

            // Get users from sso_users table in main_sso database
            $query = SSOUser::with(['userSystems' => function($relation) {
                $relation->select('id', 'sso_user_id', 'system_name', 'system_user_id', 'is_approved', 'last_login_at');
            }]);

            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            if ($status !== 'all') {
                $query->where('status', $status);
            }

            $users = $query->orderBy('created_at', 'desc')
                ->paginate($perPage);

            Log::info("Query executed successfully", ['total' => $users->total()]);

            // Transform data to include is_active field based on status
            $transformedUsers = collect($users->items())->map(function($user) {
                $userData = $user->toArray();
                $userData['is_active'] = $user->status === 'active';

                // Transform user systems data to match expected format
                if (isset($userData['user_systems'])) {
                    $userData['user_systems'] = collect($userData['user_systems'])->map(function($system) {
                        return [
                            'id' => $system['id'],
                            'sso_user_id' => $system['sso_user_id'],
                            'system_name' => $system['system_name'],
                            'system_role' => 'user', // Default role since not stored in this table
                            'connection_status' => $system['is_approved'] ? 'connected' : 'pending'
                        ];
                    });
                }

                return $userData;
            });

            // Return paginated response with transformed data
            return response()->json([
                'data' => $transformedUsers,
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'from' => $users->firstItem(),
                'to' => $users->lastItem()
            ]);

        } catch (\Exception $e) {
            Log::error("Error in getSSOUsers: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Create main account from target system user
     */
    public function createMainAccount(Request $request)
    {
        $request->validate([
            'system' => 'required|in:balai,reguler,fg,tuk',
            'user_id' => 'required|integer',
            'email' => 'required|email',
            'name' => 'required|string|max:255',
            'password' => 'required|string|min:6|confirmed'
        ]);

        $connections = [
            'balai' => 'mysql_balai',
            'reguler' => 'mysql_reguler',
            'fg' => 'mysql_fg',
            'tuk' => 'mysql_tuk'
        ];

        try {
            $system = $request->system;
            $userId = $request->user_id;
            $connection = $connections[$system];

            // Verify user exists in target system
            $targetUser = DB::connection($connection)
                ->table('users')
                ->where('id', $userId)
                ->first();

            if (!$targetUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found in target system'
                ], 404);
            }

            // Check if SSO user already exists
            if (SSOUser::where('email', $request->email)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'An account with this email already exists in SSO'
                ], 400);
            }

            DB::beginTransaction();

            // Create SSO user
            $ssoUser = SSOUser::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'email_verified_at' => now(),
                'is_active' => true,
                'approval_method' => 'auto',
                'approved_at' => now(),
                'approved_by' => auth()->id()
            ]);

            // Create system connection
            SSOUserSystem::create([
                'sso_user_id' => $ssoUser->id,
                'system_name' => $system,
                'system_user_id' => $targetUser->id,
                'system_email' => $targetUser->email,
                'system_role' => $targetUser->role ?? 'user',
                'is_active' => true,
                'connection_status' => 'connected',
                'connected_at' => now(),
                'connected_by' => auth()->id()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Main account created successfully',
                'sso_user' => [
                    'id' => $ssoUser->id,
                    'name' => $ssoUser->name,
                    'email' => $ssoUser->email,
                    'created_at' => $ssoUser->created_at
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Create main account failed: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create main account: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if name exists in SSO
     */
    public function checkSSONameExists(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255'
        ]);

        $exists = SSOUser::where('name', $request->name)->exists();

        return response()->json([
            'exists' => $exists
        ]);
    }

    /**
     * Search users across all databases for autocomplete
     */
    public function searchUsersAcrossSystems(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:2'
        ]);

        $query = $request->get('query');
        $results = [];
        $databases = [
            'balai' => 'mysql_balai',
            'reguler' => 'mysql_reguler',
            'fg' => 'mysql_fg',
            'tuk' => 'mysql_tuk'
        ];

        foreach ($databases as $key => $connection) {
            try {
                $users = DB::connection($connection)
                    ->table('users')
                    ->where('name', 'like', "%{$query}%")
                    ->limit(20)
                    ->get();

                foreach ($users as $user) {
                    // Use name as the key to merge duplicates
                    $nameKey = strtolower(trim($user->name));

                    if (!isset($results[$nameKey])) {
                        $results[$nameKey] = [
                            'name' => $user->name,
                            'systems' => []
                        ];
                    }

                    // Add system info if not already added
                    $systemExists = false;
                    foreach ($results[$nameKey]['systems'] as $system) {
                        if ($system['name'] === $key) {
                            $systemExists = true;
                            break;
                        }
                    }

                    if (!$systemExists) {
                        $results[$nameKey]['systems'][] = [
                            'name' => $key,
                            'display' => strtoupper($key),
                            'role' => $user->role ?? 'user'
                        ];
                    }
                }
            } catch (\Exception $e) {
                Log::error("Error searching users in {$key}: " . $e->getMessage());
            }
        }

        // Sort by name
        uksort($results, function($a, $b) {
            return strcasecmp($a, $b);
        });

        // Re-index array
        $finalResults = [];
        foreach ($results as $result) {
            $finalResults[] = $result;
        }

        return response()->json($finalResults);
    }

    /**
     * Create a new main SSO user directly
     */
    public function addMainUser(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:sso_users,name',
            'email' => 'required|email|unique:sso_users,email',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'nullable|string|max:100'
        ]);

        try {
            // Create SSO user
            $ssoUser = SSOUser::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'email_verified_at' => now(),
                'status' => 'active',
                'role' => $request->role ?? 'user'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Main user created successfully',
                'user' => [
                    'id' => $ssoUser->id,
                    'name' => $ssoUser->name,
                    'email' => $ssoUser->email,
                    'role' => $ssoUser->role,
                    'status' => $ssoUser->status,
                    'created_at' => $ssoUser->created_at
                ]
            ]);

        } catch (\Exception $e) {
            Log::error("Add main user failed: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create main user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update SSO user details
     */
    public function updateSSOUser(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:sso_users,name,' . $id,
            'email' => 'required|email|unique:sso_users,email,' . $id,
            'role' => 'nullable|string|max:100',
            'status' => 'nullable|in:active,inactive',
            'password' => 'nullable|string|min:6|confirmed'
        ]);

        try {
            $ssoUser = SSOUser::find($id);

            if (!$ssoUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            $ssoUser->name = $request->name;
            $ssoUser->email = $request->email;
            if ($request->has('role')) {
                $ssoUser->role = $request->role;
            }
            if ($request->has('status')) {
                $ssoUser->status = $request->status;
            }
            if ($request->filled('password')) {
                $ssoUser->password = Hash::make($request->password);
            }
            $ssoUser->save();

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
                'user' => [
                    'id' => $ssoUser->id,
                    'name' => $ssoUser->name,
                    'email' => $ssoUser->email,
                    'role' => $ssoUser->role,
                    'status' => $ssoUser->status,
                    'updated_at' => $ssoUser->updated_at
                ]
            ]);

        } catch (\Exception $e) {
            Log::error("Update SSO user failed: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user in target system
     */
    public function updateUser(Request $request, $id)
    {
        try {
            $request->validate([
                'system' => 'required|in:balai,reguler,suisei,tuk',
                'name' => 'required|string|max:255',
                'email' => 'required|email',
                'role' => 'required|in:user,admin,super_admin',
                'changePassword' => 'boolean',
                'password' => 'required_if:changePassword,true|min:6',
                'password_confirmation' => 'required_if:changePassword,true|same:password'
            ]);

            $system = $request->system;
            $connection = $this->getSystemConnection($system);

            if (!$connection) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid system specified'
                ], 400);
            }

            Log::info("Updating user {$id} in {$system}");

            // Check if user exists
            $existingUser = DB::connection($connection)
                ->table('users')
                ->where('id', $id)
                ->first();

            if (!$existingUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found in the system'
                ], 404);
            }

            // Prepare update data
            $updateData = [
                'name' => $request->name,
                'email' => $request->email,
                'role' => $request->role,
                'updated_at' => now()
            ];

            // Add password if it needs to be changed
            if ($request->changePassword) {
                $updateData['password'] = Hash::make($request->password);
            }

            // Update the user
            DB::connection($connection)
                ->table('users')
                ->where('id', $id)
                ->update($updateData);

            Log::info("Successfully updated user in {$system}: ID={$id}, Name={$request->name}");

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error("Update user failed: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete users from target system
     */
    public function deleteUsers(Request $request)
    {
        try {
            $request->validate([
                'system' => 'required|in:balai,reguler,suisei,tuk',
                'users' => 'required|array|min:1',
                'users.*.id' => 'required|integer'
            ]);

            $system = $request->system;
            $usersToDelete = $request->users;
            $connection = $this->getSystemConnection($system);

            if (!$connection) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid system specified'
                ], 400);
            }

            Log::info("Attempting to delete " . count($usersToDelete) . " users from {$system}");

            $deletedCount = 0;
            $errors = [];

            foreach ($usersToDelete as $user) {
                try {
                    // Check if user exists in the system
                    $existingUser = DB::connection($connection)
                        ->table('users')
                        ->where('id', $user['id'])
                        ->first();

                    if (!$existingUser) {
                        $errors[] = "User ID {$user['id']} not found in {$system}";
                        continue;
                    }

                    // Delete the user
                    DB::connection($connection)
                        ->table('users')
                        ->where('id', $user['id'])
                        ->delete();

                    Log::info("Deleted user from {$system}: ID={$user['id']}, Email={$existingUser->email}");
                    $deletedCount++;

                } catch (\Exception $e) {
                    $error = "Failed to delete user ID {$user['id']}: " . $e->getMessage();
                    Log::error($error);
                    $errors[] = $error;
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Successfully deleted {$deletedCount} users from {$system}",
                'deleted_count' => $deletedCount,
                'errors' => $errors,
                'total_attempted' => count($usersToDelete)
            ]);

        } catch (\Exception $e) {
            Log::error("Delete users operation failed: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete users: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get database connection for a system
     */
    private function getSystemConnection($system)
    {
        $connections = [
            'balai' => 'mysql_balai',
            'reguler' => 'mysql_reguler',
            'suisei' => 'mysql_fg',
            'tuk' => 'mysql_tuk'
        ];

        return $connections[$system] ?? null;
    }

    /**
     * Delete SSO user
     */
    public function deleteSSOUser($id)
    {
        try {
            Log::info("Attempting to delete SSO user with ID: " . $id);

            $ssoUser = SSOUser::find($id);

            if (!$ssoUser) {
                Log::warning("SSO User not found with ID: " . $id);
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            Log::info("Found SSO user: " . $ssoUser->email);

            // Get all systems where user has access
            $userSystems = SSOUserSystem::where('sso_user_id', $id)
                ->where('system_user_id', '!=', null)
                ->get();

            $errors = [];
            $deletedFromSystems = [];

            // Delete user from each target system
            foreach ($userSystems as $userSystem) {
                $systemName = $userSystem->system_name;
                $systemUserId = $userSystem->system_user_id;
                $connection = $this->getSystemConnection($systemName);

                if ($connection) {
                    try {
                        // Check if user exists in target system
                        $targetUser = DB::connection($connection)
                            ->table('users')
                            ->where('id', $systemUserId)
                            ->first();

                        if ($targetUser) {
                            // Delete from target system
                            DB::connection($connection)
                                ->table('users')
                                ->where('id', $systemUserId)
                                ->delete();

                            $deletedFromSystems[] = $systemName;
                            Log::info("Deleted user from {$systemName}: ID={$systemUserId}, Email={$targetUser->email}");
                        }
                    } catch (\Exception $e) {
                        $errors[] = "Failed to delete from {$systemName}: " . $e->getMessage();
                        Log::error("Failed to delete from {$systemName}: " . $e->getMessage());
                    }
                }
            }

            // Delete related user systems
            SSOUserSystem::where('sso_user_id', $id)->delete();
            Log::info("Deleted user systems for user ID: " . $id);

            // Delete the SSO user
            $ssoUser->delete();
            Log::info("Successfully deleted SSO user: " . $ssoUser->email);

            $message = "SSO user deleted successfully";
            if (!empty($deletedFromSystems)) {
                $message .= ". Also deleted from: " . implode(', ', array_map('strtoupper', $deletedFromSystems));
            }

            if (!empty($errors)) {
                $message .= ". Some errors occurred: " . implode('; ', $errors);
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'deleted_from_systems' => $deletedFromSystems,
                'errors' => $errors
            ]);

        } catch (\Exception $e) {
            Log::error("Delete SSO user failed: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update names for SSO users
     */
    public function updateSSOUserNames(Request $request)
    {
        $request->validate([
            'users' => 'required|array|min:1|max:50',
            'users.*' => 'required|integer|exists:sso_users,id',
            'new_name' => 'required|string|max:255'
        ]);

        $userIds = $request->users;
        $newName = $request->new_name;

        $updateResults = [];
        $successCount = 0;
        $errorCount = 0;

        try {
            foreach ($userIds as $userId) {
                $ssoUser = SSOUser::find($userId);

                if (!$ssoUser) {
                    $updateResults[] = [
                        'id' => $userId,
                        'status' => 'not_found',
                        'message' => 'User not found'
                    ];
                    $errorCount++;
                    continue;
                }

                $oldName = $ssoUser->name;
                $ssoUser->name = $newName;
                $ssoUser->save();

                $updateResults[] = [
                    'id' => $userId,
                    'old_name' => $oldName,
                    'new_name' => $newName,
                    'email' => $ssoUser->email,
                    'status' => 'success',
                    'message' => 'Name updated successfully'
                ];
                $successCount++;
            }

            return response()->json([
                'success' => true,
                'message' => "Name update completed: {$successCount} successful, {$errorCount} errors",
                'results' => $updateResults,
                'summary' => [
                    'total_processed' => count($userIds),
                    'successful' => $successCount,
                    'errors' => $errorCount
                ]
            ]);

        } catch (\Exception $e) {
            Log::error("Update SSO user names failed: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update names: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk update names for SSO users
     */
    public function bulkUpdateNames(Request $request)
    {
        $request->validate([
            'users' => 'required|array|min:1|max:50',
            'users.*' => 'required|array',
            'users.*.id' => 'required|integer',
            'users.*.system' => 'required|string',
            'users.*.user_id' => 'required|integer',
            'new_name' => 'required|string|max:255',
            'update_sso' => 'boolean',
            'update_target_systems' => 'boolean',
            'target_systems' => 'array',
            'target_systems.*' => 'in:balai,reguler,fg,tuk'
        ]);

        $usersToUpdate = $request->users;
        $newName = $request->new_name;
        $updateSSO = $request->get('update_sso', false);
        $updateTargetSystems = $request->get('update_target_systems', false);
        $targetSystems = $request->get('target_systems', []);

        $connections = [
            'balai' => 'mysql_balai',
            'reguler' => 'mysql_reguler',
            'fg' => 'mysql_fg',
            'tuk' => 'mysql_tuk'
        ];

        $updateResults = [];
        $successCount = 0;
        $errorCount = 0;

        DB::beginTransaction();

        try {
            foreach ($usersToUpdate as $userData) {
                $system = $userData['system'];
                $userId = $userData['user_id'];
                $ssoUserId = $userData['id'];
                $result = [
                    'system' => $system,
                    'old_name' => null,
                    'new_name' => $newName,
                    'updates' => []
                ];

                try {
                    // Get current name from target system
                    if (isset($connections[$system])) {
                        $targetUser = DB::connection($connections[$system])
                            ->table('users')
                            ->where('id', $userId)
                            ->first();

                        if ($targetUser) {
                            $result['old_name'] = $targetUser->name;
                            $result['target_user_id'] = $targetUser->id;
                            $result['target_email'] = $targetUser->email;

                            // Update name in target system if requested
                            if ($updateTargetSystems && (empty($targetSystems) || in_array($system, $targetSystems))) {
                                DB::connection($connections[$system])
                                    ->table('users')
                                    ->where('id', $userId)
                                    ->update([
                                        'name' => $newName,
                                        'updated_at' => now()
                                    ]);

                                $result['updates'][] = "Updated name in {$system}";
                            }
                        }
                    }

                    // Update SSO user name if requested and SSO user exists
                    if ($updateSSO && $ssoUserId) {
                        $ssoUser = SSOUser::find($ssoUserId);
                        if ($ssoUser) {
                            $result['sso_old_name'] = $ssoUser->name;
                            $ssoUser->name = $newName;
                            $ssoUser->save();
                            $result['updates'][] = "Updated name in SSO system";
                        }
                    }

                    $result['status'] = 'success';
                    $result['message'] = 'Name updated successfully';
                    $successCount++;

                } catch (\Exception $e) {
                    $result['status'] = 'error';
                    $result['message'] = $e->getMessage();
                    $errorCount++;
                    Log::error("Failed to update name for user {$userData['id']}: " . $e->getMessage());
                }

                $updateResults[] = $result;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Bulk name update completed: {$successCount} successful, {$errorCount} errors",
                'new_name' => $newName,
                'results' => $updateResults,
                'summary' => [
                    'total_processed' => count($usersToUpdate),
                    'successful' => $successCount,
                    'errors' => $errorCount
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Bulk name update failed: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Bulk name update failed: ' . $e->getMessage()
            ], 500);
        }
    }
}