import { useInternetIdentity } from './useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { clearAllOfflineData } from '../offline/offlineQueue';

export function useSwitchAccount() {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const switchAccount = async () => {
    // 1. Clear IndexedDB offline queue and optimistic store
    await clearAllOfflineData();
    
    // 2. Clear React Query cache
    queryClient.clear();
    
    // 3. Clear Internet Identity session
    await clear();
  };

  return { switchAccount };
}
