/**
 * EDMA Network Configuration
 *
 * EDMA is an Ethereum Layer-2 for Real-World Assets (PoV Protocol).
 * This config defines the chain parameters, contract addresses,
 * and staking tiers for the AFU integration.
 */

export const EDMA_CHAIN = {
  chainId: 1, // Ethereum mainnet (EDMA L2 settles here) — update when EDMA L2 goes live
  name: 'Ethereum Mainnet',
  rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/demo',
  blockExplorer: 'https://etherscan.io',
  currency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
};

// EDM Token Contract (ERC-20)
export const EDM_TOKEN = {
  address: '0x0000000000000000000000000000000000000000', // Placeholder — update with real contract
  symbol: 'EDM',
  decimals: 18,
  name: 'EDMA Token',
  totalSupply: 500_000_000, // 500M total supply
  logoUrl: '/edma-logo.png',
};

// EDSD Settlement Token
export const EDSD_TOKEN = {
  address: '0x0000000000000000000000000000000000000000', // Placeholder
  symbol: 'EDSD',
  decimals: 18,
  name: 'EDMA Settlement Dollar',
};

// Staking Contract
export const STAKING_CONTRACT = {
  address: '0x0000000000000000000000000000000000000000', // Placeholder
};

// Presale price
export const EDM_PRESALE_PRICE = 0.215; // $0.215 per EDM

// Staking tiers
export const STAKING_TIERS = [
  {
    id: 'presale',
    label: 'Presale Staking',
    duration: 'Until presale ends',
    durationMonths: 0,
    edmReward: '2% per month',
    edmRewardPercent: 2,
    cleReward: null,
    minStake: 100,
    active: true,
  },
  {
    id: '3month',
    label: '3 Month Lock',
    duration: '3 months',
    durationMonths: 3,
    edmReward: '2%',
    edmRewardPercent: 2,
    cleReward: 'Up to 5%',
    cleRewardPercent: 5,
    minStake: 500,
    active: false,
  },
  {
    id: '6month',
    label: '6 Month Lock',
    duration: '6 months',
    durationMonths: 6,
    edmReward: '5%',
    edmRewardPercent: 5,
    cleReward: 'Up to 10%',
    cleRewardPercent: 10,
    minStake: 1000,
    active: false,
  },
  {
    id: '12month',
    label: '12 Month Lock',
    duration: '12 months',
    durationMonths: 12,
    edmReward: '10%',
    edmRewardPercent: 10,
    cleReward: 'Up to 15%',
    cleRewardPercent: 15,
    minStake: 2500,
    active: false,
  },
  {
    id: '24month',
    label: '24 Month Lock',
    duration: '24 months',
    durationMonths: 24,
    edmReward: '15%',
    edmRewardPercent: 15,
    cleReward: 'Up to 25%',
    cleRewardPercent: 25,
    minStake: 5000,
    active: false,
  },
];

// Referral config
export const REFERRAL_CONFIG = {
  cashbackPercent: 10,
  minPurchase: 10, // $10 minimum
  rewardTypes: ['USDT', 'ETH', 'EDM'] as const,
};

// Tokenomics
export const TOKENOMICS = [
  { category: 'Presale', allocation: 220_000_000, percent: 44 },
  { category: 'Staking', allocation: 80_000_000, percent: 16 },
  { category: 'Liquidity', allocation: 80_000_000, percent: 16 },
  { category: 'Treasury', allocation: 80_000_000, percent: 16 },
  { category: 'Marketing', allocation: 25_000_000, percent: 5 },
  { category: 'Team', allocation: 10_000_000, percent: 2 },
  { category: 'Giveaway', allocation: 5_000_000, percent: 1 },
];

// Buy EDM link
export const BUY_EDM_URL = 'https://edma.app/?referralURL=2222';
export const EDMA_WEBSITE = 'https://edma.app';
export const EDMA_STAKING_URL = 'https://edma.app/staking-page/';
export const EDMA_DOCS_URL = 'https://edma.app/docs/';
