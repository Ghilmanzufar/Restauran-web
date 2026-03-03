import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                // Anda bisa ganti 'Figtree' dengan 'Inter' atau 'Plus Jakarta Sans' 
                // jika ingin font aplikasi POS yang lebih modern khas startup.
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            boxShadow: {
                // Tambahan shadow lembut khas aplikasi modern (Glassmorphism / Soft UI)
                'soft': '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
                'floating': '0 10px 40px -10px rgba(0, 0, 0, 0.08)',
            },
            colors: {
                // Opsional: Jika Anda punya warna brand spesifik, masukkan di sini.
                // brand: '#ff6b00', 
            }
        },
    },

    plugins: [
        forms,
        
        // --- CUSTOM PLUGINS TAMBAHAN ---
        plugin(function ({ addUtilities }) {
            addUtilities({
                // 1. Hilangkan visual scrollbar tapi fungsi scroll tetap jalan (Dipakai di POS Kiri)
                '.no-scrollbar::-webkit-scrollbar': {
                    'display': 'none',
                },
                '.no-scrollbar': {
                    '-ms-overflow-style': 'none',  /* IE and Edge */
                    'scrollbar-width': 'none',  /* Firefox */
                },
                
                // 2. Custom Scrollbar Elegan (Dipakai di Sidebar Admin)
                '.custom-scrollbar::-webkit-scrollbar': {
                    'width': '6px',
                    'height': '6px',
                },
                '.custom-scrollbar::-webkit-scrollbar-track': {
                    'background': 'transparent',
                },
                '.custom-scrollbar::-webkit-scrollbar-thumb': {
                    'background': '#cbd5e1', // Warna slate-300
                    'border-radius': '10px',
                },
                '.custom-scrollbar::-webkit-scrollbar-thumb:hover': {
                    'background': '#94a3b8', // Warna slate-400
                },
            })
        })
    ],
};