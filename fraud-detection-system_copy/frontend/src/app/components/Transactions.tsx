import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, ArrowUpDown, Eye, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fetchApi } from '../lib/api';

export function Transactions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await fetchApi('/transactions');
        // Sort newest first assuming backend returns mixed or unordered
        const sorted = data.sort((a: any, b: any) => 
          new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
        );
        setTransactions(sorted);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      (transaction.transactionId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.senderName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.receiverName || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterRisk === 'all' || transaction.riskLevel === filterRisk;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Page header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-3xl font-bold text-white mb-2">Transaction Monitoring</h2>
        <p className="text-slate-400">Real-time payment tracking and analysis</p>
      </motion.div>

      {/* Search and filters */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by transaction ID, sender, or receiver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-800/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>

        <div className="flex gap-2">
          {['all', 'low', 'medium', 'high'].map((risk) => (
            <motion.button
              key={risk}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterRisk(risk as typeof filterRisk)}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                filterRisk === risk
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                  : 'bg-slate-900/50 text-slate-400 border border-slate-800/50 hover:bg-slate-800/50'
              }`}
            >
              {risk.charAt(0).toUpperCase() + risk.slice(1)}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Transactions table */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Parties
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Risk Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <motion.tr key={`skeleton-${i}`} className="border-b border-slate-800/30 animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 bg-slate-700/50 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-slate-700/50 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-3 bg-slate-700/50 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-slate-700/50 rounded w-32"></div>
                      </td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-700/50 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-700/50 rounded w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-slate-700/50 rounded-full w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-700/50 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-8 w-8 bg-slate-700/50 rounded-lg mx-auto"></div></td>
                    </motion.tr>
                  ))
                ) : (
                  filteredTransactions.map((transaction, index) => (
                    <motion.tr
                      key={transaction.transactionId || transaction._id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ backgroundColor: 'rgba(51, 65, 85, 0.3)' }}
                      className="border-b border-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-white">{transaction.transactionId || transaction._id}</p>
                          <p className="text-xs text-slate-400">{transaction.paymentType || "Standard Transfer"}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-3 h-3 text-red-400" />
                            <span className="text-sm text-slate-300">{transaction.senderName || transaction.senderId}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingDown className="w-3 h-3 text-green-400" />
                            <span className="text-sm text-slate-300">{transaction.receiverName || transaction.receiverId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-white">
                          ₹{(transaction.amount || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden mx-1 w-24">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(transaction.riskScore || 0, 100)}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className={`h-full rounded-full ${
                                transaction.riskLevel === 'high'
                                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                                  : transaction.riskLevel === 'medium'
                                  ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                                  : 'bg-gradient-to-r from-green-500 to-green-600'
                              }`}
                            />
                          </div>
                          <span className={`text-sm font-semibold min-w-[3rem] ${
                            transaction.riskLevel === 'high' ? 'text-red-400' :
                            transaction.riskLevel === 'medium' ? 'text-orange-400' :
                            'text-green-400'
                          }`}>
                            {transaction.riskScore || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.flagged
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-green-500/20 text-green-400 border border-green-500/30'
                          }`}
                        >
                          {transaction.flagged ? 'Flagged' : 'Clear'}
                        </motion.span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-400">
                          {transaction.timestamp ? formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true }) : 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link to={`/transactions/${transaction.transactionId || transaction._id}`}>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-lg bg-slate-800/50 text-cyan-400 hover:bg-slate-700/50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                        </Link>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {!loading && filteredTransactions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-slate-400">No transactions found</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

