<?php

use App\Http\Controllers\Admin\DatabaseAnalysisController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SSOAuthController;
use Illuminate\Support\Facades\Route;

// SSO Routes
Route::middleware('guest')->group(function () {
    Route::get('/', [SSOAuthController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [SSOAuthController::class, 'login'])
         ->middleware('readonly.db')
         ->name('login.submit');
});

// Route untuk redirect dari dashboard (tidak perlu guest middleware)
Route::get('/redirect-to-system', [SSOAuthController::class, 'redirectToSystem'])
     ->middleware('auth', 'readonly.db')
     ->name('sso.redirect');

Route::get('/pending-approval', [SSOAuthController::class, 'pendingApproval'])
     ->name('sso.pending.approval');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return view('dashboard');
    })->name('dashboard');

    // Admin Routes
    Route::prefix('admin')->name('admin.')->middleware('role:admin,super_admin')->group(function () {
        Route::get('/database-analysis', [DatabaseAnalysisController::class, 'analyzeUsersTable'])
            ->name('database.analysis');

        Route::get('/users', [UserManagementController::class, 'index'])
            ->name('users.index');
        Route::post('/users/check', [UserManagementController::class, 'checkUser'])
            ->name('users.check');
        Route::get('/system-info/{system}', [UserManagementController::class, 'getSystemInfo'])
            ->name('system.info');
        Route::post('/users/create', [UserManagementController::class, 'createUser'])
            ->name('users.create');
        Route::get('/users/{system}', [UserManagementController::class, 'getUsers'])
            ->where('system', 'all|balai|reguler|fg|tuk')
            ->name('users.list');
    });

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::post('/logout', [SSOAuthController::class, 'logout'])->name('logout');
});
