<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->month;
        $thisYear = Carbon::now()->year;

        // ==========================================
        // 1. LAPORAN HARIAN (Hari Ini)
        // ==========================================
        $dailyOrders = Order::whereDate('created_at', $today)
                            ->where('payment_status', 'paid')
                            ->where('order_status', '!=', 'cancelled')
                            ->get();

        $dailySales = $dailyOrders->sum('total_price');
        
        // Asumsi: Pajak 11% dan Service Charge 5% (Bisa disesuaikan dengan skema database Anda)
        // Jika Anda punya kolom khusus tax/service di DB, cukup gunakan ->sum('tax_amount')
        $baseRevenue = $dailySales / 1.16; 
        $dailyTax = $baseRevenue * 0.11;
        $dailyService = $baseRevenue * 0.05;

        // Top Selling Menu (Hari Ini)
        $topSellingDaily = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->whereDate('orders.created_at', $today)
            ->where('orders.payment_status', 'paid')
            // ---> PERHATIKAN BARIS DI BAWAH INI (Ganti quantity jadi qty) <---
            ->select('products.name', DB::raw('SUM(order_items.qty) as total_qty'))
            ->groupBy('products.name', 'products.id')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get();

        // ==========================================
        // 2. LAPORAN BULANAN
        // ==========================================
        
        // Data Grafik Tren Penjualan 30 Hari Terakhir
        $trendData = DB::table('orders')
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_price) as total'))
            ->whereMonth('created_at', $thisMonth)
            ->whereYear('created_at', $thisYear)
            ->where('payment_status', 'paid')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Data Grafik Jam Ramai (Peak Hours)
        $peakHours = DB::table('orders')
            ->select(DB::raw('EXTRACT(HOUR FROM created_at) as hour'), DB::raw('COUNT(id) as total_orders'))
            ->whereMonth('created_at', $thisMonth)
            ->where('payment_status', 'paid')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        return Inertia::render('Admin/Report/Index', [
            'daily' => [
                'total_sales' => round($dailySales),
                'total_tax' => round($dailyTax),
                'total_service' => round($dailyService),
                'total_orders' => $dailyOrders->count(),
                'top_selling' => $topSellingDaily
            ],
            'monthly' => [
                'trend' => $trendData,
                'peak_hours' => $peakHours
            ]
        ]);
    }
}