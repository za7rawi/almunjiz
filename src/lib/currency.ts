const SAR_TO_USD = 0.2667;

export function formatPrice(priceSAR: number, currency: 'SAR' | 'USD' = 'SAR'): string {
  if (currency === 'USD') {
    const usd = priceSAR * SAR_TO_USD;
    return `$${usd.toFixed(2)} USD`;
  }
  return `${priceSAR.toFixed(2)} ر.س`;
}

export function convertToUSD(priceSAR: number): number {
  return priceSAR * SAR_TO_USD;
}
