import React from "react";
import { BiWallet, BiReceipt } from "react-icons/bi";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function OrderSummary({ summary }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl shrink-0"><BiWallet /></div>
                <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Pendapatan (Lunas)</p>
                    <h3 className="text-3xl font-black text-slate-900">{formatRupiah(summary.revenue)}</h3>
                </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl shrink-0"><BiReceipt /></div>
                <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Transaksi Valid</p>
                    <h3 className="text-3xl font-black text-slate-900">{summary.total_orders} <span className="text-lg font-medium text-gray-400">order</span></h3>
                </div>
            </div>
        </div>
    );
}