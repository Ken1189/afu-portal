export interface Notification {
  id: string;
  type: 'payment' | 'application' | 'document' | 'training' | 'system' | 'market';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link: string;
  priority: 'high' | 'medium' | 'low';
}

export const notifications: Notification[] = [
  { id: 'NTF-001', type: 'payment', title: 'Payment Due in 5 Days', message: 'Your loan repayment of $2,100 for FIN-2026-003 is due on March 20, 2026.', timestamp: '2026-03-13T08:00:00Z', read: false, link: '/dashboard/financing', priority: 'high' },
  { id: 'NTF-002', type: 'application', title: 'Application Under Review', message: 'Your financing application APP-2026-010 is now being reviewed by our credit team.', timestamp: '2026-03-12T14:30:00Z', read: false, link: '/dashboard/financing', priority: 'medium' },
  { id: 'NTF-003', type: 'training', title: 'New Course Available', message: 'Drone Technology in Agriculture is now available. Recommended for your farm profile.', timestamp: '2026-03-12T09:00:00Z', read: false, link: '/dashboard/training', priority: 'low' },
  { id: 'NTF-004', type: 'market', title: 'Blueberry Price Alert', message: 'Blueberry export prices rose 3.2% this week to $12.50/kg. Good time to consider selling.', timestamp: '2026-03-11T16:00:00Z', read: true, link: '/dashboard', priority: 'medium' },
  { id: 'NTF-005', type: 'document', title: 'Document Verified', message: 'Your passport document has been verified successfully by our team.', timestamp: '2026-03-11T11:20:00Z', read: true, link: '/dashboard/documents', priority: 'low' },
  { id: 'NTF-006', type: 'system', title: 'Welcome to AFU!', message: 'Your membership application has been approved. Complete your profile to unlock all features.', timestamp: '2026-03-10T08:00:00Z', read: true, link: '/dashboard/profile', priority: 'medium' },
  { id: 'NTF-007', type: 'payment', title: 'Payment Received', message: 'Your payment of $2,100 for loan FIN-2026-001 has been received. Thank you!', timestamp: '2026-03-08T10:15:00Z', read: true, link: '/dashboard/financing', priority: 'low' },
  { id: 'NTF-008', type: 'training', title: 'Course Completed!', message: 'Congratulations! You completed "Financial Record Keeping for Farmers". Your certificate is ready.', timestamp: '2026-03-07T15:45:00Z', read: true, link: '/dashboard/training', priority: 'low' },
  { id: 'NTF-009', type: 'document', title: 'Document Expiring Soon', message: 'Your passport expires in 60 days (May 12, 2026). Please renew to maintain your KYC status.', timestamp: '2026-03-07T08:00:00Z', read: false, link: '/dashboard/documents', priority: 'high' },
  { id: 'NTF-010', type: 'application', title: 'Application Approved!', message: 'Your input bundle application APP-2026-007 has been approved for $2,200. Check details.', timestamp: '2026-03-06T14:00:00Z', read: true, link: '/dashboard/financing', priority: 'high' },
  { id: 'NTF-011', type: 'market', title: 'Sesame Demand Rising', message: 'Dubai Fresh Markets increased their sesame order volume by 15%. New opportunity for growers.', timestamp: '2026-03-05T09:30:00Z', read: true, link: '/dashboard/offtake', priority: 'medium' },
  { id: 'NTF-012', type: 'system', title: 'Scheduled Maintenance', message: 'The platform will undergo maintenance on March 15 from 2:00-4:00 AM CAT. Expect brief downtime.', timestamp: '2026-03-04T08:00:00Z', read: true, link: '/dashboard', priority: 'low' },
  { id: 'NTF-013', type: 'training', title: 'Quiz Results', message: 'You scored 85% on the Blueberry Cultivation quiz. You passed! Review your answers.', timestamp: '2026-03-03T16:20:00Z', read: true, link: '/dashboard/training', priority: 'low' },
  { id: 'NTF-014', type: 'payment', title: 'Payment Overdue', message: 'Your loan repayment of $1,500 for FIN-2026-005 was due on March 1. Please pay immediately.', timestamp: '2026-03-02T08:00:00Z', read: true, link: '/dashboard/financing', priority: 'high' },
  { id: 'NTF-015', type: 'document', title: 'Document Rejected', message: 'Your bank statement upload was rejected: "Document is older than 3 months. Please upload a recent one."', timestamp: '2026-03-01T11:00:00Z', read: true, link: '/dashboard/documents', priority: 'high' },
  { id: 'NTF-016', type: 'market', title: 'Cassava Price Update', message: 'Local cassava prices dropped 1.1% to $0.15/kg due to seasonal oversupply. Consider processing for value addition.', timestamp: '2026-02-28T15:00:00Z', read: true, link: '/dashboard', priority: 'low' },
  { id: 'NTF-017', type: 'system', title: 'New Feature: Crop Scanner', message: 'Try our new AI Crop Health Scanner! Upload a photo of your crop for instant diagnosis.', timestamp: '2026-02-25T08:00:00Z', read: true, link: '/dashboard', priority: 'medium' },
  { id: 'NTF-018', type: 'training', title: 'Learning Streak!', message: 'You have a 5-day learning streak. Keep going to earn the Dedicated Learner badge!', timestamp: '2026-02-24T09:00:00Z', read: true, link: '/dashboard/training', priority: 'low' },
];
