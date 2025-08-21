<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Marchés & Marketing
            'view markets',
            'edit markets',
            'delete markets',

            // Études Techniques
            'view technical studies',
            'edit technical studies',
            'delete technical studies',

            // Suivi & Contrôle des Travaux
            'view works',
            'control works',

            // Qualité & Audit Technique
            'view quality reports',
            'audit technical works',

            // Innovation & Transition Digitale
            'manage digital transition',
            'view innovations',

            // Ressources Humaines
            'manage employees',
            'view hr data',

            // Financier & Comptabilité
            'view finance',
            'manage accounts',

            // Logistique & Moyens Généraux
            'manage logistics',
            'view general resources',

            // Communication Digitale
            'manage communications',
            'view documents',

            // Juridique
            'manage legal',
            'view regulations',

            // Fournisseurs & Sous-Traitants
            'manage suppliers',
            'view subcontractors',
        ];


        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission, 'guard_name' => 'web']
            );
        }
    }
}
