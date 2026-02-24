import React, { useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { 
    BiTimeFive, BiCheckCircle, BiDish, BiRestaurant, BiReceipt, BiRefresh, BiArrowBack, BiHistory, BiSolidDiscount, BiShareAlt
} from "react-icons/bi";
import { Toaster, toast } from "sonner"; 

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function OrderStatus({ table, order }) { 
    
    // Auto Refresh Partial
    useEffect(() => {
        if (order.order_status !== 'completed' && order.order_status !== 'cancelled') {
            const interval = setInterval(() => {
                router.reload({ only: ['order'] });
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [order.order_status]);

    const currentStatus = order.order_status;
    
    // Logic Steps UI
    const steps = [
        { key: 'new', title: 'Pesanan Diterima', desc: 'Dapur sedang mengecek pesananmu.', icon: <BiReceipt /> },
        { key: 'processing', title: 'Sedang Dimasak', desc: 'Koki kami sedang beraksi! 👨‍🍳', icon: <BiDish /> },
        { key: 'ready', title: 'Siap Disajikan', desc: 'Makanan sedang diantar ke mejamu.', icon: <BiRestaurant /> },
        { key: 'completed', title: 'Selamat Menikmati', desc: 'Terima kasih sudah makan di sini.', icon: <BiCheckCircle /> },
    ];
    let activeStepIndex = steps.findIndex(s => s.key === currentStatus);
    if (activeStepIndex === -1 && currentStatus === 'pending') activeStepIndex = 0;
    if (activeStepIndex === -1) activeStepIndex = 0;

    // --- HITUNG RINCIAN ---
    const subtotal = order.items.reduce((acc, item) => acc + parseFloat(item.total_price), 0);
    // Pajak & Service dihitung dari Subtotal Awal (Gross) agar kita bisa menemukan selisih diskon
    // (Asumsi: Diskon memotong Total Akhir)
    // Tapi karena di Checkout kita hitung Pajak SETELAH diskon, kita harus sesuaikan logika display.
    
    // Trik Menemukan Diskon:
    // Total Bayar (DB) = (Subtotal - Diskon) + Tax + Service
    // Jadi untuk display yang akurat tanpa pusing, kita pakai data dari PromoUsage jika ada.
    
    let discountAmount = 0;
    let promoName = "";

    if (order.promo_usage) {
        // Jika ada data promo dari backend
        discountAmount = parseFloat(order.promo_usage.discount_value);
        promoName = order.promo_usage.promo?.name || "Promo Spesial";
        
        // FALLBACK: Jika di DB tersimpan 0 (karena bug lama), kita hitung manual selisihnya
        if (discountAmount === 0) {
             // Hitung Gross seharusnya
             const grossTax = subtotal * 0.10; // Ini estimasi kasar
             const grossService = subtotal * 0.05;
             const estimatedTotal = subtotal + grossTax + grossService;
             
             // Selisih = Diskon
             const diff = estimatedTotal - parseFloat(order.total_price);
             if (diff > 100) { // Toleransi pembulatan
                 discountAmount = diff; // Pakai hasil hitungan manual
             }
        }
    }
    
    // Tampilan Pajak & Service mengikuti proporsi Total Bayar (agar struk valid secara matematika ke bawah)
    // Atau tampilkan apa adanya. Di sini saya pakai metode "Reverse Engineer" dari Total Bayar
    // Agar Total Akhir === Total di DB.
    
    // Rumus Balik: Total = (Subtotal - Diskon) * 1.15
    // Maka (Subtotal - Diskon) = Total / 1.15
    const netBase = parseFloat(order.total_price) / 1.15;
    const tax = netBase * 0.10;
    const service = netBase * 0.05;

    // FUNGSI SHARE
    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url)
            .then(() => toast.success('Link Berhasil Disalin!'))
            .catch(() => toast.error('Gagal menyalin link'));
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-800 pb-40">
            <Head title={`Detail Pesanan - Meja ${table.table_number}`} />
            <Toaster position="top-center" richColors />

            {/* HEADER */}
            <header className="bg-white px-6 py-4 sticky top-0 z-50 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href={route('customer.history', table.table_number)} className="text-slate-500 w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                        <BiArrowBack className="text-xl" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 leading-none">Detail Status</h1>
                        <span className="text-xs text-slate-500">#{order.id.substring(0,8).toUpperCase()}</span>
                    </div>
                </div>
                 <button onClick={handleShare} className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-2 rounded-full text-xs font-bold active:scale-95 transition-transform hover:bg-slate-200">
                    <BiShareAlt className="text-lg" /> Share
                </button>
            </header>

            <main className="p-6 space-y-8">
                {/* HERO ANIMASI */}
                <div className="flex flex-col items-center justify-center pt-4">
                    <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className={`absolute inset-0 rounded-full blur-xl ${currentStatus === 'completed' ? 'bg-green-400' : 'bg-orange-400'}`}
                        ></motion.div>
                        <motion.div 
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className={`relative w-32 h-32 rounded-full flex items-center justify-center text-5xl text-white shadow-2xl z-10 ${currentStatus === 'completed' ? 'bg-green-500' : 'bg-slate-900'}`}
                        >
                            {steps[activeStepIndex].icon}
                        </motion.div>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 text-center">{steps[activeStepIndex].title}</h2>
                    <p className="text-slate-500 text-sm text-center mt-2 max-w-[250px]">{steps[activeStepIndex].desc}</p>
                </div>

                {/* STRUK RINCIAN */}
                <section className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative">
                    <div className="bg-slate-900 h-2 w-full"></div>
                    <div className="p-5">
                        <div className="space-y-3 mb-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between items-start text-sm">
                                    <div className="flex gap-2 overflow-hidden">
                                        <span className="font-bold text-slate-700 shrink-0">{item.qty}x</span>
                                        <div className="flex flex-col">
                                            <p className="text-slate-600 font-bold leading-tight">{item.product.name}</p>
                                            {item.variants?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-0.5">
                                                    {item.variants.map((v, i) => (
                                                        <span key={i} className="text-[10px] text-slate-400 bg-gray-50 px-1 rounded">{v.item_name}</span>
                                                    ))}
                                                </div>
                                            )}
                                            {item.note && <p className="text-[10px] text-orange-500 italic">"{item.note}"</p>}
                                        </div>
                                    </div>
                                    <span className="font-medium text-slate-900 shrink-0">{formatRupiah(item.total_price)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-dashed border-gray-200 my-3"></div>
                        <div className="space-y-1 mb-3">
                            <div className="flex justify-between text-xs text-gray-500"><span>Subtotal</span><span>{formatRupiah(subtotal)}</span></div>
                            
                            {/* --- BARIS DISKON (MUNCUL JIKA ADA) --- */}
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-xs text-green-600 font-bold">
                                    <span className="flex items-center gap-1"><BiSolidDiscount/> {promoName || "Diskon Promo"}</span>
                                    <span>- {formatRupiah(discountAmount)}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-xs text-gray-500"><span>PB1 (10%)</span><span>{formatRupiah(tax)}</span></div>
                            <div className="flex justify-between text-xs text-gray-500"><span>Service (5%)</span><span>{formatRupiah(service)}</span></div>
                        </div>
                        <div className="border-t border-gray-100 pt-3 flex justify-between items-end">
                            <span className="text-xs text-slate-500 font-bold">Total Pembayaran</span>
                            <span className="text-lg font-black text-slate-900">{formatRupiah(order.total_price)}</span>
                        </div>
                    </div>
                </section>
            </main>

            {/* ACTION: KEMBALI KE MENU */}
            <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-5 z-40 shadow-[0_-5px_30px_rgba(0,0,0,0.1)]">
                 <Link href={route('customer.menu', table.table_number)}>
                    <button className="w-full h-16 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-slate-800">
                        Pesan Lagi
                    </button>
                </Link>
            </div>
        </div>
    );
}