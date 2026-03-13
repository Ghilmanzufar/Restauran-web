import React, { useEffect } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";

// Import Komponen Kecil
import MetricsCards from "./Dashboard/Components/MetricsCards";
import TableMap from "./Dashboard/Components/TableMap";
import RecentOrdersList from "./Dashboard/Components/RecentOrdersList";

export default function Dashboard({ metrics, tables, recentOrders }) {
    const { auth } = usePage().props;
    const isKasir = auth.user.role === 'kasir';

    // Auto-Refresh
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ 
                only: ['metrics', 'tables', 'recentOrders'], 
                preserveScroll: true, 
                preserveState: true 
            });
        }, 5000); 

        return () => clearInterval(interval);
    }, []);

    return (
        <AdminLayout title="Dashboard Overview">
            <Head title="Dashboard" />

            {/* 1. KARTU METRIK ATAS */}
            <MetricsCards metrics={metrics} tables={tables} isKasir={isKasir} />

            {/* 2. AREA UTAMA */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* KIRI: PETA MEJA */}
                <TableMap tables={tables} />

                {/* KANAN: PESANAN TERBARU */}
                <RecentOrdersList recentOrders={recentOrders} />
                
            </div>
        </AdminLayout>
    );
}