import React from "react";
import { BiInfoCircle, BiTimeFive, BiLockAlt } from "react-icons/bi";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function PromoCard({ promo, cartTotal, onApply }) {
    const isEligible = cartTotal >= promo.min_spend;
    const shortage = promo.min_spend - cartTotal;
    const progress = Math.min(100, (cartTotal / promo.min_spend) * 100);

    const getImageUrl = (url) => {
        if (!url) return null; 
        if (url.startsWith('http')) return url; 
        return `/storage/${url}`; 
    };

    return (
        <div className={`bg-white rounded-xl shadow-sm border overflow-hidden relative group flex flex-col transition-all ${isEligible ? 'border-gray-200' : 'border-gray-200 opacity-90'}`}>
            
            {/* BAGIAN ATAS: Gambar & Tipe Diskon (Banner) */}
            <div className={`w-full h-32 flex flex-col items-center justify-center p-3 border-b border-dashed border-gray-200 relative overflow-hidden shrink-0 ${isEligible ? 'bg-orange-50' : 'bg-gray-100 grayscale'}`}>
                
                {/* Hiasan "Bolong" ala Tiket dipindah ke perbatasan bawah gambar */}
                <div className="absolute -left-2 -bottom-2 w-4 h-4 bg-[#F8F9FA] rounded-full border-t border-r border-gray-200 z-10"></div>
                <div className="absolute -right-2 -bottom-2 w-4 h-4 bg-[#F8F9FA] rounded-full border-t border-l border-gray-200 z-10"></div>

                {promo.image_url && (
                    <>
                        <img src={getImageUrl(promo.image_url)} alt={promo.name} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40"></div>
                    </>
                )}

                <span className={`text-4xl font-black relative z-10 drop-shadow-md ${promo.image_url ? 'text-white' : (isEligible ? 'text-orange-600' : 'text-gray-400')}`}>
                    {promo.type === 'percentage' ? '%' : 'Rp'}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 relative z-10 drop-shadow-md ${promo.image_url ? 'text-white' : (isEligible ? 'text-orange-400' : 'text-gray-400')}`}>
                    {promo.type === 'percentage' ? 'DISKON' : 'POTONGAN'}
                </span>
            </div>

            {/* BAGIAN BAWAH: Detail & Tombol */}
            <div className="p-4 flex flex-col justify-between">
                <div>
                    <h3 className="font-black text-slate-800 text-base leading-snug">{promo.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{promo.description}</p>
                    
                    <div className={`flex items-center gap-1 mt-3 text-[10px] w-fit px-2 py-1 rounded transition-colors ${isEligible ? 'bg-green-50 text-green-700 font-bold' : 'bg-red-50 text-red-600 font-medium'}`}>
                        {isEligible ? (
                            <>Syarat Terpenuhi</>
                        ) : (
                            <>Kurang {formatRupiah(shortage)} lagi</>
                        )}
                    </div>

                    {!isEligible && (
                        <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-orange-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-50">
                    <div className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                        <BiTimeFive className="text-sm" /> 
                        {promo.end_date ? new Date(promo.end_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) : 'Tanpa Batas'}
                    </div>
                    
                    <button 
                        onClick={() => isEligible && onApply(promo)}
                        disabled={!isEligible}
                        className={`px-5 py-2 rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 
                            ${isEligible 
                                ? 'bg-slate-900 text-white active:scale-95 hover:bg-slate-800 cursor-pointer shadow-slate-900/20' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                            }`}
                    >
                        {!isEligible && <BiLockAlt className="text-sm" />}
                        {isEligible ? 'Pakai Promo' : 'Belum Cukup'}
                    </button>
                </div>
            </div>
        </div>
    );
}