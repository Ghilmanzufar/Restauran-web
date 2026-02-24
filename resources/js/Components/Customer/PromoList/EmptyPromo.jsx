import React from "react";
import { BiGift } from "react-icons/bi";

export default function EmptyPromo() {
    return (
        <div className="text-center py-20 text-gray-400">
            <BiGift className="text-6xl mx-auto mb-4 opacity-20" />
            <p>Yah, belum ada promo yang tersedia saat ini.</p>
        </div>
    );
}