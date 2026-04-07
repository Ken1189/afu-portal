/**
 * Hardcoded fallback content for the editable service pages.
 * If site_config[`service_<slug>`] is empty the page renders these defaults.
 *
 * Edit at /admin/content → "Service Pages" tab.
 */

import type { ServicePageConfig } from './EditableServicePage';

export const SERVICE_DEFAULTS: Record<string, ServicePageConfig> = {
  financing: {
    hero_title: 'Financing',
    hero_subtitle:
      'From seasonal working capital to export invoice finance. Repayment controlled through offtake + escrow.',
    features: [
      {
        title: 'Pre-export Working Capital',
        description:
          'Funds inputs, harvesting, packing, cold chain and transport. Tenor 90-180 days. Target pricing 12-18% APR + 1-2% origination fee.',
        icon: '💰',
      },
      {
        title: 'Export Invoice Finance',
        description:
          'Bridges the shipment-to-payment gap on buyer terms. Tenor 30-60 days. Target pricing 8-10% APR + ~1% fee.',
        icon: '📄',
      },
      {
        title: 'Tri-Party Escrow',
        description:
          'Buyer payments flow into AFU-controlled escrow. Waterfall pays AFU first, then suppliers, then producer.',
        icon: '🔐',
      },
    ],
    how_it_works: [
      { step: 1, title: 'Apply', description: 'Submit your application with farm and offtake details.' },
      { step: 2, title: 'Underwrite', description: 'AFU reviews production plan, buyer LOI and references.' },
      { step: 3, title: 'Disburse', description: 'Funds release direct to suppliers and operators.' },
      { step: 4, title: 'Repay', description: 'Buyer payments collected in escrow and waterfalled.' },
    ],
    cta_text: 'Apply for Financing',
    cta_link: '/apply',
  },

  insurance: {
    hero_title: 'Insurance',
    hero_subtitle:
      'Crop, livestock and parametric weather cover. Designed for African producers, paid out in days not months.',
    features: [
      {
        title: 'Multi-Peril Crop',
        description: 'Fire, hail, drought and excessive rain coverage indexed to your planted area.',
        icon: '🌾',
      },
      {
        title: 'Livestock Cover',
        description: 'Mortality and theft cover with mobile claim filing and field-vet verification.',
        icon: '🐄',
      },
      {
        title: 'Parametric Weather',
        description: 'Automatic payouts triggered by satellite-verified rainfall and temperature thresholds.',
        icon: '🛰️',
      },
    ],
    how_it_works: [
      { step: 1, title: 'Quote', description: 'Get an instant indicative quote based on crop and location.' },
      { step: 2, title: 'Bind', description: 'Pay premium and receive your digital policy document.' },
      { step: 3, title: 'Monitor', description: 'AFU watches weather and field events on your behalf.' },
      { step: 4, title: 'Claim', description: 'File a claim from the app — payouts via mobile money.' },
    ],
    cta_text: 'Get an Insurance Quote',
    cta_link: '/farm/insurance/quote',
  },

  training: {
    hero_title: 'Training & Extension',
    hero_subtitle:
      'GAP, GlobalGAP, SPS and post-harvest training delivered by AFU agronomists and certified trainers.',
    features: [
      {
        title: 'Good Agricultural Practice',
        description: 'Foundational GAP curriculum covering soil, water, inputs and harvest hygiene.',
        icon: '📚',
      },
      {
        title: 'GlobalGAP Certification',
        description: 'Group certification pathway including audit prep and corrective actions.',
        icon: '🏅',
      },
      {
        title: 'Post-Harvest & Cold Chain',
        description: 'Reduce losses with grading, packaging and cold-chain management training.',
        icon: '❄️',
      },
    ],
    how_it_works: [
      { step: 1, title: 'Enrol', description: 'Pick a course or request a custom in-field session.' },
      { step: 2, title: 'Learn', description: 'Mix of mobile lessons and in-person field days.' },
      { step: 3, title: 'Practice', description: 'Apply on your farm with agronomist support.' },
      { step: 4, title: 'Certify', description: 'Earn AFU certificates and qualify for premium markets.' },
    ],
    cta_text: 'Browse Training Courses',
    cta_link: '/farm/training',
  },

  veterinary: {
    hero_title: 'Veterinary Services',
    hero_subtitle:
      'On-call veterinarians, vaccination programmes and digital herd-health records for African livestock farmers.',
    features: [
      {
        title: 'Field Vet Visits',
        description: 'Book a verified vet to your farm for diagnosis, treatment or routine check-ups.',
        icon: '🩺',
      },
      {
        title: 'Vaccination Programmes',
        description: 'Country-appropriate vaccine schedules with reminders and digital proof of cover.',
        icon: '💉',
      },
      {
        title: 'Herd Health Records',
        description: 'Digital records that move with your animals — useful for export and insurance.',
        icon: '📋',
      },
    ],
    how_it_works: [
      { step: 1, title: 'Request', description: 'Open a vet request from the Vet section of the app.' },
      { step: 2, title: 'Match', description: 'AFU dispatches the closest verified veterinarian.' },
      { step: 3, title: 'Treat', description: 'Vet performs the visit and uploads notes and prescriptions.' },
      { step: 4, title: 'Record', description: 'Records sync to your herd file and insurance policies.' },
    ],
    cta_text: 'Book a Vet Visit',
    cta_link: '/farm/vet',
  },

  inputs: {
    hero_title: 'Farm Inputs',
    hero_subtitle:
      'Verified seed, fertiliser, agro-chem and equipment from approved suppliers — delivered to your gate.',
    features: [
      {
        title: 'Approved Suppliers',
        description: 'Every supplier is KYC-verified and product quality is randomly audited.',
        icon: '✅',
      },
      {
        title: 'Group Buying',
        description: 'Cooperative bulk orders unlock significantly lower prices for smallholders.',
        icon: '🤝',
      },
      {
        title: 'Pay on Credit',
        description: 'Qualifying farmers can buy inputs against AFU working-capital lines.',
        icon: '💳',
      },
    ],
    how_it_works: [
      { step: 1, title: 'Browse', description: 'Open the Marketplace and filter by crop and country.' },
      { step: 2, title: 'Order', description: 'Add to cart and check out using mobile money or credit.' },
      { step: 3, title: 'Track', description: 'Live shipment tracking until it reaches your farm gate.' },
      { step: 4, title: 'Review', description: 'Rate the supplier so the next farmer buys with confidence.' },
    ],
    cta_text: 'Shop the Marketplace',
    cta_link: '/farm/marketplace',
  },
};
