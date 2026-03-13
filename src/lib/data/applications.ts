export interface Application {
  id: string;
  memberId: string;
  memberName: string;
  memberTier: 'smallholder' | 'commercial' | 'enterprise' | 'partner';
  type: 'working-capital' | 'invoice-finance' | 'equipment' | 'input-bundle';
  amount: number;
  status: 'new' | 'documents-review' | 'credit-assessment' | 'approved' | 'rejected' | 'disbursed';
  submittedDate: string;
  lastUpdated: string;
  assignedOfficer: string;
  priority: 'high' | 'medium' | 'low';
  daysInCurrentStage: number;
  country: string;
  crop: string;
  notes: string[];
}

export const applications: Application[] = [
  { id: 'APP-2026-001', memberId: 'AFU-2024-005', memberName: 'Grace Moyo', memberTier: 'commercial', type: 'working-capital', amount: 45000, status: 'new', submittedDate: '2026-03-11', lastUpdated: '2026-03-11', assignedOfficer: 'Unassigned', priority: 'high', daysInCurrentStage: 2, country: 'Zimbabwe', crop: 'Blueberries', notes: ['First application from this member'] },
  { id: 'APP-2026-002', memberId: 'AFU-2024-012', memberName: 'Tendai Chirwa', memberTier: 'smallholder', type: 'input-bundle', amount: 3500, status: 'documents-review', submittedDate: '2026-03-08', lastUpdated: '2026-03-10', assignedOfficer: 'Lebo Molefe', priority: 'medium', daysInCurrentStage: 3, country: 'Zimbabwe', crop: 'Cassava', notes: ['Missing bank statement', 'Farm photos uploaded'] },
  { id: 'APP-2026-003', memberId: 'AFU-2024-018', memberName: 'Amina Salim', memberTier: 'commercial', type: 'invoice-finance', amount: 78000, status: 'credit-assessment', submittedDate: '2026-03-05', lastUpdated: '2026-03-09', assignedOfficer: 'David Nkomo', priority: 'high', daysInCurrentStage: 4, country: 'Tanzania', crop: 'Sesame', notes: ['Strong buyer contract with EuroFruit GmbH', 'Credit check in progress'] },
  { id: 'APP-2026-004', memberId: 'AFU-2024-003', memberName: 'John Maseko', memberTier: 'smallholder', type: 'working-capital', amount: 8000, status: 'approved', submittedDate: '2026-02-28', lastUpdated: '2026-03-07', assignedOfficer: 'Lebo Molefe', priority: 'low', daysInCurrentStage: 6, country: 'Botswana', crop: 'Sorghum', notes: ['Approved $8,000 at 15% APR', 'Awaiting disbursement'] },
  { id: 'APP-2026-005', memberId: 'AFU-2024-022', memberName: 'Farai Ndlovu', memberTier: 'smallholder', type: 'equipment', amount: 12000, status: 'new', submittedDate: '2026-03-12', lastUpdated: '2026-03-12', assignedOfficer: 'Unassigned', priority: 'medium', daysInCurrentStage: 1, country: 'Zimbabwe', crop: 'Blueberries', notes: ['Drip irrigation system request'] },
  { id: 'APP-2026-006', memberId: 'AFU-2024-031', memberName: 'Halima Mwanga', memberTier: 'commercial', type: 'working-capital', amount: 95000, status: 'documents-review', submittedDate: '2026-03-06', lastUpdated: '2026-03-10', assignedOfficer: 'David Nkomo', priority: 'high', daysInCurrentStage: 4, country: 'Tanzania', crop: 'Cassava', notes: ['Large-scale cassava processing facility', 'Land title under review'] },
  { id: 'APP-2026-007', memberId: 'AFU-2024-009', memberName: 'Kago Setshedi', memberTier: 'smallholder', type: 'input-bundle', amount: 2200, status: 'approved', submittedDate: '2026-03-01', lastUpdated: '2026-03-06', assignedOfficer: 'Lebo Molefe', priority: 'low', daysInCurrentStage: 7, country: 'Botswana', crop: 'Groundnuts', notes: ['Seasonal input bundle approved'] },
  { id: 'APP-2026-008', memberId: 'AFU-2024-015', memberName: 'Tinashe Gumbo', memberTier: 'smallholder', type: 'working-capital', amount: 5000, status: 'rejected', submittedDate: '2026-02-20', lastUpdated: '2026-02-28', assignedOfficer: 'David Nkomo', priority: 'low', daysInCurrentStage: 0, country: 'Zimbabwe', crop: 'Maize', notes: ['Insufficient documentation', 'No offtake contract', 'Advised to complete training first'] },
  { id: 'APP-2026-009', memberId: 'AFU-2024-041', memberName: 'Baraka Mushi', memberTier: 'commercial', type: 'invoice-finance', amount: 52000, status: 'credit-assessment', submittedDate: '2026-03-07', lastUpdated: '2026-03-11', assignedOfficer: 'Lebo Molefe', priority: 'medium', daysInCurrentStage: 2, country: 'Tanzania', crop: 'Sesame', notes: ['Dubai Fresh Markets invoice submitted'] },
  { id: 'APP-2026-010', memberId: 'AFU-2024-025', memberName: 'Rumbidzai Chikore', memberTier: 'smallholder', type: 'working-capital', amount: 6500, status: 'new', submittedDate: '2026-03-13', lastUpdated: '2026-03-13', assignedOfficer: 'Unassigned', priority: 'medium', daysInCurrentStage: 0, country: 'Zimbabwe', crop: 'Blueberries', notes: [] },
  { id: 'APP-2026-011', memberId: 'AFU-2024-048', memberName: 'Juma Abdallah', memberTier: 'enterprise', type: 'working-capital', amount: 185000, status: 'documents-review', submittedDate: '2026-03-04', lastUpdated: '2026-03-09', assignedOfficer: 'David Nkomo', priority: 'high', daysInCurrentStage: 4, country: 'Tanzania', crop: 'Cassava', notes: ['Enterprise-scale cassava estate', 'Multiple land titles under review', 'Site visit scheduled'] },
  { id: 'APP-2026-012', memberId: 'AFU-2024-007', memberName: 'Mpho Kgathi', memberTier: 'smallholder', type: 'equipment', amount: 4800, status: 'disbursed', submittedDate: '2026-02-15', lastUpdated: '2026-03-01', assignedOfficer: 'Lebo Molefe', priority: 'low', daysInCurrentStage: 0, country: 'Botswana', crop: 'Sorghum', notes: ['Solar pump equipment disbursed', 'Installation confirmed'] },
  { id: 'APP-2026-013', memberId: 'AFU-2024-033', memberName: 'Nyasha Mutasa', memberTier: 'commercial', type: 'working-capital', amount: 38000, status: 'new', submittedDate: '2026-03-12', lastUpdated: '2026-03-12', assignedOfficer: 'Unassigned', priority: 'medium', daysInCurrentStage: 1, country: 'Zimbabwe', crop: 'Tobacco', notes: ['Repeat borrower — excellent history'] },
  { id: 'APP-2026-014', memberId: 'AFU-2024-044', memberName: 'Rehema Kimaro', memberTier: 'smallholder', type: 'input-bundle', amount: 1800, status: 'approved', submittedDate: '2026-03-02', lastUpdated: '2026-03-08', assignedOfficer: 'David Nkomo', priority: 'low', daysInCurrentStage: 5, country: 'Tanzania', crop: 'Sesame', notes: ['Approved — awaiting delivery confirmation'] },
  { id: 'APP-2026-015', memberId: 'AFU-2024-020', memberName: 'Tatenda Hove', memberTier: 'smallholder', type: 'working-capital', amount: 7200, status: 'credit-assessment', submittedDate: '2026-03-09', lastUpdated: '2026-03-12', assignedOfficer: 'Lebo Molefe', priority: 'medium', daysInCurrentStage: 1, country: 'Zimbabwe', crop: 'Blueberries', notes: ['Good training completion record', 'First loan application'] },
];
