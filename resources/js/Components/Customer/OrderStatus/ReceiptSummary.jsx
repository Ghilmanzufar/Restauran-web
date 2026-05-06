import React from "react";
import { BiSolidDiscount } from "react-icons/bi";
import { usePage } from "@inertiajs/react"; // <-- TAMBAHKAN IMPORT INI

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function ReceiptSummary({ order }) {
    // <-- PANGGIL DATA SETTING DI SINI
    const { app_settings } = usePage().props;

    // Tarik persentase dari database (atau gunakan default 10 dan 5)
    const taxRatePercent = app_settings?.tax_percentage ?? 10;
    const serviceRatePercent = app_settings?.service_percentage ?? 5;
    
    // Ubah ke desimal untuk perhitungan (misal: 10% menjadi 0.10)
    const taxRate = taxRatePercent / 100;
    const serviceRate = serviceRatePercent / 100;
    const combinedRate = 1 + taxRate + serviceRate;

    // Logic Kalkulasi Diskon yang Cerdas
    const subtotal = order.items.reduce((acc, item) => acc + parseFloat(item.total_price), 0);
    
    let discountAmount = 0;
    let promoName = "";

    if (order.promo_usage) {
        discountAmount = parseFloat(order.promo_usage.discount_value);
        promoName = order.promo_usage.promo?.name || "Promo Spesial";
        
        // Fallback jika data 0
        if (discountAmount === 0) {
             const grossTax = subtotal * taxRate; // <-- Pakai rate dinamis
             const grossService = subtotal * serviceRate; // <-- Pakai rate dinamis
             const estimatedTotal = subtotal + grossTax + grossService;
             const diff = estimatedTotal - parseFloat(order.total_price);
             if (diff > 100) discountAmount = diff; 
        }
    }
    
    // Reverse calc untuk pajak/service dari total bersih
    // Kita bagi dengan combinedRate (contoh: 1.15) agar mendapatkan Net Base
    const netBase = parseFloat(order.total_price) / combinedRate;
    const tax = netBase * taxRate;
    const service = netBase * serviceRate;

    return (
        <>
            <div className="border-t border-dashed border-gray-200 my-3"></div>
            <div className="space-y-1 mb-3">
                <div className="flex justify-between text-xs text-gray-500">
                    <span>Subtotal</span>
                    <span>{formatRupiah(subtotal)}</span>
                </div>
                
                {discountAmount > 0 && (
                    <div className="flex justify-between text-xs text-green-600 font-bold">
                        <span className="flex items-center gap-1"><BiSolidDiscount/> {promoName}</span>
                        <span>- {formatRupiah(discountAmount)}</span>
                    </div>
                )}

                {/* 👇 PERBAIKAN: TEKS LABEL JUGA DINAMIS MEMBACA DATABASE 👇 */}
                <div className="flex justify-between text-xs text-gray-500">
                    <span>PB1 ({taxRatePercent}%)</span>
                    <span>{formatRupiah(tax)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                    <span>Service ({serviceRatePercent}%)</span>
                    <span>{formatRupiah(service)}</span>
                </div>
                {/* 👆 ==================================================== 👆 */}
                
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between items-end">
                <span className="text-xs text-slate-500 font-bold">Total Pembayaran</span>
                <span className="text-lg font-black text-slate-900">{formatRupiah(order.total_price)}</span>
            </div>
        </>
    );
}