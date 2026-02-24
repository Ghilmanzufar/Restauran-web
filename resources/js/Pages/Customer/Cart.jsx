import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react"; 
import { CartStore } from "@/Utils/CartStore"; 
import { 
    BiArrowBack, BiNote, BiTrash, BiMinus, BiPlus, BiPencil, BiRightArrowAlt, BiSolidDiscount
} from "react-icons/bi";
import ProductDetailModal from '@/Components/ProductDetailModal';
import { Toaster, toast } from "sonner"; 

// Helper Rupiah
const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function Cart({ table, products }) {
    const [cartItems, setCartItems] = useState([]);
    
    // STATE PROMO (BARU)
    const [activePromo, setActivePromo] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    // State Modal Edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingCartItem, setEditingCartItem] = useState(null);

    // Load Data
    useEffect(() => {
        loadCart();
        loadPromo(); // Cek promo saat halaman dibuka
    }, []);

    const loadCart = () => {
        const items = CartStore.getCart(table.table_number);
        setCartItems(items);
    };

    // --- LOGIKA LOAD PROMO DARI SAKU ---
    const loadPromo = () => {
        const storedPromo = localStorage.getItem(`active_promo_${table.table_number}`);
        if (storedPromo) {
            setActivePromo(JSON.parse(storedPromo));
        }
    };

    // --- LOGIKA HAPUS PROMO ---
    const handleRemovePromo = () => {
        localStorage.removeItem(`active_promo_${table.table_number}`);
        setActivePromo(null);
        setDiscountAmount(0);
        toast.info("Promo dilepas.");
    };

    // Update Qty
    const handleUpdateQty = (cartId, delta) => {
        const updatedCart = CartStore.updateQty(table.table_number, cartId, delta);
        setCartItems(updatedCart);
    };

    const handleRemoveItem = (cartId) => {
        toast("Yakin ingin menghapus menu ini?", {
            description: "Menu akan hilang dari keranjangmu.",
            action: {
                label: "Ya, Hapus",
                onClick: () => {
                    const updatedCart = CartStore.removeItem(table.table_number, cartId);
                    setCartItems(updatedCart);
                    toast.success("Menu berhasil dihapus.");
                }
            },
            cancel: { label: "Batal" }
        });
    };

    const handleEditItem = (cartItem) => {
        const originalProduct = products.find(p => p.id === cartItem.product_id);
        if (originalProduct) {
            setEditingProduct(originalProduct);
            setEditingCartItem(cartItem);
            setIsModalOpen(true);
        }
    };

    const handleSaveEdit = (product, qty, note, selectedVariants) => {
        if (editingCartItem) CartStore.removeItem(table.table_number, editingCartItem.cart_id);
        CartStore.addItem(table.table_number, product, qty, note, selectedVariants);
        loadCart();
        setIsModalOpen(false);
        setEditingProduct(null);
        setEditingCartItem(null);
        toast.success("Pesanan berhasil diupdate!");
    };

    // --- HITUNG TOTAL & DISKON (LOGIC UTAMA) ---
    const subtotal = cartItems.reduce((acc, item) => acc + (item.total_price_per_item * item.qty), 0);
    
    // Hitung Diskon Real-time setiap ada perubahan subtotal/promo
    useEffect(() => {
        if (!activePromo) {
            setDiscountAmount(0);
            return;
        }

        // Cek Min Spend
        if (subtotal < activePromo.min_spend) {
            setDiscountAmount(0); // Belum memenuhi syarat
            return;
        }

        let potongan = 0;
        if (activePromo.type === 'fixed') {
            potongan = activePromo.discount_amount;
        } else {
            // Persentase
            potongan = subtotal * (activePromo.discount_amount / 100);
            // Cek Max Discount
            if (activePromo.max_discount && potongan > activePromo.max_discount) {
                potongan = activePromo.max_discount;
            }
        }
        
        // Pastikan tidak minus
        setDiscountAmount(Math.min(potongan, subtotal));

    }, [subtotal, activePromo]);

    // Total Akhir setelah diskon (Sebelum Pajak)
    // Note: Biasanya pajak dihitung SETELAH diskon
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
                    <h1 className="text-lg font-bold text-slate-900 leading-none">Keranjang Pesanan</h1>
                    <span className="text-xs text-slate-500">Meja {table.table_number}</span>
                </div>
            </header>

            <main className="p-6 space-y-6">
                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center pt-20 text-center">
                        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-4xl">🛒</div>
                        <h2 className="text-xl font-bold text-slate-800">Keranjang Kosong</h2>
                        <Link href={route('customer.menu', table.table_number)}>
                            <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg mt-4">Lihat Menu</button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.cart_id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                                <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-sm text-slate-800 line-clamp-1">{item.name}</h3>
                                            {item.variants?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {item.variants.map((v, idx) => <span key={idx} className="text-[10px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">{v.item_name}</span>)}
                                                </div>
                                            )}
                                            {item.note && <div className="text-[10px] text-orange-600 italic mt-1"><BiNote className="inline"/> "{item.note}"</div>}
                                        </div>
                                        <button onClick={() => handleRemoveItem(item.cart_id)} className="text-gray-400 hover:text-red-500 p-1"><BiTrash /></button>
                                    </div>
                                    <div className="flex justify-between items-end mt-2">
                                        <div>
                                            <span className="text-sm font-bold text-slate-900 block">{formatRupiah(item.total_price_per_item * item.qty)}</span>
                                            <button onClick={() => handleEditItem(item)} className="text-[10px] font-bold text-orange-500 flex items-center gap-1 mt-1"><BiPencil /> Edit</button>
                                        </div>
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                                            <button onClick={() => handleUpdateQty(item.cart_id, -1)} className="w-6 h-6 rounded bg-white shadow-sm flex items-center justify-center text-xs"><BiMinus/></button>
                                            <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                                            <button onClick={() => handleUpdateQty(item.cart_id, 1)} className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center text-xs"><BiPlus/></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- BAGIAN PROMO --- */}
                {cartItems.length > 0 && (
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-sm flex items-center gap-2"><BiSolidDiscount className="text-orange-500"/> Voucher & Promo</h3>
                            <Link href={route('customer.promos', table.table_number)} className="text-xs text-orange-600 font-bold hover:underline">Lihat Semua</Link>
                        </div>
                        
                        {activePromo ? (
                            <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex justify-between items-center">
                                <div>
                                    <span className="text-xs font-bold text-green-700 block">{activePromo.name}</span>
                                    {subtotal < activePromo.min_spend ? (
                                        <span className="text-[10px] text-red-500">Min. belanja {formatRupiah(activePromo.min_spend)}</span>
                                    ) : (
                                        <span className="text-[10px] text-green-600">Hemat {formatRupiah(discountAmount)}</span>
                                    )}
                                </div>
                                <button onClick={handleRemovePromo} className="text-gray-400 hover:text-red-500"><BiTrash /></button>
                            </div>
                        ) : (
                            <Link href={route('customer.promos', table.table_number)} className="block border border-dashed border-gray-300 rounded-xl p-3 text-center text-xs text-gray-400 hover:bg-gray-50 transition-colors">
                                Hemat pakai promo? Klik di sini
                            </Link>
                        )}
                    </div>
                )}
            </main>

            {/* FOOTER ACTION */}
            {cartItems.length > 0 && (
                <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-5 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                    <div className="space-y-1 mb-4">
                         <div className="flex justify-between items-center text-xs text-gray-400">
                            <span>Subtotal</span>
                            <span>{formatRupiah(subtotal)}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between items-center text-xs text-green-600 font-bold">
                                <span>Diskon Promo</span>
                                <span>- {formatRupiah(discountAmount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm font-bold text-slate-500">Total Sementara</span>
                            <span className="text-xl font-black text-slate-900">{formatRupiah(totalAfterDiscount)}</span>
                        </div>
                    </div>
                    
                    <Link 
                        href={route('customer.checkout', table.table_number)} 
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
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