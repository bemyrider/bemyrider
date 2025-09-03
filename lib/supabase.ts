import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
)

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          role: 'rider' | 'merchant'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          role: 'rider' | 'merchant'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'rider' | 'merchant'
          created_at?: string
          updated_at?: string
        }
      }
      riders_details: {
        Row: {
          profile_id: string
          bio: string | null
          hourly_rate: number
          stripe_account_id: string | null
          stripe_onboarding_complete: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          profile_id: string
          bio?: string | null
          hourly_rate: number
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          profile_id?: string
          bio?: string | null
          hourly_rate?: number
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // availability table removed - replaced by disponibilita_riders
      bookings: {
        Row: {
          id: string
          rider_id: string
          merchant_id: string
          start_time: string
          end_time: string
          rider_amount: number
          platform_fee: number
          total_amount: number
          stripe_payment_intent_id: string
          status: 'confermata' | 'completata' | 'cancellata'
          created_at: string
        }
        Insert: {
          id?: string
          rider_id: string
          merchant_id: string
          start_time: string
          end_time: string
          rider_amount: number
          platform_fee: number
          total_amount: number
          stripe_payment_intent_id: string
          status?: 'confermata' | 'completata' | 'cancellata'
          created_at?: string
        }
        Update: {
          id?: string
          rider_id?: string
          merchant_id?: string
          start_time?: string
          end_time?: string
          rider_amount?: number
          platform_fee?: number
          total_amount?: number
          stripe_payment_intent_id?: string
          status?: 'confermata' | 'completata' | 'cancellata'
          created_at?: string
        }
      }
    }
  }
} 