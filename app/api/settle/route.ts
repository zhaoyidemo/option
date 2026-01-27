// 结算 API
import { NextResponse } from 'next/server'
import { settlePendingTrades } from '@/lib/settlement'

// POST - 手动触发结算
export async function POST() {
  try {
    const results = await settlePendingTrades()
    return NextResponse.json({
      success: true,
      settled: results.length,
      results,
    })
  } catch (error) {
    console.error('Error settling trades:', error)
    return NextResponse.json({ error: 'Failed to settle trades' }, { status: 500 })
  }
}
