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

    // --- TAMBAHKAN RELASI INI ---
    // Satu meja bisa punya banyak order
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
    // ----------------------------

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

    // --- TAMBAHKAN BLOK RELASI INI ---
    public function serviceCalls()
    {
        // Kita hubungkan model Table ke ServiceCall melalui kolom 'table_number'
        return $this->hasMany(ServiceCall::class, 'table_number', 'table_number');
    }
}