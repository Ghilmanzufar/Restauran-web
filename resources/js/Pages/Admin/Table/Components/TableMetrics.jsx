import React from "react";

export default function TableMetrics({ metrics }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Meja</p>
                <p className="text-2xl font-black text-slate-800">{metrics.total}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Kosong</p>
                <p className="text-2xl font-black text-slate-400">{metrics.empty}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Terisi</p>
                <p className="text-2xl font-black text-blue-600">{metrics.occupied}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Belum Bayar</p>
                <p className="text-2xl font-black text-red-600">{metrics.unpaid}</p>
            </div>
        </div>
    );
}