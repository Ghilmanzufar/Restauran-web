import React, { useState, useEffect, useCallback } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import Modal from "@/Components/Modal";
import { 
    BiSearch, BiFilterAlt, BiCalendarAlt, BiReceipt, 
    BiWallet, BiX, BiChevronRight, BiDish 
} from "react-icons/bi";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function OrderIndex({ orders, summary, filters }) {
    // --- STATE FILTER ---
    const [search, setSearch] = useState(filters.search || "");
    const [status, setStatus] = useState(filters.status || "all");
    const [startDate, setStartDate] = useState(filters.start_date || "");
    const [endDate, setEndDate] = useState(filters.end_date || "");

    // State untuk Modal Detail Struk
    const [detailModal, setDetailModal] = useState({ isOpen: false, order: null });

    // Fungsi untuk menerapkan filter ke backend
    const applyFilters = useCallback(() => {
        router.get(route('admin.orders.index'), {
            search, status, start_date: startDate, end_date: endDate
        }, { preserveState: true, preserveScroll: true, replace: true });
    }, [search, status, startDate, endDate]);

    // Auto-apply filter saat status/tanggal berubah
    useEffect(() => { applyFilters(); }, [status, startDate, endDate]);

    // Handle pencarian (Enter)
    const handleSearch = (e) => {
        if (e.key === 'Enter') applyFilters();
    };

    return (
        <AdminLayout title="Riwayat Transaksi">
            <Head title="Laporan & Riwayat Order" />

            {/* --- 1. KARTU RINGKASAN --- */}
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

            {/* --- 2. KONTROL FILTER --- */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center">
                
                {/* Search Bar */}
                <div className="relative w-full lg:w-96">
                    <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                    <input 
                        type="text" placeholder="Cari ID Order atau Nama Pelanggan... (Tekan Enter)" 
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

            {/* --- 3. TABEL DATA --- */}
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

                {/* Pagination (Jika data lebih dari 20) */}
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

            {/* --- 4. MODAL DETAIL STRUK --- */}
            <Modal show={detailModal.isOpen} onClose={() => setDetailModal({ isOpen: false, order: null })} maxWidth="md">
                {detailModal.order && (
                    <div className="bg-white p-6 rounded-2xl flex flex-col max-h-[90vh]">
                        {/* Header Modal */}
                        <div className="flex justify-between items-start mb-6 shrink-0">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Detail Pesanan</h2>
                                <p className="text-xs font-mono text-gray-400 mt-1">ID: {detailModal.order.id}</p>
                            </div>
                            <button onClick={() => setDetailModal({ isOpen: false, order: null })} className="text-gray-400 hover:text-slate-900 bg-gray-100 p-1.5 rounded-full"><BiX className="text-xl" /></button>
                        </div>

                        {/* Info Customer & Status */}
                        <div className="grid grid-cols-2 gap-4 mb-6 shrink-0 bg-slate-50 p-4 rounded-xl border border-gray-100">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pelanggan</p>
                                <p className="font-bold text-slate-900 text-sm">{detailModal.order.customer_name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Meja</p>
                                <p className="font-bold text-slate-900 text-sm">{detailModal.order.table?.table_number || '-'}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Waktu Pesan</p>
                                <p className="font-bold text-slate-900 text-sm">{formatDate(detailModal.order.created_at)}</p>
                            </div>
                        </div>

                        {/* Daftar Item (Scrollable) */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-6 space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-gray-100 pb-2">Daftar Menu</h3>
                            
                            {detailModal.order.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-start gap-4">
                                    <div className="flex gap-3 items-start">
                                        <div className="w-6 h-6 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">{item.quantity}x</div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm leading-tight">{item.product_name}</p>
                                            
                                            {/* List Varian (Jika Ada) */}
                                            {item.variants && item.variants.length > 0 && (
                                                <div className="mt-1 space-y-0.5">
                                                    {item.variants.map((v, i) => (
                                                        <p key={i} className="text-[10px] font-bold text-gray-400 flex justify-between w-full">
                                                            <span>• {v.product_variant_item?.name || 'Varian'}</span>
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="font-black text-slate-900 text-sm shrink-0">
                                        {formatRupiah(item.price * item.quantity)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total Bawah */}
                        <div className="pt-4 border-t-2 border-dashed border-gray-200 shrink-0">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-500">Total Tagihan</span>
                                <span className="text-2xl font-black text-slate-900">{formatRupiah(detailModal.order.total_price)}</span>
                            </div>
                            
                            {/* Tombol Cetak Struk */}
                            <button onClick={() => window.print()} className="w-full mt-4 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                                <BiReceipt className="text-xl" /> Cetak Struk
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

        </AdminLayout>
    );
}