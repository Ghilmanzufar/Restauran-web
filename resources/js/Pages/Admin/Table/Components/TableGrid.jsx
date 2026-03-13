import React from "react";
import { Link } from "@inertiajs/react";
import { BiTable, BiCopy, BiDetail, BiPowerOff, BiEditAlt, BiTrash, BiRestaurant, BiMoney } from "react-icons/bi";
import { AiOutlineQrcode } from "react-icons/ai";

export default function TableGrid({ filteredTables, canEdit, handleCopyLink, setQrModal, openConfirm, openModal, handleDelete }) {
    if (filteredTables.length === 0) {
        return (
            <div className="col-span-full py-20 text-center text-gray-400 font-semibold flex flex-col items-center">
                <BiTable className="text-5xl mb-3 opacity-30" />
                Tidak ada meja yang sesuai dengan filter/pencarian.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTables.map(table => {
                const hasSession = table.active_session !== null;
                const ordersCount = (table.orders || []).length;
                const unpaidCount = (table.orders || []).filter(o => o.payment_status === 'unpaid').length;
                const needsBill = (table.service_calls || []).some(c => c.type === 'request_bill');
                
                let statusColor = "bg-white border-slate-200";
                let statusBadge = "Kosong";
                let badgeColor = "bg-slate-100 text-slate-500";

                if (needsBill) {
                    statusColor = "bg-orange-50 border-orange-300 ring-2 ring-orange-500/50 shadow-lg shadow-orange-500/20";
                    statusBadge = "Minta Bill";
                    badgeColor = "bg-orange-500 text-white animate-pulse shadow-md";
                } else if (unpaidCount > 0) {
                    statusColor = "bg-red-50 border-red-200";
                    statusBadge = "Belum Bayar";
                    badgeColor = "bg-red-100 text-red-600";
                } else if (ordersCount > 0) {
                    statusColor = "bg-purple-50 border-purple-200";
                    statusBadge = "Ada Pesanan";
                    badgeColor = "bg-purple-100 text-purple-600";
                } else if (hasSession) {
                    statusColor = "bg-blue-50 border-blue-200";
                    statusBadge = "Melihat Menu";
                    badgeColor = "bg-blue-100 text-blue-600";
                }

                return (
                    <div key={table.id} className={`rounded-3xl border-2 p-5 flex flex-col transition-all duration-300 ${statusColor}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-xl font-black text-slate-800 shrink-0">
                                    {table.table_number}
                                </div>
                                <div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${badgeColor}`}>
                                        {statusBadge}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => handleCopyLink(table.table_number, table.qr_token)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors" title="Copy Link">
                                    <BiCopy className="text-lg" />
                                </button>
                                <button onClick={() => setQrModal({ isOpen: true, table })} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg transition-colors" title="Lihat QR">
                                    <AiOutlineQrcode className="text-lg" />
                                </button>
                            </div>
                        </div>

                        {hasSession ? (
                            <div className="bg-white/60 rounded-xl p-3 mb-4 grid grid-cols-2 gap-2 border border-white/50">
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                    <BiRestaurant className="text-purple-500 text-lg" /> {ordersCount} Order
                                </div>
                                <div className={`flex items-center gap-2 text-sm font-bold ${unpaidCount > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                    <BiMoney className={unpaidCount > 0 ? 'text-red-500 text-lg' : 'text-slate-300 text-lg'} /> {unpaidCount} Unpaid
                                </div>
                            </div>
                        ) : (
                            <div className="h-[60px] flex items-center justify-center text-xs font-bold text-slate-400 mb-4 border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
                                Meja Siap Digunakan
                            </div>
                        )}

                        <div className="mt-auto space-y-2">
                            {hasSession ? (
                                <>
                                    <Link href={`/admin/pos?table=${table.id}`} className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold flex justify-center items-center gap-2 hover:bg-slate-800 transition-colors shadow-md">
                                        <BiDetail className="text-lg" /> Lihat Pesanan
                                    </Link>
                                    <button onClick={() => openConfirm('forceClose', table.id, `Tutup paksa sesi meja ${table.table_number}? Pelanggan akan ter-logout.`)} className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-colors">
                                        <BiPowerOff className="text-lg" /> Force Close
                                    </button>
                                </>
                            ) : (
                                canEdit ? (
                                    <div className="flex gap-2">
                                        <button onClick={() => openModal(table)} className="flex-1 py-2.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-bold flex justify-center items-center transition-colors shadow-sm">
                                            <BiEditAlt className="text-lg" />
                                        </button>
                                        <button onClick={() => handleDelete(table)} className="flex-1 py-2.5 bg-white hover:bg-red-50 text-red-500 border border-slate-200 rounded-xl font-bold flex justify-center items-center transition-colors shadow-sm">
                                            <BiTrash className="text-lg" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-2.5 bg-slate-50 text-slate-400 border border-slate-200 rounded-xl font-bold text-xs flex justify-center items-center">
                                        Terkunci (Hanya Admin)
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}