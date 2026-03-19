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

// Phase 1 hooks
export { useFarmPlots } from './use-farm-plots';
export { useFarmActivities } from './use-farm-activities';
export { useFarmTransactions } from './use-farm-transactions';
export { useCourses, useEnrollments } from './use-courses';
export { useInsuranceProducts, useInsurancePolicies, useInsuranceClaims } from './use-insurance';
export { useEquipment, useEquipmentBookings } from './use-equipment';
export { useLivestock, useLivestockHealth } from './use-livestock';
export { useShipments } from './use-logistics';
export { useMarketPrices, useMarketAlerts } from './use-market-prices';
export { useCooperatives, useMyCooperatives } from './use-cooperatives';
export { useContracts } from './use-contracts';
export { useCarbonCredits } from './use-sustainability';
export { useAdvertisements } from './use-advertisements';
export { useExportDocuments } from './use-export-documents';
export { useAuditLog } from './use-audit-log';

// Phase 1 types
export type { FarmPlotRow } from './use-farm-plots';
export type { FarmActivityRow } from './use-farm-activities';
export type { FarmTransactionRow } from './use-farm-transactions';
export type { CourseRow, CourseEnrollmentRow } from './use-courses';
export type { InsuranceProductRow, InsurancePolicyRow, InsuranceClaimRow } from './use-insurance';
export type { EquipmentRow, EquipmentBookingRow } from './use-equipment';
export type { LivestockRow, LivestockHealthRecordRow } from './use-livestock';
export type { ShipmentRow } from './use-logistics';
export type { MarketPriceRow, MarketPriceAlertRow } from './use-market-prices';
export type { CooperativeRow, CooperativeMemberRow } from './use-cooperatives';
export type { OfftakeContractRow } from './use-contracts';
export type { CarbonCreditRow } from './use-sustainability';
export type { AdvertisementRow } from './use-advertisements';
export type { ExportDocumentRow } from './use-export-documents';
export type { AuditLogRow } from './use-audit-log';
