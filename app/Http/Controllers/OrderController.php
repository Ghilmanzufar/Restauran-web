<?php

namespace App\Http\Controllers;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cookie;
use App\Models\Table;
use App\Models\Product;
use App\Models\Order;             // <--- PENTING: Tambahkan ini
use App\Models\OrderItem;         // <--- Tambahkan ini juga
use App\Models\Category;
use App\Models\ProductVariant;    // <--- Untuk pencarian varian
use App\Models\ProductVariantItem;// <--- Untuk pencarian item varian
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // <--- Pastikan ini juga ada.
use Inertia\Inertia;
use App\Models\Promo;       // <-- Tambahkan
use App\Models\PromoUsage;  // <-- Tambahkan
use App\Services\PromoService; // <-- Tambahkan (Jika pakai service)
use App\Models\OrderSession;
use Illuminate\Support\Facades\Log;


class OrderController extends Controller
{
    public function index(Request $request, string $tableNumber)
    {
        // 1. Cek Meja (Wajib Ada)
        $table = Table::where('table_number', $tableNumber)->first();

        if (!$table) {
            return Inertia::render('Customer/Error', [
                'status' => 404,
                'message' => 'Meja tidak ditemukan.'
            ]);
        }

        // 2. LOGIKA SESI (MULTI-DEVICE / SATU MEJA RAME-RAME)
        
        // Cari Sesi Aktif di Database
        $activeSession = OrderSession::where('table_id', $table->id)
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
            ->first();

        // Ambil token dari HP User (jika ada)
        $userToken = $request->cookie('resto_session_token');

        if (!$activeSession) {
            // SKENARIO A: Meja Kosong (Pelanggan Baru)
            // --> Buat Sesi Baru di Database
            
            $newCode = Str::random(10); // Kode unik acak
            
            OrderSession::create([
                'table_id' => $table->id,
                'session_code' => $newCode,
                'status' => 'active',
                'started_at' => now(),
                'expires_at' => now()->addHours(3), // Otomatis expired dalam 3 jam
            ]);

            // --> Tempelkan Tiket ke HP User (Cookie 3 jam)
            Cookie::queue('resto_session_token', $newCode, 180);

        } else {
            // SKENARIO B: Meja Sedang Dipakai
            // --> Logika "Join Table" (Teman semeja scan QR yang sama)
            
            // Jika di HP user belum ada tiket, ATAU tiketnya beda...
            if ($userToken !== $activeSession->session_code) {
                // ...Kita paksa HP dia memakai tiket meja ini.
                Cookie::queue('resto_session_token', $activeSession->session_code, 180);
            }
        }

        // 3. AMBIL DATA MENU (Seperti Biasa)
        $categories = Category::with(['products' => function ($query) {
            $query->where('is_available', true)->with(['variants.items']); 
        }])
        ->where('is_active', true)
        ->get();

        // 4. RENDER HALAMAN
        return Inertia::render('Customer/Menu', [
            'table' => $table,
            'categories' => $categories
        ]);
    }

    // --- 1. LANDING PAGE ---
    public function landing(string $tableNumber)
    {
        $table = Table::where('table_number', $tableNumber)->firstOrFail();
        
        // KITA HAPUS REDIRECT OTOMATIS
        // Biarkan user masuk ke Welcome/Menu dulu, nanti dia cek history sendiri lewat icon.
        
        return Inertia::render('Welcome', [
            'table' => $table
        ]);
    }

