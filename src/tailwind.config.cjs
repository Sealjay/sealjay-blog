/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  plugins: [require('@tailwindcss/typography')],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        body: ['"Source Serif 4"', 'Georgia', '"Times New Roman"', 'serif'],
        code: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        // Backward-compatible aliases (remove once global.css is migrated)
        sans: ['"Source Serif 4"', 'Georgia', '"Times New Roman"', 'serif'],
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#0C0A1D',
          900: '#110E26',
          850: '#17132E',
          800: '#1E1A3A',
          700: '#2A2550',
          600: '#6670A0',
          500: '#9BA3CF',
          400: '#B8BFE0',
          300: '#D0D5EB',
          200: '#E0E7FF',
          100: '#EEF2FF',
          50: '#F8F9FC',
        },
        paper: {
          50: '#F8F9FC',
          100: '#EEEEF8',
          200: '#E4E3F2',
          300: '#D4D2E8',
        },
        indigo: {
          DEFAULT: '#818CF8',
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        },
        rose: {
          DEFAULT: '#F472B6',
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#F472B6',
          600: '#DB2777',
          700: '#BE185D',
        },
        emerald: { DEFAULT: '#34D399', 600: '#059669' },
        // Backward-compatible alias (remove once global.css is migrated to indigo-*)
        accent: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        },
      },
      fontSize: {
        xs: ['0.8125rem', { lineHeight: '1.5rem' }],
        sm: ['0.875rem', { lineHeight: '1.5rem' }],
        base: ['1rem', { lineHeight: '1.75rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '2rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '3.5rem' }],
        '6xl': ['3.75rem', { lineHeight: '1.2' }],
        '7xl': ['4.5rem', { lineHeight: '1.1' }],
        '8xl': ['6rem', { lineHeight: '1.1' }],
        '9xl': ['8rem', { lineHeight: '1.1' }],
        display: ['2.75rem', { lineHeight: '1.15', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-mobile': ['2rem', { lineHeight: '1.15', letterSpacing: '-0.025em', fontWeight: '700' }],
        h2: ['1.75rem', { lineHeight: '1.25', letterSpacing: '-0.02em', fontWeight: '600' }],
        'h2-mobile': ['1.375rem', { lineHeight: '1.25', letterSpacing: '-0.02em', fontWeight: '600' }],
        h3: ['1.3125rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h3-mobile': ['1.125rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        body: ['1rem', { lineHeight: '1.75' }],
        'body-mobile': ['0.9375rem', { lineHeight: '1.75' }],
        'body-sm': ['0.875rem', { lineHeight: '1.65' }],
        'body-sm-mobile': ['0.8125rem', { lineHeight: '1.65' }],
        tag: ['0.6875rem', { lineHeight: '1', fontWeight: '500' }],
        overline: ['0.625rem', { lineHeight: '1', fontWeight: '600', letterSpacing: '0.08em' }],
        code: ['0.875rem', { lineHeight: '1.65' }],
        'code-mobile': ['0.75rem', { lineHeight: '1.65' }],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-slide-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-slide-in': 'fade-slide-in 0.3s ease forwards',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
      },
      maxWidth: {
        content: '720px',
        layout: '1120px',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.22, 1, 0.36, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
    typography: () => ({
      DEFAULT: {
        css: {
          '--tw-prose-body': 'var(--color-text)',
          '--tw-prose-headings': 'var(--color-text)',
          '--tw-prose-links': 'var(--color-primary)',
          '--tw-prose-links-hover': 'var(--color-primary-hover)',
          '--tw-prose-underline': 'var(--color-primary-underline, rgba(99, 102, 241, 0.2))',
          '--tw-prose-underline-hover': 'var(--color-primary)',
          '--tw-prose-bold': 'var(--color-text)',
          '--tw-prose-counters': 'var(--color-text)',
          '--tw-prose-bullets': 'var(--color-text)',
          '--tw-prose-hr': 'var(--color-border)',
          '--tw-prose-quote-borders': 'var(--color-border)',
          '--tw-prose-captions': 'var(--color-text-muted)',
          '--tw-prose-code': 'var(--color-text)',
          '--tw-prose-code-bg': 'var(--color-code-bg, rgba(99, 102, 241, 0.08))',
          '--tw-prose-pre-code': 'var(--color-pre-code, #EEF2FF)',
          '--tw-prose-pre-bg': 'var(--color-pre-bg, #0C0A1D)',
          '--tw-prose-pre-border': 'var(--color-border)',
          '--tw-prose-th-borders': 'var(--color-border)',
          '--tw-prose-td-borders': 'var(--color-border)',

          // Base
          color: 'var(--tw-prose-body)',
          lineHeight: '1.75',
          '> *': {
            marginTop: '2.5rem',
            marginBottom: '2.5rem',
          },
          p: {
            marginTop: '2rem',
            marginBottom: '2rem',
          },

          // Headings
          'h2, h3': {
            color: 'var(--tw-prose-headings)',
            fontWeight: '600',
          },
          h2: {
            fontSize: '1.5rem',
            lineHeight: '1.75rem',
            marginTop: '5rem',
            marginBottom: '1.5rem',
          },
          h3: {
            fontSize: '1.125rem',
            lineHeight: '1.75rem',
            marginTop: '4rem',
            marginBottom: '1rem',
          },
          ':is(h2, h3) + *': {
            marginTop: 0,
          },

          // Images
          img: {
            borderRadius: '16px',
          },

          // Inline elements
          a: {
            color: 'var(--tw-prose-links)',
            fontWeight: '600',
            textDecoration: 'underline',
            textDecorationColor: 'var(--tw-prose-underline)',
            transitionProperty: 'color, text-decoration-color',
            transitionDuration: '150ms',
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          },
          'a:hover': {
            color: 'var(--tw-prose-links-hover)',
            textDecorationColor: 'var(--tw-prose-underline-hover)',
          },
          strong: {
            color: 'var(--tw-prose-bold)',
            fontWeight: '600',
          },
          code: {
            display: 'inline-block',
            color: 'var(--tw-prose-code)',
            fontSize: '0.875rem',
            fontWeight: '600',
            backgroundColor: 'var(--tw-prose-code-bg)',
            borderRadius: '16px',
            paddingLeft: '0.25rem',
            paddingRight: '0.25rem',
          },
          'a code': {
            color: 'inherit',
          },
          ':is(h2, h3) code': {
            fontWeight: '700',
          },

          // Quotes
          blockquote: {
            paddingLeft: '1.5rem',
            borderLeftWidth: '2px',
            borderLeftColor: 'var(--tw-prose-quote-borders)',
            fontStyle: 'italic',
          },

          // Figures
          figcaption: {
            color: 'var(--tw-prose-captions)',
            fontSize: '0.875rem',
            lineHeight: '1.5rem',
            marginTop: '0.75rem',
          },
          'figcaption > p': {
            margin: 0,
          },

          // Lists
          ul: {
            listStyleType: 'disc',
          },
          ol: {
            listStyleType: 'decimal',
          },
          'ul, ol': {
            paddingLeft: '1.5rem',
          },
          li: {
            marginTop: '1.5rem',
            marginBottom: '1.5rem',
            paddingLeft: '0.875rem',
          },
          'li::marker': {
            fontSize: '0.875rem',
            fontWeight: '600',
          },
          'ol > li::marker': {
            color: 'var(--tw-prose-counters)',
          },
          'ul > li::marker': {
            color: 'var(--tw-prose-bullets)',
          },
          'li :is(ol, ul)': {
            marginTop: '1rem',
            marginBottom: '1rem',
          },
          'li :is(li, p)': {
            marginTop: '0.75rem',
            marginBottom: '0.75rem',
          },

          // Code blocks
          pre: {
            color: 'var(--tw-prose-pre-code)',
            fontSize: '0.875rem',
            fontWeight: '500',
            backgroundColor: 'var(--tw-prose-pre-bg)',
            borderRadius: '1.5rem',
            padding: '2rem',
            overflowX: 'auto',
            border: '1px solid',
            borderColor: 'var(--tw-prose-pre-border)',
          },
          'pre code': {
            display: 'inline',
            color: 'inherit',
            fontSize: 'inherit',
            fontWeight: 'inherit',
            backgroundColor: 'transparent',
            borderRadius: 0,
            padding: 0,
          },

          // Horizontal rules
          hr: {
            marginTop: '5rem',
            marginBottom: '5rem',
            borderTopWidth: '1px',
            borderColor: 'var(--tw-prose-hr)',
            '@screen lg': {
              marginLeft: '-3rem',
              marginRight: '-3rem',
            },
          },

          // Tables
          table: {
            width: '100%',
            tableLayout: 'auto',
            textAlign: 'left',
            fontSize: '0.875rem',
          },
          thead: {
            borderBottomWidth: '1px',
            borderBottomColor: 'var(--tw-prose-th-borders)',
          },
          'thead th': {
            color: 'var(--tw-prose-headings)',
            fontWeight: '600',
            verticalAlign: 'bottom',
            paddingBottom: '0.5rem',
          },
          'thead th:not(:first-child)': {
            paddingLeft: '0.5rem',
          },
          'thead th:not(:last-child)': {
            paddingRight: '0.5rem',
          },
          'tbody tr': {
            borderBottomWidth: '1px',
            borderBottomColor: 'var(--tw-prose-td-borders)',
          },
          'tbody tr:last-child': {
            borderBottomWidth: 0,
          },
          'tbody td': {
            verticalAlign: 'baseline',
          },
          tfoot: {
            borderTopWidth: '1px',
            borderTopColor: 'var(--tw-prose-th-borders)',
          },
          'tfoot td': {
            verticalAlign: 'top',
          },
          ':is(tbody, tfoot) td': {
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
          },
          ':is(tbody, tfoot) td:not(:first-child)': {
            paddingLeft: '0.5rem',
          },
          ':is(tbody, tfoot) td:not(:last-child)': {
            paddingRight: '0.5rem',
          },
        },
      },
    }),
  },
}
