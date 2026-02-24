import React, { useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { Toaster } from "sonner"; 

// IMPORT KOMPONEN BARU
import StatusHeader from "@/Components/Customer/OrderStatus/StatusHeader";
import StatusHero from "@/Components/Customer/OrderStatus/StatusHero";
import ReceiptList from "@/Components/Customer/OrderStatus/ReceiptList";
import ReceiptSummary from "@/Components/Customer/OrderStatus/ReceiptSummary";

export default function OrderStatus({ table, order }) { 
    
    // Logic Auto Refresh
    useEffect(() => {
        if (order.order_status !== 'completed' && order.order_status !== 'cancelled') {
            const interval = setInterval(() => {
                router.reload({ only: ['order'] });
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [order.order_status]);

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-800 pb-40">
            <Head title={`Detail Pesanan - Meja ${table.table_number}`} />
            <Toaster position="top-center" richColors />

            {/* 1. Header */}
            <StatusHeader tableNumber={table.table_number} orderId={order.id} />

            <main className="p-6 space-y-8">
                {/* 2. Hero Animation */}
                <StatusHero status={order.order_status} />

                {/* 3. Struk Digital (Receipt) */}
                <section className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative">
                    <div className="bg-slate-900 h-2 w-full"></div>
                    <div className="p-5">
                        <ReceiptList items={order.items} />
                        <ReceiptSummary order={order} />
                    </div>
                </section>
            </main>

            {/* 4. Footer Action */}
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