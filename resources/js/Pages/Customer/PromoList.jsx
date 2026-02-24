import React, { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import { Toaster, toast } from "sonner";
import { CartStore } from "@/Utils/CartStore"; // <--- IMPORT CART STORE

// IMPORT KOMPONEN BARU
import PromoHeader from "@/Components/Customer/PromoList/PromoHeader";
import PromoBanner from "@/Components/Customer/PromoList/PromoBanner";
import PromoCard from "@/Components/Customer/PromoList/PromoCard";
import EmptyPromo from "@/Components/Customer/PromoList/EmptyPromo";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function PromoList({ table, promos }) {
    
    // State untuk menyimpan total belanja keranjang
    const [cartTotal, setCartTotal] = useState(0);

    // Ambil data keranjang saat halaman dibuka
    useEffect(() => {
        const summary = CartStore.getSummary(table.table_number);
        setCartTotal(summary.totalPrice);
    }, []);

    // LOGIKA "PAKAI PROMO"
    const handleApplyPromo = (promo) => {
        // Validasi Double Check (Keamanan Tambahan)
        if (cartTotal < promo.min_spend) {
            toast.error("Syarat belum terpenuhi!", {
                description: `Minimal belanja ${formatRupiah(promo.min_spend)} untuk promo ini.`
            });
            return;
        }

        const promoData = {
            id: promo.id,
            name: promo.name,
            code: promo.code,
            type: promo.type,
            discount_amount: promo.discount_amount,
            max_discount: promo.max_discount,
            min_spend: promo.min_spend
        };

        localStorage.setItem(`active_promo_${table.table_number}`, JSON.stringify(promoData));

        toast.success("Promo Berhasil Dipasang!", {
            description: `Potongan ${promo.type === 'fixed' ? formatRupiah(promo.discount_amount) : promo.discount_amount + '%'} siap digunakan.`
        });

        setTimeout(() => {
            router.visit(route('customer.cart', table.table_number));
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-800 pb-20">
            <Head title={`Promo Spesial - Meja ${table.table_number}`} />
            <Toaster position="top-center" richColors />

            <PromoHeader tableNumber={table.table_number} />

            <main className="p-5 space-y-4">
                <PromoBanner />

                {promos.length === 0 ? (
                    <EmptyPromo />
                ) : (
                    promos.map((promo) => (
                        <PromoCard 
                            key={promo.id} 
                            promo={promo} 
                            cartTotal={cartTotal} // <--- KIRIM TOTAL BELANJA KE COMPONENT
                            onApply={handleApplyPromo} 
                        />
                    ))
                )}
            </main>
        </div>
    );
}