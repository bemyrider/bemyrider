# 🎨 Guida Prettier - bemyrider

Questa guida spiega come utilizzare Prettier per mantenere uno stile di codice consistente nel progetto bemyrider.

## 📋 Configurazione

### File di Configurazione

**`.prettierrc`** - Configurazione principale:

```json
{
  "semi": true, // Punto e virgola sempre
  "trailingComma": "es5", // Virgola finale ES5
  "singleQuote": true, // Apici singoli
  "printWidth": 80, // Larghezza massima 80 caratteri
  "tabWidth": 2, // Indentazione 2 spazi
  "useTabs": false, // Usa spazi, non tab
  "bracketSpacing": true, // Spazio dopo parentesi
  "bracketSameLine": false, // Chiusura graffe nuova riga
  "arrowParens": "avoid", // Parentesi frecce quando necessario
  "jsxSingleQuote": true // Apici singoli in JSX
}
```

**`.prettierignore`** - File esclusi dalla formattazione:

- `node_modules/` - Dipendenze
- `.next/` - Build Next.js
- File di ambiente
- File database
- File di log

## 🚀 Utilizzo

### Comandi npm

```bash
# Formatta tutti i file del progetto
npm run format

# Controlla formattazione senza modificare
npm run format:check

# Formatta file specifici
npm run format:write
```

### Utilizzo Diretto

```bash
# Formatta un singolo file
npx prettier --write src/app/page.tsx

# Formatta tutti i file TypeScript/TSX
npx prettier --write "**/*.{ts,tsx}"

# Controlla formattazione
npx prettier --check "**/*.{ts,tsx}"
```

## 🔧 Integrazione IDE

### VSCode/Cursor

1. **Installa estensione:**
   - "Prettier - Code formatter"

2. **Configura impostazioni:**

   ```json
   {
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "editor.formatOnSave": true,
     "editor.formatOnPaste": true,
     "prettier.requireConfig": true
   }
   ```

3. **Imposta come formatter predefinito:**
   - File → Preferenze → Impostazioni
   - Cerca "formatter"
   - Seleziona Prettier per TypeScript, JavaScript, JSON

### Altri Editor

- **WebStorm/IntelliJ**: Prettier integrato
- **Sublime Text**: Package Prettier
- **Atom**: Package prettier-atom

## 📝 Esempi di Formattazione

### JavaScript/TypeScript

**Prima:**

```javascript
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

**Dopo:**

```javascript
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### React/JSX

**Prima:**

```jsx
<div className='container'>
  <h1>Hello World</h1>
  <p>Welcome to bemyrider</p>
</div>
```

**Dopo:**

```jsx
<div className='container'>
  <h1>Hello World</h1>
  <p>Welcome to bemyrider</p>
</div>
```

### Database Schema

**Prima:**

```typescript
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: text('full_name'),
});
```

**Dopo:**

```typescript
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: text('full_name'),
});
```

## 🔄 Integrazione CI/CD

### Pre-commit Hook (consigliato)

Installa `husky` e `lint-staged`:

```bash
npm install --save-dev husky lint-staged
npx husky install
```

**`.husky/pre-commit`:**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

**`package.json`:**

```json
{
  "lint-staged": {
    "**/*.{js,jsx,ts,tsx,json,css,md}": ["prettier --write", "eslint --fix"]
  }
}
```

### GitHub Actions

**`.github/workflows/prettier.yml`:**

```yaml
name: Prettier Check
on: [pull_request]
jobs:
  prettier:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run format:check
```

## 🎯 Best Practices

### 1. Formattazione Automatica

- Abilita "Format on Save" nel tuo IDE
- Usa pre-commit hooks per controlli automatici

### 2. Configurazione Consistente

- Non modificare `.prettierrc` senza consenso del team
- Mantieni `.prettierignore` aggiornato

### 3. Workflow di Sviluppo

```bash
# Durante sviluppo
npm run format          # Formatta tutto
npm run format:check    # Verifica formattazione

# Prima di commit
npm run lint           # ESLint
npm run format:check   # Prettier check
npm run test          # Test
```

### 4. Risoluzione Conflitti

- Prettier riduce conflitti di stile
- Se ci sono conflitti, usa `npm run format` per risolvere
- Evita modifiche manuali alla formattazione

## ❓ Troubleshooting

### "Prettier non trova la configurazione"

- Assicurati che `.prettierrc` sia nella root del progetto
- Verifica che il file sia valido JSON

### "File non vengono formattati"

- Controlla `.prettierignore`
- Verifica che l'estensione del file sia supportata
- Controlla i permessi del file

### "Conflitto con ESLint"

- ESLint gestisce regole logiche
- Prettier gestisce stile/formattazione
- Alcuni plugin ESLint possono essere disabilitati se usati con Prettier

## 📚 Risorse

- [Documentazione Ufficiale Prettier](https://prettier.io/docs/en/)
- [Configurazione Prettier](https://prettier.io/docs/en/configuration.html)
- [Prettier con Next.js](https://nextjs.org/docs/basic-features/eslint#prettier)

---

**Ricorda:** Prettier garantisce codice pulito e professionale! 🎨✨
