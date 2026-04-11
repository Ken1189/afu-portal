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
        icon: 'WC',
      },
      {
        title: 'Export Invoice Finance',
        description:
          'Bridges the shipment-to-payment gap on buyer terms. Tenor 30-60 days. Target pricing 8-10% APR + ~1% fee.',
        icon: 'IF',
      },
      {
        title: 'Tri-Party Escrow',
        description:
          'Buyer payments flow into AFU-controlled escrow. Waterfall pays AFU first, then suppliers, then producer.',
        icon: 'ES',
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
        icon: 'MC',
      },
      {
        title: 'Livestock Cover',
        description: 'Mortality and theft cover with mobile claim filing and field-vet verification.',
        icon: 'LC',
      },
      {
        title: 'Parametric Weather',
        description: 'Automatic payouts triggered by satellite-verified rainfall and temperature thresholds.',
        icon: 'PW',
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
        icon: 'GA',
      },
      {
        title: 'GlobalGAP Certification',
        description: 'Group certification pathway including audit prep and corrective actions.',
        icon: 'GG',
      },
      {
        title: 'Post-Harvest & Cold Chain',
        description: 'Reduce losses with grading, packaging and cold-chain management training.',
        icon: 'CC',
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
        icon: 'FV',
      },
      {
        title: 'Vaccination Programmes',
        description: 'Country-appropriate vaccine schedules with reminders and digital proof of cover.',
        icon: 'VP',
      },
      {
        title: 'Herd Health Records',
        description: 'Digital records that move with your animals — useful for export and insurance.',
        icon: 'HR',
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

  processing: {
    hero_title: 'Processing & Value Addition',
    hero_subtitle:
      'Shared-use milling, drying, cold chain, and packaging facilities located near farming clusters. Turn raw commodities into market-ready products worth 2-3x more — and eliminate post-harvest waste.',
    hero_image:
      'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=1920&h=1080&fit=crop',
    features: [
      {
        title: 'Milling & Grinding',
        description:
          'State-of-the-art milling equipment for maize, wheat, rice, and sorghum. Produce flour, grits, and meal that meet commercial buyer specifications and retail packaging standards.',
        icon: 'MG',
      },
      {
        title: 'Solar Drying Systems',
        description:
          'Reduce moisture content to safe storage levels with our solar-hybrid dryers. Extend shelf life from weeks to months while preserving nutritional value and minimising energy costs.',
        icon: 'SD',
      },
      {
        title: 'Cold Chain Infrastructure',
        description:
          'Solar-powered cold rooms and refrigerated logistics for perishables — fruits, vegetables, dairy, and fish. Maintain the cold chain from farm gate to final buyer.',
        icon: 'CC',
      },
      {
        title: 'Grading & Packaging',
        description:
          'Automated sorting, grading, and packaging lines. Products are labelled with traceability codes linking back to the originating farm, cooperative, and processing batch.',
        icon: 'GP',
      },
      {
        title: 'Quality Certification',
        description:
          'On-site testing laboratories for aflatoxin, moisture, and microbiological analysis. We support HACCP, ISO 22000, GlobalG.A.P., and organic certification pathways.',
        icon: 'QC',
      },
      {
        title: 'Waste-to-Value',
        description:
          'Processing by-products are converted into animal feed, compost, and biochar. Nothing goes to waste — our circular model generates additional revenue streams for cooperatives.',
        icon: 'WV',
      },
    ],
    how_it_works: [
      { step: 1, title: 'Harvest & Deliver', description: 'Bring your raw produce to the nearest AFU processing hub. Our strategically located centres sit within 30 km of major farming clusters, minimising transport costs and spoilage.' },
      { step: 2, title: 'Process & Package', description: 'Trained operators handle milling, drying, grading, and packaging to international standards. You choose your processing level — from cleaned raw commodity to retail-ready product.' },
      { step: 3, title: 'Quality Certification', description: 'Every batch undergoes quality testing. Products that meet HACCP, ISO 22000, or organic standards receive certification, unlocking premium domestic and export markets.' },
      { step: 4, title: 'Market & Earn More', description: 'Processed products command 2-3x the price of raw commodities. AFU connects your value-added output directly to buyers through our offtake network.' },
    ],
    stats: [
      { value: '12', label: 'Processing Hubs', sub: 'planned across Africa' },
      { value: '3x', label: 'Value Multiplication', sub: 'raw to processed' },
      { value: '60%', label: 'Waste Reduction', sub: 'in post-harvest losses' },
      { value: '5,000+', label: 'Tonnes Processed', sub: 'annual capacity per hub' },
    ],
    cta_text: 'Book Processing Time',
    cta_link: '/apply',
  },

  offtake: {
    hero_title: 'Guaranteed Offtake & Market Access',
    hero_subtitle:
      'Pre-arranged buyer contracts before planting season. Price-floor guarantees eliminate market risk, while our digital marketplace and export network ensure you always find the best buyer for your crop.',
    hero_image:
      'https://images.unsplash.com/photo-1504370805625-d32c54b16100?w=1920&h=1080&fit=crop',
    features: [
      {
        title: 'Pre-Season Contracts',
        description:
          'Binding offtake agreements signed before planting season. Farmers know exactly who will buy, at what price, and in what quantity before a single seed goes into the ground.',
        icon: 'PC',
      },
      {
        title: 'Price Floor Guarantees',
        description:
          'Every contract includes a guaranteed minimum price. If market prices rise above the floor, farmers benefit from the upside. If prices fall, the floor protects their income.',
        icon: 'PF',
      },
      {
        title: 'Export Market Access',
        description:
          'AFU connects cooperatives to buyers across 15 export markets in Europe, the Middle East, and Asia. We handle phytosanitary certification, customs documentation, and logistics.',
        icon: 'EX',
      },
      {
        title: 'Digital Marketplace',
        description:
          "Surplus production beyond contracted volumes can be listed on AFU's digital marketplace. Buyers bid in real-time, ensuring farmers capture the best available price.",
        icon: 'DM',
      },
      {
        title: 'Market Intelligence',
        description:
          'Real-time commodity pricing, demand forecasts, and seasonal trend analysis. Make informed planting decisions based on data, not guesswork.',
        icon: 'MI',
      },
      {
        title: 'Traceability & Compliance',
        description:
          'Full farm-to-fork traceability for every consignment. Meet EU, UK, and US import requirements with digital documentation that tracks origin, handling, and quality at each stage.',
        icon: 'TC',
      },
    ],
    how_it_works: [
      { step: 1, title: 'Register Your Production', description: 'List your planned crop, estimated volume, and target harvest date on the AFU platform. Our matching algorithm identifies the best-fit buyers for your specific commodity and quality grade.' },
      { step: 2, title: 'Lock In Your Contract', description: 'Before you even plant, sign a binding offtake agreement with a verified buyer. The contract specifies quantity, quality standards, delivery window, and a guaranteed minimum price.' },
      { step: 3, title: 'Grow with Confidence', description: 'With a guaranteed buyer and price floor in place, focus on maximising yield. AFU provides agronomic support and input financing secured against your confirmed offtake contract.' },
      { step: 4, title: 'Deliver & Get Paid', description: "Deliver your harvest to the designated collection point. Payment flows through AFU's tri-party escrow — you receive funds within 48 hours of delivery confirmation." },
    ],
    stats: [
      { value: '$50M+', label: 'Offtake Agreements', sub: 'in contracted value' },
      { value: '200+', label: 'Active Buyers', sub: 'exporters, retailers, processors' },
      { value: '15', label: 'Export Markets', sub: 'across 3 continents' },
      { value: '100%', label: 'Payment Guarantee', sub: 'via escrow settlement' },
    ],
    cta_text: 'List Your Crop',
    cta_link: '/apply',
  },

  'trade-finance': {
    hero_title: 'Trade Finance & Export Support',
    hero_subtitle:
      'Letters of credit, pre-export financing, forex management, and end-to-end logistics. AFU unlocks cross-border agricultural trade across COMESA, SADC, and AfCFTA corridors — so African produce reaches global markets.',
    hero_image:
      'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=1920&h=1080&fit=crop',
    features: [
      {
        title: 'Letters of Credit',
        description:
          'Bank-backed letters of credit issued through our partner financial institutions. Protect both buyer and seller with irrevocable payment guarantees recognised by banks worldwide.',
        icon: 'LC',
      },
      {
        title: 'Pre-Export Financing',
        description:
          'Access working capital against confirmed export orders. Fund harvesting, processing, packing, and transport costs before the buyer pays — bridging the cash flow gap that kills deals.',
        icon: 'PX',
      },
      {
        title: 'Export Guarantees',
        description:
          'Credit insurance and export guarantees that protect against buyer default, political risk, and currency inconvertibility. Trade with confidence into emerging and frontier markets.',
        icon: 'EG',
      },
      {
        title: 'Forex Management',
        description:
          'Hedge currency risk with forward contracts and natural hedging strategies. Our treasury desk manages USD, EUR, GBP, and local currency exposures across all 20 operating countries.',
        icon: 'FX',
      },
      {
        title: 'Logistics & Customs',
        description:
          'End-to-end freight management from farm gate to destination port. Customs brokerage, fumigation certificates, bills of lading, and real-time shipment tracking — all in one platform.',
        icon: 'LG',
      },
      {
        title: 'Trade Corridor Access',
        description:
          'Leverage preferential tariff rates under COMESA, SADC, EAC, and AfCFTA trade agreements. Our compliance team ensures every shipment meets origin rules for duty-free or reduced-tariff entry.',
        icon: 'TA',
      },
    ],
    how_it_works: [
      { step: 1, title: 'Secure an Offtake Contract', description: "Start with a confirmed buyer order — domestic or international. AFU's offtake network provides the foundation, or bring your own buyer and we structure the finance around the deal." },
      { step: 2, title: 'Structure the Financing', description: 'Our trade finance team structures the optimal instrument — letter of credit, pre-export facility, or invoice discounting — based on the buyer profile, destination, and commodity.' },
      { step: 3, title: 'Ship with Confidence', description: 'AFU handles customs documentation, phytosanitary certificates, and logistics coordination. Our freight partners move your cargo by road, rail, sea, or air across 15 export corridors.' },
      { step: 4, title: 'Get Paid Fast', description: "Payment flows through AFU's escrow system. Pre-export advances are settled, and net proceeds are disbursed to your account within 48 hours of buyer confirmation." },
    ],
    stats: [
      { value: '$200M+', label: 'Trade Facilitated', sub: 'in cumulative value' },
      { value: '15', label: 'Export Destinations', sub: 'across 3 continents' },
      { value: '98%', label: 'Delivery Success', sub: 'on-time, in-full rate' },
      { value: '48hrs', label: 'Payment Speed', sub: 'after delivery confirmation' },
    ],
    cta_text: 'Apply for Trade Finance',
    cta_link: '/apply',
  },

  'legal-assistance': {
    hero_title: 'Legal Assistance for African Farmers',
    hero_subtitle:
      'Professional legal support that protects your land, your contracts, and your livelihood. From land tenure disputes to export compliance, our pan-African network of 50+ law firms has you covered.',
    hero_image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&h=1080&fit=crop',
    features: [
      {
        title: 'Land Rights & Tenure',
        description:
          'Secure your land. We help farmers navigate title deeds, customary land rights, lease agreements, and land dispute resolution. Our specialists understand both statutory and traditional tenure systems across Africa.',
        icon: 'LR',
      },
      {
        title: 'Contract Review & Drafting',
        description:
          'Never sign a bad deal. Every offtake agreement, supply contract, equipment lease, and partnership MOU can be reviewed by our legal team before you commit. We also draft standard contracts tailored to your needs.',
        icon: 'CR',
      },
      {
        title: 'Dispute Resolution',
        description:
          'Fast, fair outcomes. We provide mediation, arbitration, and where necessary, litigation support for disputes with buyers, suppliers, landlords, cooperatives, and government agencies.',
        icon: 'DR',
      },
      {
        title: 'Regulatory Compliance',
        description:
          'Stay on the right side of the law. Export permits, phytosanitary certificates, tax obligations, environmental regulations, and labour law compliance — we guide you through every requirement.',
        icon: 'RC',
      },
      {
        title: 'Cooperative Governance',
        description:
          'Build strong farmer organisations. We assist with cooperative registration, constitution drafting, governance frameworks, AGM procedures, and internal dispute resolution for farmer groups and associations.',
        icon: 'CG',
      },
      {
        title: 'Intellectual Property',
        description:
          'Protect your innovations. From registering new seed varieties and organic certifications to trademarking your farm brand and protecting indigenous knowledge, we help farmers own their intellectual assets.',
        icon: 'IP',
      },
    ],
    how_it_works: [
      { step: 1, title: 'Request a Consultation', description: 'Submit your legal query through the AFU platform or call our toll-free helpline. Describe your situation — land dispute, contract question, regulatory issue, or cooperative matter — and we match you with the right specialist.' },
      { step: 2, title: 'Expert Review', description: 'A qualified legal professional from our network reviews your case. For straightforward matters, you receive guidance within 48 hours. Complex cases get a full assessment with recommended next steps and cost estimates.' },
      { step: 3, title: 'Advice & Representation', description: 'Receive clear, actionable legal advice in plain language. Where needed, our partner law firms provide direct representation — from drafting contracts to appearing at land tribunals and mediation sessions.' },
      { step: 4, title: 'Resolution & Follow-Up', description: 'We track every case to resolution and follow up to ensure outcomes are enforced. All documents are stored securely in your AFU profile for future reference, building your legal history and strengthening future claims.' },
    ],
    stats: [
      { value: '10,000+', label: 'Farmers Assisted', sub: 'across all legal services' },
      { value: '20', label: 'Countries Covered', sub: 'with local legal expertise' },
      { value: '95%', label: 'Resolution Rate', sub: 'cases resolved successfully' },
      { value: '50+', label: 'Partner Law Firms', sub: 'pan-African legal network' },
    ],
    cta_text: 'Get Legal Help',
    cta_link: '/apply',
  },

  'forward-contracts': {
    hero_title: 'Forward Growing Contracts',
    hero_subtitle:
      'Secure guaranteed buyers and prices before you plant. AFU connects farmers with verified off-takers through legally binding forward contracts, eliminating market uncertainty.',
    hero_image:
      'https://images.unsplash.com/photo-1504370805625-d32c54b16100?w=1920&h=1080&fit=crop',
    features: [
      {
        title: 'Guaranteed Prices',
        description:
          'Lock in prices before planting season. No more market volatility.',
        icon: 'GP',
      },
      {
        title: 'Verified Buyers',
        description:
          'All off-takers are vetted and verified by AFU. Contracts are legally binding.',
        icon: 'VB',
      },
      {
        title: 'Input Financing',
        description:
          'Access seed, fertiliser, and equipment financing tied to your forward contract.',
        icon: 'IN',
      },
      {
        title: 'Quality Standards',
        description:
          'Clear grading criteria so you know exactly what buyers expect.',
        icon: 'QS',
      },
      {
        title: 'Delivery Support',
        description:
          'AFU coordinates logistics, cold chain, and export compliance.',
        icon: 'DS',
      },
      {
        title: 'Multi-Currency Settlement',
        description:
          'Get paid in USD, EUR, GBP, ZAR, or local currency.',
        icon: 'FX',
      },
    ],
    how_it_works: [
      { step: 1, title: 'Register Your Farm', description: 'List your farm, available land, and crops you can grow.' },
      { step: 2, title: 'Browse Off-taker Contracts', description: 'View available forward contracts from verified buyers with guaranteed prices.' },
      { step: 3, title: 'Sign & Grow', description: 'Accept a contract, receive inputs financing, and grow with confidence.' },
      { step: 4, title: 'Deliver & Get Paid', description: 'Deliver your harvest to the buyer and receive guaranteed payment.' },
    ],
    stats: [
      { value: '$50M+', label: 'Contracted Value', sub: 'in forward contracts' },
      { value: '200+', label: 'Active Buyers', sub: 'verified off-takers' },
      { value: '15', label: 'Export Markets', sub: 'across 3 continents' },
      { value: '100%', label: 'Payment Guarantee', sub: 'via escrow settlement' },
    ],
    cta_text: 'Get Started',
    cta_link: '/farm/offtake',
  },

  inputs: {
    hero_title: 'Farm Inputs',
    hero_subtitle:
      'Verified seed, fertiliser, agro-chem and equipment from approved suppliers — delivered to your gate.',
    features: [
      {
        title: 'Approved Suppliers',
        description: 'Every supplier is KYC-verified and product quality is randomly audited.',
        icon: 'AS',
      },
      {
        title: 'Group Buying',
        description: 'Cooperative bulk orders unlock significantly lower prices for smallholders.',
        icon: 'GB',
      },
      {
        title: 'Pay on Credit',
        description: 'Qualifying farmers can buy inputs against AFU working-capital lines.',
        icon: 'PC',
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
