import React, { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import { CartStore } from "@/Utils/CartStore"; 
import { BiArrowBack, BiLockAlt } from "react-icons/bi";
import { Toaster, toast } from "sonner"; 

// IMPORT KOMPONEN DARI FOLDER BARU
import CustomerForm from "@/Components/Customer/Checkout/CustomerForm";
import OrderItems from "@/Components/Customer/Checkout/OrderItems";
import BillDetails from "@/Components/Customer/Checkout/BillDetails";
import PaymentMethod from "@/Components/Customer/Checkout/PaymentMethod";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function Checkout({ table }) {
    // --- 1. STATE MANAGEMENT ---
    const [cart, setCart] = useState([]);
    const [summary, setSummary] = useState({ totalQty: 0, totalPrice: 0 });
    const [activePromo, setActivePromo] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    
    // Form State
    const [customerName, setCustomerName] = useState("");
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cashier");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Error State (untuk validasi manual)
    const [errors, setErrors] = useState({});

    // --- 2. LOAD DATA ---
    useEffect(() => {
        const cartData = CartStore.getCart(table.table_number);
        const summaryData = CartStore.getSummary(table.table_number);
        
        if (summaryData.totalQty === 0) {
            router.visit(route('customer.menu', table.table_number));
        }

        setCart(cartData);
        setSummary(summaryData);

        const storedPromo = localStorage.getItem(`active_promo_${table.table_number}`);
        if (storedPromo) {
            const promo = JSON.parse(storedPromo);
            setActivePromo(promo);
            
            if (summaryData.totalPrice >= promo.min_spend) {
                let potongan = promo.type === 'fixed' ? promo.discount_amount : summaryData.totalPrice * (promo.discount_amount / 100);
                if (promo.max_discount && potongan > promo.max_discount) potongan = promo.max_discount;
                setDiscountAmount(Math.min(potongan, summaryData.totalPrice));
            }
        }
    }, []);

    // --- 3. CALCULATIONS ---
    const subtotalAfterDiscount = summary.totalPrice - discountAmount;
    const tax = subtotalAfterDiscount * 0.10;
    const service = subtotalAfterDiscount * 0.05;
    const grandTotal = subtotalAfterDiscount + tax + service;

    // --- 4. HANDLERS ---
    const handleSubmit = () => {
        // Validasi Manual Sederhana
        let newErrors = {};
        if (!customerName.trim()) newErrors.customer_name = "Nama wajib diisi!";
        
        const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
        if (whatsappNumber && !phoneRegex.test(whatsappNumber)) newErrors.whatsapp_number = "Format nomor salah (08xx/628xx)";
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Mohon lengkapi data pemesan.");
            return;
        }

        setIsSubmitting(true);

        const orderPayload = {
            customer_name: customerName,
            whatsapp_number: whatsappNumber,
            payment_method: paymentMethod,
            total_price: grandTotal, 
            items: cart.map(item => ({
                product_id: item.product_id, qty: item.qty, price_at_order: item.base_price, total_item_price: item.total_price_per_item * item.qty, note: item.note,
                variants: item.selectedVariantsMap ? Object.entries(item.selectedVariantsMap).map(([vId, iId]) => ({ product_variant_id: vId, product_variant_item_id: iId })) : []
            })),
            promo_id: activePromo ? activePromo.id : null 
        };

        router.post(route('customer.store', table.table_number), orderPayload, {
            onSuccess: () => {
                CartStore.clearCart(table.table_number);
                localStorage.removeItem(`active_promo_${table.table_number}`); 
                toast.success("Pesanan Berhasil!");
            },
            onError: (err) => {
                // --- DEBUGGING START ---
                console.error("🔥 ERROR DARI SERVER:", err); // Cek Console (F12)
                
                // Tampilkan pesan error spesifik di layar
                // Kita gabungkan semua pesan error jadi satu string
                const errorMessage = Object.values(err).flat().join(', ');
                toast.error("Gagal: " + errorMessage);
                // --- DEBUGGING END ---

                if (err.promo_id) {
                    localStorage.removeItem(`active_promo_${table.table_number}`);
                    setActivePromo(null); 
                    setDiscountAmount(0);
                }
                
                setIsSubmitting(false);
            },
            onFinish: () => setIsSubmitting(false)
        });
    };

    // --- 5. RENDER UTAMA (BERSIH & RAPI) ---
    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-800 pb-32">
            <Head title={`Checkout - Meja ${table.table_number}`} />
            <Toaster position="top-center" richColors />

            {/* Header */}
            <header className="bg-white px-6 py-4 sticky top-0 z-50 shadow-sm flex items-center gap-4">
                <button onClick={() => window.history.back()} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                    <BiArrowBack className="text-xl text-slate-700" />
                </button>
                <h1 className="text-lg font-bold text-slate-900">Konfirmasi Pesanan</h1>
            </header>

            <main className="p-6 space-y-6">
                {/* Komponen Data Diri */}
                <CustomerForm 
                    data={{ customer_name: customerName, whatsapp_number: whatsappNumber }}
                    onChangeName={(e) => setCustomerName(e.target.value.replace(/[^a-zA-Z\s'.]/g, ""))}
                    onChangePhone={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, "").slice(0, 15))}
                    errors={errors}
                />

                {/* Komponen Ringkasan Item */}
                <OrderItems cart={cart} />

                {/* Komponen Hitungan Biaya */}
                <BillDetails 
                    summary={summary} 
                    discountAmount={discountAmount} 
                    activePromo={activePromo} 
                    tax={tax} 
                    service={service} 
                    grandTotal={grandTotal} 
                />

                {/* Komponen Pembayaran */}
                <PaymentMethod selected={paymentMethod} onSelect={setPaymentMethod} />
                
                <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 pt-4">
                    <BiLockAlt /> Data kamu aman dan terenkripsi.
                </div>
            </main>

            {/* Bottom Button */}
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