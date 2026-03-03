import React, { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import Modal from "@/Components/Modal";
import { 
    BiGroup, BiPlus, BiEditAlt, BiTrash, BiPowerOff, 
    BiKey, BiShieldQuarter, BiHistory, BiUserCircle
} from "react-icons/bi";
import { Toaster, toast } from "sonner";

// Komponen Badge Warna Warni untuk Role
const RoleBadge = ({ role }) => {
    const roles = {
        owner: { color: "bg-purple-100 text-purple-700 border-purple-200", label: "Owner" },
        admin: { color: "bg-blue-100 text-blue-700 border-blue-200", label: "Admin" },
        kasir: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Kasir" },
        dapur: { color: "bg-orange-100 text-orange-700 border-orange-200", label: "Dapur" },
    };
    const r = roles[role] || roles.kasir;
    return <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${r.color}`}>{r.label}</span>;
};

export default function UserIndex({ users, logs }) {
    const [activeTab, setActiveTab] = useState("users"); // 'users' atau 'logs'
    const [modalState, setModalState] = useState({ isOpen: false, type: 'create', user: null });

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '', email: '', role: 'kasir', password: '', password_confirmation: ''
    });

    const openModal = (type, user = null) => {
        clearErrors();
        setModalState({ isOpen: true, type, user });
        if (type === 'create') {
            reset();
        } else if (type === 'edit') {
            setData({ name: user.name, email: user.email, role: user.role });
        } else if (type === 'password') {
            setData({ password: '', password_confirmation: '' });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (modalState.type === 'create') {
            post(route('admin.users.store'), { onSuccess: () => { toast.success('User ditambahkan!'); setModalState({ isOpen: false }); } });
        } else if (modalState.type === 'edit') {
            put(route('admin.users.update', modalState.user.id), { onSuccess: () => { toast.success('Data diperbarui!'); setModalState({ isOpen: false }); } });
        } else if (modalState.type === 'password') {
            put(route('admin.users.password', modalState.user.id), { onSuccess: () => { toast.success('Password direset!'); setModalState({ isOpen: false }); } });
        }
    };

    const handleToggle = (userId) => router.post(route('admin.users.toggle', userId), {}, { preserveScroll: true });
    const handleDelete = (user) => {
        if (confirm(`Yakin ingin menghapus ${user.name}?`)) {
            router.delete(route('admin.users.destroy', user.id), { onSuccess: () => toast.success("User dihapus!") });
        }
    };

    return (
        <AdminLayout title="Manajemen Staf & Hak Akses">
            <Head title="Manajemen User" />
            <Toaster position="top-center" richColors />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-full md:w-auto">
                    <button onClick={() => setActiveTab('users')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'users' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
                        <BiGroup className="text-lg" /> Daftar Staf
                    </button>
                    <button onClick={() => setActiveTab('logs')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'logs' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
                        <BiHistory className="text-lg" /> Log Aktivitas
                    </button>
                </div>
                
                {activeTab === 'users' && (
                    <button onClick={() => openModal('create')} className="w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm hover:bg-blue-700 transition-all">
                        <BiPlus className="text-xl" /> Tambah Staf Baru
                    </button>
                )}
            </div>

            {/* TAB 1: DAFTAR USER */}
            {activeTab === 'users' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {users.map(user => (
                        <div key={user.id} className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col transition-all ${!user.is_active && 'opacity-60 grayscale-[30%]'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center text-3xl shrink-0"><BiUserCircle /></div>
                                <RoleBadge role={user.role} />
                            </div>
                            
                            <h3 className="font-black text-slate-900 text-lg leading-tight">{user.name}</h3>
                            <p className="text-sm font-semibold text-gray-500 mb-4">{user.email}</p>
                            
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 p-2 rounded-lg mb-4 mt-auto">
                                Aktivitas Tercatat: {user.activity_logs_count} aksi
                            </div>

                            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                <button onClick={() => handleToggle(user.id)} className={`flex-1 py-2 rounded-xl font-bold text-xs flex justify-center items-center gap-1.5 transition-all ${user.is_active ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                                    <BiPowerOff className="text-base" /> {user.is_active ? "Aktif" : "Mati"}
                                </button>
                                <button onClick={() => openModal('edit', user)} className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex justify-center items-center hover:bg-slate-200"><BiEditAlt /></button>
                                <button onClick={() => openModal('password', user)} className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex justify-center items-center hover:bg-orange-100" title="Reset Password"><BiKey /></button>
                                <button onClick={() => handleDelete(user)} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex justify-center items-center hover:bg-red-100"><BiTrash /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* TAB 2: LOG AKTIVITAS */}
            {activeTab === 'logs' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-gray-100 text-xs uppercase tracking-widest text-slate-500 font-black">
                                <th className="p-4 pl-6 w-48">Waktu</th>
                                <th className="p-4 w-48">Aktor (Pelaku)</th>
                                <th className="p-4 w-48">Tindakan</th>
                                <th className="p-4 pr-6">Detail Deskripsi</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-semibold text-slate-700 divide-y divide-gray-50">
                            {logs.length === 0 ? (
                                <tr><td colSpan="4" className="py-10 text-center text-gray-400">Belum ada aktivitas tercatat.</td></tr>
                            ) : (
                                logs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50/50">
                                        <td className="p-4 pl-6 text-xs text-gray-500">{new Date(log.created_at).toLocaleString('id-ID')}</td>
                                        <td className="p-4 font-bold text-slate-900">{log.user?.name || 'Sistem / Terhapus'}</td>
                                        <td className="p-4"><span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider">{log.action}</span></td>
                                        <td className="p-4 pr-6 text-gray-600">{log.description}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL FORM USER */}
            <Modal show={modalState.isOpen} onClose={() => setModalState({ isOpen: false })} maxWidth="md">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl"><BiShieldQuarter /></div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">
                                {modalState.type === 'create' ? 'Tambah Staf Baru' : modalState.type === 'edit' ? 'Edit Data Staf' : 'Reset Password'}
                            </h2>
                            <p className="text-xs font-bold text-gray-500 mt-0.5">Pengaturan kredensial dan hak akses.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {(modalState.type === 'create' || modalState.type === 'edit') && (
                            <>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Nama Lengkap</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full rounded-xl border-gray-300 focus:border-blue-500" required />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Email (Untuk Login)</label>
                                    <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full rounded-xl border-gray-300 focus:border-blue-500" required />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Pilih Jabatan (Role)</label>
                                    <select value={data.role} onChange={e => setData('role', e.target.value)} className="w-full rounded-xl border-gray-300 focus:border-blue-500 font-bold text-slate-700">
                                        <option value="kasir">Kasir (Akses POS & Meja)</option>
                                        <option value="dapur">Dapur (Hanya lihat pesanan masuk)</option>
                                        <option value="admin">Admin (Kelola Menu & Promo)</option>
                                        <option value="owner">Owner (Akses Laporan Keuangan)</option>
                                    </select>
                                    {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                                </div>
                            </>
                        )}

                        {(modalState.type === 'create' || modalState.type === 'password') && (
                            <>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Password Baru</label>
                                    <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full rounded-xl border-gray-300 focus:border-blue-500" required />
                                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Ulangi Password Baru</label>
                                    <input type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} className="w-full rounded-xl border-gray-300 focus:border-blue-500" required />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button type="button" onClick={() => setModalState({ isOpen: false })} className="flex-1 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200">Batal</button>
                        <button type="submit" disabled={processing} className="flex-1 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30">Simpan Perubahan</button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}