<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\SSOService;
use Illuminate\Http\Request;

class SSOController extends Controller
{
    protected $ssoService;

    public function __construct(SSOService $ssoService)
    {
        $this->ssoService = $ssoService;
    }

    /**
     * Verify SSO token
     */
    public function verify(Request $request)
    {
        $request->validate(['token' => 'required']);

        $verification = $this->ssoService->verifySSOToken($request->token);

        if (!$verification) {
            return response()->json([
                'error' => 'Invalid or expired token'
            ], 401);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'email' => $verification['sso_user']->email,
                'name' => $verification['user_data']->name ?? $verification['sso_user']->name,
                'role' => $verification['user_data']->role ?? null,
                'system' => $verification['system']
            ]
        ]);
    }
}
