import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Smartphone, Clock, User, AlertTriangle, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { fetchApi } from '../lib/api';

export function TransactionDetail() {
  const { id } = useParams();
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransaction = async () => {
      try {
        const data = await fetchApi(`/transactions/${id}`);
        setTransaction(data);
      } catch (error) {
        console.error('Failed to load transaction detail:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadTransaction();
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800/50 rounded w-1/4"></div>
        <div className="h-10 bg-slate-800/50 rounded w-1/3"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-800/50 rounded-xl"></div>
          <div className="lg:col-span-2 h-64 bg-slate-800/50 rounded-xl"></div>
        </div>
        <div className="h-32 bg-slate-800/50 rounded-xl"></div>
        <div className="h-48 bg-slate-800/50 rounded-xl"></div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertTriangle className="w-12 h-12 text-slate-500" />
        <p className="text-slate-400">Transaction not found</p>
        <Link to="/transactions">
          <button className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-lg transition-colors">
            Back to Transactions
          </button>
        </Link>
      </div>
    );
  }

  const txId = transaction._id || transaction.transactionId || id;
  const riskLevel = transaction.riskLevel || 'low';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Back button */}
      <Link to="/transactions">
        <motion.button
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Transactions</span>
        </motion.button>
      </Link>

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-start justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">{txId}</h2>
          <p className="text-slate-400">Transaction Details & Analysis</p>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className={`px-4 py-2 rounded-lg font-medium ${
            transaction.flagged
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-green-500/20 text-green-400 border border-green-500/30'
          }`}
        >
          {transaction.flagged ? 'Flagged' : 'Clear'}
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk score card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6 relative overflow-hidden"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 3,
              repeat: Infinity
            }}
            className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl ${
              riskLevel === 'high'
                ? 'bg-gradient-to-br from-red-500 to-red-600'
                : riskLevel === 'medium'
                ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                : 'bg-gradient-to-br from-green-500 to-green-600'
            }`}
          />

          <div className="relative">
            <Shield className="w-8 h-8 text-cyan-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Risk Assessment</h3>
            
            <div className="flex items-end gap-2 mb-4">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className={`text-5xl font-bold ${
                  riskLevel === 'high' ? 'text-red-400' :
                  riskLevel === 'medium' ? 'text-orange-400' :
                  'text-green-400'
                }`}
              >
                {transaction.riskScore || 0}
              </motion.span>
              <span className="text-xl text-slate-400 mb-2">/100</span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(transaction.riskScore || 0, 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className={`h-full rounded-full ${
                  riskLevel === 'high'
                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                    : riskLevel === 'medium'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                    : 'bg-gradient-to-r from-green-500 to-green-600'
                }`}
              />
            </div>

            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              riskLevel === 'high' ? 'bg-red-500/20 text-red-400' :
              riskLevel === 'medium' ? 'bg-orange-500/20 text-orange-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {riskLevel.toUpperCase()} RISK
            </span>
          </div>
        </motion.div>

        {/* Transaction info */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Transaction Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <InfoItem
                icon={User}
                label="Sender"
                value={transaction.senderName || 'Unknown User'}
                subValue={transaction.senderId || 'N/A'}
                delay={0.4}
              />
              <InfoItem
                icon={User}
                label="Receiver"
                value={transaction.receiverName || 'Unknown User'}
                subValue={transaction.receiverId || 'N/A'}
                delay={0.5}
              />
              <InfoItem
                icon={Clock}
                label="Timestamp"
                value={transaction.timestamp ? format(new Date(transaction.timestamp), 'PPpp') : 'N/A'}
                delay={0.6}
              />
            </div>

            <div className="space-y-4">
              <InfoItem
                icon={MapPin}
                label="Location"
                value={transaction.location || 'Online'}
                delay={0.7}
              />
              <InfoItem
                icon={Smartphone}
                label="Device ID"
                value={transaction.deviceId || 'Unknown Device'}
                delay={0.8}
              />
              <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Amount</p>
                  <p className="text-2xl font-bold text-white">₹{(transaction.amount || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Risk factors */}
      {transaction.reasons && transaction.reasons.length > 0 && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">Risk Factors Detected</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {transaction.reasons.map((reason: string, index: number) => (
              <motion.div
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                whileHover={{ scale: 1.05 }}
                className="p-4 rounded-lg bg-red-500/10 border border-red-500/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-sm font-medium text-red-400">Alert</span>
                </div>
                <p className="text-white">{reason}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Payment flow visualization */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-6">Payment Flow</h3>

        <div className="flex items-center justify-center gap-8">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3 mx-auto">
              <User className="w-10 h-10 text-white" />
            </div>
            <p className="font-semibold text-white">{transaction.senderName || 'Unknown'}</p>
            <p className="text-sm text-slate-400">{transaction.senderId || 'N/A'}</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: 'spring' }}
            className="relative"
          >
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-4xl text-slate-500"
            >
              →
            </motion.div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <span className="text-sm font-semibold text-cyan-400">₹{(transaction.amount || 0).toLocaleString()}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3 mx-auto">
              <User className="w-10 h-10 text-white" />
            </div>
            <p className="font-semibold text-white">{transaction.receiverName || 'Unknown'}</p>
            <p className="text-sm text-slate-400">{transaction.receiverId || 'N/A'}</p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InfoItem({ 
  icon: Icon, 
  label, 
  value, 
  subValue, 
  delay 
}: { 
  icon: any; 
  label: string; 
  value: string; 
  subValue?: string; 
  delay: number;
}) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay }}
      className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50"
    >
      <div className="p-2 rounded-lg bg-slate-700/50">
        <Icon className="w-5 h-5 text-cyan-400" />
      </div>
      <div>
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
        {subValue && <p className="text-xs text-slate-500">{subValue}</p>}
      </div>
    </motion.div>
  );
}
