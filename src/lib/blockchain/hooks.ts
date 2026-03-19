'use client';

import { useState, useCallback, useEffect } from 'react';
import { BrowserProvider, formatEther, Contract, formatUnits, parseUnits } from 'ethers';
import { EDM_TOKEN, EDSD_TOKEN, EDMA_CHAIN, STAKING_CONTRACT, REFERRAL_CONTRACT, ZERO_ADDRESS } from './config';
import { EDM_TOKEN_ABI, EDSD_TOKEN_ABI, STAKING_ABI, REFERRAL_ABI } from './abis';

// ─── Types ───────────────────────────────────────────────────────────────────

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

interface StakingState {
  stakedAmount: string;
  rewardsEarned: string;
  currentTier: string | null;
  stakingStartDate: string | null;
  loading: boolean;
}

interface ReferralState {
  referrerAddress: string | null;
  referralCount: number;
  totalEarnings: string;
  pendingCashback: string;
  loading: boolean;
}

interface EdmBalanceState {
  edmBalance: string;
  edsdBalance: string;
  loading: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns true if the address is not the zero placeholder */
function isDeployed(address: string): boolean {
  return address !== ZERO_ADDRESS;
}

/** Get a BrowserProvider from the injected wallet */
function getProvider(): BrowserProvider | null {
  if (typeof window === 'undefined' || !window.ethereum) return null;
  return new BrowserProvider(window.ethereum);
}

/** Get a signer-connected provider for write operations */
async function getSigner() {
  const provider = getProvider();
  if (!provider) throw new Error('No wallet detected');
  return provider.getSigner();
}

// ─── useWallet ───────────────────────────────────────────────────────────────

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

// ─── useBalances ─────────────────────────────────────────────────────────────

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
    if (!address) return;
    const provider = getProvider();
    if (!provider) return;

    setBalances(prev => ({ ...prev, loading: true }));

