<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NotificationController;

Route::middleware(['web', 'auth'])->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index']);

    Route::post('/notifications', [NotificationController::class, 'store']);

    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    Route::get('/api/notifications', [NotificationController::class, 'index']);
    
    Route::get('/api/notifications/unread', [NotificationController::class, 'getUnread']);
    
    Route::post('/api/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
});
