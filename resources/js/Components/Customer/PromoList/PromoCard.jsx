import React from "react";
import { BiInfoCircle, BiTimeFive, BiLockAlt } from "react-icons/bi";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function PromoCard({ promo, cartTotal, onApply }) {
    // Cek apakah syarat terpenuhi
    const isEligible = cartTotal >= promo.min_spend;
    
    // Hitung kekurangan (untuk progress bar visual)
    const shortage = promo.min_spend - cartTotal;
    const progress = Math.min(100, (cartTotal / promo.min_spend) * 100);

    return (
        <div className={`bg-white rounded-xl shadow-sm border overflow-hidden relative group transition-all ${isEligible ? 'border-gray-200' : 'border-gray-200 opacity-90'}`}>
            {/* Hiasan "Bolong" ala Tiket */}
            <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 bg-[#F8F9FA] rounded-full border-r border-gray-200 z-10"></div>
            <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 bg-[#F8F9FA] rounded-full border-l border-gray-200 z-10"></div>

            <div className="flex">
                {/* KIRI: Icon & Tipe Diskon */}
                <div className={`w-24 flex flex-col items-center justify-center p-3 border-r border-dashed border-gray-200 ${isEligible ? 'bg-orange-50' : 'bg-gray-100 grayscale'}`}>
                    <span className={`text-2xl font-black ${isEligible ? 'text-orange-600' : 'text-gray-400'}`}>
                        {promo.type === 'percentage' ? '%' : 'Rp'}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${isEligible ? 'text-orange-400' : 'text-gray-400'}`}>
                        {promo.type === 'percentage' ? 'DISKON' : 'POTONGAN'}
                    </span>
                </div>

                {/* KANAN: Detail & Tombol */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">{promo.name}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{promo.description}</p>
                        
                        {/* Status Syarat Minimal */}
                        <div className={`flex items-center gap-1 mt-2 text-[10px] w-fit px-2 py-1 rounded transition-colors ${isEligible ? 'bg-green-50 text-green-700 font-bold' : 'bg-red-50 text-red-600 font-medium'}`}>
                            {isEligible ? (
                                <>Syarat Terpenuhi</>
                            ) : (
                                <>Kurang {formatRupiah(shortage)} lagi</>
                            )}
                        </div>

                        {/* Progress Bar Visual jika belum cukup */}
                        {!isEligible && (
                            <div className="w-full h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-orange-400 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-end mt-4">
                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                            <BiTimeFive /> {promo.end_date ? new Date(promo.end_date).toLocaleDateString('id-ID') : 'Seterusnya'}
                        </div>
                        
                        <button 
                            onClick={() => isEligible && onApply(promo)}
                            disabled={!isEligible}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-1 
                                ${isEligible 
                                    ? 'bg-slate-900 text-white active:scale-95 hover:bg-slate-800 cursor-pointer' 
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                }`}
                        >
                            {!isEligible && <BiLockAlt />}
                            {isEligible ? 'Pakai' : 'Belum Cukup'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}