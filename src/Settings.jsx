import { useState, useEffect } from 'react'

function Settings({ settings, onSave, onClose }) {
  const [formData, setFormData] = useState({
    monthlyRent: 5000,
    monthlyUtilities: 800,
    equipmentValue: 30000,
    equipmentDepreciationMonths: 60,
    ptCommissionRate: 0.35,
    fixedStaffCost: 4000,
    monthlyMarketing: 1000,
    monthlyInsurance: 200
  })

  useEffect(() => {
    if (settings) {
      setFormData(settings)
    }
  }, [settings])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Business Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent ($)</label>
              <input type="number" name="monthlyRent" value={formData.monthlyRent} onChange={handleChange} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Utilities ($)</label>
              <input type="number" name="monthlyUtilities" value={formData.monthlyUtilities} onChange={handleChange} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Value ($)</label>
              <input type="number" name="equipmentValue" value={formData.equipmentValue} onChange={handleChange} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Depreciation (months)</label>
              <input type="number" name="equipmentDepreciationMonths" value={formData.equipmentDepreciationMonths} onChange={handleChange} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PT Commission Rate (%)</label>
              <input type="number" name="ptCommissionRate" value={formData.ptCommissionRate * 100} onChange={(e) => setFormData({...formData, ptCommissionRate: e.target.value / 100})} className="w-full p-2 border rounded-lg" step="1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fixed Staff Cost ($/month)</label>
              <input type="number" name="fixedStaffCost" value={formData.fixedStaffCost} onChange={handleChange} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Marketing ($)</label>
              <input type="number" name="monthlyMarketing" value={formData.monthlyMarketing} onChange={handleChange} className="w-full p-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Insurance ($)</label>
              <input type="number" name="monthlyInsurance" value={formData.monthlyInsurance} onChange={handleChange} className="w-full p-2 border rounded-lg" />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Settings