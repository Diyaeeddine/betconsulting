<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Définir toutes les permissions de votre application
        $permissions = [
            'module documentation',
            'module marche public',
            'module marche global',
            'les marches',
            'decision ao',
            
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }
    }
}