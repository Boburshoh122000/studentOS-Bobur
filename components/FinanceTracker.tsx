import React, { useState, useEffect } from 'react';
import { Screen, NavigationProps } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { financeApi } from '../src/services/api';
import DashboardLayout from './DashboardLayout';
import toast from 'react-hot-toast';

export default function FinanceTracker({ navigateTo }: NavigationProps) {
  // State
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'budget'>('overview');
  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    balance: 0,
    recentTransactions: [],
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Transaction Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    type: 'EXPENSE',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [summaryData, transactionsData] = await Promise.all([
        financeApi.getSummary(),
        financeApi.getTransactions(),
      ]);

      if (summaryData.data) setSummary(summaryData.data);
      if (transactionsData.data) setTransactions(transactionsData.data);
    } catch (error) {
      console.error('Failed to fetch finance data', error);
      toast.error('Failed to load finance data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await financeApi.createTransaction({
        amount: parseFloat(newTransaction.amount),
        type: newTransaction.type as 'INCOME' | 'EXPENSE',
        description: newTransaction.description,
        date: new Date(newTransaction.date).toISOString(),
      });

      if (response.error) {
        toast.error(response.error);
        return;
      }

      toast.success('Transaction added');
      setIsAddModalOpen(false);
      setNewTransaction({
        amount: '',
        type: 'EXPENSE',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to add transaction');
    }
  };

  const headerContent = (
    <header className="h-20 px-8 flex items-center justify-between flex-shrink-0 bg-background-light dark:bg-background-dark z-10 border-b border-gray-200 dark:border-gray-800 w-full">
      <div className="flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-text-main dark:text-white">Finance Tracker</h2>
        <p className="text-sm text-text-sub">Manage your budget and track expenses</p>
      </div>
      <div className="flex items-center gap-6">
        <div className="bg-gray-100 dark:bg-card-dark p-1 rounded-lg flex items-center border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'overview' ? 'bg-white dark:bg-gray-700 text-text-main dark:text-white shadow-sm' : 'text-text-sub hover:text-text-main dark:hover:text-white'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'transactions' ? 'bg-white dark:bg-gray-700 text-text-main dark:text-white shadow-sm' : 'text-text-sub hover:text-text-main dark:hover:text-white'}`}
          >
            Transactions
          </button>
        </div>
        <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>
        <ThemeToggle />
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors shadow-md shadow-primary/20"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Transaction
        </button>
      </div>
    </header>
  );

  return (
    <DashboardLayout
      currentScreen={Screen.FINANCE}
      navigateTo={navigateTo}
      headerContent={headerContent}
    >
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-background-dark p-8 h-full">
        {isLoading ? (
          <div className="text-center py-20 text-gray-500">Loading finance data...</div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="size-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                    <span className="material-symbols-outlined">trending_up</span>
                  </div>
                  <div>
                    <p className="text-sm text-text-sub">Total Income</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${summary.income.toFixed(2)}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                    <span className="material-symbols-outlined">trending_down</span>
                  </div>
                  <div>
                    <p className="text-sm text-text-sub">Total Expenses</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${summary.expense.toFixed(2)}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-card-dark p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <span className="material-symbols-outlined">account_balance_wallet</span>
                  </div>
                  <div>
                    <p className="text-sm text-text-sub">Current Balance</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${summary.balance.toFixed(2)}
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 min-h-[400px]">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                {activeTab === 'overview' ? 'Recent Transactions' : 'All Transactions'}
              </h3>

              {transactions.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  No transactions yet. Add one to get started!
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {transactions.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`size-10 rounded-full flex items-center justify-center ${t.type === 'EXPENSE' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}
                        >
                          <span className="material-symbols-outlined">
                            {t.type === 'EXPENSE' ? 'shopping_bag' : 'work'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">
                            {t.description || 'Untitled Transaction'}
                          </h4>
                          <p className="text-xs text-text-sub">
                            {new Date(t.date).toLocaleDateString()} &bull;{' '}
                            {t.category?.name || 'Uncategorized'}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`font-bold ${t.type === 'EXPENSE' ? 'text-red-600' : 'text-green-600'}`}
                      >
                        {t.type === 'EXPENSE' ? '-' : '+'} ${t.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Transaction Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-card-dark rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Transaction</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-sub mb-1">Type</label>
                <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 p-1">
                  <button
                    type="button"
                    onClick={() => setNewTransaction({ ...newTransaction, type: 'INCOME' })}
                    className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${newTransaction.type === 'INCOME' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'text-text-sub hover:text-text-main'}`}
                  >
                    Income
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTransaction({ ...newTransaction, type: 'EXPENSE' })}
                    className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${newTransaction.type === 'EXPENSE' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'text-text-sub hover:text-text-main'}`}
                  >
                    Expense
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-sub mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newTransaction.amount}
                    onChange={(e) =>
                      setNewTransaction({ ...newTransaction, amount: e.target.value })
                    }
                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-sub mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-sub mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={newTransaction.description}
                  onChange={(e) =>
                    setNewTransaction({ ...newTransaction, description: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                  placeholder="e.g. Grocery, Rent, Salary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold shadow-lg shadow-primary/25 transition-all active:scale-[0.98] mt-4"
              >
                Add Transaction
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
