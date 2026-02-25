<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class OrderItemVariant extends Model
{
    use HasUuids;

    // Pastikan nama tabelnya benar (biasanya order_item_variants)
    protected $table = 'order_item_variants';

    // Penting: Buka akses mass assignment
    protected $guarded = ['id'];
}