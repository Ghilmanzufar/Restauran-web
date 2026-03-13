import React, { useState, useEffect, useRef } from "react";
import { Head, router, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { BiSearch, BiFilterAlt, BiDownload, BiInfoCircle, BiDesktop, BiGlobe } from "react-icons/bi";

export default function AuditIndex({ logs, filters, actionTypes }) {
    // State Filter
    const [search, setSearch] = useState(filters.search || "");
    const [actionType, setActionType] = useState(filters.action_type || "");
    const [severity, setSeverity] = useState(filters.severity || "");
    const [startDate, setStartDate] = useState(filters.start_date || "");
    const [endDate, setEndDate] = useState(filters.end_date || "");
    
    // State Modal Detail
    const [selectedLog, setSelectedLog] = useState(null);

    // 1. DEBOUNCE UNTUK PENCARIAN (Tidak perlu tekan Enter)
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const delayBounceFn = setTimeout(() => {
            applyFilters(search); // Kirim parameter search terkini
        }, 500); // Tunggu 500ms setelah user berhenti mengetik
        return () => clearTimeout(delayBounceFn);
    }, [search]);

    // 2. FUNGSI APPLY FILTER (Digunakan oleh tombol atau Debounce)
    const applyFilters = (currentSearch = search) => {
        router.get(route('admin.audit.index'), {
            search: currentSearch,
            action_type: actionType,
            severity: severity,
            start_date: startDate,
            end_date: endDate
        }, { preserveState: true, preserveScroll: true });
    };

    // --- 2. PERBAIKAN FITUR EXPORT (DIRECT BROWSER DOWNLOAD) ---
    const handleExport = () => {
        // Rakit parameter pencarian yang aktif saja agar URL tidak error
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (actionType) queryParams.append('action_type', actionType);
        if (severity) queryParams.append('severity', severity);
        if (startDate) queryParams.append('start_date', startDate);
        if (endDate) queryParams.append('end_date', endDate);

        // Paksa browser membuka link secara Native (Tanpa AJAX Inertia)
        const exportUrl = `${route('admin.audit.export')}?${queryParams.toString()}`;
        window.location.href = exportUrl;
    };

    // Pewarnaan Badge Severity
    const getSeverityBadge = (level) => {
        switch(level) {
            case 'CRITICAL': return "bg-red-100 text-red-700 border-red-200";
            case 'WARNING': return "bg-orange-100 text-orange-700 border-orange-200";
            default: return "bg-blue-100 text-blue-700 border-blue-200";
        }
    };

    // --- 1. FITUR REAL-TIME (AUTO REFRESH 5 DETIK) ---
    useEffect(() => {
        const interval = setInterval(() => {
            // Reload HANYA data 'logs' dari server secara background
            // preserveScroll & preserveState mencegah halaman melompat/reset
            router.reload({ 
                only: ['logs'], 
                preserveScroll: true, 
                preserveState: true 
            });
        }, 5000); // 5000 ms = 5 detik

        // Bersihkan interval saat user pindah halaman
        return () => clearInterval(interval);
    }, []);

    return (
        <AdminLayout title="Audit & Security Logs">
            <Head title="System Audit" />

            {/* HEADER & FILTER */}
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-6">
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-end">
                    
                    {/* Input Pencarian Debounce */}
                    <div className="w-full lg:w-1/3 relative">
                        <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Cari deskripsi, aktor, IP, atau ID Target..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-gray-200 rounded-xl text-sm focus:border-blue-500"
                        />
                    </div>

                    {/* Filter Lainnya dengan Tombol Apply */}
                    <div className="w-full lg:w-auto flex flex-wrap items-center gap-3">
                        <select value={severity} onChange={e => setSeverity(e.target.value)} className="py-2 px-3 bg-slate-50 border-gray-200 rounded-xl text-sm">
                            <option value="">Semua Level</option>
                            <option value="INFO">INFO</option>
                            <option value="WARNING">WARNING</option>
                            <option value="CRITICAL">CRITICAL</option>
                        </select>
                        <select value={actionType} onChange={e => setActionType(e.target.value)} className="py-2 px-3 bg-slate-50 border-gray-200 rounded-xl text-sm">
                            <option value="">Semua Aksi</option>
                            {/* Key tidak lagi menggunakan index */}
                            {actionTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="py-2 px-3 bg-slate-50 border-gray-200 rounded-xl text-sm" />
                        <span className="text-gray-400">-</span>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="py-2 px-3 bg-slate-50 border-gray-200 rounded-xl text-sm" />
                        
                        {/* Tombol Apply untuk filter Dropdown/Date */}
                        <button onClick={() => applyFilters()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                            <BiFilterAlt /> Terapkan
                        </button>
                        
                        <button onClick={handleExport} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                            <BiDownload /> Export
                        </button>
                    </div>
                </div>
            </div>

            {/* TABEL LOG */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-gray-100">
                        <tr>
                            <th className="p-4">Waktu</th>
                            <th className="p-4">Level</th>
                            <th className="p-4">Aktor</th>
                            <th className="p-4">Target Entity</th>
                            <th className="p-4">Deskripsi Aksi</th>
                            <th className="p-4 text-center">Detail</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {logs.data.map(log => (
                            <tr key={log.id} className={`hover:bg-slate-50 transition-colors ${log.severity === 'CRITICAL' ? 'bg-red-50/30' : ''}`}>
                                <td className="p-4 whitespace-nowrap text-xs text-gray-500">{new Date(log.created_at).toLocaleString('id-ID')}</td>
                                <td className="p-4"><span className={`px-2 py-1 text-[10px] font-black rounded border ${getSeverityBadge(log.severity)}`}>{log.severity}</span></td>
                                <td className="p-4 font-bold text-slate-800">{log.user?.name || 'System'}</td>
                                <td className="p-4 font-mono text-xs text-slate-600 bg-slate-100 px-2 rounded inline-block mt-3">{log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}</td>
                                <td className="p-4 text-slate-700 font-medium">{log.description}</td>
                                <td className="p-4 text-center">
                                    <button onClick={() => setSelectedLog(log)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg transition-colors">
                                        <BiInfoCircle className="text-lg" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL DETAIL FORENSIK */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-black text-slate-800">Detail Aktivitas (Forensik)</h3>
                            <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-red-500 font-bold text-xl">&times;</button>
                        </div>
                        <div className="p-6 space-y-6">
                            
                            {/* Identitas Network */}
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-gray-100">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 flex items-center gap-1 mb-1"><BiGlobe /> IP Address</p>
                                    <p className="font-mono text-sm text-slate-800 font-bold">{selectedLog.ip_address || 'Tidak terekam'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 flex items-center gap-1 mb-1"><BiDesktop /> User Agent (Device)</p>
                                    <p className="text-xs text-slate-600 leading-tight">{selectedLog.user_agent || 'Tidak terekam'}</p>
                                </div>
                            </div>

                            {/* Data Before/After (Hanya tampil jika ada perubahan data) */}
                            {(selectedLog.old_values || selectedLog.new_values) && (
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <div className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-md inline-block">Old Value (Sebelum)</div>
                                        <pre className="bg-slate-900 text-red-400 p-4 rounded-xl text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                                            {selectedLog.old_values ? JSON.stringify(selectedLog.old_values, null, 2) : 'Null / Baru Dibuat'}
                                        </pre>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-md inline-block">New Value (Sesudah)</div>
                                        <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                                            {selectedLog.new_values ? JSON.stringify(selectedLog.new_values, null, 2) : 'Null / Dihapus'}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}