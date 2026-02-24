import React from "react";
import { BiUser, BiLogoWhatsapp } from "react-icons/bi";

export default function CustomerForm({ data, onChangeName, onChangePhone, errors }) {
    return (
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Data Pemesan</h2>
            <div>
                <div className="relative">
                    <BiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                    <input 
                        type="text" placeholder="Nama Kamu (Wajib)" 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:border-slate-900 transition-all"
                        value={data.customer_name} onChange={onChangeName}
                    />
                </div>
                {errors.customer_name && <p className="text-xs text-red-500 mt-1">{errors.customer_name}</p>}
            </div>
            <div>
                <div className="relative">
                    <BiLogoWhatsapp className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 text-lg" />
                    <input 
                        type="tel" placeholder="WhatsApp (08xxxxx)" 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:border-green-500 transition-all"
                        value={data.whatsapp_number} onChange={onChangePhone} 
                    />
                </div>
                {errors.whatsapp_number && <p className="text-xs text-red-500 mt-1">{errors.whatsapp_number}</p>}
            </div>
        </section>
    );
}