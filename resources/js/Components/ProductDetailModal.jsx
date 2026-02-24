import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    BiX, BiMinus, BiPlus, BiSolidStar, BiNote, BiCheck, BiDish 
} from "react-icons/bi";

// Helper Format Rupiah
const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(number);
};

export default function ProductDetailModal({ isOpen, onClose, product, onAddToCart, initialData = null }) {
    const [qty, setQty] = useState(1);
    const [note, setNote] = useState("");
    const [selectedVariants, setSelectedVariants] = useState({});

    useEffect(() => {
        if (isOpen && product) {
            // LOGIC BARU: Cek apakah ini Mode Edit (ada initialData)?
            if (initialData) {
                setQty(initialData.qty);
                setNote(initialData.note || "");
                setSelectedVariants(initialData.selectedVariantsMap || {});
            } else {
                // Mode Tambah Baru (Reset Default)
                setQty(1);
                setNote("");
                setSelectedVariants({});
                
                // Auto-select required
                const initialSelections = {};
                product.variants?.forEach(v => {
                    if (v.is_required && v.type === 'radio' && v.items.length > 0) {
                        initialSelections[v.id] = v.items[0].id;
                    }
                });
                setSelectedVariants(initialSelections);
            }
        }
    }, [isOpen, product, initialData]);

    // Hitung Total Harga (Harga Dasar + Varian) * Qty
    const calculateTotal = () => {
        if (!product) return 0;
        let variantTotal = 0;

        product.variants?.forEach(v => {
            const selectedId = selectedVariants[v.id];
            if (selectedId) {
                const item = v.items.find(i => i.id === selectedId);
                if (item) variantTotal += parseFloat(item.price);
            }
        });

        return (parseFloat(product.price) + variantTotal) * qty;
    };

    // --- LOGIC BARU: TOGGLE OPSI ---
    const handleSelectOption = (variant, itemId) => {
        setSelectedVariants(prev => {
            // Cek apakah item ini sedang dipilih?
            const isCurrentlySelected = prev[variant.id] === itemId;

            // Jika SUDAH dipilih DAN varian ini TIDAK WAJIB (Optional) -> Hapus (Uncheck)
            if (isCurrentlySelected && !variant.is_required) {
                const newState = { ...prev };
                delete newState[variant.id]; // Hapus key varian ini dari state
                return newState;
            }

            // Jika belum dipilih atau Wajib -> Pilih item ini (Gantikan yang lama)
            return {
                ...prev,
                [variant.id]: itemId
            };
        });
    };

    if (!product) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* BACKDROP GELAP */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 z-[60] backdrop-blur-sm"
                    />

                    {/* MODAL SHEET (Slide Up) */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 inset-x-0 z-[70] bg-[#F8F9FA] h-[90vh] rounded-t-[32px] overflow-hidden flex flex-col shadow-2xl"
                    >
                        {/* --- 1. HERO IMAGE (Fix Height) --- */}
                        <div className="relative h-[350px] shrink-0 w-full bg-slate-200">
                            <img 
                                src={product.image_url} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent pointer-events-none"></div>

                            {/* Tombol Close */}
                            <button 
                                onClick={onClose} 
                                className="absolute top-5 right-5 w-10 h-10 bg-white/90 text-slate-900 rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform active:scale-90"
                            >
                                <BiX />
                            </button>
                        </div>

                        {/* --- 2. CONTENT AREA (Overlapping) --- */}
                        <div className="flex-1 overflow-y-auto relative z-10 -mt-12 bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                            
                            {/* Handle Bar Visual */}
                            <div className="sticky top-0 bg-white pt-4 pb-2 z-20 flex justify-center rounded-t-[32px]">
                                <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
                            </div>

                            <div className="px-6 pb-32">
                                {/* Header Produk */}
                                <div className="mb-8">
                                    <div className="flex justify-between items-start mb-2 gap-4">
                                        <h2 className="text-2xl font-black text-slate-800 leading-tight">
                                            {product.name}
                                        </h2>
                                        <div className="shrink-0 text-right">
                                            <span className="text-xl font-bold text-orange-600">
                                                {formatRupiah(product.price)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <p className="text-slate-500 text-sm leading-relaxed mt-2">
                                        {product.description || "Menu favorit pilihan chef dengan bahan berkualitas."}
                                    </p>

                                    {/* Rating & Info */}
                                    <div className="flex items-center gap-3 mt-4">
                                        <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-lg text-xs font-bold">
                                            <BiSolidStar className="text-orange-500" /> 4.8
                                        </div>
                                        <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                            <BiDish /> Stok: {product.stock_qty}
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-dashed border-gray-200 mb-8" />

                                {/* --- 3. VARIAN (Dynamic Options) --- */}
                                <div className="space-y-8">
                                    {product.variants?.map((variant) => (
                                        <div key={variant.id}>
                                            <div className="flex justify-between items-end mb-3">
                                                <h3 className="font-bold text-slate-900 text-[15px]">{variant.name}</h3>
                                                {variant.is_required ? (
                                                    <span className="text-[10px] uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-1 rounded-md font-bold">
                                                        Wajib
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded-md font-bold">
                                                        Opsional
                                                    </span>
                                                )}
                                            </div>

                                            {/* Pilihan Chips */}
                                            <div className="flex flex-wrap gap-3">
                                                {variant.items.map((item) => {
                                                    const isSelected = selectedVariants[variant.id] === item.id;
                                                    return (
                                                        <button
                                                            key={item.id}
                                                            // UPDATE PENTING: Kirim object variant, bukan cuma ID
                                                            onClick={() => handleSelectOption(variant, item.id)}
                                                            className={`relative px-4 py-3 rounded-2xl text-sm font-medium border-2 transition-all flex items-center gap-2 active:scale-95 ${
                                                                isSelected
                                                                    ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                                                                    : "bg-white text-slate-600 border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                                                            }`}
                                                        >
                                                            {item.name}
                                                            
                                                            {/* Harga Tambahan */}
                                                            {parseFloat(item.price) > 0 && (
                                                                <span className={`text-xs font-bold ml-1 ${isSelected ? "text-orange-300" : "text-orange-600"}`}>
                                                                    +{formatRupiah(item.price)}
                                                                </span>
                                                            )}

                                                            {/* Centang Hijau jika terpilih */}
                                                            {isSelected && (
                                                                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-0.5 border-2 border-white shadow-sm">
                                                                    <BiCheck />
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Catatan Manual */}
                                    <div>
                                        <label className="font-bold text-slate-900 text-[15px] mb-3 flex items-center gap-2">
                                            <BiNote className="text-gray-400" /> Catatan Opsional
                                        </label>
                                        <textarea
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            placeholder="Contoh: Jangan terlalu pedas, kuah dipisah..."
                                            className="w-full bg-gray-50 border-transparent focus:bg-white border-2 focus:border-slate-900 rounded-2xl text-sm p-4 h-24 resize-none transition-all placeholder:text-gray-400"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- 4. FOOTER ACTION (Sticky Bottom) --- */}
                        <div className="p-4 bg-white border-t border-gray-100 z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                            <div className="flex items-center gap-4">
                                {/* Counter Qty */}
                                <div className="flex items-center bg-gray-100 rounded-2xl px-2 h-14 gap-3 border border-gray-200">
                                    <button 
                                        onClick={() => qty > 1 && setQty(qty - 1)} 
                                        className="w-10 h-10 flex items-center justify-center text-slate-600 text-xl active:scale-90 transition-transform hover:bg-white hover:shadow-sm rounded-xl"
                                    >
                                        <BiMinus />
                                    </button>
                                    <span className="font-bold text-lg w-6 text-center text-slate-900">{qty}</span>
                                    <button 
                                        onClick={() => setQty(qty + 1)} 
                                        className="w-10 h-10 flex items-center justify-center text-slate-900 text-xl active:scale-90 transition-transform hover:bg-white hover:shadow-sm rounded-xl"
                                    >
                                        <BiPlus />
                                    </button>
                                </div>

                                {/* Tombol Tambah ke Keranjang */}
                                <button
                                    onClick={() => {
                                        // Validasi Wajib Pilih
                                        const missingRequired = product.variants?.some(v => v.is_required && !selectedVariants[v.id]);
                                        if (missingRequired) {
                                            alert("Mohon lengkapi semua pilihan yang Wajib (bertanda Required).");
                                            return;
                                        }
                                        onAddToCart(product, qty, note, selectedVariants);
                                        onClose();
                                    }}
                                    className="flex-1 bg-slate-900 text-white h-14 rounded-2xl font-bold text-lg flex justify-between items-center px-6 shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-transform hover:bg-slate-800"
                                >
                                    <span>{initialData ? "Simpan Perubahan" : "Tambah"}</span>
                                    <span className="bg-white/20 px-3 py-1 rounded-lg text-sm font-mono">
                                        {formatRupiah(calculateTotal())}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}