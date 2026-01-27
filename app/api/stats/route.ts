// 统计 API
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentPrices } from '@/lib/cmc'

// 计算当前资产净值
async function calculateNetWorth(prices: { BTC: number; ETH: number }) {
  const assets = await prisma.asset.findMany()
  const trades = await prisma.trade.findMany()

  // 从初始资产开始
  const holdings: Record<string, number> = {
    USDT: 0,
    BTC: 0,
    ETH: 0,
  }

  // 锁定资产（pending 交易）
  const locked: Record<string, number> = {
    USDT: 0,
    BTC: 0,
    ETH: 0,
  }

  // 初始资产
  assets.forEach((asset) => {
    holdings[asset.currency] = asset.initialAmount
  })

  // 根据交易记录计算当前持仓
  trades.forEach((trade) => {
    if (trade.status === 'settled' && trade.outputAmount && trade.outputCurrency) {
      // 已结算：减去投入，加上产出
      holdings[trade.inputCurrency] = (holdings[trade.inputCurrency] || 0) - trade.inputAmount
      holdings[trade.outputCurrency] = (holdings[trade.outputCurrency] || 0) + trade.outputAmount
    } else if (trade.status === 'pending') {
      // 待结算：从可用资产移到锁定资产
      holdings[trade.inputCurrency] = (holdings[trade.inputCurrency] || 0) - trade.inputAmount
      locked[trade.inputCurrency] = (locked[trade.inputCurrency] || 0) + trade.inputAmount
    }
  })

  // 总持仓 = 可用 + 锁定
  const totalHoldings = {
    USDT: holdings.USDT + locked.USDT,
    BTC: holdings.BTC + locked.BTC,
    ETH: holdings.ETH + locked.ETH,
  }

  // 计算全部行权后的资产
  const exercisedHoldings: Record<string, number> = {
    USDT: holdings.USDT,
    BTC: holdings.BTC,
    ETH: holdings.ETH,
  }

  // 对每笔 pending 交易，计算行权后的资产
  trades.forEach((trade) => {
    if (trade.status === 'pending') {
      // 行权后得到 exerciseAmount 的 exerciseCurrency
      exercisedHoldings[trade.exerciseCurrency] =
        (exercisedHoldings[trade.exerciseCurrency] || 0) + trade.exerciseAmount
    }
  })

  // 全部行权后的 USDT 价值
  const exercisedTotalUSDT =
    exercisedHoldings.USDT +
    exercisedHoldings.BTC * prices.BTC +
    exercisedHoldings.ETH * prices.ETH

  // 折算成 USDT
  const netWorth = {
    USDT: holdings.USDT,
    BTC: holdings.BTC,
    ETH: holdings.ETH,
    locked,  // 锁定资产
    total: totalHoldings,  // 总持仓
    totalUSDT:
      totalHoldings.USDT +
      totalHoldings.BTC * prices.BTC +
      totalHoldings.ETH * prices.ETH,
    exercisedTotalUSDT,  // 全部行权后的价值
  }

  return { holdings, netWorth, prices }
}

// 初始本金固定价格（2026年1月27日）
const INITIAL_PRICES = {
  BTC: 88200,
  ETH: 2925,
  date: '2026-01-27',
}

