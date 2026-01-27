'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

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

export default function TradeList({ onRefresh }: { onRefresh: () => void }) {
  const [trades, setTrades] = useState<Trade[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'settled'>('all')

  useEffect(() => {
    loadTrades()
  }, [])

  const loadTrades = () => {
    fetch('/api/trades')
      .then((res) => res.json())
      .then((data) => setTrades(data))
      .catch((err) => console.error('Failed to load trades:', err))
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

  const filteredTrades = trades.filter((trade) => {
    if (filter === 'all') return true
    return trade.status === filter
  })

  const pendingTrades = filteredTrades.filter((t) => t.status === 'pending')
  const settledTrades = filteredTrades.filter((t) => t.status === 'settled')

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* 筛选按钮 */}
      <div className="p-4 border-b flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          全部 ({trades.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          进行中 ({pendingTrades.length})
        </button>
        <button
          onClick={() => setFilter('settled')}
          className={`px-4 py-2 rounded ${filter === 'settled' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          已结算 ({settledTrades.length})
        </button>
      </div>

      {/* 交易列表 */}
      <div className="divide-y">
        {filteredTrades.length === 0 ? (
          <div className="p-8 text-center text-gray-400">暂无交易记录</div>
        ) : (
          filteredTrades.map((trade) => (
            <div key={trade.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                      {trade.platform === 'binance' ? '币安' : '欧易'}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                      {trade.coin}
                    </span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      trade.direction === 'buy_low'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {trade.direction === 'buy_low' ? '低买' : '高卖'}
                    </span>
                    {trade.status === 'settled' && (
                      <span className={`px-2 py-1 rounded text-sm ${
                        trade.exercised
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {trade.exercised ? '✓ 行权' : '✗ 未行权'}
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      投入: {trade.inputAmount} {trade.inputCurrency} | 行权价: {trade.strikePrice}
                    </div>
                    <div>
                      到期: {formatDate(trade.expiryTime)} | 年化: {trade.apr}%
                    </div>
                    {trade.status === 'settled' && trade.outputAmount && (
                      <div className="font-semibold text-green-600">
                        得到: {trade.outputAmount.toFixed(6)} {trade.outputCurrency}
                        {trade.settlementPrice && ` | 结算价: ${trade.settlementPrice.toFixed(2)}`}
                      </div>
                    )}
                    {trade.status === 'pending' && (
                      <div className="text-gray-500">
                        预期: 未行权 +{trade.premium} {trade.inputCurrency} / 行权得 {trade.exerciseAmount} {trade.exerciseCurrency}
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-4 flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${
                    trade.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {trade.status === 'pending' ? '进行中' : '已结算'}
                  </span>
                  <button
                    onClick={() => deleteTrade(trade.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
