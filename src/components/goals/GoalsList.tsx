import React, { useState, useEffect } from 'react'
import { supabase, SavingsGoal } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Plus, Target, Trash2, TrendingUp } from 'lucide-react'
import { GoalForm } from './GoalForm'
import { format, differenceInDays } from 'date-fns'

export function GoalsList() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (user) {
      loadGoals()
    }
  }, [user])

  const loadGoals = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user!.id)
        .order('target_date', { ascending: true })

      if (error) throw error
      setGoals(data || [])
    } catch (error) {
      console.error('Error loading goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this savings goal?')) return

    try {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', id)

      if (error) throw error
      setGoals(goals.filter(goal => goal.id !== id))
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  const updateProgress = async (id: string, newAmount: number) => {
    try {
      const { error } = await supabase
        .from('savings_goals')
        .update({ 
          current_amount: newAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
      
      setGoals(goals.map(goal => 
        goal.id === id 
          ? { ...goal, current_amount: newAmount }
          : goal
      ))
    } catch (error) {
      console.error('Error updating goal:', error)
    }
  }

  const getRecommendedSavings = (goal: SavingsGoal) => {
    const remaining = goal.target_amount - goal.current_amount
    const daysLeft = differenceInDays(new Date(goal.target_date), new Date())
    
    if (daysLeft <= 0) return { daily: 0, weekly: 0, monthly: 0 }
    
    const daily = remaining / daysLeft
    const weekly = daily * 7
    const monthly = daily * 30
    
    return {
      daily: Math.max(0, daily),
      weekly: Math.max(0, weekly),
      monthly: Math.max(0, monthly)
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
          <h2 className="text-2xl font-bold text-gray-900">Savings Goals</h2>
          <p className="text-gray-600">Track progress towards your financial goals</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Goal</span>
        </button>
      </div>

      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const progress = (goal.current_amount / goal.target_amount) * 100
            const daysLeft = differenceInDays(new Date(goal.target_date), new Date())
            const recommendations = getRecommendedSavings(goal)
            const isCompleted = progress >= 100

            return (
              <div key={goal.id} className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isCompleted ? 'bg-green-100' : 'bg-emerald-100'
                    }`}>
                      <Target className={`w-5 h-5 ${
                        isCompleted ? 'text-green-600' : 'text-emerald-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                      <p className="text-sm text-gray-600">
                        Due {format(new Date(goal.target_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-medium text-gray-900">
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          isCompleted ? 'bg-green-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>${goal.current_amount.toFixed(2)}</span>
                      <span>${goal.target_amount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Add amount"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement
                          const amount = parseFloat(input.value)
                          if (amount > 0) {
                            updateProgress(goal.id, goal.current_amount + amount)
                            input.value = ''
                          }
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = (e.target as HTMLButtonElement).parentElement?.querySelector('input') as HTMLInputElement
                        const amount = parseFloat(input.value)
                        if (amount > 0) {
                          updateProgress(goal.id, goal.current_amount + amount)
                          input.value = ''
                        }
                      }}
                      className="px-3 py-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {!isCompleted && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          {daysLeft > 0 ? 'Recommended Savings' : 'Goal Overdue'}
                        </span>
                      </div>
                      {daysLeft > 0 ? (
                        <div className="text-sm text-blue-800 space-y-1">
                          <div>Daily: ${recommendations.daily.toFixed(2)}</div>
                          <div>Weekly: ${recommendations.weekly.toFixed(2)}</div>
                          <div>Monthly: ${recommendations.monthly.toFixed(2)}</div>
                        </div>
                      ) : (
                        <div className="text-sm text-red-600">
                          This goal is {Math.abs(daysLeft)} days overdue
                        </div>
                      )}
                    </div>
                  )}

                  {isCompleted && (
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <div className="text-green-600 font-medium">🎉 Goal Completed!</div>
                      <div className="text-sm text-green-700 mt-1">
                        Congratulations on reaching your savings goal!
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No savings goals yet</h3>
          <p className="text-gray-600 mb-6">Set financial goals and track your progress towards achieving them</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Create Your First Goal
          </button>
        </div>
      )}

      {showForm && (
        <GoalForm
          onClose={() => setShowForm(false)}
          onSave={loadGoals}
        />
      )}
    </div>
  )
}