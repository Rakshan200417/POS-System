/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#00f2fe',
                    dark: '#4facfe',
                },
                secondary: {
                    DEFAULT: '#f093fb',
                    dark: '#f5576c',
                },
                dark: {
                    base: '#0f172a',
                    surface: '#1e293b',
                    accent: '#334155',
                }
            },
            backgroundImage: {
                'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                'neon-gradient': 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
            },
            boxShadow: {
                'neon-blue': '0 0 15px rgba(0, 242, 254, 0.5)',
                'neon-purple': '0 0 15px rgba(240, 147, 251, 0.5)',
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}
