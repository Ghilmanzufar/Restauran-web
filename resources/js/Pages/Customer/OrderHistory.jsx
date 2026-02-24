import React from "react";
import { Head, Link } from "@inertiajs/react";
import { BiArrowBack, BiTime, BiCheckCircle, BiDish, BiReceipt } from "react-icons/bi";

// Helper Format Rupiah
const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(number);
};

export default function OrderHistory({ table, orders }) {
    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-800">
            <Head title={`Riwayat Pesanan - Meja ${table.table_number}`} />

            {/* HEADER */}
            <header className="bg-white px-6 py-4 sticky top-0 z-50 shadow-sm flex items-center gap-4">
                <Link href={route('customer.menu', table.table_number)} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                    <BiArrowBack className="text-xl text-slate-700" />
                </Link>
                <div>
                    <h1 className="text-lg font-bold text-slate-900 leading-none">Riwayat Pesanan</h1>
                    <span className="text-xs text-slate-500">Meja {table.table_number}</span>
                </div>
            </header>

            <main className="p-5 space-y-4">
                {orders.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <BiReceipt className="text-6xl mx-auto mb-4 opacity-20" />
                        <p>Belum ada riwayat pesanan.</p>
                        <Link href={route('customer.menu', table.table_number)} className="text-orange-500 font-bold text-sm mt-2 block">Pesan Sekarang</Link>
                    </div>
                ) : (
                    orders.map((order) => (
                        <Link 
                            key={order.id} 
                            href={route('customer.order_detail', { tableNumber: table.table_number, orderId: order.id })}
                            className="block"
                        >
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-orange-200 transition-colors relative overflow-hidden">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400">ORDER ID</span>
                                        <p className="text-sm font-mono font-bold text-slate-800">#{order.id.substring(0, 8).toUpperCase()}</p>
                                    </div>
                                    <OrderStatusBadge status={order.order_status} />
                                </div>
                                
                                <div className="flex justify-between items-end mt-4">
                                    <div className="text-xs text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • 
                                        {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <span className="font-bold text-slate-900 text-lg">{formatRupiah(order.total_price)}</span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </main>
        </div>
    );
}

// Komponen Kecil Badge Status
function OrderStatusBadge({ status }) {
    const config = {
        new: { color: 'bg-gray-100 text-gray-600', icon: <BiTime />, label: 'Menunggu' },
        processing: { color: 'bg-orange-100 text-orange-600', icon: <BiDish />, label: 'Dimasak' },
        ready: { color: 'bg-blue-100 text-blue-600', icon: <BiCheckCircle />, label: 'Siap Saji' },
        completed: { color: 'bg-green-100 text-green-600', icon: <BiCheckCircle />, label: 'Selesai' },
        cancelled: { color: 'bg-red-100 text-red-600', icon: <BiTime />, label: 'Batal' },
    };
    const current = config[status] || config['new'];

    return (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${current.color}`}>
            {current.icon} {current.label}
        </div>
    );
}