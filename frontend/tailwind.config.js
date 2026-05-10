/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // هنا قمت بإضافة إعدادات إضافية لضمان أن التصميم يبدو طبياً واحترافياً
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // يمكنك إضافة ألوان مخصصة هنا إذا أردت مستقبلاً
        primary: {
          50: '#eff6ff',
          600: '#2563eb',
          900: '#1e3a8a',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'zoom-in': 'zoomIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        zoomIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}