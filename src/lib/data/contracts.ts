export interface OfftakeContract {
  id: string;
  buyer: string;
  buyerLogo?: string;
  crop: string;
  volume: number;
  volumeUnit: string;
  pricePerKg: number;
  currency: string;
  contractPeriod: { start: string; end: string };
  deliveredVolume: number;
  deliveredPercentage: number;
  qualityGrade: 'A' | 'B' | 'C';
  status: 'active' | 'completed' | 'pending-renewal';
  country: string;
  memberId: string;
  memberName: string;
  nextDeliveryDate: string;
  incoterm: string;
}

export const contracts: OfftakeContract[] = [
  { id: 'OFT-001', buyer: 'Berry Fresh UK', crop: 'Blueberries', volume: 50000, volumeUnit: 'kg', pricePerKg: 12.50, currency: 'USD', contractPeriod: { start: '2026-01-01', end: '2026-12-31' }, deliveredVolume: 12500, deliveredPercentage: 25, qualityGrade: 'A', status: 'active', country: 'Zimbabwe', memberId: 'AFU-2024-005', memberName: 'Grace Moyo', nextDeliveryDate: '2026-03-25', incoterm: 'FOB Harare' },
  { id: 'OFT-002', buyer: 'EuroFruit GmbH', crop: 'Blueberries', volume: 30000, volumeUnit: 'kg', pricePerKg: 11.80, currency: 'EUR', contractPeriod: { start: '2026-02-01', end: '2026-11-30' }, deliveredVolume: 5400, deliveredPercentage: 18, qualityGrade: 'A', status: 'active', country: 'Zimbabwe', memberId: 'AFU-2024-018', memberName: 'Amina Salim', nextDeliveryDate: '2026-04-01', incoterm: 'CIF Frankfurt' },
  { id: 'OFT-003', buyer: 'Dubai Fresh Markets', crop: 'Sesame', volume: 200000, volumeUnit: 'kg', pricePerKg: 2.80, currency: 'USD', contractPeriod: { start: '2025-10-01', end: '2026-09-30' }, deliveredVolume: 110000, deliveredPercentage: 55, qualityGrade: 'B', status: 'active', country: 'Tanzania', memberId: 'AFU-2024-041', memberName: 'Baraka Mushi', nextDeliveryDate: '2026-03-30', incoterm: 'FOB Dar es Salaam' },
  { id: 'OFT-004', buyer: 'Tesco Direct', crop: 'Blueberries', volume: 25000, volumeUnit: 'kg', pricePerKg: 13.20, currency: 'GBP', contractPeriod: { start: '2026-03-01', end: '2026-08-31' }, deliveredVolume: 0, deliveredPercentage: 0, qualityGrade: 'A', status: 'active', country: 'Zimbabwe', memberId: 'AFU-2024-033', memberName: 'Nyasha Mutasa', nextDeliveryDate: '2026-04-10', incoterm: 'DDP London' },
  { id: 'OFT-005', buyer: 'Woolworths SA', crop: 'Blueberries', volume: 15000, volumeUnit: 'kg', pricePerKg: 10.50, currency: 'ZAR', contractPeriod: { start: '2025-06-01', end: '2026-05-31' }, deliveredVolume: 13200, deliveredPercentage: 88, qualityGrade: 'A', status: 'active', country: 'Zimbabwe', memberId: 'AFU-2024-022', memberName: 'Farai Ndlovu', nextDeliveryDate: '2026-04-05', incoterm: 'FOB Harare' },
  { id: 'OFT-006', buyer: 'Carrefour Africa', crop: 'Cassava', volume: 500000, volumeUnit: 'kg', pricePerKg: 0.18, currency: 'USD', contractPeriod: { start: '2025-07-01', end: '2026-06-30' }, deliveredVolume: 425000, deliveredPercentage: 85, qualityGrade: 'B', status: 'active', country: 'Tanzania', memberId: 'AFU-2024-048', memberName: 'Juma Abdallah', nextDeliveryDate: '2026-03-20', incoterm: 'EXW Dodoma' },
  { id: 'OFT-007', buyer: 'Metro AG', crop: 'Sesame', volume: 100000, volumeUnit: 'kg', pricePerKg: 3.10, currency: 'EUR', contractPeriod: { start: '2025-04-01', end: '2026-03-31' }, deliveredVolume: 98500, deliveredPercentage: 98, qualityGrade: 'A', status: 'pending-renewal', country: 'Tanzania', memberId: 'AFU-2024-031', memberName: 'Halima Mwanga', nextDeliveryDate: '2026-03-20', incoterm: 'CIF Hamburg' },
  { id: 'OFT-008', buyer: 'Marks & Spencer', crop: 'Blueberries', volume: 20000, volumeUnit: 'kg', pricePerKg: 14.00, currency: 'GBP', contractPeriod: { start: '2025-01-01', end: '2025-12-31' }, deliveredVolume: 20000, deliveredPercentage: 100, qualityGrade: 'A', status: 'completed', country: 'Zimbabwe', memberId: 'AFU-2024-005', memberName: 'Grace Moyo', nextDeliveryDate: '', incoterm: 'CIF London' },
];
