import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
    BiTrendingUp, BiReceipt, BiWallet, BiCoffeeTogo, 
    BiBarChartAlt2, BiTimeFive, BiCalendarCheck
} from "react-icons/bi";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function ReportIndex({ daily, monthly }) {
    const [activeTab, setActiveTab] = useState("daily");

    // Format data trend untuk grafik bulanan
    const trendData = monthly.trend.map(item => ({
        tanggal: new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        pendapatan: parseInt(item.total)
    }));

    // Format data jam ramai
    const peakHourData = monthly.peak_hours.map(item => ({
        jam: `${String(item.hour).padStart(2, '0')}:00`,
        pesanan: parseInt(item.total_orders)
    }));

    return (
        <AdminLayout title="Laporan & Analitik (Owner View)">
            <Head title="Laporan Owner" />

            {/* TAB NAVIGASI */}
            <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-full md:w-max mb-8">
                <button onClick={() => setActiveTab('daily')} className={`flex-1 md:flex-none px-8 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'daily' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
                    <BiCalendarCheck className="text-lg" /> Hari Ini
                </button>
                <button onClick={() => setActiveTab('monthly')} className={`flex-1 md:flex-none px-8 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'monthly' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
                    <BiBarChartAlt2 className="text-lg" /> Bulan Ini
                </button>
            </div>

            {/* ================================================== */}
            {/* VIEW HARIAN */}
            {/* ================================================== */}
            {activeTab === 'daily' && (
                <div className="space-y-6">
                    {/* Ringkasan Keuangan Harian */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-3xl text-white shadow-lg shadow-blue-600/20">
                            <div className="flex items-center gap-3 text-blue-200 mb-2"><BiWallet className="text-2xl" /> <span className="font-bold text-sm uppercase tracking-wider">Total Omset</span></div>
                            <h3 className="text-3xl font-black">{formatRupiah(daily.total_sales)}</h3>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
                            <div className="flex items-center gap-3 text-gray-400 mb-1"><BiReceipt className="text-xl" /> <span className="font-bold text-xs uppercase tracking-wider">Total Pesanan</span></div>
                            <h3 className="text-2xl font-black text-slate-800">{daily.total_orders} <span className="text-sm font-bold text-gray-400">Struk</span></h3>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
                            <div className="flex items-center gap-3 text-orange-400 mb-1"><BiTrendingUp className="text-xl" /> <span className="font-bold text-xs uppercase tracking-wider">Pajak (Tax)</span></div>
                            <h3 className="text-2xl font-black text-slate-800">{formatRupiah(daily.total_tax)}</h3>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
                            <div className="flex items-center gap-3 text-emerald-400 mb-1"><BiCoffeeTogo className="text-xl" /> <span className="font-bold text-xs uppercase tracking-wider">Service Charge</span></div>
                            <h3 className="text-2xl font-black text-slate-800">{formatRupiah(daily.total_service)}</h3>
                        </div>
                    </div>

                    {/* Top Selling Menu */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2"><BiTrendingUp className="text-blue-500" /> Menu Paling Laris Hari Ini</h3>
                        <div className="space-y-4">
                            {daily.top_selling.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">Belum ada penjualan hari ini.</p>
                            ) : (
                                daily.top_selling.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-black flex items-center justify-center text-sm">{index + 1}</div>
                                            <span className="font-bold text-slate-800">{item.name}</span>
                                        </div>
                                        <div className="font-black text-slate-900 bg-white px-4 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                            {item.total_qty} <span className="text-xs text-gray-400 font-bold">Porsi</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ================================================== */}
            {/* VIEW BULANAN */}
            {/* ================================================== */}
            {activeTab === 'monthly' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    
                    {/* Grafik Tren Pendapatan */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 col-span-1 xl:col-span-2">
                        <div className="mb-6">
                            <h3 className="font-black text-slate-800 text-lg flex items-center gap-2"><BiTrendingUp className="text-blue-500" /> Tren Pendapatan Bulan Ini</h3>
                            <p className="text-sm text-gray-500 font-semibold">Grafik pergerakan omset dari hari ke hari.</p>
                        </div>
                        <div className="h-[300px] w-full">
                            {trendData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="tanggal" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} tickFormatter={(value) => `Rp ${value/1000}k`} dx={-10} />
                                        <RechartsTooltip formatter={(value) => formatRupiah(value)} labelStyle={{ fontWeight: 'bold', color: '#1e293b' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                        <Area type="monotone" dataKey="pendapatan" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPv)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">Belum ada data bulan ini.</div>
                            )}
                        </div>
                    </div>

                    {/* Grafik Jam Ramai */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 col-span-1 xl:col-span-2">
                        <div className="mb-6">
                            <h3 className="font-black text-slate-800 text-lg flex items-center gap-2"><BiTimeFive className="text-orange-500" /> Jam Sibuk (Peak Hours)</h3>
                            <p className="text-sm text-gray-500 font-semibold">Analisis waktu transaksi terbanyak untuk optimasi jadwal staf.</p>
                        </div>
                        <div className="h-[250px] w-full">
                            {peakHourData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={peakHourData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="jam" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} />
                                        <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="pesanan" fill="#f97316" radius={[6, 6, 0, 0]} maxBarSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">Belum ada data bulan ini.</div>
                            )}
                        </div>
                    </div>

                </div>
            )}
        </AdminLayout>
    );
}