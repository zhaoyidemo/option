// 调试 API - 查看详细计算过程
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const assets = await prisma.asset.findMany()
    const trades = await prisma.trade.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // 计算锁定资产
    const locked: Record<string, number> = { USDT: 0, BTC: 0, ETH: 0 }
    const pendingTrades: any[] = []

    trades.forEach((trade) => {
      if (trade.status === 'pending') {
        locked[trade.inputCurrency] = (locked[trade.inputCurrency] || 0) + trade.inputAmount
        pendingTrades.push({
          id: trade.id,
          direction: trade.direction,
          inputAmount: trade.inputAmount,
          inputCurrency: trade.inputCurrency,
          coin: trade.coin,
          status: trade.status,
        })
      }
    })

    return NextResponse.json({
      assets,
      totalTrades: trades.length,
      pendingTradesCount: pendingTrades.length,
      settledTradesCount: trades.filter(t => t.status === 'settled').length,
      pendingTrades,
      calculatedLocked: locked,
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
