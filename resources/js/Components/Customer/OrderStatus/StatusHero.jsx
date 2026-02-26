import React from "react";
import { motion } from "framer-motion";
import { BiReceipt, BiDish, BiRestaurant, BiCheckCircle, BiXCircle, BiWallet } from "react-icons/bi";

export default function StatusHero({ order }) { // <--- Pastikan terima prop 'order'
    // Ambil data dari object order, dengan fallback aman
    const status = order?.order_status || 'pending';
    const paymentStatus = order?.payment_status || 'unpaid';

    // --- PERBAIKAN DI SINI ---
    // Hapus pengecekan 'payment_method'. Pokoknya kalau belum bayar & belum batal = TAMPILKAN.
    const isWaitingPayment = paymentStatus === 'unpaid' && status !== 'cancelled';

    // Definisi Steps
    const steps = [
        // Status Khusus: Menunggu Pembayaran (Prioritas Paling Atas)
        { key: 'waiting_payment', title: 'Menunggu Pembayaran', desc: 'Silakan menuju kasir untuk membayar.', icon: <BiWallet /> },
        
        { key: 'pending', title: 'Menunggu Konfirmasi', desc: 'Mohon tunggu, pesananmu sedang dicek.', icon: <BiReceipt /> },
        { key: 'new', title: 'Pesanan Diterima', desc: 'Dapur sedang mengecek pesananmu.', icon: <BiReceipt /> }, 
        { key: 'processing', title: 'Sedang Dimasak', desc: 'Koki kami sedang beraksi! 👨‍🍳', icon: <BiDish /> },
        { key: 'ready', title: 'Siap Disajikan', desc: 'Makanan sedang diantar ke mejamu.', icon: <BiRestaurant /> },
        { key: 'completed', title: 'Selamat Menikmati', desc: 'Terima kasih sudah makan di sini.', icon: <BiCheckCircle /> },
        { key: 'cancelled', title: 'Pesanan Dibatalkan', desc: 'Yah, pesanan ini sudah dibatalkan.', icon: <BiXCircle /> },
    ];

    // Tentukan Step Aktif
    let currentStepKey = status;
    
    // Jika belum bayar, PAKSA status jadi 'waiting_payment' (kecuali udah batal)
    if (isWaitingPayment) {
        currentStepKey = 'waiting_payment';
    }

    // Cari step di array
    let currentStep = steps.find(s => s.key === currentStepKey);
    
    // Fallback jika status aneh-aneh
    if (!currentStep) currentStep = steps.find(s => s.key === 'pending');

    // Helper Warna
    const getBgColor = () => {
        if (currentStepKey === 'waiting_payment') return 'bg-orange-500';
        if (status === 'completed') return 'bg-green-500';
        if (status === 'cancelled') return 'bg-red-500';
        return 'bg-slate-900';
    };

    const getGlowColor = () => {
        if (currentStepKey === 'waiting_payment') return 'bg-orange-400';
        if (status === 'completed') return 'bg-green-400';
        if (status === 'cancelled') return 'bg-red-400';
        return 'bg-blue-400';
    };

    return (
        <div className="flex flex-col items-center justify-center pt-4">
            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`absolute inset-0 rounded-full blur-xl ${getGlowColor()}`}
                ></motion.div>
                
                <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className={`relative w-32 h-32 rounded-full flex items-center justify-center text-5xl text-white shadow-2xl z-10 ${getBgColor()}`}
                >
                    {currentStep.icon}
                </motion.div>
            </div>
            
            <h2 className="text-2xl font-extrabold text-slate-900 mb-1">{currentStep.title}</h2>
            <p className="text-slate-500 text-sm text-center max-w-xs">{currentStep.desc}</p>
        </div>
    );
}