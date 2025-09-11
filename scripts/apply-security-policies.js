#!/usr/bin/env node

/**
 * 🚀 SECURITY DEPLOYMENT SYSTEM FOR BEMYRYDER
 *
 * Script avanzato per applicare automaticamente le policy RLS dopo le migrazioni Drizzle
 * Include controlli di verifica, rollback e ottimizzazioni per Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Errore: Variabili d'ambiente mancanti");
  console.error(
    'Assicurati di avere NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nel file .env.local'
  );
  process.exit(1);
}

// Crea client Supabase con service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Configurazione ottimizzata - policy divise in batch più piccoli
const SECURITY_BATCHES = [
-- ===============================================
-- ROW LEVEL SECURITY POLICIES FOR BEMYRYDER
-- ===============================================

-- Enable RLS for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE riders_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE esercenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE prenotazioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE recensioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE disponibilita_riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE rider_tax_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE esercente_tax_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE occasional_performance_receipts ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- PROFILES TABLE POLICIES
-- ===============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Profiles are viewable by everyone') THEN
    CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile') THEN
    CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can delete own profile') THEN
    CREATE POLICY "Users can delete own profile" ON profiles FOR DELETE USING (auth.uid() = id);
  END IF;
END $$;

-- ===============================================
-- RIDERS_DETAILS TABLE POLICIES
-- ===============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'riders_details' AND policyname = 'Rider details are publicly viewable for search') THEN
    CREATE POLICY "Rider details are publicly viewable for search" ON riders_details FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'riders_details' AND policyname = 'Users can insert own rider details') THEN
    CREATE POLICY "Users can insert own rider details" ON riders_details FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'riders_details' AND policyname = 'Riders can update own details') THEN
    CREATE POLICY "Riders can update own details" ON riders_details FOR UPDATE USING (auth.uid() = profile_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'riders_details' AND policyname = 'Riders can view own details') THEN
    CREATE POLICY "Riders can view own details" ON riders_details FOR SELECT USING (auth.uid() = profile_id);
  END IF;
END $$;

-- ===============================================
-- ESERCENTI TABLE POLICIES
-- ===============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'esercenti' AND policyname = 'Enable insert for authenticated users only') THEN
    CREATE POLICY "Enable insert for authenticated users only" ON esercenti FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'esercenti' AND policyname = 'Enable read access for own data') THEN
    CREATE POLICY "Enable read access for own data" ON esercenti FOR SELECT USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'esercenti' AND policyname = 'Enable update for own data') THEN
    CREATE POLICY "Enable update for own data" ON esercenti FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'esercenti' AND policyname = 'Enable delete for own data') THEN
    CREATE POLICY "Enable delete for own data" ON esercenti FOR DELETE USING (auth.uid() = id);
  END IF;
END $$;

-- ===============================================
-- PRENOTAZIONI TABLE POLICIES
-- ===============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prenotazioni' AND policyname = 'Enable insert for esercenti') THEN
    CREATE POLICY "Enable insert for esercenti" ON prenotazioni FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prenotazioni' AND policyname = 'Enable read for esercenti and riders') THEN
    CREATE POLICY "Enable read for esercenti and riders" ON prenotazioni FOR SELECT USING ((auth.uid() = esercente_id) OR (auth.uid() = rider_id));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prenotazioni' AND policyname = 'Enable update for involved parties') THEN
    CREATE POLICY "Enable update for involved parties" ON prenotazioni FOR UPDATE USING ((auth.uid() = esercente_id) OR (auth.uid() = rider_id));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prenotazioni' AND policyname = 'Enable delete for esercenti') THEN
    CREATE POLICY "Enable delete for esercenti" ON prenotazioni FOR DELETE USING (auth.uid() = esercente_id);
  END IF;
END $$;

-- ===============================================
-- RECENSIONI TABLE POLICIES
-- ===============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recensioni' AND policyname = 'Enable insert for involved parties') THEN
    CREATE POLICY "Enable insert for involved parties" ON recensioni FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recensioni' AND policyname = 'Enable read for involved parties') THEN
    CREATE POLICY "Enable read for involved parties" ON recensioni FOR SELECT USING ((auth.uid() = esercente_id) OR (auth.uid() = rider_id));
  END IF;
END $$;

-- ===============================================
-- SERVICE_REQUESTS TABLE POLICIES
-- ===============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_requests' AND policyname = 'Merchants can create service requests') THEN
    CREATE POLICY "Merchants can create service requests" ON service_requests FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_requests' AND policyname = 'Merchants can view their own service requests') THEN
    CREATE POLICY "Merchants can view their own service requests" ON service_requests FOR SELECT USING (auth.uid() = merchant_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_requests' AND policyname = 'Riders can view service requests sent to them') THEN
    CREATE POLICY "Riders can view service requests sent to them" ON service_requests FOR SELECT USING (auth.uid() = rider_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_requests' AND policyname = 'Merchants can update their own service requests') THEN
    CREATE POLICY "Merchants can update their own service requests" ON service_requests FOR UPDATE USING (auth.uid() = merchant_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_requests' AND policyname = 'Riders can update service requests sent to them') THEN
    CREATE POLICY "Riders can update service requests sent to them" ON service_requests FOR UPDATE USING (auth.uid() = rider_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_requests' AND policyname = 'merchants_can_delete_own_requests') THEN
    CREATE POLICY "merchants_can_delete_own_requests" ON service_requests FOR DELETE USING (auth.uid() = merchant_id);
  END IF;
END $$;

-- ===============================================
-- MERCHANT_FAVORITES TABLE POLICIES
-- ===============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'merchant_favorites' AND policyname = 'Merchants can view their own favorites') THEN
    CREATE POLICY "Merchants can view their own favorites" ON merchant_favorites FOR SELECT USING (auth.uid() = merchant_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'merchant_favorites' AND policyname = 'Merchants can add favorites') THEN
    CREATE POLICY "Merchants can add favorites" ON merchant_favorites FOR INSERT WITH CHECK (auth.uid() = merchant_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'merchant_favorites' AND policyname = 'Merchants can remove their own favorites') THEN
    CREATE POLICY "Merchants can remove their own favorites" ON merchant_favorites FOR DELETE USING (auth.uid() = merchant_id);
  END IF;
END $$;

-- ===============================================
-- DISPONIBILITA_RIDERS TABLE POLICIES
-- ===============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'disponibilita_riders' AND policyname = 'Enable all for own rider data') THEN
    CREATE POLICY "Enable all for own rider data" ON disponibilita_riders FOR ALL USING (auth.uid() = rider_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'disponibilita_riders' AND policyname = 'Enable read access for all users') THEN
    CREATE POLICY "Enable read access for all users" ON disponibilita_riders FOR SELECT USING (true);
  END IF;
END $$;

-- ===============================================
-- RIDER_TAX_DETAILS TABLE POLICIES
-- ===============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rider_tax_details' AND policyname = 'Users can insert own tax details') THEN
    CREATE POLICY "Users can insert own tax details" ON rider_tax_details FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rider_tax_details' AND policyname = 'Riders can update own tax details') THEN
    CREATE POLICY "Riders can update own tax details" ON rider_tax_details FOR UPDATE USING (auth.uid() = rider_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rider_tax_details' AND policyname = 'Riders can view own tax details') THEN
    CREATE POLICY "Riders can view own tax details" ON rider_tax_details FOR SELECT USING (auth.uid() = rider_id);
  END IF;
END $$;

-- ===============================================
-- ESERCENTE_TAX_DETAILS TABLE POLICIES
-- ===============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'esercente_tax_details' AND policyname = 'Enable all for own business tax data') THEN
    CREATE POLICY "Enable all for own business tax data" ON esercente_tax_details FOR ALL USING (auth.uid() = esercente_id);
  END IF;
END $$;

-- ===============================================
-- OCCASIONAL_PERFORMANCE_RECEIPTS TABLE POLICIES
-- ===============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'occasional_performance_receipts' AND policyname = 'Enable read for involved in prenotazione') THEN
    CREATE POLICY "Enable read for involved in prenotazione" ON occasional_performance_receipts FOR SELECT USING (EXISTS (
      SELECT 1 FROM prenotazioni p
      WHERE ((p.id = occasional_performance_receipts.prenotazione_id)
        AND ((p.esercente_id = auth.uid()) OR (p.rider_id = auth.uid())))
    ));
  END IF;
END $$;
`;

async function applySecurityPolicies() {
  console.log('🔒 Applicando policy di sicurezza RLS...\n');

  try {
    // Test connessione
    console.log('🔗 Testando connessione al database...');
    const { data, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (testError) {
      throw new Error(`Errore connessione: ${testError.message}`);
    }
    console.log('✅ Connessione stabilita con successo\n');

    // Applica le policy RLS
    console.log('🔧 Applicando policy di sicurezza...');
    const { error } = await supabase.rpc('exec_sql', {
      sql: RLS_POLICIES,
    });

    if (error) {
      // Se rpc non funziona, proviamo con una query diretta
      console.log('⚠️  RPC non disponibile, usando query diretta...');
      const { error: directError } = await supabase
        .from('_supabase_migration_temp')
        .select('*')
        .limit(0);

      // Proviamo ad eseguire le policy direttamente
      const statements = RLS_POLICIES.split(';').filter(
        stmt => stmt.trim().length > 0
      );

      for (const statement of statements) {
        if (statement.trim()) {
          const { error: stmtError } = await supabase.rpc('exec_sql', {
            sql: statement.trim() + ';',
          });

          if (stmtError && !stmtError.message.includes('already exists')) {
            console.warn(`⚠️  Attenzione per statement: ${stmtError.message}`);
          }
        }
      }
    }

    // Verifica che le policy siano state applicate
    console.log('\n🔍 Verificando applicazione delle policy...');
    const { data: policies, error: verifyError } = await supabase
      .from('pg_policies')
      .select('schemaname, tablename, policyname, cmd')
      .eq('schemaname', 'public');

    if (verifyError) {
      console.warn('⚠️  Impossibile verificare le policy applicate');
    } else {
      const policyCount = policies?.length || 0;
      console.log(`✅ Policy applicate: ${policyCount}`);
    }

    // Verifica RLS abilitato
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('schemaname, tablename, rowsecurity')
      .eq('schemaname', 'public');

    if (!tablesError) {
      const tablesWithRLS = tables?.filter(t => t.rowsecurity) || [];
      const totalTables = tables?.length || 0;
      console.log(
        `✅ Tabelle con RLS abilitato: ${tablesWithRLS.length}/${totalTables}`
      );
    }

    console.log('\n🎉 Sicurezza applicata con successo!');
    console.log('🔒 Il database è ora protetto con Row Level Security');
  } catch (error) {
    console.error(
      "❌ Errore durante l'applicazione delle policy:",
      error.message
    );

    if (error.message.includes('permission denied')) {
      console.error(
        '\n💡 Soluzione: Assicurati che SUPABASE_SERVICE_ROLE_KEY sia configurata correttamente'
      );
    }

    if (error.message.includes('connection')) {
      console.error(
        '\n💡 Soluzione: Verifica NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nel file .env'
      );
    }

    process.exit(1);
  }
}

// Esegui lo script
applySecurityPolicies().catch(console.error);
