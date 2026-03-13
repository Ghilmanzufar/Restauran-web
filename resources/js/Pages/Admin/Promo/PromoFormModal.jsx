import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import { BiImageAdd, BiShuffle } from 'react-icons/bi';
import { toast } from 'sonner';

const formatDateTimeForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
};

export default function PromoFormModal({ isOpen, onClose, promo, categories, products }) {
    const isEdit = !!promo;
    const [imagePreview, setImagePreview] = useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '', code: '', description: '', type: 'percentage', discount_amount: '',
        max_discount: '', min_spend: '', start_date: '', end_date: '', 
        quota_total: '', usage_per_user: '', is_active: true, is_stackable: false, 
        auto_apply: false, target_type: 'all', target_id: '', order_type: 'all',
        image: null, _method: 'post'
    });

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (isEdit) {
                setData({
                    name: promo.name, code: promo.code, description: promo.description || '', 
                    type: promo.type, discount_amount: promo.discount_amount,
                    max_discount: promo.max_discount || '', min_spend: promo.min_spend || '',
                    start_date: formatDateTimeForInput(promo.start_date), end_date: formatDateTimeForInput(promo.end_date),
                    quota_total: promo.quota_total || '', usage_per_user: promo.usage_per_user || '',
                    is_active: promo.is_active, is_stackable: promo.is_stackable,
                    auto_apply: promo.auto_apply || false, target_type: promo.target_type || 'all',
                    target_id: promo.target_id || '', order_type: promo.order_type || 'all',
                    image: null, _method: 'put'
                });
                setImagePreview(promo.image_url ? `/storage/${promo.image_url}` : null);
            } else {
                reset();
                setData('_method', 'post');
                setImagePreview(null);
            }
        }
    }, [isOpen, promo]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setData('image', file);
        if (file) setImagePreview(URL.createObjectURL(file));
    };

    const generateCode = () => {
        setData('code', `PROMO-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const routeName = isEdit ? route('admin.promos.update', promo.id) : route('admin.promos.store');
        post(routeName, {
            preserveScroll: true,
            onSuccess: () => { 
                toast.success('Promo berhasil disimpan!'); 
                onClose(); 
            }
        });
    };

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="3xl">
            <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-black">{isEdit ? 'Edit Promo' : 'Tambah Promo Baru'}</h2>
                    
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                        <span className="text-xs font-bold">Status Aktif:</span>
                        <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="rounded text-emerald-500 focus:ring-emerald-500" />
                    </label>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* KOLOM KIRI: INFO & TARGET */}
                        <div className="space-y-4">
                            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs border-b border-gray-200 pb-2">Informasi Dasar & Target</h3>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Banner Promo (Opsional)</label>
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-white hover:bg-blue-50 hover:border-blue-400 transition-all overflow-hidden group relative">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400 group-hover:text-blue-500">
                                            <BiImageAdd className="text-3xl mb-1" />
                                            <p className="text-[10px] font-bold">Klik untuk upload banner</p>
                                        </div>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                                {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
                            </div>
                            
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Promo *</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full rounded-lg border-gray-300 focus:border-blue-500 text-sm" required />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Kode Voucher *</label>
                                    <div className="flex">
                                        <input type="text" value={data.code} onChange={e => setData('code', e.target.value.toUpperCase().replace(/\s/g, ''))} className="w-full rounded-l-lg border-gray-300 focus:border-blue-500 text-sm uppercase font-black" required placeholder="MSL: DISKON20" />
                                        <button type="button" onClick={generateCode} className="bg-slate-200 px-3 rounded-r-lg hover:bg-slate-300 text-slate-600 transition-colors" title="Generate Otomatis"><BiShuffle /></button>
                                    </div>
                                    {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                                </div>
                            </div>

                            <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-blue-800 mb-1">Target Diskon Berlaku Untuk:</label>
                                    <select value={data.target_type} onChange={e => { setData('target_type', e.target.value); setData('target_id', ''); }} className="w-full rounded-lg border-blue-200 focus:border-blue-500 text-sm bg-blue-50/50">
                                        <option value="all">Semua Menu</option>
                                        <option value="category">Kategori Tertentu</option>
                                        <option value="product">Menu Spesifik</option>
                                    </select>
                                </div>
                                
                                {data.target_type === 'category' && (
                                    <div>
                                        <select value={data.target_id} onChange={e => setData('target_id', e.target.value)} className="w-full rounded-lg border-gray-300 text-sm" required>
                                            <option value="" disabled>-- Pilih Kategori --</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                {data.target_type === 'product' && (
                                    <div>
                                        <select value={data.target_id} onChange={e => setData('target_id', e.target.value)} className="w-full rounded-lg border-gray-300 text-sm" required>
                                            <option value="" disabled>-- Pilih Menu --</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Pesanan</label>
                                <select value={data.order_type} onChange={e => setData('order_type', e.target.value)} className="w-full rounded-lg border-gray-300 focus:border-blue-500 text-sm">
                                    <option value="all">Semua Pesanan (Dine-in & Takeaway)</option>
                                    <option value="dine_in">Hanya Makan di Tempat (Dine-in)</option>
                                    <option value="takeaway">Hanya Bungkus (Takeaway)</option>
                                    <option value="delivery">Hanya Delivery</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
                                <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows="2" className="w-full rounded-lg border-gray-300 text-sm"></textarea>
                            </div>
                        </div>

                        {/* KOLOM KANAN: ATURAN & SYARAT */}
                        <div className="space-y-4">
                            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs border-b border-gray-200 pb-2">Aturan Diskon & Syarat</h3>
                            
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Tipe *</label>
                                    <select value={data.type} onChange={e => setData('type', e.target.value)} className="w-full rounded-lg border-gray-300 focus:border-blue-500 text-sm">
                                        <option value="percentage">Persen (%)</option>
                                        <option value="fixed">Nominal (Rp)</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Nilai *</label>
                                    <input type="number" value={data.discount_amount} onChange={e => setData('discount_amount', e.target.value)} className="w-full rounded-lg border-gray-300 text-sm" required />
                                    {errors.discount_amount && <p className="text-red-500 text-xs mt-1">{errors.discount_amount}</p>}
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Maks. Potongan (Rp)</label>
                                    <input type="number" value={data.max_discount} onChange={e => setData('max_discount', e.target.value)} className="w-full rounded-lg border-gray-300 text-sm bg-white disabled:bg-gray-100" placeholder="Opsional" disabled={data.type === 'fixed'} />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Min. Belanja (Rp)</label>
                                    <input type="number" value={data.min_spend} onChange={e => setData('min_spend', e.target.value)} className="w-full rounded-lg border-gray-300 text-sm" placeholder="Opsional" />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Mulai Berlaku</label>
                                    <input type="datetime-local" value={data.start_date} onChange={e => setData('start_date', e.target.value)} className="w-full rounded-lg border-gray-300 text-sm" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Berakhir Pada</label>
                                    <input type="datetime-local" value={data.end_date} onChange={e => setData('end_date', e.target.value)} className="w-full rounded-lg border-gray-300 text-sm" />
                                    {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Total Kuota Tersedia</label>
                                    <input type="number" value={data.quota_total} onChange={e => setData('quota_total', e.target.value)} className="w-full rounded-lg border-gray-300 text-sm" placeholder="Kosong = ∞" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Maks. Pakai per User</label>
                                    <input type="number" value={data.usage_per_user} onChange={e => setData('usage_per_user', e.target.value)} className="w-full rounded-lg border-gray-300 text-sm" placeholder="Opsional (Msl: 1)" />
                                </div>
                            </div>

                            <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 space-y-2 mt-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-orange-900 cursor-pointer w-fit">
                                    <input type="checkbox" checked={data.auto_apply} onChange={e => setData('auto_apply', e.target.checked)} className="rounded text-orange-600 focus:ring-orange-500" />
                                    Terapkan Otomatis (Auto-Apply)
                                    <span className="text-[10px] font-normal text-orange-700 ml-1">(Tanpa perlu input kode)</span>
                                </label>
                                <label className="flex items-center gap-2 text-sm font-bold text-orange-900 cursor-pointer w-fit">
                                    <input type="checkbox" checked={data.is_stackable} onChange={e => setData('is_stackable', e.target.checked)} className="rounded text-orange-600 focus:ring-orange-500" />
                                    Bisa Digabung (Stackable)
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-white border-t flex justify-end gap-3 shrink-0">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-slate-600 font-bold bg-gray-100 hover:bg-gray-200">Batal</button>
                    <button type="submit" disabled={processing} className="px-6 py-2.5 rounded-xl text-white font-black bg-blue-600 hover:bg-blue-700 shadow-lg flex items-center gap-2">
                        Simpan Promo
                    </button>
                </div>
            </form>
        </Modal>
    );
}