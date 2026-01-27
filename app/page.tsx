'use client'

import { useEffect, useState } from 'react'
import TradeList from '@/components/TradeList'
import NewTradeForm from '@/components/NewTradeForm'
import AssetConfig from '@/components/AssetConfig'

interface Stats {
  prices: { BTC: number; ETH: number }
  netWorth: {
    USDT: number
    BTC: number
    ETH: number
    totalUSDT: number
  }
  initialTotalUSDT: number
  totalProfit: number
  totalProfitRate: number
  profitByPlatform: Record<string, number>
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [showNewTrade, setShowNewTrade] = useState(false)
  const [showAssetConfig, setShowAssetConfig] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // 加载统计数据
  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to load stats:', err))
  }, [refreshKey])

  // 定时刷新价格（每 30 秒）
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((k) => k + 1)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number, decimals = 2) => {
    return num.toLocaleString('zh-CN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">双币理财看板</h1>
          <div className="space-x-2">
            <button
              onClick={() => setShowAssetConfig(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              资产配置
            </button>
            <button
              onClick={() => setShowNewTrade(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + 新建交易
            </button>
          </div>
        </div>

        {/* 实时价格和总净值 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* 实时价格 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">实时价格</h2>
            {stats ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">BTC:</span>
                  <span className="text-2xl font-bold text-orange-600">
                    ${formatNumber(stats.prices.BTC)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ETH:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${formatNumber(stats.prices.ETH)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-gray-400">加载中...</div>
            )}
          </div>

          {/* 总净值 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">总净值</h2>
            {stats ? (
              <div>
                <div className="text-3xl font-bold text-green-600 mb-4">
                  ≈ {formatNumber(stats.netWorth.totalUSDT)} USDT
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">USDT:</span>
                    <span>{formatNumber(stats.netWorth.USDT)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">BTC:</span>
                    <span>
                      {formatNumber(stats.netWorth.BTC, 6)} (≈{formatNumber(stats.netWorth.BTC * stats.prices.BTC)})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ETH:</span>
                    <span>
                      {formatNumber(stats.netWorth.ETH, 6)} (≈{formatNumber(stats.netWorth.ETH * stats.prices.ETH)})
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-400">加载中...</div>
            )}
          </div>
        </div>

        {/* 收益统计 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">收益统计</h2>
          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">累计本金</div>
                <div className="text-2xl font-bold">
                  {formatNumber(stats.initialTotalUSDT)} USDT
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">累计收益</div>
                <div className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.totalProfit >= 0 ? '+' : ''}{formatNumber(stats.totalProfit)} USDT
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">整体收益率</div>
                <div className={`text-2xl font-bold ${stats.totalProfitRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.totalProfitRate >= 0 ? '+' : ''}{formatNumber(stats.totalProfitRate)}%
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-400">加载中...</div>
          )}

          {/* 按平台统计 */}
          {stats && Object.keys(stats.profitByPlatform).length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-semibold mb-3 text-gray-700">按平台统计</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(stats.profitByPlatform).map(([platform, profit]) => (
                  <div key={platform} className="flex justify-between">
                    <span className="text-gray-600">{platform === 'binance' ? '币安' : '欧易'}:</span>
                    <span className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {profit >= 0 ? '+' : ''}{formatNumber(profit)} USDT
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 交易列表 */}
        <TradeList onRefresh={() => setRefreshKey((k) => k + 1)} />

        {/* 新建交易表单 */}
        {showNewTrade && (
          <NewTradeForm
            onClose={() => setShowNewTrade(false)}
            onSuccess={() => {
              setShowNewTrade(false)
              setRefreshKey((k) => k + 1)
            }}
          />
        )}

        {/* 资产配置 */}
        {showAssetConfig && (
          <AssetConfig
            onClose={() => setShowAssetConfig(false)}
            onSuccess={() => {
              setShowAssetConfig(false)
              setRefreshKey((k) => k + 1)
            }}
          />
        )}
      </div>
    </div>
  )
}
