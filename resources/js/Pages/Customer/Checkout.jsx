import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react"; 
import { CartStore } from "@/Utils/CartStore"; 
import { 
    BiArrowBack, BiUser, BiLogoWhatsapp, BiQrScan, BiMoney, BiCheckCircle, BiLockAlt, BiSolidDiscount, BiNote
} from "react-icons/bi";
import { Toaster, toast } from "sonner"; 

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function Checkout({ table }) {
    // STATE DATA
    const [cart, setCart] = useState([]);
    const [summary, setSummary] = useState({ totalQty: 0, totalPrice: 0 });
    
    // STATE PROMO
    const [activePromo, setActivePromo] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    // STATE FORM MANUAL
    const [customerName, setCustomerName] = useState("");
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("qris");
    
    const [isSubmitting, setIsSubmitting] = useState(false); 

    // Load Cart & Promo saat pertama kali buka
    useEffect(() => {
        const cartData = CartStore.getCart(table.table_number);
        const summaryData = CartStore.getSummary(table.table_number);
        
        if (summaryData.totalQty === 0) {
            router.visit(route('customer.menu', table.table_number));
        }

        setCart(cartData);
        setSummary(summaryData);

        // Load Promo
        const storedPromo = localStorage.getItem(`active_promo_${table.table_number}`);
        if (storedPromo) {
            const promo = JSON.parse(storedPromo);
            setActivePromo(promo);
            
            // Hitung Diskon
            if (summaryData.totalPrice >= promo.min_spend) {
                let potongan = 0;
                if (promo.type === 'fixed') {
                    potongan = promo.discount_amount;
                } else {
                    potongan = summaryData.totalPrice * (promo.discount_amount / 100);
                    if (promo.max_discount && potongan > promo.max_discount) potongan = promo.max_discount;
                }
                setDiscountAmount(Math.min(potongan, summaryData.totalPrice));
            }
        }
    }, []);

    // --- HITUNG FINAL ---
    const subtotalAwal = summary.totalPrice;
    const subtotalSetelahDiskon = subtotalAwal - discountAmount;
    
    const tax = subtotalSetelahDiskon * 0.10;     // PB1 10%
    const service = subtotalSetelahDiskon * 0.05; // Service 5%
    const grandTotal = subtotalSetelahDiskon + tax + service;

    // Handler Nama (Hanya Huruf)
    const handleNameInput = (e) => {
        const value = e.target.value.replace(/[^a-zA-Z\s'.]/g, "");
        setCustomerName(value);
    }

    // Handler WA (Hanya Angka)
    const handlePhoneInput = (e) => {
         const value = e.target.value.replace(/\D/g, ""); 
         if (value.length <= 15) setWhatsappNumber(value);
    }

    const handleSubmit = () => {
        if (!customerName.trim()) {
            toast.error("Nama pemesan wajib diisi!");
            return;
        }

        const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
        if (whatsappNumber && !phoneRegex.test(whatsappNumber)) {
            toast.error("Nomor WhatsApp tidak valid!", { description: "Gunakan format 08xx atau 628xx." });
            return;
        }

        setIsSubmitting(true);

        // Transformasi Item untuk Backend
        const transformedItems = cart.map(item => ({
            product_id: item.product_id,
            qty: item.qty,
            price_at_order: item.base_price,
            total_item_price: item.total_price_per_item * item.qty,
            note: item.note,
            variants: item.selectedVariantsMap ? Object.entries(item.selectedVariantsMap).map(([variantId, itemId]) => ({
                product_variant_id: variantId,
                product_variant_item_id: itemId
            })) : []
        }));

        // PAYLOAD LENGKAP
        const orderPayload = {
            customer_name: customerName,
            whatsapp_number: whatsappNumber,
            payment_method: paymentMethod,
            total_price: grandTotal, 
            items: transformedItems,
            promo_id: activePromo ? activePromo.id : null 
        };

        // KIRIM KE SERVER
        router.post(route('customer.store', table.table_number), orderPayload, {
            onSuccess: () => {
                CartStore.clearCart(table.table_number);
                localStorage.removeItem(`active_promo_${table.table_number}`); 
                toast.success("Pesanan Berhasil!");
            },
            onError: (err) => {
                console.error("Error Order:", err);

                // --- LOGIC PERBAIKAN ERROR PROMO ---
                if (err.promo_id) {
                    toast.error("Maaf, promo tidak valid/kadaluarsa.", {
                        description: "Sistem melepas promo otomatis. Silakan coba lagi."
                    });
                    // Hapus promo busuk dari saku
                    localStorage.removeItem(`active_promo_${table.table_number}`);
                    setActivePromo(null);
                    setDiscountAmount(0);
                } 
                else if (err.msg) toast.error(err.msg);
                else if (err.items) toast.error("Ada masalah pada menu yang dipilih."); 
                else toast.error("Terjadi kesalahan, coba lagi.");
                
                setIsSubmitting(false);
            },
            onFinish: () => setIsSubmitting(false)
        });
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-800 pb-32">
            <Head title={`Checkout - Meja ${table.table_number}`} />
            <Toaster position="top-center" richColors />

            <header className="bg-white px-6 py-4 sticky top-0 z-50 shadow-sm flex items-center gap-4">
                <button onClick={() => window.history.back()} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                    <BiArrowBack className="text-xl text-slate-700" />
                </button>
                <h1 className="text-lg font-bold text-slate-900">Konfirmasi Pesanan</h1>
            </header>

            <main className="p-6 space-y-6">
                {/* 1. FORM DATA DIRI */}
                <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Data Pemesan</h2>
                    <div>
                        <div className="relative">
                            <BiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                            <input 
                                type="text" placeholder="Nama Kamu (Wajib)" 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:border-slate-900 transition-all"
                                value={customerName}
                                onChange={handleNameInput}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="relative">
                            <BiLogoWhatsapp className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 text-lg" />
                            <input 
                                type="tel" placeholder="WhatsApp (08xxxxx)" 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:border-green-500 transition-all"
                                value={whatsappNumber}
                                onChange={handlePhoneInput} 
                            />
                        </div>
                    </div>
                </section>

                {/* 2. RINGKASAN MENU */}
                <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4">Ringkasan Menu</h2>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                        {cart.map((item, index) => (
                            <div key={index} className="flex justify-between items-start text-sm pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                <div className="flex gap-3 overflow-hidden">
                                    <span className="font-bold text-slate-500 shrink-0">{item.qty}x</span>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-800 line-clamp-2 leading-tight">
                                            {item.name}
                                        </span>
                                        {item.variants && item.variants.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {item.variants.map((v, idx) => (
                                                    <span key={idx} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                                        {v.item_name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {item.note && (
                                            <span className="text-[10px] text-orange-600 italic mt-1 flex items-start gap-1">
                                               <BiNote className="shrink-0 translate-y-[2px]" /> "{item.note}"
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className="font-semibold text-slate-700 shrink-0 pl-2">
                                    {formatRupiah(item.total_price_per_item * item.qty)}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. RINCIAN BIAYA */}
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h2 className="text-sm font-bold text-slate-900 mb-4">Rincian Biaya</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-gray-500">
                            <span>Subtotal ({summary.totalQty} item)</span>
                            <span>{formatRupiah(subtotalAwal)}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between text-green-600 font-bold bg-green-50 p-2 rounded-lg">
                                <span className="flex items-center gap-1"><BiSolidDiscount /> Promo: {activePromo.name}</span>
                                <span>- {formatRupiah(discountAmount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-gray-500">
                            <span>PB1 (Pajak 10%)</span>
                            <span>{formatRupiah(tax)}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                            <span>Service Charge (5%)</span>
                            <span>{formatRupiah(service)}</span>
                        </div>
                        <div className="h-[1px] bg-dashed bg-gray-200 my-2"></div>
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800 text-lg">Total Akhir</span>
                            <span className="font-black text-slate-900 text-xl">{formatRupiah(grandTotal)}</span>
                        </div>
                    </div>
                </section>

                {/* 4. PEMBAYARAN */}
                <section>
                    <h2 className="text-sm font-bold text-slate-500 mb-3 px-1 uppercase tracking-wider">Pilih Pembayaran</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => setPaymentMethod('qris')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 relative ${paymentMethod === 'qris' ? 'border-slate-900 bg-slate-900 text-white' : 'border-gray-200 bg-white text-gray-400'}`}>
                            <BiQrScan className="text-2xl" />
                            <span className="text-xs font-bold">QRIS</span>
                            {paymentMethod === 'qris' && <BiCheckCircle className="absolute top-2 right-2 text-white" />}
                        </button>
                        <button type="button" onClick={() => setPaymentMethod('cashier')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 relative ${paymentMethod === 'cashier' ? 'border-slate-900 bg-slate-900 text-white' : 'border-gray-200 bg-white text-gray-400'}`}>
                            <BiMoney className="text-2xl" />
                            <span className="text-xs font-bold">Kasir</span>
                            {paymentMethod === 'cashier' && <BiCheckCircle className="absolute top-2 right-2 text-white" />}
                        </button>
                    </div>
                </section>
                
                <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 pt-4">
                    <BiLockAlt /> Data kamu aman dan terenkripsi.
                </div>
            </main>

            <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-4 z-50 shadow-[0_-5px_30px_rgba(0,0,0,0.1)]">
                <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || cart.length === 0}
                    className={`w-full bg-slate-900 text-white p-4 rounded-xl font-bold text-lg shadow-xl shadow-slate-900/20 active:scale-95 transition-transform flex items-center justify-center gap-2 ${isSubmitting ? 'cursor-wait opacity-80' : ''}`}
                >
                    {isSubmitting ? "Memproses..." : (
                        <>
                            <span>Konfirmasi Order</span>
                            <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-sm font-bold">{formatRupiah(grandTotal)}</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}