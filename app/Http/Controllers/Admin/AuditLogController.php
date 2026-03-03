<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = ActivityLog::with('user')->latest();

        // 1. Filter Pencarian (Nama User atau Deskripsi)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // 2. Filter Kategori Aksi
        if ($request->filled('action_type') && $request->action_type !== 'all') {
            $query->where('action', 'like', "%{$request->action_type}%");
        }

        // 3. Filter Tanggal
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59'
            ]);
        }

        $logs = $query->paginate(30)->withQueryString();

        // Ambil daftar aksi unik untuk dropdown filter
        $actionTypes = ActivityLog::select('action')->distinct()->pluck('action');

        return Inertia::render('Admin/Audit/Index', [
            'logs' => $logs,
            'actionTypes' => $actionTypes,
            'filters' => $request->only(['search', 'action_type', 'start_date', 'end_date'])
        ]);
    }
}