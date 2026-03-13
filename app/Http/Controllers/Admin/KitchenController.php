<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Inertia\Inertia;

class KitchenController extends Controller
{
    public function index()
    {
        $activeOrders = Order::with(['table', 'items.product', 'items.variants.productVariantItem'])
            // 👇 PERBAIKAN: Sembunyikan pesanan yang sudah 'ready', 'completed', atau 'cancelled'
            ->whereNotIn('order_status', ['ready', 'completed', 'cancelled'])
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('Admin/Kitchen/Index', [
            'activeOrders' => $activeOrders
        ]);
    }
}