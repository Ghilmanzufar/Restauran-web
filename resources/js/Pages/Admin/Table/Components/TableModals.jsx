import React from "react";
import Modal from "@/Components/Modal";
import { QRCodeSVG } from "qrcode.react";
import { BiX, BiInfoCircle, BiRefresh } from "react-icons/bi";
import { AiOutlineQrcode } from "react-icons/ai";

export default function TableModals({ 
    formModal, setFormModal, handleSaveTable,
    confirmModal, setConfirmModal, executeAction,
    qrModal, setQrModal, openConfirm, baseUrl
}) {
    return (
        <>
            {/* Modal Form Tambah/Edit */}
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

            {/* Modal Konfirmasi */}
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

            {/* Modal QR Code */}
            <Modal show={qrModal.isOpen} onClose={() => setQrModal({ isOpen: false, table: null })} maxWidth="sm">
                {qrModal.table && (
                    <div className="p-8 text-center bg-white flex flex-col items-center relative">
                        <button onClick={() => setQrModal({ isOpen: false, table: null })} className="absolute top-4 right-4 text-gray-400 hover:text-slate-900"><BiX className="text-2xl" /></button>
                        
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

                        <div className="flex w-full gap-3 mt-8">
                            <button onClick={() => openConfirm('regenerateQr', qrModal.table.id, `Buat QR Code baru untuk Meja ${qrModal.table.table_number}? QR yang lama tidak akan bisa dipakai lagi.`)} className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm flex justify-center items-center gap-2 transition-colors">
                                <BiRefresh className="text-lg" /> Reset QR
                            </button>
                            <button onClick={() => window.print()} className="flex-1 py-3 rounded-xl font-black bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30 text-sm flex justify-center items-center gap-2 transition-all">
                                <AiOutlineQrcode className="text-lg" /> Cetak
                            </button>
                        </div>
                        
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
        </>
    );
}