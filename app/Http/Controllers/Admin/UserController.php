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

        // Catat Aktivitas
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'CREATE_USER',
            'description' => "Membuat akun baru: {$user->name} ({$user->role})"
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

    public function updatePassword(Request $request, User $user)
    {
        $request->validate(['password' => ['required', 'confirmed', Rules\Password::defaults()]]);
        $user->update(['password' => Hash::make($request->password)]);
        return back()->with('success', 'Password berhasil direset.');
    }

    public function toggleStatus(User $user)
    {
        // Cegah owner menonaktifkan dirinya sendiri
        if ($user->id === auth()->id()) {
            return back()->withErrors(['user' => 'Anda tidak bisa menonaktifkan akun Anda sendiri.']);
        }

        $user->update(['is_active' => !$user->is_active]);
        
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'TOGGLE_USER_STATUS',
            'description' => "Mengubah status akun {$user->name} menjadi " . ($user->is_active ? 'Aktif' : 'Nonaktif')
        ]);

        return back()->with('success', 'Status user diperbarui.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors(['user' => 'Anda tidak bisa menghapus akun Anda sendiri.']);
        }
        
        $name = $user->name;
        $user->delete();

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'DELETE_USER',
            'description' => "Menghapus akun: {$name}"
        ]);

        return back()->with('success', 'User berhasil dihapus.');
    }
}