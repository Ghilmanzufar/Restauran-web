<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids; // WAJIB BUAT UUID
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasUuids;

    protected $fillable = ['name', 'is_active'];

    // Relasi: Satu kategori punya banyak produk
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}