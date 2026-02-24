import React from "react";
import { BiQrScan, BiCheckCircle, BiMoney } from "react-icons/bi";

export default function PaymentMethod({ selected, onSelect }) {
    return (
        <section>
            <h2 className="text-sm font-bold text-slate-500 mb-3 px-1 uppercase tracking-wider">Pilih Pembayaran</h2>
            <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => onSelect('qris')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 relative ${selected === 'qris' ? 'border-slate-900 bg-slate-900 text-white' : 'border-gray-200 bg-white text-gray-400'}`}>
                    <BiQrScan className="text-2xl" />
                    <span className="text-xs font-bold">QRIS</span>
                    {selected === 'qris' && <BiCheckCircle className="absolute top-2 right-2 text-white" />}
                </button>
                <button type="button" onClick={() => onSelect('cashier')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 relative ${selected === 'cashier' ? 'border-slate-900 bg-slate-900 text-white' : 'border-gray-200 bg-white text-gray-400'}`}>
                    <BiMoney className="text-2xl" />
                    <span className="text-xs font-bold">Kasir</span>
                    {selected === 'cashier' && <BiCheckCircle className="absolute top-2 right-2 text-white" />}
                </button>
            </div>
        </section>
    );
}