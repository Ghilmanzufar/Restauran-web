import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import { BiX, BiImageAdd, BiCheckCircle } from 'react-icons/bi';

export default function FormModal({ isOpen, onClose, product = null, categories }) {
    const isEdit = !!product; // Jika ada props product, berarti mode Edit
    const [imagePreview, setImagePreview] = useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        category_id: '',
        price: '',
        description: '',
        image: null,
        _method: isEdit ? 'put' : 'post', // Trik Inertia untuk upload file saat Edit
    });

    // Jalankan setiap kali modal dibuka atau ganti produk
    useEffect(() => {
        if (isOpen) {
            if (isEdit) {
                setData({
                    name: product.name || '',
                    category_id: product.category_id || '',
                    price: product.price || '',
                    description: product.description || '',
                    image: null, 
                    _method: 'put',
                });
                setImagePreview(product.image_url ? `/storage/${product.image_url}` : null);
            } else {
                reset(); // Kosongkan form jika tambah baru
                setImagePreview(null);
                setData('_method', 'post');
            }
            clearErrors();
        }
    }, [isOpen, product]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setData('image', file);
        if (file) setImagePreview(URL.createObjectURL(file)); // Buat preview instan
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const routeName = isEdit ? route('admin.menu.update', product.id) : route('admin.menu.store');
        
        post(routeName, {
            onSuccess: () => {
                reset();
                onClose();
            },
            preserveScroll: true,
        });
    };

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="2xl">
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* Header Modal */}
                <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-black">{isEdit ? 'Edit Menu' : 'Tambah Menu Baru'}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <BiX className="text-2xl" />
                    </button>
                </div>

                {/* Body Form (Bisa di-scroll) */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5 bg-slate-50">
                        
                        {/* FOTO UPLOAD */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Foto Produk</label>
                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-white hover:bg-blue-50 hover:border-blue-400 transition-all overflow-hidden group">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400 group-hover:text-blue-500">
                                        <BiImageAdd className="text-4xl mb-2" />
                                        <p className="text-sm font-bold">Klik untuk upload gambar</p>
                                        <p className="text-xs font-medium">PNG, JPG, WEBP (Max 2MB)</p>
                                    </div>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                            {errors.image && <p className="text-red-500 text-xs font-bold mt-1">{errors.image}</p>}
                        </div>

                        {/* ROW: NAMA & KATEGORI */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Nama Menu <span className="text-red-500">*</span></label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm" placeholder="Contoh: Nasi Goreng Spesial" required />
                                {errors.name && <p className="text-red-500 text-xs font-bold mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Kategori <span className="text-red-500">*</span></label>
                                <select value={data.category_id} onChange={e => setData('category_id', e.target.value)} className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm" required>
                                    <option value="" disabled>-- Pilih Kategori --</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                                {errors.category_id && <p className="text-red-500 text-xs font-bold mt-1">{errors.category_id}</p>}
                            </div>
                        </div>

                        {/* HARGA */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Harga (Rp) <span className="text-red-500">*</span></label>
                            <input type="number" value={data.price} onChange={e => setData('price', e.target.value)} className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm text-xl font-black text-slate-900" placeholder="25000" required />
                            {errors.price && <p className="text-red-500 text-xs font-bold mt-1">{errors.price}</p>}
                        </div>

                        {/* DESKRIPSI */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi Singkat (Opsional)</label>
                            <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows="3" className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm" placeholder="Jelaskan detail menu ini untuk menarik pelanggan..."></textarea>
                            {errors.description && <p className="text-red-500 text-xs font-bold mt-1">{errors.description}</p>}
                        </div>

                    </div>

                    {/* Footer / Tombol Action */}
                    <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-3 shrink-0">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-slate-600 font-bold bg-gray-100 hover:bg-gray-200 transition-colors">
                            Batal
                        </button>
                        <button type="submit" disabled={processing} className="px-6 py-2.5 rounded-xl text-white font-black bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 flex items-center gap-2 disabled:opacity-50 transition-all">
                            <BiCheckCircle className="text-lg" /> {isEdit ? 'Simpan Perubahan' : 'Tambahkan Menu'}
                        </button>
                    </div>
                </form>

            </div>
        </Modal>
    );
}