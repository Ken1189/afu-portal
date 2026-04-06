'use client';

import { createContext, useContext } from 'react';

interface MembershipContextType {
  membershipTier: string;
}

const MembershipContext = createContext<MembershipContextType>({ membershipTier: 'free' });

export function MembershipProvider({ tier, children }: { tier: string; children: React.ReactNode }) {
  return (
    <MembershipContext.Provider value={{ membershipTier: tier }}>
      {children}
    </MembershipContext.Provider>
  );
}

export function useMembershipTier() {
  return useContext(MembershipContext);
}
