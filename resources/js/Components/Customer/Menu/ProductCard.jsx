import React from "react";
import { motion } from "framer-motion";
import { BiPlus } from "react-icons/bi";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function ProductCard({ product, qty, onClick }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "50px", once: true }}
            className="bg-white p-3 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex gap-4 h-full"
        >
            <div onClick={onClick} className="w-28 h-28 shrink-0 rounded-xl bg-gray-50 overflow-hidden relative cursor-pointer active:scale-95 transition-transform">
                <img src={product.image_url} alt={product.name} className={`w-full h-full object-cover transition-all duration-500 ${!product.is_available ? 'grayscale opacity-50' : ''}`} loading="lazy" />
                {!product.is_available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-[10px] text-white font-bold bg-red-600 px-2 py-1 rounded-full shadow-sm">Habis</span>
                    </div>
                )}
            </div>

            <div className="flex-1 flex flex-col justify-between py-1">
                <div onClick={onClick} className="cursor-pointer">
                    <h3 className="font-bold text-slate-800 text-[15px] leading-snug line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{product.description || "Rasanya enak banget, wajib coba!"}</p>
                </div>

                <div className="flex justify-between items-end mt-3">
                    <span className="font-bold text-slate-900 text-[15px]">{formatRupiah(product.price)}</span>
                    {product.is_available && (
                        qty === 0 ? (
                            <motion.button whileTap={{ scale: 0.9 }} onClick={onClick} className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center shadow-sm hover:bg-orange-500 hover:text-white transition-colors">
                                <BiPlus className="text-lg" />
                            </motion.button>
                        ) : (
                            <motion.button onClick={onClick} whileTap={{ scale: 0.9 }} className="flex items-center bg-slate-900 rounded-full px-3 py-1 gap-2 shadow-lg shadow-slate-900/20">
                                <span className="text-white text-xs font-bold">{qty}x</span>
                                <BiPlus className="text-white text-xs" />
                            </motion.button>
                        )
                    )}
                </div>
            </div>
        </motion.div>
    );
}