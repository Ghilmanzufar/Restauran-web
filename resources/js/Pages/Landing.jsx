import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { BiRestaurant, BiLogIn, BiDish } from 'react-icons/bi';

export default function Landing() {
    return (
        <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-800">
            <Head title="RestoApp - Modern Dining Experience" />

            {/* Navbar */}
            <nav className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2 font-black text-xl tracking-tight text-slate-900">
                    <div className="bg-slate-900 text-white p-1.5 rounded-lg">
                        <BiRestaurant />
                    </div>
                    <span>RestoApp.</span>
                </div>
                <div>
                    <Link 
                        href={route('login')} 
                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg shadow-slate-900/20 active:scale-95 transition-transform hover:bg-slate-800"
                    >
                        <BiLogIn className="text-lg" /> Login Staff
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="pt-32 pb-20 px-6 container mx-auto flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 text-center md:text-left space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider mb-2">
                        <BiDish /> Rasakan Kelezatannya
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">
                        Nikmati Hidangan <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Terbaik Hari Ini.</span>
                    </h1>
                    <p className="text-slate-500 text-lg leading-relaxed max-w-lg mx-auto md:mx-0">
                        Sistem pemesanan modern tanpa antri. Cukup scan QR code di meja Anda dan nikmati hidangan spesial kami.
                    </p>
                    
                    <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                         {/* Tombol Demo untuk simulasi scan (Meja 1) */}
                        <Link 
                            href={route('customer.landing', 'M-01')} 
                            className="px-8 py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-xl shadow-orange-500/30 hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <BiRestaurant className="text-xl" /> Coba Scan (Demo)
                        </Link>
                    </div>
                </div>

                <div className="flex-1 relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-200 to-blue-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                    <img 
                        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80" 
                        alt="Makanan Lezat" 
                        className="relative z-10 w-full max-w-md mx-auto rounded-[40px] shadow-2xl rotate-3 hover:rotate-0 transition-all duration-500 border-8 border-white"
                    />
                </div>
            </main>
        </div>
    );
}