<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItemVariant extends Model
{
    use HasUuids;

    protected $guarded = ['id'];

    // Relasi balik ke Order Item
    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    // --- TAMBAHKAN FUNGSI INI ---
    // Relasi ke master data Product Variant Item (untuk ambil nama & harga varian)
    public function productVariantItem(): BelongsTo
    {
        return $this->belongsTo(ProductVariantItem::class, 'product_variant_item_id');
    }
}