export interface Transaction {
  transactionId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  amount: number;
  timestamp: string;
  location: string;
  deviceId: string;
  paymentType: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  flagged: boolean;
  reasons?: string[];
}

export interface DashboardStats {
  users: number;
  transactions: number;
  flaggedTransactions: number;
  blacklistedEntities: number;
  totalTransactions: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
}

export interface BlacklistEntry {
  id: string;
  type: 'user' | 'device' | 'account';
  value: string;
  reason: string;
  dateAdded: string;
}

export interface Alert {
  transactionId: string;
  message: string;
  time: string;
  severity: 'high' | 'medium' | 'low';
}

// Mock data for demonstration
export const mockTransactions: Transaction[] = [
  {
    transactionId: 'TXN1001',
    senderId: 'U001',
    senderName: 'Rahul Sharma',
    receiverId: 'U002',
    receiverName: 'Priya Patel',
    amount: 15000,
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    location: 'Mumbai',
    deviceId: 'D123',
    paymentType: 'QR',
    riskScore: 85,
    riskLevel: 'high',
    flagged: true,
    reasons: ['High amount', 'New receiver', 'Unusual location']
  },
  {
    transactionId: 'TXN1002',
    senderId: 'U003',
    senderName: 'Amit Kumar',
    receiverId: 'U004',
    receiverName: 'Sneha Reddy',
    amount: 500,
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    location: 'Chennai',
    deviceId: 'D456',
    paymentType: 'UPI',
    riskScore: 15,
    riskLevel: 'low',
    flagged: false
  },
  {
    transactionId: 'TXN1003',
    senderId: 'U005',
    senderName: 'Vikram Singh',
    receiverId: 'U006',
    receiverName: 'Anjali Gupta',
    amount: 8500,
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    location: 'Delhi',
    deviceId: 'D789',
    paymentType: 'QR',
    riskScore: 55,
    riskLevel: 'medium',
    flagged: true,
    reasons: ['Device mismatch', 'Rapid transaction']
  },
  {
    transactionId: 'TXN1004',
    senderId: 'U007',
    senderName: 'Neha Joshi',
    receiverId: 'U008',
    receiverName: 'Karan Mehta',
    amount: 2000,
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    location: 'Bangalore',
    deviceId: 'D321',
    paymentType: 'UPI',
    riskScore: 20,
    riskLevel: 'low',
    flagged: false
  },
  {
    transactionId: 'TXN1005',
    senderId: 'U009',
    senderName: 'Rohan Verma',
    receiverId: 'U010',
    receiverName: 'Deepika Shah',
    amount: 12000,
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    location: 'Pune',
    deviceId: 'D654',
    paymentType: 'QR',
    riskScore: 72,
    riskLevel: 'high',
    flagged: true,
    reasons: ['Blacklisted device', 'High amount']
  },
  {
    transactionId: 'TXN1006',
    senderId: 'U011',
    senderName: 'Aditi Desai',
    receiverId: 'U012',
    receiverName: 'Arjun Nair',
    amount: 350,
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    location: 'Hyderabad',
    deviceId: 'D987',
    paymentType: 'UPI',
    riskScore: 10,
    riskLevel: 'low',
    flagged: false
  }
];

export const mockStats: DashboardStats = {
  users: 1247,
  transactions: 15634,
  flaggedTransactions: 234,
  blacklistedEntities: 47,
  totalTransactions: 15634,
  highRiskCount: 89,
  mediumRiskCount: 145,
  lowRiskCount: 15400
};

export const mockBlacklist: BlacklistEntry[] = [
  {
    id: 'B001',
    type: 'user',
    value: 'U002',
    reason: 'Multiple fraud reports',
    dateAdded: '2026-03-15T10:30:00'
  },
  {
    id: 'B002',
    type: 'device',
    value: 'D654',
    reason: 'Suspicious activity pattern',
    dateAdded: '2026-03-18T14:20:00'
  },
  {
    id: 'B003',
    type: 'account',
    value: 'ACC98765',
    reason: 'Confirmed fraudulent account',
    dateAdded: '2026-03-20T09:15:00'
  }
];

export const mockAlerts: Alert[] = [
  {
    transactionId: 'TXN1001',
    message: 'High-risk transaction detected - ₹15,000',
    time: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    severity: 'high'
  },
  {
    transactionId: 'TXN1005',
    message: 'Blacklisted device used for payment',
    time: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    severity: 'high'
  },
  {
    transactionId: 'TXN1003',
    message: 'Medium risk - Device mismatch detected',
    time: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    severity: 'medium'
  }
];

export const chartData = [
  { date: 'Mar 17', low: 450, medium: 35, high: 12 },
  { date: 'Mar 18', low: 520, medium: 42, high: 18 },
  { date: 'Mar 19', low: 480, medium: 38, high: 15 },
  { date: 'Mar 20', low: 610, medium: 45, high: 22 },
  { date: 'Mar 21', low: 590, medium: 50, high: 28 },
  { date: 'Mar 22', low: 670, medium: 55, high: 19 },
  { date: 'Mar 23', low: 720, medium: 48, high: 25 }
];
