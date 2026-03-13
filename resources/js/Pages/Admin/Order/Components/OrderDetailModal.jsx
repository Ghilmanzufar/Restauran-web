import React from "react";
import Modal from "@/Components/Modal";
import { BiX, BiReceipt } from "react-icons/bi";

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function OrderDetailModal({ isOpen, order, onClose }) {
    if (!order) return null;

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="md">
            <div className="bg-white p-6 rounded-2xl flex flex-col max-h-[90vh]">
                {/* Header Modal */}
                <div className="flex justify-between items-start mb-6 shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">Detail Pesanan</h2>
                        <p className="text-xs font-mono text-gray-400 mt-1">ID: {order.id}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-slate-900 bg-gray-100 p-1.5 rounded-full"><BiX className="text-xl" /></button>
                </div>

                {/* Info Customer & Status */}
                <div className="grid grid-cols-2 gap-4 mb-6 shrink-0 bg-slate-50 p-4 rounded-xl border border-gray-100">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pelanggan</p>
                        <p className="font-bold text-slate-900 text-sm">{order.customer_name}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Meja</p>
                        <p className="font-bold text-slate-900 text-sm">{order.table?.table_number || '-'}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Waktu Pesan</p>
                        <p className="font-bold text-slate-900 text-sm">{formatDate(order.created_at)}</p>
                    </div>
                </div>

                {/* Daftar Item (Scrollable) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-6 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-gray-100 pb-2">Daftar Menu</h3>
                    
                    {order.items.map((item, index) => {
                        const itemQty = item.qty || 1;
                        const itemName = item.product?.name || item.product_name || 'Item Menu';
                        const itemTotal = item.total_price || ((item.price_per_item || item.price || item.product?.price || 0) * itemQty);

                        return (
                            <div key={index} className="flex justify-between items-start gap-4">
                                <div className="flex gap-3 items-start">
                                    <div className="w-6 h-6 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                                        {itemQty}x
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm leading-tight">{itemName}</p>
                                        
                                        {/* List Varian (Jika Ada) */}
                                        {item.variants && item.variants.length > 0 && (
                                            <div className="mt-1 space-y-0.5">
                                                {item.variants.map((v, i) => (
                                                    <p key={i} className="text-[10px] font-bold text-gray-400 flex justify-between w-full">
                                                        <span>• {v.product_variant_item?.name || 'Varian'}</span>
                                                    </p>
                                                ))}
                                            </div>
                                        )}

                                        {/* Catatan Pelanggan */}
                                        {(item.note || item.notes) && (
                                            <p className="text-[10px] italic text-orange-500 mt-1 font-bold bg-orange-50 p-1 rounded inline-block">
                                                Catatan: {item.note || item.notes}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="font-black text-slate-900 text-sm shrink-0">
                                    {formatRupiah(itemTotal)}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Total Bawah */}
                <div className="pt-4 border-t-2 border-dashed border-gray-200 shrink-0">
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-500">Total Tagihan</span>
                        <span className="text-2xl font-black text-slate-900">{formatRupiah(order.total_price)}</span>
                    </div>
                    
                    {/* Tombol Cetak Struk */}
                    <button 
                        onClick={() => window.open(`/admin/orders/${order.id}/print?type=customer`, '_blank', 'width=400,height=600')} 
                        className="w-full mt-4 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <BiReceipt className="text-xl" /> Cetak Struk
                    </button>
                </div>
            </div>
        </Modal>
    );
}