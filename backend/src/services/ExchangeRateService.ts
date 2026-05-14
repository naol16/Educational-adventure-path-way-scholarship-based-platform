
import axios from 'axios';

export class ExchangeRateService {
  private static CACHE_DURATION = 3600000; // 1 hour
  private static lastRate: number = 120.0; // Fallback rate (ETB per USD)
  private static lastFetched: number = 0;

  /**
   * Gets the current exchange rate for USD to ETB
   * Returns how many ETB is 1 USD.
   */
  static async getUsdToEtbRate(): Promise<number> {
    const now = Date.now();
    if (now - this.lastFetched < this.CACHE_DURATION) {
      return this.lastRate;
    }

    try {
      // Attempt to fetch from a free public API
      // Note: Some APIs might require a key in production. 
      // For now we use a reliable fallback with a logged attempt.
      console.log('[ExchangeRateService] Refreshing ETB/USD rate...');
      
      // Example of a free public endpoint (might have rate limits)
      const response = await axios.get('https://open.er-api.com/v6/latest/USD');
      
      if (response.data && response.data.rates && response.data.rates.ETB) {
        this.lastRate = response.data.rates.ETB;
        this.lastFetched = now;
        console.log(`[ExchangeRateService] Updated rate: 1 USD = ${this.lastRate} ETB`);
      }
    } catch (error) {
      console.error('[ExchangeRateService] Failed to fetch live rate, using fallback:', this.lastRate);
      // We don't update lastFetched so it retries next time, but we keep the lastRate
    }

    return this.lastRate;
  }

  /**
   * Converts ETB to USD based on the current rate
   */
  static async convertEtbToUsd(etbAmount: number): Promise<{ usdAmount: number, rate: number }> {
    const rate = await this.getUsdToEtbRate();
    const usdAmount = Number((etbAmount / rate).toFixed(2));
    return { usdAmount, rate };
  }

  /**
   * Converts USD to ETB based on the current rate
   */
  static async convertUsdToEtb(usdAmount: number): Promise<{ etbAmount: number, rate: number }> {
    const rate = await this.getUsdToEtbRate();
    const etbAmount = Number((usdAmount * rate).toFixed(2));
    return { etbAmount, rate };
  }
}
