import React, { useState, useEffect, useMemo } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { BiPlus } from "react-icons/bi";
import { Toaster, toast } from "sonner";

// Import Komponen Kecil
import TableMetrics from "./Components/TableMetrics";
import TableFilters from "./Components/TableFilters";
import TableGrid from "./Components/TableGrid";
import TableModals from "./Components/TableModals";

export default function TableIndex({ tables, metrics = { total: 0, empty: 0, occupied: 0, unpaid: 0 } }) {
    const userRole = usePage().props.auth.user.role;
    const canEdit = userRole === 'admin' || userRole === 'owner';

    const [formModal, setFormModal] = useState({ isOpen: false, isEdit: false, tableId: null, tableNumber: "" });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: "", tableId: null, message: "" });
    const [qrModal, setQrModal] = useState({ isOpen: false, table: null });

    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const baseUrl = window.location.origin;

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['tables', 'metrics'], preserveScroll: true, preserveState: true });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleCopyLink = (tableNumber, token) => {
        const url = `${baseUrl}/order/${tableNumber}?token=${token}`;
        navigator.clipboard.writeText(url);
        toast.success(`Link Meja ${tableNumber} tersalin!`);
    };

    const openModal = (table = null) => {
        if (table) {
            setFormModal({ isOpen: true, isEdit: true, tableId: table.id, tableNumber: table.table_number });
        } else {
            setFormModal({ isOpen: true, isEdit: false, tableId: null, tableNumber: "" });
        }
    };

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

    const handleDelete = (table) => openConfirm('delete', table.id, `Hapus Meja ${table.table_number} permanen?`);

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
                    if (qrModal.isOpen) setQrModal({ isOpen: false, table: null });
                }
            });
        }
    };

    const openConfirm = (type, tableId, message) => setConfirmModal({ isOpen: true, type, tableId, message });

    const filteredTables = useMemo(() => {
        return tables.filter(table => {
            const hasSession = table.active_session !== null;
            const unpaidCount = (table.orders || []).filter(o => o.payment_status === 'unpaid').length;
            const needsBill = (table.service_calls || []).some(c => c.type === 'request_bill');

            let matchFilter = true;
            if (filter === 'empty') matchFilter = !hasSession;
            if (filter === 'occupied') matchFilter = hasSession;
            if (filter === 'unpaid') matchFilter = unpaidCount > 0;
            if (filter === 'need_payment') matchFilter = needsBill;

            const matchSearch = table.table_number.toLowerCase().includes(search.toLowerCase());
            return matchFilter && matchSearch;
        });
    }, [tables, search, filter]);

    return (
        <AdminLayout title="Manajemen Meja">
            <Head title="Manajemen Meja" />
            <Toaster position="top-center" richColors />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-black text-slate-900">Daftar Meja</h2>
                    <p className="text-sm font-semibold text-gray-500">Pantau dan kelola meja secara Real-time.</p>
                </div>
                {canEdit && (
                    <button onClick={() => openModal()} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md">
                        <BiPlus className="text-xl" /> Tambah Meja
                    </button>
                )}
            </div>

            <TableMetrics metrics={metrics} />

            <TableFilters search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} />

            <TableGrid 
                filteredTables={filteredTables} canEdit={canEdit} 
                handleCopyLink={handleCopyLink} setQrModal={setQrModal} 
                openConfirm={openConfirm} openModal={openModal} handleDelete={handleDelete} 
            />

            <TableModals 
                formModal={formModal} setFormModal={setFormModal} handleSaveTable={handleSaveTable}
                confirmModal={confirmModal} setConfirmModal={setConfirmModal} executeAction={executeAction}
                qrModal={qrModal} setQrModal={setQrModal} openConfirm={openConfirm} baseUrl={baseUrl}
            />

        </AdminLayout>
    );
}