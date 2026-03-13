<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class BannerController extends Controller
{
    public function index()
    {
        $banners = Banner::latest()->get();
        return Inertia::render('Admin/Banner/Index', [
            'banners' => $banners
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:3072', // Maksimal 3MB untuk banner
        ], [
            'image.required' => 'Gambar banner wajib diupload!',
            'image.image' => 'File harus berupa gambar.'
        ]);

        // Simpan gambar ke folder storage/app/public/banners
        $imagePath = $request->file('image')->store('banners', 'public');

        Banner::create([
            'title' => $request->title,
            'image_url' => $imagePath,
            'is_active' => false // Default mati, biar admin nyalakan manual
        ]);

        return back()->with('success', 'Banner baru berhasil diupload!');
    }

    public function toggleStatus(Banner $banner)
    {
        // Ubah status aktif/mati
        $banner->update(['is_active' => !$banner->is_active]);
        
        $pesan = $banner->is_active ? 'Banner berhasil diaktifkan!' : 'Banner dimatikan.';
        return back()->with('success', $pesan);
    }

    public function destroy(Banner $banner)
    {
        // Hapus gambar fisik dari storage
        if ($banner->image_url) {
            Storage::disk('public')->delete($banner->image_url);
        }
        
        $banner->delete();
        return back()->with('success', 'Banner berhasil dihapus!');
    }
}