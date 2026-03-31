import Link from "next/link";
import { notFound } from "next/navigation";
import { BarChart3, Wheat, Users, Sprout } from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { createClient } from '@supabase/supabase-js';

/* ─── Country Data ─── */

interface CountryData {
  name: string;
  slug: string;
  flag: string;
  role: string;
  heroImage: string;
  description: string;
  stats: {
    gdpAgriculture: string;
    arableLand: string;
    population: string;
    keyCropsCount: number;
  };
  operations: {
    services: string[];
    members: string;
    paymentMethods: string[];
  };
  crops: { name: string; icon: string }[];
  highlights: string[];
}

const FALLBACK_COUNTRIES: CountryData[] = [
  {
    name: "Botswana",
    slug: "botswana",
    flag: "\u{1F1E7}\u{1F1FC}",
    role: "Institutional Base & Bank HQ",
    heroImage: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1600&q=80",
    description:
      "Botswana serves as AFU's institutional base, providing a stable regulatory environment for our banking licence pathway. With Africa's strongest governance record and a growing agricultural sector, Botswana anchors the AFU platform with credibility and compliance infrastructure.",
    stats: {
      gdpAgriculture: "1.8%",
      arableLand: "0.7M ha",
      population: "2.6M",
      keyCropsCount: 4,
    },
    operations: {
      services: ["Banking", "Compliance", "Trade Finance", "Insurance"],
      members: "Launch Phase",
      paymentMethods: ["Bank Transfer", "Orange Money", "Card"],
    },
    crops: [
      { name: "Sorghum", icon: "\u{1F33E}" },
      { name: "Maize", icon: "\u{1F33D}" },
      { name: "Millet", icon: "\u{1F33E}" },
      { name: "Beef Cattle", icon: "\u{1F404}" },
    ],
    highlights: [
      "Bank licensing pathway in progress",
      "Strongest governance in Africa (Transparency International)",
      "Strategic SACU membership for trade access",
      "Compliance foundation for pan-African operations",
    ],
  },
  {
    name: "Zimbabwe",
    slug: "zimbabwe",
    flag: "\u{1F1FF}\u{1F1FC}",
    role: "Export Lane (Blueberries)",
    heroImage: "https://images.unsplash.com/photo-1591019479261-1a103585c559?w=1600&q=80",
    description:
      "Zimbabwe is AFU's high-value export lane, focused on blueberry production with structured buyer demand. The country offers ideal conditions for escrow-based repayment and invoice finance, making it the cornerstone of our export-driven model.",
    stats: {
      gdpAgriculture: "7.5%",
      arableLand: "4.1M ha",
      population: "16.3M",
      keyCropsCount: 5,
    },
    operations: {
      services: ["Export Finance", "Crop Insurance", "Input Supply", "Offtake"],
      members: "450+",
      paymentMethods: ["EcoCash", "Bank Transfer", "USD Cash"],
    },
    crops: [
      { name: "Blueberries", icon: "\u{1FAD0}" },
      { name: "Tobacco", icon: "\u{1F33F}" },
      { name: "Maize", icon: "\u{1F33D}" },
      { name: "Cotton", icon: "\u{2601}\u{FE0F}" },
      { name: "Soya", icon: "\u{1F331}" },
    ],
    highlights: [
      "Blueberry export to EU & UK markets",
      "Structured buyer demand with guaranteed offtake",
      "Escrow-based repayment model",
      "Invoice finance infrastructure",
    ],
  },
  {
    name: "Tanzania",
    slug: "tanzania",
    flag: "\u{1F1F9}\u{1F1FF}",
    role: "Scale Lane (Cassava + Sesame)",
    heroImage: "https://images.unsplash.com/photo-1504432842672-1a79f78e4084?w=1600&q=80",
    description:
      "Tanzania is AFU's scale lane, leveraging cassava for food security and processing potential alongside sesame as a high-value export commodity. With a large farming population and growing agri-tech adoption, Tanzania offers fast capital turnover and massive impact potential.",
    stats: {
      gdpAgriculture: "26.7%",
      arableLand: "15.2M ha",
      population: "65.5M",
      keyCropsCount: 7,
    },
    operations: {
      services: ["Input Finance", "Processing", "Training", "Crop Insurance"],
      members: "800+",
      paymentMethods: ["M-Pesa", "Tigo Pesa", "Bank Transfer"],
    },
    crops: [
      { name: "Cassava", icon: "\u{1F360}" },
      { name: "Sesame", icon: "\u{1F33E}" },
      { name: "Cashews", icon: "\u{1F95C}" },
      { name: "Coffee", icon: "\u2615" },
      { name: "Avocados", icon: "\u{1F951}" },
      { name: "Maize", icon: "\u{1F33D}" },
      { name: "Rice", icon: "\u{1F35A}" },
    ],
    highlights: [
      "Cassava processing for starch & flour",
      "Sesame & cashew exports to Asia & Middle East",
      "Growing coffee & avocado sectors",
      "Mobile money penetration above 60%",
      "EAC trade corridor access",
    ],
  },
  {
    name: "Kenya",
    slug: "kenya",
    flag: "\u{1F1F0}\u{1F1EA}",
    role: "East African Gateway",
    heroImage: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600&q=80",
    description:
      "Kenya is East Africa's agricultural powerhouse and AFU's gateway to the region. With world-leading mobile money infrastructure (M-Pesa), a thriving agri-tech ecosystem, and strong horticulture exports to the EU, Kenya offers unmatched digital payment and trade infrastructure.",
    stats: {
      gdpAgriculture: "22.4%",
      arableLand: "6.3M ha",
      population: "55.1M",
      keyCropsCount: 5,
    },
    operations: {
      services: ["M-Pesa Payments", "Horticulture Finance", "Insurance", "Training"],
      members: "1,200+",
      paymentMethods: ["M-Pesa", "Bank Transfer", "Airtel Money", "Card"],
    },
    crops: [
      { name: "Tea", icon: "\u{1F375}" },
      { name: "Coffee", icon: "\u2615" },
      { name: "Flowers", icon: "\u{1F33A}" },
      { name: "Avocados", icon: "\u{1F951}" },
      { name: "Maize", icon: "\u{1F33D}" },
    ],
    highlights: [
      "M-Pesa integration for instant payments",
      "Horticulture exports worth $1B+ annually",
      "Strongest agri-tech ecosystem in Africa",
      "EU trade agreements for flower & vegetable exports",
    ],
  },
  {
    name: "Nigeria",
    slug: "nigeria",
    flag: "\u{1F1F3}\u{1F1EC}",
    role: "West African Scale",
    heroImage: "https://images.unsplash.com/photo-1589923188651-268a9765e432?w=1600&q=80",
    description:
      "Nigeria is Africa's largest economy and most populous nation, offering a massive domestic market for agricultural inputs, equipment, and processing. With a booming fintech ecosystem and enormous food import bill, Nigeria represents the single largest opportunity for agricultural development on the continent.",
    stats: {
      gdpAgriculture: "24.1%",
      arableLand: "34M ha",
      population: "223M",
      keyCropsCount: 6,
    },
    operations: {
      services: ["Input Supply", "Processing", "Trade Finance", "Training"],
      members: "2,100+",
      paymentMethods: ["Bank Transfer", "USSD", "Card", "Mobile Money"],
    },
    crops: [
      { name: "Cassava", icon: "\u{1F360}" },
      { name: "Cocoa", icon: "\u{1F36B}" },
      { name: "Rice", icon: "\u{1F35A}" },
      { name: "Yams", icon: "\u{1F360}" },
      { name: "Maize", icon: "\u{1F33D}" },
      { name: "Palm Oil", icon: "\u{1F334}" },
    ],
    highlights: [
      "200M+ population — largest food market in Africa",
      "Cassava & cocoa production at continental scale",
      "Booming fintech ecosystem (Flutterwave, Paystack)",
      "Largest food import bill in Sub-Saharan Africa",
    ],
  },
  {
    name: "Zambia",
    slug: "zambia",
    flag: "\u{1F1FF}\u{1F1F2}",
    role: "Processing Hub",
    heroImage: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600&q=80",
    description:
      "Zambia is AFU's processing hub, with established grain milling, soya processing, and value-addition capacity serving the Southern African region. A stable policy environment and strong agricultural traditions make Zambia ideal for post-harvest infrastructure investment.",
    stats: {
      gdpAgriculture: "2.9%",
      arableLand: "3.8M ha",
      population: "20.6M",
      keyCropsCount: 5,
    },
    operations: {
      services: ["Processing Finance", "Input Supply", "Offtake", "Insurance"],
      members: "600+",
      paymentMethods: ["Bank Transfer", "Airtel Money", "MTN MoMo"],
    },
    crops: [
      { name: "Maize", icon: "\u{1F33D}" },
      { name: "Soya", icon: "\u{1F331}" },
      { name: "Sunflower", icon: "\u{1F33B}" },
      { name: "Wheat", icon: "\u{1F33E}" },
      { name: "Cotton", icon: "\u{2601}\u{FE0F}" },
    ],
    highlights: [
      "Maize milling capacity serving SADC region",
      "Soya & sunflower oil processing infrastructure",
      "Stable regulatory environment for agri-investment",
      "Regional export hub for processed goods",
    ],
  },
  {
    name: "Mozambique",
    slug: "mozambique",
    flag: "\u{1F1F2}\u{1F1FF}",
    role: "Southern Corridor",
    heroImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80",
    description:
      "Mozambique provides strategic port access for Southern African agricultural trade through the Port of Maputo. With significant cashew, maize, and cassava production, Mozambique connects landlocked SADC countries to global markets.",
    stats: {
      gdpAgriculture: "27.3%",
      arableLand: "5.6M ha",
      population: "33.9M",
      keyCropsCount: 6,
    },
    operations: {
      services: ["Trade Finance", "Input Supply", "Processing", "Insurance"],
      members: "350+",
      paymentMethods: ["M-Pesa", "e-Mola", "Bank Transfer"],
    },
    crops: [
      { name: "Cashews", icon: "\u{1F95C}" },
      { name: "Sesame", icon: "\u{1F33E}" },
      { name: "Fruit", icon: "\u{1F34A}" },
      { name: "Maize", icon: "\u{1F33D}" },
      { name: "Cassava", icon: "\u{1F360}" },
      { name: "Coconut", icon: "\u{1F965}" },
    ],
    highlights: [
      "Port of Maputo — key SADC trade gateway",
      "World-class cashew nut production & export",
      "Sesame & tropical fruit expansion",
      "Cross-border grain trade infrastructure",
      "SADC corridor connecting landlocked nations",
    ],
  },
  {
    name: "South Africa",
    slug: "south-africa",
    flag: "\u{1F1FF}\u{1F1E6}",
    role: "Financial Hub",
    heroImage: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1600&q=80",
    description:
      "South Africa anchors AFU's financial infrastructure with the continent's most advanced banking system, agricultural insurance market, and institutional capital access. The country's commercial farming scale and sophisticated financial services ecosystem make it central to AFU's development finance model.",
    stats: {
      gdpAgriculture: "2.5%",
      arableLand: "12.5M ha",
      population: "60.4M",
      keyCropsCount: 6,
    },
    operations: {
      services: ["Development Finance", "Insurance", "Offtake", "Technology"],
      members: "900+",
      paymentMethods: ["Bank Transfer", "Card", "SnapScan", "EFT"],
    },
    crops: [
      { name: "Maize", icon: "\u{1F33D}" },
      { name: "Citrus", icon: "\u{1F34A}" },
      { name: "Grapes", icon: "\u{1F347}" },
      { name: "Sugarcane", icon: "\u{1F33F}" },
      { name: "Wheat", icon: "\u{1F33E}" },
      { name: "Soya", icon: "\u{1F331}" },
    ],
    highlights: [
      "Africa's most advanced banking & insurance system",
      "Institutional capital access for agricultural development",
      "Commercial farming at continental scale",
      "$400B+ GDP anchoring AFU's financial model",
    ],
  },
  {
    name: "Ghana",
    slug: "ghana",
    flag: "\u{1F1EC}\u{1F1ED}",
    role: "West African Cocoa Belt",
    heroImage: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1600&q=80",
    description:
      "Ghana is the world's second-largest cocoa producer and a beacon of democratic stability in West Africa. With a growing tech scene, strong agricultural traditions, and government-backed cocoa buying programmes, Ghana offers structured commodity trade and digital payment infrastructure.",
    stats: {
      gdpAgriculture: "20.2%",
      arableLand: "4.7M ha",
      population: "34.1M",
      keyCropsCount: 5,
    },
    operations: {
      services: ["Cocoa Finance", "Input Supply", "Training", "Insurance"],
      members: "700+",
      paymentMethods: ["MTN MoMo", "Bank Transfer", "Vodafone Cash"],
    },
    crops: [
      { name: "Cocoa", icon: "\u{1F36B}" },
      { name: "Cashews", icon: "\u{1F95C}" },
      { name: "Maize", icon: "\u{1F33D}" },
      { name: "Rice", icon: "\u{1F35A}" },
      { name: "Oil Palm", icon: "\u{1F334}" },
    ],
    highlights: [
      "World's #2 cocoa producer — $2B+ annual exports",
      "COCOBOD structured buying programme",
      "MTN Mobile Money dominance for rural payments",
      "Stable democracy with strong rule of law",
    ],
  },
  {
    name: "Uganda",
    slug: "uganda",
    flag: "\u{1F1FA}\u{1F1EC}",
    role: "East African Breadbasket",
    heroImage: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=80",
    description:
      "Uganda is East Africa's breadbasket and a major coffee exporter, with strong mobile money ecosystems driven by MTN and Airtel. The country's fertile soils, reliable rainfall, and strategic EAC position make it a cornerstone of AFU's East African food production network.",
    stats: {
      gdpAgriculture: "24.1%",
      arableLand: "7.2M ha",
      population: "48.6M",
      keyCropsCount: 6,
    },
    operations: {
      services: ["Coffee Finance", "Input Supply", "Training", "Crop Insurance"],
      members: "950+",
      paymentMethods: ["MTN MoMo", "Airtel Money", "Bank Transfer"],
    },
    crops: [
      { name: "Coffee", icon: "\u2615" },
      { name: "Cashews", icon: "\u{1F95C}" },
      { name: "Tea", icon: "\u{1F375}" },
      { name: "Maize", icon: "\u{1F33D}" },
      { name: "Bananas", icon: "\u{1F34C}" },
      { name: "Beans", icon: "\u{1FAD8}" },
    ],
    highlights: [
      "Africa's top coffee exporter by volume",
      "Growing cashew nut production & export",
      "MTN & Airtel mobile money for financial inclusion",
      "Maize & banana production feeding the EAC",
      "Strategic EAC trade hub positioning",
    ],
  },
  // ── East & Southern Africa Expansion (Planned) ──
  {
    name: "Sierra Leone",
    slug: "sierra-leone",
    flag: "\u{1F1F8}\u{1F1F1}",
    role: "West African Agriculture Revival",
    heroImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80",
    description:
      "Sierra Leone is an emerging agricultural market with strong potential in rice, cocoa, and palm oil production. AFU is building partnerships to support farmer cooperatives and drive post-conflict agricultural revival across the country.",
    stats: {
      gdpAgriculture: "60.7%",
      arableLand: "5.4M ha",
      population: "8.6M",
      keyCropsCount: 4,
    },
    operations: {
      services: ["Input Supply", "Training", "Cooperative Development"],
      members: "Coming Soon",
      paymentMethods: ["Orange Money", "Bank Transfer"],
    },
    crops: [
      { name: "Rice", icon: "\u{1F35A}" },
      { name: "Cocoa", icon: "\u{1F36B}" },
      { name: "Palm Oil", icon: "\u{1F334}" },
      { name: "Cassava", icon: "\u{1F360}" },
    ],
    highlights: [
      "Rice self-sufficiency drive",
      "Cocoa & palm oil export potential",
      "Post-conflict agricultural rebuilding",
      "Strong cooperative tradition",
    ],
  },
  {
    name: "Egypt",
    slug: "egypt",
    flag: "\u{1F1EA}\u{1F1EC}",
    role: "North African Agri Powerhouse",
    heroImage: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1600&q=80",
    description:
      "Egypt is Africa's largest agricultural economy with advanced irrigation infrastructure along the Nile. A strategic gateway to Middle Eastern and European export markets, Egypt offers established agri-finance systems and a large domestic market.",
    stats: {
      gdpAgriculture: "11.3%",
      arableLand: "3.7M ha",
      population: "109M",
      keyCropsCount: 5,
    },
    operations: {
      services: ["Trade Finance", "Input Supply", "Processing"],
      members: "Coming Soon",
      paymentMethods: ["Bank Transfer", "Fawry", "Card"],
    },
    crops: [
      { name: "Cotton", icon: "\u{2601}\u{FE0F}" },
      { name: "Citrus", icon: "\u{1F34A}" },
      { name: "Rice", icon: "\u{1F35A}" },
      { name: "Wheat", icon: "\u{1F33E}" },
      { name: "Sugarcane", icon: "\u{1F33F}" },
    ],
    highlights: [
      "Nile basin irrigation infrastructure",
      "Citrus & cotton export powerhouse",
      "Gateway to MENA & EU markets",
      "Africa's largest agricultural GDP",
    ],
  },
  {
    name: "Ethiopia",
    slug: "ethiopia",
    flag: "\u{1F1EA}\u{1F1F9}",
    role: "Coffee Origin & Highland Agriculture",
    heroImage: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1600&q=80",
    description:
      "Ethiopia is the birthplace of coffee and Africa's second most populous nation. With a massive smallholder farming base and growing commercial agriculture sector, Ethiopia offers enormous scale potential for AFU's integrated platform.",
    stats: {
      gdpAgriculture: "36.3%",
      arableLand: "15.1M ha",
      population: "126M",
      keyCropsCount: 5,
    },
    operations: {
      services: ["Coffee Finance", "Input Supply", "Training"],
      members: "Coming Soon",
      paymentMethods: ["Telebirr", "Bank Transfer"],
    },
    crops: [
      { name: "Coffee", icon: "\u2615" },
      { name: "Teff", icon: "\u{1F33E}" },
      { name: "Flowers", icon: "\u{1F33A}" },
      { name: "Sesame", icon: "\u{1F33E}" },
      { name: "Pulses", icon: "\u{1FAD8}" },
    ],
    highlights: [
      "World's #5 coffee producer & origin of Arabica",
      "126M population — massive domestic market",
      "Highland grain & pulse production",
      "Fast-growing flower export industry",
    ],
  },
  {
    name: "Malawi",
    slug: "malawi",
    flag: "\u{1F1F2}\u{1F1FC}",
    role: "Warm Heart of Africa",
    heroImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80",
    description:
      "Malawi presents a tobacco diversification opportunity alongside growing tea, sugar, and legume sectors. A strong NGO ecosystem supporting smallholder development makes it ideal for AFU's cooperative-led model.",
    stats: {
      gdpAgriculture: "22.4%",
      arableLand: "3.8M ha",
      population: "20.4M",
      keyCropsCount: 5,
    },
    operations: {
      services: ["Input Supply", "Training", "Crop Insurance"],
      members: "Coming Soon",
      paymentMethods: ["Airtel Money", "TNM Mpamba", "Bank Transfer"],
    },
    crops: [
      { name: "Tobacco", icon: "\u{1F33F}" },
      { name: "Tea", icon: "\u{1F375}" },
      { name: "Sugar", icon: "\u{1F33F}" },
      { name: "Maize", icon: "\u{1F33D}" },
      { name: "Legumes", icon: "\u{1FAD8}" },
    ],
    highlights: [
      "Tobacco diversification into higher-value crops",
      "Tea & sugar export sectors",
      "Strong smallholder NGO ecosystem",
      "Legume production for regional food security",
    ],
  },
  {
    name: "Namibia",
    slug: "namibia",
    flag: "\u{1F1F3}\u{1F1E6}",
    role: "Southern African Livestock & Horticulture",
    heroImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80",
    description:
      "Namibia offers premium beef exports and an emerging horticulture sector. A stable economy with strong governance and trade links to South Africa and the EU makes it a reliable market for AFU's expansion.",
    stats: {
      gdpAgriculture: "6.2%",
      arableLand: "0.8M ha",
      population: "2.6M",
      keyCropsCount: 4,
    },
    operations: {
      services: ["Livestock Finance", "Trade Finance", "Insurance"],
      members: "Coming Soon",
      paymentMethods: ["Bank Transfer", "MTC MoMo", "Card"],
    },
    crops: [
      { name: "Beef Cattle", icon: "\u{1F404}" },
      { name: "Grapes", icon: "\u{1F347}" },
      { name: "Dates", icon: "\u{1F334}" },
      { name: "Maize", icon: "\u{1F33D}" },
    ],
    highlights: [
      "Premium beef exports to EU markets",
      "Emerging grape & date farming",
      "SACU trade access & stable governance",
      "Strong livestock sector infrastructure",
    ],
  },
  // ── West Africa Expansion (Planned) ──
  {
    name: "Republic of Guinea",
    slug: "republic-of-guinea",
    flag: "\u{1F1EC}\u{1F1F3}",
    role: "West African Mining-to-Agriculture Transition",
    heroImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80",
    description:
      "Guinea has rich agricultural potential in rice, cassava, and tropical fruits. AFU aims to support the country's diversification away from mining dependency through farmer cooperatives and input finance.",
    stats: {
      gdpAgriculture: "26.7%",
      arableLand: "6.2M ha",
      population: "14.2M",
      keyCropsCount: 4,
    },
    operations: {
      services: ["Input Supply", "Training", "Cooperative Development"],
      members: "Coming Soon",
      paymentMethods: ["Orange Money", "MTN MoMo", "Bank Transfer"],
    },
    crops: [
      { name: "Rice", icon: "\u{1F35A}" },
      { name: "Cassava", icon: "\u{1F360}" },
      { name: "Tropical Fruit", icon: "\u{1F34A}" },
      { name: "Palm Oil", icon: "\u{1F334}" },
    ],
    highlights: [
      "Rice & cassava farming at scale",
      "Tropical fruit export potential",
      "Agricultural diversification from mining",
      "ECOWAS trade corridor access",
    ],
  },
  {
    name: "Guinea-Bissau",
    slug: "guinea-bissau",
    flag: "\u{1F1EC}\u{1F1FC}",
    role: "Cashew Capital of West Africa",
    heroImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80",
    description:
      "Guinea-Bissau is the world's fifth-largest cashew producer, with agriculture as the backbone of the economy. AFU sees significant potential for value-added cashew processing and rice production.",
    stats: {
      gdpAgriculture: "50.2%",
      arableLand: "0.9M ha",
      population: "2.1M",
      keyCropsCount: 3,
    },
    operations: {
      services: ["Cashew Finance", "Processing", "Training"],
      members: "Coming Soon",
      paymentMethods: ["Orange Money", "Bank Transfer"],
    },
    crops: [
      { name: "Cashews", icon: "\u{1F95C}" },
      { name: "Rice", icon: "\u{1F35A}" },
      { name: "Palm Oil", icon: "\u{1F334}" },
    ],
    highlights: [
      "Top 5 global cashew producer",
      "Cashew processing value-addition potential",
      "Rice self-sufficiency programmes",
      "ECOWAS & Lusophone trade links",
    ],
  },
  {
    name: "Liberia",
    slug: "liberia",
    flag: "\u{1F1F1}\u{1F1F7}",
    role: "West African Rubber & Palm Oil Hub",
    heroImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80",
    description:
      "Liberia is a major rubber and palm oil producer rebuilding its agricultural sector. With significant rainforest-based agriculture and cocoa potential, Liberia offers long-term development opportunities.",
    stats: {
      gdpAgriculture: "34.1%",
      arableLand: "2.6M ha",
      population: "5.4M",
      keyCropsCount: 4,
    },
    operations: {
      services: ["Input Supply", "Training", "Cooperative Development"],
      members: "Coming Soon",
      paymentMethods: ["Orange Money", "MTN MoMo", "Bank Transfer"],
    },
    crops: [
      { name: "Rubber", icon: "\u{1F333}" },
      { name: "Palm Oil", icon: "\u{1F334}" },
      { name: "Cocoa", icon: "\u{1F36B}" },
      { name: "Rice", icon: "\u{1F35A}" },
    ],
    highlights: [
      "Rubber & palm oil export industries",
      "Cocoa sector development",
      "Post-conflict agricultural rebuilding",
      "Rainforest-based sustainable farming",
    ],
  },
  {
    name: "Mali",
    slug: "mali",
    flag: "\u{1F1F2}\u{1F1F1}",
    role: "Sahel Cotton & Grain Belt",
    heroImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80",
    description:
      "Mali is one of Africa's largest cotton producers and a major rice-growing nation along the Niger River. As a key market for Sahel food security, Mali represents a strategic entry point for AFU's West African expansion.",
    stats: {
      gdpAgriculture: "36.8%",
      arableLand: "7.0M ha",
      population: "22.6M",
      keyCropsCount: 4,
    },
    operations: {
      services: ["Cotton Finance", "Input Supply", "Training"],
      members: "Coming Soon",
      paymentMethods: ["Orange Money", "Moov Money", "Bank Transfer"],
    },
    crops: [
      { name: "Cotton", icon: "\u{2601}\u{FE0F}" },
      { name: "Rice", icon: "\u{1F35A}" },
      { name: "Mango", icon: "\u{1F96D}" },
      { name: "Shea", icon: "\u{1F333}" },
    ],
    highlights: [
      "Top African cotton producer",
      "Niger River irrigated rice farming",
      "Mango & shea nut export potential",
      "Sahel food security anchor market",
    ],
  },
  {
    name: "Ivory Coast",
    slug: "ivory-coast",
    flag: "\u{1F1E8}\u{1F1EE}",
    role: "Global Cocoa & Cashew Leader",
    heroImage: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1600&q=80",
    description:
      "Ivory Coast (Cote d'Ivoire) is the world's largest cocoa producer and a leading cashew exporter. As West Africa's economic powerhouse with the strongest agricultural GDP in the region, it anchors AFU's West African strategy.",
    stats: {
      gdpAgriculture: "21.2%",
      arableLand: "6.9M ha",
      population: "28.9M",
      keyCropsCount: 5,
    },
    operations: {
      services: ["Cocoa Finance", "Cashew Processing", "Trade Finance", "Training"],
      members: "Coming Soon",
      paymentMethods: ["Orange Money", "MTN MoMo", "Moov Money", "Bank Transfer"],
    },
    crops: [
      { name: "Cocoa", icon: "\u{1F36B}" },
      { name: "Cashews", icon: "\u{1F95C}" },
      { name: "Rubber", icon: "\u{1F333}" },
      { name: "Palm Oil", icon: "\u{1F334}" },
      { name: "Coffee", icon: "\u2615" },
    ],
    highlights: [
      "World's #1 cocoa producer — 40%+ of global supply",
      "Top 3 global cashew exporter",
      "Rubber & palm oil diversification",
      "Strongest economy in Francophone West Africa",
    ],
  },
];

