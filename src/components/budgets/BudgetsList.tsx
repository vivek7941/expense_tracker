import React, { useState, useEffect } from 'react'
import { supabase, Budget } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Plus, Trash2, TrendingUp, AlertTriangle } from 'lucide-react'
import { BudgetForm } from './BudgetForm'

export function BudgetsList() {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (user) {
      loadBudgets()
      loadExpenses()
    }
  }, [user])

  const loadBudgets = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBudgets(data || [])
    } catch (error) {
      console.error('Error loading budgets:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadExpenses = async () => {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user!.id)
    
    setExpenses(data || [])
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return

    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)

      if (error) throw error
      setBudgets(budgets.filter(budget => budget.id !== id))
    } catch (error) {
      console.error('Error deleting budget:', error)
    }
  }

  const getBudgetProgress = (budget: Budget) => {
    const now = new Date()
    const startDate = new Date(budget.start_date)
    const endDate = new Date(budget.end_date)

    const spent = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date)
        return expense.category_id === budget.category_id &&
               expenseDate >= startDate &&
               expenseDate <= endDate
      })
      .reduce((sum, expense) => sum + expense.amount, 0)

    const percentage = (spent / budget.amount) * 100
    const isOverBudget = percentage > 100
    const remaining = Math.max(0, budget.amount - spent)

    return {
      spent,
      remaining,
      percentage: Math.min(100, percentage),
      isOverBudget
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Budgets</h2>
          <p className="text-gray-600">Manage your spending limits</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Set Budget</span>
        </button>
      </div>

      {budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const progress = getBudgetProgress(budget)
            return (
              <div key={budget.id} className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${budget.category?.color}20` }}
                    >
                      {progress.isOverBudget ? (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      ) : (
                        <TrendingUp className="w-5 h-5" style={{ color: budget.category?.color }} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{budget.category?.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{budget.period}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Spent</span>
                    <span className={`font-semibold ${
                      progress.isOverBudget ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      ${progress.spent.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Budget</span>
                    <span className="font-semibold text-gray-900">
                      ${budget.amount.toFixed(2)}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        progress.isOverBudget 
                          ? 'bg-red-500' 
                          : progress.percentage > 80 
                          ? 'bg-yellow-500' 
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, progress.percentage)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className={progress.isOverBudget ? 'text-red-600' : 'text-gray-600'}>
                      {progress.isOverBudget ? 'Over budget' : 'Remaining'}
                    </span>
                    <span className={`font-medium ${
                      progress.isOverBudget ? 'text-red-600' : 'text-emerald-600'
                    }`}>
                      ${progress.remaining.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500">
                    {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets set</h3>
          <p className="text-gray-600 mb-6">Start managing your spending by setting up budgets for different categories</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Set Your First Budget
          </button>
        </div>
      )}

      {showForm && (
        <BudgetForm
          onClose={() => setShowForm(false)}
          onSave={loadBudgets}
        />
      )}
    </div>
  )
}