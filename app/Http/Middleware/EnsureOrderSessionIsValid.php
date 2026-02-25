<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Table;
use App\Models\OrderSession;
use Inertia\Inertia;

class EnsureOrderSessionIsValid
{
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Ambil Nomor Meja dari URL
        $tableNumber = $request->route('tableNumber');
        
        // Jika route tidak ada parameter tableNumber, lewatkan saja (misal route umum)
        if (!$tableNumber) return $next($request);

        // 2. Cek Apakah Meja Ada?
        $table = Table::where('table_number', $tableNumber)->first();
        if (!$table) abort(404);

        // 3. Ambil Tiket dari HP User (Cookie)
        $userToken = $request->cookie('resto_session_token');

        // 4. VALIDASI KE DATABASE PUSAT
        // "Apakah ada sesi AKTIF untuk meja ini dengan kode tiket INI?"
        $validSession = OrderSession::where('table_id', $table->id)
            ->where('session_code', $userToken) // Cocokkan kode tiket
            ->where('status', 'active')         // Status harus ACTIVE
            ->where(function ($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now()); // Belum kadaluarsa
            })
            ->exists();

        // 5. JIKA TIDAK VALID -> TENDANG KE HALAMAN ERROR
        if (!$validSession) {
            // Jika request berupa API/JSON (biar gak error html di console)
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Sesi pesanan telah berakhir.'], 403);
            }
            
            // Tampilkan Halaman Error Cantik
            return Inertia::render('Customer/Error', [
                'status' => 403,
                'message' => 'Sesi pemesanan Anda sudah habis atau ditutup oleh kasir. Silakan scan ulang QR Code.'
            ]);
        }

        // Jika Valid, silakan masuk
        return $next($request);
    }
}