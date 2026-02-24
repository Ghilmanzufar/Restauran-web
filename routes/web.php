<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrderController;
use Inertia\Inertia;

// Pastikan tidak ada route '/' lain di atas atau bawahnya yang duplikat
Route::get('/', function () {
    return Inertia::render('Landing'); 
})->name('home');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Route Landing Page (Halaman Pertama saat Scan QR)
Route::get('/scan/{tableNumber}', [OrderController::class, 'landing'])->name('customer.landing');

// Route untuk halaman pemesanan (Customer Menu)
Route::get('/order/{tableNumber}', [OrderController::class, 'index'])->name('customer.menu');

// Tambahkan di bawah route menu
Route::get('/order/{tableNumber}/cart', [OrderController::class, 'cart'])->name('customer.cart');

// Route Checkout (Menampilkan Halaman Ringkasan)
Route::get('/order/{tableNumber}/checkout', [OrderController::class, 'checkout'])->name('customer.checkout');
Route::post('/order/{tableNumber}/checkout', [OrderController::class, 'store'])->name('customer.store');


// Route History (Daftar Pesanan)
Route::get('/order/{tableNumber}/history', [OrderController::class, 'history'])->name('customer.history');
// Route Status Detail (Melihat satu pesanan spesifik)
// Perhatikan ada parameter {orderId} agar kita bisa melihat orderan masa lalu
Route::get('/order/{tableNumber}/status/{orderId}', [OrderController::class, 'showStatus'])->name('customer.order_detail');

// Route Halaman Promo
Route::get('/order/{tableNumber}/promos', [OrderController::class, 'promos'])->name('customer.promos');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
