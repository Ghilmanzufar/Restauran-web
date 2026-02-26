import React from "react";
import { Link } from "@inertiajs/react";
import { BiRightArrowAlt, BiTimeFive } from "react-icons/bi";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function OrderCard({ order, tableNumber }) {
    // Helper Status Color
    const getStatusColor = (status) => {
        switch(status) {
            case 'new': return 'bg-blue-100 text-blue-700';
            case 'processing': return 'bg-orange-100 text-orange-700';
            case 'ready': return 'bg-yellow-100 text-yellow-700';
            case 'completed': return 'bg-green-100 text-green-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status) => {
        switch(status) {
            case 'new': return 'Menunggu Konfirmasi';
            case 'processing': return 'Sedang Dimasak';
            case 'ready': return 'Siap Disajikan';
            case 'completed': return 'Selesai';
            case 'cancelled': return 'Dibatalkan';
            default: return status;
        }
    };

    return (
        <Link 
            // PERBAIKAN DI SINI: Ganti 'customer.order_status' menjadi 'customer.order_detail'
            href={route('customer.order_detail', [tableNumber, order.id])} 
            className="block bg-white p-4 rounded-2xl shadow-sm border border-gray-100 active:scale-[0.98] transition-transform hover:shadow-md"
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide ${getStatusColor(order.order_status)}`}>
                        {getStatusLabel(order.order_status)}
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <BiTimeFive /> {new Date(order.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                </div>
                <BiRightArrowAlt className="text-gray-400" />
            </div>

            <div className="space-y-1 mb-3">
                <h3 className="font-bold text-slate-800 text-sm">
                    {/* Mengambil 4 karakter terakhir & Uppercase */}
                    #{order.id.slice(-4).toUpperCase()} 
                </h3>
                <p className="text-xs text-gray-500 line-clamp-1">
                    Total {formatRupiah(order.total_price)}
                </p>
            </div>
            
            <div className="text-xs font-bold text-slate-900 border-t border-gray-50 pt-2 flex justify-between items-center">
                <span>Total Bayar</span>
                <span className="text-lg">{formatRupiah(order.total_price)}</span>
            </div>
        </Link>
    );
}