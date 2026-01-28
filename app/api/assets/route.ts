// 资产 API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 禁用缓存
export const dynamic = 'force-dynamic'

// GET - 获取所有资产
export async function GET() {
  try {
    const assets = await prisma.asset.findMany()
    return NextResponse.json(assets)
  } catch (error) {
    console.error('Error fetching assets:', error)
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 })
  }
}

// POST - 创建或更新资产
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 检查是否已存在该币种的资产
    const existing = await prisma.asset.findFirst({
      where: { currency: body.currency },
    })

    let asset
    if (existing) {
      // 更新
      asset = await prisma.asset.update({
        where: { id: existing.id },
        data: { initialAmount: parseFloat(body.initialAmount) },
      })
    } else {
      // 创建
      asset = await prisma.asset.create({
        data: {
          currency: body.currency,
          initialAmount: parseFloat(body.initialAmount),
        },
      })
    }

    return NextResponse.json(asset)
  } catch (error) {
    console.error('Error saving asset:', error)
    return NextResponse.json({ error: 'Failed to save asset' }, { status: 500 })
  }
}
