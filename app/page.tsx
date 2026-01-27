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
    locked?: {
      USDT: number
      BTC: number
      ETH: number
    }
    total?: {
      USDT: number
      BTC: number
      ETH: number
    }
    totalUSDT: number
  }
  initialTotalUSDT: number
  totalProfit: number
  totalProfitRate: number
  profitByPlatform: Record<string, number>
  priceError?: boolean
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [showNewTrade, setShowNewTrade] = useState(false)
  const [showAssetConfig, setShowAssetConfig] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [dbError, setDbError] = useState(false)

  // 加载统计数据
  useEffect(() => {
    fetch('/api/stats')
      .then((res) => {
        if (!res.ok) {
          setDbError(true)
          throw new Error('API failed')
        }
        return res.json()
      })
      .then((data) => {
        // 检查是否是默认数据（数据库未配置）
        if (data.prices.BTC === 0 && data.prices.ETH === 0) {
          setDbError(true)
        } else {
          setDbError(false)
        }
        setStats(data)
      })
      .catch((err) => {
        console.error('Failed to load stats:', err)
        setDbError(true)
        // 设置默认值，避免页面崩溃
        setStats({
          prices: { BTC: 0, ETH: 0 },
          netWorth: { USDT: 0, BTC: 0, ETH: 0, totalUSDT: 0 },
          initialTotalUSDT: 0,
          totalProfit: 0,
          totalProfitRate: 0,
          profitByPlatform: {},
        })
      })
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
        {/* 数据库未配置警告 */}
        {dbError && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>数据库未配置</strong> - 请在 Railway 上完成以下步骤：
                </p>
                <ol className="mt-2 text-sm text-yellow-700 list-decimal list-inside space-y-1">
                  <li>添加 PostgreSQL 数据库</li>
                  <li>配置环境变量 DATABASE_URL 和 CMC_API_KEY</li>
                  <li>运行命令：<code className="bg-yellow-100 px-1 rounded">npx prisma migrate deploy</code></li>
                </ol>
                <p className="mt-2 text-sm text-yellow-700">
                  详细步骤请查看：<a href="https://github.com/zhaoyidemo/option/blob/main/DEPLOYMENT.md" target="_blank" className="underline">DEPLOYMENT.md</a>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 价格获取失败警告 */}
        {stats?.priceError && !dbError && (
          <div className="mb-6 bg-orange-50 border-l-4 border-orange-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-orange-700">
                  <strong>无法获取实时价格</strong> - CMC API 调用失败。请检查：
                </p>
                <ul className="mt-2 text-sm text-orange-700 list-disc list-inside">
                  <li>CMC_API_KEY 环境变量是否正确配置</li>
                  <li>API 调用次数是否超过限额（免费版每月 10,000 次）</li>
                  <li>网络连接是否正常</li>
                </ul>
                <p className="mt-2 text-sm text-orange-700">
                  当前显示的资产数量是正确的，但总净值为 0（因为价格为 0）
                </p>
              </div>
            </div>
          </div>
        )}

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
