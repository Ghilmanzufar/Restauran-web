import React, { useState, useEffect, useCallback } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { 
    BiShieldQuarter, BiSearch, BiFilterAlt, BiCalendarAlt, 
    BiErrorCircle, BiEdit, BiTrash, BiCheckCircle
} from "react-icons/bi";

// Helper untuk ikon berdasarkan jenis aksi
const getActionIcon = (action) => {
    if (action.includes('DELETE') || action.includes('CANCEL')) return <BiErrorCircle className="text-red-500" />;
    if (action.includes('UPDATE') || action.includes('EDIT')) return <BiEdit className="text-orange-500" />;
    if (action.includes('CREATE') || action.includes('PAID')) return <BiCheckCircle className="text-emerald-500" />;
    return <BiShieldQuarter className="text-blue-500" />;
};

export default function AuditIndex({ logs, actionTypes, filters }) {
    const [search, setSearch] = useState(filters.search || "");
    const [actionType, setActionType] = useState(filters.action_type || "all");
    const [startDate, setStartDate] = useState(filters.start_date || "");
    const [endDate, setEndDate] = useState(filters.end_date || "");

    const applyFilters = useCallback(() => {
        router.get(route('admin.audit.index'), {
            search, action_type: actionType, start_date: startDate, end_date: endDate
        }, { preserveState: true, preserveScroll: true, replace: true });
    }, [search, actionType, startDate, endDate]);

    useEffect(() => { applyFilters(); }, [actionType, startDate, endDate]);

    const handleSearch = (e) => {
        if (e.key === 'Enter') applyFilters();
    };

    return (
        <AdminLayout title="Audit & Log Sistem">
            <Head title="Audit Log" />

            <div className="mb-8">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><BiShieldQuarter className="text-blue-600 text-2xl" /> Keamanan & Rekam Jejak</h2>
                <p className="text-sm font-semibold text-gray-500 mt-1">Pantau perubahan harga, pembatalan pesanan, dan aktivitas staf.</p>
            </div>

            {/* KONTROL FILTER */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center">
                
                <div className="relative w-full lg:w-96">
                    <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                    <input 
                        type="text" placeholder="Cari aktivitas atau nama staf... (Enter)" 
                        value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={handleSearch}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-11 pr-4 text-sm font-semibold focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    {/* Filter Kategori */}
                    <div className="relative shrink-0">
                        <select 
                            value={actionType} onChange={(e) => setActionType(e.target.value)}
                            className="appearance-none bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-8 text-sm font-semibold text-slate-600 w-full"
                        >
                            <option value="all">Semua Aktivitas</option>
                            <option value="ORDER">Pesanan (Order)</option>
                            <option value="MENU">Menu & Harga</option>
                            <option value="USER">Manajemen Staf</option>
                            {actionTypes.map((type, i) => <option key={i} value={type}>{type}</option>)}
                        </select>
                        <BiFilterAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Filter Tanggal */}
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 shrink-0">
                        <BiCalendarAlt className="text-gray-400 text-lg" />
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border-none bg-transparent text-sm font-bold text-slate-600 p-1 focus:ring-0" />
                        <span className="text-gray-300">-</span>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border-none bg-transparent text-sm font-bold text-slate-600 p-1 focus:ring-0" />
                    </div>
                </div>
            </div>

            {/* TABEL DATA LOG */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-gray-100 text-xs uppercase tracking-widest text-slate-500 font-black">
                                <th className="p-4 pl-6 w-48">Waktu Kejadian</th>
                                <th className="p-4 w-48">Pelaku (Aktor)</th>
                                <th className="p-4 w-48">Tipe Aksi</th>
                                <th className="p-4 pr-6">Deskripsi Lengkap</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-semibold text-slate-700 divide-y divide-gray-50">
                            {logs.data.length === 0 ? (
                                <tr><td colSpan="4" className="py-12 text-center text-gray-400 font-bold">Tidak ada catatan aktivitas yang sesuai.</td></tr>
                            ) : (
                                logs.data.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 pl-6">
                                            <div className="text-xs text-gray-400">{new Date(log.created_at).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                            <div className="font-bold text-slate-800">{new Date(log.created_at).toLocaleTimeString('id-ID')}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-black text-[10px] uppercase">
                                                    {log.user?.name ? log.user.name.charAt(0) : '?'}
                                                </div>
                                                <span className="font-bold text-slate-900">{log.user?.name || 'Sistem / Terhapus'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                {getActionIcon(log.action)}
                                                <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 px-2 py-1 rounded-md text-slate-600">
                                                    {log.action.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 pr-6 text-gray-600">
                                            {log.description}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {logs.links && logs.links.length > 3 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-center gap-1 bg-slate-50">
                        {logs.links.map((link, i) => (
                            <button 
                                key={i} onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                disabled={!link.url} dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${link.active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-gray-200'} ${!link.url && 'opacity-30 cursor-not-allowed'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}