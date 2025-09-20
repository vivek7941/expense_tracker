import React, { useEffect, useState } from 'react'
import { supabase, Expense, Budget, SavingsGoal, Category } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { DollarSign, TrendingUp, Target, AlertTriangle } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function Dashboard() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user!.id)

      // Load recent expenses
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*, category:categories(*)')
        .eq('user_id', user!.id)
        .order('date', { ascending: false })
        .limit(10)

      // Load budgets
      const { data: budgetsData } = await supabase
        .from('budgets')
        .select('*, category:categories(*)')
        .eq('user_id', user!.id)

      // Load goals
      const { data: goalsData } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user!.id)

      setCategories(categoriesData || [])
      setExpenses(expensesData || [])
      setBudgets(budgetsData || [])
      setGoals(goalsData || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateMonthlySpending = () => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date)
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
      })
      .reduce((sum, expense) => sum + expense.amount, 0)
  }

  const getExpensesByCategory = () => {
    const categoryTotals = expenses.reduce((acc, expense) => {
      const categoryName = expense.category?.name || 'Other'
      const categoryColor = expense.category?.color || '#6B7280'
      
      if (!acc[categoryName]) {
        acc[categoryName] = { 
          name: categoryName, 
          value: 0,
          color: categoryColor
        }
      }
      acc[categoryName].value += expense.amount
      return acc
    }, {} as Record<string, { name: string; value: number; color: string }>)

    return Object.values(categoryTotals)
  }

  const getBudgetProgress = () => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    return budgets.map(budget => {
      const spent = expenses
        .filter(expense => {
          const expenseDate = new Date(expense.date)
          return expense.category_id === budget.category_id &&
                 expenseDate.getMonth() === currentMonth &&
                 expenseDate.getFullYear() === currentYear
        })
        .reduce((sum, expense) => sum + expense.amount, 0)
      
      const percentage = (spent / budget.amount) * 100
      
      return {
        category: budget.category?.name || 'Unknown',
        budget: budget.amount,
        spent,
        remaining: Math.max(0, budget.amount - spent),
        percentage: Math.min(100, percentage),
        isOverBudget: percentage > 100
      }
    })
  }

  const monthlySpending = calculateMonthlySpending()
  const expensesByCategory = getExpensesByCategory()
  const budgetProgress = getBudgetProgress()

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Overview of your financial health</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">${monthlySpending.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Budgets</p>
              <p className="text-2xl font-bold text-gray-900">{budgets.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Savings Goals</p>
              <p className="text-2xl font-bold text-gray-900">{goals.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Over Budget</p>
              <p className="text-2xl font-bold text-gray-900">
                {budgetProgress.filter(b => b.isOverBudget).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spending by Category */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
          {expensesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No expenses to display
            </div>
          )}
        </div>

        {/* Budget Progress */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Progress</h3>
          <div className="space-y-4">
            {budgetProgress.map((budget, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{budget.category}</span>
                  <span className={`text-sm font-medium ${
                    budget.isOverBudget ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    ${budget.spent.toFixed(2)} / ${budget.budget.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      budget.isOverBudget 
                        ? 'bg-red-500' 
                        : budget.percentage > 80 
                        ? 'bg-yellow-500' 
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, budget.percentage)}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {budgetProgress.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No budgets set up yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
        </div>
        <div className="p-6">
          {expenses.length > 0 ? (
            <div className="space-y-4">
              {expenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${expense.category?.color}20` }}
                    >
                      <span className="text-lg">💳</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{expense.description}</p>
                      <p className="text-sm text-gray-500">{expense.category?.name} • {new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${expense.amount.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No expenses recorded yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}