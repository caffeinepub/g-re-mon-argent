import { useSales, useExpenses, useTodayStats } from '../hooks/useQueries';
import TopBar from '../components/TopBar';
import { formatGNF } from '../utils/money';
import { isToday } from '../utils/dates';
import { TrendingUp, TrendingDown } from 'lucide-react';

type Screen = 'welcome' | 'profile-setup' | 'dashboard' | 'add-sale' | 'add-expense' | 'daily-summary' | 'monthly-goal';

interface DailySummaryScreenProps {
  onNavigate: (screen: Screen) => void;
}

export default function DailySummaryScreen({ onNavigate }: DailySummaryScreenProps) {
  const { data: sales = [] } = useSales();
  const { data: expenses = [] } = useExpenses();
  const { data: todayStats } = useTodayStats();

  const todaySales = sales.filter(sale => isToday(sale.date));
  const todayExpenses = expenses.filter(expense => isToday(expense.date));
  
  const salesTotal = todayStats?.salesTotal || 0;
  const expensesTotal = todayStats?.expensesTotal || 0;
  const profit = salesTotal - expensesTotal;

  const motivationalMessage = profit > 0
    ? `Well done! You earned ${formatGNF(profit)} 💪`
    : profit === 0
    ? 'Keep going! Every day is a new opportunity 💪'
    : 'Tomorrow is a new day! Stay motivated 💪';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar title="Daily Summary" onBack={() => onNavigate('dashboard')} />

      <main className="flex-1 px-6 py-6 space-y-6 max-w-2xl mx-auto w-full">
        {/* Profit Card */}
        <div className={`rounded-2xl p-6 shadow-lg ${
          profit > 0 ? 'bg-gradient-to-br from-success to-success/80' : 
          profit < 0 ? 'bg-gradient-to-br from-destructive to-destructive/80' : 
          'bg-gradient-to-br from-muted to-muted/80'
        }`}>
          <div className="space-y-2 text-center">
            <p className="text-sm opacity-90">Daily Profit</p>
            <p className="text-4xl font-bold">{formatGNF(profit)}</p>
            <p className="text-sm opacity-90 pt-2">{motivationalMessage}</p>
          </div>
        </div>

        {/* Sales Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              Sales Today
            </h2>
            <span className="text-lg font-bold text-success">{formatGNF(salesTotal)}</span>
          </div>
          
          {todaySales.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No sales recorded today</p>
          ) : (
            <div className="space-y-2">
              {todaySales.map((sale) => (
                <div key={sale.id.toString()} className="bg-card rounded-lg p-4 border border-border">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{sale.product || 'Sale'}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(Number(sale.date) / 1_000_000).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-success">{formatGNF(sale.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expenses Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-destructive" />
              Expenses Today
            </h2>
            <span className="text-lg font-bold text-destructive">{formatGNF(expensesTotal)}</span>
          </div>
          
          {todayExpenses.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No expenses recorded today</p>
          ) : (
            <div className="space-y-2">
              {todayExpenses.map((expense) => (
                <div key={expense.id.toString()} className="bg-card rounded-lg p-4 border border-border">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium capitalize">{expense.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(Number(expense.date) / 1_000_000).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-destructive">{formatGNF(expense.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