// 计算三种本位的收益统计
async function calculateProfitStats(prices: { BTC: number; ETH: number }, netWorth: any) {
  const assets = await prisma.asset.findMany()
  const trades = await prisma.trade.findMany()

  // 初始资产（原始数量）
  const initialAssets = {
    USDT: 0,
    BTC: 0,
    ETH: 0,
  }
  assets.forEach((asset) => {
    initialAssets[asset.currency as keyof typeof initialAssets] = asset.initialAmount
  })

  // 当前总持仓
  const currentAssets = netWorth.total

  // ========== USDT 本位计算 ==========
  // 初始本金使用固定价格（2026年1月27日）
  const initialTotalUSDT =
    initialAssets.USDT +
    initialAssets.BTC * INITIAL_PRICES.BTC +
    initialAssets.ETH * INITIAL_PRICES.ETH

  const currentTotalUSDT =
    currentAssets.USDT +
    currentAssets.BTC * prices.BTC +
    currentAssets.ETH * prices.ETH

  const profitUSDT = currentTotalUSDT - initialTotalUSDT
  const profitRateUSDT = initialTotalUSDT > 0 ? (profitUSDT / initialTotalUSDT) * 100 : 0

  // ========== ETH 本位计算 ==========
  // 初始本金使用固定价格
  const initialTotalETH =
    initialAssets.ETH +
    initialAssets.USDT / INITIAL_PRICES.ETH +
    initialAssets.BTC * INITIAL_PRICES.BTC / INITIAL_PRICES.ETH

  const currentTotalETH =
    currentAssets.ETH +
    currentAssets.USDT / ethPrice +
    currentAssets.BTC * prices.BTC / ethPrice

  const profitETH = currentTotalETH - initialTotalETH
  const profitRateETH = initialTotalETH > 0 ? (profitETH / initialTotalETH) * 100 : 0

  // ========== BTC 本位计算 ==========
  // 初始本金使用固定价格
  const initialTotalBTC =
    initialAssets.BTC +
    initialAssets.USDT / INITIAL_PRICES.BTC +
    initialAssets.ETH * INITIAL_PRICES.ETH / INITIAL_PRICES.BTC

  const currentTotalBTC =
    currentAssets.BTC +
    currentAssets.USDT / btcPrice +
    currentAssets.ETH * prices.ETH / btcPrice

  const profitBTC = currentTotalBTC - initialTotalBTC
  const profitRateBTC = initialTotalBTC > 0 ? (profitBTC / initialTotalBTC) * 100 : 0

  // 按平台统计收益（USDT本位）
  const profitByPlatform: Record<string, number> = {}

  trades.forEach((trade) => {
    if (trade.status === 'settled' && trade.outputAmount && trade.inputAmount) {
      let profit = 0

      if (trade.outputCurrency === 'USDT') {
        profit = trade.outputAmount
      } else if (trade.outputCurrency === 'BTC') {
        profit = trade.outputAmount * prices.BTC
      } else if (trade.outputCurrency === 'ETH') {
        profit = trade.outputAmount * prices.ETH
      }

      if (trade.inputCurrency === 'USDT') {
        profit -= trade.inputAmount
      } else if (trade.inputCurrency === 'BTC') {
        profit -= trade.inputAmount * prices.BTC
      } else if (trade.inputCurrency === 'ETH') {
        profit -= trade.inputAmount * prices.ETH
      }

      profitByPlatform[trade.platform] = (profitByPlatform[trade.platform] || 0) + profit
    }
  })

  return {
    // USDT 本位
    initialTotalUSDT,
    currentTotalUSDT,
    profitUSDT,
    profitRateUSDT,
    // ETH 本位
    initialTotalETH,
    currentTotalETH,
    profitETH,
    profitRateETH,
    // BTC 本位
    initialTotalBTC,
    currentTotalBTC,
    profitBTC,
    profitRateBTC,
    // 初始价格信息
    initialPrices: INITIAL_PRICES,
    // 平台收益
    profitByPlatform,
    // 兼容旧字段
    totalProfit: profitUSDT,
    totalProfitRate: profitRateUSDT,
  }
}

// GET - 获取统计数据
export async function GET() {
  try {
    // 先尝试获取价格
    let prices = { BTC: 0, ETH: 0 }
    let priceError = false

    try {
      prices = await getCurrentPrices()
      console.log('CMC prices fetched successfully:', prices)
    } catch (error) {
      console.error('Failed to fetch prices from CMC:', error)
      priceError = true
    }

    // 计算统计数据
    const netWorthData = await calculateNetWorth(prices)
    const profitStats = await calculateProfitStats(prices, netWorthData.netWorth)

    return NextResponse.json({
      ...netWorthData,
      ...profitStats,
      priceError,
    })
  } catch (error) {
    console.error('Error calculating stats:', error)

    return NextResponse.json({
      prices: { BTC: 0, ETH: 0 },
      holdings: { USDT: 0, BTC: 0, ETH: 0 },
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
      priceError: true,
    })
  }
}
