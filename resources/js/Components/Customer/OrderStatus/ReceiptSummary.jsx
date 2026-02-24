import React from "react";
import { BiSolidDiscount } from "react-icons/bi";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function ReceiptSummary({ order }) {
    // Logic Kalkulasi Diskon yang Cerdas
    const subtotal = order.items.reduce((acc, item) => acc + parseFloat(item.total_price), 0);
    
    let discountAmount = 0;
    let promoName = "";

    if (order.promo_usage) {
        discountAmount = parseFloat(order.promo_usage.discount_value);
        promoName = order.promo_usage.promo?.name || "Promo Spesial";
        
        // Fallback jika data 0
        if (discountAmount === 0) {
             const grossTax = subtotal * 0.10; 
             const grossService = subtotal * 0.05;
             const estimatedTotal = subtotal + grossTax + grossService;
             const diff = estimatedTotal - parseFloat(order.total_price);
             if (diff > 100) discountAmount = diff; 
        }
    }
    
    // Reverse calc untuk pajak/service dari total bersih
    const netBase = parseFloat(order.total_price) / 1.15;
    const tax = netBase * 0.10;
    const service = netBase * 0.05;

    return (
        <>
            <div className="border-t border-dashed border-gray-200 my-3"></div>
            <div className="space-y-1 mb-3">
                <div className="flex justify-between text-xs text-gray-500"><span>Subtotal</span><span>{formatRupiah(subtotal)}</span></div>
                
                {discountAmount > 0 && (
                    <div className="flex justify-between text-xs text-green-600 font-bold">
                        <span className="flex items-center gap-1"><BiSolidDiscount/> {promoName}</span>
                        <span>- {formatRupiah(discountAmount)}</span>
                    </div>
                )}

                <div className="flex justify-between text-xs text-gray-500"><span>PB1 (10%)</span><span>{formatRupiah(tax)}</span></div>
                <div className="flex justify-between text-xs text-gray-500"><span>Service (5%)</span><span>{formatRupiah(service)}</span></div>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between items-end">
                <span className="text-xs text-slate-500 font-bold">Total Pembayaran</span>
                <span className="text-lg font-black text-slate-900">{formatRupiah(order.total_price)}</span>
            </div>
        </>
    );
}