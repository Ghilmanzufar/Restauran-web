<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Table;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();

        // 1. Ambil Statistik Hari Ini
        $revenueToday = Order::whereDate('created_at', $today)
            ->where('payment_status', 'paid')
            ->where('order_status', '!=', 'cancelled')
            ->sum('total_price');

        $totalOrders = Order::whereDate('created_at', $today)
            ->where('order_status', '!=', 'cancelled')
            ->count();

        $unpaidOrdersCount = Order::whereDate('created_at', $today)
            ->where('payment_status', 'unpaid')
            ->where('order_status', '!=', 'cancelled')
            ->count();

        // --- TAMBAHAN BARU: Hitung Meja Aktif ---
        $activeTablesCount = Table::whereHas('orders', function ($query) use ($today) {
            $query->whereDate('created_at', $today)
                  ->whereNotIn('order_status', ['completed', 'cancelled']);
        })->count();
        // ----------------------------------------

        // 2. Ambil Status Meja (beserta order aktifnya jika ada)
        $tables = Table::with(['orders' => function ($query) use ($today) {
            $query->whereDate('created_at', $today)
                  ->whereNotIn('order_status', ['completed', 'cancelled'])
                  ->latest();
        }])->get();

        // 3. Ambil 5 Order Masuk Terbaru
        $recentOrders = Order::with('table')
            ->whereDate('created_at', $today)
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'revenue' => $revenueToday,
                'total_orders' => $totalOrders,
                'unpaid_count' => $unpaidOrdersCount,
                'active_tables' => $activeTablesCount, // Kirim ke Frontend
            ],
            'tables' => $tables,
            'recentOrders' => $recentOrders,
        ]);
    }
}