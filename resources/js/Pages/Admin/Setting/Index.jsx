import React from "react";
import { Head, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { BiStore, BiMoney, BiSave } from "react-icons/bi";

export default function SettingIndex({ settings }) {
    const { data, setData, post, processing, errors } = useForm({
        tax_percentage: settings.tax_percentage || 10,
        service_percentage: settings.service_percentage || 5,
        store_name: settings.store_name || "RESTOPRO",
        store_address: settings.store_address || "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'));
    };

    return (
        <AdminLayout title="Pengaturan Sistem">
            <Head title="Pengaturan Sistem" />

            <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-slate-50">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <BiStore className="text-blue-600" /> Profil Toko & Biaya
                        </h2>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* SECTION: BIAYA & PAJAK */}
                        <div>
                            <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-4 flex items-center gap-2"><BiMoney/> Pengaturan Pajak & Service</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Pajak Restoran / PPN (%)</label>
                                    <div className="relative">
                                        <input type="number" step="0.1" value={data.tax_percentage} onChange={e => setData('tax_percentage', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-black focus:ring-blue-500 text-right pr-12" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                    </div>
                                    {errors.tax_percentage && <p className="text-red-500 text-xs mt-1">{errors.tax_percentage}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Service Charge (%)</label>
                                    <div className="relative">
                                        <input type="number" step="0.1" value={data.service_percentage} onChange={e => setData('service_percentage', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-black focus:ring-blue-500 text-right pr-12" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                    </div>
                                    {errors.service_percentage && <p className="text-red-500 text-xs mt-1">{errors.service_percentage}</p>}
                                </div>
                            </div>
                        </div>

                        <hr className="border-dashed border-gray-200" />

                        {/* SECTION: PROFIL TOKO */}
                        <div>
                            <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-4">Identitas Toko (Struk)</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Nama Restoran</label>
                                    <input type="text" value={data.store_name} onChange={e => setData('store_name', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Alamat Lengkap</label>
                                    <textarea value={data.store_address} onChange={e => setData('store_address', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-blue-500 min-h-[100px]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-gray-100 flex justify-end">
                        <button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-8 rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
                            <BiSave className="text-xl" /> {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}