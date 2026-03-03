import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { BiX, BiPlus, BiTrash, BiCheckCircle } from 'react-icons/bi';
import { toast } from 'sonner';

export default function VariantManager({ isOpen, onClose, product }) {
    const [variants, setVariants] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    // Load data varian saat slide-over dibuka
    useEffect(() => {
        if (isOpen && product) {
            // Copy data dari backend agar bisa diedit di state lokal
            setVariants(product.variants ? JSON.parse(JSON.stringify(product.variants)) : []);
        }
    }, [isOpen, product]);

    const handleAddVariantGroup = () => {
        setVariants([...variants, { name: '', type: 'radio', is_required: false, items: [] }]);
    };

    const handleRemoveVariantGroup = (index) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleUpdateVariantGroup = (index, field, value) => {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    };

    const handleAddItem = (variantIndex) => {
        const newVariants = [...variants];
        newVariants[variantIndex].items.push({ name: '', price: 0 });
        setVariants(newVariants);
    };

    const handleRemoveItem = (variantIndex, itemIndex) => {
        const newVariants = [...variants];
        newVariants[variantIndex].items = newVariants[variantIndex].items.filter((_, i) => i !== itemIndex);
        setVariants(newVariants);
    };

    const handleUpdateItem = (variantIndex, itemIndex, field, value) => {
        const newVariants = [...variants];
        newVariants[variantIndex].items[itemIndex][field] = value;
        setVariants(newVariants);
    };

    const handleSave = () => {
        setIsSaving(true);
        router.post(route('admin.menu.variants.sync', product.id), { variants }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Varian berhasil disimpan!');
                onClose();
            },
            // --- TAMBAHKAN PENANGKAP ERROR INI ---
            onError: (errors) => {
                if (errors.variants) {
                    toast.error(errors.variants, { duration: 5000 }); // Tampilkan error 5 detik
                } else {
                    toast.error("Terjadi kesalahan sistem saat menyimpan varian.");
                }
            },
            // -------------------------------------
            onFinish: () => setIsSaving(false)
        });
    };

    // Efek transisi Slide-over
    const transformClasses = isOpen ? "translate-x-0" : "translate-x-full";
    const overlayClasses = isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none";

    return (
        <>
            {/* OVERLAY GELAP */}
            <div className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${overlayClasses}`} onClick={onClose}></div>

            {/* SLIDE OVER PANEL */}
            <div className={`fixed inset-y-0 right-0 w-full md:w-[500px] bg-[#F8FAFC] shadow-2xl z-50 flex flex-col transition-transform duration-300 transform ${transformClasses}`}>
                
                {/* Header */}
                <div className="bg-white px-6 py-5 border-b border-gray-200 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">Atur Varian</h2>
                        <p className="text-sm font-bold text-blue-600 line-clamp-1">{product?.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-slate-600">
                        <BiX className="text-2xl" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {variants.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"><BiPlus /></div>
                            <h3 className="font-bold text-slate-800 mb-1">Belum Ada Varian</h3>
                            <p className="text-sm text-gray-500 mb-6">Tambahkan varian seperti Level Pedas atau Topping.</p>
                        </div>
                    ) : (
                        variants.map((variant, vIndex) => (
                            <div key={vIndex} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                {/* Variant Group Header */}
                                <div className="p-4 bg-slate-50 border-b border-gray-200 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <input type="text" value={variant.name} onChange={(e) => handleUpdateVariantGroup(vIndex, 'name', e.target.value)} placeholder="Nama Grup (Msl: Level Pedas)" className="font-black text-slate-800 border-0 bg-transparent px-0 focus:ring-0 text-lg w-full placeholder-gray-400" />
                                        <button onClick={() => handleRemoveVariantGroup(vIndex)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"><BiTrash /></button>
                                    </div>
                                    <div className="flex gap-4">
                                        <select value={variant.type} onChange={(e) => handleUpdateVariantGroup(vIndex, 'type', e.target.value)} className="text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 py-1.5 bg-white">
                                            <option value="radio">Pilih Satu (Radio)</option>
                                            <option value="checkbox">Pilih Banyak (Checkbox)</option>
                                        </select>
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-600 cursor-pointer">
                                            <input type="checkbox" checked={variant.is_required} onChange={(e) => handleUpdateVariantGroup(vIndex, 'is_required', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                                            Wajib Pilih
                                        </label>
                                    </div>
                                </div>

                                {/* Variant Items List */}
                                <div className="p-4 space-y-2">
                                    {variant.items.map((item, iIndex) => (
                                        <div key={iIndex} className="flex gap-2 items-center">
                                            <input type="text" value={item.name} onChange={(e) => handleUpdateItem(vIndex, iIndex, 'name', e.target.value)} placeholder="Nama Pilihan (Msl: Pedas Mampus)" className="flex-1 border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500" />
                                            <div className="relative w-32 shrink-0">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">Rp</span>
                                                <input type="number" value={item.price} onChange={(e) => handleUpdateItem(vIndex, iIndex, 'price', e.target.value)} className="w-full pl-8 border-gray-200 rounded-lg text-sm font-bold focus:ring-blue-500 focus:border-blue-500" placeholder="0" />
                                            </div>
                                            <button onClick={() => handleRemoveItem(vIndex, iIndex)} className="text-gray-400 hover:text-red-500 p-2"><BiTrash /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => handleAddItem(vIndex)} className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-2 px-2 py-1 rounded hover:bg-blue-50 transition-colors">
                                        <BiPlus /> Tambah Pilihan
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                    
                    <button onClick={handleAddVariantGroup} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl text-slate-500 font-bold hover:bg-gray-50 hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center gap-2">
                        <BiPlus className="text-xl" /> Tambah Grup Varian
                    </button>
                </div>

                {/* Footer Actions */}
                <div className="p-5 bg-white border-t border-gray-200 shrink-0">
                    <button onClick={handleSave} disabled={isSaving} className="w-full py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all flex justify-center items-center gap-2 disabled:opacity-50">
                        {isSaving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <><BiCheckCircle className="text-xl" /> Simpan Konfigurasi</>}
                    </button>
                </div>
            </div>
        </>
    );
}