    public function history(string $tableNumber)
    {
        $table = Table::where('table_number', $tableNumber)->firstOrFail();

        // Ambil daftar ID dari saku browser user ini
        $myOrderIds = session()->get('my_order_ids', []);

        // Query: Ambil order punya Meja INI + Yang ID-nya ada di Saku Browser INI
        $orders = Order::where('table_id', $table->id)
            ->whereIn('id', $myOrderIds) // <--- FILTER KUNCI
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Customer/OrderHistory', [
            'table' => $table,
            'orders' => $orders
        ]);
    }

    public function showStatus(string $tableNumber, string $orderId)
    {
        $table = Table::where('table_number', $tableNumber)->firstOrFail();

        // 1. Ambil Data Order
        // Kita cek dulu datanya ada atau tidak.
        $order = Order::with(['items.product', 'items.variants', 'promoUsage.promo'])
            ->where('id', $orderId)
            ->where('table_id', $table->id)
            ->firstOrFail();

        // 2. LOGIKA "JOIN ORDER" / SHARE LINK
        // Cek apakah Order ID ini sudah ada di saku (session) browser user yang membuka link?
        $myOrderIds = session()->get('my_order_ids', []);

        if (!in_array($order->id, $myOrderIds)) {
            // Jika belum ada (berarti dia teman yang dikasih link),
            // Kita masukkan ID ini ke saku dia.
            $myOrderIds[] = $order->id;
            session()->put('my_order_ids', $myOrderIds);
        }

        // 3. Tampilkan Halaman
        return Inertia::render('Customer/OrderStatus', [
            'table' => $table,
            'order' => $order
        ]);
    }


    public function cart(string $tableNumber)
    {
        $table = Table::where('table_number', $tableNumber)->firstOrFail();
        
        // Kita butuh products untuk fitur Edit di halaman Cart
        $products = Product::with(['variants.items'])
            ->where('is_available', true)
            ->get();

        return Inertia::render('Customer/Cart', [
            'table' => $table,
            'products' => $products
        ]);
    }

    public function checkout(string $tableNumber)
    {
        $table = Table::where('table_number', $tableNumber)->firstOrFail();
        
        // TIDAK PERLU kirim $products lagi, karena edit menu cuma ada di Cart.
        // Cukup kirim data meja saja.
        return Inertia::render('Customer/Checkout', [
            'table' => $table
        ]);
    }

    

    public function store(Request $request, string $tableNumber)
    {
        // 1. LOG START
        Log::info("🔥 [ORDER] Request dari Meja: $tableNumber");

        // 2. VALIDASI DATA
        try {
            $validated = $request->validate([
                'customer_name' => 'required|string|max:50',
                'whatsapp_number' => 'nullable|string|max:20',
                'items' => 'required|array|min:1', 
                'items.*.product_id' => 'required|exists:products,id',
                'items.*.qty' => 'required|integer|min:1', 
                'items.*.variants' => 'nullable|array',
                'items.*.variants.*.product_variant_item_id' => 'required|exists:product_variant_items,id',
                'notes' => 'nullable|string|max:200',
                'promo_id' => 'nullable|exists:promos,id'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors());
        }

        // 3. CEK MEJA & SESI
        $table = Table::where('table_number', $tableNumber)->firstOrFail();
        $session = OrderSession::where('table_id', $table->id)
            ->where('status', 'active')
            ->where('session_code', $request->cookie('resto_session_token'))
            ->where(function ($q) { $q->whereNull('expires_at')->orWhere('expires_at', '>', now()); })
            ->first();

        if (!$session) return back()->withErrors(['message' => 'Sesi berakhir.']);

        // 4. MULAI TRANSAKSI
        try {
            DB::beginTransaction();

            // A. BUAT ORDER HEADER
            $order = Order::create([
                'session_id' => $session->id,
                'table_id' => $table->id,
                'customer_name' => $validated['customer_name'],
                'whatsapp_number' => $request->whatsapp_number ?? null, 
                'order_status' => 'pending',   
                'payment_status' => 'unpaid',  
                'payment_method' => $request->payment_method ?? 'cash', 
                'total_price' => 0 
            ]);

            // B. HITUNG ITEM & VARIAN
            $grossSubtotal = 0; 

            foreach ($validated['items'] as $itemData) {
                $product = Product::find($itemData['product_id']);

                // 🛡️ SECURITY 1: CEK KETERSEDIAAN (RACE CONDITION)
                if (!$product || !$product->is_available) {
                    throw new \Exception("Mohon maaf, produk '{$product->name}' baru saja habis. Silakan hapus dari keranjang.");
                }

                $basePrice = $product->price;
                $extraVariantPrice = 0;

                // Hitung Varian
                if (!empty($itemData['variants'])) {
                    foreach ($itemData['variants'] as $v) {
                        // Load relation 'productVariant' agar bisa cek parent product-nya
                        $variantItem = ProductVariantItem::with('productVariant')->find($v['product_variant_item_id']);
                        
                        if ($variantItem) {
                            // 🛡️ SECURITY 2: CEK KEPEMILIKAN VARIAN (ANTI MANIPULASI)
                            if ($variantItem->productVariant->product_id !== $product->id) {
                                throw new \Exception("Security Alert: Varian tidak valid untuk produk ini.");
                            }

                            $extraVariantPrice += ($variantItem->price ?? 0);
                        }
                    }
                }

                $finalItemPrice = $basePrice + $extraVariantPrice;
                $lineTotal = $finalItemPrice * $itemData['qty'];
                $grossSubtotal += $lineTotal;

                // Simpan Item
                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'qty' => $itemData['qty'],           
                    'price_per_item' => $finalItemPrice, 
                    'total_price' => $lineTotal,          
                    'note' => $itemData['note'] ?? null  
                ]);

                // Simpan Detail Varian
                if (!empty($itemData['variants'])) {
                    foreach ($itemData['variants'] as $v) {
                        $variantItem = ProductVariantItem::find($v['product_variant_item_id']);
                        if ($variantItem) {
                            \App\Models\OrderItemVariant::create([
                                'order_item_id' => $orderItem->id,
                                'product_variant_id' => $variantItem->product_variant_id,
                                'product_variant_item_id' => $variantItem->id,
                                'variant_name' => $variantItem->productVariant->name ?? 'Variant', 
                                'item_name' => $variantItem->name, 
                                'extra_price' => $variantItem->price ?? 0 
                            ]);
                        }
                    }
                }
            }

            // C. HITUNG DISKON PROMO
            $discountAmount = 0;
            if (!empty($validated['promo_id'])) {
                $promo = Promo::find($validated['promo_id']);
                
                if ($grossSubtotal >= $promo->min_spend) {
                    if ($promo->type === 'fixed') {
                        $discountAmount = $promo->discount_amount;
                    } else {
                        $discountAmount = $grossSubtotal * ($promo->discount_amount / 100);
                        if ($promo->max_discount && $discountAmount > $promo->max_discount) {
                            $discountAmount = $promo->max_discount;
                        }
                    }
                    $discountAmount = min($discountAmount, $grossSubtotal);

                    $userIdentity = $validated['whatsapp_number'] ?? $session->session_code ?? 'GUEST';

                    PromoUsage::create([
                        'promo_id' => $promo->id,
                        'order_id' => $order->id,
                        'user_identifier' => $userIdentity, 
                        'discount_value' => $discountAmount,
                        'used_at' => now() 
                    ]);
                }
            }

            // D. HITUNG FINAL
            $subtotalAfterDiscount = $grossSubtotal - $discountAmount;
            $tax = $subtotalAfterDiscount * 0.10;     
            $service = $subtotalAfterDiscount * 0.05; 
            
            $grandTotal = $subtotalAfterDiscount + $tax + $service;

            // E. UPDATE ORDER & SESSION
            $order->update(['total_price' => $grandTotal]);
            $session->increment('total_amount', $grandTotal);

            DB::commit();

            return to_route('customer.order_detail', [
                'tableNumber' => $tableNumber, 
                'orderId' => $order->id
            ])->with('success', 'Pesanan berhasil!');

        } catch (\Exception $e) {
            DB::rollback();
            Log::error("Order Error: " . $e->getMessage());
            return back()->withErrors(['message' => 'Gagal: ' . $e->getMessage()]);
        }
    }   

    // --- 6. STATUS & HISTORY PAGE ---
    public function status(string $tableNumber)
    {
        $table = Table::where('table_number', $tableNumber)->firstOrFail();

        // AMBIL SEMUA ORDER (History + Active)
        $allOrders = Order::with(['items.product', 'items.variants'])
            ->where('table_id', $table->id)
            // HAPUS filter 'whereNotIn' agar yang completed/cancelled juga ikut terambil
            ->orderBy('created_at', 'desc') 
            ->get();

        // Kalau kosong melompong (belum pernah pesan sama sekali), baru lempar ke menu
        if ($allOrders->isEmpty()) {
            return to_route('customer.menu', $tableNumber);
        }

        return Inertia::render('Customer/OrderStatus', [
            'table' => $table,
            'orders' => $allOrders
        ]);
    }

    // --- 7. HALAMAN LIST PROMO ---
    public function promos(string $tableNumber)
    {
        $table = Table::where('table_number', $tableNumber)->firstOrFail();

        // Ambil promo yang:
        // 1. Aktif (is_active = 1)
        // 2. Belum kedaluwarsa (end_date > sekarang atau null)
        // 3. Sudah mulai (start_date <= sekarang atau null)
        $promos = Promo::where('is_active', true)
            ->where(function($q) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', now());
            })
            ->where(function($q) {
                $q->whereNull('start_date')->orWhere('start_date', '<=', now());
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Customer/PromoList', [
            'table' => $table,
            'promos' => $promos
        ]);
    }
}