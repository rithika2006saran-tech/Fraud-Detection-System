import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, CreditCard, AlertTriangle, Ban, TrendingUp, Shield, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatDistanceToNow, format } from 'date-fns';
import { fetchApi } from '../lib/api';

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [blacklistCount, setBlacklistCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fraudStats, allTxns, flaggedTxns, blacklist] = await Promise.all([
          fetchApi('/fraud/stats'),
          fetchApi('/transactions'),
          fetchApi('/fraud/flagged-transactions'),
          fetchApi('/blacklist')
        ]);
        
        setStats(fraudStats);
        setBlacklistCount(blacklist.length || 0);

        // Process alerts from flagged transactions
        const recentAlerts = flaggedTxns.slice(0, 5).map((t: any) => ({
          transactionId: t.transactionId,
          message: `Flagged: ${t.riskLevel} risk transaction`,
          time: t.timestamp || new Date().toISOString(),
          severity: t.riskLevel
        }));
        setAlerts(recentAlerts);

        // Process chart data from all transactions
        const dateGroups: Record<string, { low: number, medium: number, high: number }> = {};
        allTxns.forEach((t: any) => {
          if (!t.timestamp) return;
          const date = format(new Date(t.timestamp), 'MMM dd');
          if (!dateGroups[date]) {
            dateGroups[date] = { low: 0, medium: 0, high: 0 };
          }
          if (t.riskLevel === 'high') dateGroups[date].high++;
          else if (t.riskLevel === 'medium') dateGroups[date].medium++;
          else dateGroups[date].low++;
        });

        const cData = Object.entries(dateGroups).map(([date, counts]) => ({
          date,
          ...counts
        }));
        setChartData(cData.slice(-7)); // last 7 days

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-slate-800/50 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-800/50 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-800/50 rounded-xl"></div>
          <div className="h-80 bg-slate-800/50 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const overviewStats = [
    { label: 'Total Users', value: 'N/A', icon: Users, color: 'from-blue-500 to-cyan-500', change: 'Live' },
    { label: 'Transactions', value: stats?.totalTransactions?.toLocaleString() || 0, icon: CreditCard, color: 'from-purple-500 to-pink-500', change: 'Live' },
    { label: 'Flagged', value: stats?.flaggedTransactions?.toLocaleString() || 0, icon: AlertTriangle, color: 'from-orange-500 to-red-500', change: 'Live' },
    { label: 'Blacklisted', value: blacklistCount.toLocaleString(), icon: Ban, color: 'from-red-500 to-rose-500', change: 'Live' }
  ];

  const riskData = [
    { name: 'Low Risk', value: stats?.lowRiskCount || 0, color: '#10b981' },
    { name: 'Medium Risk', value: stats?.mediumRiskCount || 0, color: '#f59e0b' },
    { name: 'High Risk', value: stats?.highRiskCount || 0, color: '#ef4444' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Page header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h2>
        <p className="text-slate-400">Real-time threat monitoring and analytics</p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative overflow-hidden rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6"
            >
              <motion.div
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 3,
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
                  <span className={`text-sm font-semibold text-cyan-400`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction trend chart */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Transaction Trends</h3>
              <p className="text-sm text-slate-400">Activity mapped to risk levels</p>
            </div>
            <TrendingUp className="w-6 h-6 text-cyan-400" />
          </div>
          
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Area type="monotone" dataKey="low" stroke="#10b981" fillOpacity={1} fill="url(#colorLow)" />
              <Area type="monotone" dataKey="medium" stroke="#f59e0b" fillOpacity={1} fill="url(#colorMedium)" />
              <Area type="monotone" dataKey="high" stroke="#ef4444" fillOpacity={1} fill="url(#colorHigh)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Risk distribution */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Risk Distribution</h3>
              <p className="text-sm text-slate-400">Current status</p>
            </div>
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-2 mt-4">
            {riskData.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-300">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-white">{item.value.toLocaleString()}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent alerts */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Recent Alerts</h3>
            <p className="text-sm text-slate-400">Latest security threats</p>
          </div>
          <Activity className="w-6 h-6 text-cyan-400" />
        </div>

        {alerts.length === 0 ? (
          <p className="text-slate-400">No active alerts.</p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <motion.div
                key={alert.transactionId}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  alert.severity === 'high' 
                    ? 'bg-red-500/10 border-red-500/30' 
                    : alert.severity === 'medium'
                    ? 'bg-orange-500/10 border-orange-500/30'
                    : 'bg-yellow-500/10 border-yellow-500/30'
                }`}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.5, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3
                  }}
                  className={`p-2 rounded-full ${
                    alert.severity === 'high' 
                      ? 'bg-red-500/20' 
                      : alert.severity === 'medium'
                      ? 'bg-orange-500/20'
                      : 'bg-yellow-500/20'
                  }`}
                >
                  <AlertTriangle className={`w-5 h-5 ${
                    alert.severity === 'high' 
                      ? 'text-red-400' 
                      : alert.severity === 'medium'
                      ? 'text-orange-400'
                      : 'text-yellow-400'
                  }`} />
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{alert.message}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDistanceToNow(new Date(alert.time), { addSuffix: true })} • {alert.transactionId}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${
                  alert.severity === 'high' 
                    ? 'bg-red-500/20 text-red-400' 
                    : alert.severity === 'medium'
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {alert.severity.toUpperCase()}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

