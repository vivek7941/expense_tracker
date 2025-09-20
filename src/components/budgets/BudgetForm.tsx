import React, { useState, useEffect } from 'react'
import { supabase, Category } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { X, Save } from 'lucide-react'

interface BudgetFormProps {
  onClose: () => void
  onSave: () => void
}

export function BudgetForm({ onClose, onSave }: BudgetFormProps) {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    period: 'monthly' as 'weekly' | 'monthly'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [user])

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user!.id)
      .order('name')
    
    setCategories(data || [])
    if (data && data.length > 0) {
      setFormData(prev => ({ ...prev, category_id: data[0].id }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const startDate = new Date()
      const endDate = new Date()
      
      if (formData.period === 'weekly') {
        endDate.setDate(startDate.getDate() + 7)
      } else {
        endDate.setMonth(startDate.getMonth() + 1)
      }

      const { error } = await supabase
        .from('budgets')
        .insert({
          user_id: user!.id,
          category_id: formData.category_id,
          amount: parseFloat(formData.amount),
          period: formData.period,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        })

      if (error) throw error
      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving budget:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Set Budget</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Period
            </label>
            <select
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value as 'weekly' | 'monthly' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center space-x-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Set Budget'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}