<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    // Gunakan array statis alih-alih query distinct() yang berat untuk dropdown
    private const ACTION_CATEGORIES = [
        'LOGIN', 'LOGOUT', 'ORDER_CREATE', 'ORDER_UPDATE', 'ORDER_CANCEL', 
        'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'PRODUCT_DELETE', 'USER_MANAGEMENT'
    ];

    public function index(Request $request)
    {
        $query = ActivityLog::with('user')->latest();

        // 1. Pencarian via Kolom Search (Description / Entity / IP)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('entity_id', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%")
                  ->orWhereHas('user', function($u) use ($search) {
                      $u->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // 2. Filter Kategori Aksi (Exact Match, bukan LIKE)
        if ($request->filled('action_type')) {
            $query->where('action', $request->action_type);
        }

        // 3. Filter Tanggal Aman (Bisa isi salah satu)
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // 4. Filter Severity
        if ($request->filled('severity')) {
            $query->where('severity', $request->severity);
        }

        return Inertia::render('Admin/Audit/Index', [
            'logs' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['search', 'action_type', 'start_date', 'end_date', 'severity']),
            'actionTypes' => self::ACTION_CATEGORIES // Melempar array statis agar ringan
        ]);
    }

    // Fitur Export Standar Enterprise
    public function exportCsv(Request $request)
    {
        $query = ActivityLog::with('user')->latest();
        // ... (Terapkan logic filter yang sama persis seperti di index) ...
        
        $logs = $query->get();
        $namaFile = 'Audit_Log_' . date('Ymd_His') . '.csv';

        $headers = [
            "Content-type" => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=$namaFile",
        ];

        $callback = function() use($logs) {
            $file = fopen('php://output', 'w');
            fputs($file, "\xEF\xBB\xBF"); // BOM
            fputcsv($file, ['Waktu', 'Severity', 'Aktor', 'IP Address', 'Aksi', 'Target', 'Deskripsi', 'Browser'], ';');

            foreach ($logs as $log) {
                $aktor = $log->user ? $log->user->name : 'System';
                $target = $log->entity_type ? $log->entity_type . ' #' . $log->entity_id : '-';
                
                fputcsv($file, [
                    $log->created_at->format('d-M-Y H:i:s'),
                    $log->severity,
                    $aktor,
                    $log->ip_address ?? '-',
                    $log->action,
                    $target,
                    $log->description,
                    $log->user_agent ?? '-'
                ], ';');
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}