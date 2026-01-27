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
  // USDT 本位
  initialTotalUSDT: number
  currentTotalUSDT: number
  profitUSDT: number
  profitRateUSDT: number
  // ETH 本位
  initialTotalETH: number
  currentTotalETH: number
  profitETH: number
  profitRateETH: number
  // BTC 本位
  initialTotalBTC: number
  currentTotalBTC: number
  profitBTC: number
  profitRateBTC: number
  // 其他
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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetch('/api/stats')
      .then((res) => {
        if (!res.ok) {
          setDbError(true)
          throw new Error('API failed')
        }
        return res.json()
      })
      .then((data) => {
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
        setStats({
          prices: { BTC: 0, ETH: 0 },
          netWorth: { USDT: 0, BTC: 0, ETH: 0, totalUSDT: 0 },
          initialTotalUSDT: 0,
          currentTotalUSDT: 0,
          profitUSDT: 0,
          profitRateUSDT: 0,
          initialTotalETH: 0,
          currentTotalETH: 0,
          profitETH: 0,
          profitRateETH: 0,
          initialTotalBTC: 0,
          currentTotalBTC: 0,
          profitBTC: 0,
          profitRateBTC: 0,
          totalProfit: 0,
          totalProfitRate: 0,
          profitByPlatform: {},
        })
      })
      .finally(() => setIsLoading(false))
  }, [refreshKey])

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((k) => k + 1)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number, decimals = 2) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }

  const formatCompact = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K'
    }
    return num.toFixed(2)
  }

  return (
    <div className="min-h-screen grid-bg relative">
      {/* 顶部光效 */}
      <div className="top-glow" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8">
        {/* 警告提示 */}
        {dbError && (
          <div className="alert alert-warning mb-6 animate-slide-up">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-sm">
                <p className="font-semibold mb-1">数据库未配置</p>
                <p className="opacity-80">请在 Railway 上配置 PostgreSQL 数据库和环境变量</p>
              </div>
            </div>
          </div>
        )}

        {stats?.priceError && !dbError && (
          <div className="alert alert-error mb-6 animate-slide-up">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-sm">
                <p className="font-semibold mb-1">价格数据获取失败</p>
                <p className="opacity-80">CMC API 调用失败，请检查 API Key 配置</p>
              </div>
            </div>
          </div>
        )}

        {/* 头部 */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold gradient-text-gold tracking-tight">
              双币理财终端
            </h1>
            <p className="text-[var(--text-muted)] text-sm mt-1">收益追踪与管理平台</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="live-indicator mr-2">实时</div>
            <button onClick={() => setShowAssetConfig(true)} className="btn-secondary">
              资产配置
            </button>
            <button onClick={() => setShowNewTrade(true)} className="btn-primary">
              + 新建交易
            </button>
          </div>
        </header>

        {/* 主数据面板 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 总净值卡片 - 占两列 */}
          <div className="lg:col-span-2 card p-6 border-glow-gold">
            <div className="flex items-center justify-between mb-6">
              <div className="data-label">总净值</div>
              <span className="tag tag-pending text-xs">含锁定资产</span>
            </div>

            {isLoading ? (
              <div className="skeleton h-16 w-64 rounded mb-6" />
            ) : stats ? (
              <div className="mb-6">
                <div className="text-4xl md:text-5xl font-bold font-mono gradient-text-gold tracking-tight">
                  ${formatNumber(stats.netWorth.totalUSDT)}
                </div>
                <div className="text-[var(--text-muted)] text-sm mt-2">
                  ≈ ¥{formatNumber(stats.netWorth.totalUSDT * 7.2)}
                </div>
              </div>
            ) : null}

            {/* 资产明细 */}
            {stats && (
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--border-color)]">
                {/* USDT */}
                <div className="data-cell">
                  <span className="data-label">USDT</span>
                  <span className="data-value data-value-sm font-mono">
                    {formatCompact(stats.netWorth.total?.USDT ?? stats.netWorth.USDT)}
                  </span>
                </div>
                {/* BTC */}
                <div className="data-cell">
                  <span className="data-label">BTC</span>
                  <span className="data-value data-value-sm font-mono text-[#f7931a]">
                    {formatNumber(stats.netWorth.total?.BTC ?? stats.netWorth.BTC, 4)}
                  </span>
                </div>
                {/* ETH */}
                <div className="data-cell">
                  <span className="data-label">ETH</span>
                  <span className="data-value data-value-sm font-mono text-[#627eea]">
                    {formatNumber(stats.netWorth.total?.ETH ?? stats.netWorth.ETH, 4)}
                  </span>
                </div>
              </div>
            )}

            {/* 锁定资产 */}
            {stats?.netWorth.locked && (stats.netWorth.locked.USDT > 0 || stats.netWorth.locked.BTC > 0 || stats.netWorth.locked.ETH > 0) && (
              <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
                <div className="data-label mb-3 text-[var(--warning)]">🔒 双币理财锁定中</div>
                <div className="flex flex-wrap gap-4 text-sm">
                  {stats.netWorth.locked.USDT > 0 && (
                    <span className="text-[var(--warning)] font-mono">
                      {formatNumber(stats.netWorth.locked.USDT)} USDT
                    </span>
                  )}
                  {stats.netWorth.locked.BTC > 0 && (
                    <span className="text-[var(--warning)] font-mono">
                      {formatNumber(stats.netWorth.locked.BTC, 6)} BTC
                    </span>
                  )}
                  {stats.netWorth.locked.ETH > 0 && (
                    <span className="text-[var(--warning)] font-mono">
                      {formatNumber(stats.netWorth.locked.ETH, 6)} ETH
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 实时价格卡片 */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="data-label">实时价格</div>
              <div className="live-indicator">实时</div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <div className="skeleton h-12 w-full rounded" />
                <div className="skeleton h-12 w-full rounded" />
              </div>
            ) : stats ? (
              <div className="space-y-4">
                {/* BTC 价格 */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f7931a]/20 flex items-center justify-center">
                      <span className="text-[#f7931a] font-bold text-sm">₿</span>
                    </div>
                    <div>
                      <div className="font-semibold">比特币</div>
                      <div className="text-xs text-[var(--text-muted)]">BTC</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-lg text-[#f7931a]">
                      ${formatNumber(stats.prices.BTC)}
                    </div>
                  </div>
                </div>

                {/* ETH 价格 */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#627eea]/20 flex items-center justify-center">
                      <span className="text-[#627eea] font-bold text-sm">Ξ</span>
                    </div>
                    <div>
                      <div className="font-semibold">以太坊</div>
                      <div className="text-xs text-[var(--text-muted)]">ETH</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-lg text-[#627eea]">
                      ${formatNumber(stats.prices.ETH)}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* 收益概览 - 三种本位 */}
        <div className="card p-6 mb-8">
          <div className="data-label mb-6">收益概览</div>

          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton h-24 rounded" />
              ))}
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* USDT 本位 */}
              <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                <div className="flex items-center gap-2 mb-4">
                  <span className="tag tag-pending">USDT 本位</span>
                  <span className="text-xs text-[var(--text-muted)]">以美元稳定币计价</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="data-cell">
                    <span className="data-label">初始本金</span>
                    <span className="data-value data-value-sm font-mono">
                      ${formatCompact(stats.initialTotalUSDT)}
                    </span>
                  </div>
                  <div className="data-cell">
                    <span className="data-label">当前净值</span>
                    <span className="data-value data-value-sm font-mono">
                      ${formatCompact(stats.currentTotalUSDT)}
                    </span>
                  </div>
                  <div className="data-cell">
                    <span className="data-label">累计盈亏</span>
                    <span className={`data-value data-value-sm font-mono ${stats.profitUSDT >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                      {stats.profitUSDT >= 0 ? '+' : ''}{formatCompact(stats.profitUSDT)}
                    </span>
                  </div>
                  <div className="data-cell">
                    <span className="data-label">收益率</span>
                    <span className={`data-value data-value-sm font-mono ${stats.profitRateUSDT >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                      {stats.profitRateUSDT >= 0 ? '+' : ''}{formatNumber(stats.profitRateUSDT)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* ETH 本位 */}
              <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[#627eea]/30">
                <div className="flex items-center gap-2 mb-4">
                  <span className="tag tag-eth">ETH 本位</span>
                  <span className="text-xs text-[var(--text-muted)]">以以太坊计价</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="data-cell">
                    <span className="data-label">初始本金</span>
                    <span className="data-value data-value-sm font-mono text-[#627eea]">
                      {formatNumber(stats.initialTotalETH, 4)} ETH
                    </span>
                  </div>
                  <div className="data-cell">
                    <span className="data-label">当前净值</span>
                    <span className="data-value data-value-sm font-mono text-[#627eea]">
                      {formatNumber(stats.currentTotalETH, 4)} ETH
                    </span>
                  </div>
                  <div className="data-cell">
                    <span className="data-label">累计盈亏</span>
                    <span className={`data-value data-value-sm font-mono ${stats.profitETH >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                      {stats.profitETH >= 0 ? '+' : ''}{formatNumber(stats.profitETH, 4)} ETH
                    </span>
                  </div>
                  <div className="data-cell">
                    <span className="data-label">收益率</span>
                    <span className={`data-value data-value-sm font-mono ${stats.profitRateETH >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                      {stats.profitRateETH >= 0 ? '+' : ''}{formatNumber(stats.profitRateETH)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* BTC 本位 */}
              <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[#f7931a]/30">
                <div className="flex items-center gap-2 mb-4">
                  <span className="tag tag-btc">BTC 本位</span>
                  <span className="text-xs text-[var(--text-muted)]">以比特币计价</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="data-cell">
                    <span className="data-label">初始本金</span>
                    <span className="data-value data-value-sm font-mono text-[#f7931a]">
                      {formatNumber(stats.initialTotalBTC, 6)} BTC
                    </span>
                  </div>
                  <div className="data-cell">
                    <span className="data-label">当前净值</span>
                    <span className="data-value data-value-sm font-mono text-[#f7931a]">
                      {formatNumber(stats.currentTotalBTC, 6)} BTC
                    </span>
                  </div>
                  <div className="data-cell">
                    <span className="data-label">累计盈亏</span>
                    <span className={`data-value data-value-sm font-mono ${stats.profitBTC >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                      {stats.profitBTC >= 0 ? '+' : ''}{formatNumber(stats.profitBTC, 6)} BTC
                    </span>
                  </div>
                  <div className="data-cell">
                    <span className="data-label">收益率</span>
                    <span className={`data-value data-value-sm font-mono ${stats.profitRateBTC >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                      {stats.profitRateBTC >= 0 ? '+' : ''}{formatNumber(stats.profitRateBTC)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* 按平台统计 */}
          {stats && Object.keys(stats.profitByPlatform).length > 0 && (
            <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
              <div className="data-label mb-4">平台收益（USDT 本位）</div>
              <div className="flex flex-wrap gap-6">
                {Object.entries(stats.profitByPlatform).map(([platform, profit]) => (
                  <div key={platform} className="flex items-center gap-3">
                    <span className={`tag ${platform === 'binance' ? 'tag-binance' : 'tag-okx'}`}>
                      {platform === 'binance' ? '币安' : '欧易'}
                    </span>
                    <span className={`font-mono font-semibold ${profit >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                      {profit >= 0 ? '+' : ''}{formatNumber(profit)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 交易列表 */}
        <TradeList onRefresh={() => setRefreshKey((k) => k + 1)} />

        {/* 模态框 */}
        {showNewTrade && (
          <NewTradeForm
            onClose={() => setShowNewTrade(false)}
            onSuccess={() => {
              setShowNewTrade(false)
              setRefreshKey((k) => k + 1)
            }}
          />
        )}

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
