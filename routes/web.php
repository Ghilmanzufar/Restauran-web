<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ServiceCallController; // <--- TAMBAHKAN INI
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// --- 1. HALAMAN DEPAN UMUM (Landing Page Website) ---
Route::get('/', function () {
    return Inertia::render('Landing'); 
})->name('home');

// --- 2. DASHBOARD ADMIN/STAFF ---
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');


// --- 3. GRUP ROUTE CUSTOMER (Pemesanan QR) ---
// Semua URL di bawah ini diawali dengan: /order/{tableNumber}
// Semua Nama Route diawali dengan: customer. (misal: customer.menu)
Route::prefix('order/{tableNumber}')->name('customer.')->group(function () {

    // A. GERBANG MASUK (Public / Session Creator)
    // Halaman ini yang membuat "Tiket Sesi" saat pertama kali scan
    Route::get('/', [OrderController::class, 'index'])->name('menu');

    Route::get('/call', [ServiceCallController::class, 'index'])->name('call.index');
    Route::post('/call', [ServiceCallController::class, 'store'])->name('call.store');

    // B. AREA TERLARANG (Wajib Punya Tiket Sesi Valid)
    // Middleware 'order.session' akan menolak akses jika sesi sudah ditutup/expired
    Route::middleware(['order.session'])->group(function () {
        
        // Keranjang
        Route::get('/cart', [OrderController::class, 'cart'])->name('cart');
        
        // Halaman Promo
        Route::get('/promos', [OrderController::class, 'promos'])->name('promos');
        
        // Checkout & Bayar (Paling Penting Dijaga)
        Route::get('/checkout', [OrderController::class, 'checkout'])->name('checkout');
        Route::post('/checkout', [OrderController::class, 'store'])->name('store');

        // <--- TAMBAHKAN DISINI (Fitur Cancel) ---
        // URL aslinya jadi: /order/{tableNumber}/cancel/{orderId}
        // Nama aslinya jadi: customer.cancel
        Route::post('/cancel/{orderId}', [OrderController::class, 'cancel'])->name('cancel');
    });

    // C. AREA READ-ONLY (Bebas Akses)
    // History & Status boleh dilihat walau sesi sudah ditutup (untuk bukti pembayaran)
    Route::get('/history', [OrderController::class, 'history'])->name('history');
    Route::get('/status/{orderId}', [OrderController::class, 'showStatus'])->name('order_detail');
});


// --- 4. PROFILE USER (Admin) ---
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';