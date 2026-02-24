<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes; // WAJIB BUAT SOFT DELETE


class Product extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'category_id', 'name', 'description', 
        'price', 'stock_qty', 'stock_threshold', 
        'is_available', 'image_url'
    ];

    // Casting: Biar 'is_available' otomatis jadi boolean (true/false) bukan 1/0
    protected $casts = [
        'is_available' => 'boolean',
        'price' => 'decimal:2',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    // Tambahkan di App\Models\Product.php
    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }
}