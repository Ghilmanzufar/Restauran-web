import React from "react";
import { BiSolidDiscount } from "react-icons/bi";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function BillDetails({ summary, discountAmount, activePromo, tax, service, grandTotal }) {
    return (
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Rincian Biaya</h2>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-500">
                    <span>Subtotal ({summary.totalQty} item)</span>
                    <span>{formatRupiah(summary.totalPrice)}</span>
                </div>
                
                {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 font-bold bg-green-50 p-2 rounded-lg">
                        <span className="flex items-center gap-1"><BiSolidDiscount /> Promo: {activePromo.name}</span>
                        <span>- {formatRupiah(discountAmount)}</span>
                    </div>
                )}

                <div className="flex justify-between text-gray-500"><span>PB1 (10%)</span><span>{formatRupiah(tax)}</span></div>
                <div className="flex justify-between text-gray-500"><span>Service (5%)</span><span>{formatRupiah(service)}</span></div>
                
                <div className="h-[1px] bg-dashed bg-gray-200 my-2"></div>
                
                <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-lg">Total Akhir</span>
                    <span className="font-black text-slate-900 text-xl">{formatRupiah(grandTotal)}</span>
                </div>
            </div>
        </section>
    );
}