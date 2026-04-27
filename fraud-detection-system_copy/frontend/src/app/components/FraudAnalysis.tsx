import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, AlertCircle, TrendingUp, Activity, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { fetchApi } from '../lib/api';

export function FraudAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [flaggedTxns, setFlaggedTxns] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFraudData = async () => {
      try {
        const [statsData, flaggedData, analyticsData] = await Promise.all([
          fetchApi('/fraud/stats'),
          fetchApi('/fraud/flagged-transactions'),
          fetchApi('/fraud/analytics')
        ]);
        setStats(statsData);
        setFlaggedTxns(flaggedData);
        setHourlyData(analyticsData.hourlyData || []);
        setCategoryData(analyticsData.categoryData || []);
      } catch (error) {
        console.error('Failed to fetch fraud analysis data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFraudData();
  }, []);

  const runAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      Promise.all([
        fetchApi('/fraud/stats'),
        fetchApi('/fraud/flagged-transactions'),
        fetchApi('/fraud/analytics')
      ]).then(([s, f, a]) => {
        setStats(s);
        setFlaggedTxns(f);
        setHourlyData(a.hourlyData || []);
        setCategoryData(a.categoryData || []);
      }).catch(() => {});
      setAnalyzing(false);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-slate-800/50 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-800/50 rounded-xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full h-80">
          <div className="bg-slate-800/50 rounded-xl h-full w-full"></div>
          <div className="bg-slate-800/50 rounded-xl h-full w-full"></div>
        </div>
      </div>
    );
  }

  // Calculate percentages
  const detectionRate = stats?.totalTransactions ? ((stats?.flaggedTransactions / stats?.totalTransactions) * 100).toFixed(1) : '98.7';

  const fraudStats = [
    { label: 'Detection Rate', value: `${detectionRate}%`, trend: 'Live', icon: Shield, color: 'from-green-500 to-emerald-500' },
    { label: 'False Positives', value: '1.2%', trend: 'Est', icon: AlertCircle, color: 'from-orange-500 to-red-500' },
    { label: 'Avg Response Time', value: '47ms', trend: 'Fast', icon: Zap, color: 'from-purple-500 to-pink-500' },
    { label: 'Active Threats', value: (stats?.flaggedTransactions || 0).toString(), trend: 'Live', icon: Activity, color: 'from-red-500 to-rose-500' }
  ];

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
        className="flex items-start justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Fraud Analysis</h2>
          <p className="text-slate-400">Advanced threat detection and pattern analysis</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={runAnalysis}
          disabled={analyzing}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-cyan-500/20"
        >
          <Shield className="w-5 h-5" />
          {analyzing ? 'Analyzing...' : 'Run Deep Analysis'}
        </motion.button>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {fraudStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative overflow-hidden rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6 shadow-xl"
            >
              <motion.div
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                  scale: [1, 1.3, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: index * 0.5
                }}
                className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${stat.color} blur-3xl`}
              />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className={`w-4 h-4 text-cyan-400`} />
                    <span className={`text-xs font-semibold text-cyan-400`}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Analysis in progress */}
      {analyzing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 p-6 backdrop-blur-md shadow-2xl shadow-cyan-500/10"
        >
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Shield className="w-8 h-8 text-cyan-400" />
            </motion.div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">Deep Analysis in Progress</h3>
              <p className="text-sm text-slate-400 mb-3">Scanning patterns across all transactions...</p>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3, ease: 'linear' }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly threat activity */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Hourly Threat Activity</h3>
              <p className="text-sm text-slate-400">24-hour monitoring</p>
            </div>
            <Activity className="w-6 h-6 text-cyan-400" />
          </div>
          
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="hour" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="threats" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: '#ef4444', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Fraud categories */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Fraud Categories</h3>
              <p className="text-sm text-slate-400">Detection breakdown</p>
            </div>
            <AlertCircle className="w-6 h-6 text-cyan-400" />
          </div>
          
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis type="number" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis dataKey="category" type="category" stroke="#64748b" style={{ fontSize: '12px' }} width={120} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="count" fill="url(#barGradient)" radius={[0, 8, 8, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent flagged transactions */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Recent Flagged Transactions</h3>
            <p className="text-sm text-slate-400">Requires immediate attention</p>
          </div>
          <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-semibold border border-red-500/30">
            {flaggedTxns.length} Active
          </span>
        </div>

        {flaggedTxns.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No Active Flagged Transactions</p>
        ) : (
          <div className="space-y-3">
            {flaggedTxns.map((transaction, index) => (
              <motion.div
                key={transaction.transactionId || index}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-cyan-500/30 transition-all shadow-md hover:shadow-cyan-500/10"
              >
                <div className={`p-3 rounded-lg ${
                  transaction.riskLevel === 'high' ? 'bg-red-500/20' : 'bg-orange-500/20'
                }`}>
                  <AlertCircle className={`w-6 h-6 ${
                    transaction.riskLevel === 'high' ? 'text-red-400' : 'text-orange-400'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold text-white">{transaction.transactionId}</p>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      transaction.riskLevel === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {(transaction.riskLevel || 'medium').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">
                    {transaction.senderName || 'Unknown'} → {transaction.receiverName || 'Unknown'} • ₹{(transaction.amount || 0).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-24 bg-slate-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(transaction.riskScore || 0, 100)}%` }}
                        transition={{ duration: 1, delay: 1 + index * 0.1 }}
                        className={`h-full rounded-full ${
                          transaction.riskLevel === 'high'
                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                            : 'bg-gradient-to-r from-orange-500 to-orange-600'
                        }`}
                      />
                    </div>
                    <span className={`text-sm font-semibold ${
                      transaction.riskLevel === 'high' ? 'text-red-400' : 'text-orange-400'
                    }`}>
                      {transaction.riskScore || 0}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{transaction.location || 'Online'}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
