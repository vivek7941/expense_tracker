import React, { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AuthForm } from './components/auth/AuthForm'
import { Header } from './components/layout/Header'
import { Navigation } from './components/layout/Navigation'
import { Dashboard } from './components/dashboard/Dashboard'
import { ExpensesList } from './components/expenses/ExpensesList'
import { BudgetsList } from './components/budgets/BudgetsList'
import { GoalsList } from './components/goals/GoalsList'

function AppContent() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'expenses':
        return <ExpensesList />
      case 'budgets':
        return <BudgetsList />
      case 'goals':
        return <GoalsList />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main>
        {renderActiveTab()}
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App