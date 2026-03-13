<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServiceCall;
use App\Models\ActivityLog;
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

    public function resolve(ServiceCall $serviceCall)
    {
        $oldData = $serviceCall->getOriginal();
        $serviceCall->update(['status' => 'resolved']);
        $newData = $serviceCall->getChanges();

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'SERVICE_CALL_RESOLVE',
            'entity_type' => 'SERVICE_CALL',
            'entity_id' => $serviceCall->id,
            'description' => "Menyelesaikan panggilan layanan dari Meja {$serviceCall->table_number}",
            'old_values' => array_intersect_key($oldData, $newData),
            'new_values' => $newData,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'severity' => 'INFO'
        ]);

        return back()->with('success', 'Panggilan dari Meja ' . $serviceCall->table_number . ' telah diselesaikan.');
    }
}