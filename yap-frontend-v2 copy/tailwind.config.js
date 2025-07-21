// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        tertiary: 'var(--color-tertiary)',
        error: 'var(--color-error)',

        bgPrimary: 'var(--color-background-primary)',
        bgSecondary: 'var(--color-background-secondary)',
        textOnDark: 'var(--color-text-dark-bg)',

        foreground: 'var(--color-foreground)',
      },
      padding: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-right': 'env(safe-area-inset-right)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
      },
    },
  },
  plugins: [],
};
