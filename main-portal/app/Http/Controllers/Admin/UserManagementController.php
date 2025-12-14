<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;

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
                                'system_display' => ucfirst($systemName)
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
                    ->paginate($perPage);

                return response()->json($users);
            }

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}