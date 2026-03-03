import React, { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import Modal from "@/Components/Modal";
import { 
    BiGift, BiPlus, BiEditAlt, BiTrash, BiPowerOff, 
    BiImageAdd, BiCalendarAlt, BiPurchaseTag
} from "react-icons/bi";
import { Toaster, toast } from "sonner";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

// Helper mengubah date string Laravel ke format input YYYY-MM-DDTHH:mm
const formatDateTimeForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
};

const formatDisplayDate = (dateString) => {
    if (!dateString) return 'Tanpa Batas';
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function PromoIndex({ promos }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '', code: '', description: '', type: 'percentage', discount_amount: '',
        max_discount: '', min_spend: '', start_date: '', end_date: '', 
        quota_total: '', usage_per_user: '', is_active: true, is_stackable: false, 
        image: null, _method: 'post'
    });

    const openModal = (promo = null) => {
        clearErrors();
        if (promo) {
            setEditingPromo(promo);
            setData({
                name: promo.name, code: promo.code, description: promo.description || '', 
                type: promo.type, discount_amount: promo.discount_amount,
                max_discount: promo.max_discount || '', min_spend: promo.min_spend || '',
                start_date: formatDateTimeForInput(promo.start_date), end_date: formatDateTimeForInput(promo.end_date),
                quota_total: promo.quota_total || '', usage_per_user: promo.usage_per_user || '',
                is_active: promo.is_active, is_stackable: promo.is_stackable,
                image: null, _method: 'put'
            });
            setImagePreview(promo.image_url ? `/storage/${promo.image_url}` : null);
        } else {
            setEditingPromo(null);
            reset();
            setImagePreview(null);
            setData('_method', 'post');
        }
        setIsModalOpen(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setData('image', file);
        if (file) setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const routeName = editingPromo ? route('admin.promos.update', editingPromo.id) : route('admin.promos.store');
        post(routeName, {
            onSuccess: () => { toast.success('Promo berhasil disimpan!'); setIsModalOpen(false); },
            preserveScroll: true
        });
    };

    const handleToggleStatus = (promo) => {
        router.post(route('admin.promos.toggle', promo.id), {}, { preserveScroll: true, onSuccess: () => toast.success('Status diubah') });
    };

    const handleDelete = (promo) => {
        if (confirm(`Yakin ingin menghapus promo ${promo.name}?`)) {
            router.delete(route('admin.promos.destroy', promo.id), { onSuccess: () => toast.success("Promo dihapus!") });
        }
    };

    return (
        <AdminLayout title="Manajemen Promo">
            <Head title="Manajemen Promo" />
            <Toaster position="top-center" richColors />

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-xl font-black text-slate-900">Promo & Voucher</h2>
                    <p className="text-sm font-semibold text-gray-500">Kelola kode diskon dan banner promosi.</p>
                </div>
                <button onClick={() => openModal()} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all">
                    <BiPlus className="text-xl" /> Tambah Promo
                </button>
            </div>

            {/* GRID PROMO */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promos.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-400 font-semibold flex flex-col items-center">
                        <BiGift className="text-5xl mb-3 opacity-30" />
                        Belum ada promo yang dibuat.
                    </div>
                ) : (
                    promos.map(promo => (
                        <div key={promo.id} className={`bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm flex flex-col transition-all ${!promo.is_active && 'opacity-60 grayscale-[30%]'}`}>
                            
                            <div className="h-40 bg-gray-100 relative overflow-hidden shrink-0">
                                {promo.image_url ? (
                                    <img src={`/storage/${promo.image_url}`} alt={promo.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold uppercase text-xs">No Banner</div>
                                )}
                                <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-black shadow-lg flex items-center gap-1">
                                    <BiPurchaseTag /> {promo.code}
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="font-black text-slate-900 text-lg mb-1">{promo.name}</h3>
                                <p className="text-sm font-bold text-blue-600 mb-3">
                                    Diskon {promo.type === 'percentage' ? `${parseFloat(promo.discount_amount)}%` : formatRupiah(promo.discount_amount)}
                                    {promo.type === 'percentage' && promo.max_discount > 0 && ` (Max ${formatRupiah(promo.max_discount)})`}
                                </p>
                                
                                <div className="space-y-1.5 text-xs font-semibold text-gray-500 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100 mt-auto">
                                    <div className="flex justify-between"><span>Min. Belanja:</span> <span className="text-slate-700 font-bold">{promo.min_spend > 0 ? formatRupiah(promo.min_spend) : 'Rp 0'}</span></div>
                                    <div className="flex justify-between"><span>Kuota:</span> <span className="text-slate-700 font-bold">{promo.quota_total ? `${promo.quota_total}x Pakai` : 'Tanpa Batas'}</span></div>
                                    <div className="flex justify-between border-t border-gray-200 mt-1.5 pt-1.5">
                                        <span className="flex items-center gap-1"><BiCalendarAlt /> Berakhir:</span> 
                                        <span className="text-slate-700 font-bold">{formatDisplayDate(promo.end_date)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                    <button onClick={() => handleToggleStatus(promo)} className={`flex-1 py-2 rounded-xl font-bold text-xs flex justify-center items-center gap-1.5 transition-all ${promo.is_active ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                                        <BiPowerOff className="text-base" /> {promo.is_active ? "Aktif" : "Nonaktif"}
                                    </button>
                                    <button onClick={() => openModal(promo)} className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex justify-center items-center hover:bg-slate-200"><BiEditAlt /></button>
                                    <button onClick={() => handleDelete(promo)} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex justify-center items-center hover:bg-red-100"><BiTrash /></button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* MODAL FORM */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="3xl">
                <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
                    <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
                        <h2 className="text-xl font-black">{editingPromo ? 'Edit Promo' : 'Tambah Promo Baru'}</h2>
                    </div>

                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* KOLOM KIRI: INFO DASAR */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs border-b pb-2">Informasi Dasar</h3>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Banner (Opsional)</label>
                                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-white overflow-hidden group">
                                        {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover group-hover:opacity-50" /> : <div className="text-gray-400 group-hover:text-blue-500 flex flex-col items-center"><BiImageAdd className="text-2xl" />Upload</div>}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Promo *</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full rounded-lg border-gray-300 focus:border-blue-500 text-sm" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Kode Voucher * (Tanpa Spasi)</label>
                                    <input type="text" value={data.code} onChange={e => setData('code', e.target.value.toUpperCase().replace(/\s/g, ''))} className="w-full rounded-lg border-gray-300 focus:border-blue-500 text-sm uppercase font-black" required placeholder="MSL: DISKON20" />
                                    {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
                                    <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows="2" className="w-full rounded-lg border-gray-300 focus:border-blue-500 text-sm"></textarea>
                                </div>
                            </div>

                            {/* KOLOM KANAN: ATURAN DISKON */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs border-b pb-2">Aturan & Syarat</h3>
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
                                        <input type="number" value={data.discount_amount} onChange={e => setData('discount_amount', e.target.value)} className="w-full rounded-lg border-gray-300 focus:border-blue-500 text-sm" required />
                                    </div>
                                </div>
                                
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Maks. Potongan (Rp)</label>
                                        <input type="number" value={data.max_discount} onChange={e => setData('max_discount', e.target.value)} className="w-full rounded-lg border-gray-300 focus:border-blue-500 text-sm" placeholder="Opsional" disabled={data.type === 'fixed'} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Min. Belanja (Rp)</label>
                                        <input type="number" value={data.min_spend} onChange={e => setData('min_spend', e.target.value)} className="w-full rounded-lg border-gray-300 focus:border-blue-500 text-sm" placeholder="Opsional" />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Mulai Berlaku</label>
                                        <input type="datetime-local" value={data.start_date} onChange={e => setData('start_date', e.target.value)} className="w-full rounded-lg border-gray-300 focus:border-blue-500 text-sm" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Berakhir Pada</label>
                                        <input type="datetime-local" value={data.end_date} onChange={e => setData('end_date', e.target.value)} className="w-full rounded-lg border-gray-300 focus:border-blue-500 text-sm" />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Total Kuota</label>
                                        <input type="number" value={data.quota_total} onChange={e => setData('quota_total', e.target.value)} className="w-full rounded-lg border-gray-300 focus:border-blue-500 text-sm" placeholder="Kosong = Unlimited" />
                                    </div>
                                    <div className="flex-1 flex items-center pt-5">
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                                            <input type="checkbox" checked={data.is_stackable} onChange={e => setData('is_stackable', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                                            Bisa Digabung (Stack)
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-white border-t flex justify-end gap-3 shrink-0">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-xl text-slate-600 font-bold bg-gray-100 hover:bg-gray-200">Batal</button>
                        <button type="submit" disabled={processing} className="px-5 py-2 rounded-xl text-white font-black bg-blue-600 hover:bg-blue-700 shadow-lg">Simpan</button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}