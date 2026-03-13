<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Promo;
use App\Models\Product;
use App\Models\Category;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB; 

class PromoController extends Controller
{
    public function index()
    {
        // Ambil data promo, dan hitung 'used_count' secara REAL-TIME dari tabel promo_usages
        $promos = Promo::latest()->get()->map(function ($promo) {
            // Menghitung jumlah pemakaian asli berdasarkan ID Promo
            $promo->used_count = DB::table('promo_usages')
                                   ->where('promo_id', $promo->id)
                                   ->count();
            return $promo;
        });

        $categories = Category::orderBy('name')->get();
        $products = Product::orderBy('name')->get();

        return Inertia::render('Admin/Promo/Index', [
            'promos' => $promos,
            'categories' => $categories,
            'products' => $products
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validatePromo($request);
        if ($request->hasFile('image')) {
            $validated['image_url'] = $request->file('image')->store('promos', 'public');
        }

        $promo = Promo::create($validated);

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'PROMO_CREATE',
            'entity_type' => 'PROMO',
            'entity_id' => $promo->id,
            'description' => "Membuat promo baru: {$promo->code}",
            'old_values' => null,
            'new_values' => $promo->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'severity' => 'INFO'
        ]);

        return back()->with('success', 'Promo berhasil ditambahkan!');
    }

    public function update(Request $request, Promo $promo)
    {
        $validated = $this->validatePromo($request, $promo->id);
        if ($request->hasFile('image')) {
            if ($promo->image_url) Storage::disk('public')->delete($promo->image_url);
            $validated['image_url'] = $request->file('image')->store('promos', 'public');
        }

        $oldData = $promo->getOriginal();
        $promo->update($validated);
        $newData = $promo->getChanges();

        if (!empty($newData)) {
            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'PROMO_UPDATE',
                'entity_type' => 'PROMO',
                'entity_id' => $promo->id,
                'description' => "Mengubah pengaturan promo: {$promo->code}",
                'old_values' => array_intersect_key($oldData, $newData),
                'new_values' => $newData,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'severity' => 'WARNING'
            ]);
        }

        return back()->with('success', 'Promo berhasil diperbarui!');
    }

    public function destroy(Promo $promo)
    {
        $oldData = $promo->toArray();
        $code = $promo->code;
        $id = $promo->id;

        if ($promo->image_url) Storage::disk('public')->delete($promo->image_url);
        $promo->delete();

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'PROMO_DELETE',
            'entity_type' => 'PROMO',
            'entity_id' => $id,
            'description' => "Menghapus promo: {$code}",
            'old_values' => $oldData,
            'new_values' => null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'severity' => 'CRITICAL'
        ]);

        return back()->with('success', 'Promo berhasil dihapus!');
    }

    public function toggleStatus(Promo $promo)
    {
        $oldData = $promo->getOriginal();
        $promo->update(['is_active' => !$promo->is_active]);
        $newData = $promo->getChanges();

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'PROMO_STATUS_UPDATE',
            'entity_type' => 'PROMO',
            'entity_id' => $promo->id,
            'description' => "Mengubah status promo {$promo->code} menjadi " . ($promo->is_active ? 'Aktif' : 'Nonaktif'),
            'old_values' => array_intersect_key($oldData, $newData),
            'new_values' => $newData,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'severity' => 'INFO'
        ]);

        return back()->with('success', 'Status promo berhasil diperbarui.');
    }

    // DRY (Don't Repeat Yourself) - Pisahkan logika validasi agar bersih
    private function validatePromo(Request $request, $id = null)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:promos,code' . ($id ? ",$id" : ''),
            'description' => 'nullable|string',
            'type' => 'required|string|in:percentage,fixed',
            'discount_amount' => 'required|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'min_spend' => 'nullable|numeric|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            
            // 👇 UBAH min:1 MENJADI min:0 👇
            'quota_total' => 'nullable|integer|min:0',
            'usage_per_user' => 'nullable|integer|min:0',
            
            'image' => 'nullable|image|max:2048',
            'target_type' => 'required|string|in:all,category,product',
            'target_id' => 'nullable|string',
            'order_type' => 'required|string|in:all,dine_in,takeaway,delivery',
        ];

        $validated = $request->validate($rules);

        // KOREKSI PENTING: Cast boolean secara aman
        $validated['is_active'] = $request->boolean('is_active');
        $validated['is_stackable'] = $request->boolean('is_stackable');
        $validated['auto_apply'] = $request->boolean('auto_apply');

        // 👇 TAMBAHKAN 2 BARIS INI (Cegah Error Database Not Null) 👇
        // Jika kotak input dikosongkan (null), otomatis ubah menjadi 0 (Unlimited)
        $validated['quota_total'] = $validated['quota_total'] ?? 0;
        $validated['usage_per_user'] = $validated['usage_per_user'] ?? 0;

        return $validated;
    }
}