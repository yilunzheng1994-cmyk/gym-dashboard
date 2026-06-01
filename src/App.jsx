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

function App() {
  // Form data
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    cashBalance: '',
    newMembers: '',
    newRevenue: '',
    ptHours: '',
    ptRate: '50',
    retailRevenue: '',
    marketingSpend: ''
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
      cashBalance: Number(formData.cashBalance) || 0,
      newMembers: Number(formData.newMembers) || 0,
      newRevenue: Number(formData.newRevenue) || 0,
      ptHours: Number(formData.ptHours) || 0,
      ptRate: Number(formData.ptRate) || 50,
      retailRevenue: Number(formData.retailRevenue) || 0,
      marketingSpend: Number(formData.marketingSpend) || 0
    }
    
    const newEntries = [newEntry, ...entries].slice(0, 30)
    saveToLocalStorage(newEntries)
    
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      cashBalance: '',
      newMembers: '',
      newRevenue: '',
      ptHours: '',
      ptRate: '50',
      retailRevenue: '',
      marketingSpend: ''
    })
  }

  // Delete entry
  const deleteEntry = (id) => {
    const newEntries = entries.filter(entry => entry.id !== id)
    saveToLocalStorage(newEntries)
  }

  // Calculate metrics (based on latest entry)
  const latestEntry = entries[0]
  let metrics = {
    availableCash: 0,
    todayProfit: 0,
    utilizationRate: 70,
    cac: 0,
    arpu: 0,
    ptConversionRate: 0,
    grossMargin: 0,
    dailyBurnRate: 0
  }
  
  if (latestEntry) {
    const ptRevenue = (latestEntry.ptHours || 0) * (latestEntry.ptRate || 50)
    const totalRevenue = latestEntry.newRevenue + latestEntry.retailRevenue + ptRevenue
    const totalIncome = totalRevenue
    
    metrics.availableCash = latestEntry.cashBalance
    metrics.todayProfit = totalIncome - latestEntry.marketingSpend
    
    metrics.cac = latestEntry.newMembers > 0 
      ? latestEntry.marketingSpend / latestEntry.newMembers 
      : 0
    
    metrics.arpu = latestEntry.newMembers > 0 
      ? (latestEntry.newRevenue + latestEntry.retailRevenue) / latestEntry.newMembers 
      : 0
    
    metrics.ptConversionRate = totalRevenue > 0 
      ? (ptRevenue / totalRevenue) * 100 
      : 0
    
    const ptCommission = ptRevenue * 0.35
    metrics.grossMargin = totalIncome > 0 
      ? ((totalIncome - latestEntry.marketingSpend - ptCommission) / totalIncome) * 100 
      : 0
    
    metrics.dailyBurnRate = latestEntry.marketingSpend
  }

  // Prepare chart data
  const chartData = [...entries]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-7)
    .map(entry => {
      const ptRevenue = (entry.ptHours || 0) * (entry.ptRate || 50)
      const totalIncome = entry.newRevenue + entry.retailRevenue + ptRevenue
      const cac = entry.newMembers > 0 ? entry.marketingSpend / entry.newMembers : 0
      
      return {
        date: entry.date,
        cashBalance: entry.cashBalance,
        profit: totalIncome - entry.marketingSpend,
        newMembers: entry.newMembers,
        ptHours: entry.ptHours,
        ptRate: entry.ptRate || 50,
        cac: cac,
        marketingSpend: entry.marketingSpend,
        ptRevenue: ptRevenue
      }
    })

  return (
    <div className="min-h-screen bg-gray-100 p-3 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">
          CrossFit Financial Dashboard
        </h1>

        {/* Main Metric Cards - Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-3 md:mb-4">
          <div className="bg-white rounded-lg shadow p-3 md:p-4 border-l-4 border-blue-500">
            <div className="text-gray-500 text-xs md:text-sm">Available Cash</div>
            <div className="text-xl md:text-2xl font-bold text-gray-800">
              ${metrics.availableCash.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 md:p-4 border-l-4 border-green-500">
            <div className="text-gray-500 text-xs md:text-sm">Today's Profit</div>
            <div className={`text-xl md:text-2xl font-bold ${metrics.todayProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${metrics.todayProfit.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 md:p-4 border-l-4 border-purple-500 sm:col-span-2 md:col-span-1">
            <div className="text-gray-500 text-xs md:text-sm">Utilization Rate</div>
            <div className="text-xl md:text-2xl font-bold text-gray-800">
              {metrics.utilizationRate}%
            </div>
          </div>
        </div>

        {/* Additional Metric Cards - Row 2 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 mb-4 md:mb-6">
          <div className="bg-white rounded-lg shadow p-2 md:p-3">
            <div className="text-gray-500 text-xs">CAC</div>
            <div className="text-base md:text-lg font-bold text-gray-800">
              ${metrics.cac.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400 hidden md:block">Customer Acquisition Cost</div>
          </div>
          <div className="bg-white rounded-lg shadow p-2 md:p-3">
            <div className="text-gray-500 text-xs">ARPU</div>
            <div className="text-base md:text-lg font-bold text-gray-800">
              ${metrics.arpu.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400 hidden md:block">Revenue per Member</div>
          </div>
          <div className="bg-white rounded-lg shadow p-2 md:p-3">
            <div className="text-gray-500 text-xs">PT %</div>
            <div className="text-base md:text-lg font-bold text-gray-800">
              {metrics.ptConversionRate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-400 hidden md:block">PT Revenue %</div>
          </div>
          <div className="bg-white rounded-lg shadow p-2 md:p-3">
            <div className="text-gray-500 text-xs">Margin</div>
            <div className={`text-base md:text-lg font-bold ${metrics.grossMargin >= 30 ? 'text-green-600' : 'text-orange-500'}`}>
              {metrics.grossMargin.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-400 hidden md:block">Gross Margin</div>
          </div>
          <div className="bg-white rounded-lg shadow p-2 md:p-3">
            <div className="text-gray-500 text-xs">Burn</div>
            <div className="text-base md:text-lg font-bold text-red-500">
              ${metrics.dailyBurnRate.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 hidden md:block">Daily Burn</div>
          </div>
        </div>

        {/* Charts Section - Mobile friendly */}
        {chartData.length > 0 && (
          <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-6 mb-4 md:mb-6">
            <div className="bg-white rounded-lg shadow p-3 md:p-4">
              <h3 className="text-sm md:text-md font-semibold text-gray-700 mb-2 md:mb-4">Cash Flow & Profit</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="cashBalance" stroke="#3b82f6" name="Cash" strokeWidth={2} />
                  <Line type="monotone" dataKey="profit" stroke="#10b981" name="Profit" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-3 md:p-4">
              <h3 className="text-sm md:text-md font-semibold text-gray-700 mb-2 md:mb-4">CAC Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Bar dataKey="cac" fill="#f59e0b" name="CAC" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-2 text-xs text-gray-500 text-center">Target CAC &lt; $200</div>
            </div>

            <div className="bg-white rounded-lg shadow p-3 md:p-4">
              <h3 className="text-sm md:text-md font-semibold text-gray-700 mb-2 md:mb-4">New Members vs Marketing</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="newMembers" stroke="#f59e0b" name="Members" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="marketingSpend" stroke="#ef4444" name="Marketing $" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-3 md:p-4">
              <h3 className="text-sm md:text-md font-semibold text-gray-700 mb-2 md:mb-4">Health Indicators</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs md:text-sm mb-1">
                    <span>CAC vs LTV</span>
                    <span className={`font-semibold ${metrics.cac > 0 && (metrics.cac * 3) > 500 ? 'text-green-600' : 'text-red-500'}`}>
                      {metrics.cac > 0 ? `CAC $${metrics.cac.toFixed(0)} → ~$${(metrics.cac * 3).toFixed(0)}` : 'N/A'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
                    <div className={`h-1.5 md:h-2 rounded-full ${metrics.cac > 0 && (metrics.cac * 3) > 500 ? 'bg-green-500' : 'bg-red-500'}`} 
                         style={{ width: `${Math.min(100, (metrics.cac / 500) * 100)}%` }}></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Target: LTV &gt; 3x CAC, CAC &lt; $200</div>
                </div>
                <div>
                  <div className="flex justify-between text-xs md:text-sm mb-1">
                    <span>Marketing Efficiency</span>
                    <span className="font-semibold">
                      {latestEntry && latestEntry.marketingSpend > 0 
                        ? `${((latestEntry.newRevenue + latestEntry.retailRevenue) / latestEntry.marketingSpend).toFixed(1)}x` 
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
                    <div className="bg-blue-500 h-1.5 md:h-2 rounded-full" 
                         style={{ width: `${Math.min(100, ((latestEntry?.newRevenue + latestEntry?.retailRevenue) / (latestEntry?.marketingSpend || 1)) * 20)}%` }}></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Revenue per $1 marketing</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {chartData.length === 0 && (
          <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-4 md:mb-6 text-center text-gray-500 text-sm">
            <p>Add your first data entry to see charts and insights</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-3 md:p-6 mb-4 md:mb-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Daily Data Entry</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm text-gray-600 mb-1">Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full p-2 text-sm md:text-base border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-gray-600 mb-1">Cash Balance ($)</label>
                <input type="number" name="cashBalance" value={formData.cashBalance} onChange={handleChange} placeholder="0" className="w-full p-2 text-sm md:text-base border rounded-lg" />
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
                <label className="block text-xs md:text-sm text-gray-600 mb-1">PT Hours</label>
                <input type="number" name="ptHours" value={formData.ptHours} onChange={handleChange} placeholder="0" className="w-full p-2 text-sm md:text-base border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-gray-600 mb-1">PT Rate ($/hr)</label>
                <input type="number" name="ptRate" value={formData.ptRate} onChange={handleChange} placeholder="50" className="w-full p-2 text-sm md:text-base border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-gray-600 mb-1">Retail Revenue ($)</label>
                <input type="number" name="retailRevenue" value={formData.retailRevenue} onChange={handleChange} placeholder="0" className="w-full p-2 text-sm md:text-base border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-gray-600 mb-1">Marketing Spend ($)</label>
                <input type="number" name="marketingSpend" value={formData.marketingSpend} onChange={handleChange} placeholder="0" className="w-full p-2 text-sm md:text-base border rounded-lg" />
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
              {entries.map(entry => {
                const cac = entry.newMembers > 0 ? (entry.marketingSpend / entry.newMembers).toFixed(0) : 0
                return (
                  <div key={entry.id} className="bg-gray-50 rounded-lg p-3 border">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-gray-700">{entry.date}</span>
                      <button onClick={() => deleteEntry(entry.id)} className="text-red-500 hover:text-red-700 text-sm">
                        Delete
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <span className="text-gray-500">Cash:</span>
                      <span className="text-right">${entry.cashBalance.toLocaleString()}</span>
                      <span className="text-gray-500">New Members:</span>
                      <span className="text-right">{entry.newMembers}</span>
                      <span className="text-gray-500">New Revenue:</span>
                      <span className="text-right">${entry.newRevenue.toLocaleString()}</span>
                      <span className="text-gray-500">PT Hours:</span>
                      <span className="text-right">{entry.ptHours}</span>
                      <span className="text-gray-500">PT Rate:</span>
                      <span className="text-right">${entry.ptRate || 50}/hr</span>
                      <span className="text-gray-500">Retail:</span>
                      <span className="text-right">${entry.retailRevenue.toLocaleString()}</span>
                      <span className="text-gray-500">Marketing:</span>
                      <span className="text-right">${entry.marketingSpend.toLocaleString()}</span>
                      <span className="text-gray-500">CAC:</span>
                      <span className="text-right">${cac}</span>
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
                    <th className="text-left p-2">Cash</th>
                    <th className="text-left p-2">New Members</th>
                    <th className="text-left p-2">New Revenue</th>
                    <th className="text-left p-2">PT Hours</th>
                    <th className="text-left p-2">PT Rate</th>
                    <th className="text-left p-2">Retail</th>
                    <th className="text-left p-2">Marketing</th>
                    <th className="text-left p-2">CAC</th>
                    <th className="text-left p-2"></th>
                  </table>
                </thead>
                <tbody>
                  {entries.map(entry => {
                    const cac = entry.newMembers > 0 ? (entry.marketingSpend / entry.newMembers).toFixed(0) : 0
                    return (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{entry.date}</td>
                        <td className="p-2">${entry.cashBalance.toLocaleString()}</td>
                        <td className="p-2">{entry.newMembers}</td>
                        <td className="p-2">${entry.newRevenue.toLocaleString()}</td>
                        <td className="p-2">{entry.ptHours}</td>
                        <td className="p-2">${entry.ptRate || 50}/hr</td>
                        <td className="p-2">${entry.retailRevenue.toLocaleString()}</td>
                        <td className="p-2">${entry.marketingSpend.toLocaleString()}</td>
                        <td className="p-2">${cac}</td>
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
    </div>
  )
}

export default App