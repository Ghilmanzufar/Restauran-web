import React, { useState, useEffect, useMemo, useRef } from "react";
import { Head, router, usePage } from "@inertiajs/react"; // <-- Tambahkan usePage
import { BiDish, BiPrinter, BiWallet, BiCheckCircle } from "react-icons/bi";
import { Toaster, toast } from "sonner";
import axios from "axios"; // <--- TAMBAHKAN IMPORT AXIOS

// Import Sub-Komponen yang baru dibuat
import PosSidebar from "./Components/PosSidebar";
import PaymentModal from "./Components/PaymentModal";
import CancelModal from "./Components/CancelModal";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

export default function POSIndex({ initialOrders, tables }) {
    // 1. STATE MANAGEMENT
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const searchInputRef = useRef(null);
    const { app_settings } = usePage().props; // <-- Panggil pengaturan global

    // 2. AUTO REFRESH TRANSAKSI (POLLING ORDER)
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['initialOrders'], preserveScroll: true, preserveState: true });
        }, 5000); 
        return () => clearInterval(interval);
    }, []);

    // --- FUNGSI SERAHKAN PESANAN (UBAH STATUS KE COMPLETED) ---
    const handleCompleteOrder = () => {
        // Kita gunakan rute update-status yang sama seperti koki dapur
        router.patch(route('admin.orders.update-status', selectedOrder.id), { order_status: 'completed' }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Pesanan telah diserahkan ke pelanggan!');
                setSelectedOrder(null); // Tutup detail pesanan karena sudah selesai
            }
        });
    };

    // 3. TANGKAP URL PARAMETER MEJA
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tableId = params.get('table');
        if (tableId && initialOrders.length > 0) {
            const foundOrder = initialOrders.find(o => o.table_id == tableId && o.payment_status === 'unpaid');
            if (foundOrder) setSelectedOrder(foundOrder);
            window.history.replaceState({}, '', '/admin/pos');
        }
    }, [initialOrders]);

    // --- TAMBAHAN BARU: 4. RADAR PANGGILAN MEJA KHUSUS POS ---
    useEffect(() => {
        const checkServiceCalls = async () => {
            try {
                const res = await axios.get('/admin/api/service-calls/pending');
                const { count, latest } = res.data;

                if (count > 0 && latest) {
                    const lastId = sessionStorage.getItem('lastServiceCallId');
                    if (lastId !== latest.id.toString()) {
                        toast.warning(`Meja ${latest.table_number} Memanggil!`, {
                            description: `Pelanggan butuh bantuan.`,
                            action: {
                                label: 'Tangani',
                                onClick: () => router.get('/admin/service-calls')
                            },
                            duration: 10000, 
                        });
                        sessionStorage.setItem('lastServiceCallId', latest.id);
                    }
                }
            } catch (error) {
                console.error('Gagal mengecek panggilan meja:', error);
            }
        };

        checkServiceCalls(); 
        const interval = setInterval(checkServiceCalls, 10000); // Cek tiap 10 detik

        return () => clearInterval(interval);
    }, []);
    // ---------------------------------------------------------

    // 5. FILTERING & SEARCHING
    const filteredOrders = useMemo(() => {
        return initialOrders.filter(order => {
            let matchStatus = true;
            if (filterStatus === "unpaid") matchStatus = order.payment_status === "unpaid";
            if (filterStatus === "paid") matchStatus = order.payment_status === "paid";
            if (filterStatus === "processing") matchStatus = order.order_status === "processing";
            if (filterStatus === "completed") matchStatus = order.order_status === "completed";

            const searchLower = search.toLowerCase();
            const matchSearch = search === "" || 
                (order.customer_name || "").toLowerCase().includes(searchLower) ||
                (order.id || "").toLowerCase().includes(searchLower) ||
                (order.table?.table_number?.toString() || "").toLowerCase().includes(searchLower) ||
                order.items?.some(item => (item.product_name || item.product?.name || "").toLowerCase().includes(searchLower));

            return matchStatus && matchSearch;
        });
    }, [initialOrders, search, filterStatus]);

    // 6. KEYBOARD SHORTCUTS
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "F2") { e.preventDefault(); searchInputRef.current?.focus(); }
            if (e.key === "F1") { e.preventDefault(); router.reload({ only: ['initialOrders']}); toast.info('Data diperbarui'); }
            if (e.key === "Escape" && showPaymentModal) { e.preventDefault(); setShowPaymentModal(false); }
            if (e.key === "Escape" && showCancelModal) { e.preventDefault(); setShowCancelModal(false); }
            
            if (e.key === "F3" && filteredOrders.length > 0) {
                e.preventDefault();
                const currentIndex = filteredOrders.findIndex(o => o.id === selectedOrder?.id);
                const nextIndex = (currentIndex + 1) % filteredOrders.length;
                setSelectedOrder(filteredOrders[nextIndex]);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [showPaymentModal, showCancelModal, filteredOrders, selectedOrder]);

    const handlePrint = (type) => window.open(`/admin/orders/${selectedOrder.id}/print?type=${type}`, '_blank', 'width=400,height=600');

    return (
        <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
            <Head title="POS Kasir" />
            <Toaster position="top-center" richColors />

            {/* KOMPONEN SIDEBAR (KIRI) */}
            <PosSidebar 
                filteredOrders={filteredOrders}
                search={search} setSearch={setSearch}
                filterStatus={filterStatus} setFilterStatus={setFilterStatus}
                selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder}
                searchInputRef={searchInputRef}
                onRefresh={() => router.reload({ only: ['initialOrders']})}
            />

            {/* AREA KANAN: DETAIL PESANAN */}
            <div className="flex-1 flex flex-col bg-slate-100 relative">
                {!selectedOrder ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <BiDish className="text-8xl mb-4 text-slate-200" />
                        <h2 className="text-xl font-bold text-slate-600">Pilih Pesanan</h2>
                        <p className="text-sm">Klik kartu antrian di sebelah kiri (atau F3).</p>
                    </div>
                ) : (
                    <>
                        {/* KONTEN STRUK */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="max-w-3xl mx-auto">
                                <div className="flex justify-between items-end mb-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-3xl font-black text-slate-900">{selectedOrder.customer_name}</h2>
                                            <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${selectedOrder.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                {selectedOrder.payment_status === 'paid' ? 'LUNAS' : 'BELUM DIBAYAR'}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-500 flex items-center gap-2 font-mono">
                                            <span>Meja {selectedOrder.table?.table_number || '-'}</span> • <span>Order #{selectedOrder.id.slice(-8).toUpperCase()}</span>
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handlePrint('kitchen')} className="px-4 py-2 bg-white text-slate-700 font-bold text-sm rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 flex items-center gap-2"><BiPrinter /> Tiket Dapur</button>
                                        <button onClick={() => handlePrint('customer')} className="px-4 py-2 bg-white text-slate-700 font-bold text-sm rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 flex items-center gap-2"><BiPrinter /> Bill Pelanggan</button>
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                                    <div className="p-6 space-y-4">
                                        {selectedOrder.items.map((item, idx) => {
                                            const itemPrice = item.price || item.unit_price || item.product?.price || 0;
                                            const itemQty = item.qty || 1;

                                            return (
                                                <div key={idx} className="flex justify-between items-start border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                                                    <div className="flex gap-4">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-black text-sm shrink-0">
                                                            {itemQty}x
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 text-lg leading-tight mb-1">
                                                                {item.product?.name || item.product_name || 'Item Menu'}
                                                            </h4>
                                                            
                                                            {item.variants && item.variants.map((v, i) => (
                                                                <p key={i} className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span> 
                                                                    {v.product_variant_item?.name || 'Varian Tambahan'}
                                                                </p>
                                                            ))}

                                                            {(item.note || item.notes) && (
                                                                <p className="text-xs italic text-orange-500 mt-1.5 font-bold bg-orange-50 p-1.5 rounded-md inline-block">
                                                                    Catatan: {item.note || item.notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-slate-900">{formatRupiah(itemPrice * itemQty)}</p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    
                                    {/* Ringkasan Biaya dengan Reverse Calculation */}
                                    {(() => {
                                        const subtotal = selectedOrder.items.reduce((acc, item) => {
                                            const p = item.price || item.unit_price || item.product?.price || 0;
                                            return acc + (p * (item.qty || 1));
                                        }, 0);

                                        const discountAmount = selectedOrder.promoUsage ? parseFloat(selectedOrder.promoUsage.discount_applied) : 0;
                                        const taxRate = (app_settings?.tax_percentage || 10) / 100;
                                        const serviceRate = (app_settings?.service_percentage || 5) / 100;
                                        const combinedRate = 1 + taxRate + serviceRate;

                                        const netBase = parseFloat(selectedOrder.total_price) / combinedRate;
                                        const tax = netBase * taxRate;
                                        const service = netBase * serviceRate;

                                        return (
                                            <div className="bg-slate-50 p-6 border-t border-slate-200">
                                                <div className="space-y-2 mb-4">
                                                    <div className="flex justify-between text-sm font-bold text-slate-500">
                                                        <span>Subtotal</span>
                                                        <span>{formatRupiah(subtotal)}</span>
                                                    </div>
                                                    
                                                    {discountAmount > 0 && (
                                                        <div className="flex justify-between text-sm font-bold text-red-500">
                                                            <span>Diskon Promo</span>
                                                            <span>-{formatRupiah(discountAmount)}</span>
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between text-sm font-bold text-slate-500">
                                                        <span>PB1 ({app_settings?.tax_percentage || 10}%)</span>
                                                        <span>{formatRupiah(tax)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm font-bold text-slate-500">
                                                        <span>Service ({app_settings?.service_percentage || 5}%)</span>
                                                        <span>{formatRupiah(service)}</span>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center pt-4 border-t border-slate-200/60 border-dashed">
                                                    <span className="text-lg font-black text-slate-900">Total Akhir</span>
                                                    <span className="text-3xl font-black text-slate-900">{formatRupiah(selectedOrder.total_price)}</span>
                                                </div>

                                                {selectedOrder.payment_status === 'paid' && selectedOrder.amount_received && (
                                                    <div className="pt-4 mt-4 border-t border-slate-200/60 border-dashed space-y-2">
                                                        <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                                                            <span>Tunai Diterima</span>
                                                            <span>{formatRupiah(selectedOrder.amount_received)}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm font-bold text-emerald-600">
                                                            <span>Kembalian</span>
                                                            <span>{formatRupiah(selectedOrder.change_amount)}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* BOTTOM ACTION BAR */}
                        <div className="bg-white border-t border-slate-200 p-6 z-20 shrink-0">
                            {/* ACTION BUTTONS */}
                                <div className="mt-6 flex flex-col gap-3">
                                    
                                    {/* 1. BAGIAN PEMBAYARAN */}
                                    <div className="flex gap-3">
                                        {selectedOrder.payment_status === 'unpaid' ? (
                                            <>
                                                <button onClick={() => setShowCancelModal(true)} className="w-1/3 py-4 bg-white text-red-500 border-2 border-red-100 hover:bg-red-50 font-bold rounded-2xl transition-all">Batalkan Order</button>
                                                <button onClick={() => setShowPaymentModal(true)} className="flex-1 bg-slate-900 text-white font-black text-xl rounded-2xl shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3"><BiWallet className="text-2xl" /> PROSES BAYAR</button>
                                            </>
                                        ) : (
                                            <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-600 font-black text-xl rounded-2xl py-4 flex items-center justify-center gap-2"><BiCheckCircle className="text-2xl" /> PESANAN LUNAS</div>
                                        )}
                                    </div>

                                    {/* 2. BAGIAN STATUS PENGAMBILAN BARANG (MUNCUL JIKA DAPUR SUDAH SELESAI) */}
                                    {selectedOrder.order_status === 'ready' && (
                                        <button 
                                            onClick={handleCompleteOrder}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xl rounded-2xl py-4 flex items-center justify-center gap-2 shadow-lg transition-all animate-pulse"
                                        >
                                            <BiCheckCircle className="text-3xl" /> SERAHKAN KE PELANGGAN
                                        </button>
                                    )}

                                    {/* INDIKATOR JIKA MASIH DIMASAK */}
                                    {selectedOrder.order_status === 'processing' && (
                                        <div className="w-full bg-orange-50 border border-orange-200 text-orange-600 font-bold text-center rounded-2xl py-3 flex items-center justify-center gap-2">
                                            <BiDish className="text-xl"/> Sedang dimasak oleh dapur...
                                        </div>
                                    )}
                                </div>
                        </div>
                    </>
                )}
            </div>

            {/* MODAL COMPONENTS */}
            <PaymentModal show={showPaymentModal} onClose={() => setShowPaymentModal(false)} order={selectedOrder} />
            <CancelModal show={showCancelModal} onClose={() => setShowCancelModal(false)} order={selectedOrder} onOrderCleared={() => setSelectedOrder(null)} />
        </div>
    );
}