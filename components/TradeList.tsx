'use client'

import { useEffect, useState } from 'react'

interface Trade {
  id: string
  platform: string
  coin: string
  direction: string
  inputAmount: number
  inputCurrency: string
  strikePrice: number
  expiryTime: string
  apr: number
  premium: number
  exerciseAmount: number
  exerciseCurrency: string
  status: string
  exercised?: boolean
  settlementPrice?: number
  outputAmount?: number
  outputCurrency?: string
  createdAt: string
  settledAt?: string
}

type SortField = 'expiryTime' | 'strikePrice' | 'apr'
type SortOrder = 'asc' | 'desc'

export default function TradeList({ onRefresh }: { onRefresh: () => void }) {
  const [trades, setTrades] = useState<Trade[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'settled'>('all')
  const [sortField, setSortField] = useState<SortField>('expiryTime')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTrades()
  }, [])

  const loadTrades = () => {
    setIsLoading(true)
    fetch('/api/trades')
      .then((res) => {
        if (!res.ok) throw new Error('API failed')
        return res.json()
      })
      .then((data) => setTrades(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error('Failed to load trades:', err)
        setTrades([])
      })
      .finally(() => setIsLoading(false))
  }

  const deleteTrade = async (id: string) => {
    if (!confirm('确定要删除这笔交易吗？')) return

    try {
      await fetch(`/api/trades?id=${id}`, { method: 'DELETE' })
      loadTrades()
      onRefresh()
    } catch (err) {
      console.error('Failed to delete trade:', err)
      alert('删除失败')
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const filteredAndSortedTrades = trades
    .filter((trade) => {
      if (filter === 'all') return true
      return trade.status === filter
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'expiryTime':
          comparison = new Date(a.expiryTime).getTime() - new Date(b.expiryTime).getTime()
          break
        case 'strikePrice':
          comparison = a.strikePrice - b.strikePrice
          break
        case 'apr':
          comparison = a.apr - b.apr
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const pendingCount = trades.filter((t) => t.status === 'pending').length
  const settledCount = trades.filter((t) => t.status === 'settled').length

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatNumber = (num: number, decimals = 2) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1 ${
        sortField === field
          ? 'bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30'
          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
      }`}
    >
      {label}
      {sortField === field && (
        <span className="text-[10px]">{sortOrder === 'asc' ? '↑' : '↓'}</span>
      )}
    </button>
  )

  return (
    <div className="card overflow-hidden">
      {/* 筛选和排序 */}
      <div className="p-4 border-b border-[var(--border-color)]">
        {/* 筛选标签 */}
        <div className="flex items-center gap-1 mb-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-[var(--accent-gold)] text-[var(--bg-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            全部 ({trades.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'pending'
                ? 'bg-[var(--warning)] text-[var(--bg-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            进行中 ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('settled')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'settled'
                ? 'bg-[var(--accent-cyan)] text-[var(--bg-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            已结算 ({settledCount})
          </button>
        </div>

        {/* 排序选项 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">排序：</span>
          <SortButton field="expiryTime" label="到期时间" />
          <SortButton field="strikePrice" label="行权价" />
          <SortButton field="apr" label="收益率" />
        </div>
      </div>

      {/* 列表内容 */}
      <div>
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-lg" />
            ))}
          </div>
        ) : filteredAndSortedTrades.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-[var(--text-muted)] text-lg mb-2">暂无交易记录</div>
            <div className="text-[var(--text-muted)] text-sm opacity-60">
              点击右上角「新建交易」开始记录
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-color)]">
            {filteredAndSortedTrades.map((trade, index) => (
              <div
                key={trade.id}
                className="trade-row p-4 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* 左侧信息 */}
                  <div className="flex-1 min-w-0">
                    {/* 标签行 */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`tag ${trade.platform === 'binance' ? 'tag-binance' : 'tag-okx'}`}>
                        {trade.platform === 'binance' ? '币安' : '欧易'}
                      </span>
                      <span className={`tag ${trade.coin === 'BTC' ? 'tag-btc' : 'tag-eth'}`}>
                        {trade.coin}
                      </span>
                      <span className={`tag ${trade.direction === 'buy_low' ? 'tag-buy' : 'tag-sell'}`}>
                        {trade.direction === 'buy_low' ? '低买' : '高卖'}
                      </span>
                      {trade.status === 'settled' && (
                        <span className={`tag ${trade.exercised ? 'tag-settled' : 'tag-pending'}`}>
                          {trade.exercised ? '✓ 已行权' : '✗ 未行权'}
                        </span>
                      )}
                    </div>

                    {/* 数据行 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-[var(--text-muted)] text-xs mb-1">投入金额</div>
                        <div className="font-mono font-semibold">
                          {formatNumber(trade.inputAmount, trade.inputCurrency === 'USDT' ? 2 : 6)} {trade.inputCurrency}
                        </div>
                      </div>
                      <div>
                        <div className="text-[var(--text-muted)] text-xs mb-1">行权价</div>
                        <div className="font-mono font-semibold">
                          ${formatNumber(trade.strikePrice)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[var(--text-muted)] text-xs mb-1">到期时间</div>
                        <div className="font-mono">
                          {formatDate(trade.expiryTime)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[var(--text-muted)] text-xs mb-1">年化收益</div>
                        <div className="font-mono text-[var(--success)]">
                          {trade.apr}%
                        </div>
                      </div>
                    </div>

                    {/* 预期/结果 */}
                    <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
                      {trade.status === 'settled' && trade.outputAmount ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--text-muted)] text-sm">结算结果：</span>
                          <span className="font-mono font-semibold text-[var(--accent-cyan)]">
                            {formatNumber(trade.outputAmount, trade.outputCurrency === 'USDT' ? 2 : 6)} {trade.outputCurrency}
                          </span>
                          {trade.settlementPrice && (
                            <span className="text-[var(--text-muted)] text-sm">
                              @ ${formatNumber(trade.settlementPrice)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div>
                            <span className="text-[var(--text-muted)]">未行权：</span>
                            <span className="font-mono text-[var(--success)]">
                              +{formatNumber(trade.premium, trade.inputCurrency === 'USDT' ? 2 : 6)} {trade.inputCurrency}
                            </span>
                          </div>
                          <div>
                            <span className="text-[var(--text-muted)]">行权得：</span>
                            <span className="font-mono text-[var(--accent-cyan)]">
                              {formatNumber(trade.exerciseAmount, trade.exerciseCurrency === 'USDT' ? 2 : 6)} {trade.exerciseCurrency}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 右侧状态和操作 */}
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <span className={`tag ${trade.status === 'pending' ? 'tag-pending' : 'tag-settled'}`}>
                      {trade.status === 'pending' ? '⏳ 进行中' : '✓ 已结算'}
                    </span>
                    <button
                      onClick={() => deleteTrade(trade.id)}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
