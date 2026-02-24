import React, { useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import { Toaster } from "sonner";

// IMPORT KOMPONEN BARU
import HistoryHeader from "@/Components/Customer/OrderHistory/HistoryHeader";
import EmptyHistory from "@/Components/Customer/OrderHistory/EmptyHistory";
import OrderCard from "@/Components/Customer/OrderHistory/OrderCard";

export default function OrderHistory({ table, orders }) {
    // Auto Refresh setiap 10 detik agar status terupdate
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['orders'] });
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-800">
            <Head title={`Riwayat Pesanan - Meja ${table.table_number}`} />
            <Toaster position="top-center" richColors />

            {/* Header */}
            <HistoryHeader tableNumber={table.table_number} />

            <main className="p-6 space-y-4">
                {orders.length === 0 ? (
                    <EmptyHistory tableNumber={table.table_number} />
                ) : (
                    orders.map((order) => (
                        <OrderCard 
                            key={order.id} 
                            order={order} 
                            tableNumber={table.table_number} 
                        />
                    ))
                )}
            </main>
        </div>
    );
}