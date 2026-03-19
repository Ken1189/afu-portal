/**
 * Smart Contract ABIs for EDMA L2 Integration
 *
 * Minimal human-readable ABIs used by ethers v6.
 * Each ABI covers the functions and events needed by the portal hooks.
 */

// EDM Token (ERC-20)
export const EDM_TOKEN_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

// EDSD Settlement Token (ERC-20) — same interface as EDM
export const EDSD_TOKEN_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

// AFU Staking Contract
export const STAKING_ABI = [
  'function stake(uint256 amount, uint8 tierId) external',
  'function unstake(uint256 stakeId) external',
  'function claimRewards() external',
  'function getStake(address staker) view returns (uint256 amount, uint8 tierId, uint256 startTime, uint256 rewards)',
  'function getStakedAmount(address staker) view returns (uint256)',
  'function getPendingRewards(address staker) view returns (uint256)',
  'function getTierInfo(uint8 tierId) view returns (uint256 minStake, uint256 rewardRate, uint256 lockDuration)',
  'function totalStaked() view returns (uint256)',
  'event Staked(address indexed staker, uint256 amount, uint8 tierId)',
  'event Unstaked(address indexed staker, uint256 amount)',
  'event RewardsClaimed(address indexed staker, uint256 amount)',
];

// AFU Referral Contract
export const REFERRAL_ABI = [
  'function register(address referrer) external',
  'function getReferrer(address user) view returns (address)',
  'function getReferralCount(address referrer) view returns (uint256)',
  'function getTotalEarnings(address referrer) view returns (uint256)',
  'function getPendingCashback(address user) view returns (uint256)',
  'function claimCashback() external',
  'event ReferralRegistered(address indexed user, address indexed referrer)',
  'event CashbackClaimed(address indexed user, uint256 amount)',
];

// Commodity Token (ERC-1155 for RWA)
export const COMMODITY_TOKEN_ABI = [
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])',
  'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data) external',
  'function setApprovalForAll(address operator, bool approved) external',
  'function isApprovedForAll(address account, address operator) view returns (bool)',
  'function uri(uint256 id) view returns (string)',
  'function totalSupply(uint256 id) view returns (uint256)',
  'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
];
