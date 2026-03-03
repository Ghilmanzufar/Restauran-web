import React, { useState, useEffect, useMemo, useRef } from "react";
import { Head, router } from "@inertiajs/react";
import { 
    BiSearch, BiPrinter, BiWallet, BiDish, BiCheckCircle, 
    BiXCircle, BiMoney, BiRefresh, BiTimeFive
} from "react-icons/bi";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

// --- HELPER COMPONENT: VISUAL TIMER ---
const OrderTimer = ({ createdAt }) => {
    const [mins, setMins] = useState(0);
    useEffect(() => {
        const calcTime = () => setMins(Math.floor((new Date() - new Date(createdAt)) / 60000));
        calcTime();
        const interval = setInterval(calcTime, 60000);
        return () => clearInterval(interval);
    }, [createdAt]);

    if (mins < 1) return <span className="text-[10px] text-green-500 font-bold tracking-wider animate-pulse">BARU SAJA</span>;
    return (
        <span className={`text-[10px] font-bold tracking-wider flex items-center gap-1 ${mins > 15 ? 'text-red-500' : 'text-slate-400'}`}>
            <BiTimeFive /> {mins} mnt
        </span>
    );
};

export default function POSIndexPRO({ initialOrders }) {
    const searchInputRef = useRef(null);
    const [orders, setOrders] = useState(initialOrders);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    
    // Payment State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [amountReceived, setAmountReceived] = useState("");
    
    // Inline Confirm State (Menghindari Popup Alert Bawaan)
    const [confirmVoid, setConfirmVoid] = useState(false);

    // Update data jika di-refresh
    useEffect(() => {
        setOrders(initialOrders);
        if (selectedOrder) {
            const updated = initialOrders.find(o => o.id === selectedOrder.id);
            setSelectedOrder(updated || null);
        }
    }, [initialOrders]);

    // FILTER LOGIC
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const q = searchQuery.toLowerCase();
            const matchesSearch = order.id.slice(-4).toLowerCase().includes(q) || 
                                  (order.table?.table_number?.toLowerCase() || "").includes(q) || 
                                  (order.customer_name || "").toLowerCase().includes(q);

            let matchesFilter = true;
            if (filterStatus === 'unpaid') matchesFilter = order.payment_status === 'unpaid' && order.order_status !== 'cancelled';
            if (filterStatus === 'paid') matchesFilter = order.payment_status === 'paid';
            if (filterStatus === 'cooking') matchesFilter = order.order_status === 'processing';

            return matchesSearch && matchesFilter;
        });
    }, [orders, searchQuery, filterStatus]);

    // --- AUTO FOCUS: PILIH ORDER BELUM BAYAR PALING ATAS ---
    useEffect(() => {
        if (!selectedOrder && filteredOrders.length > 0) {
            const firstUnpaid = filteredOrders.find(o => o.payment_status === 'unpaid' && o.order_status !== 'cancelled');
            if (firstUnpaid) setSelectedOrder(firstUnpaid);
        }
    }, [filteredOrders, selectedOrder]);

    // --- KEYBOARD SHORTCUTS ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F2') {
                e.preventDefault();
                searchInputRef.current?.focus();
            } else if (e.key === 'Escape') {
                setShowPaymentModal(false);
                setConfirmVoid(false);
                setAmountReceived("");
            } else if (e.key === 'Enter' && selectedOrder?.payment_status === 'unpaid' && !showPaymentModal && !confirmVoid) {
                e.preventDefault();
                setShowPaymentModal(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedOrder, showPaymentModal, confirmVoid]);

    // --- ACTIONS ---
    const handleProcessPayment = (e) => {
        e.preventDefault();
        const received = parseFloat(amountReceived);
        const total = parseFloat(selectedOrder.total_price);

        if (received < total) {
            toast.error("Nominal kurang dari total tagihan!");
            return;
        }

        router.post(route('admin.pos.pay', selectedOrder.id), { amount_received: received, payment_method: 'cash' }, {
            onSuccess: () => {
                setShowPaymentModal(false);
                setAmountReceived("");
                toast.success("Berhasil! Kembalian: " + formatRupiah(received - total));
                setSelectedOrder(null); // Reset agar auto-focus ke order berikutnya
            }
        });
    };

    const executeVoid = () => {
        router.post(route('admin.pos.cancel', selectedOrder.id), { reason: "Dibatalkan Kasir" }, {
            onSuccess: () => {
                toast.success("Order Dibatalkan");
                setConfirmVoid(false);
                setSelectedOrder(null);
            }
        });
    };

    // --- QUICK PAY BUTTONS ---
    const addAmount = (val) => {
        if (val === 'exact') setAmountReceived(selectedOrder.total_price);
        else setAmountReceived(prev => String((Number(prev) || 0) + val));
    };

    // --- HELPER COMPONENT: Konsistensi Warna Murni ---
    const StatusPill = ({ isPaid }) => (
        isPaid 
        ? <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border border-emerald-200">LUNAS</span>
        : <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border border-red-200 animate-pulse">BELUM BAYAR</span>
    );

    return (
        <div className="flex h-screen bg-[#F0F2F5] overflow-hidden font-sans text-slate-800 selection:bg-blue-200">
            <Head title="POS Terminal" />
            <Toaster position="top-center" richColors />

            {/* ========================================================= */}
            {/* PANEL KIRI: LIST ORDER (35%) */}
            {/* ========================================================= */}
            <div className="w-[35%] min-w-[350px] bg-white flex flex-col border-r border-gray-200 z-10">
                
                {/* Header Kiri */}
                <div className="p-4 border-b border-gray-100 bg-white">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Orders.</h1>
                        <button onClick={() => router.reload({ only: ['initialOrders'] })} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors">
                            <BiRefresh className="text-xl" />
                        </button>
                    </div>
                    
                    {/* Search Bar (F2) */}
                    <div className="relative mb-3 group">
                        <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-blue-500 transition-colors" />
                        <input 
                            ref={searchInputRef} type="text" placeholder="Cari Order (Tekan F2)..." 
                            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-100 border-none rounded-xl py-3 pl-10 pr-12 text-sm font-bold focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-800 placeholder:font-medium placeholder:text-gray-400"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-white px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-400 shadow-sm border border-gray-200 pointer-events-none">F2</div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {['all', 'unpaid', 'paid'].map(f => (
                            <button 
                                key={f} onClick={() => setFilterStatus(f)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                                    filterStatus === f ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                            >
                                {f === 'all' ? 'Semua' : f === 'unpaid' ? '🔴 Belum Bayar' : '🟢 Lunas'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List Orders */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
                    <AnimatePresence>
                        {filteredOrders.length === 0 && <div className="text-center p-10 text-gray-400 text-sm font-bold">Tidak ada order.</div>}
                        {filteredOrders.map(order => {
                            const isSelected = selectedOrder?.id === order.id;
                            const isUnpaid = order.payment_status === 'unpaid' && order.order_status !== 'cancelled';
                            
                            return (
                                <motion.div 
                                    layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                    key={order.id} onClick={() => { setSelectedOrder(order); setConfirmVoid(false); }}
                                    className={`p-4 rounded-2xl cursor-pointer border-2 transition-all duration-200 flex flex-col gap-2 ${
                                        isSelected 
                                        ? (isUnpaid ? 'bg-red-50 border-red-400 shadow-md ring-4 ring-red-100' : 'bg-white border-slate-900 shadow-md ring-4 ring-slate-100')
                                        : 'bg-white border-transparent hover:border-gray-200 shadow-sm'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-base font-black px-2 py-0.5 rounded-lg ${isSelected && isUnpaid ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'}`}>
                                                T{order.table?.table_number || '?'}
                                            </span>
                                            <span className="font-mono text-sm font-bold text-slate-400">#{order.id.slice(-4).toUpperCase()}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-black text-lg text-slate-800 leading-none">{formatRupiah(order.total_price)}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-bold text-slate-600 truncate max-w-[150px]">{order.customer_name}</span>
                                        <div className="flex flex-col items-end gap-1">
                                            <StatusPill isPaid={order.payment_status === 'paid'} />
                                            <OrderTimer createdAt={order.created_at} />
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* ========================================================= */}
            {/* PANEL KANAN: DETAIL & AKSI (65%) */}
            {/* ========================================================= */}
            <div className="flex-1 flex flex-col bg-[#F8F9FA] relative">
                {!selectedOrder ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                        <BiDish className="text-9xl mb-4 opacity-20" />
                        <h2 className="text-2xl font-black text-gray-400">Siap Menerima Order</h2>
                    </div>
                ) : (
                    <>
                        {/* Header Kanan (Hierarki Font Jelas) */}
                        <div className="bg-white px-8 py-5 border-b border-gray-200 shadow-sm z-10 flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Meja</span>
                                    <h2 className="text-4xl font-black text-slate-900 leading-none">{selectedOrder.table?.table_number}</h2>
                                    <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg font-mono text-lg font-bold ml-2">
                                        #{selectedOrder.id.slice(-4).toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-slate-500 text-lg font-bold capitalize mt-1">
                                    {selectedOrder.customer_name}
                                </p>
                            </div>
                            <div className="text-right">
                                <StatusPill isPaid={selectedOrder.payment_status === 'paid'} />
                                <div className="mt-2 text-sm text-gray-400 font-medium">
                                    {new Date(selectedOrder.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>
                        </div>

                        {/* Order Items (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="divide-y divide-gray-50">
                                    {selectedOrder.items.map(item => (
                                        <div key={item.id} className="flex gap-4 p-5 hover:bg-slate-50 transition-colors items-center">
                                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-800 text-xl shrink-0">
                                                {item.qty}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-800 text-lg">{item.product?.name}</p>
                                                {item.variants?.length > 0 && (
                                                    <p className="text-sm text-slate-500 font-medium mt-0.5">
                                                        {item.variants.map(v => v.item_name).join(', ')}
                                                    </p>
                                                )}
                                                {item.note && (
                                                    <p className="text-sm text-orange-600 font-bold bg-orange-50 inline-block px-2 py-0.5 rounded mt-1">
                                                        Catatan: {item.note}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm text-gray-400 font-bold mb-1">{formatRupiah(item.price_per_item)} / item</p>
                                                <p className="font-black text-slate-900 text-xl">{formatRupiah(item.total_price)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* STICKY BOTTOM SECTION (ERGONOMI KANAN) */}
                        <div className="bg-white border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20 flex flex-col">
                            
                            {/* Sticky Grand Total */}
                            <div className="px-8 py-4 bg-slate-50 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-bold text-gray-500 mb-1">
                                        Total Item: {selectedOrder.items.reduce((a,b)=>a+b.qty,0)}
                                    </p>
                                    <p className="text-xs text-gray-400">Termasuk PB1 10% & Service 5%</p>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    
                                    {/* --- INFORMASI VOUCHER/PROMO --- */}
                                    {selectedOrder.promo_usage && parseFloat(selectedOrder.promo_usage.discount_value) > 0 && (
                                        <div className="flex items-center gap-2 text-emerald-600 mb-2">
                                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest border border-emerald-200">
                                                {selectedOrder.promo_usage.promo?.name || "Voucher Dipakai"}
                                            </span>
                                            <span className="font-bold text-sm">
                                                - {formatRupiah(selectedOrder.promo_usage.discount_value)}
                                            </span>
                                        </div>
                                    )}
                                    {/* --------------------------------- */}

                                    <div className="flex items-center gap-4">
                                        <span className="text-lg font-black text-gray-400 uppercase tracking-widest">Grand Total</span>
                                        <span className="text-5xl font-black text-slate-900 tracking-tight">
                                            {formatRupiah(selectedOrder.total_price)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons (Zona Sentuh Kanan) */}
                            <div className="p-6 flex justify-between items-center gap-4">
                                
                                {/* Kiri: Void & Print */}
                                <div className="flex gap-3">
                                    {selectedOrder.order_status === 'pending' && selectedOrder.payment_status === 'unpaid' && (
                                        !confirmVoid ? (
                                            <button onClick={() => setConfirmVoid(true)} className="px-6 py-5 rounded-2xl border-2 border-red-100 text-red-500 font-bold text-lg hover:bg-red-50 hover:border-red-200 transition-all flex items-center gap-2">
                                                <BiXCircle className="text-2xl" /> Void
                                            </button>
                                        ) : (
                                            <motion.button initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={executeVoid} className="px-8 py-5 rounded-2xl bg-red-500 text-white font-black text-lg shadow-lg shadow-red-500/30 hover:bg-red-600 active:scale-95 transition-all">
                                                Yakin Hapus Order?
                                            </motion.button>
                                        )
                                    )}
                                    <button className="px-6 py-5 rounded-2xl bg-slate-100 text-slate-600 font-bold text-lg hover:bg-slate-200 transition-colors flex items-center gap-2">
                                        <BiPrinter className="text-2xl" /> Cetak
                                    </button>
                                </div>

                                {/* Kanan: Bayar (Tombol Dominan) */}
                                <div className="flex-1 flex justify-end">
                                    {selectedOrder.payment_status === 'unpaid' && selectedOrder.order_status !== 'cancelled' ? (
                                        <button 
                                            onClick={() => setShowPaymentModal(true)}
                                            className="px-14 py-6 rounded-2xl bg-slate-900 text-white font-black text-2xl shadow-xl shadow-slate-900/20 flex items-center gap-3 hover:bg-slate-800 active:scale-95 transition-all"
                                        >
                                            <BiWallet className="text-3xl text-green-400" /> Proses Bayar (Enter)
                                        </button>
                                    ) : selectedOrder.payment_status === 'paid' ? (
                                        <div className="px-14 py-6 rounded-2xl bg-emerald-50 text-emerald-600 font-black text-2xl border-2 border-emerald-200 flex items-center gap-3 opacity-80">
                                            <BiCheckCircle className="text-3xl" /> Order Lunas
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ========================================================= */}
            {/* MODAL PEMBAYARAN: QUICK PAY PRO */}
            {/* ========================================================= */}
            <AnimatePresence>
                {showPaymentModal && selectedOrder && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-[2rem] p-8 w-[500px] shadow-2xl flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                        <BiWallet className="text-green-500" /> Pembayaran Tunai
                                    </h3>
                                    <p className="text-sm font-bold text-gray-400 mt-1">Meja {selectedOrder.table?.table_number} • Tagihan: <span className="text-slate-900">{formatRupiah(selectedOrder.total_price)}</span></p>
                                </div>
                            </div>

                            <form onSubmit={handleProcessPayment} className="flex flex-col gap-6">
                                <div>
                                    <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Uang Diterima</label>
                                    <input 
                                        type="number" autoFocus value={amountReceived} onChange={(e) => setAmountReceived(e.target.value)}
                                        className="w-full text-4xl font-black text-center bg-gray-50 border-2 border-gray-200 rounded-2xl py-6 px-4 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 focus:bg-white transition-all text-slate-900"
                                        placeholder="0"
                                    />
                                    
                                    {/* QUICK AMOUNT BUTTONS */}
                                    <div className="grid grid-cols-4 gap-2 mt-4">
                                        <button type="button" onClick={() => addAmount('exact')} className="col-span-1 bg-green-100 text-green-700 font-bold py-3 rounded-xl hover:bg-green-200 active:scale-95 transition-all text-sm border border-green-200">
                                            Uang Pas
                                        </button>
                                        <button type="button" onClick={() => addAmount(50000)} className="bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 active:scale-95 transition-all text-sm">
                                            + 50k
                                        </button>
                                        <button type="button" onClick={() => addAmount(100000)} className="bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 active:scale-95 transition-all text-sm">
                                            + 100k
                                        </button>
                                        <button type="button" onClick={() => addAmount(200000)} className="bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 active:scale-95 transition-all text-sm">
                                            + 200k
                                        </button>
                                    </div>
                                </div>

                                {/* Smart Kembalian */}
                                <div className="bg-slate-50 rounded-2xl p-5 border border-gray-100 flex justify-between items-center h-24">
                                    <span className="text-lg font-bold text-gray-500">Kembalian</span>
                                    {amountReceived && parseFloat(amountReceived) >= parseFloat(selectedOrder.total_price) ? (
                                        <span className="text-4xl font-black text-emerald-500 tracking-tight">
                                            {formatRupiah(parseFloat(amountReceived) - parseFloat(selectedOrder.total_price))}
                                        </span>
                                    ) : (
                                        <span className="text-xl font-bold text-gray-300">-</span>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => { setShowPaymentModal(false); setAmountReceived(""); }} className="py-5 px-6 font-bold text-slate-500 bg-gray-100 rounded-2xl hover:bg-gray-200 active:scale-95 transition-all text-lg">
                                        Batal (Esc)
                                    </button>
                                    <button 
                                        type="submit" disabled={!amountReceived || parseFloat(amountReceived) < parseFloat(selectedOrder.total_price)} 
                                        className="flex-1 py-5 font-black text-white bg-green-500 rounded-2xl hover:bg-green-600 disabled:opacity-50 disabled:active:scale-100 active:scale-95 transition-all flex justify-center items-center gap-2 text-xl shadow-lg shadow-green-500/30"
                                    >
                                        <BiCheckCircle className="text-2xl" /> Selesaikan Pembayaran
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}