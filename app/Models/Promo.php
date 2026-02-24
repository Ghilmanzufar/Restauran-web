<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Promo extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'meta' => 'array', // Otomatis jadi array PHP saat diambil
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
        'is_stackable' => 'boolean',
    ];

    // Relasi ke Scope (Menu/Kategori apa saja yg kena promo)
    public function scopes()
    {
        return $this->hasMany(PromoScope::class);
    }

    // Relasi ke History Pemakaian
    public function usages()
    {
        return $this->hasMany(PromoUsage::class);
    }
}
