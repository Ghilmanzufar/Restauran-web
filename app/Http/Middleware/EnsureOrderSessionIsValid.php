<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Table;
use App\Models\OrderSession;
use Inertia\Inertia;

class EnsureOrderSessionIsValid
{
    // HAPUS ": Response" agar bisa me-return Inertia::render
    public function handle(Request $request, Closure $next) 
    {
        // 1. Ambil Nomor Meja dari URL
        $tableNumber = $request->route('tableNumber');
        
        // Jika route tidak ada parameter tableNumber, lewatkan saja
        if (!$tableNumber) return $next($request);

        // 2. Cek Apakah Meja Ada?
        $table = Table::where('table_number', $tableNumber)->first();
        if (!$table) abort(404);

        // 3. Ambil Tiket dari HP User (Cookie)
        $userToken = $request->cookie('resto_session_token');

        // 4. VALIDASI KE DATABASE PUSAT
        $validSession = OrderSession::where('table_id', $table->id)
            ->where('session_code', $userToken) 
            ->where('status', 'active')         
            ->where(function ($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now()); 
            })
            ->exists();

        // 5. JIKA TIDAK VALID -> TENDANG KE HALAMAN ERROR
        if (!$validSession) {
            // Jika request berupa API/JSON
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Sesi pesanan telah berakhir.'], 403);
            }
            
            // Tampilkan Halaman Error Cantik (Inertia Response)
            return Inertia::render('Customer/Error', [
                'status' => 403,
                'message' => 'Sesi pemesanan Anda sudah habis atau ditutup oleh kasir. Silakan scan ulang QR Code.'
            ]);
        }

        // Jika Valid, silakan masuk
        return $next($request);
    }
}