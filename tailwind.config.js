/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'custom': '768px',  // 커스텀 반응형 브레이크포인트 (태블릿/데스크톱 경계)
      },
      fontFamily: {
        sans: [
          'Pretendard', 
          '-apple-system', 
          'BlinkMacSystemFont', 
          'system-ui', 
          'Roboto', 
          'Helvetica Neue', 
          'Segoe UI', 
          'Apple SD Gothic Neo', 
          'Noto Sans KR', 
          'Malgun Gothic', 
          'Apple Color Emoji', 
          'Segoe UI Emoji', 
          'Segoe UI Symbol', 
          'sans-serif'
        ],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        'subtle-lift': {
          '0%': { 
            'transform': 'translateY(0px)',
            'box-shadow': '0 1px 3px rgba(0, 0, 0, 0.1)'
          },
          '50%': { 
            'transform': 'translateY(-1px)',
            'box-shadow': '0 8px 25px rgba(59, 130, 246, 0.15)'
          },
          '100%': { 
            'transform': 'translateY(0px)',
            'box-shadow': '0 1px 3px rgba(0, 0, 0, 0.1)'
          },
        },
        'soft-glow': {
          '0%, 100%': { 
            'opacity': '0.8'
          },
          '50%': { 
            'opacity': '1'
          },
        },
      },
      animation: {
        'subtle-lift': 'subtle-lift 2s ease-in-out infinite',
        'soft-glow': 'soft-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

