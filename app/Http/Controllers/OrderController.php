<?php

namespace App\Http\Controllers;

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


class OrderController extends Controller
{
    public function index(string $tableNumber)
    {
        // 1. Cek apakah meja ada? (Kalau tidak ada, otomatis 404 Not Found)
        $table = Table::where('table_number', $tableNumber)->firstOrFail();

        // 2. Ambil Kategori yang Aktif + Produk di dalamnya
        // Kita pakai 'with' biar hemat query (Eager Loading)
        $categories = Category::with(['products' => function ($query) {
            $query->where('is_available', true)->with(['variants.items']); // <--- TAMBAHKAN INI (Eager Loading) 
        }])
        ->where('is_active', true)
        ->get();

        // 3. Kirim ke React (Component 'Customer/Menu')
        // Data ini nanti bisa diakses di React via props.categories dan props.table
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

    // --- 5. STORE ORDER (PROSES SIMPAN) ---
    public function store(Request $request, string $tableNumber)
    {
        // Validasi
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'whatsapp_number' => 'nullable|string|max:20',
            'payment_method' => 'required|in:cashier,qris',
            'total_price' => 'required|numeric',
            'items' => 'required|array|min:1',
            'promo_id' => 'nullable|exists:promos,id', // <-- VALIDASI PROMO ID
        ]);

        $table = Table::where('table_number', $tableNumber)->firstOrFail();

        try {
            DB::beginTransaction(); 

            // A. Simpan Order Utama
            $order = Order::create([
                'table_id' => $table->id,
                'customer_name' => $validated['customer_name'],
                'whatsapp_number' => $validated['whatsapp_number'],
                'total_price' => $validated['total_price'],
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'pending',
                'order_status' => 'new'
            ]);

            // B. Simpan Item (Sama seperti sebelumnya)
            foreach ($validated['items'] as $item) {
                $orderItem = $order->items()->create([
                    'product_id' => $item['product_id'],
                    'qty' => $item['qty'],
                    'price_per_item' => $item['price_at_order'],
                    'total_price' => $item['total_item_price'],
                    'note' => $item['note'] ?? null,
                ]);

                if (!empty($item['variants'])) {
                    foreach ($item['variants'] as $variant) {
                        $pv = ProductVariant::find($variant['product_variant_id']);
                        $pvi = ProductVariantItem::find($variant['product_variant_item_id']);

                        if ($pv && $pvi) {
                            $orderItem->variants()->create([
                                'product_variant_id' => $pv->id,
                                'product_variant_item_id' => $pvi->id,
                                'variant_name' => $pv->name,
                                'item_name' => $pvi->name,
                                'extra_price' => $pvi->price
                            ]);
                        }
                    }
                }
            }

            // C. SIMPAN PEMAKAIAN PROMO (BARU!)
            if ($request->promo_id) {
                $promo = Promo::find($request->promo_id);
                
                // Hitung ulang diskon di server (Security) agar tidak dimanipulasi frontend
                // Idealnya pakai PromoService, tapi ini versi inline sederhana
                // Asumsi: frontend kirim total_price yg SUDAH didiskon. 
                // Kita perlu hitung "Nilai Hematnya" berapa.
                // Tapi untuk pencatatan simple:
                
                // Kita simpan Usage Record
                PromoUsage::create([
                    'promo_id' => $promo->id,
                    'order_id' => $order->id,
                    'user_identifier' => $tableNumber, // Identifikasi user via Meja
                    'discount_value' => 0, // Nanti bisa diupdate logic hitungnya
                    'used_at' => now()
                ]);
            }

            DB::commit(); 

            return to_route('customer.order_detail', [
                'tableNumber' => $tableNumber, 
                'orderId' => $order->id
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Order Error: ' . $e->getMessage());
            return back()->withErrors(['msg' => $e->getMessage()]);
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