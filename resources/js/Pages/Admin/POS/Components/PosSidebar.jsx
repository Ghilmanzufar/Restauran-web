import React, { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import { BiSearch, BiWallet, BiRefresh, BiDish, BiCheckCircle, BiTimeFive, BiArrowBack } from "react-icons/bi";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

// Helper Timer
const OrderTimer = ({ createdAt }) => {
    const [mins, setMins] = useState(0);
    useEffect(() => {
        const calcTime = () => setMins(Math.floor((new Date() - new Date(createdAt)) / 60000));
        calcTime();
        const interval = setInterval(calcTime, 60000);
        return () => clearInterval(interval);
    }, [createdAt]);

    if (mins < 1) return <span className="text-[10px] text-green-500 font-bold tracking-wider animate-pulse">BARU SAJA</span>;
    if (mins > 20) return <span className="text-[10px] text-white bg-red-600 px-2 py-0.5 rounded-md font-bold tracking-wider animate-pulse shadow-md shadow-red-500/50">LAMA: {mins}m</span>;
    return <span className={`text-[10px] font-bold tracking-wider flex items-center gap-1 ${mins > 15 ? 'text-red-500' : 'text-gray-400'}`}><BiTimeFive /> {mins}m</span>;
};

export default function PosSidebar({ filteredOrders, search, setSearch, filterStatus, setFilterStatus, selectedOrder, setSelectedOrder, searchInputRef, onRefresh }) {
    return (
        <div className="w-[400px] bg-white border-r border-slate-200 flex flex-col z-10 shrink-0">
            {/* Header Kiri */}
            <div className="p-5 border-b border-slate-100 bg-slate-50 shrink-0">
                <div className="flex justify-between items-center mb-4">
                    
                    {/* --- TAMBAHAN TOMBOL BACK DI SINI --- */}
                    <div className="flex items-center gap-3">
                        <Link href="/admin/dashboard" className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-all shadow-sm">
                            <BiArrowBack className="text-lg" />
                        </Link>
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <BiWallet className="text-blue-500" /> POS Kasir
                        </h2>
                    </div>

                    <button onClick={onRefresh} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm">
                        <BiRefresh className="text-xl" />
                    </button>
                </div>
                
                <div className="relative mb-3">
                    <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                    <input 
                        ref={searchInputRef} type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari Nama, Meja, Menu... (F2)" 
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-semibold focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
                
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                    {/* 👇 PERBAIKAN 1: 'completed' diganti menjadi 'ready' di dalam array filter */}
                    {["all", "unpaid", "processing", "ready", "paid"].map(status => (
                        <button 
                            key={status} onClick={() => setFilterStatus(status)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filterStatus === status ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}
                        >
                            {status === 'all' ? 'Semua' : status === 'unpaid' ? 'Belum Bayar' : status === 'processing' ? 'Dimasak' : status === 'ready' ? 'Siap Saji' : 'Lunas'}
                        </button>
                    ))}
                </div>
            </div>

            {/* List Antrian */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-slate-50/50">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 font-medium text-sm">Tidak ada pesanan.</div>
                ) : (
                    filteredOrders.map(order => (
                        <button 
                            key={order.id} onClick={() => setSelectedOrder(order)}
                            className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedOrder?.id === order.id ? "bg-blue-50 border-blue-500 shadow-sm ring-1 ring-blue-500/50" : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm"}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex gap-3 items-center">
                                    <div className={`h-10 px-3 min-w-[40px] w-fit rounded-xl flex items-center justify-center font-black text-sm ${order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                                        {order.table?.table_number || '-'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm truncate max-w-[120px]">{order.customer_name}</p>
                                        <OrderTimer createdAt={order.created_at} />
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="font-black text-slate-900 text-sm">{formatRupiah(order.total_price)}</p>
                                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">{order.items?.reduce((a,b) => a + parseInt(b.qty || 0, 10), 0)} Item</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100/80">
                                {/* 👇 PERBAIKAN 2: Indikator Siap Saji diganti pembacaannya menjadi order_status === 'ready' */}
                                {order.order_status === 'pending' ? <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded flex items-center gap-1"><BiTimeFive/> Menunggu</span> : order.order_status === 'processing' ? <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded flex items-center gap-1"><BiDish/> Dimasak</span> : order.order_status === 'ready' ? <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded flex items-center gap-1"><BiCheckCircle/> Siap Saji</span> : <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded flex items-center gap-1"><BiCheckCircle/> Selesai</span>}
                                {order.payment_status === 'paid' ? <span className="text-[10px] font-black tracking-widest text-emerald-500 uppercase">Lunas</span> : <span className="text-[10px] font-black tracking-widest text-red-500 uppercase">Belum Bayar</span>}
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}