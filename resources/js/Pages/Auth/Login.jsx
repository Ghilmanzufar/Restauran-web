import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { BiEnvelope, BiLockAlt, BiLogInCircle } from 'react-icons/bi';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            
            {/* --- EFEK BACKGROUND GLOW BLUR --- */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            <Head title="Masuk Sistem" />

            <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden relative z-10 border border-white">
                <div className="p-8 sm:p-12">
                    
                    {/* --- HEADER LOGO --- */}
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-black tracking-wider text-green-500 mb-2">
                            RESTO<span className="text-slate-900">PRO</span>
                        </h1>
                        <p className="text-sm font-bold text-slate-400">
                            Sistem Manajemen Restoran Pintar
                        </p>
                    </div>

                    {status && (
                        <div className="mb-6 text-sm font-bold text-emerald-600 bg-emerald-50 p-4 rounded-xl text-center border border-emerald-100">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        
                        {/* --- INPUT EMAIL --- */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Alamat Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <BiEnvelope className="text-slate-400 text-lg" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder:font-semibold placeholder:text-gray-400"
                                    placeholder="kasir@restopro.com"
                                    required
                                    autoFocus
                                    autoComplete="username"
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs font-bold mt-2">{errors.email}</p>}
                        </div>

                        {/* --- INPUT PASSWORD --- */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Kata Sandi</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <BiLockAlt className="text-slate-400 text-lg" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder:font-semibold placeholder:text-gray-400"
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                            {errors.password && <p className="text-red-500 text-xs font-bold mt-2">{errors.password}</p>}
                        </div>

                        {/* --- REMEMBER ME & FORGOT PASSWORD --- */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                />
                                <span className="text-sm font-bold text-slate-500 group-hover:text-slate-800 transition-colors select-none">Ingat Saya</span>
                            </label>

                           
                        </div>

                        {/* --- TOMBOL SUBMIT --- */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full mt-2 py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-600/30 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {processing ? (
                                <span className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <BiLogInCircle className="text-2xl group-hover:scale-110 transition-transform" /> 
                                    <span>Masuk ke Sistem</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
                
                {/* --- FOOTER --- */}
                <div className="bg-slate-50/80 backdrop-blur p-6 text-center border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-400">
                        &copy; {new Date().getFullYear()} RestoPro. Hak Cipta Dilindungi.
                    </p>
                </div>
            </div>
        </div>
    );
}