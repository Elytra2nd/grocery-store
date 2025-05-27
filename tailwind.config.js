import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Poppins', ...defaultTheme.fontFamily.sans],
                poppins: ['Poppins', 'sans-serif'],
                keyframes: { fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } } },
                animation: { 'fade-in': 'fadeIn 0.3s ease-in' }

            },
            keyframes: {
                'fade-in-up': {
                  '0%': { opacity: 0, transform: 'translateY(24px)' },
                  '100%': { opacity: 1, transform: 'translateY(0)' },
                },
                'fade-in-down': {
                  '0%': { opacity: 0, transform: 'translateY(-16px)' },
                  '100%': { opacity: 1, transform: 'translateY(0)' },
                },
            },
            animation: {
                'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.4,0,0.2,1) both',
                'fade-in-down': 'fade-in-down 0.6s cubic-bezier(0.4,0,0.2,1) both',
            },
        },
    },

    plugins: [forms],
};
