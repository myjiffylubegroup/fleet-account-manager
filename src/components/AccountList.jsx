import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function AccountList({ onEdit, onAdd }) {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all, active, inactive, needs_review

  useEffect(() => {
    fetchAccounts()
  }, [filter])

  const fetchAccounts = async () => {
    setLoading(true)
    let query = supabase
      .from('sb_fleet_accounts')
      .select('*')
      .order('total_sales', { ascending: false })

    if (filter === 'active') {
      query = query.eq('is_active', true)
    } else if (filter === 'inactive') {
      query = query.eq('is_active', false)
    } else if (filter === 'needs_review') {
      query = query.eq('needs_review', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching accounts:', error)
    } else {
      setAccounts(data || [])
    }
    setLoading(false)
  }

  const filteredAccounts = accounts.filter(account => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      account.business_account_id?.toLowerCase().includes(searchLower) ||
      account.company_name?.toLowerCase().includes(searchLower) ||
      account.city?.toLowerCase().includes(searchLower)
    )
  })

  const formatCurrency = (val) => {
    if (!val) return '$0.00'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
  }

  const getStatusBadge = (account) => {
    if (account.needs_review) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Needs Review</span>
    }
    if (account.is_active) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>
    }
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Inactive</span>
  }

  const getTypeBadge = (type) => {
    const colors = {
      'NATIONAL_AIN': 'bg-purple-100 text-purple-800',
      'CASH_FLEET': 'bg-blue-100 text-blue-800',
      'LOCAL': 'bg-gray-100 text-gray-800',
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
        {type || 'Unknown'}
      </span>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Fleet Accounts</h2>
          <p className="text-gray-600">{filteredAccounts.length} accounts</p>
        </div>
        <button
          onClick={onAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span> Add Account
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by ID, company, or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Accounts</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
          <option value="needs_review">Needs Review</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Invoice</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{account.business_account_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{account.company_name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{account.city || '—'}</td>
                    <td className="px-4 py-3 text-sm">{getTypeBadge(account.account_type)}</td>
                    <td className="px-4 py-3 text-sm">{getStatusBadge(account)}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(account.total_sales)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{account.last_invoice_date || '—'}</td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => onEdit(account)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
