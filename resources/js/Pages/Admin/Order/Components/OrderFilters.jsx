import React from "react";
import { BiSearch, BiFilterAlt, BiCalendarAlt } from "react-icons/bi";

export default function OrderFilters({ search, setSearch, status, setStatus, startDate, setStartDate, endDate, setEndDate, handleSearch }) {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center">
            
            {/* Search Bar */}
            <div className="relative w-full lg:w-96">
                <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input 
                    type="text" placeholder="Cari ID Order atau Nama... (Enter)" 
                    value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={handleSearch}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-11 pr-4 text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                {/* Filter Tanggal */}
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
                    <BiCalendarAlt className="text-gray-400 text-lg shrink-0" />
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border-none bg-transparent text-sm font-bold text-slate-600 focus:ring-0 p-1" />
                    <span className="text-gray-300 font-bold">-</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border-none bg-transparent text-sm font-bold text-slate-600 focus:ring-0 p-1" />
                </div>

                {/* Filter Status */}
                <div className="relative shrink-0">
                    <select 
                        value={status} onChange={(e) => setStatus(e.target.value)}
                        className="appearance-none bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-8 text-sm font-semibold text-slate-600 focus:ring-2 focus:ring-blue-500/20 cursor-pointer w-full sm:w-auto"
                    >
                        <option value="all">Semua Status</option>
                        <option value="paid">Lunas</option>
                        <option value="unpaid">Belum Dibayar</option>
                        <option value="cancelled">Dibatalkan</option>
                    </select>
                    <BiFilterAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>
        </div>
    );
}