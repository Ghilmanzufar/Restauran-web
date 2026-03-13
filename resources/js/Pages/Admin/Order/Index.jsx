import React, { useState, useEffect, useCallback } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { BiReceipt, BiChevronRight } from "react-icons/bi";

// Import Komponen Kecil
import OrderSummary from "./Components/OrderSummary";
import OrderFilters from "./Components/OrderFilters";
import OrderDetailModal from "./Components/OrderDetailModal";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function OrderIndex({ orders, summary, filters }) {
    // --- STATE FILTER ---
    const [search, setSearch] = useState(filters.search || "");
    const [status, setStatus] = useState(filters.status || "all");
    const [startDate, setStartDate] = useState(filters.start_date || "");
    const [endDate, setEndDate] = useState(filters.end_date || "");

    // State untuk Modal
    const [detailModal, setDetailModal] = useState({ isOpen: false, order: null });

    // --- AUTO REFRESH (POLLING 5 DETIK) ---
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ 
                only: ['orders', 'summary'], 
                preserveScroll: true,        
                preserveState: true          
            });
        }, 5000); 
        
        return () => clearInterval(interval);
    }, []);
    
    // Fungsi Terapkan Filter
    const applyFilters = useCallback(() => {
        router.get(route('admin.orders.index'), {
            search, status, start_date: startDate, end_date: endDate
        }, { preserveState: true, preserveScroll: true, replace: true });
    }, [search, status, startDate, endDate]);

    useEffect(() => { applyFilters(); }, [status, startDate, endDate]);

    const handleSearch = (e) => {
        if (e.key === 'Enter') applyFilters();
    };

    return (
        <AdminLayout title="Riwayat Transaksi">
            <Head title="Laporan & Riwayat Order" />

            {/* 1. KARTU RINGKASAN */}
            <OrderSummary summary={summary} />

            {/* 2. KONTROL FILTER */}
            <OrderFilters 
                search={search} setSearch={setSearch} 
                status={status} setStatus={setStatus} 
                startDate={startDate} setStartDate={setStartDate} 
                endDate={endDate} setEndDate={setEndDate} 
                handleSearch={handleSearch} 
            />

            {/* 3. TABEL DATA */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-gray-100 text-xs uppercase tracking-widest text-slate-500 font-black">
                                <th className="p-4 pl-6">ID Order & Tanggal</th>
                                <th className="p-4">Pelanggan</th>
                                <th className="p-4 text-center">Meja</th>
                                <th className="p-4">Total Harga</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 pr-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-semibold text-slate-700 divide-y divide-gray-50">
                            {orders.data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-gray-400">
                                        <BiReceipt className="text-5xl mx-auto mb-3 opacity-30" />
                                        Tidak ada data transaksi pada rentang tanggal ini.
                                    </td>
                                </tr>
                            ) : (
                                orders.data.map(order => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-4 pl-6">
                                            <div className="font-mono text-xs text-gray-400 mb-1">#{order.id.split('-')[0].toUpperCase()}</div>
                                            <div className="text-slate-900">{formatDate(order.created_at)}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-slate-900">{order.customer_name}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-black text-xs border border-gray-200">
                                                {order.table?.table_number || '-'}
                                            </span>
                                        </td>
                                        <td className="p-4 font-black text-slate-900">
                                            {formatRupiah(order.total_price)}
                                        </td>
                                        <td className="p-4">
                                            {order.order_status === 'cancelled' ? (
                                                <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Dibatalkan</span>
                                            ) : order.payment_status === 'paid' ? (
                                                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Lunas</span>
                                            ) : (
                                                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Belum Bayar</span>
                                            )}
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <button 
                                                onClick={() => setDetailModal({ isOpen: true, order })}
                                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                Lihat Detail <BiChevronRight className="text-lg" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {orders.links && orders.links.length > 3 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-center gap-1 bg-slate-50">
                        {orders.links.map((link, i) => (
                            <button 
                                key={i} onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                disabled={!link.url} dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${link.active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-gray-200'} ${!link.url && 'opacity-30 cursor-not-allowed'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* 4. MODAL DETAIL STRUK */}
            <OrderDetailModal 
                isOpen={detailModal.isOpen} 
                order={detailModal.order} 
                onClose={() => setDetailModal({ isOpen: false, order: null })} 
            />

        </AdminLayout>
    );
}