import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react"; 
import { CartStore } from "@/Utils/CartStore"; 
import { BiArrowBack, BiRightArrowAlt } from "react-icons/bi";
import ProductDetailModal from '@/Components/ProductDetailModal';
import { Toaster, toast } from "sonner"; 
import { AnimatePresence } from "framer-motion";

// IMPORT KOMPONEN BARU
import EmptyCart from "@/Components/Customer/Cart/EmptyCart";
import CartItem from "@/Components/Customer/Cart/CartItem";
import CartPromo from "@/Components/Customer/Cart/CartPromo";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function Cart({ table, products }) {
    // --- STATE ---
    const [cartItems, setCartItems] = useState([]);
    const [activePromo, setActivePromo] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    
    // Modal Edit State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingCartItem, setEditingCartItem] = useState(null);

    // --- EFFECTS ---
    useEffect(() => {
        loadCart();
        loadPromo();
    }, []);

    useEffect(() => {
        calculateDiscount();
    }, [cartItems, activePromo]);

    // --- HELPERS ---
    const loadCart = () => setCartItems(CartStore.getCart(table.table_number));
    
    const loadPromo = () => {
        const stored = localStorage.getItem(`active_promo_${table.table_number}`);
        if (stored) setActivePromo(JSON.parse(stored));
    };

    const calculateDiscount = () => {
        const subtotal = cartItems.reduce((acc, item) => acc + (item.total_price_per_item * item.qty), 0);
        
        if (!activePromo || subtotal < activePromo.min_spend) {
            setDiscountAmount(0);
            return;
        }

        let pot = activePromo.type === 'fixed' ? activePromo.discount_amount : subtotal * (activePromo.discount_amount / 100);
        if (activePromo.max_discount && pot > activePromo.max_discount) pot = activePromo.max_discount;
        
        setDiscountAmount(Math.min(pot, subtotal));
    };

    // --- HANDLERS ---
    const handleUpdateQty = (cartId, delta) => setCartItems(CartStore.updateQty(table.table_number, cartId, delta));

    const handleRemoveItem = (cartId) => {
        toast("Hapus menu ini?", {
            action: {
                label: "Ya",
                onClick: () => {
                    setCartItems(CartStore.removeItem(table.table_number, cartId));
                    toast.success("Menu dihapus.");
                }
            },
            cancel: { label: "Batal" }
        });
    };

    const handleEditItem = (item) => {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
            setEditingProduct(product);
            setEditingCartItem(item);
            setIsModalOpen(true);
        }
    };

    const handleSaveEdit = (p, q, n, v) => {
        if (editingCartItem) CartStore.removeItem(table.table_number, editingCartItem.cart_id);
        CartStore.addItem(table.table_number, p, q, n, v);
        loadCart();
        setIsModalOpen(false);
        toast.success("Pesanan diupdate!");
    };

    const handleRemovePromo = () => {
        localStorage.removeItem(`active_promo_${table.table_number}`);
        setActivePromo(null);
        toast.info("Promo dilepas.");
    };

    // --- RENDER ---
    const subtotal = cartItems.reduce((acc, item) => acc + (item.total_price_per_item * item.qty), 0);
    const totalAfterDiscount = subtotal - discountAmount;

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-800 pb-40">
            <Head title={`Keranjang - Meja ${table.table_number}`} />
            <Toaster position="top-center" richColors />

            {/* HEADER */}
            <header className="bg-white px-6 py-4 sticky top-0 z-50 shadow-sm flex items-center gap-4">
                <Link href={route('customer.menu', table.table_number)} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                    <BiArrowBack className="text-xl text-slate-700" />
                </Link>
                <div>
                    <h1 className="text-lg font-bold text-slate-900 leading-none">Keranjang</h1>
                    <span className="text-xs text-slate-500">Meja {table.table_number}</span>
                </div>
            </header>

            <main className="p-6 space-y-6">
                {cartItems.length === 0 ? (
                    <EmptyCart tableNumber={table.table_number} />
                ) : (
                    <>
                        {/* LIST ITEM */}
                        <div className="space-y-4">
                            <AnimatePresence>
                                {cartItems.map((item) => (
                                    <CartItem 
                                        key={item.cart_id} 
                                        item={item} 
                                        onUpdateQty={handleUpdateQty} 
                                        onRemove={handleRemoveItem} 
                                        onEdit={handleEditItem} 
                                    />
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* PROMO SECTION */}
                        <CartPromo 
                            activePromo={activePromo} 
                            subtotal={subtotal} 
                            discountAmount={discountAmount} 
                            onRemove={handleRemovePromo} 
                            tableNumber={table.table_number} 
                        />
                    </>
                )}
            </main>

            {/* FOOTER ACTION */}
            {cartItems.length > 0 && (
                <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-5 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                    <div className="space-y-1 mb-4">
                         <div className="flex justify-between items-center text-xs text-gray-400">
                            <span>Subtotal</span><span>{formatRupiah(subtotal)}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between items-center text-xs text-green-600 font-bold">
                                <span>Diskon Promo</span><span>- {formatRupiah(discountAmount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm font-bold text-slate-500">Total Sementara</span>
                            <span className="text-xl font-black text-slate-900">{formatRupiah(totalAfterDiscount)}</span>
                        </div>
                    </div>
                    
                    <Link href={route('customer.checkout', table.table_number)} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-slate-800">
                        Lanjut Pembayaran <BiRightArrowAlt className="text-2xl" />
                    </Link>
                </div>
            )}

            <ProductDetailModal 
                isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
                product={editingProduct} initialData={editingCartItem} onAddToCart={handleSaveEdit}
            />
        </div>
    );
}