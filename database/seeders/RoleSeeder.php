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
        $dg = User::firstOrCreate(
            ['email' => 'direction.generale@gmail.com'],
            [
                'name' => 'Direction Générale',
                'password' => bcrypt(env('DEFAULT_ADMIN_PASSWORD', 'admin123'))
            ]
        );
        $dg->assignRole($roleDG);

        // ===== 2. Marchés & Marketing =====
        $roleMM = Role::firstOrCreate(['name' => 'marches-marketing']);
        $mm = User::firstOrCreate(
            ['email' => 'marches.marketing@gmail.com'],
            [
                'name' => 'Marchés & Marketing',
                'password' => bcrypt(env('DEFAULT_USER_PASSWORD', 'user1234'))
            ]
        );
        $mm->assignRole($roleMM);

        // ===== 3. Études Techniques =====
        $roleET = Role::firstOrCreate(['name' => 'etudes-techniques']);
        $et = User::firstOrCreate(
            ['email' => 'etudes.techniques@gmail.com'],
            [
                'name' => 'Études Techniques',
                'password' => bcrypt(env('DEFAULT_USER_PASSWORD', 'user1234'))
            ]
        );
        $et->assignRole($roleET);

        // ===== 4. Suivi & Contrôle des Travaux =====
        $roleSCT = Role::firstOrCreate(['name' => 'suivi-controle']);
        $sct = User::firstOrCreate(
            ['email' => 'suivi.controle.travaux@gmail.com'],
            [
                'name' => 'Suivi & Contrôle',
                'password' => bcrypt(env('DEFAULT_USER_PASSWORD', 'user1234'))
            ]
        );
        $sct->assignRole($roleSCT);

        // ===== 5. Qualité & Audit Technique =====
        $roleQAT = Role::firstOrCreate(['name' => 'qualite-audit']);
        $qat = User::firstOrCreate(
            ['email' => 'qualite.audit.technique@gmail.com'],
            [
                'name' => 'Qualité & Audit',
                'password' => bcrypt(env('DEFAULT_USER_PASSWORD', 'user1234'))
            ]
        );
        $qat->assignRole($roleQAT);

        // ===== 6. Innovation & Transition Digitale =====
        $roleITD = Role::firstOrCreate(['name' => 'innovation-transition']);
        $itd = User::firstOrCreate(
            ['email' => 'innovation.transition.digitale@gmail.com'],
            [
                'name' => 'Innovation & Transition',
                'password' => bcrypt(env('DEFAULT_USER_PASSWORD', 'user1234'))
            ]
        );
        $itd->assignRole($roleITD);

        // ===== 7. Ressources Humaines =====
        $roleRH = Role::firstOrCreate(['name' => 'ressources-humaines']);
        $rh = User::firstOrCreate(
            ['email' => 'ressources.humaines@gmail.com'],
            [
                'name' => 'Ressources Humaines',
                'password' => bcrypt(env('DEFAULT_USER_PASSWORD', 'user1234'))
            ]
        );
        $rh->assignRole($roleRH);

        // ===== 8. Financier & Comptabilité =====
        $roleFC = Role::firstOrCreate(['name' => 'financier-comptabilite']);
        $fc = User::firstOrCreate(
            ['email' => 'financier.comptabilite@gmail.com'],
            [
                'name' => 'Financier & Comptabilité',
                'password' => bcrypt(env('DEFAULT_USER_PASSWORD', 'user1234'))
            ]
        );
        $fc->assignRole($roleFC);

        // ===== 9. Logistique & Moyens Généraux =====
        $roleLMG = Role::firstOrCreate(['name' => 'logistique-generaux']);
        $lmg = User::firstOrCreate(
            ['email' => 'logistique.generaux@gmail.com'],
            [
                'name' => 'Logistique Généraux',
                'password' => bcrypt(env('DEFAULT_USER_PASSWORD', 'user1234'))
            ]
        );
        $lmg->assignRole($roleLMG);

        // ===== 10. Communication Digitale =====
        $roleCDD = Role::firstOrCreate(['name' => 'communication-digitale']);
        $cdd = User::firstOrCreate(
            ['email' => 'communication.digitale@gmail.com'],
            [
                'name' => 'Communication Digitale',
                'password' => bcrypt(env('DEFAULT_USER_PASSWORD', 'user1234'))
            ]
        );
        $cdd->assignRole($roleCDD);

        // ===== 11. Juridique =====
        $roleAJCR = Role::firstOrCreate(['name' => 'juridique']);
        $ajcr = User::firstOrCreate(
            ['email' => 'juridique@gmail.com'],
            [
                'name' => 'Juridique',
                'password' => bcrypt(env('DEFAULT_USER_PASSWORD', 'user1234'))
            ]
        );
        $ajcr->assignRole($roleAJCR);

        // ===== 12. Fournisseurs & Sous-Traitants =====
        $roleFST = Role::firstOrCreate(['name' => 'fournisseurs-traitants']);
        $fst = User::firstOrCreate(
            ['email' => 'fournisseurs.traitants@gmail.com'],
            [
                'name' => 'Fournisseurs & Sous-Traitants',
                'password' => bcrypt(env('DEFAULT_USER_PASSWORD', 'user1234'))
            ]
        );
        $fst->assignRole($roleFST);

        // ===== 13. Salarié =====
        $roleSalarie = Role::firstOrCreate(['name' => 'salarie']);
        $employee = User::firstOrCreate(
            ['email' => 'employee@gmail.com'],
            [
                'name' => 'Employee Sample',
                'password' => bcrypt(env('DEFAULT_USER_PASSWORD', 'user1234'))
            ]
        );
        $employee->assignRole($roleSalarie);

        // ===== PERMISSIONS ASSIGNMENTS =====
        // Admin = all permissions
        $roleDG->givePermissionTo(Permission::all());

        // Example fine-grained assignments (customize as needed)
        $roleMM->givePermissionTo(['module documentation', 'module marche public', 'module marche global', 'les marches', 'decision ao']);
        $roleET->givePermissionTo(['module documentation', 'les marches']);
        $roleSCT->givePermissionTo(['module documentation', 'les marches']);
        // Add others if required...
    }
}
