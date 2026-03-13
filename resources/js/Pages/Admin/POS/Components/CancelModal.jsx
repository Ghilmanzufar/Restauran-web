import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { BiXCircle } from "react-icons/bi";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function CancelModal({ show, onClose, order, onOrderCleared }) {
    const [cancelReason, setCancelReason] = useState("");

    const handleCancel = () => {
        router.post(route('admin.pos.cancel', order.id), { reason: cancelReason }, {
            onSuccess: () => { 
                onClose(); 
                onOrderCleared(); 
                toast.success('Order dibatalkan'); 
            }
        });
    };

    if (!show || !order) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-xl w-full max-w-md relative z-10 p-6">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4"><BiXCircle /></div>
                    <h3 className="text-xl font-black text-center mb-4">Batalkan Pesanan?</h3>
                    <textarea 
                        value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Alasan pembatalan (misal: Pelanggan pergi / Salah input)..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium focus:ring-red-500 min-h-[100px] mb-4"
                    />
                    <div className="flex gap-3">
                        <button onClick={onClose} className="flex-1 py-3 font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200">Kembali</button>
                        <button 
                            onClick={handleCancel} disabled={!cancelReason}
                            className="flex-1 py-3 font-bold text-white bg-red-500 rounded-xl disabled:opacity-50 hover:bg-red-600"
                        >Ya, Batalkan</button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}