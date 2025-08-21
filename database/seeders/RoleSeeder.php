<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Clear permission cache
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // ===== 1. Direction Générale (Admin - all access) =====
        $roleDG = Role::firstOrCreate(['name' => 'admin']);
        $roleDG->givePermissionTo(Permission::all()); // full access
        $dg = User::firstOrCreate(
            ['email' => 'direction.generale@gmail.com'],
            ['name' => 'Direction Générale', 'password' => bcrypt(env('DEFAULT_ADMIN_PASSWORD', 'admin123'))]
        );
        $dg->assignRole($roleDG);

        // ===== 2. Marchés & Marketing =====
        $roleMM = Role::firstOrCreate(['name' => 'marches-marketing']);
        $roleMM->givePermissionTo(['view markets', 'edit markets']);
        $mm = User::firstOrCreate(
            ['email' => 'marches.marketing@gmail.com'],
            ['name' => 'Marchés & Marketing', 'password' => bcrypt(env('DEFAULT_USER_PASSWORD', 'user1234'))]
        );
        $mm->assignRole($roleMM);

        // ===== 3. Études Techniques =====
        $roleET = Role::firstOrCreate(['name' => 'etudes-techniques']);
        $roleET->givePermissionTo(['view markets', 'edit technical studies']);
        $et = User::firstOrCreate(
            ['email' => 'etudes.techniques@gmail.com'],
            ['name' => 'Études Techniques', 'password' => bcrypt(env('DEFAULT_USER_PASSWORD', 'user1234'))]
        );
        $et->assignRole($roleET);

        // ===== 4. Suivi & Contrôle des Travaux =====
        $roleSCT = Role::firstOrCreate(['name' => 'suivi-controle']);
        $roleSCT->givePermissionTo(['view works', 'control works']);
        $sct = User::firstOrCreate(
            ['email' => 'suivi.controle.travaux@gmail.com'],
            ['name' => 'Suivi & Contrôle', 'password' => bcrypt(env('DEFAULT_USER_PASSWORD', 'user1234'))]
        );
        $sct->assignRole($roleSCT);

        // ===== 5. Qualité & Audit Technique =====
        $roleQAT = Role::firstOrCreate(['name' => 'qualite-audit']);
        $roleQAT->givePermissionTo(['view quality reports', 'audit technical works']);
        $qat = User::firstOrCreate(
            ['email' => 'qualite.audit.technique@gmail.com'],
            ['name' => 'Qualité & Audit', 'password' => bcrypt(env('DEFAULT_USER_PASSWORD', 'user1234'))]
        );
        $qat->assignRole($roleQAT);

        // ===== 6. Innovation & Transition Digitale =====
        $roleITD = Role::firstOrCreate(['name' => 'innovation-transition']);
        $roleITD->givePermissionTo(['manage digital transition', 'view innovations']);
        $itd = User::firstOrCreate(
            ['email' => 'innovation.transition.digitale@gmail.com'],
            ['name' => 'Innovation & Transition', 'password' => bcrypt(env('DEFAULT_USER_PASSWORD', 'user1234'))]
        );
        $itd->assignRole($roleITD);

        // ===== 7. Ressources Humaines =====
        $roleRH = Role::firstOrCreate(['name' => 'ressources-humaines']);
        $roleRH->givePermissionTo(['manage employees', 'view hr data']);
        $rh = User::firstOrCreate(
            ['email' => 'ressources.humaines@gmail.com'],
            ['name' => 'Ressources Humaines', 'password' => bcrypt(env('DEFAULT_USER_PASSWORD', 'user1234'))]
        );
        $rh->assignRole($roleRH);

        // ===== 8. Financier & Comptabilité =====
        $roleFC = Role::firstOrCreate(['name' => 'financier-comptabilite']);
        $roleFC->givePermissionTo(['view finance', 'manage accounts']);
        $fc = User::firstOrCreate(
            ['email' => 'financier.comptabilite@gmail.com'],
            ['name' => 'Financier & Comptabilité', 'password' => bcrypt(env('DEFAULT_USER_PASSWORD', 'user1234'))]
        );
        $fc->assignRole($roleFC);

        // ===== 9. Logistique & Moyens Généraux =====
        $roleLMG = Role::firstOrCreate(['name' => 'logistique-generaux']);
        $roleLMG->givePermissionTo(['manage logistics', 'view general resources']);
        $lmg = User::firstOrCreate(
            ['email' => 'logistique.generaux@gmail.com'],
            ['name' => 'Logistique Généraux', 'password' => bcrypt(env('DEFAULT_USER_PASSWORD', 'user1234'))]
        );
        $lmg->assignRole($roleLMG);

        // ===== 10. Communication Digitale =====
        $roleCDD = Role::firstOrCreate(['name' => 'communication-digitale']);
        $roleCDD->givePermissionTo(['manage communications', 'view documents']);
        $cdd = User::firstOrCreate(
            ['email' => 'communication.digitale@gmail.com'],
            ['name' => 'Communication Digitale', 'password' => bcrypt(env('DEFAULT_USER_PASSWORD', 'user1234'))]
        );
        $cdd->assignRole($roleCDD);

        // ===== 11. Juridique =====
        $roleAJCR = Role::firstOrCreate(['name' => 'juridique']);
        $roleAJCR->givePermissionTo(['manage legal', 'view regulations']);
        $ajcr = User::firstOrCreate(
            ['email' => 'juridique@gmail.com'],
            ['name' => 'Juridique', 'password' => bcrypt(env('DEFAULT_USER_PASSWORD', 'user1234'))]
        );
        $ajcr->assignRole($roleAJCR);

        // ===== 12. Fournisseurs & Sous-Traitants =====
        $roleFST = Role::firstOrCreate(['name' => 'fournisseurs-traitants']);
        $roleFST->givePermissionTo(['manage suppliers', 'view subcontractors']);
        $fst = User::firstOrCreate(
            ['email' => 'fournisseurs.traitants@gmail.com'],
            ['name' => 'Fournisseurs & Sous-Traitants', 'password' => bcrypt(env('DEFAULT_USER_PASSWORD', 'user1234'))]
        );
        $fst->assignRole($roleFST);

        // ===== 13. Salarie (Employee role) =====
        $roleSalarie = Role::firstOrCreate(['name' => 'salarie']);
        // You can add specific permissions for salarie if needed
        // $roleSalarie->givePermissionTo(['view own profile', 'update own data']);
    }
}