<?php

namespace App\Services;

use App\Models\Promo;
use App\Models\PromoUsage;
use Carbon\Carbon;

class PromoService
{
    /**
     * Cek apakah promo valid untuk user/meja tertentu
     */
    public function validatePromo(string $code, float $cartTotal, string $userIdentifier)
    {
        $promo = Promo::where('code', $code)->where('is_active', true)->first();

        if (!$promo) {
            throw new \Exception("Kode promo tidak ditemukan.");
        }

        // 1. Cek Tanggal
        $now = Carbon::now();
        if ($promo->start_date && $now->lt($promo->start_date)) {
            throw new \Exception("Promo belum dimulai.");
        }
        if ($promo->end_date && $now->gt($promo->end_date)) {
            throw new \Exception("Promo sudah berakhir.");
        }

        // 2. Cek Minimal Belanja
        if ($cartTotal < $promo->min_spend) {
            throw new \Exception("Minimal belanja " . number_format($promo->min_spend) . " untuk pakai promo ini.");
        }

        // 3. Cek Total Kuota (Real-time Count dari DB)
        if ($promo->quota_total > 0) {
            $totalUsed = PromoUsage::where('promo_id', $promo->id)->count();
            if ($totalUsed >= $promo->quota_total) {
                throw new \Exception("Yah, kuota promo ini sudah habis!");
            }
        }

        // 4. Cek Pemakaian Per User/Session
        $userUsed = PromoUsage::where('promo_id', $promo->id)
            ->where('user_identifier', $userIdentifier)
            ->count();
            
        if ($userUsed >= $promo->usage_per_user) {
            throw new \Exception("Kamu sudah melebihi batas pemakaian promo ini.");
        }

        return $promo;
    }

    /**
     * Hitung nilai diskon
     */
    public function calculateDiscount(Promo $promo, float $cartTotal, array $cartItems = [])
    {
        $discount = 0;

        // Cek Scope (Apakah promo ini hanya untuk menu tertentu?)
        // Jika ada scope, kita harus hitung total belanja HANYA item yang valid
        $applicableTotal = $this->calculateApplicableTotal($promo, $cartItems, $cartTotal);

        if ($promo->type === 'fixed') {
            $discount = $promo->discount_amount;
        } 
        elseif ($promo->type === 'percentage') {
            $discount = $applicableTotal * ($promo->discount_amount / 100);
            
            // Cek Max Discount (Cap)
            if ($promo->max_discount && $discount > $promo->max_discount) {
                $discount = $promo->max_discount;
            }
        }

        // Pembulatan & Validasi Akhir (Biar gak minus)
        $discount = round($discount);
        return max(0, min($discount, $cartTotal));
    }

    /**
     * Helper: Hitung total belanja berdasarkan scope (Kategori/Produk)
     */
    private function calculateApplicableTotal(Promo $promo, array $cartItems, float $fullTotal)
    {
        // Kalau tidak ada scope, berarti berlaku untuk semua (Global)
        if ($promo->scopes()->count() === 0) {
            return $fullTotal;
        }

        $validTotal = 0;
        
        // Ambil ID produk dan kategori yang diperbolehkan
        $allowedProductIds = $promo->scopes()->where('scope_type', 'product')->pluck('scope_id')->toArray();
        $allowedCategoryIds = $promo->scopes()->where('scope_type', 'category')->pluck('scope_id')->toArray();

        foreach ($cartItems as $item) {
            // Asumsi $item punya 'product_id', 'category_id', dan 'total_price'
            $isProductValid = in_array($item['product_id'], $allowedProductIds);
            
            // Jika Anda menyimpan category_id di cart item atau perlu query relasi product->category
            // Anggaplah di sini logic cek kategorinya
            $isCategoryValid = false; // Implementasi cek kategori item
            
            if ($isProductValid || $isCategoryValid) {
                $validTotal += $item['total_item_price'];
            }
        }

        return $validTotal;
    }
}