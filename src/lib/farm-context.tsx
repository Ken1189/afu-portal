'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';

export interface Farm {
  id: string;
  name: string;
  country: string | null;
  region: string | null;
  hectares: number | null;
  photo_url: string | null;
  status: string | null;
}

interface FarmContextValue {
  farms: Farm[];
  activeFarm: Farm | null;
  setActiveFarmId: (id: string) => void;
  loading: boolean;
  refresh: () => Promise<void>;
}

const FarmContext = createContext<FarmContextValue>({
  farms: [],
  activeFarm: null,
  setActiveFarmId: () => {},
  loading: true,
  refresh: async () => {},
});

const STORAGE_KEY = 'afu_active_farm_id';

export function FarmProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [activeFarmId, setActiveFarmIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFarms = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('farms')
      .select('id, name, country, region, hectares, photo_url, status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    const list = (data || []) as Farm[];
    setFarms(list);

    // Restore or default active farm
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && list.some((f) => f.id === stored)) {
      setActiveFarmIdState(stored);
    } else if (list.length > 0) {
      setActiveFarmIdState(list[0].id);
      localStorage.setItem(STORAGE_KEY, list[0].id);
    }
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => { fetchFarms(); }, [fetchFarms]);

  const setActiveFarmId = useCallback((id: string) => {
    setActiveFarmIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const activeFarm = useMemo(
    () => farms.find((f) => f.id === activeFarmId) || farms[0] || null,
    [farms, activeFarmId],
  );

  return (
    <FarmContext.Provider value={{ farms, activeFarm, setActiveFarmId, loading, refresh: fetchFarms }}>
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  return useContext(FarmContext);
}
