import React from "react";
import { Link } from "@inertiajs/react";
import { BiSolidDiscount, BiTrash } from "react-icons/bi";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function CartPromo({ activePromo, subtotal, discountAmount, onRemove, tableNumber }) {
    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm flex items-center gap-2 text-slate-800">
                    <BiSolidDiscount className="text-orange-500 text-lg"/> Voucher & Promo
                </h3>
                <Link href={route('customer.promos', tableNumber)} className="text-xs text-orange-600 font-bold hover:underline">
                    Lihat Semua
                </Link>
            </div>
            
            {activePromo ? (
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex justify-between items-center">
                    <div>
                        <span className="text-xs font-bold text-green-700 block">{activePromo.name}</span>
                        {subtotal < activePromo.min_spend ? (
                            <span className="text-[10px] text-red-500 font-medium">Min. belanja {formatRupiah(activePromo.min_spend)}</span>
                        ) : (
                            <span className="text-[10px] text-green-600 font-medium">Hemat {formatRupiah(discountAmount)}</span>
                        )}
                    </div>
                    <button onClick={onRemove} className="text-gray-400 hover:text-red-500 p-2 active:scale-90 transition-transform">
                        <BiTrash />
                    </button>
                </div>
            ) : (
                <Link href={route('customer.promos', tableNumber)} className="block border border-dashed border-gray-300 rounded-xl p-3 text-center text-xs text-gray-400 hover:bg-gray-50 transition-colors cursor-pointer">
                    Punya kode promo? Pasang di sini
                </Link>
            )}
        </div>
    );
}