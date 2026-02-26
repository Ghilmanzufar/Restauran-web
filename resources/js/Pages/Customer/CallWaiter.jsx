import React from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import { Toaster, toast } from "sonner";
import { BiUserVoice, BiRestaurant, BiDish, BiNote, BiArrowBack, BiSend, BiMessageDetail } from "react-icons/bi";
import { motion } from "framer-motion";

export default function CallWaiter({ tableNumber }) {
    const { data, setData, post, processing, reset } = useForm({
        type: '',
        notes: ''
    });

    // Opsi Bantuan (Desain Baru)
    const options = [
        { id: 'call_staff', label: 'Panggil Staff', icon: <BiUserVoice />, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'request_bill', label: 'Minta Bill', icon: <BiNote />, color: 'text-green-500', bg: 'bg-green-50' },
        { id: 'missing_cutlery', label: 'Alat Makan', icon: <BiRestaurant />, color: 'text-orange-500', bg: 'bg-orange-50' },
        { id: 'cleanup', label: 'Bersihkan Meja', icon: <BiDish />, color: 'text-purple-500', bg: 'bg-purple-50' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!data.type) {
            toast.error("Pilih salah satu bantuan dulu ya!", { position: 'top-center' });
            return;
        }

        post(route('customer.call.store', tableNumber), {
            onSuccess: () => {
                toast.success("Permintaan terkirim! Staff segera datang.", { position: 'top-center' });
                reset();
            },
            onError: (err) => {
                const msg = err.message || "Gagal mengirim permintaan.";
                toast.error(msg, { position: 'top-center' });
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-800 pb-10">
            <Head title={`Panggil Pelayan - Meja ${tableNumber}`} />
            <Toaster richColors />

            {/* Header Modern */}
            <header className="bg-white p-5 sticky top-0 z-10 shadow-[0_2px_15px_rgba(0,0,0,0.05)] flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={route('customer.menu', tableNumber)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors -ml-2 text-slate-500">
                        <BiArrowBack className="text-2xl" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-extrabold text-slate-900 leading-none">Butuh Bantuan?</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Meja {tableNumber}</p>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-md mx-auto space-y-8">
                
                {/* Hero Section Kecil */}
                <div className="text-center py-2">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-sm mb-4 text-4xl text-slate-900 border border-gray-100">
                        <BiUserVoice />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Apa yang bisa kami bantu?</h2>
                    <p className="text-sm text-gray-500">Pilih salah satu menu di bawah ini.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Grid Pilihan (Style Baru) */}
                    <div className="grid grid-cols-2 gap-4">
                        {options.map((opt) => (
                            <motion.button
                                key={opt.id}
                                type="button"
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setData('type', opt.id)}
                                className={`relative p-5 rounded-2xl border transition-all duration-200 flex flex-col items-center text-center gap-3 ${
                                    data.type === opt.id 
                                    ? 'border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-900/20' 
                                    : 'border-transparent bg-white shadow-sm hover:shadow-md text-slate-600'
                                }`}
                            >
                                {/* Icon */}
                                <div className={`text-3xl p-3 rounded-full ${data.type === opt.id ? 'bg-white/10 text-white' : `${opt.bg} ${opt.color}`}`}>
                                    {opt.icon}
                                </div>
                                {/* Label */}
                                <span className={`font-bold text-sm ${data.type === opt.id ? 'text-white' : 'text-slate-700'}`}>
                                    {opt.label}
                                </span>
                                
                                {/* Indikator Selected */}
                                {data.type === opt.id && (
                                    <div className="absolute top-3 right-3 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                                )}
                            </motion.button>
                        ))}
                    </div>

                    {/* Catatan Tambahan (Style Baru) */}
                    <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 focus-within:ring-2 focus-within:ring-slate-900/10 transition-all">
                        <div className="flex items-center gap-3 border-b border-gray-100 p-3">
                            <BiMessageDetail className="text-gray-400 text-lg" />
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Pesan Tambahan</span>
                        </div>
                        <textarea
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            placeholder="Contoh: Minta tambah sambal atau tisu..."
                            className="w-full border-none rounded-b-xl text-sm focus:ring-0 text-slate-800 placeholder:text-gray-300 min-h-[100px] p-3 resize-none"
                        ></textarea>
                    </div>

                    {/* Tombol Kirim (Floating Style) */}
                    <div className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-5 z-50">
                        <button
                            type="submit"
                            disabled={processing || !data.type}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 transition-all ${
                                processing || !data.type
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                : 'bg-slate-900 text-white shadow-slate-900/20 active:scale-95'
                            }`}
                        >
                            {processing ? "Mengirim..." : (
                                <>
                                    <BiSend /> Panggil Sekarang
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}