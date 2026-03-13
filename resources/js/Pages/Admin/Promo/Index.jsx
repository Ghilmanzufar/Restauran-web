import React, { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import Modal from "@/Components/Modal";
import { BiGift, BiPlus, BiTrash } from "react-icons/bi";
import { Toaster, toast } from "sonner";

// IMPORT KOMPONEN YANG BARU DIBUAT
import PromoCard from "./PromoCard";
import PromoFormModal from "./PromoFormModal";

export default function PromoIndex({ promos, categories, products }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, promo: null });

    // Silent Polling (Auto-Refresh setiap 10 detik)
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ 
                only: ['promos'], 
                preserveScroll: true, 
                preserveState: true 
            });
        }, 10000); 

        return () => clearInterval(interval); 
    }, []);

    const confirmDelete = () => {
        if (!deleteModal.promo) return;
        router.delete(route('admin.promos.destroy', deleteModal.promo.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Promo berhasil dihapus!');
                setDeleteModal({ isOpen: false, promo: null });
            },
            onError: (errors) => {
                toast.error(errors.message || "Gagal menghapus promo!");
                setDeleteModal({ isOpen: false, promo: null });
            }
        });
    };

    const openModal = (promo = null) => {
        setEditingPromo(promo);
        setIsModalOpen(true);
    };

    return (
        <AdminLayout title="Manajemen Promo">
            <Head title="Manajemen Promo" />
            <Toaster position="top-center" richColors />

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-xl font-black text-slate-900">Promo & Voucher</h2>
                    <p className="text-sm font-semibold text-gray-500">Kelola diskon, auto-apply, dan targeting menu.</p>
                </div>
                <button onClick={() => openModal()} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-blue-700 shadow-md">
                    <BiPlus className="text-xl" /> Tambah Promo
                </button>
            </div>

            {/* GRID PROMO MENGGUNAKAN KOMPONEN BARU */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promos.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-400 font-semibold flex flex-col items-center">
                        <BiGift className="text-5xl mb-3 opacity-30" />
                        Belum ada promo yang dibuat.
                    </div>
                ) : (
                    promos.map(promo => (
                        <PromoCard 
                            key={promo.id} 
                            promo={promo} 
                            onEdit={openModal} 
                            onDelete={(p) => setDeleteModal({ isOpen: true, promo: p })} 
                        />
                    ))
                )}
            </div>

            {/* MODAL FORM DIPANGGIL DARI FILE TERPISAH */}
            <PromoFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                promo={editingPromo}
                categories={categories}
                products={products}
            />

            {/* MODAL KONFIRMASI HAPUS TETAP DI SINI */}
            <Modal show={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, promo: null })} maxWidth="sm">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BiTrash className="text-4xl drop-shadow-sm" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mb-2">Hapus Promo?</h2>
                    <p className="text-sm text-slate-500 mb-6">
                        Apakah Anda yakin ingin menghapus promo <br/>
                        <b className="text-slate-800 text-base">"{deleteModal.promo?.name}"</b> ? <br/>
                        <span className="text-xs text-red-400 mt-1 block">Tindakan ini tidak dapat dibatalkan.</span>
                    </p>
                    <div className="flex gap-3">
                        <button onClick={() => setDeleteModal({ isOpen: false, promo: null })} className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                            Batal
                        </button>
                        <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl font-black bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all active:scale-95">
                            Ya, Hapus!
                        </button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}