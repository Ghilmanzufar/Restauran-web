import React, { useEffect, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { Toaster, toast } from "sonner"; 
import { BiXCircle, BiWallet, BiQrScan } from "react-icons/bi"; 

import StatusHeader from "@/Components/Customer/OrderStatus/StatusHeader";
import StatusHero from "@/Components/Customer/OrderStatus/StatusHero";
import ReceiptList from "@/Components/Customer/OrderStatus/ReceiptList";
import ReceiptSummary from "@/Components/Customer/OrderStatus/ReceiptSummary";

export default function OrderStatus({ table, order }) { 
    const [isCancelling, setIsCancelling] = useState(false);

    // Cek kondisi "Harus Bayar Dulu"
    const isPayAtCashier = order.payment_method === 'cashier' && order.payment_status === 'unpaid' && order.order_status !== 'cancelled';

    // Logic Auto Refresh
    useEffect(() => {
        if (order.order_status !== 'completed' && order.order_status !== 'cancelled') {
            const interval = setInterval(() => {
                router.reload({ only: ['order'] });
            }, 5000); 
            return () => clearInterval(interval);
        }
    }, [order.order_status]);

    const handleCancelOrder = () => {
        if (confirm("Yakin ingin membatalkan pesanan ini?")) {
            setIsCancelling(true);
            router.post(route('customer.cancel', [table.table_number, order.id]), {}, {
                onSuccess: () => {
                    toast.success("Pesanan berhasil dibatalkan.");
                    setIsCancelling(false);
                },
                onError: (err) => {
                    toast.error("Gagal membatalkan pesanan.");
                    setIsCancelling(false);
                }
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-800 pb-40">
            <Head title={`Detail Pesanan - Meja ${table.table_number}`} />
            <Toaster position="top-center" richColors />

            <StatusHeader tableNumber={table.table_number} orderId={order.id} />

            <main className="p-6 space-y-8">
                {/* Hero Animation (Sekarang mendukung status 'Menunggu Pembayaran') */}
                <StatusHero order={order} />

                {/* --- BAGIAN PENTING: INSTRUKSI BAYAR DI KASIR --- */}
                {isPayAtCashier && (
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <BiWallet className="text-8xl text-orange-600" />
                        </div>
                        
                        <h3 className="text-lg font-bold text-orange-800 mb-1">Tunjukkan Kode Ini ke Kasir</h3>
                        <p className="text-xs text-orange-600 mb-4">Lakukan pembayaran agar pesanan diproses.</p>
                        
                        {/* KOTAK KODE UTAMA */}
                        <div className="bg-white border-2 border-dashed border-orange-300 rounded-xl p-4 mb-4 flex flex-col items-center justify-center gap-1">
                            {/* Baris 1: Tampilkan Meja (Paling Penting) */}
                            <span className="text-lg font-bold text-orange-600 bg-orange-100 px-3 py-0.5 rounded-full mb-1">
                                Meja {table.table_number}
                            </span>
                            
                            {/* Baris 2: Kode Singkat 4 Digit */}
                            <span className="text-6xl font-black text-slate-900 tracking-widest leading-none">
                                {order.id.slice(-4).toUpperCase()}
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Kode Unik</span>
                        </div>

                        <div className="bg-orange-100/50 rounded-lg p-2 mb-3 border border-orange-100">
                            <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider mb-0.5">Atas Nama</p>
                            <p className="text-xl font-extrabold text-slate-800 capitalize truncate px-2">
                                {order.customer_name}
                            </p>
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 text-xs text-orange-700 font-medium">
                           <BiQrScan /> Scan QR di Kasir atau sebutkan kode di atas
                        </div>
                    </div>
                )}
                {/* ----------------------------------------------- */}

                {/* Tombol Cancel (Hanya muncul jika belum diproses & belum bayar) */}
                {order.order_status === 'pending' && (
                    <div className="flex justify-center">
                        <button 
                            onClick={handleCancelOrder}
                            disabled={isCancelling}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                            <BiXCircle className="text-lg" />
                            {isCancelling ? "Memproses..." : "Batalkan Pesanan"}
                        </button>
                    </div>
                )}

                {/* Struk Digital */}
                <section className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative">
                    <div className="bg-slate-900 h-2 w-full"></div>
                    <div className="p-5">
                        <ReceiptList items={order.items} />
                        <ReceiptSummary order={order} />
                    </div>
                </section>
            </main>

            <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-5 z-40 shadow-[0_-5px_30px_rgba(0,0,0,0.1)]">
                 <Link href={route('customer.menu', table.table_number)}>
                    <button className="w-full h-16 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 active:scale-95 transition-transform">
                        Pesan Lagi
                    </button>
                 </Link>
            </div>
        </div>
    );
}