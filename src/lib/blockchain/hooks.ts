'use client';

import { useState, useCallback, useEffect } from 'react';
import { BrowserProvider, formatEther, Contract, formatUnits } from 'ethers';
import { EDM_TOKEN, EDMA_CHAIN } from './config';

// Minimal ERC-20 ABI for balance + transfer
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
];

interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

interface BalanceState {
  eth: string;
  edm: string;
  loading: boolean;
}

/**
 * useWallet — Connect/disconnect MetaMask or any injected wallet
 */
export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  // Check if wallet was previously connected
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then((result: unknown) => {
        const accounts = result as string[];
        if (accounts && accounts.length > 0) {
          setWallet(prev => ({ ...prev, address: accounts[0], isConnected: true }));
        }
      }).catch(() => {});
    }
  }, []);

  const connect = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setWallet(prev => ({ ...prev, error: 'No wallet detected. Please install MetaMask.' }));
      return;
    }

    setWallet(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();

      setWallet({
        address: accounts[0],
        chainId: Number(network.chainId),
        isConnected: true,
        isConnecting: false,
        error: null,
      });
    } catch (err) {
      setWallet(prev => ({
        ...prev,
        isConnecting: false,
        error: err instanceof Error ? err.message : 'Failed to connect wallet',
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({
      address: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    });
  }, []);

  const shortAddress = wallet.address
    ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
    : null;

  return { ...wallet, shortAddress, connect, disconnect };
}

/**
 * useBalances — Fetch ETH and EDM token balances
 */
export function useBalances(address: string | null) {
  const [balances, setBalances] = useState<BalanceState>({
    eth: '0',
    edm: '0',
    loading: false,
  });

  const fetchBalances = useCallback(async () => {
    if (!address || typeof window === 'undefined' || !window.ethereum) return;

    setBalances(prev => ({ ...prev, loading: true }));

    try {
      const provider = new BrowserProvider(window.ethereum);

      // ETH balance
      const ethBal = await provider.getBalance(address);
      const ethFormatted = parseFloat(formatEther(ethBal)).toFixed(4);

      // EDM token balance (only if contract is deployed)
      let edmFormatted = '0';
      if (EDM_TOKEN.address !== '0x0000000000000000000000000000000000000000') {
        try {
          const contract = new Contract(EDM_TOKEN.address, ERC20_ABI, provider);
          const edmBal = await contract.balanceOf(address);
          edmFormatted = parseFloat(formatUnits(edmBal, EDM_TOKEN.decimals)).toFixed(2);
        } catch {
          // Contract not deployed or not on this network
          edmFormatted = '0';
        }
      }

      setBalances({ eth: ethFormatted, edm: edmFormatted, loading: false });
    } catch {
      setBalances(prev => ({ ...prev, loading: false }));
    }
  }, [address]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return { ...balances, refetch: fetchBalances };
}

/**
 * useStaking — Mock staking state (will be wired to real contract later)
 */
export function useStaking(address: string | null) {
  const [staking, setStaking] = useState({
    stakedAmount: '0',
    rewardsEarned: '0',
    currentTier: null as string | null,
    stakingStartDate: null as string | null,
    loading: false,
  });

  useEffect(() => {
    if (!address) return;
    // TODO: Read from staking contract when deployed
    // For now, show demo values if wallet is connected
    setStaking({
      stakedAmount: '0',
      rewardsEarned: '0',
      currentTier: null,
      stakingStartDate: null,
      loading: false,
    });
  }, [address]);

  return staking;
}

// Ethereum window type
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

// Re-export config for convenience
export { EDMA_CHAIN, EDM_TOKEN, STAKING_TIERS, BUY_EDM_URL, EDM_PRESALE_PRICE, TOKENOMICS, REFERRAL_CONFIG, EDMA_STAKING_URL, EDMA_WEBSITE } from './config';
