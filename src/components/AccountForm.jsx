import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function AccountForm({ account, onClose, onSave }) {
  const isEditing = !!account?.id
  
  const [formData, setFormData] = useState({
    business_account_id: '',
    company_name: '',
    contact_name: '',
    contact_phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    is_active: true,
    account_type: 'LOCAL',
    needs_review: false,
    review_notes: '',
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (account) {
      setFormData({
        business_account_id: account.business_account_id || '',
        company_name: account.company_name || '',
        contact_name: account.contact_name || '',
        contact_phone: account.contact_phone || '',
        address: account.address || '',
        city: account.city || '',
        state: account.state || '',
        zip_code: account.zip_code || '',
        is_active: account.is_active ?? true,
        account_type: account.account_type || 'LOCAL',
        needs_review: account.needs_review ?? false,
        review_notes: account.review_notes || '',
      })
    }
  }, [account])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const dataToSave = {
        ...formData,
        updated_at: new Date().toISOString(),
      }

      if (isEditing) {
        // Update existing
        const { error } = await supabase
          .from('sb_fleet_accounts')
          .update(dataToSave)
          .eq('id', account.id)

        if (error) throw error
      } else {
        // Insert new
        dataToSave.source = 'Manual Entry'
        const { error } = await supabase
          .from('sb_fleet_accounts')
          .insert([dataToSave])

        if (error) throw error
      }

      setSuccess(true)
      setTimeout(() => {
        onSave()
      }, 1000)

    } catch (err) {
      setError(err.message)
    }
    
    setLoading(false)
  }

  const handleQuickStatus = async (newStatus) => {
    if (!isEditing) return
    
    setLoading(true)
    const { error } = await supabase
      .from('sb_fleet_accounts')
      .update({ 
        is_active: newStatus,
        needs_review: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', account.id)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => onSave(), 1000)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditing ? 'Edit Account' : 'Add New Account'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quick Actions for Editing */}
        {isEditing && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Quick Actions:</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleQuickStatus(true)}
                disabled={loading}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
              >
                ✓ Mark Active
              </button>
              <button
                onClick={() => handleQuickStatus(false)}
                disabled={loading}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
              >
                ✗ Mark Inactive
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              Account saved successfully!
            </div>
          )}

          {/* Account ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Account ID *
            </label>
            <input
              type="text"
              name="business_account_id"
              value={formData.business_account_id}
              onChange={handleChange}
              disabled={isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="e.g., 134588 or FS127217"
              required
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Enterprise Rent-A-Car"
              required
            />
          </div>

          {/* Contact Info Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name
              </label>
              <input
                type="text"
                name="contact_name"
                value={formData.contact_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="8055551234"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* City, State, Zip Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CA"
                maxLength={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Type
            </label>
            <select
              name="account_type"
              value={formData.account_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="LOCAL">Local Fleet</option>
              <option value="CASH_FLEET">Cash Fleet</option>
              <option value="NATIONAL_AIN">National (Auto Integrate)</option>
            </select>
          </div>

          {/* Status Checkboxes */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="needs_review"
                checked={formData.needs_review}
                onChange={handleChange}
                className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
              />
              <span className="text-sm text-gray-700">Needs Review</span>
            </label>
          </div>

          {/* Review Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="review_notes"
              value={formData.review_notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any notes about this account..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Account')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
