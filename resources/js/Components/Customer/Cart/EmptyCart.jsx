import React from "react";
import { Link } from "@inertiajs/react";

export default function EmptyCart({ tableNumber }) {
    return (
        <div className="flex flex-col items-center justify-center pt-20 text-center">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-4xl shadow-inner">
                🛒
            </div>
            <h2 className="text-xl font-bold text-slate-800">Keranjang Kosong</h2>
            <p className="text-slate-500 text-sm mt-2 mb-8 max-w-[200px]">
                Perut lapar butuh asupan! Yuk pesan menu favoritmu.
            </p>
            <Link href={route('customer.menu', tableNumber)}>
                <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-slate-900/20 active:scale-95 transition-transform hover:bg-slate-800">
                    Lihat Menu
                </button>
            </Link>
        </div>
    );
}