<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        // Default filter tanggal adalah "Hari Ini"
        $startDate = $request->input('start_date', Carbon::today()->toDateString());
        $endDate = $request->input('end_date', Carbon::today()->toDateString());

        // Mulai Query dengan Eager Loading untuk efisiensi
        // Asumsi relasi items.variants ada untuk menampilkan ekstra topping di struk detail
        $query = Order::with(['table', 'items.product', 'items.variants.productVariantItem'])->latest();

        // 1. Filter Rentang Tanggal
        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [
                $startDate . ' 00:00:00',
                $endDate . ' 23:59:59'
            ]);
        }

        // 2. Filter Status Pembayaran (Lunas/Belum/Batal)
        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'cancelled') {
                $query->where('order_status', 'cancelled');
            } else {
                $query->where('payment_status', $request->status)
                      ->where('order_status', '!=', 'cancelled');
            }
        }

        // 3. Pencarian (Nama Customer atau ID Order)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%");
            });
        }

        // --- HITUNG RINGKASAN (Berdasarkan Filter) ---
        $summaryQuery = clone $query;
        // Total Pendapatan (Hanya yang LUNAS dan TIDAK BATAL)
        $totalRevenue = (clone $summaryQuery)
            ->where('payment_status', 'paid')
            ->where('order_status', '!=', 'cancelled')
            ->sum('total_price');
        
        // Total Transaksi (Yang tidak batal)
        $totalOrders = (clone $summaryQuery)
            ->where('order_status', '!=', 'cancelled')
            ->count();

        // Eksekusi Query dengan Pagination (20 data per halaman)
        $orders = $query->paginate(20)->withQueryString();

        return Inertia::render('Admin/Order/Index', [
            'orders' => $orders,
            'summary' => [
                'revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
            ],
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => $request->input('status', 'all'),
                'search' => $request->input('search', ''),
            ]
        ]);
    }
}