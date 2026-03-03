<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Table;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PosController extends Controller
{
    public function index()
    {
        // Mengambil order untuk hari ini (atau order yang masih aktif/belum selesai)
        // Eager load items, product, variants untuk kecepatan
        $orders = Order::with(['items.product', 'items.variants', 'table', 'promoUsage.promo'])
            ->whereDate('created_at', today())
            ->orWhereNotIn('order_status', ['completed', 'cancelled']) // Ambil juga yang nyangkut dari hari sebelumnya
            ->orderBy('created_at', 'desc')
            ->get();

        $tables = Table::all();

        return Inertia::render('Admin/POS/Index', [
            'initialOrders' => $orders,
            'tables' => $tables
        ]);
    }

    // Fungsi untuk update status pembayaran (Dipanggil via AJAX/Inertia Visit)
    public function processPayment(Request $request, Order $order)
    {
        $request->validate([
            'amount_received' => 'required|numeric|min:' . $order->total_price,
            'payment_method' => 'required|string'
        ]);

        $order->update([
            'payment_status' => 'paid',
            'payment_method' => $request->payment_method,
            // Jika order masih pending, otomatis ubah jadi processing (masuk dapur)
            'order_status' => $order->order_status === 'pending' ? 'processing' : $order->order_status,
        ]);

        // Opsional: Simpan log transaksi di sini

        return back()->with('success', 'Pembayaran berhasil diproses!');
    }
    
    // Fungsi pembatalan order oleh kasir
    public function cancelOrder(Request $request, Order $order)
    {
        $order->update([
            'order_status' => 'cancelled',
            'payment_status' => 'failed',
            'notes' => $order->notes . "\n[Dibatalkan Kasir: " . $request->reason . "]"
        ]);

        return back()->with('success', 'Order dibatalkan.');
    }
}