/* ─── Static params for all country slugs ─── */

export function generateStaticParams() {
  return FALLBACK_COUNTRIES.map((c) => ({ slug: c.slug }));
}

/* ─── Dynamic metadata ─── */

export function generateMetadata({ params }: { params: { slug: string } }) {
  const country = FALLBACK_COUNTRIES.find((c) => c.slug === params.slug);
  if (!country) return { title: "Country Not Found - AFU" };

  return {
    title: `${country.name} - AFU Countries`,
    description: country.description.slice(0, 160),
    openGraph: {
      title: `${country.name} - AFU Countries`,
      description: country.description.slice(0, 160),
    },
  };
}

/* ─── Page Component ─── */

export default async function CountryPage({ params }: { params: { slug: string } }) {
  const fallback = FALLBACK_COUNTRIES.find((c) => c.slug === params.slug);

  if (!fallback) {
    notFound();
  }

  // Attempt to enrich with DB data; fallback to hardcoded if unavailable
  const country = { ...fallback };
  try {
    const svc = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    // Try site_config countries_data first (admin-editable)
    const { data: configData } = await svc
      .from('site_config')
      .select('value')
      .eq('key', 'countries_data')
      .single();
    if (configData?.value && Array.isArray(configData.value)) {
      const match = configData.value.find((c: Record<string, unknown>) =>
        String(c.slug || c.name || '').toLowerCase().replace(/\s+/g, '-') === params.slug
      );
      if (match) {
        if (match.description) country.description = String(match.description);
        if (match.role) country.role = String(match.role);
        if (match.highlights && Array.isArray(match.highlights)) country.highlights = match.highlights as string[];
        if (match.crops && Array.isArray(match.crops)) {
          country.crops = (match.crops as Array<Record<string, string>>).map((c) => ({ name: c.name || String(c), icon: c.icon || '' }));
        }
      }
    }
    // Also try country_settings table as secondary source
    const { data } = await svc
      .from('country_settings')
      .select('*')
      .eq('country_code', params.slug)
      .single();
    if (data) {
      if (data.description) country.description = data.description;
      if (data.key_crops && Array.isArray(data.key_crops) && data.key_crops.length > 0) {
        country.crops = data.key_crops.map((c: string) => ({ name: c, icon: '' }));
      }
      if (data.highlights && Array.isArray(data.highlights) && data.highlights.length > 0) {
        country.highlights = data.highlights;
      }
    }
  } catch {
    // use fallback
  }

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative text-white py-24 md:py-32 overflow-hidden">
        {/* Background image with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${country.heroImage})` }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(15,26,48,0.92) 0%, rgba(27,42,74,0.88) 50%, rgba(93,179,71,0.15) 100%)",
          }}
        />
        {/* Subtle green glow */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl"
          style={{ background: "#5DB347" }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/countries"
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white mb-8 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            All Countries
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl drop-shadow-lg">
              {country.flag}
            </span>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">{country.name}</h1>
              <span
                className="inline-block mt-2 text-sm font-semibold uppercase tracking-wider px-4 py-1.5 rounded-full"
                style={{
                  background: "rgba(93,179,71,0.2)",
                  color: "#6ABF4B",
                  border: "1px solid rgba(93,179,71,0.3)",
                }}
              >
                {country.role}
              </span>
            </div>
          </div>

          <p className="text-lg md:text-xl text-gray-300 max-w-3xl leading-relaxed">
            {country.description}
          </p>
        </div>
      </section>

      {/* ─── KEY STATS ─── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: "#5DB347" }}
            >
              At a Glance
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              <span className="bg-gradient-to-r from-[#1B2A4A] to-[#5DB347] bg-clip-text text-transparent">
                Key Statistics
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {([
              {
                label: "GDP from Agriculture",
                value: country.stats.gdpAgriculture,
                Icon: BarChart3,
              },
              {
                label: "Arable Land",
                value: country.stats.arableLand,
                Icon: Wheat,
              },
              {
                label: "Population",
                value: country.stats.population,
                Icon: Users,
              },
              {
                label: "Key Crops",
                value: `${country.stats.keyCropsCount} Major`,
                Icon: Sprout,
              },
            ] as { label: string; value: string; Icon: LucideIcon }[]).map((stat) => (
              <div
                key={stat.label}
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg shadow-[#5DB347]/5 border border-[#EBF7E5] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-[#5DB347]/10 flex items-center justify-center mb-3 mx-auto">
                  <stat.Icon className="w-6 h-6 text-[#5DB347]" />
                </div>
                <div
                  className="text-2xl md:text-3xl font-bold mb-1"
                  style={{ color: "#1B2A4A" }}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AFU OPERATIONS ─── */}
      <section
        className="py-16"
        style={{ background: "linear-gradient(180deg, #F8FBF6 0%, #EBF7E5 100%)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: "#5DB347" }}
            >
              Our Presence
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              <span className="bg-gradient-to-r from-[#1B2A4A] to-[#5DB347] bg-clip-text text-transparent">
                AFU in {country.name}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Services Available */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg shadow-[#5DB347]/5 border border-white/50">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: "linear-gradient(135deg, #5DB347, #449933)" }}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3
                className="text-xl font-bold mb-4"
                style={{ color: "#1B2A4A" }}
              >
                Services Available
              </h3>
              <div className="flex flex-wrap gap-2">
                {country.operations.services.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{
                      background: "#EBF7E5",
                      color: "#5DB347",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Members */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg shadow-[#5DB347]/5 border border-white/50">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: "linear-gradient(135deg, #5DB347, #449933)" }}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3
                className="text-xl font-bold mb-4"
                style={{ color: "#1B2A4A" }}
              >
                Members
              </h3>
              <div
                className="text-4xl font-bold mb-2"
                style={{ color: "#5DB347" }}
              >
                {country.operations.members}
              </div>
              <p className="text-sm text-gray-500">
                Active AFU members in {country.name}
              </p>
            </div>

            {/* Payment Methods */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg shadow-[#5DB347]/5 border border-white/50">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: "linear-gradient(135deg, #5DB347, #449933)" }}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3
                className="text-xl font-bold mb-4"
                style={{ color: "#1B2A4A" }}
              >
                Payment Methods
              </h3>
              <div className="flex flex-wrap gap-2">
                {country.operations.paymentMethods.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── KEY CROPS ─── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: "#5DB347" }}
            >
              Agriculture
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              <span className="bg-gradient-to-r from-[#1B2A4A] to-[#5DB347] bg-clip-text text-transparent">
                Key Crops in {country.name}
              </span>
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {country.crops.map((crop) => (
              <div
                key={crop.name}
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg shadow-[#5DB347]/5 border border-[#EBF7E5] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 text-center min-w-[140px]"
              >
                <span className="text-5xl mb-3 block">{crop.icon}</span>
                <div
                  className="text-sm font-semibold"
                  style={{ color: "#1B2A4A" }}
                >
                  {crop.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HIGHLIGHTS ─── */}
      <section
        className="py-16"
        style={{ background: "linear-gradient(180deg, #F8FBF6 0%, white 100%)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: "#5DB347" }}
            >
              Why {country.name}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              <span className="bg-gradient-to-r from-[#1B2A4A] to-[#5DB347] bg-clip-text text-transparent">
                Strategic Highlights
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {country.highlights.map((h, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg shadow-[#5DB347]/5 border border-[#EBF7E5] hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #5DB347, #449933)",
                  }}
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p
                  className="text-base font-medium leading-relaxed"
                  style={{ color: "#1B2A4A" }}
                >
                  {h}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="relative overflow-hidden rounded-3xl p-10 md:p-16 text-center shadow-xl shadow-[#5DB347]/10"
            style={{
              background:
                "linear-gradient(135deg, #0F1A30 0%, #1B2A4A 60%, rgba(93,179,71,0.2) 100%)",
            }}
          >
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] rounded-full opacity-15 blur-3xl"
              style={{ background: "#5DB347" }}
            />
            <div className="relative">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Start Farming with AFU in{" "}
                <span className="bg-gradient-to-r from-[#5DB347] to-[#6ABF4B] bg-clip-text text-transparent">
                  {country.name}
                </span>
              </h3>
              <p className="text-white/70 mb-8 max-w-lg mx-auto">
                Join thousands of farmers across {country.name} who are
                accessing financing, inputs, insurance, and guaranteed markets
                through the AFU platform.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/apply"
                  className="inline-block text-white px-8 py-3.5 rounded-2xl font-semibold transition-all duration-300 shadow-xl shadow-[#5DB347]/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#5DB347]/40"
                  style={{
                    background: "linear-gradient(135deg, #5DB347, #449933)",
                  }}
                >
                  Become a Member
                </Link>
                <Link
                  href="/contact"
                  className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-8 py-3.5 rounded-2xl font-semibold transition-all duration-300"
                >
                  Get in Touch
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
