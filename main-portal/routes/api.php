<?php

use App\Http\Controllers\API\SSOController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// SSO API Routes
Route::post('/sso/verify', [SSOController::class, 'verify'])
     ->middleware(['throttle:60,1', 'readonly.db'])
     ->name('sso.verify');