    try {
      // ETH / native balance
      const ethBal = await provider.getBalance(address);
      const ethFormatted = parseFloat(formatEther(ethBal)).toFixed(4);

      // EDM token balance (only if contract is deployed)
      let edmFormatted = '0';
      if (isDeployed(EDM_TOKEN.address)) {
        try {
          const contract = new Contract(EDM_TOKEN.address, EDM_TOKEN_ABI, provider);
          const edmBal = await contract.balanceOf(address);
          edmFormatted = parseFloat(formatUnits(edmBal, EDM_TOKEN.decimals)).toFixed(2);
        } catch {
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

// ─── useStaking ──────────────────────────────────────────────────────────────

/**
 * useStaking — Read staking state from the contract, with write actions.
 * Falls back to mock zeros when the contract is not yet deployed.
 */
export function useStaking(address: string | null) {
  const [staking, setStaking] = useState<StakingState>({
    stakedAmount: '0',
    rewardsEarned: '0',
    currentTier: null,
    stakingStartDate: null,
    loading: false,
  });

  // Fetch staking data from contract
  const fetchStaking = useCallback(async () => {
    if (!address) return;

    setStaking(prev => ({ ...prev, loading: true }));

    // If contract isn't deployed yet, return zeros
    if (!isDeployed(STAKING_CONTRACT.address)) {
      setStaking({
        stakedAmount: '0',
        rewardsEarned: '0',
        currentTier: null,
        stakingStartDate: null,
        loading: false,
      });
      return;
    }

    try {
      const provider = getProvider();
      if (!provider) throw new Error('No provider');

      const contract = new Contract(STAKING_CONTRACT.address, STAKING_ABI, provider);
      const [amount, tierId, startTime, rewards] = await contract.getStake(address);

      const stakedAmount = formatUnits(amount, 18);
      const rewardsEarned = formatUnits(rewards, 18);
      const startTimestamp = Number(startTime);

      setStaking({
        stakedAmount: parseFloat(stakedAmount).toFixed(2),
        rewardsEarned: parseFloat(rewardsEarned).toFixed(4),
        currentTier: Number(amount) > 0 ? String(tierId) : null,
        stakingStartDate: startTimestamp > 0
          ? new Date(startTimestamp * 1000).toISOString()
          : null,
        loading: false,
      });
    } catch {
      // Contract call failed — return zeros
      setStaking({
        stakedAmount: '0',
        rewardsEarned: '0',
        currentTier: null,
        stakingStartDate: null,
        loading: false,
      });
    }
  }, [address]);

  useEffect(() => {
    fetchStaking();
  }, [fetchStaking]);

  // ── Write actions ──

  const stake = useCallback(async (amount: string, tierId: number) => {
    if (!isDeployed(STAKING_CONTRACT.address)) {
      throw new Error('Staking contract is not deployed yet');
    }
    const signer = await getSigner();
    const contract = new Contract(STAKING_CONTRACT.address, STAKING_ABI, signer);
    const tx = await contract.stake(parseUnits(amount, 18), tierId);
    await tx.wait();
    await fetchStaking();
  }, [fetchStaking]);

  const unstake = useCallback(async (stakeId: number) => {
    if (!isDeployed(STAKING_CONTRACT.address)) {
      throw new Error('Staking contract is not deployed yet');
    }
    const signer = await getSigner();
    const contract = new Contract(STAKING_CONTRACT.address, STAKING_ABI, signer);
    const tx = await contract.unstake(stakeId);
    await tx.wait();
    await fetchStaking();
  }, [fetchStaking]);

  const claimRewards = useCallback(async () => {
    if (!isDeployed(STAKING_CONTRACT.address)) {
      throw new Error('Staking contract is not deployed yet');
    }
    const signer = await getSigner();
    const contract = new Contract(STAKING_CONTRACT.address, STAKING_ABI, signer);
    const tx = await contract.claimRewards();
    await tx.wait();
    await fetchStaking();
  }, [fetchStaking]);

  return { ...staking, stake, unstake, claimRewards };
}

// ─── useReferral ─────────────────────────────────────────────────────────────

/**
 * useReferral — Read referral data and perform referral actions.
 * Falls back to mock zeros when the contract is not yet deployed.
 */
export function useReferral(address: string | null) {
  const [referral, setReferral] = useState<ReferralState>({
    referrerAddress: null,
    referralCount: 0,
    totalEarnings: '0',
    pendingCashback: '0',
    loading: false,
  });

  const fetchReferral = useCallback(async () => {
    if (!address) return;

    setReferral(prev => ({ ...prev, loading: true }));

    if (!isDeployed(REFERRAL_CONTRACT.address)) {
      setReferral({
        referrerAddress: null,
        referralCount: 0,
        totalEarnings: '0',
        pendingCashback: '0',
        loading: false,
      });
      return;
    }

    try {
      const provider = getProvider();
      if (!provider) throw new Error('No provider');

      const contract = new Contract(REFERRAL_CONTRACT.address, REFERRAL_ABI, provider);

      const [referrer, count, earnings, cashback] = await Promise.all([
        contract.getReferrer(address),
        contract.getReferralCount(address),
        contract.getTotalEarnings(address),
        contract.getPendingCashback(address),
      ]);

      setReferral({
        referrerAddress: referrer !== ZERO_ADDRESS ? referrer : null,
        referralCount: Number(count),
        totalEarnings: parseFloat(formatUnits(earnings, 18)).toFixed(4),
        pendingCashback: parseFloat(formatUnits(cashback, 18)).toFixed(4),
        loading: false,
      });
    } catch {
      setReferral({
        referrerAddress: null,
        referralCount: 0,
        totalEarnings: '0',
        pendingCashback: '0',
        loading: false,
      });
    }
  }, [address]);

  useEffect(() => {
    fetchReferral();
  }, [fetchReferral]);

  // ── Write actions ──

  const register = useCallback(async (referrerAddress: string) => {
    if (!isDeployed(REFERRAL_CONTRACT.address)) {
      throw new Error('Referral contract is not deployed yet');
    }
    const signer = await getSigner();
    const contract = new Contract(REFERRAL_CONTRACT.address, REFERRAL_ABI, signer);
    const tx = await contract.register(referrerAddress);
    await tx.wait();
    await fetchReferral();
  }, [fetchReferral]);

  const claimCashback = useCallback(async () => {
    if (!isDeployed(REFERRAL_CONTRACT.address)) {
      throw new Error('Referral contract is not deployed yet');
    }
    const signer = await getSigner();
    const contract = new Contract(REFERRAL_CONTRACT.address, REFERRAL_ABI, signer);
    const tx = await contract.claimCashback();
    await tx.wait();
    await fetchReferral();
  }, [fetchReferral]);

  return { ...referral, register, claimCashback };
}

// ─── useEdmBalance ───────────────────────────────────────────────────────────

/**
 * useEdmBalance — Read EDM and EDSD token balances from their contracts.
 */
export function useEdmBalance(address: string | null) {
  const [state, setState] = useState<EdmBalanceState>({
    edmBalance: '0',
    edsdBalance: '0',
    loading: false,
  });

  const fetchBalances = useCallback(async () => {
    if (!address) return;
    const provider = getProvider();
    if (!provider) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      let edmBalance = '0';
      let edsdBalance = '0';

      if (isDeployed(EDM_TOKEN.address)) {
        try {
          const edmContract = new Contract(EDM_TOKEN.address, EDM_TOKEN_ABI, provider);
          const bal = await edmContract.balanceOf(address);
          edmBalance = parseFloat(formatUnits(bal, EDM_TOKEN.decimals)).toFixed(2);
        } catch {
          // Contract call failed
        }
      }

      if (isDeployed(EDSD_TOKEN.address)) {
        try {
          const edsdContract = new Contract(EDSD_TOKEN.address, EDSD_TOKEN_ABI, provider);
          const bal = await edsdContract.balanceOf(address);
          edsdBalance = parseFloat(formatUnits(bal, EDSD_TOKEN.decimals)).toFixed(2);
        } catch {
          // Contract call failed
        }
      }

      setState({ edmBalance, edsdBalance, loading: false });
    } catch {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [address]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return { ...state, refetch: fetchBalances };
}

// ─── useSwitchToEdma ─────────────────────────────────────────────────────────

/**
 * useSwitchToEdma — Helper to add/switch to the EDMA L2 network in MetaMask.
 */
export function useSwitchToEdma() {
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  // Check current network on mount and on chain change
  useEffect(() => {
    const checkNetwork = async () => {
      if (typeof window === 'undefined' || !window.ethereum) return;
      try {
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' }) as string;
        const currentChainId = parseInt(chainIdHex, 16);
        setIsCorrectNetwork(currentChainId === EDMA_CHAIN.chainId);
      } catch {
        setIsCorrectNetwork(false);
      }
    };

    checkNetwork();

    if (typeof window !== 'undefined' && window.ethereum) {
      const handler = () => { checkNetwork(); };
      window.ethereum.on('chainChanged', handler);
      return () => {
        window.ethereum?.removeListener('chainChanged', handler);
      };
    }
  }, []);

  const switchNetwork = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('No wallet detected. Please install MetaMask.');
    }

    const chainIdHex = `0x${EDMA_CHAIN.chainId.toString(16)}`;

    try {
      // Try switching to the chain first
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
      setIsCorrectNetwork(true);
    } catch (switchError: unknown) {
      // Error code 4902 means the chain hasn't been added yet
      const errorCode = (switchError as { code?: number })?.code;
      if (errorCode === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: chainIdHex,
                chainName: EDMA_CHAIN.name,
                nativeCurrency: {
                  name: EDMA_CHAIN.currency.name,
                  symbol: EDMA_CHAIN.currency.symbol,
                  decimals: EDMA_CHAIN.currency.decimals,
                },
                rpcUrls: [EDMA_CHAIN.rpcUrl],
                blockExplorerUrls: [EDMA_CHAIN.blockExplorer],
              },
            ],
          });
          setIsCorrectNetwork(true);
        } catch {
          throw new Error('Failed to add EDMA L2 network to wallet');
        }
      } else {
        throw new Error('Failed to switch to EDMA L2 network');
      }
    }
  }, []);

  return { isCorrectNetwork, switchNetwork };
}

// ─── Ethereum window type ────────────────────────────────────────────────────

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
export {
  EDMA_CHAIN,
  EDM_TOKEN,
  EDSD_TOKEN,
  STAKING_CONTRACT,
  REFERRAL_CONTRACT,
  COMMODITY_TOKEN,
  ZERO_ADDRESS,
  STAKING_TIERS,
  BUY_EDM_URL,
  EDM_PRESALE_PRICE,
  TOKENOMICS,
  REFERRAL_CONFIG,
  EDMA_STAKING_URL,
  EDMA_WEBSITE,
} from './config';
