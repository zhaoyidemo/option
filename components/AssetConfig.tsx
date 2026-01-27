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
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
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
      .finally(() => setIsLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
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
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const currencyConfig = {
    USDT: { label: '泰达币', symbol: '$', color: 'text-[var(--success)]', icon: '₮' },
    BTC: { label: '比特币', symbol: '₿', color: 'text-[#f7931a]', icon: '₿' },
    ETH: { label: '以太坊', symbol: 'Ξ', color: 'text-[#627eea]', icon: 'Ξ' },
  }

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="card max-w-md w-full animate-slide-up">
        <div className="p-6">
          {/* 头部 */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--border-color)]">
            <div>
              <h2 className="text-xl font-bold gradient-text-cyan">资产配置</h2>
              <p className="text-[var(--text-muted)] text-sm mt-1">设置初始资产数量</p>
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

          {/* 说明 */}
          <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-cyan)]/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[var(--accent-cyan)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                <p className="font-medium text-[var(--text-primary)] mb-1">初始资产设置</p>
                <p className="text-xs">设置你的初始资产数量，系统将根据交易记录自动推算当前持仓和收益。</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton h-16 rounded-lg" />
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {(['USDT', 'BTC', 'ETH'] as const).map((currency) => {
                const config = currencyConfig[currency]
                return (
                  <div key={currency} className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-full ${config.color} bg-current/10 flex items-center justify-center`}>
                        <span className={`${config.color} font-bold text-sm`}>{config.icon}</span>
                      </div>
                      <div>
                        <div className="font-medium text-[var(--text-primary)]">{currency}</div>
                        <div className="text-xs text-[var(--text-muted)]">{config.label}</div>
                      </div>
                    </div>
                    <input
                      type="number"
                      name={currency}
                      value={formData[currency]}
                      onChange={handleChange}
                      step={currency === 'USDT' ? '0.01' : '0.00000001'}
                      className="input-field"
                      placeholder={currency === 'USDT' ? '0.00' : '0.00000000'}
                    />
                  </div>
                )
              })}

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
                  {isSubmitting ? '保存中...' : '保存配置'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
