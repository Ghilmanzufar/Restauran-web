<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceCall;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceCallController extends Controller
{
    // Tampilkan daftar panggilan yang belum diselesaikan
    public function index()
    {
        $calls = ServiceCall::where('status', 'pending')
                            ->orderBy('created_at', 'asc') // Yang paling lama manggil, di atas
                            ->get();

        return Inertia::render('Admin/ServiceCall/Index', [
            'calls' => $calls
        ]);
    }

    // Tandai panggilan sudah ditangani
    public function resolve(ServiceCall $serviceCall)
    {
        $serviceCall->update(['status' => 'resolved']);
        return back()->with('success', 'Panggilan dari Meja ' . $serviceCall->table_number . ' telah diselesaikan.');
    }
}