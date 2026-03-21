// Re-export all Supabase utilities
export { createClient } from './client';
export { createServerSupabaseClient, createAdminClient } from './server';
export { AuthProvider, useAuth } from './auth-context';
export { useSuppliers } from './use-suppliers';
export { useMembers } from './use-members';
export { useApplications } from './use-applications';
export { useProducts } from './use-products';
export { useOrders } from './use-orders';
export type * from './types';
export type { SupplierRow, SupplierInsert } from './use-suppliers';
export type { MemberRow } from './use-members';
export type { ApplicationRow, ApplicationInsert } from './use-applications';
export type { ProductRow, ProductInsert } from './use-products';
export type { OrderRow, OrderItemInsert } from './use-orders';

// Phase 1 hooks — Courses
export { useCourses, useCourseModules, useCourseEnrollments, enrollInCourse, updateProgress } from './use-courses';
// Phase 1 hooks — Farm
export { useFarmPlots, useCreateFarmPlot, useUpdateFarmPlot, useFarmActivities, useCreateFarmActivity, useFarmTransactions } from './use-farm-plots';
// Phase 1 hooks — Equipment
export { useEquipment, useEquipmentBookings, useCreateBooking } from './use-equipment';
// Phase 1 hooks — Livestock
export { useLivestock, useCreateLivestock, useUpdateLivestock, useLivestockHealthRecords, useCreateHealthRecord } from './use-livestock';
// Phase 1 hooks — Market Prices
export { useMarketPrices } from './use-market-prices';
// Phase 1 hooks — Cooperatives
export { useCooperatives, useCooperativeMembers, useJoinCooperative } from './use-cooperatives';
// Phase 1 hooks — Other
export { useInsuranceProducts, useInsurancePolicies, useInsuranceClaims } from './use-insurance';
export { useShipments } from './use-logistics';
export { useContracts } from './use-contracts';
export { useCarbonCredits } from './use-sustainability';
export { useAdvertisements } from './use-advertisements';
export { useExportDocuments } from './use-export-documents';
export { useAuditLog } from './use-audit-log';

// Phase 1 types
export type { CourseRow, CourseModuleRow, CourseEnrollmentRow } from './use-courses';
export type { FarmPlotRow, FarmActivityRow, FarmTransactionRow } from './use-farm-plots';
export type { EquipmentRow, EquipmentBookingRow } from './use-equipment';
export type { LivestockRow, LivestockHealthRecordRow } from './use-livestock';
export type { MarketPriceRow } from './use-market-prices';
export type { CooperativeRow, CooperativeMemberRow } from './use-cooperatives';
export type { InsuranceProductRow, InsurancePolicyRow, InsuranceClaimRow } from './use-insurance';
export type { ShipmentRow } from './use-logistics';
export type { OfftakeContractRow } from './use-contracts';
export type { CarbonCreditRow } from './use-sustainability';
export type { AdvertisementRow } from './use-advertisements';
export type { ExportDocumentRow } from './use-export-documents';
export type { AuditLogRow } from './use-audit-log';
