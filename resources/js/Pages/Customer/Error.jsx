import React from 'react';
import { Head } from '@inertiajs/react';
import { BiErrorCircle, BiScan, BiRefresh } from 'react-icons/bi';

export default function Error({ status, message }) {
    // 1. Mapping Pesan Error agar lebih "Manusiawi"
    const content = {
        404: {
            title: "Halaman Tidak Ditemukan",
            desc: "Waduh, sepertinya link yang kamu tuju salah atau sudah kadaluarsa.",
        },
        403: {
            title: "Akses Ditolak",
            desc: "Maaf, kamu tidak memiliki izin untuk masuk ke sini.",
        },
        500: {
            title: "Gangguan Server",
            desc: "Server kami sedang ngambek. Koki IT kami sedang memperbaikinya! 👨‍🍳",
        },
        503: {
            title: "Sedang Pemeliharaan",
            desc: "Sistem sedang diupdate untuk pelayanan yang lebih baik. Tunggu sebentar ya.",
        },
        default: {
            title: "Ups, Ada Masalah",
            desc: message || "Terjadi kesalahan yang tidak terduga. Silakan coba lagi.",
        }
    };

    // Ambil info berdasarkan status, atau pakai default
    const info = content[status] || content.default;

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center font-sans text-slate-800">
            <Head title={info.title} />
            
            {/* Ilustrasi Icon */}
            <div className="w-28 h-28 bg-red-50 rounded-full flex items-center justify-center mb-6 text-6xl text-red-500 shadow-sm border border-red-100">
                <BiErrorCircle />
            </div>

            {/* Teks Error */}
            <h1 className="text-2xl font-black text-slate-900 mb-2">{info.title}</h1>
            <p className="text-slate-500 text-sm mb-8 max-w-[280px] leading-relaxed">
                {info.desc}
            </p>

            {/* Tombol Aksi */}
            <div className="space-y-3 w-full max-w-[250px]">
                {/* Tombol Reload */}
                <button 
                    onClick={() => window.location.reload()} 
                    className="w-full bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-slate-900/20 active:scale-95 transition-transform flex items-center justify-center gap-2 hover:bg-slate-800"
                >
                    <BiRefresh className="text-xl" /> Coba Muat Ulang
                </button>

                {/* Tombol Scan Ulang (Opsional, jika user bingung) */}
                <p className="text-xs text-slate-400 mt-4">
                    Masih bermasalah? Coba <span className="font-bold text-slate-600">Scan Ulang QR Code</span> di mejamu.
                </p>
            </div>
        </div>
    );
}