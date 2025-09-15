# 🎨 Branding e Linee Guida Visive

Questa sezione contiene tutte le linee guida per mantenere la coerenza visiva e l'identità di bemyrider attraverso tutti i touchpoint digitali e fisici.

## 🌈 Palette Colori

### Colori Primari

```css
/* Corporate Blue - Affidabilità e Professionalità */
--primary: #333366; /* Blue Navy */
--primary-50: #f8f9ff;
--primary-100: #e6e7ff;
--primary-200: #d1d3ff;
--primary-300: #a3a7ff;
--primary-400: #6e74ff;
--primary-500: #333366; /* Primary */
--primary-600: #2a2e5a;
--primary-700: #202249;
--primary-800: #161735;
--primary-900: #0d0e1f;

/* Orange Accent - Energia e Dinamismo */
--secondary: #ff9900; /* Orange */
--secondary-50: #fff9f0;
--secondary-100: #ffe6cc;
--secondary-200: #ffcc99;
--secondary-300: #ffaa66;
--secondary-400: #ff9900; /* Secondary */
--secondary-500: #e6860d;
--secondary-600: #cc6600;
--secondary-700: #b34700;
--secondary-800: #993d0a;
--secondary-900: #662a08;
```

### Colori Semantici

```css
/* Success States */
--success: #10b981; /* Green */
--success-light: #d1fae5;
--success-dark: #047857;

/* Warning States */
--warning: #f59e0b; /* Yellow */
--warning-light: #fef3c7;
--warning-dark: #d97706;

/* Error States */
--error: #ef4444; /* Red */
--error-light: #fecaca;
--error-dark: #dc2626;

/* Info States */
--info: #3b82f6; /* Blue */
--info-light: #dbeafe;
--info-dark: #1d4ed8;
```

### Colori Neutrali

```css
/* Gray Scale */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;

/* Background Colors */
--background: #ffffff;
--surface: #f8fafc;
--card: #ffffff;
--overlay: rgba(0, 0, 0, 0.5);
```

## 📝 Tipografia

### Font Family Principali

```css
/* Logo e Titoli */
--font-logo: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;

/* Testo Principale */
--font-text: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Monospace per Codice */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Scale Tipografica

```css
/* Display */
--text-display-2xl: 4.5rem; /* 72px */
--text-display-xl: 3.75rem; /* 60px */
--text-display-lg: 3rem; /* 48px */
--text-display-md: 2.25rem; /* 36px */
--text-display-sm: 1.875rem; /* 30px */

/* Headings */
--text-heading-xl: 2rem; /* 32px */
--text-heading-lg: 1.5rem; /* 24px */
--text-heading-md: 1.25rem; /* 20px */
--text-heading-sm: 1.125rem; /* 18px */

/* Body */
--text-body-lg: 1.125rem; /* 18px */
--text-body-md: 1rem; /* 16px */
--text-body-sm: 0.875rem; /* 14px */
--text-body-xs: 0.75rem; /* 12px */

/* Labels */
--text-label-lg: 0.875rem; /* 14px */
--text-label-md: 0.8125rem; /* 13px */
--text-label-sm: 0.75rem; /* 12px */
```

### Pesie Font

```css
--font-weight-thin: 100;
--font-weight-light: 300;
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;
--font-weight-black: 900;
```

## 🎯 Logo e Identità

### Logo Principale

- **File**: `public/bemyrider_logo.svg`
- **Utilizzo**: Sempre versione vettoriale
- **Colore**: Primary (#333366) su sfondo chiaro
- **Colore**: White su sfondo primary

### Logo Variants

```css
/* Logo con tagline */
.bemyrider-logo-full {
  /* Logo + "Connettiamo rider professionisti" */
}

/* Logo icona sola */
.bemyrider-logo-icon {
  /* Solo icona per mobile e favicon */
}

/* Logo minimal */
.bemyrider-logo-minimal {
  /* Versione semplificata per contesti piccoli */
}
```

### Spazio di Respirazione (Clear Space)

```css
/* Minimum clear space around logo */
--logo-clear-space: 1.5rem; /* 24px */

/* Usage */
.logo-container {
  padding: var(--logo-clear-space);
}
```

## 🎨 Design System

### Componenti Base (shadcn/ui)

#### Button Variants

```typescript
// Primary Button
<button className="bg-primary hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
  Azione Principale
</button>

// Secondary Button
<button className="bg-secondary hover:bg-secondary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
  Azione Secondaria
</button>

// Outline Button
<button className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-6 py-3 rounded-lg font-medium transition-colors">
  Azione Outline
</button>
```

#### Card Component

```typescript
// Standard Card
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
  <h3 className="text-heading-md font-semibold text-gray-900 mb-4">Titolo Card</h3>
  <p className="text-body-md text-gray-600">Contenuto della card</p>
