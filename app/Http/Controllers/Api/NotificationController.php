<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class NotificationController extends Controller
{
    /**
     * Display a listing of the user's notifications.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return $this->errorResponse('User not authenticated', 401);
            }

            // Get query parameters
            $perPage = $request->input('per_page', 15);
            $page = $request->input('page', 1);
            $unreadOnly = $request->boolean('unread_only', false);
            $type = $request->input('type');

            // Build query
            $query = $user->notifications()->orderBy('created_at', 'desc');

            // Filter by unread only
            if ($unreadOnly) {
                $query->whereNull('read_at');
            }

            // Filter by type
            if ($type) {
                $query->where('type', 'LIKE', "%{$type}%");
            }

            // Paginate results
            $notifications = $query->paginate($perPage, ['*'], 'page', $page);

            // Transform the notifications
            $transformedNotifications = $notifications->getCollection()->map(function ($notification) {
                return $this->transformNotification($notification);
            });

            return $this->successResponse([
                'notifications' => $transformedNotifications,
                'pagination' => [
                    'current_page' => $notifications->currentPage(),
                    'last_page' => $notifications->lastPage(),
                    'per_page' => $notifications->perPage(),
                    'total' => $notifications->total(),
                    'has_more_pages' => $notifications->hasMorePages(),
                ],
                'unread_count' => $user->unreadNotifications()->count()
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching notifications: ' . $e->getMessage(), [
                'user_id' => $request->user()?->id,
                'trace' => $e->getTraceAsString()
            ]);
            
            return $this->errorResponse('Failed to fetch notifications', 500);
        }
    }

    /**
     * Get only unread notifications.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function unread(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return $this->errorResponse('User not authenticated', 401);
            }

            $limit = $request->input('limit', 20);
            
            $notifications = $user->unreadNotifications()
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get()
                ->map(function ($notification) {
                    return $this->transformNotification($notification);
                });

            return $this->successResponse([
                'notifications' => $notifications,
                'unread_count' => $user->unreadNotifications()->count()
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching unread notifications: ' . $e->getMessage(), [
                'user_id' => $request->user()?->id
            ]);
            
            return $this->errorResponse('Failed to fetch unread notifications', 500);
        }
    }

    /**
     * Get unread notifications count.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function unreadCount(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return $this->errorResponse('User not authenticated', 401);
            }

            $count = $user->unreadNotifications()->count();

            return $this->successResponse([
                'unread_count' => $count
            ]);

        } catch (\Exception $e) {
            \Log::error('Error getting unread count: ' . $e->getMessage(), [
                'user_id' => $request->user()?->id
            ]);
            
            return $this->errorResponse('Failed to get unread count', 500);
        }
    }

    /**
     * Display the specified notification.
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function show(Request $request, string $id): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return $this->errorResponse('User not authenticated', 401);
            }

            $notification = $user->notifications()->findOrFail($id);

            return $this->successResponse([
                'notification' => $this->transformNotification($notification)
            ]);

        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Notification not found', 404);
        } catch (\Exception $e) {
            \Log::error('Error fetching notification: ' . $e->getMessage(), [
                'user_id' => $request->user()?->id,
                'notification_id' => $id
            ]);
            
            return $this->errorResponse('Failed to fetch notification', 500);
        }
    }

    /**
     * Mark a notification as read.
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return $this->errorResponse('User not authenticated', 401);
            }

            $notification = $user->notifications()->findOrFail($id);

            if (!$notification->read_at) {
                $notification->markAsRead();
            }

            return $this->successResponse([
                'message' => 'Notification marked as read',
                'notification' => $this->transformNotification($notification->fresh())
            ]);

        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Notification not found', 404);
        } catch (\Exception $e) {
            \Log::error('Error marking notification as read: ' . $e->getMessage(), [
                'user_id' => $request->user()?->id,
                'notification_id' => $id
            ]);
            
            return $this->errorResponse('Failed to mark notification as read', 500);
        }
    }

    /**
     * Mark a notification as unread.
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function markAsUnread(Request $request, string $id): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return $this->errorResponse('User not authenticated', 401);
            }

            $notification = $user->notifications()->findOrFail($id);
            
            $notification->update(['read_at' => null]);

            return $this->successResponse([
                'message' => 'Notification marked as unread',
                'notification' => $this->transformNotification($notification->fresh())
            ]);

        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Notification not found', 404);
        } catch (\Exception $e) {
            \Log::error('Error marking notification as unread: ' . $e->getMessage(), [
                'user_id' => $request->user()?->id,
                'notification_id' => $id
            ]);
            
            return $this->errorResponse('Failed to mark notification as unread', 500);
        }
    }

    /**
     * Mark all notifications as read.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return $this->errorResponse('User not authenticated', 401);
            }

            $updatedCount = $user->unreadNotifications()->update(['read_at' => now()]);

            return $this->successResponse([
                'message' => 'All notifications marked as read',
                'updated_count' => $updatedCount,
                'unread_count' => 0
            ]);

        } catch (\Exception $e) {
            \Log::error('Error marking all notifications as read: ' . $e->getMessage(), [
                'user_id' => $request->user()?->id
            ]);
            
            return $this->errorResponse('Failed to mark all notifications as read', 500);
        }
    }

    /**
     * Mark multiple notifications as read.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function markMultipleAsRead(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return $this->errorResponse('User not authenticated', 401);
            }

            $validated = $request->validate([
                'notification_ids' => 'required|array|min:1',
                'notification_ids.*' => 'required|string|uuid'
            ]);

            $updatedCount = $user->notifications()
                ->whereIn('id', $validated['notification_ids'])
                ->whereNull('read_at')
                ->update(['read_at' => now()]);

            return $this->successResponse([
                'message' => "{$updatedCount} notifications marked as read",
                'updated_count' => $updatedCount,
                'unread_count' => $user->unreadNotifications()->count()
            ]);

        } catch (ValidationException $e) {
            return $this->errorResponse('Invalid input', 422, $e->errors());
        } catch (\Exception $e) {
            \Log::error('Error marking multiple notifications as read: ' . $e->getMessage(), [
                'user_id' => $request->user()?->id
            ]);
            
            return $this->errorResponse('Failed to mark notifications as read', 500);
        }
    }

    /**
     * Remove the specified notification.
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return $this->errorResponse('User not authenticated', 401);
            }

            $notification = $user->notifications()->findOrFail($id);
            $notification->delete();

            return $this->successResponse([
                'message' => 'Notification deleted successfully',
                'deleted_id' => $id,
                'unread_count' => $user->unreadNotifications()->count()
            ]);

        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Notification not found', 404);
        } catch (\Exception $e) {
            \Log::error('Error deleting notification: ' . $e->getMessage(), [
                'user_id' => $request->user()?->id,
                'notification_id' => $id
            ]);
            
            return $this->errorResponse('Failed to delete notification', 500);
        }
    }

    /**
     * Delete multiple notifications.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function destroyMultiple(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return $this->errorResponse('User not authenticated', 401);
            }

            $validated = $request->validate([
                'notification_ids' => 'required|array|min:1',
                'notification_ids.*' => 'required|string|uuid'
            ]);

            $deletedCount = $user->notifications()
                ->whereIn('id', $validated['notification_ids'])
                ->delete();

            return $this->successResponse([
                'message' => "{$deletedCount} notifications deleted successfully",
                'deleted_count' => $deletedCount,
                'unread_count' => $user->unreadNotifications()->count()
            ]);

        } catch (ValidationException $e) {
            return $this->errorResponse('Invalid input', 422, $e->errors());
        } catch (\Exception $e) {
            \Log::error('Error deleting multiple notifications: ' . $e->getMessage(), [
                'user_id' => $request->user()?->id
            ]);
            
            return $this->errorResponse('Failed to delete notifications', 500);
        }
    }

    /**
     * Create a test notification (for development/testing only).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function createTest(Request $request): JsonResponse
    {
        try {
            // Only allow in non-production environments
            if (app()->environment('production')) {
                return $this->errorResponse('Test notifications not allowed in production', 403);
            }

            $user = $request->user();
            
            if (!$user) {
                return $this->errorResponse('User not authenticated', 401);
            }

            $validated = $request->validate([
                'titre' => 'required|string|max:255',
                'commentaire' => 'nullable|string|max:1000',
                'priority' => 'nullable|string|in:critique,urgent,normal,info',
                'type' => 'nullable|string|max:50',
                'action_required' => 'nullable|boolean'
            ]);

            // Create notification using your existing notification class
            $user->notify(new \App\Notifications\ManualNotification(
                $validated['titre'],
                $validated['commentaire'] ?? '',
                $validated['priority'] ?? 'info',
                $validated['type'] ?? 'test',
                $validated['action_required'] ?? false
            ));

            return $this->successResponse([
                'message' => 'Test notification created successfully',
                'unread_count' => $user->unreadNotifications()->count()
            ], 201);

        } catch (ValidationException $e) {
            return $this->errorResponse('Invalid input', 422, $e->errors());
        } catch (\Exception $e) {
            \Log::error('Error creating test notification: ' . $e->getMessage(), [
                'user_id' => $request->user()?->id
            ]);
            
            return $this->errorResponse('Failed to create test notification', 500);
        }
    }

    /**
     * Get notification statistics for the user.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return $this->errorResponse('User not authenticated', 401);
            }

            $total = $user->notifications()->count();
            $unread = $user->unreadNotifications()->count();
            $read = $total - $unread;

            // Get notifications by priority (last 30 days)
            $priorities = $user->notifications()
                ->where('created_at', '>=', now()->subDays(30))
                ->get()
                ->groupBy(function ($notification) {
                    return $notification->data['priority'] ?? 'info';
                })
                ->map(function ($group) {
                    return $group->count();
                });

            // Get notifications by type (last 30 days)
            $types = $user->notifications()
                ->where('created_at', '>=', now()->subDays(30))
                ->get()
                ->groupBy(function ($notification) {
                    return $notification->data['type'] ?? 'general';
                })
                ->map(function ($group) {
                    return $group->count();
                });

            return $this->successResponse([
                'total_notifications' => $total,
                'unread_notifications' => $unread,
                'read_notifications' => $read,
                'read_percentage' => $total > 0 ? round(($read / $total) * 100, 2) : 0,
                'priorities_last_30_days' => $priorities,
                'types_last_30_days' => $types,
                'latest_notification' => $user->notifications()->latest()->first()?->created_at
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching notification statistics: ' . $e->getMessage(), [
                'user_id' => $request->user()?->id
            ]);
            
            return $this->errorResponse('Failed to fetch statistics', 500);
        }
    }

    /**
     * Transform notification for API response.
     *
     * @param mixed $notification
     * @return array
     */
    private function transformNotification($notification): array
    {
        $data = $notification->data;

        return [
            'id' => $notification->id,
            'type' => $notification->type,
            'read_at' => $notification->read_at?->toISOString(),
            'created_at' => $notification->created_at->toISOString(),
            'updated_at' => $notification->updated_at->toISOString(),
            'is_read' => $notification->read_at !== null,
            
            // Extract data fields
            'titre' => $data['titre'] ?? 'Notification',
            'commentaire' => $data['commentaire'] ?? null,
            'priority' => $data['priority'] ?? 'info',
            'icon' => $data['icon'] ?? '📄',
            'action_required' => $data['action_required'] ?? false,
            
            // Document related fields
            'document_id' => $data['document_id'] ?? null,
            'document_type' => $data['document_type'] ?? null,
            'days_until_expiration' => $data['days_until_expiration'] ?? null,
            'date_expiration' => $data['date_expiration'] ?? null,
            'periodicite' => $data['periodicite'] ?? null,
            
            // Marché related fields
            'marche_id' => $data['marche_id'] ?? null,
            'reference' => $data['reference'] ?? null,
            'objet' => $data['objet'] ?? null,
            'type_ao' => $data['type_ao'] ?? null,
            'estimation' => $data['estimation'] ?? null,
            'decision' => $data['decision'] ?? null,

            // Additional metadata
            'notification_type' => $data['type'] ?? 'general',
            'metadata' => [
                'user_id' => $notification->notifiable_id,
                'read_duration' => $notification->read_at 
                    ? $notification->read_at->diffInMinutes($notification->created_at) 
                    : null,
                'age_in_hours' => $notification->created_at->diffInHours(now()),
            ]
        ];
    }

    /**
     * Return a success response.
     *
     * @param mixed $data
     * @param int $status
     * @return JsonResponse
     */
    private function successResponse($data, int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'timestamp' => now()->toISOString()
        ], $status);
    }

    /**
     * Return an error response.
     *
     * @param string $message
     * @param int $status
     * @param mixed $errors
     * @return JsonResponse
     */
    private function errorResponse(string $message, int $status = 400, $errors = null): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
            'timestamp' => now()->toISOString()
        ];

        if ($errors) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $status);
    }
}