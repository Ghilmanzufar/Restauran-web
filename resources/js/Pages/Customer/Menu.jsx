import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Head, Link } from "@inertiajs/react";
import { CartStore } from "@/Utils/CartStore";
import { BiShoppingBag, BiSolidStar, BiSearch, BiRightArrowAlt } from "react-icons/bi";
import ProductDetailModal from '@/Components/ProductDetailModal';

// Import Komponen Baru
import MenuHeader from "@/Components/Customer/Menu/MenuHeader";
import ProductCard from "@/Components/Customer/Menu/ProductCard";

const formatRupiah = (num) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);

export default function Menu({ table, categories }) {
    const [activeCategory, setActiveCategory] = useState(categories[0]?.id || 0);
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [cartSummary, setCartSummary] = useState({ totalQty: 0, totalPrice: 0 });
    const [qtyMap, setQtyMap] = useState({});
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        refreshCartData();
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const refreshCartData = () => {
        setCartSummary(CartStore.getSummary(table.table_number));
        const cart = CartStore.getCart(table.table_number);
        const map = {};
        cart.forEach(item => map[item.product_id] = (map[item.product_id] || 0) + item.qty);
        setQtyMap(map);
    };

    const scrollToCategory = (id) => {
        setActiveCategory(id);
        const element = document.getElementById(`category-${id}`);
        if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY - 230;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
    };

    const filteredCategories = categories.map(cat => ({
        ...cat,
        products: cat.products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    })).filter(cat => cat.products.length > 0);

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-800 pb-32">
            <Head title={`Menu - Meja ${table.table_number}`} />

            {/* 1. HEADER COMPONENT */}
            <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm pt-2" : "bg-white pt-6"}`}>
                <MenuHeader table={table} cartCount={cartSummary.totalQty} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                
                {/* Category Tabs */}
                {!searchQuery && (
                    <div className="border-b border-gray-100 mt-1">
                        <div className="flex gap-3 overflow-x-auto px-6 pb-3 no-scrollbar pt-2">
                            {categories.map((cat) => (
                                <button key={cat.id} onClick={() => scrollToCategory(cat.id)} className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all border ${activeCategory === cat.id ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-gray-200"}`}>{cat.name}</button>
                            ))}
                        </div>
                    </div>
                )}
            </header>

            {/* 2. MAIN CONTENT */}
            <main className={`px-5 space-y-10 ${searchQuery ? "pt-[180px]" : "pt-[240px]"}`}>
                
                {/* BANNER PROMO (LINK KE HALAMAN PROMO) */}
                {!searchQuery && (
                    <Link href={route('customer.promos', table.table_number)}>
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            whileTap={{ scale: 0.98 }} // Efek animasi saat diklik
                            className="bg-slate-900 rounded-2xl p-5 text-white relative overflow-hidden shadow-xl cursor-pointer group"
                        >
                            <div className="relative z-10 w-[65%]">
                                <div className="flex items-center gap-1 mb-2">
                                    <BiSolidStar className="text-yellow-400 text-xs" />
                                    <span className="text-orange-400 font-bold text-[10px] uppercase">Promo Spesial</span>
                                </div>
                                <h2 className="text-lg font-bold leading-tight mb-1">Makan Hemat Pakai Voucher!</h2>
                                <div className="flex items-center gap-1 text-xs text-slate-300 group-hover:text-white transition-colors">
                                    <span>Cek voucher tersedia</span> <BiRightArrowAlt />
                                </div>
                            </div>
                            <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80" className="absolute bottom-[-10px] right-[-10px] w-32 h-32 object-cover rounded-full border-4 border-slate-900 rotate-12 group-hover:rotate-6 transition-transform duration-500" alt="Promo" />
                        </motion.div>
                    </Link>
                )}

                {/* PRODUCT LIST */}
                {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => (
                        <section key={cat.id} id={`category-${cat.id}`}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-extrabold text-slate-800">{cat.name}</h2>
                                <span className="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-md font-bold">{cat.products.length}</span>
                            </div>
                            <div className="space-y-4">
                                {cat.products.map((product) => (
                                    <ProductCard 
                                        key={product.id} 
                                        product={product} 
                                        qty={qtyMap[product.id] || 0} 
                                        onClick={() => { setSelectedProduct(product); setIsModalOpen(true); }} 
                                    />
                                ))}
                            </div>
                        </section>
                    ))
                ) : (
                    <div className="text-center py-20 text-gray-400"><BiSearch className="text-5xl mx-auto mb-3 opacity-20" /><p>Menu tidak ditemukan.</p></div>
                )}
            </main>

            {/* 3. FLOATING CART */}
            <AnimatePresence>
                {cartSummary.totalQty > 0 && (
                    <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-4 z-50 pb-6 shadow-[0_-5px_30px_rgba(0,0,0,0.08)]">
                        <Link href={route('customer.cart', table.table_number)} className="w-full bg-slate-900 text-white p-4 rounded-xl shadow-lg flex justify-between items-center active:scale-[0.99] transition-transform hover:bg-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="bg-orange-500 text-white min-w-[32px] h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-slate-900">{cartSummary.totalQty}</div>
                                <div className="flex flex-col items-start leading-none"><span className="text-[10px] text-gray-400 font-medium uppercase">Total</span><span className="font-bold text-lg">{formatRupiah(cartSummary.totalPrice)}</span></div>
                            </div>
                            <div className="flex items-center gap-2 font-bold text-sm bg-white/10 px-3 py-2 rounded-lg">Lihat Keranjang <BiShoppingBag className="text-lg" /></div>
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>

            <ProductDetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} product={selectedProduct} onAddToCart={(p, q, n, v) => { CartStore.addItem(table.table_number, p, q, n, v); refreshCartData(); }} />
        </div>
    );
}