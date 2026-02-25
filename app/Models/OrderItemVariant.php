<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class OrderItemVariant extends Model
{
    use HasUuids;

    // --- PERBAIKAN DI SINI ---
    // Gunakan nama tabel yang baku (bahasa inggris yang benar)
    protected $table = 'order_item_variants'; 

    protected $guarded = ['id'];
    
    // Relasi balik ke Item (Opsional, tapi bagus ada)
    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }
}