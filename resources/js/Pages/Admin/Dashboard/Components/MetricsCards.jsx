import React from "react";
import { BiWallet, BiReceipt, BiAlarmExclamation, BiDish, BiGroup, BiCheckCircle } from "react-icons/bi";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function MetricsCards({ metrics, tables, isKasir }) {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 ${isKasir ? 'xl:grid-cols-3' : 'xl:grid-cols-5'} gap-6 mb-8`}>
            
            {!isKasir && (
                <>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl shrink-0"><BiWallet /></div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Pendapatan</p>
                            <h3 className="text-3xl font-black text-slate-900">{formatRupiah(metrics.revenue)}</h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl shrink-0"><BiReceipt /></div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Order</p>
                            <h3 className="text-3xl font-black text-slate-900">{metrics.total_orders} <span className="text-lg font-medium text-gray-400">Order</span></h3>
                        </div>
                    </div>
                </>
            )}

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                    {metrics.unpaid_count > 0 ? <BiAlarmExclamation className={metrics.unpaid_count > 3 ? "animate-bounce" : ""} /> : <BiCheckCircle />}
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Belum Dibayar</p>
                    <h3 className="text-3xl font-black text-slate-900">{metrics.unpaid_count} <span className="text-lg font-medium text-gray-400">Meja</span></h3>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-3xl shrink-0"><BiDish /></div>
                <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Sedang Dimasak</p>
                    <h3 className="text-3xl font-black text-slate-900">{metrics.processing_count} <span className="text-lg font-medium text-gray-400">Order</span></h3>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-3xl shrink-0"><BiGroup /></div>
                <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Meja Aktif</p>
                    <h3 className="text-3xl font-black text-slate-900">{metrics.active_tables} <span className="text-lg font-medium text-gray-400">/ {tables.length}</span></h3>
                </div>
            </div>

        </div>
    );
}