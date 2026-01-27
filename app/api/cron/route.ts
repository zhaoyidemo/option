// Cron 任务端点 - 用于定时结算
import { NextResponse } from 'next/server'
import { settlePendingTrades } from '@/lib/settlement'

export async function GET() {
  try {
    console.log('Running settlement cron job...')
    const results = await settlePendingTrades()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      settled: results.length,
      results,
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Cron job failed',
      },
      { status: 500 }
    )
  }
}
