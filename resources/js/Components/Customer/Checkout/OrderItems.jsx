import React from "react";
import { BiNote } from "react-icons/bi";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function OrderItems({ cart }) {
    return (
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4">Ringkasan Menu</h2>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-start text-sm pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                        <div className="flex gap-3 overflow-hidden">
                            <span className="font-bold text-slate-500 shrink-0">{item.qty}x</span>
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-800 line-clamp-2 leading-tight">{item.name}</span>
                                {item.variants && item.variants.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {item.variants.map((v, idx) => (
                                            <span key={idx} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{v.item_name}</span>
                                        ))}
                                    </div>
                                )}
                                {item.note && (
                                    <span className="text-[10px] text-orange-600 italic mt-1 flex items-start gap-1">
                                       <BiNote className="shrink-0 translate-y-[2px]" /> "{item.note}"
                                    </span>
                                )}
                            </div>
                        </div>
                        <span className="font-semibold text-slate-700 shrink-0 pl-2">
                            {formatRupiah(item.total_price_per_item * item.qty)}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}