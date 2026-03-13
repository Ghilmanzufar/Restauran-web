<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Table;
use App\Models\ActivityLog;
use App\Models\OrderSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class TableController extends Controller
{
    // 1. Tampilkan Halaman Manajemen Meja
    public function index()
    {
        $today = \Carbon\Carbon::today();

        // Muat meja beserta relasi sesi aktif, order hari ini, dan panggilan yang masih pending
        $tables = Table::with([
            'activeSession',
            'orders' => function ($query) use ($today) {
                $query->whereDate('created_at', $today)
                      ->whereNotIn('order_status', ['completed', 'cancelled']);
            },
            'serviceCalls' => function ($query) {
                $query->where('status', 'pending');
            }
        ])->orderBy('table_number')->get();

        // Hitung Statistik
        $total = $tables->count();
        $occupied = $tables->whereNotNull('activeSession')->count();
        $empty = $total - $occupied;
        $unpaid = $tables->filter(function ($table) {
            return $table->orders->where('payment_status', 'unpaid')->count() > 0;
        })->count();

        // Pastikan path render sesuai dengan folder Anda (Admin/Table/Index)
        return Inertia::render('Admin/Table/Index', [
            'tables' => $tables,
            'metrics' => [
                'total' => $total,
                'empty' => $empty,
                'occupied' => $occupied,
                'unpaid' => $unpaid
            ]
        ]);
    }

    // 2. Tambah Meja Baru
    public function store(Request $request)
    {
        if (auth()->user()->role === 'kasir') abort(403, 'Kasir tidak diizinkan mengubah meja.');
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

    public function update(Request $request, Table $table)
    {
        $validated = $request->validate(['table_number' => 'required|string|max:50|unique:tables,table_number,' . $table->id]);
        
        $oldData = $table->getOriginal();
        $table->update(['table_number' => $validated['table_number']]);
        $newData = $table->getChanges();

        if (!empty($newData)) {
            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'TABLE_UPDATE',
                'entity_type' => 'TABLE',
                'entity_id' => $table->id,
                'description' => "Mengubah identitas meja dari {$oldData['table_number']} menjadi {$table->table_number}",
                'old_values' => array_intersect_key($oldData, $newData),
                'new_values' => $newData,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'severity' => 'INFO'
            ]);
        }

        return back()->with('success', 'Nama/Nomor meja berhasil diubah.');
    }

    public function destroy(Table $table)
    {
        if (auth()->user()->role === 'kasir') abort(403, 'Kasir tidak diizinkan mengubah meja.');
        if ($table->activeSession) return back()->withErrors(['table' => 'Gagal: Meja ini masih memiliki sesi/pelanggan aktif.']);
        
        $oldData = $table->toArray();
        $number = $table->table_number;
        $id = $table->id;
        
        $table->delete();

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'TABLE_DELETE',
            'entity_type' => 'TABLE',
            'entity_id' => $id,
            'description' => "Menghapus meja nomor {$number}",
            'old_values' => $oldData,
            'new_values' => null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'severity' => 'WARNING'
        ]);

        return back()->with('success', 'Meja berhasil dihapus.');
    }

    public function forceClose(Table $table)
    {
        $session = $table->activeSession;
        if ($session) {
            $session->update(['status' => 'closed', 'closed_at' => now()]);
            $table->update(['status' => 'available']);

            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'TABLE_FORCE_CLOSE',
                'entity_type' => 'TABLE',
                'entity_id' => $table->id,
                'description' => "Menutup paksa sesi (Force Close) pada Meja {$table->table_number}",
                'old_values' => ['table_status' => 'occupied', 'session_status' => 'active'],
                'new_values' => ['table_status' => 'available', 'session_status' => 'closed'],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'severity' => 'CRITICAL'
            ]);

            return back()->with('success', 'Sesi meja berhasil ditutup paksa. Meja sekarang kosong.');
        }
        return back()->withErrors(['table' => 'Meja ini sudah kosong.']);
    }

    public function regenerateQr(Table $table)
    {
        $oldData = $table->getOriginal();
        $table->update(['qr_token' => Str::random(10)]);
        $newData = $table->getChanges();

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'TABLE_QR_REGENERATE',
            'entity_type' => 'TABLE',
            'entity_id' => $table->id,
            'description' => "Meriset ulang (Regenerate) QR Code untuk Meja {$table->table_number}",
            'old_values' => array_intersect_key($oldData, $newData),
            'new_values' => $newData,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'severity' => 'WARNING'
        ]);

        return back()->with('success', 'QR Code berhasil di-generate ulang.');
    }
}