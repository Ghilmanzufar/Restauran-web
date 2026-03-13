<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        // Ambil data dari database, jika kosong gunakan default 10% dan 5%
        $settings = [
            'tax_percentage' => Setting::getValue('tax_percentage', 10),
            'service_percentage' => Setting::getValue('service_percentage', 5),
            'store_name' => Setting::getValue('store_name', 'RESTOPRO'),
            'store_address' => Setting::getValue('store_address', 'Jl. Contoh Alamat No. 123'),
        ];

        return Inertia::render('Admin/Setting/Index', [
            'settings' => $settings
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'tax_percentage' => 'required|numeric|min:0|max:100',
            'service_percentage' => 'required|numeric|min:0|max:100',
            'store_name' => 'required|string|max:255',
            'store_address' => 'required|string|max:500',
        ]);

        // Simpan nilai lama untuk Audit Log
        $oldValues = [
            'tax_percentage' => Setting::getValue('tax_percentage', 10),
            'service_percentage' => Setting::getValue('service_percentage', 5),
            'store_name' => Setting::getValue('store_name'),
            'store_address' => Setting::getValue('store_address'),
        ];

        // Update atau Buat pengaturan baru
        foreach ($validated as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        // Catat di Audit Log
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'SETTING_UPDATE',
            'entity_type' => 'SYSTEM_SETTING',
            'entity_id' => '1',
            'description' => "Mengubah pengaturan sistem (Pajak, Service, atau Profil Toko)",
            'old_values' => $oldValues,
            'new_values' => $validated,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'severity' => 'WARNING' // Mengubah pajak adalah tindakan krusial
        ]);

        return back()->with('success', 'Pengaturan sistem berhasil diperbarui!');
    }
}