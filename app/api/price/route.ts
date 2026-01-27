// 价格 API
import { NextResponse } from 'next/server'
import { getCurrentPrices } from '@/lib/cmc'

// GET - 获取当前价格
export async function GET() {
  try {
    const prices = await getCurrentPrices()
    return NextResponse.json(prices)
  } catch (error) {
    console.error('Error fetching prices:', error)
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 })
  }
}
