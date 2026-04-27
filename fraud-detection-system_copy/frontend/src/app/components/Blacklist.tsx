import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ban, Plus, Trash2, Shield, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { fetchApi } from '../lib/api';

type BlacklistType = 'user' | 'device' | 'account';

export function Blacklist() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState<BlacklistType | null>(null);
  const [formData, setFormData] = useState({
    type: 'user' as BlacklistType,
    value: '',
    reason: ''
  });

  useEffect(() => {
    fetchBlacklist();
  }, []);

  const fetchBlacklist = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/blacklist');
      // Normalize _id to id if needed
      const normalizedData = data.map((d: any) => ({
        ...d,
        id: d._id || d.id
      }));
      setEntries(normalizedData);
    } catch (err) {
      toast.error('Failed to load blacklist');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.value || !formData.reason) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const addedEntry = await fetchApi('/blacklist', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      // Assuming addedEntry includes _id
      const normalizedEntry = { ...addedEntry, id: addedEntry._id || addedEntry.id };
      setEntries([normalizedEntry, ...entries]);
      setFormData({ type: 'user', value: '', reason: '' });
      setShowAddForm(false);
      toast.success('Entity added to blacklist');
      // Re-fetch to ensure sync with DB
      fetchBlacklist();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add to blacklist');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await fetchApi(`/blacklist/${id}`, {
        method: 'DELETE'
      });
      setEntries(entries.filter((entry) => entry.id !== id && entry._id !== id));
      toast.success('Entity removed from blacklist');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove from blacklist');
    }
  };

  const typeStats = {
    user: entries.filter((entry) => entry.type === 'user').length,
    device: entries.filter((entry) => entry.type === 'device').length,
    account: entries.filter((entry) => entry.type === 'account').length
  };

  const filteredEntries = activeFilter
    ? entries.filter((entry) => entry.type === activeFilter)
    : entries;

  const filterCards = [
    { type: 'user' as const, label: 'Blacklisted Users', count: typeStats.user, tag: 'Users', color: 'from-blue-500 to-cyan-500' },
    { type: 'device' as const, label: 'Blacklisted Devices', count: typeStats.device, tag: 'Devices', color: 'from-purple-500 to-pink-500' },
    { type: 'account' as const, label: 'Blacklisted Accounts', count: typeStats.account, tag: 'Accounts', color: 'from-orange-500 to-red-500' }
  ];

  const filterHeading = activeFilter
    ? activeFilter === 'user'
      ? 'Blacklisted Users'
      : activeFilter === 'device'
      ? 'Blacklisted Devices'
      : 'Blacklisted Accounts'
    : 'Blacklisted Entities';

  if (loading && entries.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-800/50 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-800/50 rounded-xl"></div>)}
        </div>
        <div className="h-96 bg-slate-800/50 rounded-xl"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-start justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Blacklist Management</h2>
          <p className="text-slate-400">Manage blocked entities and prevent fraudulent activities</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg font-medium hover:from-red-600 hover:to-rose-600 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add to Blacklist
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filterCards.map((card, index) => (
          <motion.button
            key={card.type}
            type="button"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveFilter((current) => current === card.type ? null : card.type)}
            className={`relative overflow-hidden rounded-xl bg-slate-900/50 backdrop-blur-sm border p-6 text-left transition-all ${
              activeFilter === card.type
                ? 'border-cyan-400/60 ring-2 ring-cyan-400/20'
                : 'border-slate-800/50'
            }`}
          >
            <motion.div
              animate={{
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: index * 0.5
              }}
              className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${card.color} blur-3xl`}
            />

            <div className="relative">
              <div className="text-sm uppercase tracking-[0.2em] text-slate-500 mb-3">{card.tag}</div>
              <h3 className="text-3xl font-bold text-white mb-1">{card.count}</h3>
              <p className="text-sm text-slate-400">{card.label}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-6 h-6 text-red-400" />
                <h3 className="text-lg font-semibold text-white">Add New Entry</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as BlacklistType })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  >
                    <option value="user">User</option>
                    <option value="device">Device</option>
                    <option value="account">Account</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Value (ID)</label>
                  <input
                    type="text"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder={`Enter ${formData.type} ID`}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Reason</label>
                  <input
                    type="text"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Enter reason"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAdd}
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg font-medium hover:from-red-600 hover:to-rose-600"
                >
                  Add Entry
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 bg-slate-800/50 text-slate-300 rounded-lg font-medium hover:bg-slate-700/50"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Ban className="w-6 h-6 text-red-400" />
          <h3 className="text-xl font-bold text-white">{filterHeading}</h3>
          <span className="ml-auto text-sm text-slate-400">{filteredEntries.length} shown</span>
          {activeFilter && (
            <button
              type="button"
              onClick={() => setActiveFilter(null)}
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Show all
            </button>
          )}
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {filteredEntries.map((entry, index) => (
              <motion.div
                key={entry.id || entry._id || index}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 50, opacity: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-red-500/30 transition-all group"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className={`p-3 rounded-lg ${
                    entry.type === 'user'
                      ? 'bg-blue-500/20'
                      : entry.type === 'device'
                      ? 'bg-purple-500/20'
                      : 'bg-orange-500/20'
                  }`}
                >
                  <Ban
                    className={`w-6 h-6 ${
                      entry.type === 'user'
                        ? 'text-blue-400'
                        : entry.type === 'device'
                        ? 'text-purple-400'
                        : 'text-orange-400'
                    }`}
                  />
                </motion.div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold text-white">{entry.value}</p>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        entry.type === 'user'
                          ? 'bg-blue-500/20 text-blue-400'
                          : entry.type === 'device'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-orange-500/20 text-orange-400'
                      }`}
                    >
                      {(entry.type || '').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{entry.reason}</span>
                    </div>
                    {entry.dateAdded && (
                      <>
                        <span>&bull;</span>
                        <span>Added {format(new Date(entry.dateAdded), 'MMM dd, yyyy')}</span>
                      </>
                    )}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRemove(entry.id || entry._id)}
                  className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredEntries.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Ban className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">
              {activeFilter ? `No blacklisted ${activeFilter}s found` : 'No blacklisted entities'}
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
