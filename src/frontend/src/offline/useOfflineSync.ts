import { useEffect } from 'react';
import { useActor } from '../hooks/useActor';
import { useQueryClient } from '@tanstack/react-query';
import { getQueuedActions, removeQueuedAction, clearOptimisticData } from './offlineQueue';
import { useConnectivityStatus } from './useConnectivityStatus';
import { toast } from 'sonner';

export function useOfflineSync() {
  const { actor } = useActor();
  const isOnline = useConnectivityStatus();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isOnline || !actor) return;

    const syncQueue = async () => {
      const actions = await getQueuedActions();
      
      if (actions.length === 0) return;

      toast.info(`Syncing ${actions.length} pending action(s)...`);

      for (const action of actions) {
        try {
          switch (action.type) {
            case 'createSale':
              await actor.createSale(action.data.amount, action.data.product);
              break;
            case 'createExpense':
              await actor.createExpense(action.data.amount, action.data.category);
              break;
            case 'setMonthlyGoal':
              await actor.setMonthlyGoal(BigInt(action.data.month), action.data.goalAmount);
              break;
            case 'registerUser':
              await actor.registerUser(action.data);
              break;
            case 'saveProfile':
              await actor.saveCallerUserProfile(action.data);
              break;
          }
          
          await removeQueuedAction(action.id);
        } catch (error) {
          console.error('Failed to sync action:', action, error);
          toast.error('Some actions failed to sync');
          break;
        }
      }

      await clearOptimisticData();
      queryClient.invalidateQueries();
      toast.success('All actions synced!');
    };

    syncQueue();
  }, [isOnline, actor, queryClient]);
}
