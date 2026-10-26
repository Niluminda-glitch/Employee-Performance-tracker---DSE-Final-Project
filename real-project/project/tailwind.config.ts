
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
        success: {
          DEFAULT: 'hsl(142, 76%, 36%)',
          foreground: 'hsl(0, 0%, 100%)',
          muted: 'hsl(142, 76%, 95%)',
          emphasis: 'hsl(142, 76%, 36%)',
        },
        info: {
          DEFAULT: 'hsl(245, 100%, 60%)',
          foreground: 'hsl(0, 0%, 100%)',
          muted: 'hsl(245, 100%, 97%)',
          emphasis: 'hsl(245, 100%, 60%)',
        },
        warning: {
          DEFAULT: 'hsl(37, 97%, 53%)',
          foreground: 'hsl(0, 0%, 100%)',
          muted: 'hsl(48, 96%, 96%)',
          emphasis: 'hsl(37, 97%, 53%)',
        },
        danger: {
          DEFAULT: 'hsl(0, 84%, 60%)',
          foreground: 'hsl(0, 0%, 100%)',
          muted: 'hsl(0, 94%, 97%)',
          emphasis: 'hsl(0, 84%, 60%)',
        },
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        pill: '9999px',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        'shimmer-slow': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        },
        'slide-in-bottom': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'slide-in-top': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'zoom-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1)', opacity: '0.4' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-8px) translateX(4px)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'shimmer-slow': 'shimmer-slow 3s linear infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',
        'slide-in-bottom': 'slide-in-bottom 0.3s ease-out',
        'slide-in-top': 'slide-in-top 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'zoom-in': 'zoom-in 0.3s ease-out',
        'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.24, 0, 0.38, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'float-delay': 'float 6s ease-in-out infinite 1s',
        'float-slow': 'float 8s ease-in-out infinite 2s',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'spin-slow': 'spin-slow 6s linear infinite',
			},
			boxShadow: {
				'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'card': '0px 2px 8px rgba(0, 0, 0, 0.05)',
        'card-hover': '0px 8px 24px rgba(0, 0, 0, 0.08)',
        'subtle': '0 2px 6px rgba(124, 58, 237, 0.08)',
        'button': '0 2px 5px rgba(124, 58, 237, 0.2)',
        'elevation-1': '0px 1px 3px rgba(0, 0, 0, 0.08)',
        'elevation-2': '0px 3px 8px rgba(0, 0, 0, 0.06), 0px 1px 2px rgba(0, 0, 0, 0.04)',
        'elevation-3': '0px 8px 20px rgba(0, 0, 0, 0.08), 0px 2px 4px rgba(0, 0, 0, 0.04)',
        'glow-primary': '0px 0px 20px rgba(124, 58, 237, 0.2)',
        'glow-success': '0px 0px 20px rgba(34, 197, 94, 0.2)',
        'glow-info': '0px 0px 20px rgba(99, 102, 241, 0.2)',
        'glow-warning': '0px 0px 20px rgba(251, 191, 36, 0.2)',
        'glow-danger': '0px 0px 20px rgba(239, 68, 68, 0.2)',
			},
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-subtle': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(to right, hsl(var(--primary)), hsl(245, 100%, 60%))',
        'gradient-primary-diagonal': 'linear-gradient(45deg, hsl(var(--primary)), hsl(245, 100%, 60%))',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 20%, rgba(255, 255, 255, 0.5) 60%, transparent 100%)',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'width': 'width',
        'transform': 'transform',
      },
      fontFamily: {
        sans: [
          'Inter var', 
          'Inter', 
          'ui-sans-serif', 
          'system-ui', 
          '-apple-system', 
          'BlinkMacSystemFont',
          'sans-serif'
        ],
        display: [
          'Plus Jakarta Sans', 
          'Inter var', 
          'Inter', 
          'ui-sans-serif', 
          'system-ui',
          'sans-serif'
        ],
      },
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
