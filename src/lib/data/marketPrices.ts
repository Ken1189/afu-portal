export interface CommodityPrice {
  crop: string;
  currentPrice: number;
  currency: string;
  unit: string;
  change24h: number;
  change7d: number;
  prices: number[];
  icon: string;
}

export const marketPrices: CommodityPrice[] = [
  {
    crop: 'Blueberries', currentPrice: 12.50, currency: 'USD', unit: 'kg', change24h: 0.8, change7d: 3.2, icon: '🫐',
    prices: [11.20, 11.35, 11.50, 11.40, 11.60, 11.55, 11.70, 11.80, 11.75, 11.90, 12.00, 11.95, 12.10, 12.05, 12.20, 12.15, 12.30, 12.25, 12.10, 12.20, 12.35, 12.40, 12.30, 12.45, 12.50, 12.40, 12.55, 12.60, 12.45, 12.50],
  },
  {
    crop: 'Cassava', currentPrice: 0.15, currency: 'USD', unit: 'kg', change24h: -0.3, change7d: -1.1, icon: '🌿',
    prices: [0.16, 0.16, 0.16, 0.15, 0.16, 0.16, 0.15, 0.15, 0.16, 0.15, 0.15, 0.16, 0.15, 0.15, 0.15, 0.16, 0.15, 0.15, 0.15, 0.15, 0.16, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15],
  },
  {
    crop: 'Sesame', currentPrice: 2.80, currency: 'USD', unit: 'kg', change24h: 0.2, change7d: 0.5, icon: '🌾',
    prices: [2.65, 2.68, 2.70, 2.67, 2.72, 2.70, 2.73, 2.75, 2.72, 2.74, 2.76, 2.73, 2.75, 2.78, 2.76, 2.74, 2.77, 2.75, 2.78, 2.76, 2.79, 2.77, 2.80, 2.78, 2.76, 2.79, 2.78, 2.80, 2.79, 2.80],
  },
  {
    crop: 'Maize', currentPrice: 0.28, currency: 'USD', unit: 'kg', change24h: 0.5, change7d: 1.8, icon: '🌽',
    prices: [0.25, 0.25, 0.26, 0.25, 0.26, 0.26, 0.26, 0.27, 0.26, 0.27, 0.27, 0.26, 0.27, 0.27, 0.27, 0.28, 0.27, 0.27, 0.28, 0.27, 0.28, 0.28, 0.27, 0.28, 0.28, 0.28, 0.28, 0.27, 0.28, 0.28],
  },
  {
    crop: 'Sorghum', currentPrice: 0.32, currency: 'USD', unit: 'kg', change24h: -0.1, change7d: 0.3, icon: '🌿',
    prices: [0.30, 0.30, 0.31, 0.30, 0.31, 0.31, 0.31, 0.31, 0.31, 0.32, 0.31, 0.31, 0.32, 0.31, 0.32, 0.32, 0.31, 0.32, 0.32, 0.32, 0.32, 0.31, 0.32, 0.32, 0.32, 0.32, 0.32, 0.32, 0.32, 0.32],
  },
  {
    crop: 'Groundnuts', currentPrice: 1.45, currency: 'USD', unit: 'kg', change24h: 0.3, change7d: 1.2, icon: '🥜',
    prices: [1.32, 1.33, 1.35, 1.34, 1.36, 1.35, 1.37, 1.36, 1.38, 1.37, 1.38, 1.39, 1.38, 1.40, 1.39, 1.40, 1.41, 1.40, 1.42, 1.41, 1.42, 1.43, 1.42, 1.43, 1.44, 1.43, 1.44, 1.45, 1.44, 1.45],
  },
];
