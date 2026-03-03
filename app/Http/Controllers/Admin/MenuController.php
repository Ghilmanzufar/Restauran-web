<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
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
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048', // Maks 2MB
        ]);

        // Jika ada upload gambar
        if ($request->hasFile('image')) {
            // Simpan ke folder storage/app/public/products
            $validated['image_url'] = $request->file('image')->store('products', 'public');
        }

        Product::create($validated);

        return back()->with('success', 'Menu baru berhasil ditambahkan!');
    }

    // --- FUNGSI EDIT MENU ---
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        if ($request->hasFile('image')) {
            // Hapus gambar lama jika ada
            if ($product->image_url) {
                Storage::disk('public')->delete($product->image_url);
            }
            // Simpan gambar baru
            $validated['image_url'] = $request->file('image')->store('products', 'public');
        }

        $product->update($validated);

        return back()->with('success', 'Menu berhasil diperbarui!');
    }

    // --- FUNGSI HAPUS MENU ---
    public function destroy(Product $product)
    {
        // Hapus gambar fisiknya dari storage
        if ($product->image_url) {
            Storage::disk('public')->delete($product->image_url);
        }
        
        $product->delete(); // Soft delete sesuai model Anda

        return back()->with('success', 'Menu berhasil dihapus!');
    }

    // --- FUNGSI SIMPAN VARIAN (SISTEM SYNC CERDAS) ---
    public function syncVariants(Request $request, Product $product)
    {
        $request->validate([
            'variants' => 'array',
        ]);

        $keptVariantIds = [];

        foreach ($request->variants as $vData) {
            // 1. Update jika Varian sudah ada, Create jika baru
            if (isset($vData['id']) && $vData['id'] != null) {
                $variant = $product->variants()->find($vData['id']);
                if ($variant) {
                    $variant->update([
                        'name' => $vData['name'],
                        'type' => $vData['type'],
                        'is_required' => $vData['is_required'] ?? false,
                    ]);
                }
            } else {
                $variant = $product->variants()->create([
                    'name' => $vData['name'],
                    'type' => $vData['type'],
                    'is_required' => $vData['is_required'] ?? false,
                ]);
            }
            $keptVariantIds[] = $variant->id;

            // 2. Proses Pilihan (Items) Varian
            $keptItemIds = [];
            if (!empty($vData['items'])) {
                foreach ($vData['items'] as $iData) {
                    if (isset($iData['id']) && $iData['id'] != null) {
                        $item = $variant->items()->find($iData['id']);
                        if ($item) {
                            $item->update([
                                'name' => $iData['name'],
                                'price' => $iData['price'] ?? 0,
                            ]);
                            $keptItemIds[] = $item->id;
                        }
                    } else {
                        $item = $variant->items()->create([
                            'name' => $iData['name'],
                            'price' => $iData['price'] ?? 0,
                        ]);
                        $keptItemIds[] = $item->id;
                    }
                }
            }

            // 3. Hapus Item yang dibuang user (Hanya jika belum pernah dipesan)
            try {
                $variant->items()->whereNotIn('id', $keptItemIds)->delete();
            } catch (\Illuminate\Database\QueryException $e) {
                return back()->withErrors(['variants' => 'Gagal: Ada "Pilihan Varian" yang tidak bisa dihapus karena sudah tercetak di struk pesanan lama. Solusi: Ubah saja namanya.']);
            }
        }

        // 4. Hapus Grup Varian yang dibuang user (Hanya jika belum pernah dipesan)
        try {
            $product->variants()->whereNotIn('id', $keptVariantIds)->delete();
        } catch (\Illuminate\Database\QueryException $e) {
            return back()->withErrors(['variants' => 'Gagal: Ada "Grup Varian" yang tidak bisa dihapus karena sudah tercetak di struk pesanan lama. Solusi: Ubah saja namanya.']);
        }

        return back()->with('success', 'Varian menu berhasil diperbarui!');
    }
}