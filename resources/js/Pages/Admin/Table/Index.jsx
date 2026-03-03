import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import Modal from "@/Components/Modal";
import { QRCodeSVG } from "qrcode.react";
import { 
    BiTable, BiPlus, BiEditAlt, BiTrash, 
    BiX, BiInfoCircle, BiRefresh, BiPowerOff
} from "react-icons/bi";
// TAMBAHKAN BARIS INI:
import { AiOutlineQrcode } from "react-icons/ai"; 
import { Toaster, toast } from "sonner";

export default function TableIndex({ tables }) {
    // State untuk form Tambah/Edit
    const [formModal, setFormModal] = useState({ isOpen: false, isEdit: false, tableId: null, tableNumber: "" });
    // State untuk modal Konfirmasi Delete & Force Close
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: "", tableId: null, message: "" });
    // State untuk modal Tampil QR Code
    const [qrModal, setQrModal] = useState({ isOpen: false, table: null });

    // Base URL website Anda (untuk dimasukkan ke dalam QR Code)
    const baseUrl = window.location.origin;

    // --- ACTIONS ---
    const handleSaveTable = (e) => {
        e.preventDefault();
        const routeName = formModal.isEdit ? route('admin.tables.update', formModal.tableId) : route('admin.tables.store');
        const method = formModal.isEdit ? 'put' : 'post';

        router[method](routeName, { table_number: formModal.tableNumber }, {
            onSuccess: () => {
                toast.success(`Meja berhasil ${formModal.isEdit ? 'diperbarui' : 'ditambahkan'}!`);
                setFormModal({ isOpen: false, isEdit: false, tableId: null, tableNumber: "" });
            },
            onError: (errors) => toast.error(errors.table_number || "Gagal menyimpan meja.")
        });
    };

    const executeAction = () => {
        if (confirmModal.type === 'delete') {
            router.delete(route('admin.tables.destroy', confirmModal.tableId), {
                onSuccess: () => { toast.success("Meja dihapus!"); setConfirmModal({ isOpen: false }); },
                onError: (e) => { toast.error(e.table || "Gagal menghapus."); setConfirmModal({ isOpen: false }); }
            });
        } else if (confirmModal.type === 'forceClose') {
            router.post(route('admin.tables.forceClose', confirmModal.tableId), {}, {
                onSuccess: () => { toast.success("Sesi ditutup paksa. Meja kosong."); setConfirmModal({ isOpen: false }); },
                onError: (e) => { toast.error(e.table || "Gagal menutup sesi."); setConfirmModal({ isOpen: false }); }
            });
        } else if (confirmModal.type === 'regenerateQr') {
            router.post(route('admin.tables.regenerateQr', confirmModal.tableId), {}, {
                onSuccess: () => { 
                    toast.success("QR Code baru berhasil dibuat."); 
                    setConfirmModal({ isOpen: false });
                    // Update QR Modal jika sedang terbuka
                    if (qrModal.isOpen) setQrModal({ isOpen: false, table: null });
                }
            });
        }
    };

    const openConfirm = (type, tableId, message) => setConfirmModal({ isOpen: true, type, tableId, message });

    return (
        <AdminLayout title="Manajemen Meja & QR">
            <Head title="Manajemen Meja" />
            <Toaster position="top-center" richColors />

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-black text-slate-900">Daftar Meja</h2>
                    <p className="text-sm font-semibold text-gray-500">Kelola meja fisik dan cetak QR Code pemesanan.</p>
                </div>
                <button 
                    onClick={() => setFormModal({ isOpen: true, isEdit: false, tableId: null, tableNumber: "" })}
                    className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm hover:bg-blue-700 transition-all"
                >
                    <BiPlus className="text-xl" /> Tambah Meja
                </button>
            </div>

            {/* GRID MEJA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {tables.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-400 font-semibold flex flex-col items-center">
                        <BiTable className="text-5xl mb-3 opacity-30" />
                        Belum ada meja yang ditambahkan.
                    </div>
                ) : (
                    tables.map(table => {
                        const hasActiveSession = !!table.active_session;
                        const hasUnpaidOrders = hasActiveSession && table.active_session.unpaid_orders_count > 0;
                        
                        // Logika Warna Status
                        let statusColor = "bg-gray-100 text-gray-500 border-gray-200";
                        let statusLabel = "Kosong";
                        
                        if (hasActiveSession) {
                            if (hasUnpaidOrders) {
                                statusColor = "bg-red-50 text-red-600 border-red-200";
                                statusLabel = "Belum Lunas";
                            } else {
                                statusColor = "bg-emerald-50 text-emerald-600 border-emerald-200";
                                statusLabel = "Terisi (Lunas)";
                            }
                        }

                        return (
                            <div key={table.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                                {/* Header Kartu */}
                                <div className={`p-4 border-b flex justify-between items-start ${statusColor}`}>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-0.5">Meja</p>
                                        <h3 className="text-3xl font-black leading-none">{table.table_number}</h3>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-white/60 shadow-sm">{statusLabel}</span>
                                </div>

                                {/* Body Kartu (Aksi) */}
                                <div className="p-4 flex-1 flex flex-col justify-center space-y-2">
                                    <button onClick={() => setQrModal({ isOpen: true, table })} className="w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-bold flex justify-center items-center gap-2 hover:bg-slate-800 transition-colors">
                                        <AiOutlineQrcode /> Lihat QR Code
                                    </button>
                                    
                                    {hasActiveSession ? (
                                        <button onClick={() => openConfirm('forceClose', table.id, `Tutup paksa sesi pesanan di Meja ${table.table_number}? Ini akan mengosongkan meja.`)} className="w-full py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-bold flex justify-center items-center gap-2 hover:bg-red-100 transition-colors">
                                            <BiPowerOff /> Force Close Sesi
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button onClick={() => setFormModal({ isOpen: true, isEdit: true, tableId: table.id, tableNumber: table.table_number })} className="flex-1 py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-sm font-bold flex justify-center items-center hover:bg-gray-100 transition-colors">
                                                <BiEditAlt /> Edit
                                            </button>
                                            <button onClick={() => openConfirm('delete', table.id, `Yakin ingin menghapus Meja ${table.table_number}?`)} className="flex-1 py-2 bg-gray-50 text-red-500 border border-gray-200 rounded-lg text-sm font-bold flex justify-center items-center hover:bg-red-50 transition-colors">
                                                <BiTrash /> Hapus
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>


            {/* ============================================== */}
            {/* MODAL FORM TAMBAH/EDIT MEJA */}
            {/* ============================================== */}
            <Modal show={formModal.isOpen} onClose={() => setFormModal({ ...formModal, isOpen: false })} maxWidth="sm">
                <form onSubmit={handleSaveTable} className="p-6">
                    <h2 className="text-xl font-black text-slate-900 mb-4">{formModal.isEdit ? 'Edit Meja' : 'Tambah Meja Baru'}</h2>
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Nomor / Nama Meja</label>
                        <input 
                            type="text" value={formModal.tableNumber} onChange={e => setFormModal({ ...formModal, tableNumber: e.target.value })}
                            className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 font-bold" placeholder="Msl: 01, VIP-2, Outdoor-A" required autoFocus
                        />
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setFormModal({ ...formModal, isOpen: false })} className="flex-1 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200">Batal</button>
                        <button type="submit" className="flex-1 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30">Simpan</button>
                    </div>
                </form>
            </Modal>

            {/* ============================================== */}
            {/* MODAL KONFIRMASI (Delete / Force Close / Regen QR) */}
            {/* ============================================== */}
            <Modal show={confirmModal.isOpen} onClose={() => setConfirmModal({ isOpen: false })} maxWidth="sm">
                <div className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 ${confirmModal.type === 'regenerateQr' ? 'bg-orange-100 text-orange-500' : 'bg-red-100 text-red-500'}`}>
                        {confirmModal.type === 'regenerateQr' ? <BiRefresh /> : <BiInfoCircle />}
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Konfirmasi Aksi</h3>
                    <p className="text-sm font-semibold text-gray-500 mb-6">{confirmModal.message}</p>
                    <div className="flex gap-3">
                        <button onClick={() => setConfirmModal({ isOpen: false })} className="flex-1 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200">Batal</button>
                        <button onClick={executeAction} className={`flex-1 py-2.5 rounded-xl font-bold text-white shadow-lg ${confirmModal.type === 'regenerateQr' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30' : 'bg-red-500 hover:bg-red-600 shadow-red-500/30'}`}>
                            Lanjutkan
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ============================================== */}
            {/* MODAL TAMPIL & CETAK QR CODE */}
            {/* ============================================== */}
            <Modal show={qrModal.isOpen} onClose={() => setQrModal({ isOpen: false, table: null })} maxWidth="sm">
                {qrModal.table && (
                    <div className="p-8 text-center bg-white flex flex-col items-center relative">
                        {/* Tombol Close */}
                        <button onClick={() => setQrModal({ isOpen: false, table: null })} className="absolute top-4 right-4 text-gray-400 hover:text-slate-900"><BiX className="text-2xl" /></button>
                        
                        {/* Area Print QR */}
                        <div id={`print-qr-${qrModal.table.id}`} className="bg-white p-6 rounded-3xl shadow-soft border border-gray-100 flex flex-col items-center w-full max-w-[250px]">
                            <h2 className="text-2xl font-black text-slate-900 tracking-wider mb-1">MEJA {qrModal.table.table_number}</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Scan untuk Memesan</p>
                            
                            <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 mb-6">
                                <QRCodeSVG 
                                    value={`${baseUrl}/order/${qrModal.table.table_number}?token=${qrModal.table.qr_token}`} 
                                    size={160} level="H" includeMargin={false} 
                                />
                            </div>
                            
                            <div className="text-[10px] font-mono text-gray-300 truncate w-full px-4 text-center">
                                token: {qrModal.table.qr_token}
                            </div>
                        </div>

                        {/* Tombol Cetak & Reset */}
                        <div className="flex w-full gap-3 mt-8">
                            <button onClick={() => openConfirm('regenerateQr', qrModal.table.id, `Buat QR Code baru untuk Meja ${qrModal.table.table_number}? QR yang lama tidak akan bisa dipakai lagi.`)} className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm flex justify-center items-center gap-2 transition-colors">
                                <BiRefresh className="text-lg" /> Reset QR
                            </button>
                            <button onClick={() => window.print()} className="flex-1 py-3 rounded-xl font-black bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30 text-sm flex justify-center items-center gap-2 transition-all">
                                <AiOutlineQrcode className="text-lg" /> Cetak
                            </button>
                        </div>
                        
                        {/* CSS khusus untuk menyembunyikan elemen lain saat di-print (CTRL+P) */}
                        <style>{`
                            @media print {
                                body * { visibility: hidden; }
                                #print-qr-${qrModal.table.id}, #print-qr-${qrModal.table.id} * { visibility: visible; }
                                #print-qr-${qrModal.table.id} { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border: none; }
                            }
                        `}</style>
                    </div>
                )}
            </Modal>

        </AdminLayout>
    );
}