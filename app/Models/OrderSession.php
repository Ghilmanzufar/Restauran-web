<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderSession extends Model
{
    use HasUuids;

    protected $fillable = [
        'table_id', 'session_code', 'status', 
        'total_amount', 'started_at', 'locked_at', 'closed_at'
    ];
    
    protected $casts = [
        'started_at' => 'datetime',
        'locked_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function table(): BelongsTo
    {
        return $this->belongsTo(Table::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'session_id');
    }
    
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'session_id');
    }
}