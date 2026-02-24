import React from "react";
import { Link } from "@inertiajs/react";
import { BiSearch, BiHistory, BiShoppingBag, BiCheckShield } from "react-icons/bi";
import { motion } from "framer-motion";

export default function MenuHeader({ table, cartCount, searchQuery, setSearchQuery }) {
    return (
        <div className="px-6 pb-2">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-1 rounded-full w-fit mb-2 border border-orange-100">
                        <BiCheckShield className="text-sm" />
                        <span className="text-[10px] font-bold tracking-wide uppercase">Verified Table</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 leading-none">Meja {table.table_number}</h1>
                    <p className="text-sm text-slate-500 mt-1">Selamat datang di Restauran ..., lapar ya? 👋</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href={route('customer.history', table.table_number)} className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-slate-700 shadow-sm active:scale-95 transition-transform">
                        <BiHistory className="text-xl" />
                    </Link>
                    <Link href={route('customer.cart', table.table_number)} className="relative w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-slate-700 shadow-sm active:scale-95 transition-transform">
                        <BiShoppingBag className="text-xl" />
                        {cartCount > 0 && (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                {cartCount}
                            </motion.span>
                        )}
                    </Link>
                </div>
            </div>
            
            <div className="relative">
                <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder="Cari Nasi Goreng, Es Teh..." 
                    className="w-full bg-gray-100 border-none rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-slate-900/10 transition-all placeholder:text-gray-400" 
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-gray-300 text-white w-5 h-5 rounded-full flex items-center justify-center">✕</button>
                )}
            </div>
        </div>
    );
}