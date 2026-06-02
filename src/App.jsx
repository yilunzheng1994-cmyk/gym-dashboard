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
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, CreditCard, PieChart as PieChartIcon } from 'lucide-react'
import Settings from './Settings'

function App() {
  // Business settings
  const [showSettings, setShowSettings] = useState(false)
  const [businessSettings, setBusinessSettings] = useState(() => {
    const saved = localStorage.getItem('business_settings')
    return saved ? JSON.parse(saved) : null
  })

  // Form data
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

  // Load data
  useEffect(() => {
    const saved = localStorage.getItem('gym_dashboard_entries')
    if (saved) {
      setEntries(JSON.parse(saved))
    }
  }, [])

  // Save data
  const saveToLocalStorage = (newEntries) => {
    localStorage.setItem('gym_dashboard_entries', JSON.stringify(newEntries))
    setEntries(newEntries)
  }

  // Save settings
  const saveBusinessSettings = (settings) => {
    localStorage.setItem('business_settings', JSON.stringify(settings))
    setBusinessSettings(settings)
    setShowSettings(false)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

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

  const deleteEntry = (id) => {
    const newEntries = entries.filter(entry => entry.id !== id)
    saveToLocalStorage(newEntries)
  }

  const getLatestEntry = () => {
    if (entries.length === 0) return null
    return [...entries].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
  }

  const latestEntry = getLatestEntry()
  
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

  // Calculate previous period metrics for comparison
  const getPreviousPeriodComparison = () => {
    if (entries.length < 2) return { revenueChange: 0, profitChange: 0 }
    const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date))
    const current = sorted[0]
    const previous = sorted[1]
    
    if (!current || !previous) return { revenueChange: 0, profitChange: 0 }
    
    const currentRevenue = current.newRevenue + current.retailRevenue + (current.ptHours * (current.ptRate || 50)) + current.otherRevenue
    const previousRevenue = previous.newRevenue + previous.retailRevenue + (previous.ptHours * (previous.ptRate || 50)) + previous.otherRevenue
    const currentProfit = currentRevenue - (current.variableStaffCost || 0) - (current.marketingSpend || 0)
    const previousProfit = previousRevenue - (previous.variableStaffCost || 0) - (previous.marketingSpend || 0)
    
    return {
      revenueChange: previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0,
      profitChange: previousProfit > 0 ? ((currentProfit - previousProfit) / previousProfit) * 100 : 0
    }
  }
  
  const comparisons = getPreviousPeriodComparison()

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

  const REVENUE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
  const COSTS_COLORS = ['#6b7280', '#8b5cf6', '#ec489a', '#f97316', '#06b6d4']

  return (
    <div className="min-h-screen bg-green-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Fitness Financial Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Real-time P&L and cash flow insights
            </p>
          </div>
          <button 
            onClick={() => setShowSettings(true)} 
            className="text-gray-600 hover:text-gray-900 text-sm bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </div>

        {!businessSettings && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded shadow-sm">
            <p className="text-yellow-700 text-sm">
              ⚠️ Please click Settings to configure your business costs (rent, staff, etc.)
            </p>
          </div>
        )}

        {/* KPI Cards */}
        {latestEntry && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              {/* Revenue Card */}
              <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-gray-500 text-sm font-medium mb-1">Total Revenue</div>
                    <div className="text-3xl font-bold text-gray-900">
                      ${metrics.totalRevenue.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-sm font-medium flex items-center gap-1 ${comparisons.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {comparisons.revenueChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(comparisons.revenueChange).toFixed(1)}%
                      </span>
                      <span className="text-gray-400 text-xs">vs yesterday</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">% of total</div>
                    <div className="text-lg font-semibold text-gray-700">100%</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>

              {/* Gross Profit Card */}
              <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-gray-500 text-sm font-medium mb-1">Gross Profit</div>
                    <div className="text-3xl font-bold text-gray-900">
                      ${metrics.totalRevenue.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-sm font-medium flex items-center gap-1 ${comparisons.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {comparisons.revenueChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(comparisons.revenueChange).toFixed(1)}%
                      </span>
                      <span className="text-gray-400 text-xs">vs yesterday</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">% Gross</div>
                    <div className="text-lg font-semibold text-gray-700">100%</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>

              {/* Net Income Card */}
              <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-gray-500 text-sm font-medium mb-1">Net Income</div>
                    <div className={`text-3xl font-bold ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${metrics.netProfit.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-sm font-medium flex items-center gap-1 ${comparisons.profitChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {comparisons.profitChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(comparisons.profitChange).toFixed(1)}%
                      </span>
                      <span className="text-gray-400 text-xs">vs yesterday</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Net Margin</div>
                    <div className={`text-lg font-semibold ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metrics.totalRevenue > 0 ? ((metrics.netProfit / metrics.totalRevenue) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${metrics.netProfit >= 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                         style={{ width: `${Math.min(100, Math.max(0, (metrics.netProfit / metrics.totalRevenue) * 100))}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <div className="text-gray-500 text-xs mb-1">Cash Balance</div>
                <div className="text-lg font-bold text-gray-900">${(latestEntry.cashBalanceStart || 0).toLocaleString()}</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <div className="text-gray-500 text-xs mb-1">Active Members</div>
                <div className="text-lg font-bold text-gray-900">{latestEntry.memberCount || 0}</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <div className="text-gray-500 text-xs mb-1">PT Sessions</div>
                <div className="text-lg font-bold text-gray-900">{latestEntry.ptHours || 0}</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <div className="text-gray-500 text-xs mb-1">Utilization</div>
                <div className="text-lg font-bold text-gray-900">72%</div>
              </div>
            </div>
          </>
        )}

        {/* Cash Flow Section */}
        {latestEntry && (
          <div className="bg-white rounded-xl p-5 mb-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-gray-500" />
              <h3 className="text-md font-semibold text-gray-800">Cash Flow Summary</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">Start Cash</div>
                <div className="text-base font-semibold">${(latestEntry.cashBalanceStart || 0).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Cash In</div>
                <div className="text-base font-semibold text-green-600">+${metrics.cashFlowIn.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Cash Out</div>
                <div className="text-base font-semibold text-red-600">-${metrics.cashFlowOut.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">End Cash</div>
                <div className="text-base font-semibold">${metrics.cashEnd.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Unearned Revenue</div>
                <div className="text-base font-semibold text-orange-600">${metrics.unearnedLiability.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Available Cash</div>
                <div className="text-base font-semibold text-blue-600">${metrics.availableCash.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Revenue & Cost Breakdown with Pie Charts */}
        {latestEntry && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Revenue Breakdown */}
            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <PieChartIcon className="w-5 h-5 text-gray-500" />
                <h3 className="text-md font-semibold text-gray-800">Revenue Breakdown</h3>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'New Members', value: metrics.revenueBreakdown.newRevenue },
                      { name: 'PT Revenue', value: metrics.revenueBreakdown.ptRevenue },
                      { name: 'Retail', value: metrics.revenueBreakdown.retailRevenue },
                      { name: 'Other', value: metrics.revenueBreakdown.otherRevenue }
                    ].filter(item => item.value > 0)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={true}
                  >
                    {[
                      { name: 'New Members', value: metrics.revenueBreakdown.newRevenue },
                      { name: 'PT Revenue', value: metrics.revenueBreakdown.ptRevenue },
                      { name: 'Retail', value: metrics.revenueBreakdown.retailRevenue },
                      { name: 'Other', value: metrics.revenueBreakdown.otherRevenue }
                    ].filter(item => item.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={REVENUE_COLORS[index % REVENUE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-gray-500" />
                <h3 className="text-md font-semibold text-gray-800">Cost Breakdown</h3>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Fixed Costs', value: metrics.costBreakdown.fixedCosts },
                      { name: 'Variable Staff', value: metrics.costBreakdown.variableStaff },
                      { name: 'Marketing', value: metrics.costBreakdown.marketing },
                      { name: 'PT Commission', value: metrics.costBreakdown.ptCommission },
                      { name: 'Depreciation', value: metrics.costBreakdown.depreciation }
                    ].filter(item => item.value > 0)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={true}
                  >
                    {[
                      { name: 'Fixed Costs', value: metrics.costBreakdown.fixedCosts },
                      { name: 'Variable Staff', value: metrics.costBreakdown.variableStaff },
                      { name: 'Marketing', value: metrics.costBreakdown.marketing },
                      { name: 'PT Commission', value: metrics.costBreakdown.ptCommission },
                      { name: 'Depreciation', value: metrics.costBreakdown.depreciation }
                    ].filter(item => item.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COSTS_COLORS[index % COSTS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
              <h3 className="text-md font-semibold text-gray-800 mb-4">Revenue & Profit Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="profit" stroke="#3b82f6" name="Profit" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
              <h3 className="text-md font-semibold text-gray-800 mb-4">New Members & PT Hours</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="newMembers" fill="#f59e0b" name="New Members" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="ptHours" fill="#ec489a" name="PT Hours" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {chartData.length === 0 && (
          <div className="bg-white rounded-xl p-8 mb-6 text-center text-gray-500 shadow-sm">
            <p>Add your first data entry to see charts and insights</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl p-5 mb-6 shadow-md border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Daily Data Entry</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Start Cash ($)</label>
                <input type="number" name="cashBalanceStart" value={formData.cashBalanceStart} onChange={handleChange} className="w-full p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Member Count</label>
                <input type="number" name="memberCount" value={formData.memberCount} onChange={handleChange} className="w-full p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Class Hours</label>
                <input type="number" name="classHours" value={formData.classHours} onChange={handleChange} className="w-full p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">PT Hours</label>
                <input type="number" name="ptHours" value={formData.ptHours} onChange={handleChange} className="w-full p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">PT Rate ($/hr)</label>
                <input type="number" name="ptRate" value={formData.ptRate} onChange={handleChange} className="w-full p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Other Revenue ($)</label>
                <input type="number" name="otherRevenue" value={formData.otherRevenue} onChange={handleChange} className="w-full p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Variable Staff ($)</label>
                <input type="number" name="variableStaffCost" value={formData.variableStaffCost} onChange={handleChange} className="w-full p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Marketing ($)</label>
                <input type="number" name="marketingSpend" value={formData.marketingSpend} onChange={handleChange} className="w-full p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">New Members</label>
                <input type="number" name="newMembers" value={formData.newMembers} onChange={handleChange} className="w-full p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">New Revenue ($)</label>
                <input type="number" name="newRevenue" value={formData.newRevenue} onChange={handleChange} className="w-full p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Retail ($)</label>
                <input type="number" name="retailRevenue" value={formData.retailRevenue} onChange={handleChange} className="w-full p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
            <button type="submit" className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Save Data
            </button>
          </form>
        </div>

        {/* History Table */}
        {entries.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Records</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 rounded-t-lg">
                  <tr className="border-b border-gray-200">
                    <th className="p-3 text-left text-gray-600 font-medium">Date</th>
                    <th className="p-3 text-left text-gray-600 font-medium">Cash</th>
                    <th className="p-3 text-left text-gray-600 font-medium">Members</th>
                    <th className="p-3 text-left text-gray-600 font-medium">PT Hrs</th>
                    <th className="p-3 text-left text-gray-600 font-medium">PT Rate</th>
                    <th className="p-3 text-left text-gray-600 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {[...entries].sort((a, b) => new Date(b.date) - new Date(a.date)).map(entry => (
                    <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3">{entry.date}</td>
                      <td className="p-3">${entry.cashBalanceStart?.toLocaleString() || 0}</td>
                      <td className="p-3">{entry.memberCount || 0}</td>
                      <td className="p-3">{entry.ptHours || 0}</td>
                      <td className="p-3">${entry.ptRate || 50}/hr</td>
                      <td className="p-3">
                        <button onClick={() => deleteEntry(entry.id)} className="text-red-500 hover:text-red-700">
                          Delete
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