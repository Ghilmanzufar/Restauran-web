<?php

namespace App\Http\Controllers;

use App\Models\ServiceCall;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class ServiceCallController extends Controller
{
    // 1. Tampilkan Halaman Form
    public function index($tableNumber)
    {
        return Inertia::render('Customer/CallWaiter', [
            'tableNumber' => $tableNumber
        ]);
    }

    // 2. Proses Request
    public function store(Request $request, $tableNumber)
    {
        // A. Validasi Input
        $request->validate([
            'type' => 'required|string',
            'notes' => 'nullable|string|max:100',
        ]);

        // B. Rate Limiting (Anti Spam)
        // Cek apakah meja ini sudah memanggil dalam 1 menit terakhir?
        $cacheKey = "service_call_{$tableNumber}";
        if (Cache::has($cacheKey)) {
            return back()->withErrors(['message' => 'Mohon tunggu sebentar sebelum memanggil lagi.']);
        }

        // C. Simpan ke Database
        ServiceCall::create([
            'table_number' => $tableNumber,
            'type' => $request->type,
            'notes' => $request->notes,
            'status' => 'pending'
        ]);

        // D. Pasang cooldown 1 menit (Biar gak spam)
        Cache::put($cacheKey, true, now()->addMinute());

        return back()->with('success', 'Staff kami akan segera datang ke mejamu!');
    }
}