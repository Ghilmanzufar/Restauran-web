import React from "react";
import { BiGift } from "react-icons/bi";

export default function PromoBanner() {
    return (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 text-white shadow-lg mb-6 relative overflow-hidden">
            <div className="relative z-10">
                <h2 className="font-bold text-lg mb-1">Makan Kenyang, Dompet Tenang! 🤑</h2>
                <p className="text-xs opacity-90">Gunakan voucher di bawah ini untuk dapat potongan harga.</p>
            </div>
            <BiGift className="absolute -right-4 -bottom-4 text-9xl opacity-20 rotate-12" />
        </div>
    );
}