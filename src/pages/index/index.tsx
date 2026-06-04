import { View, Text } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

export default function Index() {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    netProfit: 0,
    confidence: 0
  })

  // 页面加载时读取本地数据
  Taro.useLoad(() => {
    loadData()
  })

  // 每次页面显示时也刷新（从配置页返回时）
  Taro.useDidShow(() => {
    loadData()
  })

  const loadData = () => {
    const stored = Taro.getStorageSync('finance_data')
    
    if (stored) {
      const totalRevenue = stored.totalRevenue || 0
      const rent = stored.rent || 0
      const marketing = stored.marketing || 0
      const netProfit = totalRevenue - rent - marketing
      
      setMetrics({
        totalRevenue: totalRevenue,
        netProfit: netProfit,
        confidence: 65
      })
    }
  }

  return (
    <View className="index">
      {/* 头部 */}
      <View className="header">
        <Text className="title">Fitness Finance健财宝</Text>
        <Text className="confidence">置信度 {metrics.confidence}%</Text>
      </View>

      {/* KPI 卡片 - 横向两列布局 */}
      <View className="kpi-grid">
        <View className="kpi-card">
          <Text className="kpi-label">总收入</Text>
          <Text className="kpi-value">${metrics.totalRevenue.toLocaleString()}</Text>
        </View>
        <View className="kpi-card">
          <Text className="kpi-label">净利润</Text>
          <Text className="kpi-value">${metrics.netProfit.toLocaleString()}</Text>
        </View>
      </View>

      {/* 操作按钮 */}
      <View className="action-buttons">
        <View className="btn btn-primary" onClick={() => Taro.navigateTo({ url: '/pages/config/index' })}>
          快速配置
        </View>
        <View className="btn btn-secondary" onClick={() => Taro.navigateTo({ url: '/pages/refine/index' })}>
          细化数据
        </View>
      </View>
    </View>
  )
}