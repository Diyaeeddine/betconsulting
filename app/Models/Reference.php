<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reference extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'project_name',
        'client_name',
        'project_value',
        'start_date',
        'end_date',
        'description',
        'document_path',
        'document_name',
        'status',
        'validation_comment',
        'submitted_at',
        'validated_at',
        'validated_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'submitted_at' => 'datetime',
        'validated_at' => 'datetime',
    ];

    /**
     * Get the user who submitted the reference.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user who validated/rejected the reference.
     */
    public function validator()
    {
        return $this->belongsTo(User::class, 'validated_by');
    }

    /**
     * Scope a query to only include pending references.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include validated references.
     */
    public function scopeValidated($query)
    {
        return $query->where('status', 'validated');
    }

    /**
     * Scope a query to only include rejected references.
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Check if the reference is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the reference is validated.
     */
    public function isValidated(): bool
    {
        return $this->status === 'validated';
    }

    /**
     * Check if the reference is rejected.
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Get the full document URL.
     */
    public function getDocumentUrlAttribute(): string
    {
        return asset('storage/' . $this->document_path);
    }

    /**
     * Get formatted project duration.
     */
    public function getDurationAttribute(): string
    {
        return $this->start_date->format('M Y') . ' - ' . $this->end_date->format('M Y');
    }
}