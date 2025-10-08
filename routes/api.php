<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Api\AuthController;

// PUBLIC API ROUTES
Route::post('/login', [AuthController::class, 'login']);

// PROTECTED API ROUTES
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Add your other protected routes here
    Route::resource('notifications', NotificationController::class);
});


Route::middleware(['web', 'auth'])->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index']);

    Route::post('/notifications', [NotificationController::class, 'store']);

    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    Route::get('/api/notifications', [NotificationController::class, 'index']);
    
    Route::get('/api/notifications/unread', [NotificationController::class, 'getUnread']);
    
    Route::post('/api/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
});

// TEST ROUTE (remove in production)
Route::get('/test', function () {
    return response()->json(['message' => 'API is working', 'timestamp' => now()]);
});