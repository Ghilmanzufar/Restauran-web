import React from "react";
import { Head, Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import { BiRightArrowAlt } from "react-icons/bi";

export default function WelcomeFixed({ table }) {
    return (
        <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans flex flex-col relative overflow-hidden">
            <Head title={`Meja ${table.table_number}`} />

            {/* --- 1. DEKORASI BACKGROUND (Aman di belakang layar) --- */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-[10%] -right-[10%] w-[50vh] h-[50vh] bg-orange-200/40 rounded-full blur-[80px]"></div>
                <div className="absolute -bottom-[10%] -left-[10%] w-[50vh] h-[50vh] bg-blue-200/40 rounded-full blur-[80px]"></div>
            </div>

            {/* --- 2. KONTEN UTAMA (Menggunakan GAP agar tidak numpuk) --- */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 gap-10">
                
                {/* A. HERO IMAGE (Lingkaran Besar + Foto Makanan) */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="relative"
                >
                    {/* Lingkaran Putih Pembungkus */}
                    <div className="w-48 h-48 bg-white rounded-full shadow-2xl shadow-orange-500/20 flex items-center justify-center p-2 border-4 border-white relative z-10">
                        {/* GANTI EMOJI DENGAN GAMBAR ASLI BIAR BAGUS */}
                        <img 
                            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80" 
                            alt="Burger"
                            className="w-full h-full object-cover rounded-full"
                        />
                    </div>

                    {/* Badge Nomor Meja (Floating Pill) */}
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20"
                    >
                        <div className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold text-xl shadow-lg border-4 border-[#F8F9FA] whitespace-nowrap">
                            Meja {table.table_number}
                        </div>
                    </motion.div>

                    {/* Hiasan Orbit (Opsional) */}
                    <div className="absolute inset-0 border-2 border-dashed border-orange-300 rounded-full animate-spin-slow z-0 scale-110 opacity-50"></div>
                </motion.div>

                {/* B. TEKS SAPAAN (Pasti Rapi karena pakai Gap) */}
                <div className="text-center space-y-3 max-w-xs mx-auto z-10">
                    <motion.h1 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-black text-slate-800 leading-tight"
                    >
                        Perut Kenyang,<br />
                        <span className="text-orange-500">Hati Senang!</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-slate-400 text-sm leading-relaxed"
                    >
                        Scan berhasil. Silakan pilih menu favoritmu dan pesan langsung dari sini.
                    </motion.p>
                </div>

                {/* C. TOMBOL AKSI */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="w-full max-w-xs z-10"
                >
                    <Link href={route('customer.menu', table.table_number)} className="block w-full">
                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-4 rounded-2xl shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2 transition-all"
                        >
                            Lihat Menu
                            <BiRightArrowAlt className="text-2xl" />
                        </motion.button>
                    </Link>
                </motion.div>

            </main>

            {/* Footer Kecil */}
            <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] text-slate-300">
                Restoran Kenangan App © 2024
            </div>
        </div>
    );
}