<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class OrderItemVariant extends Model
{
    use HasUuids;

    // Penting: Buka akses mass assignment
    protected $guarded = ['id'];
}