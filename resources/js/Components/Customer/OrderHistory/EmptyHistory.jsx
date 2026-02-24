import React from "react";
import { Link } from "@inertiajs/react";
import { BiHistory } from "react-icons/bi";

export default function EmptyHistory({ tableNumber }) {
    return (
        <div className="flex flex-col items-center justify-center pt-32 text-center px-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-4xl text-gray-300">
                <BiHistory />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Belum Ada Riwayat</h2>
            <p className="text-slate-500 text-sm mt-2 mb-6">
                Kamu belum memesan apapun. Yuk pesan menu favoritmu sekarang!
            </p>
            <Link href={route('customer.menu', tableNumber)}>
                <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform">
                    Pesan Sekarang
                </button>
            </Link>
        </div>
    );
}