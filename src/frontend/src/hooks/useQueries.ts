import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { queueOfflineAction, mergeOptimisticData } from '../offline/offlineQueue';
import type { Sale, Expense, UserProfile, ExpenseCategory } from '../backend';
import { toast } from 'sonner';

export function useSales() {
  const { actor, isFetching } = useActor();

  return useQuery<Sale[]>({
    queryKey: ['sales'],
    queryFn: async () => {
      if (!actor) return [];
      const sales = await actor.getSales();
      return mergeOptimisticData('sales', sales);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useExpenses() {
  const { actor, isFetching } = useActor();

  return useQuery<Expense[]>({
    queryKey: ['expenses'],
    queryFn: async () => {
      if (!actor) return [];
      const expenses = await actor.getExpenses();
      return mergeOptimisticData('expenses', expenses);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAvailableCash() {
  const { actor, isFetching } = useActor();

  return useQuery<number>({
    queryKey: ['availableCash'],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getAvailableCash();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTodayStats() {
  const { data: sales = [] } = useSales();
  const { data: expenses = [] } = useExpenses();

  return useQuery({
    queryKey: ['todayStats', sales, expenses],
    queryFn: () => {
      const now = Date.now();
      const todayStart = new Date(now).setHours(0, 0, 0, 0);
      
      const todaySales = sales.filter(s => Number(s.date) / 1_000_000 >= todayStart);
      const todayExpenses = expenses.filter(e => Number(e.date) / 1_000_000 >= todayStart);
      
      const salesTotal = todaySales.reduce((sum, s) => sum + s.amount, 0);
      const expensesTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
      
      return { salesTotal, expensesTotal };
    },
    enabled: true,
  });
}

export function useMonthlyGoalProgress(year: number, month: number) {
  const { actor, isFetching } = useActor();

  return useQuery<number>({
    queryKey: ['monthlyGoalProgress', year, month],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getMonthlyGoalProgress(BigInt(year), BigInt(month));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateSale() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, product }: { amount: number; product: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      
      if (!navigator.onLine) {
        await queueOfflineAction({
          type: 'createSale',
          data: { amount, product },
        });
        return null;
      }
      
      return actor.createSale(amount, product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['availableCash'] });
      queryClient.invalidateQueries({ queryKey: ['todayStats'] });
    },
  });
}

export function useCreateExpense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, category }: { amount: number; category: ExpenseCategory }) => {
      if (!actor) throw new Error('Actor not available');
      
      if (!navigator.onLine) {
        await queueOfflineAction({
          type: 'createExpense',
          data: { amount, category },
        });
        return null;
      }
      
      return actor.createExpense(amount, category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['availableCash'] });
      queryClient.invalidateQueries({ queryKey: ['todayStats'] });
    },
  });
}

export function useSetMonthlyGoal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ month, goalAmount }: { month: number; goalAmount: number }) => {
      if (!actor) throw new Error('Actor not available');
      
      if (!navigator.onLine) {
        await queueOfflineAction({
          type: 'setMonthlyGoal',
          data: { month, goalAmount },
        });
        return;
      }
      
      return actor.setMonthlyGoal(BigInt(month), goalAmount);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['monthlyGoalProgress'] });
    },
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      
      const existingProfile = await actor.getCallerUserProfile();
      
      if (!navigator.onLine) {
        await queueOfflineAction({
          type: existingProfile ? 'saveProfile' : 'registerUser',
          data: profile,
        });
        return;
      }
      
      if (existingProfile) {
        return actor.saveCallerUserProfile(profile);
      } else {
        return actor.registerUser(profile);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
