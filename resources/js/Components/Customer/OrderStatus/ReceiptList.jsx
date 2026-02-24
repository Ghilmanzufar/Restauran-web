import React from "react";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function ReceiptList({ items }) {
    return (
        <div className="space-y-3 mb-4">
            {items.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-sm">
                    <div className="flex gap-2 overflow-hidden">
                        <span className="font-bold text-slate-700 shrink-0">{item.qty}x</span>
                        <div className="flex flex-col">
                            <p className="text-slate-600 font-bold leading-tight">{item.product.name}</p>
                            {item.variants?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-0.5">
                                    {item.variants.map((v, i) => (
                                        <span key={i} className="text-[10px] text-slate-400 bg-gray-50 px-1 rounded">{v.item_name}</span>
                                    ))}
                                </div>
                            )}
                            {item.note && <p className="text-[10px] text-orange-500 italic">"{item.note}"</p>}
                        </div>
                    </div>
                    <span className="font-medium text-slate-900 shrink-0">{formatRupiah(item.total_price)}</span>
                </div>
            ))}
        </div>
    );
}