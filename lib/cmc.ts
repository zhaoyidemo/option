// CoinMarketCap API 客户端
import axios from 'axios'

const CMC_API_KEY = process.env.CMC_API_KEY || ''
const CMC_BASE_URL = 'https://pro-api.coinmarketcap.com/v1'

// 获取 BTC 和 ETH 的实时价格
export async function getCurrentPrices(): Promise<{
  BTC: number
  ETH: number
}> {
  try {
    const response = await axios.get(`${CMC_BASE_URL}/cryptocurrency/quotes/latest`, {
      params: {
        symbol: 'BTC,ETH',
        convert: 'USD',
      },
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
      },
    })

    const btcPrice = response.data.data.BTC.quote.USD.price
    const ethPrice = response.data.data.ETH.quote.USD.price

    return {
      BTC: btcPrice,
      ETH: ethPrice,
    }
  } catch (error) {
    console.error('Error fetching CMC prices:', error)
    throw new Error('Failed to fetch prices from CoinMarketCap')
  }
}

// 获取指定时间的价格（用于结算）
// 注意：CMC 免费版只能获取实时价格，这里实际上也是获取当前价格
export async function getPriceAtTime(coin: 'BTC' | 'ETH', _timestamp: Date): Promise<number> {
  const prices = await getCurrentPrices()
  return prices[coin]
}
