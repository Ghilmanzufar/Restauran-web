<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Table extends Model
{
    use HasUuids;

    // Pastikan ini guarded id, BUKAN fillable
    protected $guarded = ['id'];

    // Satu meja bisa punya banyak history sesi
    public function sessions(): HasMany
    {
        return $this->hasMany(OrderSession::class);
    }
    
    // Helper untuk mengambil sesi yang aktif sekarang
    public function activeSession()
    {
        return $this->hasOne(OrderSession::class)->where('status', '!=', 'closed')->latest();
    }
}