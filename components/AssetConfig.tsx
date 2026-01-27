'use client'

import { useState, useEffect } from 'react'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

interface Asset {
  id: string
  currency: string
  initialAmount: number
}

export default function AssetConfig({ onClose, onSuccess }: Props) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [formData, setFormData] = useState({
    USDT: '',
    BTC: '',
    ETH: '',
  })

  useEffect(() => {
    // 加载现有资产
    fetch('/api/assets')
      .then((res) => res.json())
      .then((data: Asset[]) => {
        const newFormData = { USDT: '', BTC: '', ETH: '' }
        data.forEach((asset) => {
          newFormData[asset.currency as keyof typeof newFormData] = asset.initialAmount.toString()
        })
        setFormData(newFormData)
        setAssets(data)
      })
      .catch((err) => console.error('Failed to load assets:', err))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // 保存每个币种的资产
      for (const [currency, amount] of Object.entries(formData)) {
        if (amount) {
          await fetch('/api/assets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              currency,
              initialAmount: parseFloat(amount),
            }),
          })
        }
      }

      onSuccess()
    } catch (err) {
      console.error('Failed to save assets:', err)
      alert('保存失败')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">资产配置</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>

          <div className="mb-4 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
            <p>设置你的初始资产，系统将根据交易记录自动推算当前持仓。</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">USDT 初始数量</label>
              <input
                type="number"
                name="USDT"
                value={formData.USDT}
                onChange={handleChange}
                step="0.01"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">BTC 初始数量</label>
              <input
                type="number"
                name="BTC"
                value={formData.BTC}
                onChange={handleChange}
                step="0.00000001"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="0.00000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">ETH 初始数量</label>
              <input
                type="number"
                name="ETH"
                value={formData.ETH}
                onChange={handleChange}
                step="0.00000001"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="0.00000000"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
