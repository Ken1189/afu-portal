// ============================================================================
// AFU Portal — Supabase Database Types
// Generated from our schema. Update when schema changes.
// ============================================================================

export type MembershipTier = 'student' | 'new_enterprise' | 'smallholder' | 'farmer_grower' | 'commercial';
export type MemberStatus = 'pending' | 'active' | 'suspended' | 'expired';
export type SupplierStatus = 'pending' | 'active' | 'suspended';
export type SupplierCategory = 'input-supplier' | 'equipment' | 'logistics' | 'processing' | 'technology' | 'financial-services';
export type SponsorshipTier = 'platinum' | 'gold' | 'silver' | 'bronze';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'mobile_money' | 'bank_transfer' | 'cash';
export type LoanStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'disbursed' | 'repaying' | 'completed' | 'defaulted' | 'rejected';
export type UserRole = 'member' | 'supplier' | 'admin' | 'super_admin';
export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          role: UserRole;
          country: string | null;
          region: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };

      members: {
        Row: {
          id: string;
          profile_id: string;
          member_id: string;
          tier: MembershipTier;
          status: MemberStatus;
          farm_name: string | null;
          farm_size_ha: number | null;
          primary_crops: string[] | null;
          livestock_types: string[] | null;
          join_date: string;
          expiry_date: string | null;
          bio: string | null;
          certifications: string[] | null;
          credit_score: number;
          total_spent: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['members']['Row']> & {
          profile_id: string;
        };
        Update: Partial<Database['public']['Tables']['members']['Insert']>;
      };

      membership_applications: {
        Row: {
          id: string;
          profile_id: string | null;
          full_name: string;
          email: string;
          phone: string | null;
          country: string;
          region: string | null;
          farm_name: string | null;
          farm_size_ha: number | null;
          primary_crops: string[] | null;
          requested_tier: MembershipTier;
          status: ApplicationStatus;
          notes: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['membership_applications']['Row']> & {
          full_name: string;
          email: string;
          country: string;
        };
        Update: Partial<Database['public']['Tables']['membership_applications']['Insert']>;
      };

      suppliers: {
        Row: {
          id: string;
          profile_id: string | null;
          company_name: string;
          contact_name: string;
          email: string;
          phone: string | null;
          website: string | null;
          logo_url: string | null;
          category: SupplierCategory;
          status: SupplierStatus;
          country: string;
          region: string | null;
          description: string | null;
          verified: boolean;
          is_founding: boolean;
          sponsorship_tier: SponsorshipTier | null;
          commission_rate: number;
          member_discount_percent: number;
          rating: number;
          review_count: number;
          products_count: number;
          total_sales: number;
          total_orders: number;
          certifications: string[] | null;
          join_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['suppliers']['Row']> & {
          company_name: string;
          contact_name: string;
          email: string;
          category: SupplierCategory;
          country: string;
        };
        Update: Partial<Database['public']['Tables']['suppliers']['Insert']>;
      };

      products: {
        Row: {
          id: string;
          supplier_id: string;
          name: string;
          description: string | null;
          category: SupplierCategory;
          price: number;
          member_price: number | null;
          discount_percent: number;
          currency: string;
          unit: string;
          sku: string | null;
          image_url: string | null;
          images: string[] | null;
          in_stock: boolean;
          stock_quantity: number;
          sold_count: number;
          rating: number;
          review_count: number;
          featured: boolean;
          tags: string[] | null;
          specifications: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['products']['Row']> & {
          supplier_id: string;
          name: string;
          category: SupplierCategory;
          price: number;
        };
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };

      orders: {
        Row: {
          id: string;
          order_number: string;
          member_id: string;
          status: OrderStatus;
          subtotal: number;
          discount: number;
          shipping: number;
          tax: number;
          total: number;
          currency: string;
          shipping_address: Record<string, unknown> | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['orders']['Row']> & {
          member_id: string;
        };
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };

      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          supplier_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['order_items']['Row']> & {
          order_id: string;
          product_id: string;
          supplier_id: string;
          unit_price: number;
          total_price: number;
        };
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
      };

      payments: {
        Row: {
          id: string;
          order_id: string | null;
          member_id: string | null;
          amount: number;
          currency: string;
          method: PaymentMethod | null;
          status: PaymentStatus;
          payment_reference: string | null;
          gateway_response: Record<string, unknown> | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['payments']['Row']> & {
          amount: number;
        };
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };

      commissions: {
        Row: {
          id: string;
          supplier_id: string;
          order_id: string;
          order_item_id: string | null;
          sale_amount: number;
          commission_rate: number;
          commission_amount: number;
          status: PaymentStatus;
          paid_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['commissions']['Row']> & {
          supplier_id: string;
          order_id: string;
          sale_amount: number;
          commission_rate: number;
          commission_amount: number;
        };
        Update: Partial<Database['public']['Tables']['commissions']['Insert']>;
      };

      loans: {
        Row: {
          id: string;
          member_id: string;
          loan_number: string;
          loan_type: string;
          amount: number;
          interest_rate: number;
          term_months: number;
          status: LoanStatus;
          purpose: string | null;
          collateral: string | null;
          approved_by: string | null;
          approved_at: string | null;
          disbursed_at: string | null;
          due_date: string | null;
          amount_repaid: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['loans']['Row']> & {
          member_id: string;
          loan_type: string;
          amount: number;
          interest_rate: number;
          term_months: number;
        };
        Update: Partial<Database['public']['Tables']['loans']['Insert']>;
      };

      audit_log: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          details: Record<string, unknown> | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['audit_log']['Row']> & {
          action: string;
          entity_type: string;
        };
        Update: Partial<Database['public']['Tables']['audit_log']['Insert']>;
      };

      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          read: boolean;
          action_url: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['notifications']['Row']> & {
          user_id: string;
          title: string;
          message: string;
        };
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
    };
  };
}
