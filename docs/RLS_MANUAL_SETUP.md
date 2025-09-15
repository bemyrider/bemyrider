# 🔒 RLS (Row Level Security) - Setup Manuale

## 📋 Panoramica

Le **Row Level Security (RLS)** sono state configurate **manualmente** nel database Supabase per garantire la massima sicurezza e controllo.

## ✅ Stato Attuale

### Tabelle con RLS Attivo

- ✅ **profiles** - 4 policy (SELECT, INSERT, UPDATE, DELETE)
- ✅ **riders_details** - 4 policy (SELECT pubblico + privato, INSERT, UPDATE)
- ✅ **esercenti** - 4 policy (INSERT, SELECT, UPDATE, DELETE)
- ✅ **service_requests** - 6 policy (INSERT, SELECT, UPDATE, DELETE per merchant/rider)
- ✅ **merchant_favorites** - 3 policy (SELECT, INSERT, DELETE)
- ✅ **prenotazioni** - 4 policy (INSERT, SELECT, UPDATE, DELETE)
- ✅ **recensioni** - 2 policy (INSERT, SELECT)
- ✅ **disponibilita_riders** - 2 policy (ALL per proprietario, SELECT pubblico)
- ✅ **rider_tax_details** - 3 policy (INSERT, UPDATE, SELECT)
- ✅ **esercente_tax_details** - 1 policy (ALL per proprietario)
- ✅ **occasional_performance_receipts** - 1 policy (SELECT per parti coinvolte)

**Totale: 11 tabelle, 34 policy attive**

## 🛡️ Livelli di Sicurezza

### 1. Accesso Pubblico (Lettura)

- **Profili utente**: Visibili per ricerca
- **Dettagli rider**: Visibili per matching
- **Disponibilità**: Visibili per prenotazioni

### 2. Accesso Autenticato (Scrittura)

- **Propri profili**: Solo il proprietario può modificare
- **Dati personali**: Controllo basato su `auth.uid()`
- **Relazioni**: Accesso basato su relazioni utente

### 3. Accesso Basato su Ruolo

- **Merchant**: Accesso ai propri dati e richieste
- **Rider**: Accesso ai propri dati e prenotazioni
- **Cross-role**: Accesso limitato alle relazioni esistenti

## 🔧 Gestione Future Tabelle

### Quando Aggiungi una Nuova Tabella

1. **Abilita RLS**:

```sql
ALTER TABLE nuova_tabella ENABLE ROW LEVEL SECURITY;
```

2. **Crea Policy Appropriate**:

```sql
-- Esempio per tabella con proprietario
CREATE POLICY "Users can view own data" ON nuova_tabella
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own data" ON nuova_tabella
FOR UPDATE USING (auth.uid() = user_id);
```

3. **Verifica Sicurezza**:

```sql
-- Controlla che RLS sia attivo
SELECT rowsecurity FROM pg_tables WHERE tablename = 'nuova_tabella';

-- Controlla le policy
SELECT policyname FROM pg_policies WHERE tablename = 'nuova_tabella';
```

## 🚨 Importante

- **RLS è OBBLIGATORIO** per tutte le tabelle con dati sensibili
- **Testa sempre** le policy prima di andare in produzione
- **Documenta** le policy per il team
- **Non disabilitare mai** RLS senza motivo valido

## 📞 Supporto

Per problemi con RLS:

1. Controlla i log di Supabase
2. Verifica le policy con query SQL
3. Testa con utenti di test
4. Consulta la documentazione Supabase RLS

---

**Ultimo aggiornamento**: 12 Settembre 2025
**Versione**: 0.4.11
**Stato**: ✅ Attivo e Funzionante
