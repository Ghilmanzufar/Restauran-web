import React, { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";

export default function TvDisplay({ preparing, ready }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    // 1. POLLING REAL-TIME SUPER AGRESIF (Tiap 3 Detik)
    useEffect(() => {
        const interval = setInterval(() => {
            router.get(route('tv.display'), {}, {
                preserveState: true,
                preserveScroll: true,
                only: ['preparing', 'ready'],
                replace: true // Penting: Mencegah history browser menumpuk & bypass cache
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // 2. JAM DIGITAL
    useEffect(() => {
        const clock = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(clock);
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden flex flex-col">
            <Head title="Order Queue Display" />

            {/* HEADER TV */}
            <div className="bg-slate-900 border-b border-slate-800 p-6 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600 text-white p-3 rounded-xl font-black text-2xl tracking-widest">POS</div>
                    <h1 className="text-3xl font-black tracking-wide text-slate-100">STATUS PESANAN</h1>
                </div>
                <div className="text-right">
                    <p className="text-4xl font-black text-blue-400">
                        {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                </div>
            </div>

            {/* KONTEN UTAMA */}
            <div className="flex-1 grid grid-cols-2 divide-x divide-slate-800">
                
                {/* KIRI: MEMASAK */}
                <div className="p-8 flex flex-col h-full bg-slate-950">
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6 mb-8 text-center shadow-[0_0_30px_rgba(249,115,22,0.1)]">
                        <h2 className="text-4xl font-black text-orange-500 uppercase tracking-widest">Sedang Dimasak</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8 auto-rows-max">
                        {preparing.length > 0 ? preparing.map((order, i) => (
                            <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
                                {/* NOMOR MEJA RAKSASA */}
                                <span className="text-yellow-400 text-6xl font-black uppercase tracking-widest mb-2 drop-shadow-md">{order.table}</span>
                                <span className="text-xl font-bold text-slate-500">Order #{order.id}</span>
                            </div>
                        )) : (
                            <div className="col-span-2 text-center text-slate-600 mt-20 text-3xl font-bold">Belum ada antrian.</div>
                        )}
                    </div>
                </div>

                {/* KANAN: SIAP AMBIL */}
                <div className="p-8 flex flex-col h-full bg-slate-900/40">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 mb-8 text-center shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                        <h2 className="text-4xl font-black text-emerald-500 uppercase tracking-widest animate-pulse">Siap Diambil / Diantar</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-8 auto-rows-max">
                        {ready.length > 0 ? ready.map((order, i) => (
                            <div key={i} className="bg-emerald-600 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-[0_0_40px_rgba(16,185,129,0.4)] border-4 border-emerald-400 scale-105">
                                {/* NOMOR MEJA SUPER RAKSASA */}
                                <span className="text-white text-7xl font-black uppercase tracking-widest mb-2 drop-shadow-xl">{order.table}</span>
                                <span className="text-2xl font-bold text-emerald-200 drop-shadow-md">Order #{order.id}</span>
                            </div>
                        )) : (
                            <div className="col-span-2 text-center text-slate-600 mt-20 text-3xl font-bold">Menunggu pesanan selesai...</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}