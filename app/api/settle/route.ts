// 结算 API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentPrices } from '@/lib/cmc'

// 禁用缓存
export const dynamic = 'force-dynamic'

// POST - 手动结算单笔交易
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tradeId, exercised } = body

    if (!tradeId || exercised === undefined) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    // 获取交易记录
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
    })

    if (!trade) {
      return NextResponse.json({ error: '交易不存在' }, { status: 404 })
    }

    if (trade.status === 'settled') {
      return NextResponse.json({ error: '交易已结算' }, { status: 400 })
    }

    // 获取当前价格作为结算价格
    let settlementPrice = 0
    try {
      const prices = await getCurrentPrices()
      settlementPrice = trade.coin === 'BTC' ? prices.BTC : prices.ETH
    } catch (error) {
      console.error('Failed to fetch price for settlement:', error)
    }

    // 计算结算结果
    let outputAmount = 0
    let outputCurrency = ''

    if (exercised) {
      // 行权：得到 exerciseAmount 的 exerciseCurrency
      outputAmount = trade.exerciseAmount
      outputCurrency = trade.exerciseCurrency
    } else {
      // 未行权：得到本金 + 收益
      outputAmount = trade.inputAmount + trade.premium
      outputCurrency = trade.inputCurrency
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

    return NextResponse.json({
      success: true,
      trade: updatedTrade,
    })
  } catch (error) {
    console.error('Error settling trade:', error)
    return NextResponse.json({ error: '结算失败' }, { status: 500 })
  }
}
