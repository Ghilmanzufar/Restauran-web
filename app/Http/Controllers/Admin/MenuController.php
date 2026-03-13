<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class MenuController extends Controller
{
    public function index()
    {
        // Eager load category dan variants beserta items-nya
        $products = Product::with(['category', 'variants.items'])->orderBy('name', 'asc')->get();
        $categories = Category::orderBy('name', 'asc')->get();

        return Inertia::render('Admin/Menu/Index', [
            'products' => $products,
            'categories' => $categories
        ]);
    }

    public function toggleStatus(Product $product)
    {
        $product->update(['is_available' => !$product->is_available]);
        return back()->with('success', 'Status stok berhasil diubah!');
    }

    // --- FUNGSI TAMBAH MENU ---
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'stock_qty' => 'required|integer|min:0',
            'rating' => 'nullable|numeric|min:1|max:5',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        // KOREKSI: Buang 'image' dari array karena nama kolom di DB adalah 'image_url'
        $dataToSave = collect($validated)->except('image')->toArray();
        $dataToSave['rating'] = $validated['rating'] ?? 5.0; // Nilai default rating

        if ($request->hasFile('image')) {
            $dataToSave['image_url'] = $request->file('image')->store('products', 'public');
        }

        Product::create($dataToSave);

        return back()->with('success', 'Menu baru berhasil ditambahkan!');
    }

    // --- FUNGSI EDIT MENU ---
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'stock_qty' => 'required|integer|min:0',
            'rating' => 'nullable|numeric|min:1|max:5',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $dataToSave = collect($validated)->except('image')->toArray();
        $dataToSave['rating'] = $validated['rating'] ?? 5.0;

        if ($request->hasFile('image')) {
            if ($product->image_url) {
                Storage::disk('public')->delete($product->image_url);
            }
            $dataToSave['image_url'] = $request->file('image')->store('products', 'public');
        }

        // 1. TANGKAP DATA LAMA (Wajib ditaruh sebelum perintah update)
        $oldData = $product->getOriginal();

        // 2. LAKUKAN UPDATE (Cukup 1 kali saja menggunakan $dataToSave yang sudah rapi)
        $product->update($dataToSave);

        // 3. TANGKAP DATA BARU (Hanya yang berubah)
        $newData = $product->getChanges();

        // 4. CATAT LOG
        if (!empty($newData)) {
            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => 'PRODUCT_UPDATE',
                'entity_type' => 'PRODUCT',
                'entity_id' => $product->id,
                'description' => "Mengubah data menu: {$product->name}",
                'old_values' => array_intersect_key($oldData, $newData),
                'new_values' => $newData,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'severity' => 'WARNING' // Mengubah harga/stok adalah warning
            ]);
        }

        return back()->with('success', 'Menu berhasil diperbarui!');
    }

    public function destroy(Product $product)
    {
        $oldData = $product->toArray(); // Simpan seluruh data sebelum lenyap
        $name = $product->name;
        $id = $product->id;
        
        $product->delete();

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'PRODUCT_DELETE',
            'entity_type' => 'PRODUCT',
            'entity_id' => $id,
            'description' => "Menghapus menu: {$name}",
            'old_values' => $oldData,
            'new_values' => null, // Data terhapus
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'severity' => 'CRITICAL'
        ]);

        return back()->with('success', 'Menu berhasil dihapus!');
    }

    public function syncVariants(Request $request, Product $product)
    {
        $request->validate(['variants' => 'nullable|array']);
        
        $keptVariantIds = [];
        $variantsData = $request->variants ?? [];

        foreach ($variantsData as $vData) {
            // PELINDUNG: Cegah grup tanpa nama atau tanpa item
            if (empty($vData['name']) || empty($vData['items'])) continue;

            // 1. Simpan atau Update Grup Varian
            $variant = $product->variants()->updateOrCreate(
                ['id' => $vData['id'] ?? null],
                [
                    'name' => $vData['name'],
                    'type' => $vData['type'],
                    'is_required' => $vData['is_required'] ?? false,
                    'max_select' => ($vData['type'] === 'checkbox' && !empty($vData['max_select'])) ? $vData['max_select'] : null,
                ]
            );
            $keptVariantIds[] = $variant->id;

            // 2. Simpan atau Update Pilihan Item
            $keptItemIds = [];
            foreach ($vData['items'] as $iData) {
                if (empty($iData['name'])) continue;

                $item = $variant->items()->updateOrCreate(
                    ['id' => $iData['id'] ?? null],
                    [
                        'name' => $iData['name'],
                        'price' => isset($iData['price']) ? (float) $iData['price'] : 0,
                        'is_default' => $iData['is_default'] ?? false,
                        'is_active' => $iData['is_active'] ?? true,
                    ]
                );
                $keptItemIds[] = $item->id;
            }

            // 3. Hapus Item yang dibuang
            $variant->items()->whereNotIn('id', $keptItemIds)->delete();
        }

        // 4. Hapus Grup yang dibuang
        $product->variants()->whereNotIn('id', $keptVariantIds)->delete();

        return back()->with('success', 'Konfigurasi Varian berhasil diperbarui!');
    }

    // --- FUNGSI TAMBAH KATEGORI BARU ---
    public function storeCategory(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
        ], [
            'name.unique' => 'Kategori ini sudah ada di database!'
        ]);

        Category::create([
            'name' => $request->name
        ]);

        // Kembali ke halaman menu, data kategori di layar React akan otomatis ter-update!
        return back()->with('success', 'Kategori baru berhasil ditambahkan!');
    }   

    // --- FUNGSI HAPUS KATEGORI ---
    public function destroyCategory(\App\Models\Category $category)
    {
        // Cek apakah kategori masih dipakai oleh menu
        $dipakai = \App\Models\Product::where('category_id', $category->id)->count();
        
        if ($dipakai > 0) {
            return back()->withErrors(['category' => "Gagal! Kategori ini masih dipakai oleh $dipakai menu. Hapus atau pindahkan menu tersebut dulu."]);
        }

        $category->delete();
        return back()->with('success', 'Kategori berhasil dihapus!');
    }
}