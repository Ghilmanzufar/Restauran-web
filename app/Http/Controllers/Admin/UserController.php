<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        // Ambil data user beserta jumlah log aktivitasnya
        $users = User::withCount('activityLogs')->latest()->get();
        
        // Ambil 50 log aktivitas terakhir
        $logs = ActivityLog::with('user')->latest()->take(50)->get();

        return Inertia::render('Admin/User/Index', [
            'users' => $users,
            'logs' => $logs
        ]);
    }

    // --- FUNGSI TAMBAH USER ---
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'role' => 'required|in:owner,admin,kasir,dapur',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'password' => Hash::make($validated['password']),
        ]);

        // Catat Aktivitas (Versi Enterprise)
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'USER_CREATE',
            'entity_type' => 'USER',
            'entity_id' => $user->id,
            'description' => "Membuat akun baru: {$user->name} ({$user->role})",
            'old_values' => null, // Null karena ini data baru
            'new_values' => $user->toArray(), // Rekam data user yang baru dibuat
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'severity' => 'INFO'
        ]);

        return back()->with('success', 'User berhasil ditambahkan.');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|in:owner,admin,kasir,dapur',
        ]);

        $user->update($validated);

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'UPDATE_USER',
            'description' => "Mengubah data akun: {$user->name}"
        ]);

        return back()->with('success', 'Data user berhasil diperbarui.');
    }

    // --- FUNGSI RESET PASSWORD ---
    public function updatePassword(Request $request, User $user)
    {
        $request->validate(['password' => ['required', 'confirmed', Rules\Password::defaults()]]);
        
        $user->update(['password' => Hash::make($request->password)]);
        
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'USER_PASSWORD_UPDATE',
            'entity_type' => 'USER',
            'entity_id' => $user->id,
            'description' => "Mereset password untuk akun: {$user->name}",
            // Untuk keamanan tingkat tinggi, JANGAN PERNAH menyimpan password asli di dalam log JSON!
            'old_values' => null, 
            'new_values' => null, 
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'severity' => 'WARNING' // Mengubah kredensial adalah level WARNING
        ]);

        return back()->with('success', 'Password berhasil direset.');
    }

    public function toggleStatus(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors(['user' => 'Anda tidak bisa menonaktifkan akun Anda sendiri.']);
        }

        $oldStatus = $user->is_active;

        $user->update(['is_active' => !$user->is_active]);
        
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'USER_STATUS_UPDATE',
            'entity_type' => 'USER',
            'entity_id' => $user->id,
            'description' => "Mengubah status akun {$user->name} menjadi " . ($user->is_active ? 'Aktif' : 'Nonaktif'),
            'old_values' => ['is_active' => $oldStatus],
            'new_values' => ['is_active' => $user->is_active],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'severity' => 'WARNING'
        ]);

        return back()->with('success', 'Status user diperbarui.');
    }

    // --- FUNGSI HAPUS USER ---
    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors(['user' => 'Anda tidak bisa menghapus akun Anda sendiri.']);
        }
        
        $oldData = $user->toArray();
        $name = $user->name;
        $id = $user->id;

        $user->delete();

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'USER_DELETE',
            'entity_type' => 'USER',
            'entity_id' => $id,
            'description' => "Menghapus akun: {$name}",
            'old_values' => $oldData, // Simpan profil terakhir sebelum dihapus
            'new_values' => null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'severity' => 'CRITICAL' // Menghapus karyawan adalah aksi kritikal
        ]);

        return back()->with('success', 'User berhasil dihapus.');
    }
}