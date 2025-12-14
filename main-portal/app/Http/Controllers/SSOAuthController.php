<?php

namespace App\Http\Controllers;

use App\Models\SSOUser;
use App\Models\SSOUserSystem;
use App\Services\SSOService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class SSOAuthController extends Controller
{
    protected $ssoService;

    public function __construct(SSOService $ssoService)
    {
        $this->ssoService = $ssoService;
    }

    /**
     * Show login form
     */
    public function showLoginForm()
    {
        $systems = $this->ssoService->getAvailableSystems();
        return view('auth.login', compact('systems'));
    }

    /**
     * Handle login request
     */
    public function login(Request $request)
    {
        // Log the incoming request
        \Log::info('SSO Login attempt', [
            'email' => $request->email,
            'has_password' => !empty($request->password)
        ]);

        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)
                        ->withInput($request->except('password'));
        }

        // Find existing SSO user
        $ssoUser = SSOUser::where('email', $request->email)->first();

        // If user doesn't exist, create new one
        if (!$ssoUser) {
            $ssoUser = SSOUser::create([
                'email' => $request->email,
                'name' => explode('@', $request->email)[0], // Default name from email
                'password' => Hash::make($request->password),
                'status' => 'active',
                'role' => 'user' // Default role for new users
            ]);
        }

        // Verify password
        if (!Hash::check($request->password, $ssoUser->password)) {
            return back()->withErrors([
                'email' => 'Email atau password salah'
            ])->withInput($request->except('password'));
        }

        // Log the user in
        Auth::login($ssoUser);

        // Store password in session for dashboard access
        session(['sso_password' => $request->password]);

        // Auto-approve access to all systems for existing users
        $systems = ['balai', 'reguler', 'suisei', 'tuk'];
        foreach ($systems as $systemName) {
            SSOUserSystem::updateOrCreate(
                ['sso_user_id' => $ssoUser->id, 'system_name' => $systemName],
                [
                    'is_approved' => true,
                    'approval_method' => 'auto',
                    'approved_at' => now()
                ]
            );
        }

        \Log::info('User logged in successfully, redirecting to dashboard', [
            'email' => $ssoUser->email,
            'approved_systems' => $systems
        ]);

        // Redirect to dashboard to choose system
        return redirect()->route('dashboard');
    }

    /**
     * Redirect to target system from dashboard
     */
    public function redirectToSystem(Request $request)
    {
        Log::info('redirectToSystem called', [
            'system' => $request->get('system'),
            'has_session_sso_password' => session()->has('sso_password'),
            'is_authenticated' => Auth::check(),
            'session_id' => session()->getId()
        ]);

        $targetSystem = $request->get('system');

        if (!Auth::check()) {
            Log::error('User not authenticated in redirectToSystem');
            return redirect()->route('login')->with('error', 'Please login first.');
        }

        $user = Auth::user();
        Log::info('User authenticated', ['email' => $user->email, 'id' => $user->id]);

        // Get stored password from session
        $password = session('sso_password');

        if (!$password) {
            Log::error('SSO password not found in session');
            return redirect()->route('dashboard')
                ->with('error', 'Session expired. Please login again.');
        }

        // Check access to target system
        $accessResult = $this->ssoService->checkAndApproveUserAccess(
            $user->id,
            $targetSystem,
            $user->email
        );

        try {
            Log::info('Access result received', ['status' => $accessResult['status']]);

            if ($accessResult['status'] === 'approved') {
                Log::info('Access approved, generating token...');

                // Generate SSO token
                $token = $this->ssoService->generateSSOToken(
                    $user->id,
                    $targetSystem
                );

                // Get target system URL
                $systems = $this->ssoService->getAvailableSystems();

                Log::info('Available systems', ['systems' => array_keys($systems)]);
                Log::info('Target system requested', ['system' => $targetSystem]);

                if (!isset($systems[$targetSystem])) {
                    Log::error('System not found!', ['requested' => $targetSystem]);
                    return redirect()->route('dashboard')
                        ->with('error', 'Invalid system selected');
                }

                $targetUrl = $systems[$targetSystem]['url'];
                Log::info('Target URL resolved', ['url' => $targetUrl]);

                // Full redirect URL
                $redirectUrl = "{$targetUrl}/sso/callback?token={$token}";
                Log::info('About to redirect to', ['url' => $redirectUrl]);

                // Show loading bridge page first
                return view('auth.loading-bridge', [
                    'systemName' => $systems[$targetSystem]['name'],
                    'redirectUrl' => $redirectUrl
                ]);
            } else {
                // Debug logging
                Log::warning('Access not approved', [
                    'status' => $accessResult['status'],
                    'message' => $accessResult['message']
                ]);

                // Show pending approval page
                return redirect()->route('sso.pending.approval', [
                    'system' => $targetSystem,
                    'email' => $user->email
                ])->with('warning', $accessResult['message']);
            }
        } catch (\Exception $e) {
            Log::error('Exception in redirectToSystem', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('dashboard')
                ->with('error', 'An error occurred: ' . $e->getMessage());
        }
    }

    /**
     * Show pending approval page
     */
    public function pendingApproval(Request $request)
    {
        $systemName = $request->get('system');
        $email = $request->get('email');
        $systems = $this->ssoService->getAvailableSystems();

        return view('auth.pending-approval', [
            'system' => $systems[$systemName] ?? null,
            'email' => $email
        ]);
    }

    /**
     * Handle logout
     */
    public function logout()
    {
        Auth::logout();
        return redirect()->route('login')
            ->with('success', 'Logged out successfully');
    }
}
