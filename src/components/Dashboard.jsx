import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard({ onViewAlerts }) {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    needsReview: 0,
    totalSales: 0,
  })
  const [recentAlerts, setRecentAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchAlerts()
  }, [])

  const fetchStats = async () => {
    const { data, error } = await supabase
      .from('sb_fleet_accounts')
      .select('is_active, needs_review, total_sales')

    if (!error && data) {
      setStats({
        total: data.length,
        active: data.filter(a => a.is_active).length,
        inactive: data.filter(a => !a.is_active).length,
        needsReview: data.filter(a => a.needs_review).length,
        totalSales: data.reduce((sum, a) => sum + (a.total_sales || 0), 0),
      })
    }
    setLoading(false)
  }

  const fetchAlerts = async () => {
    // Get accounts that need review or recently updated
    const { data, error } = await supabase
      .from('sb_fleet_accounts')
      .select('*')
      .eq('needs_review', true)
      .order('updated_at', { ascending: false })
      .limit(5)

    if (!error) {
      setRecentAlerts(data || [])
    }
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
  }

  const StatCard = ({ title, value, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm text-gray-600">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Dashboard</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard 
          title="Total Accounts" 
          value={stats.total} 
          color="text-gray-900" 
        />
        <StatCard 
          title="Active" 
          value={stats.active} 
          color="text-green-600" 
        />
        <StatCard 
          title="Inactive" 
          value={stats.inactive} 
          color="text-gray-500" 
        />
        <StatCard 
          title="Needs Review" 
          value={stats.needsReview} 
          color={stats.needsReview > 0 ? "text-yellow-600" : "text-gray-500"}
        />
        <StatCard 
          title="Total Sales" 
          value={formatCurrency(stats.totalSales)} 
          color="text-blue-600"
          subtitle="All time"
        />
      </div>

      {/* Alerts Section */}
      {recentAlerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-yellow-800">⚠️ Accounts Needing Review</h3>
            <button
              onClick={onViewAlerts}
              className="text-sm text-yellow-700 hover:text-yellow-900 underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-2">
            {recentAlerts.map(account => (
              <div key={account.id} className="flex justify-between items-center bg-white rounded p-3">
                <div>
                  <span className="font-mono text-sm text-gray-600">{account.business_account_id}</span>
                  <span className="mx-2">—</span>
                  <span className="text-gray-900">{account.company_name || 'Unknown Company'}</span>
                </div>
                <span className="text-sm text-gray-500">{account.city || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Help */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">📋 Quick Guide</h3>
        <ul className="text-sm text-blue-700 space-y-2">
          <li><strong>NEW accounts:</strong> Go to Accounts tab → Add Account → Enter details from POS</li>
          <li><strong>REACTIVATE:</strong> Find the account → Edit → Check "Active" checkbox</li>
          <li><strong>MARK INACTIVE:</strong> Find the account → Edit → Uncheck "Active" checkbox</li>
          <li><strong>Clear Review Flag:</strong> Edit account → Uncheck "Needs Review"</li>
        </ul>
      </div>
    </div>
  )
}
