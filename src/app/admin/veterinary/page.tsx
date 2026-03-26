'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope,
  Calendar,
  Clock,
  CheckCircle2,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  AlertTriangle,
  MapPin,
  User,
  Syringe,
  Activity,
  FlaskConical,
  Heart,
  Bug,
} from 'lucide-react';

// -- Types --------------------------------------------------------------------

type AppointmentStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Emergency';
type AppointmentPriority = 'Urgent' | 'Normal' | 'Low';
type AnimalType = 'Cattle' | 'Goats' | 'Poultry' | 'Pigs';
type ServiceType = 'Routine Check' | 'Vaccination' | 'Emergency' | 'Breeding' | 'Lab Test';

interface VetAppointment {
  id: string;
  farmerName: string;
  farmLocation: string;
  animalType: AnimalType;
  animalCount: number;
  serviceType: ServiceType;
  description: string;
  status: AppointmentStatus;
  assignedVet: string;
  dateScheduled: string;
  priority: AppointmentPriority;
  notes: string;
}

// -- Demo Data ----------------------------------------------------------------

const vetAppointments: VetAppointment[] = [
  {
    id: 'VET-001',
    farmerName: 'Kwame Asante',
    farmLocation: 'Ghana',
    animalType: 'Cattle',
    animalCount: 35,
    serviceType: 'Vaccination',
    description: 'Annual FMD and brucellosis vaccination for dairy herd.',
    status: 'Scheduled',
    assignedVet: 'Dr. Abena Mensah',
    dateScheduled: '2026-03-28',
    priority: 'Normal',
    notes: 'Farmer has cold chain storage on-site. Vaccines to be delivered day before.',
  },
  {
    id: 'VET-002',
    farmerName: 'Blessing Okoro',
    farmLocation: 'Nigeria',
    animalType: 'Poultry',
    animalCount: 2000,
    serviceType: 'Emergency',
    description: 'Suspected Newcastle disease outbreak in layer flock. High mortality reported.',
    status: 'Emergency',
    assignedVet: 'Dr. Chinedu Eze',
    dateScheduled: '2026-03-26',
    priority: 'Urgent',
    notes: 'Quarantine measures initiated. Lab samples collected and en route to diagnostic center.',
  },
  {
    id: 'VET-003',
    farmerName: 'Jean-Pierre Habimana',
    farmLocation: 'Rwanda',
    animalType: 'Cattle',
    animalCount: 12,
    serviceType: 'Routine Check',
    description: 'Quarterly health check and deworming for dairy cows.',
    status: 'Completed',
    assignedVet: 'Dr. Claire Uwimana',
    dateScheduled: '2026-03-18',
    priority: 'Low',
    notes: 'All animals in good health. Deworming completed. Next check scheduled for June.',
  },
  {
    id: 'VET-004',
    farmerName: 'Tendai Moyo',
    farmLocation: 'Zimbabwe',
    animalType: 'Goats',
    animalCount: 80,
    serviceType: 'Breeding',
    description: 'AI program for Boer goat crossbreeding to improve meat production genetics.',
    status: 'In Progress',
    assignedVet: 'Dr. Farai Chipunza',
    dateScheduled: '2026-03-25',
    priority: 'Normal',
    notes: 'First batch of 25 does inseminated. Monitoring for heat cycle synchronization.',
  },
  {
    id: 'VET-005',
    farmerName: 'Mariama Bah',
    farmLocation: 'Senegal',
    animalType: 'Cattle',
    animalCount: 50,
    serviceType: 'Lab Test',
    description: 'TB and brucellosis testing required for export health certificate.',
    status: 'Scheduled',
    assignedVet: 'Dr. Ousmane Diop',
    dateScheduled: '2026-03-30',
    priority: 'Normal',
    notes: 'Export permit pending test results. Buyer requires certified disease-free status.',
  },
  {
    id: 'VET-006',
    farmerName: 'Esther Wanjiku',
    farmLocation: 'Kenya',
    animalType: 'Pigs',
    animalCount: 120,
    serviceType: 'Vaccination',
    description: 'African Swine Fever vaccination and biosecurity audit for commercial piggery.',
    status: 'Completed',
    assignedVet: 'Dr. James Ouma',
    dateScheduled: '2026-03-15',
    priority: 'Normal',
    notes: 'Vaccination complete. Biosecurity gaps identified and improvement plan issued.',
  },
  {
    id: 'VET-007',
    farmerName: 'Ibrahim Keita',
    farmLocation: 'Mali',
    animalType: 'Goats',
    animalCount: 200,
    serviceType: 'Emergency',
    description: 'Severe parasitic infestation detected across goat herd. Weight loss and anemia.',
    status: 'Emergency',
    assignedVet: 'Dr. Aminata Traore',
    dateScheduled: '2026-03-26',
    priority: 'Urgent',
    notes: 'Emergency deworming deployed. Fecal samples sent to lab. Follow-up in 14 days.',
  },
  {
    id: 'VET-008',
    farmerName: 'Agnes Nalwoga',
    farmLocation: 'Uganda',
    animalType: 'Poultry',
    animalCount: 5000,
    serviceType: 'Routine Check',
    description: 'Pre-production health assessment for new batch of broiler chicks.',
    status: 'Scheduled',
    assignedVet: 'Dr. Moses Kato',
    dateScheduled: '2026-04-01',
    priority: 'Low',
    notes: 'Chicks arriving from hatchery April 1. Farm sanitized and brooder house prepared.',
  },
];

