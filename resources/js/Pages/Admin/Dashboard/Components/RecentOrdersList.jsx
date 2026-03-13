import React, { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import { BiRightArrowAlt, BiTimeFive } from "react-icons/bi";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

const OrderTimer = ({ createdAt }) => {
    const [mins, setMins] = useState(0);
    
    useEffect(() => {
        const calcTime = () => setMins(Math.floor((new Date() - new Date(createdAt)) / 60000));
        calcTime();
        const interval = setInterval(calcTime, 60000);
        return () => clearInterval(interval);
    }, [createdAt]);

    if (mins < 1) {
        return <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest animate-pulse shadow-md shadow-red-500/30">NEW</span>;
    }
    
    return (
        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${mins > 15 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
            <BiTimeFive className="inline mr-0.5 text-xs mb-0.5"/> {mins}m lalu
        </span>
    );
};

export default function RecentOrdersList({ recentOrders }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <div className="w-2 h-6 bg-emerald-500 rounded-full"></div> Pesanan Terbaru
                </h3>
                <Link href="/admin/orders" className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    Semua <BiRightArrowAlt className="text-xl" />
                </Link>
            </div>

            <div className="bg-white rounded-3xl p-3 shadow-sm border border-gray-100 flex flex-col gap-3">
                {recentOrders.length === 0 ? (
                    <div className="p-8 text-center text-sm font-bold text-gray-400">Belum ada pesanan hari ini.</div>
                ) : (
                    recentOrders.map(order => (
                        <div key={order.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center group hover:bg-slate-100 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-slate-700 font-black shrink-0 text-lg">
                                    {order.table?.table_number || '-'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <p className="font-bold text-slate-900 text-base">{order.customer_name}</p>
                                        <OrderTimer createdAt={order.created_at} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400 font-mono font-bold bg-gray-200/50 px-2 py-0.5 rounded-md">
                                            #{order.id.slice(-4).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-right shrink-0 flex flex-col items-end">
                                <p className="font-black text-slate-900 text-base">{formatRupiah(order.total_price)}</p>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md mt-1.5 border ${order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                    {order.payment_status === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}