import React from "react";
import { Head, router } from "@inertiajs/react";
import { Toaster, toast } from "sonner";

// IMPORT KOMPONEN BARU
import PromoHeader from "@/Components/Customer/PromoList/PromoHeader";
import PromoBanner from "@/Components/Customer/PromoList/PromoBanner";
import PromoCard from "@/Components/Customer/PromoList/PromoCard";
import EmptyPromo from "@/Components/Customer/PromoList/EmptyPromo";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function PromoList({ table, promos }) {
    
    // LOGIKA "PAKAI PROMO"
    const handleApplyPromo = (promo) => {
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

        // Redirect balik ke Keranjang setelah 1 detik
        setTimeout(() => {
            router.visit(route('customer.cart', table.table_number));
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-800 pb-20">
            <Head title={`Promo Spesial - Meja ${table.table_number}`} />
            <Toaster position="top-center" richColors />

            {/* 1. Header */}
            <PromoHeader tableNumber={table.table_number} />

            <main className="p-5 space-y-4">
                {/* 2. Banner Info */}
                <PromoBanner />

                {/* 3. List Promo */}
                {promos.length === 0 ? (
                    <EmptyPromo />
                ) : (
                    promos.map((promo) => (
                        <PromoCard 
                            key={promo.id} 
                            promo={promo} 
                            onApply={handleApplyPromo} 
                        />
                    ))
                )}
            </main>
        </div>
    );
}