</div>

// Featured Card
<div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl shadow-lg border border-primary-200 p-6">
  <div className="flex items-center mb-4">
    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-heading-md font-semibold text-gray-900">Titolo Featured</h3>
  </div>
</div>
```

### Layout Patterns

#### Container Widths

```css
--container-xs: 20rem; /* 320px */
--container-sm: 24rem; /* 384px */
--container-md: 28rem; /* 448px */
--container-lg: 32rem; /* 512px */
--container-xl: 36rem; /* 576px */
--container-2xl: 42rem; /* 672px */
--container-3xl: 48rem; /* 768px */
--container-4xl: 56rem; /* 896px */
--container-5xl: 64rem; /* 1024px */
--container-6xl: 72rem; /* 1152px */
--container-7xl: 80rem; /* 1280px */
```

#### Spacing Scale

```css
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
--space-20: 5rem; /* 80px */
--space-24: 6rem; /* 96px */
```

## 🎭 Iconografia

### Icon Library

- **Framework**: Lucide React (open source, consistente)
- **Stile**: Outline per interfaccia generale, Filled per azioni importanti
- **Dimensione**: 16px, 20px, 24px, 32px scale

### Icon Usage Guidelines

```typescript
// Action Icons
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

// Navigation Icons
import { Home, Search, User, Settings } from 'lucide-react';

// Status Icons
import { Clock, Check, X, AlertTriangle } from 'lucide-react';
```

## 📱 Responsive Design

### Breakpoints

```css
--breakpoint-sm: 640px; /* Mobile */
--breakpoint-md: 768px; /* Tablet */
--breakpoint-lg: 1024px; /* Desktop */
--breakpoint-xl: 1280px; /* Large Desktop */
--breakpoint-2xl: 1536px; /* Extra Large */
```

### Mobile-First Approach

```css
/* Mobile First */
.component {
  /* Mobile styles */
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    /* Tablet styles */
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component {
    /* Desktop styles */
  }
}
```

## 🌙 Dark Mode Support

### Dark Mode Colors

```css
/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0f172a;
    --surface: #1e293b;
    --card: #334155;
    --text-primary: #f1f5f9;
    --text-secondary: #cbd5e1;
  }
}
```

### Dark Mode Implementation

```typescript
// Theme provider
const [isDark, setIsDark] = useState(false);

// Apply theme
document.documentElement.classList.toggle('dark', isDark);
```

## ♿ Accessibilità

### Contrast Requirements

- **Text normale**: 4.5:1 minimum contrast ratio
- **Large text**: 3:1 minimum contrast ratio
- **UI components**: 3:1 minimum contrast ratio

### Focus Management

```css
/* Focus styles */
.focusable:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Skip links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--primary);
  color: white;
  padding: 8px;
  z-index: 100;
}
```

## 📏 Grid e Layout

### CSS Grid System

```css
/* 12-column grid */
.grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-4);
}

/* Responsive grid */
@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

## 🎯 Component Patterns

### Loading States

```typescript
// Skeleton loader
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>

// Spinner
<div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
```

### Error States

```typescript
// Error message
<div className="bg-error-light border border-error text-error px-4 py-3 rounded-lg">
  <div className="flex items-center">
    <AlertCircle className="w-5 h-5 mr-3" />
    <div>
      <h4 className="font-medium">Errore</h4>
      <p className="text-sm">Messaggio di errore dettagliato</p>
    </div>
  </div>
</div>
```

## 📊 Data Visualization

### Chart Colors

```css
/* Chart color palette */
--chart-1: #333366; /* Primary */
--chart-2: #ff9900; /* Secondary */
--chart-3: #10b981; /* Success */
--chart-4: #f59e0b; /* Warning */
--chart-5: #ef4444; /* Error */
--chart-6: #3b82f6; /* Info */
```

## 🚀 Implementation Guide

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8f9ff',
          500: '#333366',
          600: '#2a2e5a',
          // ... other shades
        },
        secondary: {
          50: '#fff9f0',
          500: '#ff9900',
          600: '#e6860d',
          // ... other shades
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui'],
        logo: ['Manrope', 'system-ui'],
      },
    },
  },
};
```

### CSS Custom Properties

```css
/* css/globals.css */
:root {
  /* Colors */
  --primary: #333366;
  --secondary: #ff9900;

  /* Typography */
  --font-logo: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-text: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  /* ... */
}
```

Questa guida assicura che tutti i componenti e le interfacce di bemyrider mantengano una identità visiva coerente, professionale e user-friendly attraverso tutti i dispositivi e contesti di utilizzo.
