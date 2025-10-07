<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\NotificationSalarieController;

// Routes pour les utilisateurs (guard web)
Route::middleware(['web', 'auth'])->prefix('notifications')->group(function () {
    Route::get('/', [NotificationController::class, 'index']);
    Route::get('/unread', [NotificationController::class, 'getUnread']);
    Route::get('/unread-count', [NotificationController::class, 'getUnreadCount']);
    Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/{id}', [NotificationController::class, 'destroy']);
});

// Routes pour les salariés (guard salarie)
Route::middleware(['web', 'auth:salarie'])->prefix('notifications-salarie')->group(function () {
    Route::get('/', [NotificationSalarieController::class, 'index']);
    Route::get('/unread', [NotificationSalarieController::class, 'getUnread']);
    Route::get('/unread-count', [NotificationSalarieController::class, 'getUnreadCount']);
    Route::post('/{id}/read', [NotificationSalarieController::class, 'markAsRead']);
    Route::post('/mark-all-read', [NotificationSalarieController::class, 'markAllAsRead']);
    Route::delete('/{id}', [NotificationSalarieController::class, 'destroy']);
});