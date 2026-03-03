import React, { useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { BiBell, BiCheckCircle, BiUserVoice, BiNote, BiRestaurant, BiDish, BiTimeFive } from "react-icons/bi";
import { Toaster, toast } from "sonner";

// Helper untuk menampilkan Ikon & Warna sesuai tipe panggilan
const getCallConfig = (type) => {
    const config = {
        'call_staff': { icon: <BiUserVoice />, color: 'text-blue-600 bg-blue-100', label: 'Panggil Staff' },
        'request_bill': { icon: <BiNote />, color: 'text-green-600 bg-green-100', label: 'Minta Bill' },
        'missing_cutlery': { icon: <BiRestaurant />, color: 'text-orange-600 bg-orange-100', label: 'Alat Makan' },
        'cleanup': { icon: <BiDish />, color: 'text-purple-600 bg-purple-100', label: 'Bersihkan Meja' },
    };
    return config[type] || { icon: <BiBell />, color: 'text-gray-600 bg-gray-100', label: 'Lainnya' };
};

export default function ServiceCallIndex({ calls }) {
    
    // Fitur Auto-Refresh: Ambil data terbaru dari server setiap 5 detik
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['calls'], preserveState: true, preserveScroll: true });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleResolve = (id) => {
        router.post(route('admin.service-calls.resolve', id), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Panggilan telah diselesaikan!')
        });
    };

    return (
        <AdminLayout title="Panggilan Pelanggan">
            <Head title="Panggilan Pelanggan" />
            <Toaster position="top-center" richColors />

            <div className="mb-8">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <BiBell className="text-red-500 text-2xl animate-pulse" /> Permintaan Bantuan
                </h2>
                <p className="text-sm font-semibold text-gray-500 mt-1">Daftar meja yang membutuhkan layanan staf. Halaman ini akan update otomatis.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {calls.length === 0 ? (
                    <div className="col-span-full py-20 text-center flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 border-dashed">
                        <BiCheckCircle className="text-6xl text-emerald-400 mb-4 opacity-50" />
                        <h3 className="text-lg font-bold text-slate-700">Semua Terkendali!</h3>
                        <p className="text-gray-400 font-medium">Belum ada panggilan baru dari pelanggan.</p>
                    </div>
                ) : (
                    calls.map((call) => {
                        const conf = getCallConfig(call.type);
                        // Hitung berapa menit yang lalu
                        const minutesAgo = Math.floor((new Date() - new Date(call.created_at)) / 60000);

                        return (
                            <div key={call.id} className="bg-white rounded-3xl p-5 shadow-sm border border-red-100 relative overflow-hidden flex flex-col">
                                {/* Efek Garis Merah jika sudah menunggu lama (> 5 menit) */}
                                {minutesAgo > 5 && <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>}
                                
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Nomor Meja</span>
                                        <span className="text-4xl font-black text-slate-900 leading-none">{call.table_number}</span>
                                    </div>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${conf.color}`}>
                                        {conf.icon}
                                    </div>
                                </div>

                                <div className="mb-4 flex-1">
                                    <h3 className="font-bold text-slate-800 text-lg">{conf.label}</h3>
                                    {call.notes && (
                                        <div className="mt-2 bg-yellow-50 text-yellow-800 p-3 rounded-xl text-sm font-medium border border-yellow-100">
                                            "{call.notes}"
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                                    <div className={`flex items-center gap-1.5 text-xs font-bold ${minutesAgo > 5 ? 'text-red-500' : 'text-gray-400'}`}>
                                        <BiTimeFive className="text-base" /> {minutesAgo} menit lalu
                                    </div>
                                    <button 
                                        onClick={() => handleResolve(call.id)}
                                        className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-all flex items-center gap-2"
                                    >
                                        <BiCheckCircle /> Selesai
                                    </button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </AdminLayout>
    );
}