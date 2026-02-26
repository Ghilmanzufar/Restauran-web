<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceCall extends Model
{
    use HasFactory;

    protected $fillable = [
        'table_number',
        'type',
        'notes',
        'status',
    ];
}