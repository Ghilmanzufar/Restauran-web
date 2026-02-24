import React from "react";
import { BiNote, BiTrash, BiMinus, BiPlus, BiPencil } from "react-icons/bi";
import { motion } from "framer-motion";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function CartItem({ item, onUpdateQty, onRemove, onEdit }) {
    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, x: -50 }}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4"
        >
            <div className="w-20 h-20 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
            </div>
            
            <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-sm text-slate-800 line-clamp-1">{item.name}</h3>
                        {item.variants && item.variants.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {item.variants.map((v, idx) => (
                                    <span key={idx} className="text-[10px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">
                                        {v.item_name}
                                    </span>
                                ))}
                            </div>
                        )}
                        {item.note && (
                            <div className="text-[10px] text-orange-600 italic mt-1 flex items-center gap-1">
                                <BiNote /> "{item.note}"
                            </div>
                        )}
                    </div>
                    <button onClick={() => onRemove(item.cart_id)} className="text-gray-300 hover:text-red-500 p-1 transition-colors">
                        <BiTrash className="text-lg" />
                    </button>
                </div>

                <div className="flex justify-between items-end mt-2">
                    <div>
                        <span className="text-sm font-bold text-slate-900 block">
                            {formatRupiah(item.total_price_per_item * item.qty)}
                        </span>
                        <button onClick={() => onEdit(item)} className="text-[10px] font-bold text-orange-500 flex items-center gap-1 mt-1 hover:text-orange-600">
                            <BiPencil /> Edit
                        </button>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-100">
                        <button onClick={() => onUpdateQty(item.cart_id, -1)} className="w-6 h-6 rounded bg-white shadow-sm flex items-center justify-center text-xs active:scale-90 border border-gray-200 text-gray-600">
                            <BiMinus/>
                        </button>
                        <span className="text-xs font-bold w-4 text-center text-slate-700">{item.qty}</span>
                        <button onClick={() => onUpdateQty(item.cart_id, 1)} className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center text-xs active:scale-90 shadow-md shadow-slate-900/20">
                            <BiPlus/>
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}