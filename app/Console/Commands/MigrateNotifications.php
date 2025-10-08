<?php

namespace App\Console\Commands;

use App\Models\Notification as OldNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MigrateNotifications extends Command
{
    protected $signature = 'notifications:migrate';
    protected $description = 'Migrate old notifications to Laravel notifications table';

    public function handle()
    {
        $oldNotifications = OldNotification::all();

        foreach ($oldNotifications as $old) {
            DB::table('notifications')->insert([
                'id' => \Illuminate\Support\Str::uuid(),
                'type' => 'App\\Notifications\\GenericNotification',
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $old->user_id,
                'data' => json_encode([
                    'titre' => $old->titre,
                    'commentaire' => $old->commentaire,
                    'type' => $old->type,
                    'priority' => 'info',
                    'icon' => '📄',
                ]),
                'read_at' => $old->read_at,
                'created_at' => $old->created_at,
                'updated_at' => $old->updated_at,
            ]);
        }

        $this->info('✅ Migration completed!');
    }
}