import React from 'react';
import { router } from '@inertiajs/react';
import { BiPurchaseTag, BiPowerOff, BiEditAlt, BiTrash, BiTargetLock } from 'react-icons/bi';

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function PromoCard({ promo, onEdit, onDelete }) {
    
    // Logika Indikator Status
    const getPromoStatus = () => {
        if (!promo.is_active) return { label: 'Inactive', color: 'bg-gray-100 text-gray-500 border-gray-200' };
        const now = new Date();
        if (promo.start_date && new Date(promo.start_date) > now) return { label: 'Scheduled', color: 'bg-blue-100 text-blue-700 border-blue-200' };
        if (promo.end_date && new Date(promo.end_date) < now) return { label: 'Expired', color: 'bg-red-100 text-red-700 border-red-200' };
        return { label: 'Active', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    };

    const status = getPromoStatus();

    // Toggle Aktif/Mati
    const handleToggle = () => {
        router.post(route('admin.promos.toggle', promo.id), {}, { preserveScroll: true });
    };

    return (
        <div className={`bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm flex flex-col transition-all ${!promo.is_active && 'opacity-70'}`}>
            <div className="h-40 bg-gray-900 relative overflow-hidden shrink-0">
                {promo.image_url && <img src={`/storage/${promo.image_url}`} alt={promo.name} className="w-full h-full object-cover opacity-80" />}
                
                <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${status.color}`}>
                    {status.label}
                </div>

                <div className="absolute bottom-3 right-3 flex flex-col items-end gap-1">
                    <div className="bg-white text-slate-900 px-3 py-1 rounded-lg text-sm font-black shadow-lg flex items-center gap-1">
                        <BiPurchaseTag /> {promo.code}
                    </div>
                    {promo.auto_apply && <span className="text-[10px] font-bold text-white bg-green-500 px-2 py-0.5 rounded shadow-sm">Auto-Apply</span>}
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-black text-slate-900 text-lg mb-0.5">{promo.name}</h3>
                <p className="text-sm font-bold text-blue-600 mb-3">
                    Diskon {promo.type === 'percentage' ? `${parseFloat(promo.discount_amount)}%` : formatRupiah(promo.discount_amount)}
                </p>
                
                <div className="mb-3 flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 w-fit px-2 py-1 rounded border border-slate-100">
                    <BiTargetLock /> 
                    {promo.target_type === 'all' ? 'Semua Menu' : promo.target_type === 'category' ? 'Kategori Spesifik' : 'Menu Spesifik'}
                    {' • '} 
                    {promo.order_type === 'all' ? 'Semua Order' : promo.order_type.replace('_', ' ').toUpperCase()}
                </div>
                
                <div className="mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100 mt-auto">
                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                        <span>Terpakai: {promo.used_count || 0}</span>
                        <span>Kuota: {promo.quota_total || '∞'}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${promo.quota_total ? Math.min(((promo.used_count || 0) / promo.quota_total) * 100, 100) : 100}%` }}></div>
                    </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <button onClick={handleToggle} className={`flex-1 py-2 rounded-xl font-bold text-xs flex justify-center items-center transition-all ${promo.is_active ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                        <BiPowerOff className="text-base mr-1" /> {promo.is_active ? "Matikan" : "Aktifkan"}
                    </button>
                    <button onClick={() => onEdit(promo)} className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex justify-center items-center hover:bg-slate-200"><BiEditAlt /></button>
                    <button onClick={() => onDelete(promo)} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex justify-center items-center hover:bg-red-100"><BiTrash /></button>
                </div>
            </div>
        </div>
    );
}