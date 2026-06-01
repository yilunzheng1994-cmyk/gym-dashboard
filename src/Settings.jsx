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
    const { name, value } = e.target
    if (name === 'ptCommissionRate') {
      setFormData({ ...formData, [name]: parseFloat(value) / 100 })
    } else {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Business Settings</h2>
          <button onClick={onClose} style={{ fontSize: '24px', cursor: 'pointer' }}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Monthly Rent ($)</label>
              <input type="number" name="monthlyRent" value={formData.monthlyRent} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Monthly Utilities ($)</label>
              <input type="number" name="monthlyUtilities" value={formData.monthlyUtilities} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Equipment Value ($)</label>
              <input type="number" name="equipmentValue" value={formData.equipmentValue} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Depreciation (months)</label>
              <input type="number" name="equipmentDepreciationMonths" value={formData.equipmentDepreciationMonths} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>PT Commission Rate (%)</label>
              <input type="number" name="ptCommissionRate" value={formData.ptCommissionRate * 100} onChange={handleChange} step="1" style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Fixed Staff Cost ($/month)</label>
              <input type="number" name="fixedStaffCost" value={formData.fixedStaffCost} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Monthly Marketing ($)</label>
              <input type="number" name="monthlyMarketing" value={formData.monthlyMarketing} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Monthly Insurance ($)</label>
              <input type="number" name="monthlyInsurance" value={formData.monthlyInsurance} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '8px' }} />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '8px', background: 'white', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Settings