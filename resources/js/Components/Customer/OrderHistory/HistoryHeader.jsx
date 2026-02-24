import React from "react";
import { Link } from "@inertiajs/react";
import { BiArrowBack } from "react-icons/bi";

export default function HistoryHeader({ tableNumber }) {
    return (
        <header className="bg-white px-6 py-4 sticky top-0 z-50 shadow-sm flex items-center gap-4">
            <Link 
                href={route('customer.menu', tableNumber)} 
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
                <BiArrowBack className="text-xl text-slate-700" />
            </Link>
            <div>
                <h1 className="text-lg font-bold text-slate-900 leading-none">Riwayat Pesanan</h1>
                <span className="text-xs text-slate-500">Meja {tableNumber}</span>
            </div>
        </header>
    );
}