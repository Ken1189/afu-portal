export interface Activity {
  id: string;
  memberId: string;
  memberName: string;
  type: 'application' | 'payment' | 'document' | 'training' | 'login' | 'profile' | 'contract';
  description: string;
  timestamp: string;
  icon: string;
}

export const activities: Activity[] = [
  { id: 'ACT-001', memberId: 'AFU-2024-005', memberName: 'Grace Moyo', type: 'application', description: 'Submitted financing application for $45,000 working capital', timestamp: '2026-03-13T09:15:00Z', icon: 'FileText' },
  { id: 'ACT-002', memberId: 'AFU-2024-025', memberName: 'Rumbidzai Chikore', type: 'application', description: 'Submitted financing application for $6,500', timestamp: '2026-03-13T08:42:00Z', icon: 'FileText' },
  { id: 'ACT-003', memberId: 'AFU-2024-018', memberName: 'Amina Salim', type: 'document', description: 'Uploaded invoice from EuroFruit GmbH', timestamp: '2026-03-12T16:30:00Z', icon: 'Upload' },
  { id: 'ACT-004', memberId: 'AFU-2024-022', memberName: 'Farai Ndlovu', type: 'training', description: 'Completed "Drip Irrigation Setup & Management" course', timestamp: '2026-03-12T14:20:00Z', icon: 'GraduationCap' },
  { id: 'ACT-005', memberId: 'AFU-2024-033', memberName: 'Nyasha Mutasa', type: 'application', description: 'Submitted financing application for $38,000 working capital', timestamp: '2026-03-12T11:00:00Z', icon: 'FileText' },
  { id: 'ACT-006', memberId: 'AFU-2024-041', memberName: 'Baraka Mushi', type: 'contract', description: 'Logged delivery: 15,000kg sesame to Dubai Fresh Markets', timestamp: '2026-03-12T08:30:00Z', icon: 'Truck' },
  { id: 'ACT-007', memberId: 'AFU-2024-012', memberName: 'Tendai Chirwa', type: 'document', description: 'Uploaded farm photos (3 images)', timestamp: '2026-03-11T15:45:00Z', icon: 'Image' },
  { id: 'ACT-008', memberId: 'AFU-2024-003', memberName: 'John Maseko', type: 'payment', description: 'Payment of $1,800 received for loan FIN-2026-002', timestamp: '2026-03-11T10:20:00Z', icon: 'DollarSign' },
  { id: 'ACT-009', memberId: 'AFU-2024-031', memberName: 'Halima Mwanga', type: 'profile', description: 'Updated farm details — added irrigation system', timestamp: '2026-03-11T09:00:00Z', icon: 'Edit' },
  { id: 'ACT-010', memberId: 'AFU-2024-048', memberName: 'Juma Abdallah', type: 'contract', description: 'Logged delivery: 50,000kg cassava to Carrefour Africa', timestamp: '2026-03-10T16:00:00Z', icon: 'Truck' },
  { id: 'ACT-011', memberId: 'AFU-2024-009', memberName: 'Kago Setshedi', type: 'training', description: 'Started "Soil Health & Fertility Management" course', timestamp: '2026-03-10T13:15:00Z', icon: 'BookOpen' },
  { id: 'ACT-012', memberId: 'AFU-2024-044', memberName: 'Rehema Kimaro', type: 'login', description: 'Logged in from mobile device', timestamp: '2026-03-10T07:30:00Z', icon: 'Smartphone' },
  { id: 'ACT-013', memberId: 'AFU-2024-007', memberName: 'Mpho Kgathi', type: 'payment', description: 'Equipment finance disbursement of $4,800 confirmed', timestamp: '2026-03-09T14:00:00Z', icon: 'DollarSign' },
  { id: 'ACT-014', memberId: 'AFU-2024-015', memberName: 'Tinashe Gumbo', type: 'training', description: 'Completed "Financial Record Keeping" course — scored 85%', timestamp: '2026-03-09T11:45:00Z', icon: 'Award' },
  { id: 'ACT-015', memberId: 'AFU-2024-020', memberName: 'Tatenda Hove', type: 'document', description: 'Uploaded bank statement (3 months)', timestamp: '2026-03-09T09:30:00Z', icon: 'Upload' },
  { id: 'ACT-016', memberId: 'AFU-2024-005', memberName: 'Grace Moyo', type: 'contract', description: 'Logged delivery: 3,200kg blueberries to Berry Fresh UK — Grade A', timestamp: '2026-03-08T15:00:00Z', icon: 'Truck' },
  { id: 'ACT-017', memberId: 'AFU-2024-018', memberName: 'Amina Salim', type: 'payment', description: 'Payment of $3,400 received for loan FIN-2026-008', timestamp: '2026-03-08T10:00:00Z', icon: 'DollarSign' },
  { id: 'ACT-018', memberId: 'AFU-2024-031', memberName: 'Halima Mwanga', type: 'training', description: 'Enrolled in "Export Quality Standards — EU Market"', timestamp: '2026-03-07T14:30:00Z', icon: 'BookOpen' },
  { id: 'ACT-019', memberId: 'AFU-2024-022', memberName: 'Farai Ndlovu', type: 'document', description: 'Passport verified by admin', timestamp: '2026-03-07T11:00:00Z', icon: 'CheckCircle' },
  { id: 'ACT-020', memberId: 'AFU-2024-041', memberName: 'Baraka Mushi', type: 'profile', description: 'Updated banking details', timestamp: '2026-03-06T16:15:00Z', icon: 'Edit' },
  { id: 'ACT-021', memberId: 'AFU-2024-003', memberName: 'John Maseko', type: 'training', description: 'Completed "Understanding Agricultural Finance" — earned certificate', timestamp: '2026-03-06T13:00:00Z', icon: 'Award' },
  { id: 'ACT-022', memberId: 'AFU-2024-012', memberName: 'Tendai Chirwa', type: 'application', description: 'Submitted input bundle application for $3,500', timestamp: '2026-03-05T10:30:00Z', icon: 'FileText' },
  { id: 'ACT-023', memberId: 'AFU-2024-048', memberName: 'Juma Abdallah', type: 'payment', description: 'Payment of $8,500 received for loan FIN-2026-012', timestamp: '2026-03-05T09:00:00Z', icon: 'DollarSign' },
  { id: 'ACT-024', memberId: 'AFU-2024-033', memberName: 'Nyasha Mutasa', type: 'login', description: 'Logged in — reviewed offtake contract renewal', timestamp: '2026-03-04T15:45:00Z', icon: 'LogIn' },
  { id: 'ACT-025', memberId: 'AFU-2024-009', memberName: 'Kago Setshedi', type: 'document', description: 'Uploaded land title document', timestamp: '2026-03-04T11:20:00Z', icon: 'Upload' },
  { id: 'ACT-026', memberId: 'AFU-2024-044', memberName: 'Rehema Kimaro', type: 'payment', description: 'Membership fee of $50 paid for 2026', timestamp: '2026-03-03T08:00:00Z', icon: 'CreditCard' },
  { id: 'ACT-027', memberId: 'AFU-2024-005', memberName: 'Grace Moyo', type: 'training', description: 'Started "Post-Harvest Handling & Cold Chain" course', timestamp: '2026-03-02T14:00:00Z', icon: 'BookOpen' },
  { id: 'ACT-028', memberId: 'AFU-2024-007', memberName: 'Mpho Kgathi', type: 'application', description: 'Equipment finance application approved for $4,800', timestamp: '2026-03-01T10:00:00Z', icon: 'CheckCircle' },
  { id: 'ACT-029', memberId: 'AFU-2024-020', memberName: 'Tatenda Hove', type: 'profile', description: 'Completed farm profile — added crop plan and equipment list', timestamp: '2026-02-28T16:00:00Z', icon: 'Edit' },
  { id: 'ACT-030', memberId: 'AFU-2024-015', memberName: 'Tinashe Gumbo', type: 'application', description: 'Financing application rejected — insufficient documentation', timestamp: '2026-02-28T11:30:00Z', icon: 'XCircle' },
];
