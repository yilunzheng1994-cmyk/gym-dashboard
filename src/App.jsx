import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import Settings from './Settings'

function App() {
  // Business settings
  const [showSettings, setShowSettings] = useState(false)
  const [businessSettings, setBusinessSettings] = useState(() => {
    const saved = localStorage.getItem('business_settings')
    return saved ? JSON.parse(saved) : null
  })

  // Form data - extended with new fields
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    cashBalanceStart: '',
    memberCount: '',
    classHours: '',
    ptHours: '',
    ptRate: '50',
    otherRevenue: '',
    variableStaffCost: '',
    marketingSpend: '',
    newMembers: '',
    newRevenue: '',
    retailRevenue: ''
  })

  // Entries history
  const [entries, setEntries] = useState([])

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('gym_dashboard_entries')
    if (saved) {
      setEntries(JSON.parse(saved))
    }
  }, [])

  // Save to localStorage
  const saveToLocalStorage = (newEntries) => {
    localStorage.setItem('gym_dashboard_entries', JSON.stringify(newEntries))
    setEntries(newEntries)
  }

  // Save business settings
  const saveBusinessSettings = (settings) => {
    localStorage.setItem('business_settings', JSON.stringify(settings))
    setBusinessSettings(settings)
    setShowSettings(false)
  }

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault()
    
    const newEntry = {
      id: Date.now(),
      date: formData.date,
      cashBalanceStart: Number(formData.cashBalanceStart) || 0,
      memberCount: Number(formData.memberCount) || 0,
      classHours: Number(formData.classHours) || 0,
      ptHours: Number(formData.ptHours) || 0,
      ptRate: Number(formData.ptRate) || 50,
      otherRevenue: Number(formData.otherRevenue) || 0,
      variableStaffCost: Number(formData.variableStaffCost) || 0,
      marketingSpend: Number(formData.marketingSpend) || 0,
      newMembers: Number(formData.newMembers) || 0,
      newRevenue: Number(formData.newRevenue) || 0,
      retailRevenue: Number(formData.retailRevenue) || 0
    }
    
    const newEntries = [newEntry, ...entries].slice(0, 30)
    saveToLocalStorage(newEntries)
    
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      cashBalanceStart: '',
      memberCount: '',
      classHours: '',
      ptHours: '',
      ptRate: '50',
      otherRevenue: '',
      variableStaffCost: '',
      marketingSpend: '',
      newMembers: '',
      newRevenue: '',
      retailRevenue: ''
    })
  }

  // Delete entry
  const deleteEntry = (id) => {
    const newEntries = entries.filter(entry => entry.id !== id)
    saveToLocalStorage(newEntries)
  }

  // Get latest entry by date
  const getLatestEntry = () => {
    if (entries.length === 0) return null
    return [...entries].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
  }

  const latestEntry = getLatestEntry()
  
  // Calculate daily fixed costs from business settings
  const getDailyFixedCosts = () => {
    if (!businessSettings) {
      return { dailyFixedCost: 0, dailyDepreciation: 0 }
    }
    
    const monthlyDepreciation = businessSettings.equipmentValue / businessSettings.equipmentDepreciationMonths
    const dailyDepreciation = monthlyDepreciation / 30
    
    const monthlyFixedTotal = (businessSettings.monthlyRent || 0) + 
                              (businessSettings.monthlyUtilities || 0) + 
                              (businessSettings.fixedStaffCost || 0) +
                              (businessSettings.monthlyInsurance || 0) +
                              (businessSettings.monthlyMarketing || 0)
    const dailyFixedCost = monthlyFixedTotal / 30
    
    return { dailyFixedCost, dailyDepreciation }
  }
  
  // Calculate cumulative unearned liability
  const calculateUnearnedLiability = () => {
    let totalNewRevenue = 0
    let totalConsumed = 0
    
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date))
    
    for (const entry of sortedEntries) {
      totalNewRevenue += entry.newRevenue
      totalConsumed += (entry.ptHours || 0) * 50
    }
    
    return totalNewRevenue - totalConsumed
  }
  
  // Calculate metrics for latest entry
  let metrics = {
    totalRevenue: 0,
    totalCosts: 0,
    netProfit: 0,
    cashFlowIn: 0,
    cashFlowOut: 0,
    cashEnd: 0,
    unearnedLiability: 0,
    availableCash: 0,
    revenueBreakdown: { newRevenue: 0, ptRevenue: 0, retailRevenue: 0, otherRevenue: 0 },
    costBreakdown: { fixedCosts: 0, variableStaff: 0, marketing: 0, ptCommission: 0, depreciation: 0 }
  }
  
  if (latestEntry) {
    const ptRevenue = (latestEntry.ptHours || 0) * (latestEntry.ptRate || 50)
    const totalRevenue = latestEntry.newRevenue + latestEntry.retailRevenue + ptRevenue + latestEntry.otherRevenue
    
    const { dailyFixedCost, dailyDepreciation } = getDailyFixedCosts()
    const ptCommission = ptRevenue * (businessSettings?.ptCommissionRate || 0.35)
    
    const totalCosts = dailyFixedCost + dailyDepreciation + 
                       (latestEntry.variableStaffCost || 0) + 
                       (latestEntry.marketingSpend || 0) + 
                       ptCommission
    
    const netProfit = totalRevenue - totalCosts
    
    // Cash flow
    const cashFlowIn = latestEntry.newRevenue + latestEntry.retailRevenue + latestEntry.otherRevenue
    const cashFlowOut = (latestEntry.variableStaffCost || 0) + (latestEntry.marketingSpend || 0) + ptCommission
    const cashEnd = (latestEntry.cashBalanceStart || 0) + cashFlowIn - cashFlowOut
    
    const unearnedLiability = calculateUnearnedLiability()
    
    metrics = {
      totalRevenue,
      totalCosts,
      netProfit,
      cashFlowIn,
      cashFlowOut,
      cashEnd,
      unearnedLiability,
      availableCash: Math.max(0, cashEnd - unearnedLiability),
      revenueBreakdown: {
        newRevenue: latestEntry.newRevenue,
        ptRevenue: ptRevenue,
        retailRevenue: latestEntry.retailRevenue,
        otherRevenue: latestEntry.otherRevenue
      },
      costBreakdown: {
        fixedCosts: dailyFixedCost,
        variableStaff: latestEntry.variableStaffCost || 0,
        marketing: latestEntry.marketingSpend || 0,
        ptCommission: ptCommission,
        depreciation: dailyDepreciation
      }
    }
  }

  // Prepare chart data
  const chartData = [...entries]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-7)
    .map(entry => {
      const ptRevenue = (entry.ptHours || 0) * (entry.ptRate || 50)
      const totalRevenue = entry.newRevenue + entry.retailRevenue + ptRevenue + entry.otherRevenue
      const { dailyFixedCost, dailyDepreciation } = getDailyFixedCosts()
      const ptCommission = ptRevenue * (businessSettings?.ptCommissionRate || 0.35)
      const totalCosts = dailyFixedCost + dailyDepreciation + (entry.variableStaffCost || 0) + (entry.marketingSpend || 0) + ptCommission
      const netProfit = totalRevenue - totalCosts
      
      return {
        date: entry.date,
        revenue: totalRevenue,
        profit: netProfit,
        cashBalance: entry.cashBalanceStart,
        newMembers: entry.newMembers,
        ptHours: entry.ptHours
      }
    })

  return (
    <div className="min-h-screen bg-gray-100 p-3 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Settings button */}
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h1 className="text-xl md:text-3xl font-bold text-gray-800">
            Fitness Financial Dashboard
          </h1>
          <button 
            onClick={() => setShowSettings(true)} 
            className="text-gray-500 hover:text-gray-700 text-sm md:text-base bg-white px-3 py-1 rounded-lg shadow"
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Settings warning if not configured */}
        {!businessSettings && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4 rounded">
            <p className="text-yellow-700 text-sm">
              ⚠️ Please click Settings to configure your business costs (rent, staff, etc.)
            </p>
          </div>
        )}

        {/* Profit & Loss Section - Row 1 */}
        {latestEntry && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Revenue Card */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-gray-500 text-sm mb-2">Total Revenue</div>
              <div className="text-2xl font-bold text-green-600">
                ${metrics.totalRevenue.toLocaleString()}
              </div>
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>New Members:</span>
                  <span className="font-medium">${metrics.revenueBreakdown.newRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>PT Revenue:</span>
                  <span className="font-medium">${metrics.revenueBreakdown.ptRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Retail:</span>
                  <span className="font-medium">${metrics.revenueBreakdown.retailRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Other:</span>
                  <span className="font-medium">${metrics.revenueBreakdown.otherRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Costs Card */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-gray-500 text-sm mb-2">Total Costs</div>
              <div className="text-2xl font-bold text-red-600">
                ${metrics.totalCosts.toLocaleString()}
              </div>
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Fixed Costs:</span>
                  <span className="font-medium">${metrics.costBreakdown.fixedCosts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Variable Staff:</span>
                  <span className="font-medium">${metrics.costBreakdown.variableStaff.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Marketing:</span>
                  <span className="font-medium">${metrics.costBreakdown.marketing.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>PT Commission:</span>
                  <span className="font-medium">${metrics.costBreakdown.ptCommission.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Depreciation:</span>
                  <span className="font-medium">${metrics.costBreakdown.depreciation.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Net Profit Card */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-gray-500 text-sm mb-2">Net Profit</div>
              <div className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${metrics.netProfit.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Margin: {metrics.totalRevenue > 0 ? ((metrics.netProfit / metrics.totalRevenue) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
        )}

        {/* Cash Flow Section - Row 2 */}
        {latestEntry && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="text-md font-semibold text-gray-700 mb-3">Cash Flow</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
              <div>
                <div className="text-xs text-gray-500">Start Cash</div>
                <div className="text-sm font-bold">${(latestEntry.cashBalanceStart || 0).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Cash In</div>
                <div className="text-sm font-bold text-green-600">+${metrics.cashFlowIn.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Cash Out</div>
                <div className="text-sm font-bold text-red-600">-${metrics.cashFlowOut.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">End Cash</div>
                <div className="text-sm font-bold">${metrics.cashEnd.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Unearned</div>
                <div className="text-sm font-bold text-orange-600">${metrics.unearnedLiability.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Available</div>
                <div className="text-sm font-bold text-blue-600">${metrics.availableCash.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Revenue & Profit Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue" strokeWidth={2} />
                  <Line type="monotone" dataKey="profit" stroke="#3b82f6" name="Profit" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">New Members & PT Hours</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar yAxisId="left" dataKey="newMembers" fill="#f59e0b" name="New Members" />
                  <Bar yAxisId="right" dataKey="ptHours" fill="#ec489a" name="PT Hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {chartData.length === 0 && (
          <div className="bg-white rounded-lg shadow p-4 mb-6 text-center text-gray-500 text-sm">
            <p>Add your first data entry to see charts and insights</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-3 md:p-6 mb-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Daily Data Entry</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm text-gray-600 mb-1">Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full p-2 text-sm md:text-base border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-gray-600 mb-1">Start Cash ($)</label>
                <input type="number" name="cashBalanceStart" value={formData.cashBalanceStart} onChange={handleChange} placeholder="0" className="w-full p-2 text-sm md:text-base border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-gray-600 mb-1">Member Count</label>
                <input type="number" name="memberCount" value={formData.memberCount} onChange={handleChange} placeholder="0" className="w-full p-2 text-sm md:text-base border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-gray-600 mb-1">Class Hours</label>
                <input type="number" name="classHours" value={formData.classHours} onChange={handleChange} placeholder="0" className="w-full p-2 text-sm md:text-base border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-gray-600 mb-1">PT Hours</label>
                <input type="number" name="ptHours" value={formData.ptHours} onChange={handleChange} placeholder="0" className="w-full p-2 text-sm md:text-base border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-gray-600 mb-1">PT Rate ($/hr)</label>
                <input type="number" name="ptRate" value={formData.ptRate} onChange={handleChange} placeholder="50" className="w-full p-2 text-sm md:text-base border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-gray-600 mb-1">Other Revenue ($)</label>
                <input type="number" name="otherRevenue" value={formData.otherRevenue} onChange={handleChange} placeholder="0" className="w-full p-2 text-sm md:text-base border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-gray-600 mb-1">Variable Staff Cost ($)</label>
                <input type="number" name="variableStaffCost" value={formData.variableStaffCost} onChange={handleChange} placeholder="0" className="w-full p-2 text-sm md:text-base border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-gray-600 mb-1">Marketing Spend ($)</label>
                <input type="number" name="marketingSpend" value={formData.marketingSpend} onChange={handleChange} placeholder="0" className="w-full p-2 text-sm md:text-base border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-gray-600 mb-1">New Members</label>
                <input type="number" name="newMembers" value={formData.newMembers} onChange={handleChange} placeholder="0" className="w-full p-2 text-sm md:text-base border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-gray-600 mb-1">New Revenue ($)</label>
                <input type="number" name="newRevenue" value={formData.newRevenue} onChange={handleChange} placeholder="0" className="w-full p-2 text-sm md:text-base border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-gray-600 mb-1">Retail Revenue ($)</label>
                <input type="number" name="retailRevenue" value={formData.retailRevenue} onChange={handleChange} placeholder="0" className="w-full p-2 text-sm md:text-base border rounded-lg" />
              </div>
            </div>
            <button type="submit" className="mt-3 md:mt-4 bg-blue-500 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-blue-600 transition text-sm md:text-base w-full md:w-auto">
              Save Data
            </button>
          </form>
        </div>

        {/* History */}
        {entries.length > 0 && (
          <div className="bg-white rounded-lg shadow p-3 md:p-6">
            <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Recent Records</h2>
            
            {/* Mobile: Card View */}
            <div className="block md:hidden space-y-3">
              {[...entries].sort((a, b) => new Date(b.date) - new Date(a.date)).map(entry => {
                return (
                  <div key={entry.id} className="bg-gray-50 rounded-lg p-3 border">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-gray-700">{entry.date}</span>
                      <button onClick={() => deleteEntry(entry.id)} className="text-red-500 hover:text-red-700 text-sm">
                        Delete
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <span className="text-gray-500">Start Cash:</span>
                      <span className="text-right">${entry.cashBalanceStart?.toLocaleString() || 0}</span>
                      <span className="text-gray-500">Members:</span>
                      <span className="text-right">{entry.memberCount || 0}</span>
                      <span className="text-gray-500">PT Hours:</span>
                      <span className="text-right">{entry.ptHours || 0}</span>
                      <span className="text-gray-500">PT Rate:</span>
                      <span className="text-right">${entry.ptRate || 50}/hr</span>
                      <span className="text-gray-500">New Revenue:</span>
                      <span className="text-right">${entry.newRevenue?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop: Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Start Cash</th>
                    <th className="text-left p-2">Members</th>
                    <th className="text-left p-2">Class Hrs</th>
                    <th className="text-left p-2">PT Hrs</th>
                    <th className="text-left p-2">PT Rate</th>
                    <th className="text-left p-2">New Revenue</th>
                    <th className="text-left p-2"></th>
                  </td>
                </thead>
                <tbody>
                  {[...entries].sort((a, b) => new Date(b.date) - new Date(a.date)).map(entry => {
                    return (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{entry.date}</td>
                        <td className="p-2">${entry.cashBalanceStart?.toLocaleString() || 0}</td>
                        <td className="p-2">{entry.memberCount || 0}</td>
                        <td className="p-2">{entry.classHours || 0}</td>
                        <td className="p-2">{entry.ptHours || 0}</td>
                        <td className="p-2">${entry.ptRate || 50}/hr}</td>
                        <td className="p-2">${entry.newRevenue?.toLocaleString() || 0}</td>
                        <td className="p-2">
                          <button onClick={() => deleteEntry(entry.id)} className="text-red-500 hover:text-red-700">
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <Settings 
          settings={businessSettings} 
          onSave={saveBusinessSettings} 
          onClose={() => setShowSettings(false)} 
        />
      )}
    </div>
  )
}

export default App