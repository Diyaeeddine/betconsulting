<?php


// app/Console/Kernel.php
namespace App\Console;

use App\Console\Commands\CheckDocumentExpiration;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
{
    $schedule->command('documents:check-expiration')->hourly();
}

    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
