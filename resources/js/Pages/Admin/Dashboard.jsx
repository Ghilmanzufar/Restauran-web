import React, { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { 
    BiWallet, BiReceipt, BiAlarmExclamation, BiRightArrowAlt, 
    BiDish, BiGroup, BiTimeFive 
} from "react-icons/bi";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

// --- KOMPONEN BARU: TIMER & BADGE NEW ---
const OrderTimer = ({ createdAt }) => {
    const [mins, setMins] = useState(0);
    
    useEffect(() => {
        const calcTime = () => setMins(Math.floor((new Date() - new Date(createdAt)) / 60000));
        calcTime();
        const interval = setInterval(calcTime, 60000);
        return () => clearInterval(interval);
    }, [createdAt]);

    // Jika kurang dari 1 menit, tampilkan badge NEW berkedip (Auto Highlight)
    if (mins < 1) {
        return <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest animate-pulse shadow-md shadow-red-500/30">NEW</span>;
    }
    
    // Tampilkan timer biasa
    return (
        <span className={`text-[11px] font-bold tracking-wider flex items-center gap-1 mt-0.5 ${mins > 15 ? 'text-red-500' : 'text-slate-400'}`}>
            <BiTimeFive className="text-sm" /> ⏱ {mins} mnt
        </span>
    );
};

export default function Dashboard({ metrics, tables, recentOrders }) {
    
    // Helper untuk mewarnai Meja
    const getTableStatus = (table) => {
        if (!table.orders || table.orders.length === 0) return { label: "Kosong", bg: "bg-white", text: "text-slate-400", border: "border-gray-200", dot: "bg-gray-200" };
        
        const activeOrder = table.orders[0]; 
        if (activeOrder.payment_status === 'unpaid') return { label: "Belum Bayar", bg: "bg-red-50", text: "text-red-600", border: "border-red-300", dot: "bg-red-400" };
        if (activeOrder.order_status === 'processing') return { label: "Dimasak", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-300", dot: "bg-blue-400" };
        if (activeOrder.order_status === 'ready') return { label: "Siap Saji", bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-300", dot: "bg-yellow-400" };
        
        return { label: "Aktif/Lunas", bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-300", dot: "bg-emerald-400" };
    };

    return (
        <AdminLayout title="Dashboard Overview">
            <Head title="Admin Dashboard" />

            {/* --- 1. TOP CARDS (4 METRIK OPERASIONAL) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl shrink-0"><BiWallet /></div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Pendapatan</p>
                        <h3 className="text-2xl font-black text-slate-900">{formatRupiah(metrics.revenue)}</h3>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl shrink-0"><BiReceipt /></div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Order</p>
                        <h3 className="text-2xl font-black text-slate-900">{metrics.total_orders} <span className="text-sm font-medium text-gray-400">trx</span></h3>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-soft border border-red-100 flex items-center gap-5 relative overflow-hidden group">
                    <div className="absolute -right-4 top-2 opacity-5 group-hover:scale-110 transition-transform"><BiAlarmExclamation className="text-8xl text-red-500" /></div>
                    <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-3xl shrink-0 z-10"><BiAlarmExclamation /></div>
                    <div className="z-10">
                        <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Belum Dibayar</p>
                        <h3 className="text-2xl font-black text-red-600">{metrics.unpaid_count} <span className="text-sm font-medium">antrean</span></h3>
                    </div>
                </div>
                
                {/* METRIK BARU: MEJA AKTIF */}
                <div className="bg-white rounded-2xl p-6 shadow-soft border border-orange-100 flex items-center gap-5">
                    <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-3xl shrink-0"><BiGroup /></div>
                    <div>
                        <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-1">Meja Aktif</p>
                        <h3 className="text-2xl font-black text-slate-900">{metrics.active_tables} <span className="text-sm font-medium text-gray-400">/ {tables.length}</span></h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* --- 2. STATUS MEJA (GRID & INTERAKTIF) --- */}
                <div className="xl:col-span-2 bg-white rounded-3xl p-8 shadow-soft border border-gray-100 flex flex-col">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Live Status Meja</h2>
                            <p className="text-sm text-gray-500 font-medium mt-1">Klik meja untuk membuka kasir (POS).</p>
                        </div>
                        
                        {/* LEGEND LENGKAP */}
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-200"></span> Kosong</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse"></span> Belum Bayar</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span> Dimasak</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> Siap Saji</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Lunas/Aktif</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 flex-1 content-start">
                        {tables.map(table => {
                            const status = getTableStatus(table);
                            return (
                                // LINK MEJA KE HALAMAN POS (Hover & Clickable UX)
                                <Link 
                                    key={table.id} 
                                    href="/admin/pos" // Shortcut ke POS
                                    className={`relative p-4 rounded-2xl border-2 flex flex-col items-center justify-center h-28 transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-floating active:scale-95 ${status.bg} ${status.border}`}
                                >
                                    <span className={`text-3xl font-black mb-1.5 ${status.text}`}>{table.table_number}</span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-white/60 backdrop-blur-sm shadow-sm ${status.text}`}>
                                        {status.label}
                                    </span>
                                    
                                    {/* Indikator Titik Warna Kecil */}
                                    <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${status.dot}`}></span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* --- 3. INCOMING ORDERS PANEL --- */}
                <div className="bg-white rounded-3xl p-8 shadow-soft border border-gray-100 flex flex-col h-full max-h-[600px]">
                    <div className="flex justify-between items-center mb-6 shrink-0">
                        <h2 className="text-xl font-black text-slate-900">Order Terbaru</h2>
                        <Link href="/admin/pos" className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                            Buka POS <BiRightArrowAlt className="text-lg" />
                        </Link>
                    </div>

                    <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
                        {recentOrders.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 flex flex-col items-center h-full justify-center">
                                <BiDish className="text-6xl mb-3 opacity-20" />
                                <p className="font-bold text-sm">Belum ada order hari ini.</p>
                            </div>
                        ) : (
                            recentOrders.map(order => (
                                <div key={order.id} className="p-4 rounded-2xl bg-slate-50 border border-gray-100 flex items-center justify-between transition-all hover:bg-white hover:shadow-soft group relative overflow-hidden">
                                    
                                    {/* Efek Garis Samping untuk Order Baru */}
                                    {(new Date() - new Date(order.created_at)) / 60000 < 1 && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 animate-pulse"></div>
                                    )}

                                    <div className="flex items-center gap-4">
                                        {/* Logo Meja Bulat */}
                                        <div className="w-14 h-14 bg-white border-2 border-slate-900 text-slate-900 rounded-full flex flex-col items-center justify-center shrink-0 shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                                            <span className="text-[9px] font-black uppercase tracking-widest leading-none text-slate-400">Meja</span>
                                            <span className="text-l font-black leading-tight mt-0.5">{order.table?.table_number || '?'}</span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-slate-800 text-sm truncate group-hover:text-blue-600 transition-colors">{order.customer_name}</p>
                                                
                                                {/* BADGE NEW / TIMER */}
                                                <OrderTimer createdAt={order.created_at} />
                                            </div>

                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-gray-400 font-mono font-bold bg-gray-100 px-1.5 py-0.5 rounded">
                                                    #{order.id.slice(-4).toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right shrink-0 flex flex-col items-end">
                                        <p className="font-black text-slate-900 text-sm">{formatRupiah(order.total_price)}</p>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mt-1.5 border ${order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                            {order.payment_status === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}