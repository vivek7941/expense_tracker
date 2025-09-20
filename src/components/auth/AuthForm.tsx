import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Wallet, Eye, EyeOff, Loader, ArrowRight, Sparkles } from 'lucide-react'

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) throw error
      } else {
        const { error } = await signUp(email, password, fullName)
        if (error) throw error
      }
    } catch (err: any) {
      if (isLogin && err.message === 'Invalid login credentials') {
        setError('Incorrect email or password. Please try again or create an account.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-gradient-to-r from-purple-400 to-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* 3D Card Container */}
          <div className="relative group">
            {/* Card Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
            
            {/* Main Card */}
            <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 transform-gpu transition-all duration-500 hover:scale-105">
              {/* Header with 3D Logo */}
              <div className="text-center mb-8">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-2xl flex items-center justify-center transform-gpu transition-all duration-700 hover:rotate-12 hover:scale-110 shadow-2xl">
                    <Wallet className="w-10 h-10 text-white drop-shadow-lg" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  {/* Logo Reflection */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-20 h-10 bg-gradient-to-br from-emerald-400/30 to-blue-500/30 rounded-2xl blur-sm opacity-50 scale-y-[-1]"></div>
                </div>
                
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                  Smart Budget
                </h1>
                <p className="text-gray-300 text-lg">
                  Track expenses, achieve goals
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-gray-300 transition-all duration-300 hover:bg-white/20"
                        placeholder="Enter your full name"
                        required={!isLogin}
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                )}

                <div className="group">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-gray-300 transition-all duration-300 hover:bg-white/20"
                      placeholder="Enter your email"
                      required
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-gray-300 transition-all duration-300 hover:bg-white/20"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-xl animate-shake">
                    <p className="text-sm text-red-200">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-emerald-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl group"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Please wait...</span>
                    </>
                  ) : (
                    <>
                      <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </button>
              </form>

              {/* Toggle Form Type */}
              <div className="text-center mt-8">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-gray-300 hover:text-white font-medium transition-colors duration-200 relative group"
                >
                  {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 group-hover:w-full transition-all duration-300"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}