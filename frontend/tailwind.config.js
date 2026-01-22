/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#0A0E27',
                secondary: '#1E1B4B',
                accent: {
                    purple: '#7C3AED',
                    cyan: '#06B6D4',
                    orange: '#FB923C'
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                heading: ['Poppins', 'sans-serif'],
                display: ['Bebas Neue', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
