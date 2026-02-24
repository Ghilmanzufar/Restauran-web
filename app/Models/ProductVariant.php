<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids; // <--- INI YANG KURANG TADI
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasUuids;

    protected $fillable = ['product_id', 'name', 'type', 'is_required'];

    public function items()
    {
        return $this->hasMany(ProductVariantItem::class);
    }
}