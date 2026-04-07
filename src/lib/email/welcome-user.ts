// ---------------------------------------------------------------------------
// Welcome email helper — sends a branded welcome email to a newly created
// user with a dynamically generated list of the portals and features they
// have access to based on their role + capabilities.
// ---------------------------------------------------------------------------

import { sendEmail } from './resend';

const FROM = 'African Farming Union <noreply@mail.africanfarmingunion.org>';
const REPLY_TO = 'info@africanfarmingunion.org';
const BASE_URL = 'https://www.africanfarmingunion.org';

function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface PortalAccess {
  portal: string;
  url: string;
  features: string[];
}

/**
 * Returns the list of portals and features a user has access to based on
 * their primary role + additive capabilities.
 */
export function getUserAccess(
  role: string | null | undefined,
  capabilities: string[] = []
): PortalAccess[] {
  const access: PortalAccess[] = [];
  const added = new Set<string>();

  const add = (p: PortalAccess) => {
    if (added.has(p.portal)) return;
    added.add(p.portal);
    access.push(p);
  };

  const normalizedRole = role || 'member';

  // ── Primary role access ────────────────────────────────────────────
  if (normalizedRole === 'farmer' || normalizedRole === 'member') {
    add({
      portal: 'Farmer Hub',
      url: `${BASE_URL}/farm`,
      features: [
        'My Farms',
        'Crops & Plots',
        'Livestock',
        'Journal',
        'Marketplace',
        'Orders',
        'Loans',
        'Training',
        'Carbon Credits',
        'Weather',
        'Profile',
        'Wallet',
      ],
    });
  }

  if (normalizedRole === 'supplier') {
    add({
      portal: 'Supplier Portal',
      url: `${BASE_URL}/supplier`,
      features: [
        'Profile & Verification',
        'Products & Inventory',
        'Orders',
        'Customers',
        'Commissions',
        'Subscription Billing',
        'Sponsorship Tiers',
        'Reviews',
        'Analytics',
        'Settings',
      ],
    });
  }

  if (normalizedRole === 'ambassador') {
    add({
      portal: 'Ambassador Portal',
      url: `${BASE_URL}/ambassador`,
      features: [
        'Referral Link & QR',
        'Referrals Dashboard',
        'Commissions',
        'Payouts',
        'Training Resources',
        'Tier Progression (Bronze→Diamond)',
        'Materials Library',
      ],
    });
  }

  if (normalizedRole === 'investor') {
    add({
      portal: 'Investor Portal',
      url: `${BASE_URL}/investor`,
      features: [
        'Investment Opportunities',
        'Portfolio',
        'Documents',
        'Updates from Founders',
        'Impact Reports',
        'KYC Status',
        'Wallet',
      ],
    });
  }

  if (normalizedRole === 'partner') {
    add({
      portal: 'Partner Portal',
      url: `${BASE_URL}/supplier`,
      features: [
        'Profile & Verification',
        'Products & Inventory',
        'Orders',
        'Customers',
        'Commissions',
        'Partner-Tier Benefits',
        'Co-Branded Landing Pages',
        'Sponsorship Tiers',
        'Analytics',
        'Settings',
      ],
    });
  }

  if (normalizedRole === 'admin') {
    add({
      portal: 'Admin Portal',
      url: `${BASE_URL}/admin`,
      features: [
        'Members',
        'Applications',
        'Payments',
        'Loans',
        'Suppliers',
        'Subscriptions',
        'Payouts',
        'Disputes',
        'Analytics',
        'Reports',
        'Content Editor',
        'Settings',
      ],
    });
  }

  if (normalizedRole === 'super_admin') {
    add({
      portal: 'Admin Portal (Full Access)',
      url: `${BASE_URL}/admin`,
      features: [
        'Members',
        'Applications',
        'Payments',
        'Loans',
        'Suppliers',
        'Subscriptions',
        'Payouts',
        'Disputes',
        'Analytics',
        'Reports',
        'Content Editor',
        'Settings',
        'Run Migrations',
        'System Settings',
        'Roles & Permissions',
        'Impersonate',
        'Audit Log',
      ],
    });
  }

  // ── Capability add-ons ─────────────────────────────────────────────
  if (capabilities.includes('ambassador')) {
    add({
      portal: 'Ambassador Portal',
      url: `${BASE_URL}/ambassador`,
      features: [
        'Referral Link & QR',
        'Referrals Dashboard',
        'Commissions',
        'Payouts',
        'Training Resources',
        'Tier Progression (Bronze→Diamond)',
        'Materials Library',
      ],
    });
  }

  if (capabilities.includes('supplier')) {
    add({
      portal: 'Supplier Portal',
      url: `${BASE_URL}/supplier`,
      features: [
        'Profile & Verification',
        'Products & Inventory',
        'Orders',
        'Customers',
        'Commissions',
        'Subscription Billing',
        'Reviews',
        'Analytics',
        'Settings',
      ],
    });
  }

  if (capabilities.includes('investor')) {
    add({
      portal: 'Investor Portal',
      url: `${BASE_URL}/investor`,
      features: [
        'Investment Opportunities',
        'Portfolio',
        'Documents',
        'Updates from Founders',
        'Impact Reports',
        'KYC Status',
        'Wallet',
      ],
    });
  }

  if (capabilities.includes('sponsor')) {
    add({
      portal: 'Sponsor a Program',
      url: `${BASE_URL}/supplier/sponsorships`,
      features: [
        'Browse Programs',
        'Sponsor Tiers',
        'Active Sponsorships',
        'Impact Tracking',
        'Branded Content',
      ],
    });
  }

  if (capabilities.includes('advisor')) {
    add({
      portal: 'Advisor Hub',
      url: `${BASE_URL}/advisor`,
      features: [
        'Advisory Dashboard',
        'Client Portfolios',
        'Resources',
        'Reports',
      ],
    });
  }

  if (capabilities.includes('warehouse_op')) {
    add({
      portal: 'Warehouse Portal',
      url: `${BASE_URL}/warehouse`,
      features: [
        'Inbound Receiving',
        'Inspections',
        'Storage Inventory',
        'Outbound Dispatch',
        'Receipts (Warehouse Receipts for Collateral)',
        'Profile',
      ],
    });
  }

  return access;
}

