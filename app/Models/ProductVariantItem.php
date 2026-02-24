<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids; // <--- WAJIB ADA
use Illuminate\Database\Eloquent\Model;

class ProductVariantItem extends Model
{
    use HasUuids;

    protected $guarded = ['id']; // Tambahkan baris ini di dalam class OrderItemVariant

}