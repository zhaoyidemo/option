// 交易 API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - 获取所有交易
export async function GET() {
  try {
    const trades = await prisma.trade.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        parent: true,
        children: true,
      },
    })

    return NextResponse.json(trades)
  } catch (error) {
    console.error('Error fetching trades:', error)
    return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 })
  }
}

// 将北京时间字符串转换为 Date 对象
function parseBeijingTime(timeStr: string): Date {
  // datetime-local 格式: "2024-01-15T16:00"
  // 添加北京时区 +08:00 后解析
  return new Date(timeStr + '+08:00')
}

// POST - 创建新交易
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 将用户输入的北京时间正确转换
    const expiryTime = parseBeijingTime(body.expiryTime)

    const trade = await prisma.trade.create({
      data: {
        platform: body.platform,
        coin: body.coin,
        direction: body.direction,
        inputAmount: parseFloat(body.inputAmount),
        inputCurrency: body.inputCurrency,
        strikePrice: parseFloat(body.strikePrice),
        expiryTime: expiryTime,
        apr: parseFloat(body.apr),
        premium: parseFloat(body.premium),
        exerciseAmount: parseFloat(body.exerciseAmount),
        exerciseCurrency: body.exerciseCurrency,
        parentId: body.parentId || null,
      },
    })

    return NextResponse.json(trade)
  } catch (error) {
    console.error('Error creating trade:', error)
    return NextResponse.json({ error: 'Failed to create trade' }, { status: 500 })
  }
}

// DELETE - 删除交易
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Trade ID is required' }, { status: 400 })
    }

    await prisma.trade.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting trade:', error)
    return NextResponse.json({ error: 'Failed to delete trade' }, { status: 500 })
  }
}
