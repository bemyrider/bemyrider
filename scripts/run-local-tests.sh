#!/bin/bash
# Script per eseguire test TestSprite localmente
# Uso: ./scripts/run-local-tests.sh

set -e

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 bemyrider - Test Suite Locale${NC}"
echo "=================================="

# Controlla se il server è in esecuzione
if ! curl -s http://localhost:3000 > /dev/null; then
    echo -e "${RED}❌ Server non in esecuzione su localhost:3000${NC}"
    echo -e "${YELLOW}💡 Avvia il server con: npm run dev${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Server verificato su localhost:3000${NC}"

# Verifica variabili di ambiente
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ File .env.local non trovato${NC}"
    echo -e "${YELLOW}💡 Copia env.example in .env.local e configura le variabili${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Configurazione ambiente verificata${NC}"

# Crea account test
echo -e "${BLUE}👤 Creazione account test...${NC}"
if node scripts/create-test-accounts.js; then
    echo -e "${GREEN}✅ Account test creati/aggiornati${NC}"
else
    echo -e "${RED}❌ Errore nella creazione account test${NC}"
    exit 1
fi

# Esegui linting
echo -e "${BLUE}🔍 Controllo qualità codice...${NC}"
if npm run lint; then
    echo -e "${GREEN}✅ Linting passed${NC}"
else
    echo -e "${YELLOW}⚠️ Warning: Linting issues found${NC}"
fi

# Esegui test TypeScript
echo -e "${BLUE}📝 Controllo tipi TypeScript...${NC}"
if npx tsc --noEmit; then
    echo -e "${GREEN}✅ TypeScript check passed${NC}"
else
    echo -e "${RED}❌ TypeScript errors found${NC}"
    exit 1
fi

# Esegui TestSprite
echo -e "${BLUE}🧪 Avvio test TestSprite...${NC}"
echo -e "${YELLOW}📋 Utilizzo account test:${NC}"
echo -e "   Rider: test.rider@bemyrider.test / TestRider2024!"
echo -e "   Merchant: test.merchant@bemyrider.test / TestMerchant2024!"

if npx testsprite-mcp generateCodeAndExecute \
    --project-path="$(pwd)" \
    --project-name="bemyrider" \
    --additional-instruction="Utilizzare account test: rider test.rider@bemyrider.test / TestRider2024! e merchant test.merchant@bemyrider.test / TestMerchant2024!"; then
    echo -e "${GREEN}✅ TestSprite completato${NC}"
else
    echo -e "${RED}❌ TestSprite fallito${NC}"
    exit 1
fi

# Mostra risultati
if [ -f "testsprite_tests/testsprite-mcp-test-report.md" ]; then
    echo -e "${BLUE}📊 Riepilogo risultati:${NC}"
    echo "======================"
    
    # Estrai metriche principali dal report
    PASSED=$(grep -o "✅ Passed" testsprite_tests/testsprite-mcp-test-report.md | wc -l || echo "0")
    FAILED=$(grep -o "❌ Failed" testsprite_tests/testsprite-mcp-test-report.md | wc -l || echo "0")
    TOTAL=$((PASSED + FAILED))
    
    if [ $TOTAL -gt 0 ]; then
        PERCENTAGE=$((PASSED * 100 / TOTAL))
        echo -e "${GREEN}✅ Test Passati: $PASSED/$TOTAL ($PERCENTAGE%)${NC}"
        echo -e "${RED}❌ Test Falliti: $FAILED/$TOTAL${NC}"
        
        if [ $PERCENTAGE -ge 70 ]; then
            echo -e "${GREEN}🎉 Quality Gate: PASSED (≥70%)${NC}"
        else
            echo -e "${YELLOW}⚠️ Quality Gate: WARNING (<70%)${NC}"
        fi
    fi
    
    echo ""
    echo -e "${BLUE}📁 Report completo: testsprite_tests/testsprite-mcp-test-report.md${NC}"
else
    echo -e "${YELLOW}⚠️ Report non generato${NC}"
fi

echo ""
echo -e "${BLUE}🎯 Test locale completato!${NC}"
echo -e "${YELLOW}💡 Per vedere il report completo:${NC}"
echo -e "   cat testsprite_tests/testsprite-mcp-test-report.md"
