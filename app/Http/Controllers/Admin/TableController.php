<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Table;
use App\Models\OrderSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class TableController extends Controller
{
    // 1. Tampilkan Halaman Manajemen Meja
    public function index()
    {
        // Ambil semua meja beserta sesi aktifnya (jika ada)
        $tables = Table::with(['activeSession' => function($query) {
            $query->withCount(['orders as unpaid_orders_count' => function($q) {
                $q->where('payment_status', 'unpaid')
                  ->whereNotIn('order_status', ['completed', 'cancelled']);
            }]);
        }])
        ->orderBy('table_number')
        ->get();

        return Inertia::render('Admin/Table/Index', [
            'tables' => $tables
        ]);
    }

    // 2. Tambah Meja Baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_number' => 'required|string|max:50|unique:tables,table_number',
        ], [
            'table_number.unique' => 'Nomor/Nama meja ini sudah ada!'
        ]);

        // Buat meja dengan token QR unik
        Table::create([
            'table_number' => $validated['table_number'],
            'qr_token' => Str::random(10),
            'status' => 'available'
        ]);

        return back()->with('success', 'Meja berhasil ditambahkan.');
    }

    // 3. Edit Nama/Nomor Meja
    public function update(Request $request, Table $table)
    {
        $validated = $request->validate([
            'table_number' => 'required|string|max:50|unique:tables,table_number,' . $table->id,
        ], [
            'table_number.unique' => 'Nomor/Nama meja ini sudah dipakai meja lain!'
        ]);

        $table->update(['table_number' => $validated['table_number']]);

        return back()->with('success', 'Nama/Nomor meja berhasil diubah.');
    }

    // 4. Hapus Meja
    public function destroy(Table $table)
    {
        if ($table->activeSession) {
            return back()->withErrors(['table' => 'Gagal: Meja ini masih memiliki sesi/pelanggan aktif.']);
        }
        
        $table->delete();
        return back()->with('success', 'Meja berhasil dihapus.');
    }

    // 5. Reset / Force Close Sesi Meja (Jika pelanggan lupa bayar/kabur)
    public function forceClose(Table $table)
    {
        $session = $table->activeSession;
        
        if ($session) {
            // Tutup sesi
            $session->update([
                'status' => 'closed',
                'closed_at' => now(),
            ]);

            // Kosongkan meja
            $table->update([
                'status' => 'available'
            ]);

            return back()->with('success', 'Sesi meja berhasil ditutup paksa. Meja sekarang kosong.');
        }

        return back()->withErrors(['table' => 'Meja ini sudah kosong.']);
    }

    // 6. Generate Ulang QR Code (Jika token bocor/ingin diganti)
    public function regenerateQr(Table $table)
    {
        $table->update([
            'qr_token' => Str::random(10)
        ]);

        return back()->with('success', 'QR Code berhasil di-reset untuk meja ini.');
    }
}