<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PromoScope extends Model
{
    use HasFactory;

    protected $guarded = ['id']; // Izinkan semua kolom diisi

    public $timestamps = false; // Matikan timestamps

    public function promo()
    {
        return $this->belongsTo(Promo::class);
    }
}