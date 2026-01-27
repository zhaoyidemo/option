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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

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
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const newData = { ...prev, [name]: value }

      if (name === 'direction') {
        if (value === 'buy_low') {
          newData.inputCurrency = 'USDT'
          newData.exerciseCurrency = prev.coin
        } else {
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
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="p-6">
          {/* 头部 */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--border-color)]">
            <div>
              <h2 className="text-xl font-bold gradient-text-gold">新建交易</h2>
              <p className="text-[var(--text-muted)] text-sm mt-1">记录双币理财订单</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 平台和币种 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="data-label mb-2 block">交易平台</label>
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  className="select-field"
                  required
                >
                  <option value="binance">币安 Binance</option>
                  <option value="okx">欧易 OKX</option>
                </select>
              </div>

              <div>
                <label className="data-label mb-2 block">交易币种</label>
                <select
                  name="coin"
                  value={formData.coin}
                  onChange={handleChange}
                  className="select-field"
                  required
                >
                  <option value="BTC">BTC Bitcoin</option>
                  <option value="ETH">ETH Ethereum</option>
                </select>
              </div>
            </div>

            {/* 方向 */}
            <div>
              <label className="data-label mb-2 block">交易方向</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'direction', value: 'buy_low' } } as any)}
                  className={`p-4 rounded-lg border transition-all ${
                    formData.direction === 'buy_low'
                      ? 'border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)]'
                      : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--border-highlight)]'
                  }`}
                >
                  <div className="font-semibold">低买</div>
                  <div className="text-xs mt-1 opacity-70">卖出看跌期权</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'direction', value: 'sell_high' } } as any)}
                  className={`p-4 rounded-lg border transition-all ${
                    formData.direction === 'sell_high'
                      ? 'border-[var(--danger)] bg-[var(--danger)]/10 text-[var(--danger)]'
                      : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--border-highlight)]'
                  }`}
                >
                  <div className="font-semibold">高卖</div>
                  <div className="text-xs mt-1 opacity-70">卖出看涨期权</div>
                </button>
              </div>
            </div>

            {/* 投入信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="data-label mb-2 block">投入数量</label>
                <input
                  type="number"
                  name="inputAmount"
                  value={formData.inputAmount}
                  onChange={handleChange}
                  step="0.000001"
                  className="input-field"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="data-label mb-2 block">投入币种</label>
                <div className="input-field bg-[var(--bg-card)] cursor-not-allowed">
                  <span className={formData.inputCurrency === 'USDT' ? '' : formData.inputCurrency === 'BTC' ? 'text-[#f7931a]' : 'text-[#627eea]'}>
                    {formData.inputCurrency}
                  </span>
                </div>
              </div>
            </div>

            {/* 期权信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="data-label mb-2 block">行权价 (USD)</label>
                <input
                  type="number"
                  name="strikePrice"
                  value={formData.strikePrice}
                  onChange={handleChange}
                  step="0.01"
                  className="input-field"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="data-label mb-2 block">年化收益率 (%)</label>
                <input
                  type="number"
                  name="apr"
                  value={formData.apr}
                  onChange={handleChange}
                  step="0.01"
                  className="input-field"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* 到期时间 */}
            <div>
              <label className="data-label mb-2 block">到期时间</label>
              <input
                type="datetime-local"
                name="expiryTime"
                value={formData.expiryTime}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            {/* 预期结果 */}
            <div className="pt-4 border-t border-[var(--border-color)]">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-semibold text-[var(--text-primary)]">预期结果</h3>
                <span className="tag tag-pending text-xs">预期收益</span>
              </div>

              <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] mb-4">
                <div className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-[var(--accent-cyan)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="space-y-1">
                    <p><span className="text-[var(--success)]">未行权收益</span>：只填收益部分，不含本金</p>
                    <p><span className="text-[var(--accent-cyan)]">行权得到</span>：填转换后的币数量
                      {formData.direction === 'buy_low' && formData.inputAmount && formData.strikePrice && (
                        <span className="text-[var(--success)] ml-1">
                          （参考值：{(parseFloat(formData.inputAmount) / parseFloat(formData.strikePrice)).toFixed(8)} {formData.exerciseCurrency}）
                        </span>
                      )}
                      {formData.direction === 'sell_high' && formData.inputAmount && formData.strikePrice && (
                        <span className="text-[var(--success)] ml-1">
                          （参考值：{(parseFloat(formData.inputAmount) * parseFloat(formData.strikePrice)).toFixed(2)} {formData.exerciseCurrency}）
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="data-label mb-2 block">
                    未行权收益 ({formData.inputCurrency})
                  </label>
                  <input
                    type="number"
                    name="premium"
                    value={formData.premium}
                    onChange={handleChange}
                    step="0.000001"
                    className="input-field"
                    placeholder="只填收益，不含本金"
                    required
                  />
                  {formData.inputAmount && formData.premium && (
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                      到期后得到：<span className="text-[var(--success)] font-mono">
                        {(parseFloat(formData.inputAmount) + parseFloat(formData.premium)).toFixed(6)} {formData.inputCurrency}
                      </span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="data-label mb-2 block">
                    行权得到 ({formData.exerciseCurrency})
                  </label>
                  <input
                    type="number"
                    name="exerciseAmount"
                    value={formData.exerciseAmount}
                    onChange={handleChange}
                    step="0.000001"
                    className="input-field"
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
                      className="text-xs text-[var(--accent-cyan)] hover:text-[var(--accent-cyan-dim)] mt-2 flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
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
                      className="text-xs text-[var(--accent-cyan)] hover:text-[var(--accent-cyan-dim)] mt-2 flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
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
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '创建中...' : '创建交易'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
