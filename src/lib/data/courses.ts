export interface Course {
  id: string;
  title: string;
  description: string;
  category: 'Farm Management' | 'Export Compliance' | 'Financial Literacy' | 'Crop-Specific' | 'Post-Harvest' | 'Technology';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  modules: number;
  instructor: string;
  rating: number;
  enrollmentCount: number;
  image: string;
  completionRate: number;
  topics: string[];
}

export const courses: Course[] = [
  {
    id: 'CRS-001', title: 'Introduction to Blueberry Cultivation', description: 'Learn the fundamentals of growing export-quality blueberries in sub-Saharan Africa, from site selection to first harvest.', category: 'Crop-Specific', difficulty: 'Beginner', duration: '3 hours', modules: 6, instructor: 'Dr. Chipo Madziva', rating: 4.8, enrollmentCount: 142, image: 'https://images.unsplash.com/photo-1498579809087-ef1e558fd1da?w=400&h=300&fit=crop', completionRate: 72, topics: ['Site Selection', 'Soil Preparation', 'Planting', 'Irrigation', 'Pruning', 'First Harvest'],
  },
  {
    id: 'CRS-002', title: 'Financial Record Keeping for Farmers', description: 'Master basic financial records, cash flow tracking, and budgeting to make your farm bankable and ready for financing.', category: 'Financial Literacy', difficulty: 'Beginner', duration: '2 hours', modules: 5, instructor: 'Lebo Molefe', rating: 4.6, enrollmentCount: 198, image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop', completionRate: 65, topics: ['Income Tracking', 'Expense Management', 'Cash Flow', 'Budgeting', 'Tax Basics'],
  },
  {
    id: 'CRS-003', title: 'Export Quality Standards — EU Market', description: 'Understand GlobalGAP, MRL requirements, and traceability systems needed to export fresh produce to European markets.', category: 'Export Compliance', difficulty: 'Intermediate', duration: '4 hours', modules: 8, instructor: 'Prof. Tendai Mukasa', rating: 4.7, enrollmentCount: 87, image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop', completionRate: 58, topics: ['GlobalGAP Certification', 'MRL Compliance', 'Traceability', 'Packaging Standards', 'Cold Chain', 'Documentation', 'Inspections', 'Market Access'],
  },
  {
    id: 'CRS-004', title: 'Cassava Processing & Value Addition', description: 'Transform raw cassava into high-value products including starch, flour, and chips for domestic and export markets.', category: 'Post-Harvest', difficulty: 'Intermediate', duration: '3.5 hours', modules: 7, instructor: 'Dr. Amina Hassan', rating: 4.5, enrollmentCount: 156, image: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=400&h=300&fit=crop', completionRate: 61, topics: ['Harvest Timing', 'Storage Methods', 'Peeling & Washing', 'Drying Techniques', 'Starch Extraction', 'Quality Control', 'Packaging'],
  },
  {
    id: 'CRS-005', title: 'Drip Irrigation Setup & Management', description: 'Design, install, and maintain efficient drip irrigation systems to maximize water use and crop yields.', category: 'Technology', difficulty: 'Intermediate', duration: '2.5 hours', modules: 5, instructor: 'Eng. Kabo Mothibi', rating: 4.9, enrollmentCount: 113, image: 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=400&h=300&fit=crop', completionRate: 70, topics: ['System Design', 'Installation', 'Scheduling', 'Maintenance', 'Troubleshooting'],
  },
  {
    id: 'CRS-006', title: 'Understanding Agricultural Finance', description: 'Learn how working capital, invoice finance, and trade finance work so you can choose the right product for your farm.', category: 'Financial Literacy', difficulty: 'Beginner', duration: '1.5 hours', modules: 4, instructor: 'Lebo Molefe', rating: 4.4, enrollmentCount: 210, image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop', completionRate: 78, topics: ['Working Capital', 'Invoice Finance', 'Interest Rates', 'Loan Applications'],
  },
  {
    id: 'CRS-007', title: 'Sesame Farming — Seed to Sale', description: 'Complete guide to sesame cultivation in East Africa, covering varieties, planting, pest management, and market access.', category: 'Crop-Specific', difficulty: 'Beginner', duration: '2.5 hours', modules: 6, instructor: 'Dr. Juma Bakari', rating: 4.6, enrollmentCount: 134, image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&h=300&fit=crop', completionRate: 67, topics: ['Variety Selection', 'Land Preparation', 'Planting', 'Pest Management', 'Harvesting', 'Marketing'],
  },
  {
    id: 'CRS-008', title: 'Post-Harvest Handling & Cold Chain', description: 'Reduce losses by 30%+ through proper post-harvest handling, cooling, storage, and transport of fresh produce.', category: 'Post-Harvest', difficulty: 'Advanced', duration: '4 hours', modules: 8, instructor: 'Prof. Tendai Mukasa', rating: 4.8, enrollmentCount: 76, image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop', completionRate: 52, topics: ['Harvest Techniques', 'Cooling Methods', 'Cold Storage', 'Temperature Monitoring', 'Transport Logistics', 'Quality Grading', 'Loss Prevention', 'Documentation'],
  },
  {
    id: 'CRS-009', title: 'Soil Health & Fertility Management', description: 'Test, understand, and improve your soil to build long-term fertility and sustainable crop production.', category: 'Farm Management', difficulty: 'Intermediate', duration: '3 hours', modules: 6, instructor: 'Dr. Chipo Madziva', rating: 4.7, enrollmentCount: 165, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop', completionRate: 63, topics: ['Soil Testing', 'pH Management', 'Organic Matter', 'Fertilizer Types', 'Application Methods', 'Cover Cropping'],
  },
  {
    id: 'CRS-010', title: 'Farm Business Planning', description: 'Create a professional business plan for your farm, including financial projections, market analysis, and growth strategy.', category: 'Farm Management', difficulty: 'Advanced', duration: '5 hours', modules: 10, instructor: 'Lebo Molefe', rating: 4.5, enrollmentCount: 98, image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop', completionRate: 45, topics: ['Executive Summary', 'Market Analysis', 'Operations Plan', 'Financial Projections', 'Risk Assessment', 'Funding Strategy', 'Marketing Plan', 'HR Planning', 'Implementation Timeline', 'Monitoring & Evaluation'],
  },
  {
    id: 'CRS-011', title: 'Integrated Pest Management', description: 'Protect your crops using biological, cultural, and chemical methods while meeting export quality standards.', category: 'Farm Management', difficulty: 'Intermediate', duration: '2.5 hours', modules: 5, instructor: 'Dr. Amina Hassan', rating: 4.6, enrollmentCount: 121, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop', completionRate: 59, topics: ['Pest Identification', 'Biological Control', 'Cultural Methods', 'Chemical Options', 'Record Keeping'],
  },
  {
    id: 'CRS-012', title: 'Drone Technology in Agriculture', description: 'Introduction to agricultural drones for crop monitoring, spraying, and precision farming applications.', category: 'Technology', difficulty: 'Advanced', duration: '3 hours', modules: 6, instructor: 'Eng. Kabo Mothibi', rating: 4.9, enrollmentCount: 64, image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&h=300&fit=crop', completionRate: 48, topics: ['Drone Types', 'Flight Planning', 'Crop Monitoring', 'NDVI Analysis', 'Spray Applications', 'Regulations'],
  },
];
