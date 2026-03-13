<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasFactory;

    // 👇 TAMBAHKAN BARIS INI UNTUK MENGIZINKAN PENYIMPANAN DATA 👇
    protected $fillable = [
        'title',
        'image_url',
        'is_active',
    ];
}