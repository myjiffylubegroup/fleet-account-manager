import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './components/Login'
import ResetPassword from './components/ResetPassword'
import Dashboard from './components/Dashboard'
import AccountList from './components/AccountList'
import AccountForm from './components/AccountForm'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [editingAccount, setEditingAccount] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showResetPassword, setShowResetPassword] = useState(false)

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      
      // Handle password recovery event
      if (event === 'PASSWORD_RECOVERY') {
        setShowResetPassword(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleEdit = (account) => {
    setEditingAccount(account)
  }

  const handleAdd = () => {
    setShowAddForm(true)
  }

  const handleFormClose = () => {
    setEditingAccount(null)
    setShowAddForm(false)
  }

  const handleFormSave = () => {
    setEditingAccount(null)
    setShowAddForm(false)
    setRefreshKey(k => k + 1) // Trigger refresh
  }

  const handleViewAlerts = () => {
    setActiveTab('accounts')
  }

  const handleResetPasswordComplete = () => {
    setShowResetPassword(false)
    // User is already logged in after password reset, so they'll see the dashboard
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  // Show Reset Password screen if user clicked reset link
  if (showResetPassword) {
    return <ResetPassword onComplete={handleResetPasswordComplete} />
  }

  if (!session) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-bold text-gray-800">🚛 Fleet Account Manager</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{session.user.email}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <nav className="flex gap-8 -mb-px">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-3 px-1 border-b-2 text-sm font-medium ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('accounts')}
              className={`py-3 px-1 border-b-2 text-sm font-medium ${
                activeTab === 'accounts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Accounts
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard onViewAlerts={handleViewAlerts} />
        )}
        {activeTab === 'accounts' && (
          <AccountList 
            key={refreshKey}
            onEdit={handleEdit} 
            onAdd={handleAdd}
          />
        )}
      </main>

      {/* Edit/Add Modal */}
      {(editingAccount || showAddForm) && (
        <AccountForm
          account={editingAccount}
          onClose={handleFormClose}
          onSave={handleFormSave}
        />
      )}
    </div>
  )
}
