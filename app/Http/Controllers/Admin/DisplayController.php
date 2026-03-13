<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Inertia\Inertia;
use Carbon\Carbon;

class DisplayController extends Controller
{
    public function index()
    {
        // 1. KIRI TV: Sedang Dimasak
        $preparing = Order::with('table')
            ->whereDate('created_at', Carbon::today())
            ->where('order_status', 'processing')
            ->orderBy('updated_at', 'asc')
            ->get()
            ->map(function ($order) {
                return [
                    // 👇 PERBAIKAN: Menggunakan -5 untuk mengambil 5 karakter paling belakang
                    'id' => strtoupper(substr($order->id, -5)),
                    'table' => $order->table ? $order->table->table_number : 'Takeaway',
                ];
            });

        // 2. KANAN TV: Siap Diambil
        $ready = Order::with('table')
            ->whereDate('created_at', Carbon::today())
            ->where('order_status', 'ready') 
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($order) {
                return [
                    // 👇 PERBAIKAN: Menggunakan -5 untuk mengambil 5 karakter paling belakang
                    'id' => strtoupper(substr($order->id, -4)),
                    'table' => $order->table ? $order->table->table_number : 'Takeaway'
                ];
            });

        return Inertia::render('Display/Index', [
            'preparing' => $preparing,
            'ready' => $ready
        ]);
    }
}