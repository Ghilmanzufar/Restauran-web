import React from "react";
import { Head, Link, router } from "@inertiajs/react"; //
import { CartStore } from "@/Utils/CartStore"; 
import { BiArrowBack, BiGift, BiTimeFive, BiInfoCircle, BiCheckCircle } from "react-icons/bi";
import { Toaster, toast } from "sonner"; //

// Helper Format Rupiah
const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function PromoList({ table, promos }) {
    
    // LOGIKA "PAKAI PROMO"
    const handleApplyPromo = (promo) => {
        // 1. Simpan ke LocalStorage via CartStore (Nanti kita update CartStore-nya)
        // Untuk sekarang kita simpan manual dulu biar jalan
        const promoData = {
            id: promo.id,
            name: promo.name,
            code: promo.code,
            type: promo.type,
            discount_amount: promo.discount_amount,
            max_discount: promo.max_discount,
            min_spend: promo.min_spend
        };

        // Simpan ke "Saku" (LocalStorage)
        localStorage.setItem(`active_promo_${table.table_number}`, JSON.stringify(promoData));

        toast.success("Promo Berhasil Dipasang!", {
            description: `Potongan ${promo.type === 'fixed' ? formatRupiah(promo.discount_amount) : promo.discount_amount + '%'} siap digunakan.`
        });

        // 2. Redirect balik ke Keranjang setelah 1 detik
        setTimeout(() => {
            router.visit(route('customer.cart', table.table_number));
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-800 pb-20">
            <Head title={`Promo Spesial - Meja ${table.table_number}`} />
            <Toaster position="top-center" richColors />

            {/* HEADER */}
            <header className="bg-white px-6 py-4 sticky top-0 z-50 shadow-sm flex items-center gap-4">
                <Link href={route('customer.cart', table.table_number)} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                    <BiArrowBack className="text-xl text-slate-700" />
                </Link>
                <div>
                    <h1 className="text-lg font-bold text-slate-900 leading-none">Voucher & Promo</h1>
                    <span className="text-xs text-slate-500">Pilih diskon terbaikmu!</span>
                </div>
            </header>

            <main className="p-5 space-y-4">
                {/* Banner Info */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 text-white shadow-lg mb-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="font-bold text-lg mb-1">Makan Kenyang, Dompet Tenang! 🤑</h2>
                        <p className="text-xs opacity-90">Gunakan voucher di bawah ini untuk dapat potongan harga.</p>
                    </div>
                    <BiGift className="absolute -right-4 -bottom-4 text-9xl opacity-20 rotate-12" />
                </div>

                {/* LIST PROMO */}
                {promos.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <BiGift className="text-6xl mx-auto mb-4 opacity-20" />
                        <p>Yah, belum ada promo yang tersedia saat ini.</p>
                    </div>
                ) : (
                    promos.map((promo) => (
                        <div key={promo.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative group">
                            {/* Hiasan "Bolong" ala Tiket */}
                            <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 bg-[#F8F9FA] rounded-full border-r border-gray-200"></div>
                            <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 bg-[#F8F9FA] rounded-full border-l border-gray-200"></div>

                            <div className="flex">
                                {/* KIRI: Icon & Tipe Diskon */}
                                <div className="bg-orange-50 w-24 flex flex-col items-center justify-center p-3 border-r border-dashed border-gray-200">
                                    <span className="text-2xl font-black text-orange-600">
                                        {promo.type === 'percentage' ? '%' : 'Rp'}
                                    </span>
                                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mt-1">
                                        {promo.type === 'percentage' ? 'DISKON' : 'POTONGAN'}
                                    </span>
                                </div>

                                {/* KANAN: Detail & Tombol */}
                                <div className="flex-1 p-4 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-sm">{promo.name}</h3>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{promo.description}</p>
                                        
                                        {/* Syarat Minimal */}
                                        <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400 bg-gray-50 w-fit px-2 py-1 rounded">
                                            <BiInfoCircle /> Min. Belanja {formatRupiah(promo.min_spend)}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end mt-4">
                                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                            <BiTimeFive /> Sampai {promo.end_date ? new Date(promo.end_date).toLocaleDateString('id-ID') : 'Seterusnya'}
                                        </div>
                                        
                                        <button 
                                            onClick={() => handleApplyPromo(promo)}
                                            className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-md active:scale-95 transition-transform hover:bg-slate-800"
                                        >
                                            Pakai
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
}