import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';

const formatRupiah = (number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);
const formatDate = (dateString) => new Date(dateString).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function Print({ order, type }) {
    
    // Auto-Print saat halaman terbuka
    useEffect(() => {
        setTimeout(() => {
            window.print();
        }, 500); // Beri delay sedikit agar font termuat sempurna
    }, []);

    const isKitchen = type === 'kitchen';

    return (
        // max-w-[80mm] adalah ukuran standar kertas thermal POS
        <div className="bg-white text-black font-mono text-sm max-w-[80mm] mx-auto p-4 print:p-0 print:m-0">
            <Head title={`Print ${isKitchen ? 'Kitchen' : 'Bill'} - ${order.id}`} />

            {/* --- HEADER --- */}
            <div className="text-center mb-4 border-b-2 border-black pb-4 border-dashed">
                <h1 className="text-2xl font-black uppercase mb-1">
                    {isKitchen ? 'TIKET DAPUR' : 'RESTOPRO'}
                </h1>
                {!isKitchen && <p className="text-xs font-bold leading-tight">Jl. Contoh Alamat No. 123<br/>Telp: 08123456789</p>}
            </div>

            {/* --- INFO ORDER --- */}
            <div className="mb-4 text-xs border-b-2 border-black pb-4 border-dashed font-bold">
                <div className="flex justify-between"><span>No:</span> <span><p>No: #{order.id.slice(-8).toUpperCase()}</p></span></div>
                <div className="flex justify-between"><span>Waktu:</span> <span>{formatDate(order.created_at)}</span></div>
                <div className="flex justify-between items-center my-1">
                    <span>Meja:</span> 
                    <span className="font-black text-xl bg-black text-white px-2 py-0.5 rounded">
                        {order.table?.table_number || 'TAKEAWAY'}
                    </span>
                </div>
                <div className="flex justify-between"><span>Nama:</span> <span>{order.customer_name}</span></div>
            </div>

            {/* --- DAFTAR MENU --- */}
            <div className="mb-4 border-b-2 border-black pb-4 border-dashed">
                {order.items.map((item, idx) => {
                    const itemPrice = item.price || item.unit_price || item.product?.price || 0;
                    const itemQty = item.qty || 1;

                    return (
                        <div key={idx} className="mb-3 last:mb-0">
                            <div className="flex justify-between font-bold text-sm">
                                <span className="flex-1 uppercase">{itemQty}x {item.product?.name || item.product_name}</span>
                                {!isKitchen && <span>{formatRupiah(itemPrice * itemQty)}</span>}
                            </div>
                            
                            {/* Varian */}
                            {item.variants && item.variants.map((v, i) => (
                                <div key={i} className="text-xs pl-5 flex justify-between uppercase">
                                    <span>↳ {v.product_variant_item?.name}</span>
                                </div>
                            ))}
                            
                            {/* Catatan untuk Dapur */}
                            {(item.note || item.notes) && (
                                <div className="text-xs pl-5 font-bold italic mt-0.5 border-l-2 border-black">
                                    " {item.note || item.notes} "
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* --- FOOTER: BILL PELANGGAN --- */}
            {!isKitchen ? (
                <>
                    {(() => {
                        // 1. Hitung Subtotal Murni
                        const subtotal = order.items.reduce((acc, item) => {
                            const p = item.price || item.unit_price || item.product?.price || 0;
                            return acc + (p * (item.qty || 1));
                        }, 0);

                        // 2. Cek Diskon
                        const discountAmount = order.promoUsage ? parseFloat(order.promoUsage.discount_applied) : 0;

                        // 3. Hitung Balik Pajak & Service
                        const netBase = parseFloat(order.total_price) / 1.15;
                        const tax = netBase * 0.10;
                        const service = netBase * 0.05;

                        return (
                            <div className="mb-4 text-xs border-b-2 border-black pb-4 border-dashed font-bold">
                                <div className="flex justify-between mb-1"><span>Subtotal:</span> <span>{formatRupiah(subtotal)}</span></div>
                                
                                {discountAmount > 0 && (
                                    <div className="flex justify-between mb-1"><span>Diskon:</span> <span>-{formatRupiah(discountAmount)}</span></div>
                                )}
                                
                                <div className="flex justify-between mb-1"><span>PB1 (10%):</span> <span>{formatRupiah(tax)}</span></div>
                                <div className="flex justify-between mb-1"><span>Service (5%):</span> <span>{formatRupiah(service)}</span></div>
                                
                                <div className="flex justify-between font-black text-base my-2"><span>TOTAL:</span> <span>{formatRupiah(order.total_price)}</span></div>
                                
                                {order.payment_status === 'paid' ? (
                                    <div className="mt-2 pt-2 border-t-2 border-black border-dotted">
                                        <div className="flex justify-between uppercase"><span>BAYAR ({order.payment_method}):</span> <span></span></div>
                                        {order.payment_method === 'cash' && order.amount_received && (
                                            <>
                                                <div className="flex justify-between"><span>Tunai Diterima:</span> <span>{formatRupiah(order.amount_received)}</span></div>
                                                <div className="flex justify-between"><span>Kembali:</span> <span>{formatRupiah(order.change_amount)}</span></div>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="mt-4 text-center font-black uppercase text-xl border-2 border-black py-1">
                                        BELUM DIBAYAR
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                    
                    <div className="text-center text-xs font-bold">
                        <p>Terima Kasih!</p>
                        <p>Silakan datang kembali.</p>
                        <p className="mt-2 text-[10px]">Powered by RESTOPRO</p>
                    </div>
                </>
            ) : (
                /* --- FOOTER: KITCHEN --- */
                <div className="text-center text-sm font-black uppercase tracking-widest">
                    -- HARAP SEGERA DISIAPKAN --
                </div>
            )}
        </div>
    );
}