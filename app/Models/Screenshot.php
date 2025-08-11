<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class Screenshot extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'filename',
        'file_path',
        'file_size',
        'width',
        'height',
        'url',
        'user_agent',
        'ip_address',
        'captured_at',
        'viewport_size',
        'page_title',
    ];

    protected $casts = [
        'captured_at' => 'datetime',
        'file_size' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getFileUrlAttribute()
    {
        return asset('storage/' . str_replace('screenshots/', '', $this->file_path));
    }

    public function getFormattedFileSizeAttribute(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function getDimensionsAttribute(): string
    {
        if ($this->width && $this->height) {
            return $this->width . 'x' . $this->height;
        }
        return 'Unknown';
    }

    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($screenshot) {
            if (Storage::disk('public')->exists($screenshot->file_path)) {
                Storage::disk('public')->delete($screenshot->file_path);
            }
        });
    }
}