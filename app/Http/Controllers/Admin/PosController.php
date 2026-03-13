<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Table;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PosController extends Controller
{
    public function index()
    {
        // PERBAIKAN: Ambil semua meja tanpa filter is_active
        $tables = \App\Models\Table::orderBy('table_number')->get();

        // Ambil order hari ini dengan relasi lengkap
        $orders = \App\Models\Order::with(['items.product', 'items.variants.productVariantItem', 'table', 'promoUsage.promo'])
            ->whereDate('created_at', today())
            // Sembunyikan otomatis jika statusnya sudah 'completed' (Siap Saji) atau 'cancelled'
            ->whereNotIn('order_status', ['completed', 'cancelled'])
            ->orderBy('created_at', 'desc')
            ->get();

        return inertia('Admin/POS/Index', [
            'initialOrders' => $orders,
            'tables' => $tables
        ]);
    }

    public function processPayment(Request $request, Order $order)
    {
        $request->validate([
            'amount_received' => 'required|numeric|min:' . $order->total_price,
            'payment_method' => 'required|string'
        ]);

        $changeAmount = $request->amount_received - $order->total_price;
        
        // 1. Tangkap data sebelum diubah
        $oldData = $order->getOriginal();

        $order->update([
            'payment_status' => 'paid',
            'payment_method' => $request->payment_method,
            'amount_received' => $request->amount_received,
            'change_amount' => $changeAmount,
            'order_status' => $order->order_status === 'pending' ? 'processing' : $order->order_status,
        ]);

        // 2. Tangkap data yang berubah
        $newData = $order->getChanges();

        // 3. Catat Jejak Digital
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'ORDER_PAID',
            'entity_type' => 'ORDER',
            'entity_id' => $order->id,
            'description' => "Memproses pembayaran sebesar Rp " . number_format($request->amount_received, 0, ',', '.'),
            'old_values' => array_intersect_key($oldData, $newData),
            'new_values' => $newData,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'severity' => 'INFO'
        ]);

        return back()->with('success', 'Pembayaran berhasil diproses!');
    }
    
    public function cancelOrder(Request $request, Order $order)
    {
        $oldData = $order->getOriginal();

        $order->update([
            'order_status' => 'cancelled',
            'payment_status' => 'failed',
            'notes' => $order->notes . "\n[Dibatalkan Kasir: " . $request->reason . "]"
        ]);

        $newData = $order->getChanges();

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'ORDER_CANCEL',
            'entity_type' => 'ORDER',
            'entity_id' => $order->id,
            'description' => "Membatalkan pesanan karena: " . $request->reason,
            'old_values' => array_intersect_key($oldData, $newData),
            'new_values' => $newData,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'severity' => 'CRITICAL' // Pembatalan uang adalah aksi kritikal
        ]);

        return back()->with('success', 'Order dibatalkan.');
    }

    // --- FUNGSI UNTUK CETAK STRUK THERMAL ---
    public function print(Request $request, Order $order)
    {
        // Load relasi data agar struknya lengkap
        $order->load(['items.product', 'items.variants.productVariantItem', 'table', 'promoUsage.promo']);

        return Inertia::render('Admin/POS/Print', [
            'order' => $order,
            'type' => $request->query('type', 'customer') // Tangkap tipe print (kitchen / customer)
        ]);
    }
}