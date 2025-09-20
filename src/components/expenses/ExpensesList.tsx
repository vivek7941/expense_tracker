import React, { useState, useEffect } from 'react'
import { supabase, Expense } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Plus, Search, Filter, Trash2 } from 'lucide-react'
import { ExpenseForm } from './ExpenseForm'

export function ExpensesList() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      loadExpenses()
      loadCategories()
    }
  }, [user])

  const loadExpenses = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('user_id', user!.id)
        .order('date', { ascending: false })

      if (error) throw error
      setExpenses(data || [])
    } catch (error) {
      console.error('Error loading expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user!.id)
      .order('name')
    
    setCategories(data || [])
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)

      if (error) throw error
      setExpenses(expenses.filter(expense => expense.id !== id))
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || expense.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">Expenses</h2>
          <p className="text-gray-600">Track and manage your spending</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end">
            <span className="text-sm text-gray-600">
              Total: <span className="font-semibold text-gray-900">${totalAmount.toFixed(2)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-xl shadow-sm border">
        {filteredExpenses.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredExpenses.map((expense) => (
              <div key={expense.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${expense.category?.color}20` }}
                    >
                      <span className="text-xl">💳</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{expense.description}</h3>
                      <p className="text-sm text-gray-600">
                        {expense.category?.name} • {new Date(expense.date).toLocaleDateString()}
                      </p>
                      {expense.notes && (
                        <p className="text-sm text-gray-500 mt-1">{expense.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">${expense.amount.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory ? 'Try adjusting your filters' : 'Add your first expense to get started'}
            </p>
          </div>
        )}
      </div>

      {showForm && (
        <ExpenseForm
          onClose={() => setShowForm(false)}
          onSave={loadExpenses}
        />
      )}
    </div>
  )
}