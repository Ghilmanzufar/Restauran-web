import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CartStore } from "@/Utils/CartStore"; 
import { 
    BiSearch, 
    BiShoppingBag, 
    BiCheckShield, 
    BiMinus, 
    BiPlus, 
    BiSolidStar,
    BiHistory // <--- TAMBAHKAN INI (JANGAN LUPA KOMA SEBELUMNYA)
} from "react-icons/bi";
import ProductDetailModal from '@/Components/ProductDetailModal';
import { Head, Link } from "@inertiajs/react";

// --- HELPER FORMAT RUPIAH ---
const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(number);
};

export default function MenuLayoutFinal({ table, categories }) {
    const [activeCategory, setActiveCategory] = useState(categories[0]?.id || 0);
    const [scrolled, setScrolled] = useState(false);
    
    // --- STATE CART MANAGER ---
    // cartSummary: Untuk total harga/qty di Header & Bottom Bar
    const [cartSummary, setCartSummary] = useState({ totalQty: 0, totalPrice: 0 });
    // qtyMap: Untuk menampilkan jumlah per produk di List Menu { productId: totalQty }
    const [qtyMap, setQtyMap] = useState({});

    // --- STATE MODAL ---
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- EFFECT: LOAD CART SAAT AWAL ---
    useEffect(() => {
        refreshCartData();
        
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // --- FUNCTION: REFRESH DATA DARI STORE ---
    const refreshCartData = () => {
        // 1. Update Summary (Header/Bottom)
        const summary = CartStore.getSummary(table.table_number);
        setCartSummary(summary);

        // 2. Update Qty per Produk (Untuk tampilan di Card)
        const cart = CartStore.getCart(table.table_number);
        const map = {};
        cart.forEach(item => {
            map[item.product_id] = (map[item.product_id] || 0) + item.qty;
        });
        setQtyMap(map);
    };

    // --- HANDLE TAMBAH DARI MODAL ---
    const handleAddToCartFromModal = (product, qty, note, selectedVariants) => {
        // 1. Simpan ke LocalStorage
        CartStore.addItem(table.table_number, product, qty, note, selectedVariants);
        
        // 2. Refresh UI
        refreshCartData();
    };

    // --- HANDLE KLIK TOMBOL DI LIST MENU ---
    const openProductDetail = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    // Scroll Logic
    const scrollToCategory = (id) => {
        setActiveCategory(id);
        const element = document.getElementById(`category-${id}`);
        if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY - 230;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-800 pb-32">
            <Head title={`Menu - Meja ${table.table_number}`} />

            {/* HEADER */}
            <header
                className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
                    scrolled 
                        ? "bg-white/95 backdrop-blur-md shadow-sm pt-2" 
                        : "bg-white pt-6"
                }`}
            >
                <div className="px-6 pb-2">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-1 rounded-full w-fit mb-2 border border-orange-100">
                                <BiCheckShield className="text-sm" />
                                <span className="text-[10px] font-bold tracking-wide uppercase">Verified Table</span>
                            </div>
                            <h1 className="text-2xl font-extrabold text-slate-900 leading-none">Meja {table.table_number}</h1>
                            <p className="text-sm text-slate-500 mt-1">Selamat datang, lapar ya? 👋</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* TOMBOL HISTORY BARU */}
                            <Link 
                                href={route('customer.history', table.table_number)}
                                className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-slate-700 shadow-sm active:scale-95 transition-transform"
                            >
                                <BiHistory className="text-xl" /> {/* Jangan lupa import BiHistory */}
                            </Link>

                            {/* TOMBOL CART (YANG LAMA) */}
                            <Link 
                                href={route('customer.cart', table.table_number)}
                                className="relative w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-slate-700 shadow-sm active:scale-95 transition-transform"
                            >
                                <BiShoppingBag className="text-xl" />
                                {cartSummary.totalQty > 0 && (
                                    <motion.span 
                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white"
                                    >
                                        {cartSummary.totalQty}
                                    </motion.span>
                                )}
                            </Link>
                        </div>
                    </div>
                    <div className="relative">
                        <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                        <input type="text" placeholder="Cari Nasi Goreng, Es Teh..." className="w-full bg-gray-100 border-none rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-slate-900/10 transition-all placeholder:text-gray-400" />
                    </div>
                </div>
                <div className="border-b border-gray-100 mt-1">
                    <div className="flex gap-3 overflow-x-auto px-6 pb-3 no-scrollbar pt-2">
                        {categories.map((cat) => (
                            <button key={cat.id} onClick={() => scrollToCategory(cat.id)} className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 border ${activeCategory === cat.id ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20" : "bg-white text-slate-500 border-gray-200 hover:border-gray-300"}`}>{cat.name}</button>
                        ))}
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="pt-[240px] px-5 space-y-10">
                {/* HERO PROMO */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 rounded-2xl p-5 text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
                    <div className="relative z-10 w-[65%]">
                        <div className="flex items-center gap-1 mb-2">
                            <BiSolidStar className="text-yellow-400 text-xs" />
                            <span className="text-orange-400 font-bold text-[10px] uppercase tracking-wide">Chef Recommendation</span>
                        </div>
                        <h2 className="text-lg font-bold leading-tight mb-3">Diskon 20% untuk Menu Spesial Hari Ini!</h2>
                        <button className="text-[10px] bg-white text-slate-900 px-3 py-2 rounded-lg font-bold shadow-sm active:scale-95 transition-transform">Lihat Promo</button>
                    </div>
                    <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-orange-600 rounded-full blur-[50px] opacity-40"></div>
                    <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80" className="absolute bottom-[-10px] right-[-10px] w-32 h-32 object-cover rounded-full border-4 border-slate-900 shadow-2xl rotate-12" alt="Promo" />
                </motion.div>

                {/* MENU LIST */}
                {categories.map((cat) => (
                    <section key={cat.id} id={`category-${cat.id}`}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-extrabold text-slate-800">{cat.name}</h2>
                            <span className="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-md font-bold">{cat.products.length}</span>
                        </div>
                        <div className="space-y-4">
                            {cat.products.map((product) => (
                                <ProductListItem 
                                    key={product.id} 
                                    product={product} 
                                    qty={qtyMap[product.id] || 0} // Ambil qty dari CartStore Map
                                    onClick={() => openProductDetail(product)}
                                />
                            ))}
                        </div>
                    </section>
                ))}
            </main>

            {/* BOTTOM ACTION */}
            <AnimatePresence>
                {cartSummary.totalQty > 0 && (
                    <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-4 z-50 pb-6 shadow-[0_-5px_30px_rgba(0,0,0,0.08)]">
                        {/* LINK KE CART (Halaman Keranjang) */}
                        <Link 
                            href={route('customer.cart', table.table_number)} 
                            className="w-full bg-slate-900 text-white p-4 rounded-xl shadow-lg shadow-slate-900/20 flex justify-between items-center group active:scale-[0.99] transition-transform"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-orange-500 text-white min-w-[32px] h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-slate-900">
                                    {cartSummary.totalQty}
                                </div>
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Total Sementara</span>
                                    <span className="font-bold text-lg">{formatRupiah(cartSummary.totalPrice)}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 font-bold text-sm bg-white/10 px-3 py-2 rounded-lg group-hover:bg-white/20 transition-colors">
                                Lihat Keranjang <BiShoppingBag className="text-lg" />
                            </div>
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MODAL */}
            <ProductDetailModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
                onAddToCart={handleAddToCartFromModal}
            />
        </div>
    );
}

