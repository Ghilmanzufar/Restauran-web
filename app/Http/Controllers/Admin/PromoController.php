<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Promo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class PromoController extends Controller
{
    public function index()
    {
        // Ambil data promo, urutkan dari yang terbaru
        $promos = Promo::latest()->get();
        return Inertia::render('Admin/Promo/Index', ['promos' => $promos]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:promos,code',
            'description' => 'nullable|string',
            'type' => 'required|string|in:percentage,fixed',
            'discount_amount' => 'required|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'min_spend' => 'nullable|numeric|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'quota_total' => 'nullable|integer|min:1',
            'usage_per_user' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
            'is_stackable' => 'boolean',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $validated['image_url'] = $request->file('image')->store('promos', 'public');
        }

        Promo::create($validated);
        return back()->with('success', 'Promo berhasil ditambahkan!');
    }

    public function update(Request $request, Promo $promo)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:promos,code,' . $promo->id,
            'description' => 'nullable|string',
            'type' => 'required|string|in:percentage,fixed',
            'discount_amount' => 'required|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'min_spend' => 'nullable|numeric|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'quota_total' => 'nullable|integer|min:1',
            'usage_per_user' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
            'is_stackable' => 'boolean',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            if ($promo->image_url) Storage::disk('public')->delete($promo->image_url);
            $validated['image_url'] = $request->file('image')->store('promos', 'public');
        }

        $promo->update($validated);
        return back()->with('success', 'Promo berhasil diperbarui!');
    }

    public function destroy(Promo $promo)
    {
        if ($promo->image_url) Storage::disk('public')->delete($promo->image_url);
        $promo->delete();
        return back()->with('success', 'Promo berhasil dihapus!');
    }

    public function toggleStatus(Promo $promo)
    {
        $promo->update(['is_active' => !$promo->is_active]);
        return back()->with('success', 'Status promo diperbarui!');
    }
}