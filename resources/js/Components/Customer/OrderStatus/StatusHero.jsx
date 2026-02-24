import React from "react";
import { motion } from "framer-motion";
import { BiReceipt, BiDish, BiRestaurant, BiCheckCircle } from "react-icons/bi";

export default function StatusHero({ status }) {
    // Definisi Steps
    const steps = [
        { key: 'new', title: 'Pesanan Diterima', desc: 'Dapur sedang mengecek pesananmu.', icon: <BiReceipt /> },
        { key: 'processing', title: 'Sedang Dimasak', desc: 'Koki kami sedang beraksi! 👨‍🍳', icon: <BiDish /> },
        { key: 'ready', title: 'Siap Disajikan', desc: 'Makanan sedang diantar ke mejamu.', icon: <BiRestaurant /> },
        { key: 'completed', title: 'Selamat Menikmati', desc: 'Terima kasih sudah makan di sini.', icon: <BiCheckCircle /> },
    ];

    // Cari step aktif
    let activeStepIndex = steps.findIndex(s => s.key === status);
    if (activeStepIndex === -1 && status === 'pending') activeStepIndex = 0;
    if (activeStepIndex === -1) activeStepIndex = 0; // Default fallback

    const currentStep = steps[activeStepIndex];

    return (
        <div className="flex flex-col items-center justify-center pt-4">
            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`absolute inset-0 rounded-full blur-xl ${status === 'completed' ? 'bg-green-400' : 'bg-orange-400'}`}
                ></motion.div>
                <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className={`relative w-32 h-32 rounded-full flex items-center justify-center text-5xl text-white shadow-2xl z-10 ${status === 'completed' ? 'bg-green-500' : 'bg-slate-900'}`}
                >
                    {currentStep.icon}
                </motion.div>
            </div>
            <h2 className="text-2xl font-black text-slate-900 text-center">{currentStep.title}</h2>
            <p className="text-slate-500 text-sm text-center mt-2 max-w-[250px]">{currentStep.desc}</p>
        </div>
    );
}