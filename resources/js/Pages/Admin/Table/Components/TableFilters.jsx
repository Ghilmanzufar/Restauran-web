import React from "react";
import { BiSearch } from "react-icons/bi";

export default function TableFilters({ search, setSearch, filter, setFilter }) {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto hide-scrollbar">
                {['all', 'empty', 'occupied', 'unpaid', 'need_payment'].map(f => (
                    <button 
                        key={f} onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                            filter === f ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-200'
                        }`}
                    >
                        {f === 'all' ? 'Semua' : f === 'empty' ? 'Kosong' : f === 'occupied' ? 'Terisi' : f === 'unpaid' ? 'Belum Bayar' : 'Minta Bill!'}
                    </button>
                ))}
            </div>
            
            <div className="relative w-full md:w-64 shrink-0">
                <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input 
                    type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari meja (Msl: VIP-1)..." 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:border-blue-500 focus:ring-0"
                />
            </div>
        </div>
    );
}