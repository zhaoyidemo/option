// 统计 API
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentPrices } from '@/lib/cmc'

// 计算当前资产净值
async function calculateNetWorth() {
  const assets = await prisma.asset.findMany()
  const trades = await prisma.trade.findMany()
  const prices = await getCurrentPrices()

  // 从初始资产开始
  const holdings: Record<string, number> = {}
  assets.forEach((asset) => {
    holdings[asset.currency] = asset.initialAmount
  })

  // 根据交易记录计算当前持仓
  trades.forEach((trade) => {
    if (trade.status === 'settled' && trade.outputAmount && trade.outputCurrency) {
      // 减去投入
      holdings[trade.inputCurrency] = (holdings[trade.inputCurrency] || 0) - trade.inputAmount

      // 加上产出
      holdings[trade.outputCurrency] = (holdings[trade.outputCurrency] || 0) + trade.outputAmount
    } else if (trade.status === 'pending') {
      // 待结算的交易，暂时减去投入（资金已锁定）
      holdings[trade.inputCurrency] = (holdings[trade.inputCurrency] || 0) - trade.inputAmount
    }
  })

  // 折算成 USDT
  const netWorth = {
    USDT: holdings.USDT || 0,
    BTC: holdings.BTC || 0,
    ETH: holdings.ETH || 0,
    totalUSDT:
      (holdings.USDT || 0) +
      (holdings.BTC || 0) * prices.BTC +
      (holdings.ETH || 0) * prices.ETH,
  }

  return { holdings, netWorth, prices }
}

// 计算收益统计
async function calculateProfitStats() {
  const assets = await prisma.asset.findMany()
  const trades = await prisma.trade.findMany()
  const prices = await getCurrentPrices()

  // 初始资产总值（折算成 USDT）
  let initialTotalUSDT = 0
  assets.forEach((asset) => {
    if (asset.currency === 'USDT') {
      initialTotalUSDT += asset.initialAmount
    } else if (asset.currency === 'BTC') {
      initialTotalUSDT += asset.initialAmount * prices.BTC
    } else if (asset.currency === 'ETH') {
      initialTotalUSDT += asset.initialAmount * prices.ETH
    }
  })

  // 当前净值
  const { netWorth } = await calculateNetWorth()

  // 总收益
  const totalProfit = netWorth.totalUSDT - initialTotalUSDT
  const totalProfitRate = initialTotalUSDT > 0 ? (totalProfit / initialTotalUSDT) * 100 : 0

  // 按平台统计收益
  const profitByPlatform: Record<string, number> = {}

  trades.forEach((trade) => {
    if (trade.status === 'settled' && trade.outputAmount && trade.inputAmount) {
      // 计算这笔交易的收益（折算成 USDT）
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
    initialTotalUSDT,
    totalProfit,
    totalProfitRate,
    profitByPlatform,
  }
}

// GET - 获取统计数据
export async function GET() {
  try {
    // 先尝试获取价格
    let prices
    try {
      prices = await getCurrentPrices()
    } catch (priceError) {
      console.error('Failed to fetch prices from CMC:', priceError)
      // 使用默认价格
      prices = { BTC: 0, ETH: 0 }
    }

    // 然后计算统计数据
    const netWorthData = await calculateNetWorth()
    const profitStats = await calculateProfitStats()

    return NextResponse.json({
      ...netWorthData,
      ...profitStats,
    })
  } catch (error) {
    console.error('Error calculating stats:', error)

    // 返回默认数据而不是错误，避免前端崩溃
    return NextResponse.json({
      prices: { BTC: 0, ETH: 0 },
      holdings: { USDT: 0, BTC: 0, ETH: 0 },
      netWorth: { USDT: 0, BTC: 0, ETH: 0, totalUSDT: 0 },
      initialTotalUSDT: 0,
      totalProfit: 0,
      totalProfitRate: 0,
      profitByPlatform: {},
    })
  }
}
