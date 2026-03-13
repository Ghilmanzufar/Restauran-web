import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { BiCheckCircle, BiMoney } from "react-icons/bi";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function PaymentModal({ show, onClose, order }) {
    const [amountReceived, setAmountReceived] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleProcessPayment = (e) => {
        e.preventDefault();
        setIsProcessing(true);
        router.post(route('admin.pos.pay', order.id), {
            amount_received: amountReceived,
            payment_method: "cash" // <--- LANGSUNG HARDCODE KE CASH
        }, {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                setAmountReceived("");
                toast.success('Pembayaran Tunai Berhasil!');
            },
            onFinish: () => setIsProcessing(false)
        });
    };

    if (!show || !order) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Overlay Background - Klik luar untuk tutup */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { onClose(); setAmountReceived(""); }} />
                
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
                    
                    <div className="bg-slate-900 p-6 text-white text-center">
                        <h3 className="text-xl font-black mb-1">Terima Pembayaran</h3>
                        <p className="text-slate-400 font-medium text-sm">Meja {order.table?.table_number} - {order.customer_name}</p>
                    </div>

                    <form onSubmit={handleProcessPayment} className="p-8 space-y-6">
                        
                        <div className="text-center">
                            <p className="text-sm font-bold text-slate-400 mb-1">Total Tagihan</p>
                            <p className="text-4xl font-black text-slate-900">{formatRupiah(order.total_price)}</p>
                        </div>

                        {/* --- PILIHAN QRIS / CASH DIHAPUS, FOKUS KE INPUT UANG TUNAI --- */}
                        <div>
                            <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                <BiMoney className="text-blue-500 text-lg"/> Uang Tunai Diterima (Rp)
                            </p>
                            <input 
                                type="number" autoFocus required min={order.total_price} 
                                value={amountReceived} onChange={(e) => setAmountReceived(e.target.value)} 
                                className="w-full text-center text-3xl font-black py-4 border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-0 transition-colors" 
                                placeholder="0" 
                            />
                            
                            {/* LOGIKA KEMBALIAN */}
                            {amountReceived && parseFloat(amountReceived) >= parseFloat(order.total_price) && (
                                <div className="mt-4 bg-green-50 text-green-700 p-3 rounded-xl flex justify-between items-center font-bold border border-green-200">
                                    <span>Kembalian:</span>
                                    <span className="text-xl">{formatRupiah(amountReceived - order.total_price)}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => { onClose(); setAmountReceived(""); }} className="py-4 px-6 font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 active:scale-95 transition-all">
                                Batal
                            </button>
                            <button 
                                type="submit" disabled={isProcessing || !amountReceived || parseFloat(amountReceived) < parseFloat(order.total_price)} 
                                className="flex-1 py-4 font-black text-white bg-slate-900 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 active:scale-95 transition-all flex justify-center items-center gap-2 text-lg shadow-lg"
                            >
                                {isProcessing ? "Memproses..." : <><BiCheckCircle className="text-2xl" /> LUNASKAN TUNAI</>}
                            </button>
                        </div>

                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}