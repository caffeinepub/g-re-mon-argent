import type { Sale, Expense } from '../backend';

export function calculateAvailableCash(sales: Sale[], expenses: Expense[]): number {
  const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  return totalSales - totalExpenses;
}

export function calculateDailyProfit(todaySales: Sale[], todayExpenses: Expense[]): number {
  const salesTotal = todaySales.reduce((sum, sale) => sum + sale.amount, 0);
  const expensesTotal = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  return salesTotal - expensesTotal;
}

export function calculateGoalProgress(currentAmount: number, goalAmount: number): {
  percent: number;
  remaining: number;
} {
  if (goalAmount <= 0) {
    return { percent: 0, remaining: 0 };
  }
  
  const percent = Math.min((currentAmount / goalAmount) * 100, 100);
  const remaining = Math.max(goalAmount - currentAmount, 0);
  
  return { percent, remaining };
}
