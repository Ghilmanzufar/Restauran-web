import React, { useState, useEffect, useRef } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { BiTimeFive, BiCheck, BiPlay, BiRestaurant } from "react-icons/bi";
import { toast } from "sonner"; 
// Catatan: Tidak perlu import <Toaster /> karena sudah ada di AdminLayout

export default function KitchenIndex({ activeOrders }) {
    const previousOrderCount = useRef(activeOrders.length);
    const [currentTime, setCurrentTime] = useState(new Date());

    // --- AUTO REFRESH & AUDIO ALERT ---
    useEffect(() => {
        // Bunyi Bel jika ada orderan baru
        if (activeOrders.length > previousOrderCount.current) {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(() => {});
            toast.warning('Tiket Baru!', { duration: 3000 });
        }
        previousOrderCount.current = activeOrders.length;

        // Polling Data (10s) & Timer Jam (1s)
        const dataInterval = setInterval(() => {
            router.reload({ only: ['activeOrders'], preserveScroll: true, preserveState: true });
        }, 10000);
        const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);

        return () => {
            clearInterval(dataInterval);
            clearInterval(clockInterval);
        };
    }, [activeOrders]);

    // --- UPDATE STATUS ---
    const handleAction = (orderId, currentStatus) => {
        // UBAH: Ganti 'completed' menjadi 'ready'
        const newStatus = currentStatus === 'pending' ? 'processing' : 'ready'; 
        
        router.patch(route('admin.orders.update-status', orderId), { order_status: newStatus }, {
            preserveScroll: true,
            // (Opsional) Sesuaikan juga pesan suksesnya agar lebih relevan
            onSuccess: () => toast.success(newStatus === 'processing' ? 'Mulai dimasak!' : 'Pesanan Siap Diambil!')
        });
    };

    return (
        <AdminLayout title="Kitchen Display System">
            <Head title="Layar Dapur" />

            {/* WADAH KDS (DARK MODE CONTAINER) */}
            <div className="bg-slate-900 rounded-3xl p-6 min-h-[80vh] flex flex-col shadow-2xl border border-slate-800">
                
                {/* KDS HEADER */}
                <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 shadow-inner">
                            <BiRestaurant className="text-2xl text-yellow-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-widest uppercase">Antrean Dapur</h2>
                            <p className="text-sm font-bold text-slate-400 font-mono">{activeOrders.length} TIKET AKTIF</p>
                        </div>
                    </div>
                </div>

                {/* TICKET GRID (MASONRY/DENSE) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {activeOrders.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 font-black uppercase tracking-widest text-2xl py-20">
                            Dapur Sedang Kosong
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 items-start pb-4">
                            {activeOrders.map(order => {
                                const isProcessing = order.order_status === 'processing';
                                
                                // Kalkulasi Waktu (SLA)
                                const minutesWait = Math.floor((currentTime - new Date(order.created_at)) / 60000);
                                const isLate = minutesWait >= 15;
                                const isWarning = minutesWait >= 10 && !isLate;

                                // Penentuan Warna Header Tiket
                                let headerColor = "bg-slate-200 text-slate-900"; // Default (Baru Masuk)
                                if (isLate) headerColor = "bg-red-600 text-white animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.5)]"; // Telat Parah
                                else if (isWarning) headerColor = "bg-yellow-400 text-black"; // Peringatan
                                else if (isProcessing) headerColor = "bg-blue-600 text-white"; // Sedang Dimasak

                                return (
                                    // DESAIN TIKET (KERTAS STRUK)
                                    <div key={order.id} className="bg-white text-slate-900 rounded-xl shadow-lg border-2 border-slate-300 flex flex-col overflow-hidden transition-transform duration-200 hover:scale-[1.02]">
                                        
                                        {/* HEADER TIKET */}
                                        <div className={`p-4 flex justify-between items-start ${headerColor} transition-colors border-b-2 border-slate-300 border-dashed`}>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-0.5">Meja</p>
                                                <p className="text-4xl font-black leading-none">{order.table?.table_number || 'TKW'}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center justify-end gap-1 font-black text-2xl font-mono">
                                                    <BiTimeFive className="text-xl" /> {minutesWait}m
                                                </div>
                                                <p className="text-[10px] font-bold uppercase mt-1 opacity-90 truncate max-w-[100px]">
                                                    {order.customer_name}
                                                </p>
                                            </div>
                                        </div>

                                        {/* ISI TIKET */}
                                        <div className="p-4 flex-1 flex flex-col gap-3 min-h-[150px]">
                                            {order.items.map((item, idx) => {
                                                const itemQty = item.qty || 1;
                                                const itemName = item.product?.name || item.product_name || 'Menu';

                                                return (
                                                    <div key={idx} className="border-b border-slate-200 pb-3 last:border-0 last:pb-0">
                                                        <div className="flex items-start gap-3">
                                                            <span className="text-xl font-black">{itemQty}x</span>
                                                            <div className="flex-1 mt-0.5">
                                                                <span className="text-base font-black uppercase leading-tight">{itemName}</span>
                                                                
                                                                {/* Varian */}
                                                                {item.variants && item.variants.length > 0 && (
                                                                    <div className="mt-1">
                                                                        {item.variants.map((v, i) => (
                                                                            <div key={i} className="text-xs font-bold text-slate-500 uppercase">
                                                                                - {v.product_variant_item?.name}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {/* Catatan Kustom (Highlighter Kuning) */}
                                                                {(item.note || item.notes) && (
                                                                    <div className="mt-2 bg-yellow-200 text-yellow-900 font-black text-xs uppercase p-2 border border-yellow-400 inline-block w-full rounded-md shadow-sm">
                                                                        ⚠️ {item.note || item.notes}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        {/* TOMBOL AKSI TIKET */}
                                        <button 
                                            onClick={() => handleAction(order.id, order.order_status)}
                                            className={`w-full py-4 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${
                                                !isProcessing 
                                                ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' 
                                                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                            }`}
                                        >
                                            {!isProcessing ? <><BiPlay className="text-2xl"/> Mulai Masak</> : <><BiCheck className="text-2xl"/> Siap Saji</>}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}