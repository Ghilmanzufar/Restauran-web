import React from "react";
import { Link } from "@inertiajs/react";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function TableMap({ tables }) {
    return (
        <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <div className="w-2 h-6 bg-blue-500 rounded-full"></div> Peta Meja Real-time
                </h3>
                <div className="flex gap-4 text-xs font-black uppercase tracking-widest">
                    <span className="flex items-center gap-1.5 text-gray-400"><div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-300"></div> Kosong</span>
                    <span className="flex items-center gap-1.5 text-blue-600"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Terisi</span>
                    <span className="flex items-center gap-1.5 text-red-600"><div className="w-3 h-3 rounded-full bg-red-500"></div> Belum Bayar</span>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {tables.map(table => {
                    const activeOrder = table.orders[0] || null;
                    const isOccupied = activeOrder !== null;
                    const isUnpaid = isOccupied && activeOrder.payment_status === 'unpaid';

                    return (
                        <Link 
                            key={table.id} 
                            href={`/admin/pos?table=${table.id}`} 
                            className={`block p-6 rounded-3xl border-2 transition-all duration-300 active:scale-95 group relative overflow-hidden ${
                                !table.is_active ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed' :
                                isUnpaid ? 'bg-red-50 border-red-200 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/20' : 
                                isOccupied ? 'bg-blue-50 border-blue-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20' : 
                                'bg-white border-gray-100 hover:border-slate-300 hover:shadow-md'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <span className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${
                                    isUnpaid ? 'bg-red-100 text-red-600' :
                                    isOccupied ? 'bg-blue-100 text-blue-600' :
                                    'bg-gray-100 text-gray-500'
                                }`}>
                                    Meja {table.table_number}
                                </span>
                                <span className={`w-4 h-4 rounded-full shadow-sm ${
                                    !table.is_active ? 'bg-gray-300' :
                                    isUnpaid ? 'bg-red-500 animate-pulse' :
                                    isOccupied ? 'bg-blue-500' :
                                    'bg-gray-200'
                                }`}></span>
                            </div>

                            <div>
                                {isOccupied ? (
                                    <>
                                        <p className="text-sm font-bold text-slate-500 mb-1 truncate">{activeOrder.customer_name}</p>
                                        <p className={`text-2xl font-black ${isUnpaid ? 'text-red-600' : 'text-slate-900'}`}>
                                            {formatRupiah(activeOrder.total_price)}
                                        </p>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-4 opacity-30 group-hover:opacity-100 transition-opacity">
                                        <p className="text-base font-black text-slate-400">KOSONG</p>
                                    </div>
                                )}
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}