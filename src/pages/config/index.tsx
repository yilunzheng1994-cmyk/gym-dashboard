import { View, Input, Button, Text } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

export default function Config() {
  const [formData, setFormData] = useState({
    totalRevenue: '',
    memberCount: '',
    coachCount: '',
    rent: '',
    marketing: ''
  })

  const handleSubmit = () => {
    const numericData = {
      totalRevenue: Number(formData.totalRevenue) || 0,
      memberCount: Number(formData.memberCount) || 0,
      coachCount: Number(formData.coachCount) || 0,
      rent: Number(formData.rent) || 0,
      marketing: Number(formData.marketing) || 0
    }

    Taro.setStorageSync('finance_data', numericData)

    Taro.showToast({
      title: '保存成功',
      icon: 'success'
    })

    setTimeout(() => {
      Taro.navigateBack()
    }, 1500)
  }

  return (
    <View className="config">
      <View className="desc">
        <Text>填写5个核心数据，开始你的财务分析</Text>
      </View>

      <View className="form">
        {[
          { label: '月收入 ($)', key: 'totalRevenue', placeholder: '例如: 10000' },
          { label: '会员数', key: 'memberCount', placeholder: '例如: 50' },
          { label: '教练数', key: 'coachCount', placeholder: '例如: 3' },
          { label: '月房租 ($)', key: 'rent', placeholder: '例如: 3000' },
          { label: '月营销费 ($)', key: 'marketing', placeholder: '例如: 1000' }
        ].map(field => (
          <View key={field.key} className="form-item">
            <Text className="label">{field.label}</Text>
            <Input
              type="number"
              placeholder={field.placeholder}
              value={formData[field.key]}
              onInput={(e) => setFormData({ ...formData, [field.key]: e.detail.value })}
              className="input"
            />
          </View>
        ))}
      </View>

      <Button className="submit-btn" onClick={handleSubmit}>
        保存并开始分析
      </Button>
    </View>
  )
}