// -- Helpers ------------------------------------------------------------------

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const statusStyles: Record<AppointmentStatus, string> = {
  Scheduled: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Emergency: 'bg-red-100 text-red-700',
};

const priorityStyles: Record<AppointmentPriority, string> = {
  Urgent: 'bg-red-100 text-red-700',
  Normal: 'bg-amber-100 text-amber-700',
  Low: 'bg-gray-100 text-gray-500',
};

const serviceTypeIcons: Record<ServiceType, React.ReactNode> = {
  'Routine Check': <Activity className="w-3.5 h-3.5" />,
  Vaccination: <Syringe className="w-3.5 h-3.5" />,
  Emergency: <AlertTriangle className="w-3.5 h-3.5" />,
  Breeding: <Heart className="w-3.5 h-3.5" />,
  'Lab Test': <FlaskConical className="w-3.5 h-3.5" />,
};

const statCounts = {
  total: 156,
  upcoming: 23,
  completed: 121,
  emergencyActive: 3,
};

// -- Animation Variants -------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

// -- Component ----------------------------------------------------------------

export default function VeterinaryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'All'>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const statusFilters: (AppointmentStatus | 'All')[] = [
    'All',
    'Scheduled',
    'In Progress',
    'Completed',
    'Emergency',
  ];

  const filtered = vetAppointments.filter((a) => {
    if (statusFilter !== 'All' && a.status !== statusFilter) return false;
    if (
      searchQuery &&
      !a.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !a.animalType.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !a.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !a.farmLocation.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !a.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={cardVariants}>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-[#1B2A4A] rounded-lg">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A] tracking-tight">
              Veterinary Services
            </h1>
            <p className="text-gray-500 text-sm">
              Manage veterinary appointments and animal health services
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Appointments',
            value: statCounts.total,
            icon: <Calendar className="w-5 h-5" />,
            color: 'text-[#1B2A4A]',
            bg: 'bg-gray-50',
          },
          {
            label: 'Upcoming',
            value: statCounts.upcoming,
            icon: <Clock className="w-5 h-5" />,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'Completed',
            value: statCounts.completed,
            icon: <CheckCircle2 className="w-5 h-5" />,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Emergency Active',
            value: statCounts.emergencyActive,
            icon: <AlertTriangle className="w-5 h-5" />,
            color: 'text-red-600',
            bg: 'bg-red-50',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={cardVariants}
            custom={i}
            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {stat.label}
              </span>
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>{stat.icon}</div>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by farmer, animal type, service, location, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] text-[#1B2A4A]"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  statusFilter === s
                    ? s === 'Emergency'
                      ? 'bg-red-600 text-white'
                      : 'bg-[#1B2A4A] text-white'
                    : s === 'Emergency'
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Appointments List */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#1B2A4A]">Veterinary Appointments</h2>
          <span className="text-xs text-gray-400">{filtered.length} results</span>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Farmer
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Animals
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((appt) => {
                const isExpanded = expandedId === appt.id;

                return (
                  <AnimatePresence key={appt.id}>
                    <tr
                      className={`hover:bg-gray-50/50 transition-colors ${
                        isExpanded
                          ? 'bg-blue-50/30'
                          : appt.status === 'Emergency'
                            ? 'bg-red-50/20'
                            : ''
                      }`}
                    >
                      <td className="px-6 py-4 font-mono text-xs text-gray-500 whitespace-nowrap">
                        {appt.id}
                      </td>
                      <td className="px-6 py-4 font-medium text-[#1B2A4A] whitespace-nowrap">
                        {appt.farmerName}
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {appt.farmLocation}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-600">
                          {appt.animalType}
                        </span>
                        <span className="ml-1.5 text-xs text-gray-400">
                          ({appt.animalCount.toLocaleString()})
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-gray-600">
                          {serviceTypeIcons[appt.serviceType]}
                          {appt.serviceType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${priorityStyles[appt.priority]}`}
                        >
                          {appt.priority === 'Urgent' && <AlertTriangle className="w-3 h-3" />}
                          {appt.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[appt.status]}`}
                        >
                          {appt.status === 'Emergency' && (
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5 animate-pulse" />
                          )}
                          {appt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {formatDate(appt.dateScheduled)}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : appt.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#1B2A4A]"
                          title="View details"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Detail Row */}
                    {isExpanded && (
                      <tr key={`${appt.id}-detail`}>
                        <td colSpan={9} className="px-6 py-0">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-dashed border-gray-200">
                              <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                  Description
                                </p>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  {appt.description}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                  Assigned Veterinarian
                                </p>
                                <p className="text-sm text-[#1B2A4A] font-medium">
                                  <User className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />
                                  {appt.assignedVet}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {appt.animalType} &middot; {appt.animalCount.toLocaleString()} animals
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                  Notes
                                </p>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  {appt.notes || 'No notes'}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {filtered.map((appt) => {
            const isExpanded = expandedId === appt.id;

            return (
              <div
                key={appt.id}
                className={`p-4 ${appt.status === 'Emergency' ? 'bg-red-50/30' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-[#1B2A4A]">{appt.farmerName}</p>
                    <p className="text-xs text-gray-500">
                      {appt.id} &middot; {appt.farmLocation}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[appt.status]}`}
                  >
                    {appt.status === 'Emergency' && (
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block mr-1 animate-pulse" />
                    )}
                    {appt.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                    {serviceTypeIcons[appt.serviceType]}
                    {appt.serviceType}
                  </span>
                  <span className="text-xs text-gray-500">
                    {appt.animalType} ({appt.animalCount.toLocaleString()})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-400">{formatDate(appt.dateScheduled)}</p>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityStyles[appt.priority]}`}
                    >
                      {appt.priority}
                    </span>
                  </div>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : appt.id)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-3 pt-3 border-t border-dashed border-gray-200 space-y-2"
                  >
                    <p className="text-xs text-gray-600">{appt.description}</p>
                    <p className="text-xs text-gray-600">
                      <User className="w-3 h-3 inline mr-1" />
                      {appt.assignedVet}
                    </p>
                    <p className="text-xs text-gray-500 italic">{appt.notes}</p>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No appointments match your filters.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
