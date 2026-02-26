import React from "react";
import { Link } from "@inertiajs/react";
import { BiArrowBack, BiShareAlt, BiHash } from "react-icons/bi";
import { toast } from "sonner";

export default function StatusHeader({ tableNumber, orderId }) {
    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url)
            .then(() => toast.success('Link Berhasil Disalin!', { description: 'Bagikan ke temanmu.' }))
            .catch(() => toast.error('Gagal menyalin link'));
    };

    // Format ID Singkat (4 Digit Terakhir)
    const shortId = orderId ? orderId.slice(-4).toUpperCase() : '????';

    return (
        <header className="bg-white px-6 py-4 sticky top-0 z-50 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Link href={route('customer.history', tableNumber)} className="text-slate-500 w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                    <BiArrowBack className="text-xl" />
                </Link>
                <div>
                    <h1 className="text-lg font-bold text-slate-900 leading-none">Detail Status</h1>
                    <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                        <BiHash className="text-[10px]" /> {shortId}
                    </span>
                </div>
            </div>
            <button onClick={handleShare} className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-2 rounded-full text-xs font-bold active:scale-95 transition-transform hover:bg-slate-200">
                <BiShareAlt className="text-lg" /> Share
            </button>
        </header>
    );
}