function renderPortalCard(p: PortalAccess): string {
  const safePortal = escapeHtml(p.portal);
  const safeUrl = escapeHtml(p.url);

  // Split features into two columns
  const mid = Math.ceil(p.features.length / 2);
  const col1 = p.features.slice(0, mid);
  const col2 = p.features.slice(mid);

  const renderCol = (items: string[]) =>
    items
      .map(
        (f) =>
          `<li style="color:#374151;font-size:13px;line-height:1.7;margin:0;padding:2px 0">${escapeHtml(f)}</li>`
      )
      .join('');

  return `
    <div style="background:white;border:1px solid #e5e7eb;border-left:4px solid #5DB347;border-radius:12px;padding:20px;margin:16px 0">
      <h3 style="color:#1B2A4A;margin:0 0 12px;font-size:18px;font-weight:700">${safePortal}</h3>
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="vertical-align:top;width:50%;padding-right:8px">
            <ul style="margin:0;padding:0 0 0 18px;list-style:disc">
              ${renderCol(col1)}
            </ul>
          </td>
          <td style="vertical-align:top;width:50%;padding-left:8px">
            <ul style="margin:0;padding:0 0 0 18px;list-style:disc">
              ${renderCol(col2)}
            </ul>
          </td>
        </tr>
      </table>
      <div style="margin-top:16px">
        <a href="${safeUrl}" style="display:inline-block;background:#5DB347;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:13px">Open ${safePortal} →</a>
      </div>
    </div>
  `;
}

export interface SendWelcomeEmailParams {
  userId: string;
  email: string;
  full_name: string | null;
  role: string;
  capabilities?: string[];
  temp_password: string;
}

export async function sendWelcomeEmail(params: SendWelcomeEmailParams) {
  const { email, full_name, role, capabilities = [], temp_password } = params;

  const access = getUserAccess(role, capabilities);
  const firstName = escapeHtml(full_name?.split(' ')[0] || 'there');
  const safeFullName = escapeHtml(full_name || 'Member');
  const safeEmail = escapeHtml(email);
  const safeTempPassword = escapeHtml(temp_password);

  const portalCards = access.map(renderPortalCard).join('');

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;background:#f8f5ee">
      <!-- Header -->
      <div style="background:#1B2A4A;padding:32px 24px;text-align:center">
        <h1 style="color:#5DB347;margin:0;font-size:26px;font-weight:700">African Farming Union</h1>
        <p style="color:#8CB89C;margin:8px 0 0;font-size:14px">Welcome to the Family</p>
      </div>

      <!-- Body -->
      <div style="padding:32px 24px;background:#f8f5ee">
        <h2 style="color:#1B2A4A;margin:0 0 8px;font-size:22px">Welcome, ${firstName}!</h2>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px">
          Your African Farming Union account is now active. Below are the portals and features you have access to.
        </p>

        ${portalCards}

        <!-- Login Credentials -->
        <div style="background:white;border:2px solid #5DB347;border-radius:12px;padding:20px;margin:24px 0">
          <h3 style="color:#1B2A4A;margin:0 0 12px;font-size:16px">Your Login Credentials</h3>
          <table style="width:100%;font-size:14px">
            <tr>
              <td style="padding:6px 0;color:#64748b;width:150px">Sign in at</td>
              <td style="padding:6px 0"><a href="${BASE_URL}/login" style="color:#2563eb;font-weight:600">${BASE_URL.replace('https://', '')}/login</a></td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#64748b">Email</td>
              <td style="padding:6px 0;color:#1B2A4A;font-weight:600">${safeEmail}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#64748b">Temporary Password</td>
              <td style="padding:6px 0;color:#1B2A4A;font-weight:700;font-family:monospace;font-size:15px">${safeTempPassword}</td>
            </tr>
          </table>
          <p style="color:#EF4444;font-size:12px;margin:12px 0 0">
            ⚠️ Please change your password after your first login.
          </p>
        </div>

        <!-- Footer message -->
        <p style="color:#64748b;font-size:13px;line-height:1.6;margin:24px 0 0;text-align:center">
          Questions? Reply to this email or contact
          <a href="mailto:info@africanfarmingunion.org" style="color:#5DB347">info@africanfarmingunion.org</a>
        </p>
      </div>

      <!-- Brand footer -->
      <div style="padding:16px;text-align:center;color:#999;font-size:12px;background:#1B2A4A">
        <p style="margin:0;color:#8CB89C">
          African Farming Union |
          <a href="${BASE_URL}" style="color:#5DB347;text-decoration:none">africanfarmingunion.org</a>
        </p>
        <p style="margin:6px 0 0;color:#64748b">For ${escapeHtml(safeFullName)}</p>
      </div>
    </div>
  `;

  const subject = 'Welcome to African Farming Union — Your Account is Ready';

  return sendEmail(email, subject, html, FROM, REPLY_TO);
}
