// 交易结算逻辑
import { prisma } from './prisma'
import { getPriceAtTime } from './cmc'

// 结算单个交易
export async function settleTrade(tradeId: string) {
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
  })

  if (!trade || trade.status === 'settled') {
    return null
  }

  // 获取结算价格
  const settlementPrice = await getPriceAtTime(trade.coin as 'BTC' | 'ETH', trade.expiryTime)

  // 判断是否行权
  let exercised = false
  let outputAmount = 0
  let outputCurrency = ''

  if (trade.direction === 'buy_low') {
    // 低买：看跌期权，价格 < 行权价 → 行权（得币）
    exercised = settlementPrice < trade.strikePrice
    if (exercised) {
      outputAmount = trade.exerciseAmount
      outputCurrency = trade.exerciseCurrency
    } else {
      // 未行权，得本金 + 收益
      outputAmount = trade.inputAmount + trade.premium
      outputCurrency = trade.inputCurrency
    }
  } else {
    // 高卖：看涨期权，价格 > 行权价 → 行权（得 USDT）
    exercised = settlementPrice > trade.strikePrice
    if (exercised) {
      outputAmount = trade.exerciseAmount
      outputCurrency = trade.exerciseCurrency
    } else {
      // 未行权，得本金 + 收益
      outputAmount = trade.inputAmount + trade.premium
      outputCurrency = trade.inputCurrency
    }
  }

  // 更新交易记录
  const updatedTrade = await prisma.trade.update({
    where: { id: tradeId },
    data: {
      status: 'settled',
      exercised,
      settlementPrice,
      outputAmount,
      outputCurrency,
      settledAt: new Date(),
    },
  })

  return updatedTrade
}

// 批量结算到期交易
export async function settlePendingTrades() {
  const now = new Date()

  // 查找所有待结算的到期交易
  const pendingTrades = await prisma.trade.findMany({
    where: {
      status: 'pending',
      expiryTime: {
        lte: now,
      },
    },
  })

  console.log(`Found ${pendingTrades.length} trades to settle`)

  // 逐个结算
  const results = []
  for (const trade of pendingTrades) {
    try {
      const settled = await settleTrade(trade.id)
      results.push(settled)
      console.log(`Settled trade ${trade.id}: ${settled?.exercised ? 'Exercised' : 'Not exercised'}`)
    } catch (error) {
      console.error(`Error settling trade ${trade.id}:`, error)
    }
  }

  return results
}
