import React from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { 
    BiTrendingUp, BiTrendingDown, BiReceipt, BiWallet, 
    BiPrinter, BiDownload, BiCalendarEvent, BiDish, BiPieChartAlt2 
} from "react-icons/bi";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function ReportIndex({ metrics, paymentMethods, topMenus, salesByCategory, peakHours, currentFilter }) {
    
    // --- FUNGSI FILTER TANGGAL ---
    const handleFilterChange = (e) => {
        router.get(route('admin.reports.index'), { filter: e.target.value }, { preserveState: true, preserveScroll: true });
    };

    // --- FUNGSI EXPORT ASLI ---
    const handleExport = (type) => {
        const routeName = type === 'PDF' ? 'admin.reports.export.pdf' : 'admin.reports.export.excel';
        
        // Buka link download di tab baru dengan membawa parameter filter saat ini
        window.open(route(routeName, { filter: currentFilter }), '_blank');
        
        toast.success(`Sedang mengunduh file ${type}...`);
    };

    return (
        <AdminLayout title="Laporan & Analitik">
            <Head title="Laporan Bisnis" />

            {/* HEADER & FILTER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-xl font-black text-slate-900">Business Insights 📊</h2>
                    <p className="text-sm font-semibold text-gray-500">Pantau performa omset, AOV, dan menu favorit.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Date Filter Picker */}
                    <div className="relative flex-1 md:flex-none">
                        <BiCalendarEvent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select 
                            value={currentFilter} 
                            onChange={handleFilterChange} 
                            className="w-full md:w-48 pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="today">Hari Ini</option>
                            <option value="yesterday">Kemarin</option>
                            <option value="7days">7 Hari Terakhir</option>
                            <option value="30days">30 Hari Terakhir</option>
                        </select>
                    </div>

                    {/* Tombol Export */}
                    <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleExport('PDF')} className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors title='Export PDF'"><BiPrinter className="text-lg" /></button>
                        <button onClick={() => handleExport('Excel')} className="p-2.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-colors title='Export Excel'"><BiDownload className="text-lg" /></button>
                    </div>
                </div>
            </div>

            {/* KEY METRICS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Card Omset */}
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><BiWallet className="text-xl" /></div>
                        {/* Trend Growth */}
                        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${metrics.sales_growth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {metrics.sales_growth >= 0 ? <BiTrendingUp /> : <BiTrendingDown />}
                            {Math.abs(metrics.sales_growth).toFixed(1)}% vs Sblmnya
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 mb-1">Total Omset Bersih</p>
                        <h3 className="text-2xl font-black text-slate-900">{formatRupiah(Number(metrics.total_sales))}</h3>
                    </div>
                </div>

                {/* Card Average Order Value (AOV) */}
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="w-10 h-10 rounded-xl mb-4 bg-purple-50 text-purple-600 flex items-center justify-center"><BiReceipt className="text-xl" /></div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 mb-1">Average Order Value (AOV)</p>
                        <h3 className="text-2xl font-black text-slate-900">{formatRupiah(Number(metrics.aov))} <span className="text-sm font-semibold text-gray-400">/ nota</span></h3>
                    </div>
                </div>

                {/* Card Total Transaksi */}
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="w-10 h-10 rounded-xl mb-4 bg-orange-50 text-orange-600 flex items-center justify-center"><BiDish className="text-xl" /></div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 mb-1">Total Transaksi Sukses</p>
                        <h3 className="text-2xl font-black text-slate-900">{Number(metrics.total_orders)} <span className="text-sm font-semibold text-gray-400">Orders</span></h3>
                    </div>
                </div>

                {/* Card Pajak & Service */}
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
                        <span className="text-sm font-bold text-gray-500">Pajak (PB1)</span>
                        <span className="font-black text-slate-800">{formatRupiah(Number(metrics.total_tax))}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-500">Service Charge</span>
                        <span className="font-black text-slate-800">{formatRupiah(Number(metrics.total_service))}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* KOLOM KIRI (Menu Profitability & Category) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Top Selling Menus by Revenue */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="font-black text-slate-900 mb-5 flex items-center gap-2"><BiTrendingUp className="text-blue-500" /> Menu Paling Menguntungkan</h3>
                        <div className="space-y-4">
                            {topMenus.length === 0 ? <p className="text-center text-sm text-gray-400 py-4">Belum ada data penjualan.</p> : null}
                            {topMenus.map((item, index) => (
                                <div key={item.name} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-black flex items-center justify-center text-xs shadow-md">{index + 1}</div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                                            <p className="text-xs font-semibold text-gray-500">Terjual: {Number(item.total_qty)} porsi</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-emerald-600">{formatRupiah(Number(item.total_revenue))}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sales by Category */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="font-black text-slate-900 mb-5 flex items-center gap-2"><BiPieChartAlt2 className="text-purple-500" /> Penjualan Berdasarkan Kategori</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {salesByCategory.map((cat) => (
                                <div key={cat.name} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">{cat.name}</h4>
                                    <p className="font-black text-lg text-slate-900">{formatRupiah(Number(cat.total_revenue))}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* KOLOM KANAN (Payment Methods) */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Metode Pembayaran */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="font-black text-slate-900 mb-5">Metode Pembayaran</h3>
                        <div className="space-y-5">
                            {paymentMethods.length === 0 ? <p className="text-center text-sm text-gray-400 py-4">Belum ada transaksi.</p> : null}
                            {paymentMethods.map(method => {
                                // Hitung persentase bar
                                const percent = metrics.total_orders > 0 ? (Number(method.total_count) / metrics.total_orders) * 100 : 0;
                                return (
                                    <div key={method.payment_method}>
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="text-xs font-bold text-slate-700 uppercase">{method.payment_method.replace('_', ' ')}</span>
                                            <span className="text-xs font-black text-slate-900">{formatRupiah(Number(method.total_revenue))}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${percent}%` }}></div>
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-bold mt-1 text-right">{Number(method.total_count)} trx ({percent.toFixed(0)}%)</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Peak Hours (Waktu Sibuk) */}
                    <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg">
                        <h3 className="font-black mb-5 text-orange-400">Jam Sibuk (Peak Hours)</h3>
                        <div className="flex items-end justify-between h-32 gap-1 mt-4 border-b border-slate-700 pb-2">
                            {/* Dummy data mapping untuk grafik batang visual */}
                            {[9,10,11,12,13,14,15,16,17,18,19,20,21].map(hour => {
                                const dataHour = peakHours.find(p => Number(p.hour) === hour);
                                const total = dataHour ? Number(dataHour.total_orders) : 0;
                                const height = metrics.total_orders > 0 ? (total / metrics.total_orders) * 100 * 2 : 0; // Skala max
                                return (
                                    <div key={hour} className="flex flex-col justify-end items-center flex-1 h-full group relative">
                                        {/* Tooltip Hover */}
                                        <div className="absolute -top-8 bg-white text-slate-900 text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            {total} trx
                                        </div>
                                        <div className="w-full bg-blue-500 rounded-t-sm hover:bg-orange-500 transition-colors" style={{ height: `${Math.max(height, 2)}%` }}></div>
                                        <span className="text-[9px] mt-2 font-mono text-slate-400">{hour}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}