// --- SUB-COMPONENT: PRODUCT LIST ITEM ---
function ProductListItem({ product, qty, onClick }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "50px", once: true }}
            className="bg-white p-3 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex gap-4 h-full"
        >
            <div onClick={onClick} className="w-28 h-28 shrink-0 rounded-xl bg-gray-50 overflow-hidden relative cursor-pointer active:scale-95 transition-transform">
                <img 
                    src={product.image_url} 
                    alt={product.name}
                    className={`w-full h-full object-cover transition-all duration-500 ${!product.is_available ? 'grayscale opacity-50' : ''}`}
                    loading="lazy"
                />
                {!product.is_available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-[10px] text-white font-bold bg-red-600 px-2 py-1 rounded-full shadow-sm">Habis</span>
                    </div>
                )}
            </div>

            <div className="flex-1 flex flex-col justify-between py-1">
                <div onClick={onClick} className="cursor-pointer">
                    <h3 className="font-bold text-slate-800 text-[15px] leading-snug line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{product.description || "Rasanya enak banget, wajib coba!"}</p>
                </div>

                <div className="flex justify-between items-end mt-3">
                    <span className="font-bold text-slate-900 text-[15px]">{formatRupiah(product.price)}</span>
                    
                    {/* LOGIC TOMBOL ADD: Selalu buka Modal untuk handle Varian */}
                    {product.is_available && (
                        qty === 0 ? (
                            <motion.button whileTap={{ scale: 0.9 }} onClick={onClick} className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center shadow-sm hover:bg-orange-500 hover:text-white transition-colors">
                                <BiPlus className="text-lg" />
                            </motion.button>
                        ) : (
                            <motion.button onClick={onClick} whileTap={{ scale: 0.9 }} className="flex items-center bg-slate-900 rounded-full px-3 py-1 gap-2 shadow-lg shadow-slate-900/20">
                                <span className="text-white text-xs font-bold">{qty}x</span>
                                <BiPlus className="text-white text-xs" />
                            </motion.button>
                        )
                    )}
                </div>
            </div>
        </motion.div>
    );
}