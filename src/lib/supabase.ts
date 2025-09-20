import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  created_at: string
}

export interface Expense {
  id: string
  user_id: string
  category_id: string
  amount: number
  description: string
  notes: string | null
  date: string
  created_at: string
  category?: Category
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  amount: number
  period: 'weekly' | 'monthly'
  start_date: string
  end_date: string
  created_at: string
  category?: Category
}

export interface SavingsGoal {
  id: string
  user_id: string
  title: string
  target_amount: number
  current_amount: number
  target_date: string
  created_at: string
  updated_at: string
}