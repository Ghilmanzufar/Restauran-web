<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        // 1. Setup Filter Tanggal (Default: Hari Ini)
        $filter = $request->input('filter', 'today'); // today, yesterday, 7days, 30days
        $startDate = Carbon::today();
        $endDate = Carbon::today()->endOfDay();
        $prevStartDate = Carbon::yesterday();
        $prevEndDate = Carbon::yesterday()->endOfDay();

        if ($filter === 'yesterday') {
            $startDate = Carbon::yesterday();
            $endDate = Carbon::yesterday()->endOfDay();
            $prevStartDate = Carbon::yesterday()->subDay();
            $prevEndDate = Carbon::yesterday()->subDay()->endOfDay();
        } elseif ($filter === '7days') {
            $startDate = Carbon::today()->subDays(6);
            $prevStartDate = Carbon::today()->subDays(13);
            $prevEndDate = Carbon::today()->subDays(7)->endOfDay();
        } elseif ($filter === '30days') {
            $startDate = Carbon::today()->subDays(29);
            $prevStartDate = Carbon::today()->subDays(59);
            $prevEndDate = Carbon::today()->subDays(30)->endOfDay();
        }

        // 2. Query Data Utama (Hanya yang Paid & Tidak Cancelled)
        $baseQuery = Order::whereBetween('created_at', [$startDate, $endDate])
                          ->where('payment_status', 'paid')
                          ->where('order_status', '!=', 'cancelled');

        // Query Periode Sebelumnya (Untuk Trend/Growth)
        $prevQuery = Order::whereBetween('created_at', [$prevStartDate, $prevEndDate])
                          ->where('payment_status', 'paid')
                          ->where('order_status', '!=', 'cancelled');

        // 3. Hitung Metrik Utama (Omset, Orders, AOV, Pajak)
        $totalSales = (clone $baseQuery)->sum('total_price');
        $totalOrders = (clone $baseQuery)->count();
        
        // 1. Ambil nilai persentase dari Database, konversi ke desimal (misal 10 -> 0.10)
        $taxRate = \App\Models\Setting::getValue('tax_percentage', 10) / 100;
        $serviceRate = \App\Models\Setting::getValue('service_percentage', 5) / 100;

        // Hitung Pajak Restoran (PB1) dan Service Charge dinamis
        $totalTax = $totalSales * $taxRate;
        $totalService = $totalSales * $serviceRate;
        
        $aov = $totalOrders > 0 ? $totalSales / $totalOrders : 0; 

        // Hitung Pertumbuhan (Growth vs Previous Period)
        $prevSales = (clone $prevQuery)->sum('total_price');
        $salesGrowth = $prevSales > 0 ? (($totalSales - $prevSales) / $prevSales) * 100 : 0;

        // 4. Breakdown Metode Pembayaran
        $paymentMethods = (clone $baseQuery)
            ->select('payment_method', DB::raw('COUNT(*) as total_count'), DB::raw('SUM(total_price) as total_revenue'))
            ->groupBy('payment_method')
            ->get();

        // 5. Menu Paling Menghasilkan (Revenue & Qty)
        $topMenus = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.payment_status', 'paid')
            ->where('orders.order_status', '!=', 'cancelled')
            ->select(
                'products.name',
                DB::raw('SUM(order_items.qty) as total_qty'),
                DB::raw('SUM(order_items.qty * products.price) as total_revenue') 
            )
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_revenue')
            ->limit(5)
            ->get();

        // 6. Kategori Paling Laku
        $salesByCategory = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.payment_status', 'paid')
            ->where('orders.order_status', '!=', 'cancelled')
            ->select('categories.name', DB::raw('SUM(order_items.qty * products.price) as total_revenue'))
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total_revenue')
            ->get();

        // 7. Peak Hours 
        $peakHours = (clone $baseQuery)
            ->select(DB::raw('EXTRACT(HOUR FROM created_at) as hour'), DB::raw('COUNT(*) as total_orders'))
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        return Inertia::render('Admin/Report/Index', [
            'metrics' => [
                'total_sales' => $totalSales,
                'total_orders' => $totalOrders,
                'aov' => $aov,
                'total_tax' => $totalTax,
                'total_service' => $totalService,
                'sales_growth' => $salesGrowth,
                'prev_sales' => $prevSales
            ],
            'paymentMethods' => $paymentMethods,
            'topMenus' => $topMenus,
            'salesByCategory' => $salesByCategory,
            'peakHours' => $peakHours,
            'currentFilter' => $filter
        ]);
    }

    // --- BANTUAN FILTER TANGGAL (YANG HILANG SEBELUMNYA) ---
    private function getDateRange($filter) {
        if ($filter === 'yesterday') return [Carbon::yesterday(), Carbon::yesterday()->endOfDay()];
        if ($filter === '7days') return [Carbon::today()->subDays(6), Carbon::today()->endOfDay()];
        if ($filter === '30days') return [Carbon::today()->subDays(29), Carbon::today()->endOfDay()];
        return [Carbon::today(), Carbon::today()->endOfDay()];
    }

   // --- CETAK EXCEL (NATIVE CSV) ---
    public function exportExcel(Request $request) {
        [$startDate, $endDate] = $this->getDateRange($request->filter);
        $namaFile = 'Laporan_Penjualan_' . $startDate->format('d-M-Y') . '.csv';
        
        $orders = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', 'paid')
            ->where('order_status', '!=', 'cancelled')
            ->orderBy('created_at', 'asc')
            ->get();

        // Ambil jumlah item per order
        $orderIds = $orders->pluck('id');
        $itemCounts = DB::table('order_items')
            ->whereIn('order_id', $orderIds)
            ->select('order_id', DB::raw('SUM(qty) as total_qty'))
            ->groupBy('order_id')
            ->pluck('total_qty', 'order_id');

        $headers = [
            "Content-type"        => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=$namaFile",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        // Header CSV (Ditambah Invoice & Total Item)
        $columns = [
            'Waktu Transaksi (WIB)', 'Invoice', 'Total Item', 
            'Metode Pembayaran', 'Pajak PB1 (10%)', 'Service (5%)', 'Total Bersih (Rp)'
        ];

        $callback = function() use($orders, $columns, $itemCounts) {
            $file = fopen('php://output', 'w');
            fputs($file, "\xEF\xBB\xBF"); // BOM agar rapi di Excel
            fputcsv($file, $columns, ';'); 
            
            // Ambil dari database
            $taxRate = \App\Models\Setting::getValue('tax_percentage', 10) / 100;
            $serviceRate = \App\Models\Setting::getValue('service_percentage', 5) / 100;

            foreach ($orders as $order) {
                $metodeBayar = $order->payment_method ? strtoupper(str_replace('_', ' ', $order->payment_method)) : '-';
                $invoice = 'INV-' . strtoupper(substr($order->id, 0, 6));
                $qty = $itemCounts[$order->id] ?? 0;

                fputcsv($file, [
                    $order->created_at->timezone('Asia/Jakarta')->format('d M Y H:i'),
                    $invoice,
                    $qty,
                    $metodeBayar,
                    round($order->total_price * $taxRate), // <-- MENGGUNAKAN VARIABEL
                    round($order->total_price * $serviceRate), // <-- MENGGUNAKAN VARIABEL
                    round($order->total_price)
                ], ';'); 
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    // --- CETAK PDF (LEVEL ENTERPRISE) ---
    public function exportPdf(Request $request) {
        [$startDate, $endDate] = $this->getDateRange($request->filter);
        
        $orders = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', 'paid')
            ->where('order_status', '!=', 'cancelled')
            ->orderBy('created_at', 'asc')
            ->get();

        // 1. Data Transaksi & Qty
        $orderIds = $orders->pluck('id');
        $itemCounts = DB::table('order_items')
            ->whereIn('order_id', $orderIds)
            ->select('order_id', DB::raw('SUM(qty) as total_qty'))
            ->groupBy('order_id')
            ->pluck('total_qty', 'order_id');

        // 2. Metrik Summary
        $taxRate = \App\Models\Setting::getValue('tax_percentage', 10) / 100;
        
        $totalSales = $orders->sum('total_price');
        $totalOrders = $orders->count();
        $totalTax = $totalSales * $taxRate;
        $aov = $totalOrders > 0 ? $totalSales / $totalOrders : 0;
        $totalItemsSold = $itemCounts->sum();

        $paymentMethods = $orders->groupBy('payment_method')->map(function ($row) {
            return $row->count();
        });

        // 3. Top Menus
        $topMenus = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->whereIn('orders.id', $orderIds)
            ->select('products.name', DB::raw('SUM(order_items.qty) as total_qty'), DB::raw('SUM(order_items.qty * products.price) as total_revenue'))
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_qty')
            ->limit(10)
            ->get();

        // 4. Peak Hours (Dikonversi ke Jam Jakarta)
        $peakHours = DB::table('orders')
            ->whereIn('id', $orderIds)
            // Menambah +7 Jam untuk convert UTC ke WIB secara SQL
            ->select(DB::raw('EXTRACT(HOUR FROM (created_at + INTERVAL \'7 hours\')) as hour'), DB::raw('COUNT(*) as total_orders'))
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        $pdf = Pdf::loadView('reports.pdf', [
            'orders' => $orders,
            'itemCounts' => $itemCounts,
            'totalSales' => $totalSales,
            'totalOrders' => $totalOrders,
            'totalTax' => $totalTax,
            'aov' => $aov,
            'totalItemsSold' => $totalItemsSold,
            'paymentMethods' => $paymentMethods,
            'topMenus' => $topMenus,
            'peakHours' => $peakHours,
            'startDate' => $startDate->format('d M Y'),
            'endDate' => $endDate->format('d M Y')
        ]);
        
        return $pdf->download('Laporan_Penjualan_POS_' . $startDate->format('d_M_Y') . '.pdf');
    }
}