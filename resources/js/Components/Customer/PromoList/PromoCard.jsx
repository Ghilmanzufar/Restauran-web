import React from "react";
import { BiInfoCircle, BiTimeFive } from "react-icons/bi";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function PromoCard({ promo, onApply }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative group">
            {/* Hiasan "Bolong" ala Tiket */}
            <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 bg-[#F8F9FA] rounded-full border-r border-gray-200"></div>
            <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 bg-[#F8F9FA] rounded-full border-l border-gray-200"></div>

            <div className="flex">
                {/* KIRI: Icon & Tipe Diskon */}
                <div className="bg-orange-50 w-24 flex flex-col items-center justify-center p-3 border-r border-dashed border-gray-200">
                    <span className="text-2xl font-black text-orange-600">
                        {promo.type === 'percentage' ? '%' : 'Rp'}
                    </span>
                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mt-1">
                        {promo.type === 'percentage' ? 'DISKON' : 'POTONGAN'}
                    </span>
                </div>

                {/* KANAN: Detail & Tombol */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">{promo.name}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{promo.description}</p>
                        
                        {/* Syarat Minimal */}
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400 bg-gray-50 w-fit px-2 py-1 rounded">
                            <BiInfoCircle /> Min. Belanja {formatRupiah(promo.min_spend)}
                        </div>
                    </div>

                    <div className="flex justify-between items-end mt-4">
                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                            <BiTimeFive /> Sampai {promo.end_date ? new Date(promo.end_date).toLocaleDateString('id-ID') : 'Seterusnya'}
                        </div>
                        
                        <button 
                            onClick={() => onApply(promo)}
                            className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-md active:scale-95 transition-transform hover:bg-slate-800"
                        >
                            Pakai
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}