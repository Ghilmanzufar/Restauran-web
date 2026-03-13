import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { 
    BiX, BiPlus, BiTrash, BiCheckCircle, 
    BiUpArrowAlt, BiDownArrowAlt, BiShow, BiHide, BiStar 
} from 'react-icons/bi';
import { toast } from 'sonner';

export default function VariantManager({ isOpen, onClose, product }) {
    const [variants, setVariants] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen && product) {
            setVariants(product.variants ? JSON.parse(JSON.stringify(product.variants)) : []);
        }
    }, [isOpen, product]);

    // --- MANAJEMEN GRUP ---
    const handleAddVariantGroup = () => setVariants([...variants, { name: '', type: 'radio', is_required: false, max_select: null, items: [] }]);
    const handleRemoveVariantGroup = (index) => setVariants(variants.filter((_, i) => i !== index));
    const handleUpdateVariantGroup = (index, field, value) => {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    };

    // --- MANAJEMEN ITEM (PILIHAN) ---
    const handleAddItem = (vIndex) => {
        const newVariants = [...variants];
        newVariants[vIndex].items.push({ name: '', price: 0, is_default: false, is_active: true });
        setVariants(newVariants);
    };
    const handleRemoveItem = (vIndex, iIndex) => {
        const newVariants = [...variants];
        newVariants[vIndex].items = newVariants[vIndex].items.filter((_, i) => i !== iIndex);
        setVariants(newVariants);
    };
    const handleUpdateItem = (vIndex, iIndex, field, value) => {
        const newVariants = [...variants];
        
        // Logika Radio: Jika satu item diset Default, matikan default item lainnya
        if (field === 'is_default' && value === true && newVariants[vIndex].type === 'radio') {
            newVariants[vIndex].items.forEach(item => item.is_default = false);
        }
        
        newVariants[vIndex].items[iIndex][field] = value;
        setVariants(newVariants);
    };

    // --- FITUR BARU: REORDER (PINDAH ATAS/BAWAH) ---
    const handleMoveItem = (vIndex, iIndex, direction) => {
        const newVariants = [...variants];
        const items = newVariants[vIndex].items;
        if (direction === 'up' && iIndex > 0) {
            [items[iIndex - 1], items[iIndex]] = [items[iIndex], items[iIndex - 1]];
        } else if (direction === 'down' && iIndex < items.length - 1) {
            [items[iIndex + 1], items[iIndex]] = [items[iIndex], items[iIndex + 1]];
        }
        setVariants(newVariants);
    };

    // --- SIMPAN & VALIDASI ---
    const handleSave = () => {
        // PERBAIKAN BUG VALIDASI: Cek string kosong dan item kosong
        const isInvalid = variants.some(v => 
            !v.name || v.name.trim() === '' || 
            v.items.length === 0 || // Cegah grup tanpa pilihan
            v.items.some(i => !i.name || i.name.trim() === '')
        );
        
        if (isInvalid) {
            toast.error("Gagal! Pastikan nama grup terisi dan setiap grup minimal punya 1 pilihan yang namanya tidak kosong.");
            return;
        }

        setIsSaving(true);
        router.post(route('admin.menu.variants.sync', product.id), { variants }, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Varian berhasil disimpan!'); onClose(); },
            onError: () => toast.error("Terjadi kesalahan sistem saat menyimpan varian."),
            onFinish: () => setIsSaving(false)
        });
    };

    return (
        <div className={`fixed inset-0 z-50 flex justify-end transition-all duration-300 ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
            <div className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
            
            <div className={`relative w-full max-w-2xl bg-slate-50 h-full shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                
                {/* Header */}
                <div className="p-6 bg-white border-b border-gray-200 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">Atur Varian Menu</h2>
                        <p className="text-sm font-bold text-slate-400">"{product?.name}"</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex justify-center items-center transition-colors"><BiX className="text-2xl" /></button>
                </div>

                {/* Body - List Varian */}
                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
                    {variants.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-gray-300">
                            <p className="text-slate-400 font-bold mb-3">Menu ini belum punya varian tambahan.</p>
                        </div>
                    ) : (
                        variants.map((variant, vIndex) => (
                            <div key={vIndex} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                
                                {/* Header Grup Varian */}
                                <div className="p-4 bg-slate-100/50 border-b border-gray-200 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                    <div className="flex-1 w-full space-y-3">
                                        <input 
                                            type="text" value={variant.name} onChange={(e) => handleUpdateVariantGroup(vIndex, 'name', e.target.value)}
                                            className="w-full text-lg font-black border-none bg-transparent p-0 focus:ring-0 placeholder:text-gray-400" placeholder="Nama Grup (Msl: Level Pedas, Topping)"
                                        />
                                        
                                        <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-600">
                                            {/* Type Dropdown */}
                                            <select value={variant.type} onChange={(e) => handleUpdateVariantGroup(vIndex, 'type', e.target.value)} className="bg-white border-gray-300 rounded-lg text-xs font-bold py-1.5 focus:ring-blue-500">
                                                <option value="radio">Pilih Satu (Radio)</option>
                                                <option value="checkbox">Pilih Banyak (Checkbox)</option>
                                            </select>
                                            
                                            {/* Is Required */}
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={variant.is_required} onChange={(e) => handleUpdateVariantGroup(vIndex, 'is_required', e.target.checked)} className="rounded text-blue-600" /> Wajib Pilih
                                            </label>

                                            {/* FITUR BARU: Max Select untuk Checkbox */}
                                            {variant.type === 'checkbox' && (
                                                <label className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-gray-200">
                                                    Max Pilihan: 
                                                    <input 
                                                        type="number" min="1" placeholder="∞" value={variant.max_select || ''} 
                                                        onChange={(e) => handleUpdateVariantGroup(vIndex, 'max_select', e.target.value ? Number(e.target.value) : null)} 
                                                        className="w-16 h-6 p-1 text-xs text-center border-gray-300 rounded focus:ring-blue-500" 
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                    <button onClick={() => handleRemoveVariantGroup(vIndex)} className="w-10 h-10 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl flex items-center justify-center shrink-0 transition-colors" title="Hapus Grup">
                                        <BiTrash className="text-xl" />
                                    </button>
                                </div>

                                {/* List Pilihan (Items) */}
                                <div className="p-4 bg-white space-y-3">
                                    {variant.items.map((item, iIndex) => (
                                        <div key={iIndex} className={`flex flex-col sm:flex-row gap-3 items-center bg-slate-50 p-2.5 border rounded-xl transition-colors ${!item.is_active ? 'border-gray-200 opacity-60' : item.is_default ? 'border-blue-300 bg-blue-50/30' : 'border-gray-100'}`}>
                                            
                                            {/* FITUR BARU: Reorder Buttons */}
                                            <div className="flex flex-col gap-1 shrink-0">
                                                <button onClick={() => handleMoveItem(vIndex, iIndex, 'up')} disabled={iIndex === 0} className="text-slate-400 hover:text-blue-600 disabled:opacity-30"><BiUpArrowAlt className="text-lg" /></button>
                                                <button onClick={() => handleMoveItem(vIndex, iIndex, 'down')} disabled={iIndex === variant.items.length - 1} className="text-slate-400 hover:text-blue-600 disabled:opacity-30"><BiDownArrowAlt className="text-lg" /></button>
                                            </div>

                                            {/* Input Nama & Harga (Number Parser) */}
                                            <input type="text" value={item.name} onChange={(e) => handleUpdateItem(vIndex, iIndex, 'name', e.target.value)} className="w-full sm:flex-1 text-sm font-bold border-gray-300 rounded-lg focus:border-blue-500" placeholder="Nama Pilihan (Msl: Sedang, Ekstra Keju)" maxLength={50} />
                                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                                <span className="text-xs font-bold text-slate-400 bg-white px-2 py-2 border border-gray-200 rounded-lg">Rp</span>
                                                <input type="number" value={item.price} onChange={(e) => handleUpdateItem(vIndex, iIndex, 'price', Number(e.target.value))} className="w-full sm:w-28 text-sm font-black border-gray-300 rounded-lg focus:border-blue-500 text-right" placeholder="0" />
                                            </div>

                                            {/* FITUR BARU: Toggle Active & Default */}
                                            <div className="flex items-center gap-1 shrink-0 bg-white p-1 rounded-lg border border-gray-200">
                                                <button onClick={() => handleUpdateItem(vIndex, iIndex, 'is_default', !item.is_default)} className={`p-1.5 rounded-md ${item.is_default ? 'bg-yellow-100 text-yellow-600' : 'text-slate-300 hover:text-yellow-500'}`} title="Jadikan Pilihan Default">
                                                    <BiStar className="text-lg" />
                                                </button>
                                                <button onClick={() => handleUpdateItem(vIndex, iIndex, 'is_active', !item.is_active)} className={`p-1.5 rounded-md ${item.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'}`} title={item.is_active ? "Nonaktifkan (Habis)" : "Aktifkan"}>
                                                    {item.is_active ? <BiShow className="text-lg" /> : <BiHide className="text-lg" />}
                                                </button>
                                                <button onClick={() => handleRemoveItem(vIndex, iIndex)} className="p-1.5 rounded-md text-red-300 hover:text-red-500 hover:bg-red-50 ml-1"><BiTrash className="text-lg" /></button>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <button onClick={() => handleAddItem(vIndex)} className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-2 px-3 py-2 border border-dashed border-blue-300 rounded-xl hover:bg-blue-50 transition-colors">
                                        <BiPlus className="text-lg" /> Tambah Pilihan Item
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                    
                    <button onClick={handleAddVariantGroup} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-slate-500 font-bold hover:bg-gray-50 hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center gap-2">
                        <BiPlus className="text-2xl" /> Tambah Grup Varian Baru
                    </button>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-white border-t border-gray-200 shrink-0">
                    <button onClick={handleSave} disabled={isSaving} className="w-full py-3.5 bg-blue-600 text-white font-black text-lg rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all flex justify-center items-center gap-2 disabled:opacity-50">
                        {isSaving ? <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></span> : <><BiCheckCircle className="text-2xl" /> Simpan Konfigurasi</>}
                    </button>
                </div>
            </div>
        </div>
    );
}