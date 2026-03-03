import React, { useState, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { 
    BiSearch, BiPlus, BiEditAlt, BiTrash, BiPowerOff, 
    BiFilterAlt, BiInfoCircle, BiX, BiListUl
} from "react-icons/bi";
import { Toaster, toast } from "sonner";
import FormModal from "./FormModal";
import VariantManager from "./VariantManager"; // <--- TAMBAHKAN INI
import Modal from "@/Components/Modal"; // Modal bawaan Breeze untuk Delete

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function MenuIndex({ products, categories }) {
    // --- STATES ---
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [sortBy, setSortBy] = useState("name_asc"); // name_asc, price_asc, price_desc
    
    // States Modals
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null });
    // --- STATE VARIANT MANAGER ---
    const [variantManager, setVariantManager] = useState({ isOpen: false, product: null });

    // State Loading per Item (Untuk mencegah double click saat ganti stok)
    const [loadingToggles, setLoadingToggles] = useState({});

    // --- LOGIC: FILTER & SORTING ---
    const processedProducts = useMemo(() => {
        let result = products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
            // Gunakan toString() untuk mencegah bug beda tipe data (number vs string)
            const matchesCategory = activeCategory === "all" || String(product.category_id) === String(activeCategory);
            return matchesSearch && matchesCategory;
        });

        // Sorting Logic
        if (sortBy === "name_asc") result.sort((a, b) => a.name.localeCompare(b.name));
        if (sortBy === "price_asc") result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        if (sortBy === "price_desc") result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));

        return result;
    }, [products, searchQuery, activeCategory, sortBy]);

    // --- LOGIC: QUICK STATS ---
    const stats = useMemo(() => ({
        total: products.length,
        empty: products.filter(p => !p.is_available).length,
        categories: categories.length
    }), [products, categories]);

    // --- ACTIONS ---
    const handleToggleStock = (productId, isAvailableNow) => {
        if (loadingToggles[productId]) return; // Cegah double click
        
        // Set loading state khusus untuk tombol ini
        setLoadingToggles(prev => ({ ...prev, [productId]: true }));

        router.post(route('admin.menu.toggle', productId), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(isAvailableNow ? "Menu ditandai Habis!" : "Menu tersedia kembali!"),
            onFinish: () => setLoadingToggles(prev => ({ ...prev, [productId]: false })) // Matikan loading
        });
    };

    const confirmDelete = () => {
        if (!deleteModal.productId) return;
        router.delete(route('admin.menu.destroy', deleteModal.productId), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Menu berhasil dihapus!");
                setDeleteModal({ isOpen: false, productId: null });
            }
        });
    };

    const openAddModal = () => { setEditingProduct(null); setIsFormModalOpen(true); };
    const openEditModal = (product) => { setEditingProduct(product); setIsFormModalOpen(true); };

    return (
        <AdminLayout title="Manajemen Menu">
            <Head title="Manajemen Menu" />
            <Toaster position="top-center" richColors />

            {/* --- 1. QUICK STATS MINI --- */}
            <div className="flex gap-4 mb-6">
                <div className="bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">{stats.total}</span>
                    <span className="text-sm font-bold text-slate-600">Total Menu</span>
                </div>
                <div className="bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-black text-sm">{stats.empty}</span>
                    <span className="text-sm font-bold text-slate-600">Stok Habis</span>
                </div>
                <div className="bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black text-sm">{stats.categories}</span>
                    <span className="text-sm font-bold text-slate-600">Kategori</span>
                </div>
            </div>

            {/* --- 2. HEADER: SEARCH, SORT & ADD --- */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <div className="flex flex-1 w-full gap-3">
                    {/* Search */}
                    <div className="relative w-full lg:w-96 group">
                        <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-blue-500 transition-colors" />
                        <input 
                            type="text" placeholder="Cari nama menu..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-11 pr-4 text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 shadow-sm"
                        />
                    </div>
                    {/* Sorting Dropdown */}
                    <div className="relative shrink-0">
                        <select 
                            value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                            className="appearance-none bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-8 text-sm font-semibold text-slate-600 focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-sm"
                        >
                            <option value="name_asc">A - Z</option>
                            <option value="price_asc">Termurah</option>
                            <option value="price_desc">Termahal</option>
                        </select>
                        <BiFilterAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                <button disabled={isFormModalOpen} onClick={openAddModal} className="w-full lg:w-auto px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50">
                    <BiPlus className="text-xl" /> Tambah Menu Baru
                </button>
            </div>

            {/* --- 3. FILTER KATEGORI (PILLS) --- */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6 border-b border-gray-200">
                <button 
                    onClick={() => setActiveCategory("all")}
                    className={`px-4 py-2 rounded-t-lg text-sm font-bold whitespace-nowrap transition-all border-b-2 ${activeCategory === "all" ? "text-blue-600 border-blue-600 bg-blue-50/50" : "text-slate-500 border-transparent hover:text-slate-800 hover:border-gray-300"}`}
                >
                    Semua Menu
                </button>
                {categories.map(category => (
                    <button 
                        key={category.id} onClick={() => setActiveCategory(category.id)}
                        className={`px-4 py-2 rounded-t-lg text-sm font-bold whitespace-nowrap transition-all border-b-2 ${String(activeCategory) === String(category.id) ? "text-blue-600 border-blue-600 bg-blue-50/50" : "text-slate-500 border-transparent hover:text-slate-800 hover:border-gray-300"}`}
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            {/* Info Teks Kecil */}
            <div className="text-xs font-semibold text-gray-400 mb-4">Menampilkan {processedProducts.length} menu</div>

            {/* --- 4. GRID PRODUK --- */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {processedProducts.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-400 font-semibold flex flex-col items-center">
                        <BiInfoCircle className="text-4xl mb-2 opacity-30" />
                        Pencarian tidak menemukan hasil.
                    </div>
                ) : (
                    processedProducts.map(product => {
                        const isAvailable = product.is_available;
                        const isLoading = loadingToggles[product.id];

                        return (
                            <div key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col transition-all shadow-sm hover:shadow-md h-[340px] relative group">
                                
                                {/* Gambar Produk */}
                                <div className="h-40 bg-gray-100 relative overflow-hidden shrink-0">
                                    {product.image_url ? (
                                        <img src={`/storage/${product.image_url}`} alt={product.name} className={`w-full h-full object-cover transition-all ${!isAvailable && 'grayscale brightness-50'}`} />
                                    ) : (
                                        <div className={`w-full h-full flex items-center justify-center text-gray-300 font-bold uppercase tracking-widest text-xs ${!isAvailable && 'bg-gray-200'}`}>No Image</div>
                                    )}
                                    
                                    {/* Badge HABIS RAKSASA (Kontras Tinggi) */}
                                    {!isAvailable && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] z-10">
                                            <span className="border-4 border-red-500 text-red-500 font-black text-2xl px-3 py-1 -rotate-12 uppercase tracking-widest bg-white/90 shadow-xl">HABIS</span>
                                        </div>
                                    )}

                                    {/* Badge Kategori */}
                                    <div className="absolute top-2 left-2 bg-slate-900/70 text-white backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest z-20">
                                        {product.category?.name || 'Uncategorized'}
                                    </div>
                                </div>

                                {/* Detail Info (Tinggi Konsisten) */}
                                <div className="p-4 flex-1 flex flex-col justify-between">
                                    <div>
                                        {/* Line clamp memastikan maksimal 2 baris */}
                                        <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1 line-clamp-2" title={product.name}>{product.name}</h3>
                                        <p className="text-lg font-black text-slate-900 mb-2">{formatRupiah(product.price)}</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 pt-3 border-t border-gray-50 mt-auto">
                                        {/* TOGGLE STOK (Dengan Spinner) */}
                                        <button 
                                            disabled={isLoading}
                                            onClick={() => handleToggleStock(product.id, isAvailable)}
                                            className={`flex-1 py-2 rounded-lg font-bold text-xs flex justify-center items-center gap-1 transition-all ${
                                                isLoading ? 'bg-gray-100 text-gray-400 cursor-wait' :
                                                isAvailable ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                            }`}
                                        >
                                            {isLoading ? <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></span> : (
                                                <><BiPowerOff className="text-base" /> {isAvailable ? "Ready" : "Habis"}</>
                                            )}
                                        </button>

                                        {/* Tombol VARIAN */}
                                        <button onClick={() => setVariantManager({ isOpen: true, product })} className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex justify-center items-center hover:bg-purple-100 transition-colors shrink-0" title="Atur Varian">
                                            <BiListUl />
                                        </button>
                                        {/* Edit & Delete */}
                                        <button onClick={() => openEditModal(product)} className="w-8 h-8 bg-slate-50 text-slate-600 rounded-lg flex justify-center items-center hover:bg-slate-200 transition-colors shrink-0">
                                            <BiEditAlt />
                                        </button>
                                        <button onClick={() => setDeleteModal({ isOpen: true, productId: product.id })} className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex justify-center items-center hover:bg-red-100 transition-colors shrink-0">
                                            <BiTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* --- MODALS --- */}
            <FormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} product={editingProduct} categories={categories} />

            {/* CUSTOM DELETE MODAL (Modern) */}
            <Modal show={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, productId: null })} maxWidth="sm">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                        <BiTrash />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Hapus Menu Ini?</h3>
                    <p className="text-sm font-semibold text-gray-500 mb-6">Menu akan dihapus dari sistem (Soft Delete). Aksi ini tidak dapat dibatalkan.</p>
                    
                    <div className="flex gap-3">
                        <button onClick={() => setDeleteModal({ isOpen: false, productId: null })} className="flex-1 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200">
                            Batal
                        </button>
                        <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30">
                            Ya, Hapus
                        </button>
                    </div>
                </div>
            </Modal>

            <VariantManager 
                isOpen={variantManager.isOpen} 
                onClose={() => setVariantManager({ isOpen: false, product: null })} 
                product={variantManager.product} 
            />

        </AdminLayout>
    );
}