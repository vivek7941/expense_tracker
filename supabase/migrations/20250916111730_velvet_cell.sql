/*
  # Smart Budget Tracker Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `full_name` (text)
      - `avatar_url` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `categories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `color` (text)
      - `icon` (text)
      - `created_at` (timestamp)
    
    - `expenses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `category_id` (uuid, references categories)
      - `amount` (decimal)
      - `description` (text)
      - `notes` (text, optional)
      - `date` (date)
      - `created_at` (timestamp)
    
    - `budgets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `category_id` (uuid, references categories)
      - `amount` (decimal)
      - `period` (text: 'weekly', 'monthly')
      - `start_date` (date)
      - `end_date` (date)
      - `created_at` (timestamp)
    
    - `savings_goals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `target_amount` (decimal)
      - `current_amount` (decimal, default 0)
      - `target_date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text DEFAULT '#6B7280',
  icon text DEFAULT 'Tag',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10,2) NOT NULL,
  description text NOT NULL,
  notes text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own expenses"
  ON expenses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10,2) NOT NULL,
  period text DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly')),
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own budgets"
  ON budgets
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Savings goals table
CREATE TABLE IF NOT EXISTS savings_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  target_amount decimal(10,2) NOT NULL,
  current_amount decimal(10,2) DEFAULT 0,
  target_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own savings goals"
  ON savings_goals
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert default categories for new users
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO categories (user_id, name, color, icon) VALUES
    (NEW.id, 'Food & Dining', '#EF4444', 'Utensils'),
    (NEW.id, 'Transportation', '#3B82F6', 'Car'),
    (NEW.id, 'Shopping', '#8B5CF6', 'ShoppingBag'),
    (NEW.id, 'Entertainment', '#F59E0B', 'Film'),
    (NEW.id, 'Bills & Utilities', '#10B981', 'Receipt'),
    (NEW.id, 'Healthcare', '#EC4899', 'Heart'),
    (NEW.id, 'Education', '#6366F1', 'BookOpen'),
    (NEW.id, 'Other', '#6B7280', 'Tag');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER create_user_defaults
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_categories();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON budgets(user_id, start_date, end_date);