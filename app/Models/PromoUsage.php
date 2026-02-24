<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PromoUsage extends Model
{
    use HasFactory;

    // 1. Izinkan Mass Assignment (Kunci perbaikan error kamu)
    protected $guarded = ['id']; 

    // 2. Matikan Timestamps default (created_at & updated_at)
    // Karena di migration tadi kita tidak pakai $table->timestamps()
    public $timestamps = false;

    // 3. Casting tipe data (Opsional, biar rapi)
    protected $casts = [
        'used_at' => 'datetime',
        'discount_value' => 'decimal:2'
    ];

    public function promo()
    {
        return $this->belongsTo(Promo::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}