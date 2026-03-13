import React, { useState, useEffect } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import { 
    BiHomeCircle, BiWallet, BiFoodMenu, BiReceipt, 
    BiTable, BiLogOut, BiMenu, BiUser, BiTimeFive, BiGift, BiGroup, BiBarChartAlt2, BiShieldQuarter, BiBell, BiDish, BiImage, BiCog
} from "react-icons/bi";
import axios from "axios";
import { Toaster, toast } from "sonner";

export default function AdminLayout({ children, title }) {
    const { url } = usePage();
    
    // Default tertutup agar aman di SSR, lalu deteksi ukuran layar
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [confirmLogout, setConfirmLogout] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        // 1. Auto-detect layar Tablet/Desktop saat pertama kali render
        setIsSidebarOpen(window.innerWidth >= 1024);

        // 2. Handle Resize (Kalau orientasi tablet diputar)
        const handleResize = () => setIsSidebarOpen(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);

        // 3. Update Jam setiap detik
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            clearInterval(timer);
        };
    }, []);

    // Format Jam: "21:34 WIB"
    const formattedTime = currentTime.toLocaleTimeString('id-ID', { 
        hour: '2-digit', minute: '2-digit' 
    }) + ' WIB';

    // ==========================================
    // MENU SIDEBAR DIATUR DI SINI BERDASARKAN ROLE
    // ==========================================
    const userRole = usePage().props.auth.user.role; // Ambil role aktif

    // --- LOGIKA NOTIFIKASI GLOBAL (PANGGILAN MEJA) ---
    const [pendingCalls, setPendingCalls] = useState(0);

    useEffect(() => {
        // Hanya jalankan radar ini untuk Kasir, Admin, dan Owner
        if (!['kasir', 'admin', 'owner'].includes(userRole)) return;

        const checkServiceCalls = async () => {
            try {
                const res = await axios.get('/admin/api/service-calls/pending');
                const { count, latest } = res.data;
                
                setPendingCalls(count);

                // Jika ada panggilan baru, munculkan Pop-up!
                if (count > 0 && latest) {
                    // Gunakan sessionStorage agar notif tidak terus-terusan berbunyi saat kasir pindah halaman
                    const lastId = sessionStorage.getItem('lastServiceCallId');
                    if (lastId !== latest.id.toString()) {
                        toast.warning(`Meja ${latest.table_number} Memanggil!`, {
                            description: `Pelanggan butuh bantuan.`,
                            action: {
                                label: 'Lihat Detail',
                                onClick: () => router.get('/admin/service-calls')
                            },
                            duration: 10000, // Tampil 10 detik agar kasir sempat baca
                        });
                        sessionStorage.setItem('lastServiceCallId', latest.id);
                    }
                }
            } catch (error) {
                console.error('Gagal mengecek panggilan meja:', error);
            }
        };

        checkServiceCalls(); // Cek langsung saat halaman dibuka
        const interval = setInterval(checkServiceCalls, 10000); // Cek secara diam-diam tiap 10 detik

        return () => clearInterval(interval);
    }, [userRole]);

    const rawMenuItems = [
        { name: "Dashboard", icon: <BiHomeCircle />, path: "/admin/dashboard", roles: ['owner', 'admin', 'kasir'] },
        { name: "POS Kasir", icon: <BiWallet />, path: "/admin/pos", roles: ['owner', 'admin', 'kasir'] },
        { name: "Panggilan Meja", icon: <BiBell />, path: "/admin/service-calls", roles: ['owner', 'admin', 'kasir'] },
        { name: "Manajemen Order", icon: <BiReceipt />, path: "/admin/orders", roles: ['owner', 'admin', 'kasir', 'dapur'] }, 
        { name: "Manajemen Banner", icon: <BiImage />, path: "/admin/banners", roles: ['owner', 'admin'] },
        { name: "Layar Dapur", icon: <BiDish />, path: "/admin/kitchen", roles: ['owner', 'admin', 'dapur'] },
        { name: "Menu & Varian", icon: <BiFoodMenu />, path: "/admin/menu", roles: ['owner', 'admin'] },    
        { name: "Manajemen Meja", icon: <BiTable />, path: "/admin/tables", roles: ['owner', 'admin', 'kasir'] },
        { name: "Promo & Voucher", icon: <BiGift />, path: "/admin/promos", roles: ['owner', 'admin'] },
        { name: "Manajemen User", icon: <BiGroup />, path: "/admin/users", roles: ['owner', 'admin'] },   
        { name: "Laporan Owner", icon: <BiBarChartAlt2 />, path: "/admin/reports", roles: ['owner'] },
        { name: "Audit & Log", icon: <BiShieldQuarter />, path: "/admin/audit-logs", roles: ['owner'] },
        { name: "Pengaturan Sistem", icon: <BiCog />, path: "/admin/settings", roles: ['owner', 'admin'] },
        
    ];

    // Filter menu agar hanya menampilkan yang rolenya diizinkan
    const menuItems = rawMenuItems.filter(item => item.roles.includes(userRole));

    // Handle Smart Logout
    const handleLogout = (e) => {
        e.preventDefault();
        if (!confirmLogout) {
            setConfirmLogout(true);
            // Batal otomatis jika tidak diklik lagi dalam 3 detik
            setTimeout(() => setConfirmLogout(false), 3000); 
        } else {
            router.post(route('logout'));
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] flex font-sans text-slate-800 overflow-hidden">
            {/* --- TAMBAHKAN WADAH NOTIFIKASI INI --- */}
            <Toaster position="top-center" richColors />
            
            {/* ========================================= */}
            {/* SIDEBAR NAVIGATION */}
            {/* ========================================= */}
            <aside className={`${isSidebarOpen ? "w-64" : "w-20"} bg-slate-900 text-white transition-all duration-300 flex flex-col fixed inset-y-0 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.1)]`}>
                
                {/* Logo & Toggle */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
                    {isSidebarOpen && (
                        <span className="text-xl font-black tracking-wider text-green-400 whitespace-nowrap overflow-hidden">
                            RESTO<span className="text-white">PRO</span>
                        </span>
                    )}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-white transition-colors p-2 -mr-2">
                        <BiMenu className="text-2xl" />
                    </button>
                </div>

                {/* Navigasi Utama */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item, index) => {
                        const isActive = url.startsWith(item.path);
                        return (
                            <Link
                                key={index}
                                href={item.path}
                                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 group ${
                                    isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                                        : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`text-2xl transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                                        {item.icon}
                                    </span>
                                    <span className={`whitespace-nowrap ${!isSidebarOpen && "hidden"}`}>
                                        {item.name}
                                    </span>
                                </div>
                                
                                {/* --- TAMPILKAN BADGE MERAH JIKA ADA PANGGILAN --- */}
                                {item.badge > 0 && isSidebarOpen && (
                                    <div className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse shadow-md shadow-red-500/50">
                                        {item.badge}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Tombol Logout (Smart Confirm) */}
                <div className="p-4 border-t border-white/10 bg-slate-900 shrink-0">
                    <button 
                        onClick={handleLogout} 
                        className={`flex items-center gap-4 px-4 py-3.5 w-full text-left rounded-xl transition-all ${
                            confirmLogout 
                            ? "bg-red-500 text-white shadow-lg shadow-red-500/30" 
                            : "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        }`}
                        title={!isSidebarOpen ? "Logout" : ""}
                    >
                        <div className={`text-2xl ${confirmLogout ? 'animate-pulse' : ''}`}>
                            <BiLogOut />
                        </div>
                        {isSidebarOpen && (
                            <span className="font-bold text-sm whitespace-nowrap">
                                {confirmLogout ? "Yakin Keluar?" : "Logout"}
                            </span>
                        )}
                    </button>
                </div>
            </aside>

            {/* ========================================= */}
            {/* MAIN CONTENT AREA */}
            {/* ========================================= */}
            <div className={`flex-1 flex flex-col transition-all duration-300 min-h-screen ${isSidebarOpen ? "ml-64" : "ml-20"}`}>
                
                {/* TOPBAR */}
                <header className="h-20 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40 shrink-0">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
                    
                    <div className="flex items-center gap-6">
                        {/* REALTIME CLOCK */}
                        <div className="hidden md:flex items-center gap-2 text-slate-500 font-bold font-mono bg-slate-100 px-4 py-2 rounded-xl border border-gray-200">
                            <BiTimeFive className="text-lg text-blue-500" /> 
                            {formattedTime}
                        </div>

                        {/* USER BADGE */}
                        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors">
                            <BiUser className="text-lg" /> Kasir Aktif
                        </div>
                    </div>
                </header>

                {/* CONTENT */}
                <main className="p-8 flex-1 overflow-x-hidden overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}