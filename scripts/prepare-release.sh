#!/bin/bash

# prepare-release.sh
# Script per preparare una nuova release di bemyrider

set -e

echo "🚀 Preparazione Release bemyrider v1.2.0"
echo "========================================="

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funzione per print colorato
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verifica che siamo nella directory corretta
if [ ! -f "package.json" ]; then
    print_error "Errore: package.json non trovato. Eseguire lo script dalla root del progetto."
    exit 1
fi

# Verifica versione in package.json
VERSION=$(grep '"version"' package.json | sed 's/.*"version": "\([^"]*\)".*/\1/')
echo -e "\n${BLUE}📦 Versione attuale: $VERSION${NC}"

# Verifica che non ci siano modifiche non committate
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Ci sono modifiche non committate:"
    git status --short
    echo ""
    read -p "Vuoi continuare comunque? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Release annullata."
        exit 0
    fi
fi

echo -e "\n${BLUE}🔍 Controlli pre-release...${NC}"

# Test di build
print_info "Esecuzione build di test..."
if npm run build > /dev/null 2>&1; then
    print_status "Build completata con successo"
else
    print_error "Build fallita. Correggere gli errori prima della release."
    exit 1
fi

# Linting
print_info "Esecuzione controlli linting..."
if npm run lint > /dev/null 2>&1; then
    print_status "Linting completato senza errori"
else
    print_warning "Linting ha rilevato dei warning (non bloccante)"
fi

# Verifica che tutti i file importanti esistano
print_info "Verifica presenza file documentazione..."
files_to_check=("README.md" "CHANGELOG.md" "RELEASE_NOTES.md" "LICENSE")
for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        print_status "$file presente"
    else
        print_error "$file mancante"
        exit 1
    fi
done

echo -e "\n${BLUE}📝 Preparazione file release...${NC}"

# Crea directory release se non esiste
mkdir -p release

# Copia file importanti nella directory release
cp README.md release/
cp CHANGELOG.md release/
cp RELEASE_NOTES.md release/
cp LICENSE release/
cp package.json release/

print_status "File copiati in ./release/"

# Crea un file con informazioni release
cat > release/RELEASE_INFO.txt << EOF
BEMYRIDER RELEASE v$VERSION
========================

Data Release: $(date "+%Y-%m-%d %H:%M:%S")
Commit Hash: $(git rev-parse HEAD)
Branch: $(git branch --show-current)

File inclusi nella release:
- README.md (documentazione principale)
- CHANGELOG.md (storia modifiche)
- RELEASE_NOTES.md (note di release)
- LICENSE (licenza)
- package.json (info package)

Statistiche progetto:
- Righe di codice TypeScript: $(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | xargs wc -l | tail -1)
- Componenti React: $(find ./components -name "*.tsx" | wc -l)
- Pagine Next.js: $(find ./app -name "page.tsx" | wc -l)
- API Routes: $(find ./app/api -name "route.ts" | wc -l)

Dipendenze principali:
$(grep -E '"(next|react|@supabase|stripe)"' package.json)
EOF

print_status "Creato RELEASE_INFO.txt"

echo -e "\n${GREEN}🎉 Release v$VERSION preparata con successo!${NC}"
echo -e "\n${BLUE}📋 Prossimi passi:${NC}"
echo "1. Revisiona i file in ./release/"
echo "2. Committa le modifiche: git add . && git commit -m \"Release v$VERSION\""
echo "3. Crea tag: git tag -a v$VERSION -m \"Release v$VERSION\""
echo "4. Push su GitHub: git push origin main --tags"
echo "5. Crea release su GitHub usando RELEASE_NOTES.md"

echo -e "\n${YELLOW}📖 Comandi rapidi:${NC}"
echo "git add ."
echo "git commit -m \"Release v$VERSION\""
echo "git tag -a v$VERSION -m \"Release v$VERSION\""
echo "git push origin main --tags"

echo -e "\n${BLUE}🔗 GitHub Release:${NC}"
echo "Vai su: https://github.com/bemyrider/bemyrider/releases/new"
echo "- Tag: v$VERSION"
echo "- Title: bemyrider v$VERSION - Localizzazione e Gestione Account Avanzata"
echo "- Descrizione: Copia il contenuto da RELEASE_NOTES.md"

print_status "Preparazione release completata!"
