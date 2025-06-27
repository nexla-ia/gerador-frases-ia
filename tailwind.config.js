/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'color-shift': 'colorShift 10s ease-in-out infinite',
        'color-shift-delayed': 'colorShiftDelayed 10s ease-in-out infinite',
        'color-shift-alt': 'colorShiftAlt 12s ease-in-out infinite',
        'color-shift-alt-delayed': 'colorShiftAltDelayed 12s ease-in-out infinite',
        'pulse-slow': 'pulseSlow 8s ease-in-out infinite',
      },
      keyframes: {
        pulseSlow: {
          '0%, 100%': { 
            opacity: '0.03',
            transform: 'scale(1)'
          },
          '50%': { 
            opacity: '0.06',
            transform: 'scale(1.05)'
          }
        },
        colorShift: {
          '0%': { 
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0.1) 40%, transparent 70%)',
            transform: 'scale(1) rotate(0deg)'
          },
          '16.66%': { 
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.1) 40%, transparent 70%)',
            transform: 'scale(1.1) rotate(60deg)'
          },
          '33.33%': { 
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, rgba(236, 72, 153, 0.1) 40%, transparent 70%)',
            transform: 'scale(0.9) rotate(120deg)'
          },
          '50%': { 
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.25) 0%, rgba(147, 51, 234, 0.1) 40%, transparent 70%)',
            transform: 'scale(1.2) rotate(180deg)'
          },
          '66.66%': { 
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0.1) 40%, transparent 70%)',
            transform: 'scale(0.8) rotate(240deg)'
          },
          '83.33%': { 
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.1) 40%, transparent 70%)',
            transform: 'scale(1.15) rotate(300deg)'
          },
          '100%': { 
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0.1) 40%, transparent 70%)',
            transform: 'scale(1) rotate(360deg)'
          }
        },
        colorShiftDelayed: {
          '0%': { 
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.25) 0%, rgba(147, 51, 234, 0.1) 40%, transparent 70%)',
            transform: 'scale(1.1) rotate(180deg)'
          },
          '16.66%': { 
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, rgba(236, 72, 153, 0.1) 40%, transparent 70%)',
            transform: 'scale(0.9) rotate(240deg)'
          },
          '33.33%': { 
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0.1) 40%, transparent 70%)',
            transform: 'scale(1.3) rotate(300deg)'
          },
          '50%': { 
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.1) 40%, transparent 70%)',
            transform: 'scale(0.7) rotate(0deg)'
          },
          '66.66%': { 
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.1) 40%, transparent 70%)',
            transform: 'scale(1.2) rotate(60deg)'
          },
          '83.33%': { 
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0.1) 40%, transparent 70%)',
            transform: 'scale(1) rotate(120deg)'
          },
          '100%': { 
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.25) 0%, rgba(147, 51, 234, 0.1) 40%, transparent 70%)',
            transform: 'scale(1.1) rotate(180deg)'
          }
        },
        colorShiftAlt: {
          '0%': { 
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.08) 40%, transparent 70%)',
            transform: 'scale(0.8) rotate(90deg)'
          },
          '16.66%': { 
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.08) 40%, transparent 70%)',
            transform: 'scale(1.1) rotate(150deg)'
          },
          '33.33%': { 
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.2) 0%, rgba(147, 51, 234, 0.08) 40%, transparent 70%)',
            transform: 'scale(0.9) rotate(210deg)'
          },
          '50%': { 
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, rgba(236, 72, 153, 0.08) 40%, transparent 70%)',
            transform: 'scale(1.3) rotate(270deg)'
          },
          '66.66%': { 
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.08) 40%, transparent 70%)',
            transform: 'scale(0.7) rotate(330deg)'
          },
          '83.33%': { 
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.08) 40%, transparent 70%)',
            transform: 'scale(1.2) rotate(30deg)'
          },
          '100%': { 
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.08) 40%, transparent 70%)',
            transform: 'scale(0.8) rotate(90deg)'
          }
        },
        colorShiftAltDelayed: {
          '0%': { 
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.08) 40%, transparent 70%)',
            transform: 'scale(1.2) rotate(270deg)'
          },
          '16.66%': { 
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.2) 0%, rgba(147, 51, 234, 0.08) 40%, transparent 70%)',
            transform: 'scale(0.8) rotate(330deg)'
          },
          '33.33%': { 
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.08) 40%, transparent 70%)',
            transform: 'scale(1.4) rotate(30deg)'
          },
          '50%': { 
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.08) 40%, transparent 70%)',
            transform: 'scale(0.6) rotate(90deg)'
          },
          '66.66%': { 
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, rgba(236, 72, 153, 0.08) 40%, transparent 70%)',
            transform: 'scale(1.1) rotate(150deg)'
          },
          '83.33%': { 
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.08) 40%, transparent 70%)',
            transform: 'scale(0.9) rotate(210deg)'
          },
          '100%': { 
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.08) 40%, transparent 70%)',
            transform: 'scale(1.2) rotate(270deg)'
          }
        }
      }
    },
  },
  plugins: [],
};