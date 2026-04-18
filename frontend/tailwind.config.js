/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: 'var(--text-primary)',
                secondary: 'var(--text-secondary)',
                accent: {
                    primary: 'rgb(var(--accent-primary) / <alpha-value>)',
                    secondary: 'rgb(var(--accent-secondary) / <alpha-value>)',
                    success: 'rgb(var(--accent-success) / <alpha-value>)',
                    warning: 'rgb(var(--accent-warning) / <alpha-value>)',
                    danger: 'rgb(var(--accent-danger) / <alpha-value>)',
                },
                glass: 'var(--glass-border)',
            },
            backgroundColor: {
                primary: 'var(--bg-primary)',
                secondary: 'var(--bg-secondary)',
                tertiary: 'var(--bg-tertiary)',
                card: 'var(--bg-card)',
                'glass-bg': 'var(--glass-bg)',
            },
            borderColor: {
                glass: 'var(--glass-border)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'bounce-slow': 'bounce 2s infinite',
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.6s ease-out forwards',
                'float': 'float 3s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
        },
    },
    plugins: [],
}
