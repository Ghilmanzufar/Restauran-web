<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;


class Order extends Model
{
    use HasUuids; // Hapus SoftDeletes jika di migration tidak ada kolom deleted_at

    // PENTING: Gunakan ini saja.
    // Ini artinya: "Semua kolom BOLEH diisi, KECUALI kolom id".
    protected $guarded = ['id'];

    // HAPUS bagian protected $fillable = [...] yang panjang itu.
    // Karena isinya tidak sesuai dengan controller kita sekarang.

    // Casting tipe data (Opsional, tapi bagus)
    protected $casts = [
        'total_price' => 'decimal:2',
    ];

    // Relasi ke Item
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
    
    // Relasi ke Meja
    public function table(): BelongsTo
    {
        return $this->belongsTo(Table::class);
    }

    // --- TAMBAHKAN INI ---
    public function promoUsage()
    {
        return $this->hasOne(PromoUsage::class);
    }
}