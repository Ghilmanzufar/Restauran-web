import React, { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { BiImageAdd, BiTrash, BiPowerOff } from "react-icons/bi";
import { Toaster, toast } from "sonner";

export default function BannerIndex({ banners }) {
    const [imagePreview, setImagePreview] = useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        title: '',
        image: null,
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setData('image', file);
        if (file) setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.banners.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Banner berhasil ditambahkan!');
                reset();
                setImagePreview(null);
                clearErrors();
            }
        });
    };

    const handleToggle = (banner) => {
        router.post(route('admin.banners.toggle', banner.id), {}, { preserveScroll: true });
    };

    const handleDelete = (banner) => {
        if (confirm(`Yakin ingin menghapus banner "${banner.title}"?`)) {
            router.delete(route('admin.banners.destroy', banner.id), {
                preserveScroll: true,
                onSuccess: () => toast.success('Banner dihapus!')
            });
        }
    };

    return (
        <AdminLayout title="Manajemen Banner">
            <Head title="Manajemen Banner Event" />
            <Toaster position="top-center" richColors />

            <div className="mb-8">
                <h2 className="text-xl font-black text-slate-900">Banner Event Spesial</h2>
                <p className="text-sm font-semibold text-gray-500">Upload baliho promosi (Ramadhan, Natal, Tahun Baru, dll).</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* KOLOM KIRI: FORM UPLOAD */}
                <div className="lg:col-span-1">
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="font-black text-slate-800 mb-4 pb-3 border-b border-gray-100">Upload Banner Baru</h3>
                        
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Event *</label>
                            <input 
                                type="text" 
                                value={data.title} 
                                onChange={e => setData('title', e.target.value)} 
                                className="w-full rounded-xl border-gray-300 focus:border-blue-500 text-sm" 
                                placeholder="Msl: Gebyar Ramadhan 2026" 
                                required 
                            />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                        </div>

                        <div className="mb-5">
                            <label className="block text-xs font-bold text-slate-700 mb-1">File Gambar * <span className="text-gray-400 font-normal">(Landscape disarankan)</span></label>
                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-blue-50 hover:border-blue-400 transition-all overflow-hidden group">
                                {imagePreview ? (
                                    <img src={imagePreview} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-blue-500">
                                        <BiImageAdd className="text-4xl mb-2" />
                                        <p className="text-xs font-bold">Klik untuk memilih file</p>
                                    </div>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} required />
                            </label>
                            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
                        </div>

                        <button 
                            type="submit" 
                            disabled={processing} 
                            className="w-full py-3 rounded-xl text-white font-black bg-blue-600 hover:bg-blue-700 shadow-lg transition-all"
                        >
                            Upload Sekarang
                        </button>
                    </form>
                </div>

                {/* KOLOM KANAN: DAFTAR BANNER */}
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {banners.length === 0 ? (
                            <div className="col-span-full py-16 text-center text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
                                <BiImageAdd className="text-5xl mx-auto mb-2 opacity-30" />
                                <p className="font-semibold text-sm">Belum ada banner yang diupload.</p>
                            </div>
                        ) : (
                            banners.map(banner => (
                                <div key={banner.id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all ${!banner.is_active && 'opacity-70 grayscale-[30%]'}`}>
                                    <div className="h-32 bg-slate-900 relative">
                                        <img src={`/storage/${banner.image_url}`} alt={banner.title} className="w-full h-full object-cover" />
                                        
                                        {/* Status Badge */}
                                        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest shadow-md ${banner.is_active ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-300'}`}>
                                            {banner.is_active ? 'Sedang Tampil' : 'Mati'}
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        <h3 className="font-bold text-slate-800 text-sm mb-3 line-clamp-1">{banner.title}</h3>
                                        
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => handleToggle(banner)} 
                                                className={`flex-1 py-1.5 rounded-lg font-bold text-xs flex justify-center items-center transition-all ${banner.is_active ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
                                            >
                                                <BiPowerOff className="text-sm mr-1" /> {banner.is_active ? "Matikan" : "Aktifkan"}
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(banner)} 
                                                className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex justify-center items-center hover:bg-red-100 transition-colors"
                                                title="Hapus"
                                            >
                                                <BiTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}