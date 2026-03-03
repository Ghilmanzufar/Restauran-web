<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ServiceCallController;
use App\Http\Controllers\Admin\PosController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MenuController;
use App\Http\Controllers\Admin\TableController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\PromoController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\ServiceCallController as AdminServiceCallController;
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

// --- 2. DASHBOARD OTOMATIS REDIRECT KE ADMIN ---
Route::get('/dashboard', function () {
    // Supaya kasir otomatis masuk ke Dashboard Admin, bukan layar putih
    return redirect()->route('admin.dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');


// --- 3. GRUP ROUTE CUSTOMER (Pemesanan QR) ---
Route::prefix('order/{tableNumber}')->name('customer.')->group(function () {

    // A. GERBANG MASUK (Public / Session Creator)
    Route::get('/', [OrderController::class, 'index'])->name('menu');
    Route::get('/call', [ServiceCallController::class, 'index'])->name('call.index');
    Route::post('/call', [ServiceCallController::class, 'store'])->name('call.store');

    // B. AREA TRANSAKSI (Wajib Punya Sesi Order Aktif)
    Route::middleware([\App\Http\Middleware\EnsureOrderSessionIsValid::class])->group(function () {
        Route::get('/cart', [OrderController::class, 'cart'])->name('cart');
        Route::get('/promos', [OrderController::class, 'promos'])->name('promos');
        Route::get('/checkout', [OrderController::class, 'checkout'])->name('checkout');
        Route::post('/checkout', [OrderController::class, 'store'])->name('store');
        Route::post('/cancel/{orderId}', [OrderController::class, 'cancel'])->name('cancel');
    });

    // C. AREA READ-ONLY (Bebas Akses)
    Route::get('/history', [OrderController::class, 'history'])->name('history');
    Route::get('/status/{orderId}', [OrderController::class, 'showStatus'])->name('order_detail');
});


// --- 4. GRUP ROUTE ADMIN ---
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    
    // Dashboard Admin
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Manajemen Menu
    Route::get('/menu', [MenuController::class, 'index'])->name('menu.index');
    Route::post('/menu/{product}/toggle', [MenuController::class, 'toggleStatus'])->name('menu.toggle');
    Route::post('/menu/{product}/variants', [MenuController::class, 'syncVariants'])->name('menu.variants.sync'); // <--- TAMBAHKAN INI
    Route::post('/menu', [MenuController::class, 'store'])->name('menu.store');
    Route::post('/menu/{product}', [MenuController::class, 'update'])->name('menu.update');
    Route::delete('/menu/{product}', [MenuController::class, 'destroy'])->name('menu.destroy');
    
    // POS Kasir
    Route::get('/pos', [PosController::class, 'index'])->name('pos.index');
    Route::post('/pos/{order}/pay', [PosController::class, 'processPayment'])->name('pos.pay');
    Route::post('/pos/{order}/cancel', [PosController::class, 'cancelOrder'])->name('pos.cancel');

    // --- MANAJEMEN MEJA & QR CODE ---
    Route::get('/tables', [TableController::class, 'index'])->name('tables.index');
    Route::post('/tables', [TableController::class, 'store'])->name('tables.store');
    Route::put('/tables/{table}', [TableController::class, 'update'])->name('tables.update');
    Route::delete('/tables/{table}', [TableController::class, 'destroy'])->name('tables.destroy');
    Route::post('/tables/{table}/force-close', [TableController::class, 'forceClose'])->name('tables.forceClose');
    Route::post('/tables/{table}/regenerate-qr', [TableController::class, 'regenerateQr'])->name('tables.regenerateQr');

    // --- MANAJEMEN RIWAYAT ORDER & LAPORAN ---
    Route::get('/orders', [AdminOrderController::class, 'index'])->name('orders.index');

    // --- MANAJEMEN PROMO ---
    Route::get('/promos', [PromoController::class, 'index'])->name('promos.index');
    Route::post('/promos', [PromoController::class, 'store'])->name('promos.store');
    Route::post('/promos/{promo}', [PromoController::class, 'update'])->name('promos.update'); // Pakai POST untuk upload file Inertia
    Route::delete('/promos/{promo}', [PromoController::class, 'destroy'])->name('promos.destroy');
    Route::post('/promos/{promo}/toggle', [PromoController::class, 'toggleStatus'])->name('promos.toggle');

    // --- MANAJEMEN USER & ROLE ---
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::put('/users/{user}/password', [UserController::class, 'updatePassword'])->name('users.password');
    Route::post('/users/{user}/toggle', [UserController::class, 'toggleStatus'])->name('users.toggle');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    // --- MANAJEMEN LAPORAN (OWNER VIEW) ---
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');

    // --- AUDIT & LOG AKTIVITAS ---
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit.index');

    // --- PANGGILAN PELAYAN (CALL WAITER) ---
    Route::get('/service-calls', [AdminServiceCallController::class, 'index'])->name('service-calls.index');
    Route::post('/service-calls/{serviceCall}/resolve', [AdminServiceCallController::class, 'resolve'])->name('service-calls.resolve');
});


// --- 5. ROUTE PROFILE BAWAAN BREEZE (YANG MEMBUAT ERROR ZIGGY JIKA DIHAPUS) ---
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';