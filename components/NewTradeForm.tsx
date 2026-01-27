'use client'

import { useState } from 'react'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function NewTradeForm({ onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    platform: 'binance',
    coin: 'ETH',
    direction: 'buy_low',
    inputAmount: '',
    inputCurrency: 'USDT',
    strikePrice: '',
    expiryTime: '',
    apr: '',
    premium: '',
    exerciseAmount: '',
    exerciseCurrency: 'ETH',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSuccess()
      } else {
        alert('创建失败')
      }
    } catch (err) {
      console.error('Failed to create trade:', err)
      alert('创建失败')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const newData = { ...prev, [name]: value }

      // 自动更新相关字段
      if (name === 'direction') {
        if (value === 'buy_low') {
          // 低买：USDT → 币
          newData.inputCurrency = 'USDT'
          newData.exerciseCurrency = prev.coin
        } else {
          // 高卖：币 → USDT
          newData.inputCurrency = prev.coin
          newData.exerciseCurrency = 'USDT'
        }
      } else if (name === 'coin') {
        if (prev.direction === 'buy_low') {
          newData.exerciseCurrency = value
        } else {
          newData.inputCurrency = value
        }
      }

      return newData
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">新建交易</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 平台和币种 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">平台</label>
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="binance">币安</option>
                  <option value="okx">欧易</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">币种</label>
                <select
                  name="coin"
                  value={formData.coin}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                </select>
              </div>
            </div>

            {/* 方向 */}
            <div>
              <label className="block text-sm font-medium mb-1">方向</label>
              <select
                name="direction"
                value={formData.direction}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="buy_low">低买（看跌期权）</option>
                <option value="sell_high">高卖（看涨期权）</option>
              </select>
            </div>

            {/* 投入信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">投入数量</label>
                <input
                  type="number"
                  name="inputAmount"
                  value={formData.inputAmount}
                  onChange={handleChange}
                  step="0.000001"
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">投入币种</label>
                <input
                  type="text"
                  value={formData.inputCurrency}
                  className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                  disabled
                />
              </div>
            </div>

            {/* 期权信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">行权价</label>
                <input
                  type="number"
                  name="strikePrice"
                  value={formData.strikePrice}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">年化收益率 (%)</label>
                <input
                  type="number"
                  name="apr"
                  value={formData.apr}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
            </div>

            {/* 到期时间 */}
            <div>
              <label className="block text-sm font-medium mb-1">到期时间</label>
              <input
                type="datetime-local"
                name="expiryTime"
                value={formData.expiryTime}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            {/* 预期结果 */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">预期结果</h3>

              <div className="mb-3 p-3 bg-blue-50 rounded text-xs text-blue-800">
                <p className="font-semibold mb-1">说明：</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>未行权收益</strong>：只填收益部分，不含本金</li>
                  <li><strong>行权得到</strong>：填转换后的币数量
                    {formData.direction === 'buy_low' && formData.inputAmount && formData.strikePrice && (
                      <span className="text-green-700">
                        （≈ {(parseFloat(formData.inputAmount) / parseFloat(formData.strikePrice)).toFixed(8)} {formData.exerciseCurrency}）
                      </span>
                    )}
                    {formData.direction === 'sell_high' && formData.inputAmount && formData.strikePrice && (
                      <span className="text-green-700">
                        （≈ {(parseFloat(formData.inputAmount) * parseFloat(formData.strikePrice)).toFixed(2)} {formData.exerciseCurrency}）
                      </span>
                    )}
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    未行权收益 ({formData.inputCurrency})
                  </label>
                  <input
                    type="number"
                    name="premium"
                    value={formData.premium}
                    onChange={handleChange}
                    step="0.000001"
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="只填收益，不含本金"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    到期后得到：{formData.inputAmount && formData.premium
                      ? `${(parseFloat(formData.inputAmount) + parseFloat(formData.premium)).toFixed(6)} ${formData.inputCurrency}`
                      : '本金 + 收益'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    行权得到数量 ({formData.exerciseCurrency})
                  </label>
                  <input
                    type="number"
                    name="exerciseAmount"
                    value={formData.exerciseAmount}
                    onChange={handleChange}
                    step="0.000001"
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="转换后的币数量"
                    required
                  />
                  {formData.direction === 'buy_low' && formData.inputAmount && formData.strikePrice && (
                    <button
                      type="button"
                      onClick={() => {
                        const calculated = (parseFloat(formData.inputAmount) / parseFloat(formData.strikePrice)).toFixed(8)
                        setFormData(prev => ({ ...prev, exerciseAmount: calculated }))
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                    >
                      自动计算：{(parseFloat(formData.inputAmount) / parseFloat(formData.strikePrice)).toFixed(8)}
                    </button>
                  )}
                  {formData.direction === 'sell_high' && formData.inputAmount && formData.strikePrice && (
                    <button
                      type="button"
                      onClick={() => {
                        const calculated = (parseFloat(formData.inputAmount) * parseFloat(formData.strikePrice)).toFixed(2)
                        setFormData(prev => ({ ...prev, exerciseAmount: calculated }))
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                    >
                      自动计算：{(parseFloat(formData.inputAmount) * parseFloat(formData.strikePrice)).toFixed(2)}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 按钮 */}
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
                创建
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
