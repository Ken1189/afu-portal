/* ─── Crop Data for AFU Crops Hub ─── */

export interface CropData {
  name: string;
  slug: string;
  category: 'Grains' | 'Cash Crops' | 'Fruits & Nuts' | 'Vegetables' | 'Industrial Crops';
  image: string;
  tagline: string;
  description: string;
  overview: string[];
  growingConditions: {
    climate: string;
    soil: string;
    altitude: string;
    rainfall: string;
  };
  regions: string[];
  marketData: {
    avgYield: string;
    priceRange: string;
    exportMarkets: string[];
  };
  topCountries: string[];
}

export const CROP_CATEGORIES = [
  'Grains',
  'Cash Crops',
  'Fruits & Nuts',
  'Vegetables',
  'Industrial Crops',
] as const;

export const CROPS: CropData[] = [
  /* ═══════════════════════════════════════════════════════
     GRAINS
     ═══════════════════════════════════════════════════════ */
  {
    name: 'Maize',
    slug: 'maize',
    category: 'Grains',
    image: 'https://images.unsplash.com/photo-1601312031230-9ee4d4364c90?w=800&q=80',
    tagline: 'Africa\'s staple grain — feeding a continent',
    description: 'The most widely grown cereal crop in Sub-Saharan Africa, maize is the primary food source for over 300 million people across the continent.',
    overview: [
      'Maize is the single most important food crop in Sub-Saharan Africa, grown by millions of smallholder farmers from Southern Africa to the Great Lakes region. It forms the base of staple foods such as sadza in Zimbabwe, ugali in East Africa, and pap in South Africa. Beyond subsistence, maize is a critical commercial crop used in animal feed, starch production, and brewing.',
      'Africa produces approximately 75 million tonnes of maize annually, yet the continent remains a net importer due to rapidly growing populations and yield gaps compared to global averages. African maize yields average around 2 tonnes per hectare versus 5-6 tonnes globally, representing an enormous opportunity for yield improvement through better inputs, mechanisation, and agronomic practices.',
      'AFU supports maize farmers through input financing for hybrid seed and fertiliser, crop insurance against drought and flooding, and structured offtake agreements that guarantee market access at harvest. Our warehouse receipt system allows farmers to store maize and sell when prices peak rather than at the depressed harvest-time prices that erode margins for smallholders.',
    ],
    growingConditions: {
      climate: 'Warm tropical to subtropical, 18-32°C optimal growing temperature',
      soil: 'Well-drained loamy soils with pH 5.5-7.0, rich in organic matter',
      altitude: 'Sea level to 2,400m — adapted varieties exist for highland and lowland zones',
      rainfall: '500-1,200mm during growing season, sensitive to drought at flowering stage',
    },
    regions: ['Zimbabwe', 'Kenya', 'Tanzania', 'Zambia', 'Nigeria', 'Mozambique', 'South Africa', 'Ghana', 'Uganda'],
    marketData: {
      avgYield: '2-6 tonnes/ha (depends on inputs and variety)',
      priceRange: '$180-320 per tonne (farm gate)',
      exportMarkets: ['Regional SADC trade', 'East African Community', 'ECOWAS'],
    },
    topCountries: ['South Africa', 'Nigeria', 'Tanzania', 'Kenya', 'Zambia'],
  },
  {
    name: 'Sorghum',
    slug: 'sorghum',
    category: 'Grains',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80',
    tagline: 'Drought-resilient grain for dry-land farming',
    description: 'A drought-tolerant cereal that thrives in semi-arid conditions where maize cannot survive, sorghum is essential for food security in Africa\'s dryland regions.',
    overview: [
      'Sorghum is Africa\'s second most important cereal crop and the backbone of food security in semi-arid regions across the Sahel, the Horn of Africa, and parts of Southern Africa. Unlike maize, sorghum can survive extended dry spells and poor soils, making it the ideal crop for climate-vulnerable farming communities. Nigeria and Sudan are the continent\'s largest producers, together accounting for nearly half of Africa\'s 30 million tonnes of annual production.',
      'Beyond traditional food uses such as porridge and flatbreads, sorghum has growing commercial applications in brewing, animal feed, and gluten-free food products for export markets. Major breweries in Nigeria, Kenya, and South Africa use sorghum as a substitute for barley, creating structured demand and premium pricing for farmers who meet quality specifications.',
      'AFU connects sorghum farmers to these premium markets through quality-graded offtake contracts with breweries and food processors. Our input financing programmes provide access to improved varieties that yield 3-4 tonnes per hectare compared to the 1 tonne typical of traditional varieties, while crop insurance protects against the erratic rainfall patterns that characterise sorghum-growing regions.',
    ],
    growingConditions: {
      climate: 'Semi-arid to tropical, tolerates temperatures up to 40°C',
      soil: 'Tolerates a wide range including heavy clay soils, pH 5.0-8.5',
      altitude: 'Sea level to 2,500m',
      rainfall: '400-800mm — one of the most drought-tolerant cereals globally',
    },
    regions: ['Nigeria', 'Tanzania', 'Kenya', 'Zimbabwe', 'Zambia', 'Mozambique', 'Ghana', 'Uganda'],
    marketData: {
      avgYield: '1-4 tonnes/ha',
      priceRange: '$200-350 per tonne',
      exportMarkets: ['Domestic brewing industry', 'Regional food trade', 'Gluten-free export markets'],
    },
    topCountries: ['Nigeria', 'Tanzania', 'Kenya', 'Ghana'],
  },
  {
    name: 'Millet',
    slug: 'millet',
    category: 'Grains',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
    tagline: 'Ancient grain with modern nutritional value',
    description: 'One of humanity\'s oldest cultivated grains, millet is a nutritional powerhouse that thrives in Africa\'s most challenging growing environments.',
    overview: [
      'Millet encompasses several species including pearl millet and finger millet, both of which have been cultivated in Africa for thousands of years. Pearl millet dominates production in West Africa\'s Sahel belt, while finger millet is widely grown in East Africa\'s highland regions. Together, these crops provide food and income for tens of millions of farming families in areas too dry or too poor for other cereals.',
      'Millet is experiencing a global resurgence driven by health-conscious consumers who value its high protein content, rich mineral profile, and gluten-free properties. The United Nations declared 2023 the International Year of Millets, spotlighting the crop\'s potential to address nutrition and climate challenges simultaneously. African producers are uniquely positioned to supply this growing demand.',
      'AFU supports millet farmers through aggregation and quality standardisation that opens access to premium health-food markets in Europe and North America. Our training programmes cover improved storage techniques that reduce the 20-30% post-harvest losses common with traditional millet handling, directly increasing farmer incomes without requiring additional land or inputs.',
    ],
    growingConditions: {
      climate: 'Hot and semi-arid, 25-35°C optimal, extremely heat-tolerant',
      soil: 'Sandy and poor soils where other cereals fail, pH 5.0-8.0',
      altitude: 'Sea level to 2,000m (finger millet higher, pearl millet lower)',
      rainfall: '300-600mm — the most drought-tolerant cereal crop',
    },
    regions: ['Nigeria', 'Tanzania', 'Kenya', 'Uganda', 'Ghana', 'Zimbabwe'],
    marketData: {
      avgYield: '0.5-2.5 tonnes/ha',
      priceRange: '$250-450 per tonne',
      exportMarkets: ['Health food markets (EU, US)', 'Regional food trade', 'Brewing industry'],
    },
    topCountries: ['Nigeria', 'Tanzania', 'Uganda', 'Kenya'],
  },
  {
    name: 'Rice',
    slug: 'rice',
    category: 'Grains',
    image: 'https://images.unsplash.com/photo-1536304993881-460e45045419?w=800&q=80',
    tagline: 'Closing Africa\'s rice gap — from import to self-sufficiency',
    description: 'Africa\'s fastest-growing food staple, with consumption rising 6% annually as urbanisation drives demand for convenient, quick-cooking grains.',
    overview: [
      'Rice consumption in Africa has surged over the past two decades, driven by urbanisation, rising incomes, and changing dietary preferences. The continent now consumes over 35 million tonnes annually but produces only about 21 million tonnes, creating an import gap worth over $5 billion per year. Nigeria alone spends $2 billion annually on rice imports despite having enormous potential for domestic production.',
      'African rice is grown under diverse systems ranging from irrigated paddies in the Niger River delta to rain-fed upland fields in Tanzania and Mozambique. The development of NERICA (New Rice for Africa) varieties by AfricaRice has created cultivars specifically adapted to African conditions, combining the hardiness of African rice species with the yield potential of Asian varieties.',
      'AFU\'s rice programme focuses on import substitution by financing smallholder rice farmers with improved seed, fertiliser, and mechanised land preparation. Our partnerships with rice mills ensure farmers have guaranteed buyers at harvest, while our irrigation financing helps farmer cooperatives invest in water management infrastructure that enables dry-season cropping and double harvests.',
    ],
    growingConditions: {
      climate: 'Tropical to warm subtropical, 20-35°C, high humidity beneficial',
      soil: 'Heavy clay soils that retain water for paddy cultivation, pH 5.0-6.5',
      altitude: 'Lowland paddies to 1,500m for upland varieties',
      rainfall: '1,000-2,000mm or irrigated — requires standing water for paddy systems',
    },
    regions: ['Nigeria', 'Tanzania', 'Mozambique', 'Ghana', 'Kenya'],
    marketData: {
      avgYield: '2-5 tonnes/ha (paddy)',
      priceRange: '$300-500 per tonne (milled)',
      exportMarkets: ['Domestic market (import substitution)', 'Regional trade within ECOWAS and EAC'],
    },
    topCountries: ['Nigeria', 'Tanzania', 'Ghana', 'Mozambique'],
  },
  {
    name: 'Wheat',
    slug: 'wheat',
    category: 'Grains',
    image: 'https://images.unsplash.com/photo-1437252611977-07f74518abd7?w=800&q=80',
    tagline: 'Strategic grain for Africa\'s growing bakery and milling sector',
    description: 'A temperature-sensitive cereal grown in Africa\'s cooler highlands, wheat is critical for the continent\'s expanding bread, pasta, and biscuit industries.',
    overview: [
      'Wheat is one of Africa\'s most strategically important crops because the continent imports over 40 million tonnes annually, worth approximately $15 billion. Only a handful of African countries produce wheat at scale — South Africa, Kenya, Tanzania, and Zimbabwe lead production, primarily in highland regions where cooler temperatures suit the crop. Rising bread consumption in urban centres across Africa makes wheat import dependence a significant food security and foreign exchange concern.',
      'Kenya\'s Narok County and the South African Free State province demonstrate that high-yielding wheat production is achievable in Africa with the right varieties, inputs, and management. Yields of 4-6 tonnes per hectare are routinely achieved by commercial farmers in these regions, comparable to global averages.',
      'AFU\'s wheat programme targets import substitution by financing irrigated and highland wheat production in Kenya, Tanzania, Zambia, and Zimbabwe. We connect wheat farmers to domestic flour mills through structured contracts that guarantee purchase at pre-agreed prices, de-risking investment for both farmers and millers while reducing national dependence on imported grain.',
    ],
    growingConditions: {
      climate: 'Cool to temperate, 15-25°C optimal, frost-tolerant during dormancy',
      soil: 'Deep, well-drained loamy soils with good fertility, pH 6.0-7.5',
      altitude: '1,500-3,000m in tropical Africa (highland adaptation)',
      rainfall: '450-650mm during growing season, or irrigated',
    },
    regions: ['Kenya', 'South Africa', 'Tanzania', 'Zimbabwe', 'Zambia'],
    marketData: {
      avgYield: '2-6 tonnes/ha',
      priceRange: '$280-400 per tonne',
      exportMarkets: ['Domestic milling industry', 'Regional flour trade'],
    },
    topCountries: ['South Africa', 'Kenya', 'Tanzania', 'Zimbabwe'],
  },

  /* ═══════════════════════════════════════════════════════
     CASH CROPS
     ═══════════════════════════════════════════════════════ */
  {
    name: 'Coffee',
    slug: 'coffee',
    category: 'Cash Crops',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80',
    tagline: 'Premium African coffee — from highland farms to global cups',
    description: 'Africa is the birthplace of coffee, and the continent\'s highland regions produce some of the world\'s most sought-after speciality beans.',
    overview: [
      'Africa is where coffee originated — the forests of southwestern Ethiopia are the genetic homeland of Arabica coffee, and the continent remains a major global producer. Ethiopia, Kenya, Tanzania, and Uganda together produce over 4 million tonnes of green coffee annually, with Ethiopian and Kenyan coffees commanding premium prices in speciality markets worldwide. African coffees are prized for their complex flavour profiles, from Ethiopia\'s floral and fruity notes to Kenya\'s bright acidity and blackcurrant character.',
      'Despite producing some of the world\'s finest coffees, African farmers capture only a small fraction of the $400 billion global coffee industry\'s value. Most smallholders sell unprocessed cherry to intermediaries at depressed prices. The shift toward speciality coffee and direct trade models presents an enormous opportunity for African producers to move up the value chain through wet processing, quality grading, and traceable supply chains.',
      'AFU\'s coffee programme finances wet mills and processing equipment for farmer cooperatives, enabling them to produce washed and natural processed coffee that commands 30-100% premiums over conventional grades. Our quality training and cupping programmes help farmers understand what makes their coffee valuable, while our export partnerships connect cooperatives directly to speciality roasters in Europe, the US, and Asia.',
    ],
    growingConditions: {
      climate: 'Tropical highland, 15-24°C for Arabica, 24-30°C for Robusta',
      soil: 'Deep, well-drained volcanic or laterite soils, pH 6.0-6.5, rich in organic matter',
      altitude: '1,200-2,200m for Arabica, 0-1,200m for Robusta',
      rainfall: '1,500-2,500mm, well-distributed with a dry period for harvest',
    },
    regions: ['Kenya', 'Tanzania', 'Uganda', 'Zimbabwe', 'Mozambique'],
    marketData: {
      avgYield: '0.5-2.5 tonnes/ha (green bean equivalent)',
      priceRange: '$2,000-6,000 per tonne (speciality Arabica)',
      exportMarkets: ['Germany', 'USA', 'Japan', 'Italy', 'Belgium', 'South Korea'],
    },
    topCountries: ['Kenya', 'Tanzania', 'Uganda'],
  },
  {
    name: 'Cocoa',
    slug: 'cocoa',
    category: 'Cash Crops',
    image: 'https://images.unsplash.com/photo-1610611424854-5e07b2345e44?w=800&q=80',
    tagline: 'The chocolate crop — West Africa\'s golden bean',
    description: 'West Africa produces over 70% of the world\'s cocoa, making it the most valuable agricultural export for countries like Ghana and Nigeria.',
    overview: [
      'Cocoa is West Africa\'s most iconic cash crop. Ghana and Ivory Coast together produce over 60% of global supply, while Nigeria and other West African countries contribute additional volumes. The crop supports the livelihoods of approximately 2 million farming families in Ghana alone, making it one of the most important crops for rural poverty reduction in the region.',
      'The global chocolate industry is worth over $130 billion annually, yet the average West African cocoa farmer earns less than $2 per day. This imbalance has driven major reforms including Ghana\'s COCOBOD pricing system and the EU\'s upcoming deforestation regulations, which together are reshaping how cocoa is produced and traded. Traceability, sustainability certification, and living income benchmarks are becoming prerequisites for market access.',
      'AFU supports cocoa farmers through sustainability certification programmes (Rainforest Alliance, Fairtrade), input financing for fertiliser and pruning tools, and cooperative strengthening that improves farmers\' bargaining power. Our traceability platform helps farming communities meet EU deforestation-free supply chain requirements, securing continued access to premium European markets.',
    ],
    growingConditions: {
      climate: 'Humid tropical, 21-32°C, requires constant warmth and moisture',
      soil: 'Deep, well-drained forest soils rich in organic matter, pH 5.0-7.5',
      altitude: '0-800m, typically lowland tropical forest zones',
      rainfall: '1,500-2,500mm, well-distributed throughout the year',
    },
    regions: ['Ghana', 'Nigeria'],
    marketData: {
      avgYield: '0.3-1.0 tonnes/ha',
      priceRange: '$2,500-4,500 per tonne',
      exportMarkets: ['Netherlands', 'Germany', 'Belgium', 'USA', 'UK', 'Switzerland'],
    },
    topCountries: ['Ghana', 'Nigeria'],
  },
  {
    name: 'Tea',
    slug: 'tea',
    category: 'Cash Crops',
    image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&q=80',
    tagline: 'Highland plantations producing world-class black tea',
    description: 'Kenya is the world\'s largest exporter of black tea, and African tea from highland regions is renowned for its strong, bright liquor.',
    overview: [
      'Kenya is the world\'s largest exporter of black tea, producing over 500,000 tonnes annually from highland farms between 1,500m and 2,700m elevation. The Kenya Tea Development Agency (KTDA) manages one of Africa\'s most successful smallholder agricultural models, with over 600,000 small-scale farmers delivering leaf to 71 processing factories. Tanzania, Uganda, and Zimbabwe also produce significant volumes of quality black tea.',
      'African tea is predominantly CTC (Crush, Tear, Curl) processed black tea used in tea bags and blends globally. However, there is growing interest in speciality orthodox and purple tea production that commands premium prices. Kenya\'s purple tea variety, developed by the Tea Research Institute, is gaining traction in health-conscious markets due to its high anthocyanin content.',
      'AFU works with tea farmer cooperatives to diversify into value-added products including speciality orthodox teas, flavoured blends, and packaged retail-ready tea. Our financing enables smallholders to invest in shade netting, organic transition, and leaf quality improvements that increase returns per kilogram. We also support direct export relationships that bypass the Mombasa Tea Auction for speciality lots.',
    ],
    growingConditions: {
      climate: 'Cool tropical highland, 13-25°C, consistent cloud cover beneficial',
      soil: 'Acidic, well-drained volcanic soils, pH 4.5-5.5, high in organic matter',
      altitude: '1,500-2,700m — higher altitudes produce finer quality',
      rainfall: '1,200-2,500mm, evenly distributed — tea requires year-round moisture',
    },
    regions: ['Kenya', 'Tanzania', 'Uganda', 'Zimbabwe', 'Mozambique'],
    marketData: {
      avgYield: '2-4 tonnes/ha (made tea)',
      priceRange: '$1,800-3,500 per tonne',
      exportMarkets: ['Pakistan', 'Egypt', 'UK', 'Afghanistan', 'Sudan', 'UAE'],
    },
    topCountries: ['Kenya', 'Tanzania', 'Uganda', 'Zimbabwe'],
  },
  {
    name: 'Tobacco',
    slug: 'tobacco',
    category: 'Cash Crops',
    image: 'https://images.unsplash.com/photo-1416339134316-0e91dc9ded92?w=800&q=80',
    tagline: 'High-value leaf crop driving rural economies',
    description: 'Zimbabwe and Tanzania are major producers of premium flue-cured and burley tobacco, one of Africa\'s highest-earning export crops per hectare.',
    overview: [
      'Tobacco remains one of Africa\'s most lucrative cash crops on a per-hectare basis, with Zimbabwe consistently ranking as the world\'s fourth-largest exporter. The crop supports over 150,000 registered tobacco growers in Zimbabwe alone, generating over $800 million in annual export earnings. Tanzania, Mozambique, and Zambia are also significant producers, primarily of burley and dark-fired varieties.',
      'Zimbabwe\'s tobacco auction system is one of the most transparent agricultural market mechanisms in Africa, with three auction floors in Harare where leaf is graded and sold in real time. The shift from large-scale commercial farming to smallholder production since 2000 has created both challenges and opportunities — smallholders now produce over 70% of Zimbabwe\'s crop but often lack the curing infrastructure and input financing needed to produce premium grades.',
      'AFU provides tobacco farmers with seasonal input financing for seed, fertiliser, and curing fuel, structured as repayable advances against contracted deliveries. Our grading training programmes help farmers cure and prepare leaf to achieve higher grades at auction, while our barn construction financing enables investment in energy-efficient curing infrastructure that improves both quality and profitability.',
    ],
    growingConditions: {
      climate: 'Warm subtropical, 20-30°C during growing season',
      soil: 'Sandy loam soils with good drainage, pH 5.5-6.5, low nitrogen preferred',
      altitude: '600-1,800m',
      rainfall: '600-1,200mm concentrated in the growing season',
    },
    regions: ['Zimbabwe', 'Tanzania', 'Mozambique', 'Zambia'],
    marketData: {
      avgYield: '1.5-3.0 tonnes/ha',
      priceRange: '$2,500-5,500 per tonne (flue-cured)',
      exportMarkets: ['China', 'Belgium', 'South Africa', 'UAE', 'Indonesia'],
    },
    topCountries: ['Zimbabwe', 'Tanzania', 'Mozambique', 'Zambia'],
  },
  {
    name: 'Cotton',
    slug: 'cotton',
    category: 'Cash Crops',
    image: 'https://images.unsplash.com/photo-1615212407379-2ec2d4978c3a?w=800&q=80',
    tagline: 'White gold — connecting African farms to global textile markets',
    description: 'African cotton is prized for its hand-picked quality, supplying textile industries across Asia and Europe with premium long-staple fibre.',
    overview: [
      'Africa produces approximately 6% of global cotton, but the continent\'s hand-picked cotton is renowned for its cleanliness and quality compared to mechanically harvested cotton from other regions. West Africa (particularly Burkina Faso, Mali, and Benin) leads continental production, while in AFU\'s markets, Zimbabwe, Tanzania, and Mozambique are significant producers with established ginnery infrastructure.',
      'Cotton is typically the first structured cash crop that subsistence farmers adopt because it has reliable buyers, defined quality standards, and well-established contract farming models. Cotton companies provide inputs on credit and purchase the entire harvest — a model that AFU adapts and improves upon for other crops.',
      'AFU supports cotton farmers by complementing existing contract farming arrangements with additional financing for food crops (reducing household food insecurity), crop insurance that protects against both drought and price drops, and savings products that help families build resilience between seasons. We also connect ginners with textile buyers to strengthen the entire value chain.',
    ],
    growingConditions: {
      climate: 'Warm tropical to subtropical, 25-35°C during growing season',
      soil: 'Deep, well-drained loamy soils, pH 5.5-8.0',
      altitude: 'Below 1,500m typically',
      rainfall: '500-1,000mm, concentrated in the growing season with dry harvest',
    },
    regions: ['Zimbabwe', 'Tanzania', 'Mozambique', 'Zambia', 'Nigeria', 'Ghana'],
    marketData: {
      avgYield: '0.8-2.0 tonnes/ha (seed cotton)',
      priceRange: '$1,500-2,500 per tonne (lint)',
      exportMarkets: ['China', 'Bangladesh', 'Vietnam', 'India', 'Turkey'],
    },
    topCountries: ['Zimbabwe', 'Tanzania', 'Mozambique', 'Zambia'],
  },
  {
    name: 'Sugarcane',
    slug: 'sugarcane',
    category: 'Cash Crops',
    image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80',
    tagline: 'Sweet opportunity — sugar, ethanol, and energy from one crop',
    description: 'Sugarcane is a versatile crop producing sugar, ethanol, and electricity from bagasse, supporting large-scale agro-industrial operations across Africa.',
    overview: [
      'Sugarcane is grown commercially across much of Sub-Saharan Africa, with South Africa, Kenya, Tanzania, Mozambique, and Zimbabwe operating large sugar estates and outgrower schemes. The crop is unique in offering three revenue streams from a single harvest: refined sugar for domestic and export markets, ethanol for fuel and industrial use, and electricity generated by burning bagasse (the fibrous residue after crushing).',
      'Africa\'s sugar industry is characterised by a mix of large estates and smallholder outgrower schemes. In countries like Kenya and South Africa, outgrower models allow smallholders to supply cane to estate mills under structured contracts. However, the sector faces challenges including ageing infrastructure, water scarcity, and competition from cheaper imported sugar.',
      'AFU supports sugarcane outgrowers through input financing for planting material, fertiliser, and irrigation equipment. Our cooperative strengthening programmes help outgrower associations negotiate better terms with mills, while our insurance products protect against the drought and flooding that can devastate sugarcane crops. We also finance small-scale jaggery and ethanol production for farmers too far from commercial mills.',
    ],
    growingConditions: {
      climate: 'Tropical to subtropical, 20-35°C, long warm growing season required',
      soil: 'Deep, fertile alluvial soils, pH 5.5-7.5, good water retention',
      altitude: 'Below 1,500m, typically in river valleys and coastal lowlands',
      rainfall: '1,200-1,800mm or irrigated — sugarcane is a heavy water user',
    },
    regions: ['South Africa', 'Kenya', 'Tanzania', 'Mozambique', 'Zimbabwe', 'Zambia', 'Uganda'],
    marketData: {
      avgYield: '60-120 tonnes/ha (cane)',
      priceRange: '$30-50 per tonne (cane at mill gate)',
      exportMarkets: ['EU (preferential access)', 'Regional COMESA/SADC', 'Domestic market'],
    },
    topCountries: ['South Africa', 'Kenya', 'Tanzania', 'Mozambique'],
  },

  /* ═══════════════════════════════════════════════════════
     FRUITS & NUTS
     ═══════════════════════════════════════════════════════ */
  {
    name: 'Blueberries',
    slug: 'blueberries',
    category: 'Fruits & Nuts',
    image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&q=80',
    tagline: 'Africa\'s high-value berry revolution',
    description: 'Zimbabwe and South Africa have emerged as major blueberry exporters, supplying European and UK markets during the Northern Hemisphere winter.',
    overview: [
      'Blueberry production in Africa has exploded over the past decade, transforming from virtually zero to a multi-hundred-million-dollar export industry. Zimbabwe and South Africa lead this revolution, taking advantage of their counter-seasonal growing window to supply European supermarkets when local supplies are unavailable. Zimbabwe alone exported over 20,000 tonnes in 2023, making it one of the country\'s top fresh produce exports.',
      'The economics of blueberry farming are exceptional — a mature blueberry farm can generate $30,000-80,000 per hectare in gross revenue, compared to $500-1,500 for most grain crops. However, establishment costs are high ($15,000-25,000 per hectare) and the crop requires intensive management including fertigation, bird netting, cold chain logistics, and skilled picking labour. This creates a significant financing barrier for new entrants.',
      'AFU is the founding partner in Zimbabwe\'s blueberry export lane. We finance farm establishment, provide technical training through partnerships with experienced growers, and arrange structured export contracts with UK and EU supermarket suppliers. Our escrow-based repayment model means farmers repay input financing directly from export proceeds, creating a self-sustaining cycle of investment and returns.',
    ],
    growingConditions: {
      climate: 'Subtropical highland, 15-28°C, requires chilling hours for fruit set',
      soil: 'Acidic, well-drained sandy soils or raised beds with peat/coco coir, pH 4.5-5.5',
      altitude: '1,000-1,800m for optimal chilling and quality',
      rainfall: 'Irrigated — precision drip fertigation required, 800-1,200mm equivalent',
    },
    regions: ['Zimbabwe', 'South Africa', 'Kenya'],
    marketData: {
      avgYield: '8-15 tonnes/ha (mature orchard)',
      priceRange: '$4,000-10,000 per tonne (fresh export)',
      exportMarkets: ['UK', 'Netherlands', 'Germany', 'Middle East', 'China'],
    },
    topCountries: ['Zimbabwe', 'South Africa', 'Kenya'],
  },
  {
    name: 'Macadamia',
    slug: 'macadamia',
    category: 'Fruits & Nuts',
    image: 'https://images.unsplash.com/photo-1596363505729-4190a9506133?w=800&q=80',
    tagline: 'The queen of nuts — Africa\'s premium tree crop',
    description: 'South Africa and Kenya are the world\'s largest macadamia producers, with the global nut commanding premium prices in Asian and Western markets.',
    overview: [
      'South Africa is the world\'s largest macadamia producer, contributing approximately 27% of global supply, followed by Kenya which has rapidly expanded production over the past decade. The macadamia is often called the most valuable nut in the world — kernel prices of $8,000-15,000 per tonne make it one of Africa\'s highest-value tree crops. Zimbabwe, Tanzania, and Mozambique are emerging producers with ideal growing conditions.',
      'Macadamia orchards require patience — trees take 5-7 years to reach commercial bearing and 12-15 years to reach full maturity. However, once established, orchards produce for 40-60 years with relatively low annual input costs, making macadamia an excellent long-term investment. The global market has grown at 8-10% annually, driven by rising demand in China, South Korea, and health-food markets.',
      'AFU finances macadamia orchard establishment for smallholder farmers through patient capital structures with grace periods matching the tree\'s maturation timeline. We partner with established processors for nut cracking and grading services, and our cooperative model allows smallholders to achieve the quality consistency and volumes required for export. Our insurance products cover the critical establishment period against drought, fire, and pest damage.',
    ],
    growingConditions: {
      climate: 'Subtropical to tropical, 15-30°C, frost-free areas essential',
      soil: 'Deep, well-drained red volcanic or laterite soils, pH 5.0-6.5',
      altitude: '600-1,800m',
      rainfall: '1,000-2,000mm, well-distributed throughout the year',
    },
    regions: ['South Africa', 'Kenya', 'Zimbabwe', 'Tanzania', 'Mozambique'],
    marketData: {
      avgYield: '3-5 tonnes/ha (nut-in-shell, mature orchard)',
      priceRange: '$2,000-4,500 per tonne (nut-in-shell)',
      exportMarkets: ['China', 'USA', 'Japan', 'South Korea', 'Germany', 'Australia'],
    },
    topCountries: ['South Africa', 'Kenya', 'Zimbabwe'],
  },
  {
    name: 'Cashew Nuts',
    slug: 'cashew-nuts',
    category: 'Fruits & Nuts',
    image: 'https://images.unsplash.com/photo-1563292769-4e05b684851a?w=800&q=80',
    tagline: 'East Africa\'s booming nut export',
    description: 'Tanzania and Mozambique are leading cashew producers, with the global market growing rapidly as demand for plant-based snacks surges.',
    overview: [
      'Cashew nuts are one of East and Southern Africa\'s most important export crops. Tanzania is Africa\'s largest cashew producer, followed by Mozambique, with both countries situated in the ideal tropical coastal belt for cashew cultivation. The global cashew market has grown dramatically — world production has tripled over the past two decades, driven by rising demand for healthy snack foods and plant-based proteins.',
      'The critical challenge in African cashew production is the processing gap. Africa produces over half of the world\'s raw cashew nuts but processes less than 15% domestically, with the majority shipped to India and Vietnam for shelling and packaging. This means African countries export raw materials at $800-1,200 per tonne and import finished kernels at $6,000-10,000 per tonne — a massive value loss.',
      'AFU is focused on closing this processing gap by financing cashew processing facilities in Tanzania and Mozambique. Our approach combines input financing for tree rehabilitation (many cashew trees are old and low-yielding), training in harvest and post-harvest handling, and investment in local processing capacity that captures value in-country. Our market connections link African-processed kernels directly to European and American retailers.',
    ],
    growingConditions: {
      climate: 'Hot tropical, 24-35°C, requires distinct dry season for flowering',
      soil: 'Sandy, well-drained soils, pH 5.0-6.5, tolerates poor fertility',
      altitude: 'Below 700m, typically coastal lowlands',
      rainfall: '800-1,500mm with a pronounced dry season of 4-6 months',
    },
    regions: ['Tanzania', 'Mozambique', 'Nigeria', 'Kenya', 'Ghana'],
    marketData: {
      avgYield: '0.5-1.5 tonnes/ha (raw cashew)',
      priceRange: '$800-1,500 per tonne (raw nut)',
      exportMarkets: ['India', 'Vietnam', 'USA', 'EU', 'Middle East'],
    },
    topCountries: ['Tanzania', 'Mozambique', 'Nigeria'],
  },
  {
    name: 'Mangoes',
    slug: 'mangoes',
    category: 'Fruits & Nuts',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&q=80',
    tagline: 'Tropical sweetness — fresh, dried, and processed',
    description: 'Africa produces over 50% of the world\'s mangoes, with enormous potential in processing, dried fruit exports, and fresh premium market access.',
    overview: [
      'Africa is the world\'s largest mango-producing continent, with Nigeria, Kenya, Tanzania, and Ghana among the top producers. The crop thrives in the tropical and semi-arid zones that cover much of the continent. Mango trees are remarkably resilient, producing fruit for decades with minimal inputs — making them an ideal crop for smallholder farmers seeking reliable income from tree crops.',
      'The main challenge with African mangoes is not production but post-harvest handling and market access. Up to 40% of the mango harvest is lost due to the fruit\'s short shelf life and inadequate cold chain infrastructure. However, processing into dried mango, juice, puree, and chutney can transform this perishable surplus into shelf-stable products with year-round market value. Dried mango exports from West Africa to EU health-food markets have grown rapidly.',
      'AFU supports mango farmers through investment in community-level processing facilities for drying, pulping, and juice extraction. Our aggregation model collects fruit from hundreds of smallholders and channels it to processing centres, reducing post-harvest losses and creating value-added products. We also facilitate fresh mango exports for premium varieties through cold chain partnerships and market linkages.',
    ],
    growingConditions: {
      climate: 'Tropical to semi-arid, 24-35°C, dry season needed for flowering',
      soil: 'Deep, well-drained alluvial or sandy loam soils, pH 5.5-7.5',
      altitude: 'Below 1,200m',
      rainfall: '600-1,500mm with a distinct dry period of 3-5 months',
    },
    regions: ['Kenya', 'Tanzania', 'Nigeria', 'Ghana', 'Mozambique', 'Uganda'],
    marketData: {
      avgYield: '5-15 tonnes/ha',
      priceRange: '$200-600 per tonne (fresh); $3,000-5,000 per tonne (dried)',
      exportMarkets: ['EU (dried mango)', 'Middle East (fresh)', 'Regional markets'],
    },
    topCountries: ['Nigeria', 'Kenya', 'Tanzania', 'Ghana'],
  },
  {
    name: 'Avocado',
    slug: 'avocado',
    category: 'Fruits & Nuts',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&q=80',
    tagline: 'Green gold — Africa\'s fastest-growing export fruit',
    description: 'Kenya, Tanzania, and South Africa are rapidly expanding avocado production to meet surging global demand, particularly in Europe and Asia.',
    overview: [
      'Avocado has become one of Africa\'s fastest-growing export crops, driven by relentless global demand growth that shows no signs of slowing. Kenya is the continent\'s leading exporter, shipping Hass and Fuerte varieties primarily to the EU, while South Africa, Tanzania, and Mozambique are expanding acreage rapidly. Global avocado consumption has more than tripled in the past decade, and Africa is uniquely positioned to supply the European market during key windows.',
      'Kenya\'s avocado industry has professionalised rapidly, with exporters meeting the stringent phytosanitary and quality requirements of European supermarkets. The Kenyan Horticulture Council\'s traceability systems and GlobalG.A.P. certification infrastructure provide a model for other AFU countries to replicate. Tanzania and Mozambique are following Kenya\'s path, developing export-grade orchards and pack-house infrastructure.',
      'AFU finances avocado orchard establishment and expansion, providing the patient capital needed for the 3-4 year period before first commercial harvest. Our export market connections, GlobalG.A.P. certification support, and cold chain partnerships enable smallholder farmers to access premium export markets. We also support domestic value addition through avocado oil extraction, which is a high-value product with growing demand.',
    ],
    growingConditions: {
      climate: 'Subtropical to tropical highland, 16-28°C, frost-sensitive',
      soil: 'Well-drained, aerated soils — avocado roots are extremely sensitive to waterlogging, pH 5.5-7.0',
      altitude: '800-2,200m for Hass variety in tropical Africa',
      rainfall: '1,000-1,800mm, well-distributed — supplementary irrigation often needed',
    },
    regions: ['Kenya', 'Tanzania', 'South Africa', 'Mozambique', 'Zimbabwe', 'Uganda'],
    marketData: {
      avgYield: '8-15 tonnes/ha (mature orchard)',
      priceRange: '$800-2,000 per tonne (export grade Hass)',
      exportMarkets: ['EU (France, UK, Netherlands)', 'Middle East', 'China', 'Russia'],
    },
    topCountries: ['Kenya', 'South Africa', 'Tanzania'],
  },
  {
    name: 'Bananas',
    slug: 'bananas',
    category: 'Fruits & Nuts',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&q=80',
    tagline: 'Africa\'s most consumed fruit — food, income, and resilience',
    description: 'Bananas and plantains are the most important fruit crop in Africa, providing food security and income for millions of families across the tropics.',
    overview: [
      'Bananas and plantains are Africa\'s most important fruit crop by volume, with the continent producing over 40 million tonnes annually. East Africa is the world\'s largest banana-consuming region — Uganda alone produces over 10 million tonnes per year, and bananas contribute up to 30% of daily caloric intake in parts of Uganda, Tanzania, and Rwanda. The crop includes dessert bananas, cooking bananas (matoke), and plantains.',
      'While most African banana production serves local and domestic markets, there is growing export potential for both fresh dessert bananas and processed banana products such as chips, flour, and dried fruit. Mozambique and Ghana export bananas to regional markets, and the development of tissue culture banana technology has enabled rapid multiplication of disease-free planting material that dramatically improves yields.',
      'AFU supports banana farmers through access to tissue culture plantlets that yield 2-3 times more than traditional suckers, training in bunch management and disease control (particularly against Fusarium TR4 and Black Sigatoka), and market linkages for surplus production. Our processing financing enables farming communities to add value through banana drying, flour milling, and chip production.',
    ],
    growingConditions: {
      climate: 'Warm tropical, 26-30°C, requires constant warmth and humidity',
      soil: 'Deep, fertile, well-drained loamy soils with high organic matter, pH 5.5-7.0',
      altitude: 'Below 1,800m — highland cooking bananas to 2,000m in East Africa',
      rainfall: '1,200-2,500mm, evenly distributed — bananas need constant moisture',
    },
    regions: ['Uganda', 'Tanzania', 'Kenya', 'Mozambique', 'Ghana', 'Nigeria'],
    marketData: {
      avgYield: '15-40 tonnes/ha',
      priceRange: '$100-300 per tonne (farm gate, domestic)',
      exportMarkets: ['Regional East African trade', 'EU (for Cavendish)', 'Middle East'],
    },
    topCountries: ['Uganda', 'Tanzania', 'Kenya', 'Nigeria', 'Mozambique'],
  },
  {
    name: 'Citrus',
    slug: 'citrus',
    category: 'Fruits & Nuts',
    image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800&q=80',
    tagline: 'From orchards to the world — Africa\'s citrus powerhouse',
    description: 'South Africa is the world\'s second-largest citrus exporter, and the sector is expanding across Zimbabwe, Kenya, and Mozambique.',
    overview: [
      'South Africa is a global citrus powerhouse, ranking as the world\'s second-largest exporter of fresh citrus fruit behind Spain. The country exports over 160 million cartons annually, worth over $2 billion, primarily oranges, lemons, grapefruit, and soft citrus (mandarins). Zimbabwe, Mozambique, and Kenya also have established citrus industries with significant expansion potential.',
      'The citrus industry demonstrates what structured, export-oriented agriculture looks like at scale in Africa — with integrated cold chains, phytosanitary compliance, traceability systems, and direct relationships with global retail buyers. This infrastructure and expertise can serve as a template for developing export capacity in other fruit crops across AFU countries.',
      'AFU supports citrus expansion beyond South Africa by financing orchard establishment in Zimbabwe, Kenya, and Mozambique, and by transferring the technical and commercial expertise of South Africa\'s established industry. Our programmes cover everything from nursery certification and orchard design to pack-house operations and export market access, enabling new producing regions to leapfrog development stages.',
    ],
    growingConditions: {
      climate: 'Subtropical to warm temperate, 15-30°C, frost-sensitive when young',
      soil: 'Well-drained sandy loam to clay loam, pH 5.5-7.0',
      altitude: 'Below 1,500m',
      rainfall: '800-1,200mm or irrigated — citrus is commonly irrigated in commercial settings',
    },
    regions: ['South Africa', 'Zimbabwe', 'Kenya', 'Mozambique', 'Tanzania'],
    marketData: {
      avgYield: '20-50 tonnes/ha',
      priceRange: '$400-900 per tonne (export grade)',
      exportMarkets: ['EU', 'Middle East', 'Asia', 'USA', 'Russia'],
    },
    topCountries: ['South Africa', 'Zimbabwe', 'Kenya'],
  },

  /* ═══════════════════════════════════════════════════════
     VEGETABLES
     ═══════════════════════════════════════════════════════ */
  {
    name: 'Tomatoes',
    slug: 'tomatoes',
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80',
    tagline: 'Africa\'s most consumed vegetable — fresh and processed',
    description: 'Tomatoes are grown by virtually every farming community in Africa, providing essential nutrition and income from both fresh sales and processing.',
    overview: [
      'Tomatoes are the most widely consumed vegetable across Africa, grown in virtually every agro-ecological zone from the Sahel to the subtropics. Nigeria is Africa\'s largest producer, followed by Egypt, with Kenya, Tanzania, Ghana, and South Africa also producing significant volumes. The crop is grown year-round in tropical regions and seasonally in subtropical areas, providing continuous income opportunities for farmers.',
      'The tomato value chain in Africa is characterised by severe post-harvest losses — up to 50% of the harvest perishes before reaching consumers in some markets due to poor handling, inadequate cold chains, and distance from markets. This waste represents both a tragedy and an opportunity. Processing into paste, sauce, and canned tomatoes can transform perishable surplus into shelf-stable products with established demand.',
      'AFU addresses tomato value chain challenges by financing community-level cold rooms and processing equipment, connecting smallholders to paste factories and fresh produce markets, and providing training in improved production techniques including protected cultivation (greenhouses and shade houses) that extend the growing season and improve quality. Our crop insurance covers the weather risks that make open-field tomato production volatile.',
    ],
    growingConditions: {
      climate: 'Warm tropical to subtropical, 20-30°C optimal, sensitive to extreme heat',
      soil: 'Well-drained, fertile loamy soils, pH 6.0-7.0, rich in organic matter',
      altitude: 'Sea level to 2,000m',
      rainfall: '500-1,200mm or irrigated — excessive moisture promotes fungal diseases',
    },
    regions: ['Nigeria', 'Kenya', 'Tanzania', 'Ghana', 'South Africa', 'Mozambique', 'Zimbabwe'],
    marketData: {
      avgYield: '15-50 tonnes/ha (open field to greenhouse)',
      priceRange: '$150-400 per tonne (fresh, farm gate)',
      exportMarkets: ['Domestic markets', 'Regional cross-border trade', 'Processing factories'],
    },
    topCountries: ['Nigeria', 'Kenya', 'Tanzania', 'South Africa', 'Ghana'],
  },
  {
    name: 'Onions',
    slug: 'onions',
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&q=80',
    tagline: 'The universal cooking ingredient — high demand, high margins',
    description: 'Onions are grown across Africa for both domestic consumption and regional trade, with significant price premiums during off-season windows.',
    overview: [
      'Onions rank among Africa\'s most commercially important vegetables, with demand that is remarkably consistent and growing in line with urbanisation. Nigeria, Tanzania, and South Africa are the continent\'s largest producers, but onions are grown in nearly every AFU country. The crop offers attractive margins for farmers who can produce during off-season windows when supply is short and prices peak.',
      'Onion storage is a critical value-adding step — farmers who can store bulbs for 2-4 months after harvest typically sell at prices 50-100% higher than harvest-time levels. Simple ambient-air storage structures can extend shelf life significantly, but most smallholders lack the knowledge or financing to invest in proper storage infrastructure.',
      'AFU supports onion farmers through financing for improved seed varieties (particularly Red Creole and Texas Grano types suited to African conditions), drip irrigation systems for dry-season production, and post-harvest storage infrastructure. Our market information services help farmers time their sales to maximise returns, while our cooperative aggregation model gives smallholders access to larger wholesale buyers.',
    ],
    growingConditions: {
      climate: 'Cool to warm, 15-25°C for bulbing, day length sensitivity varies by variety',
      soil: 'Well-drained, sandy loam soils, pH 6.0-7.0, free from waterlogging',
      altitude: 'Sea level to 2,500m — variety selection depends on altitude and latitude',
      rainfall: '400-700mm or irrigated — onions need consistent moisture during bulbing',
    },
    regions: ['Nigeria', 'Tanzania', 'Kenya', 'South Africa', 'Ghana', 'Zambia'],
    marketData: {
      avgYield: '20-45 tonnes/ha',
      priceRange: '$200-600 per tonne (seasonal variation)',
      exportMarkets: ['Regional cross-border trade', 'Domestic wholesale markets'],
    },
    topCountries: ['Nigeria', 'Tanzania', 'South Africa', 'Kenya'],
  },
  {
    name: 'Potatoes',
    slug: 'potatoes',
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82ber45a?w=800&q=80',
    tagline: 'Highland tuber crop with growing commercial demand',
    description: 'Potato production is expanding rapidly across Africa\'s highland regions, driven by urbanisation and the growth of fast-food and processing industries.',
    overview: [
      'Potato is one of Africa\'s fastest-growing food crops, with production doubling over the past two decades as urbanisation drives demand for French fries, crisps, and processed potato products. The crop thrives in the highland zones of Kenya, South Africa, Tanzania, Zimbabwe, and Uganda, where cool temperatures suit tuber development. Kenya\'s potato industry alone is worth over $500 million annually and supports an estimated 800,000 farming families.',
      'The potato value chain offers significant opportunities for value addition beyond fresh sales. Africa\'s expanding quick-service restaurant sector (driven by chains like KFC, Chicken Inn, and local operators) creates structured demand for processing-quality potatoes. However, most African potato production uses varieties suited to fresh consumption rather than processing, creating a gap that strategic varietal development and farmer training can address.',
      'AFU supports potato farmers through financing for certified seed (a critical constraint — most African potato farmers use retained seed that carries disease and reduces yields), cold storage infrastructure, and market linkages with processors and fresh produce wholesale markets. Our partnership approach connects seed companies, agrochemical suppliers, and potato buyers to create an integrated value chain.',
    ],
    growingConditions: {
      climate: 'Cool highland, 15-20°C optimal, frost damages foliage',
      soil: 'Well-drained, deep sandy loam soils, pH 5.5-6.5, free from nematodes',
      altitude: '1,500-3,000m in tropical Africa',
      rainfall: '500-700mm during the 90-120 day growing season, or irrigated',
    },
    regions: ['Kenya', 'South Africa', 'Tanzania', 'Zimbabwe', 'Uganda', 'Zambia'],
    marketData: {
      avgYield: '15-35 tonnes/ha',
      priceRange: '$200-500 per tonne',
      exportMarkets: ['Domestic markets', 'Regional trade', 'Processing industry'],
    },
    topCountries: ['Kenya', 'South Africa', 'Tanzania', 'Zimbabwe'],
  },
  {
    name: 'Cassava',
    slug: 'cassava',
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1603046891726-36bfd957e0bf?w=800&q=80',
    tagline: 'Africa\'s food security champion — resilient and versatile',
    description: 'Cassava is the ultimate resilience crop, growing in poor soils with minimal inputs and providing food security for over 500 million Africans.',
    overview: [
      'Cassava is Africa\'s most important root crop and a critical food security safety net for over 500 million people. Nigeria is the world\'s largest cassava producer at approximately 60 million tonnes annually, followed by the Democratic Republic of Congo, Ghana, Tanzania, and Mozambique. The crop\'s ability to grow in poor, acidic soils with minimal inputs, and its tolerance of both drought and erratic rainfall, makes it indispensable for subsistence farming communities.',
      'Beyond food security, cassava has enormous industrial potential. Cassava starch is used in food processing, textiles, pharmaceuticals, and bioplastics. High-quality cassava flour (HQCF) can substitute for up to 20% of wheat flour in bread production, creating a massive import substitution opportunity across Africa. Nigeria\'s cassava transformation initiative has demonstrated the crop\'s commercial viability, though processing capacity remains far below potential.',
      'AFU\'s cassava programme targets the processing gap — financing flash dryers, chipping machines, and starch extraction equipment that convert perishable fresh cassava roots into shelf-stable products with significantly higher market value. We supply farmers with improved varieties (particularly high-starch and disease-resistant cultivars), provide post-harvest handling training, and connect farmer cooperatives to industrial buyers of cassava starch and flour.',
    ],
    growingConditions: {
      climate: 'Tropical, 25-35°C, highly heat-tolerant',
      soil: 'Tolerates extremely poor, sandy, and acidic soils where other crops fail, pH 4.5-8.0',
      altitude: 'Below 1,500m',
      rainfall: '500-2,000mm — extremely drought-tolerant once established',
    },
    regions: ['Nigeria', 'Tanzania', 'Mozambique', 'Ghana', 'Kenya', 'Uganda', 'Zambia'],
    marketData: {
      avgYield: '10-25 tonnes/ha (fresh roots)',
      priceRange: '$50-120 per tonne (fresh); $400-700 per tonne (dried chips/flour)',
      exportMarkets: ['Domestic industrial market', 'Regional starch trade', 'EU (bioplastics)'],
    },
    topCountries: ['Nigeria', 'Tanzania', 'Ghana', 'Mozambique'],
  },

  /* ═══════════════════════════════════════════════════════
     INDUSTRIAL CROPS
     ═══════════════════════════════════════════════════════ */
  {
    name: 'Soya Beans',
    slug: 'soya-beans',
    category: 'Industrial Crops',
    image: 'https://images.unsplash.com/photo-1563252722-6434563a985d?w=800&q=80',
    tagline: 'Protein powerhouse — feeding livestock and industry',
    description: 'Soya is Africa\'s primary source of plant-based protein for animal feed, cooking oil, and industrial applications, with production growing rapidly.',
    overview: [
      'Soya bean production in Africa has grown significantly over the past two decades, driven by rising demand from the poultry and livestock feed industries. South Africa, Nigeria, Zambia, and Zimbabwe are the continent\'s leading producers. The crop serves dual purposes — soya oil for cooking and industrial use, and soya meal (the protein-rich residue after oil extraction) for animal feed, which is the primary demand driver.',
      'Africa\'s poultry industry is expanding rapidly as rising incomes increase demand for chicken meat and eggs. This creates a direct and growing market for soya meal, which constitutes the primary protein ingredient in poultry feed. Most African countries currently import significant volumes of soya meal, representing a clear import substitution opportunity for domestic soya producers.',
      'AFU supports soya farmers through input financing for inoculant (essential for nitrogen fixation), certified seed, and crop protection products. Our processing partnerships with oil expellers and feed mills provide guaranteed offtake at pre-agreed prices, while our agronomic training programmes address the knowledge gaps that keep African soya yields well below potential. We also promote soya as a rotation crop with maize, improving soil fertility and breaking pest cycles.',
    ],
    growingConditions: {
      climate: 'Warm subtropical, 20-30°C during growing season',
      soil: 'Well-drained loamy soils, pH 6.0-7.0, requires inoculation for first planting',
      altitude: 'Below 1,500m',
      rainfall: '500-900mm during the growing season',
    },
    regions: ['Zimbabwe', 'Zambia', 'South Africa', 'Nigeria', 'Tanzania', 'Kenya', 'Mozambique'],
    marketData: {
      avgYield: '1.5-3.0 tonnes/ha',
      priceRange: '$350-550 per tonne',
      exportMarkets: ['Domestic feed mills', 'Regional oil trade', 'Domestic cooking oil market'],
    },
    topCountries: ['South Africa', 'Zimbabwe', 'Zambia', 'Nigeria'],
  },
  {
    name: 'Groundnuts',
    slug: 'groundnuts',
    category: 'Industrial Crops',
    image: 'https://images.unsplash.com/photo-1567892320421-1c657571ea4a?w=800&q=80',
    tagline: 'Versatile legume — food, oil, and livestock feed',
    description: 'Groundnuts are one of Africa\'s most widely cultivated legumes, providing oil, protein, and income for millions of smallholder farmers.',
    overview: [
      'Groundnuts (peanuts) are one of Africa\'s most important and versatile crops, grown across a wide belt from West Africa through East Africa to Southern Africa. Nigeria is the continent\'s largest producer, followed by Sudan, Ghana, Tanzania, and Zimbabwe. The crop provides high-quality cooking oil, protein-rich food, and animal feed, while its nitrogen-fixing ability improves soil fertility for subsequent crops.',
      'Africa was historically the world\'s leading groundnut exporter, but production shifted to China and India over the past several decades. There is growing global interest in African groundnut varieties for their flavour profile, and the expansion of peanut butter consumption worldwide creates export potential for processed groundnut products. However, aflatoxin contamination remains the single biggest barrier to market access, requiring strict harvest and storage protocols.',
      'AFU addresses the aflatoxin challenge head-on through farmer training in harvest timing, rapid drying, and proper storage that prevents fungal contamination. Our quality testing infrastructure enables certified aflatoxin-free groundnuts to access premium markets, while our input financing covers improved seed, calcium (essential for kernel development), and crop protection. We also finance small-scale oil pressing and peanut butter production for value addition.',
    ],
    growingConditions: {
      climate: 'Warm tropical to subtropical, 25-35°C, requires warm soil for germination',
      soil: 'Sandy, well-drained soils — heavy soils impede pod development, pH 5.5-7.0',
      altitude: 'Below 1,500m',
      rainfall: '500-1,000mm, well-distributed during the 4-5 month growing season',
    },
    regions: ['Nigeria', 'Tanzania', 'Zimbabwe', 'Zambia', 'Ghana', 'Kenya', 'Mozambique', 'Uganda'],
    marketData: {
      avgYield: '0.8-2.0 tonnes/ha (unshelled)',
      priceRange: '$600-1,200 per tonne (shelled)',
      exportMarkets: ['EU (confectionery grade)', 'Regional cooking oil trade', 'Domestic peanut butter market'],
    },
    topCountries: ['Nigeria', 'Tanzania', 'Ghana', 'Zimbabwe', 'Zambia'],
  },
  {
    name: 'Sunflower',
    slug: 'sunflower',
    category: 'Industrial Crops',
    image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&q=80',
    tagline: 'Africa\'s preferred cooking oil crop',
    description: 'Sunflower oil is the cooking oil of choice in much of Eastern and Southern Africa, and domestic production is growing to meet rising demand.',
    overview: [
      'Sunflower is one of Africa\'s most important oilseed crops, particularly in Eastern and Southern Africa where sunflower oil is the preferred cooking oil. Tanzania is the continent\'s largest producer in the AFU network, followed by South Africa, Zambia, and Zimbabwe. The crop fits well into maize-based farming systems as a rotation crop, and its relatively short growing season (90-120 days) allows it to be planted as a second crop in areas with bimodal rainfall.',
      'Africa imports over $5 billion worth of vegetable oils annually, and sunflower production expansion represents one of the clearest import substitution opportunities on the continent. Domestic sunflower oil is preferred by consumers in many East African markets, creating strong brand loyalty that protects domestic producers against imported alternatives. However, a shortage of crushing capacity means much of Tanzania\'s sunflower seed is exported raw rather than processed domestically.',
      'AFU finances sunflower farmers with hybrid seed (which yields 2-3 times more than traditional open-pollinated varieties), fertiliser, and crop protection. Our processing investments focus on medium-scale oil pressing and refining facilities that can serve regional markets with branded cooking oil. We also support the sunflower meal market as a protein source for animal feed, creating additional revenue for processing operations.',
    ],
    growingConditions: {
      climate: 'Warm subtropical, 20-28°C, tolerates moderate heat stress',
      soil: 'Deep, well-drained loamy soils, pH 6.0-7.5',
      altitude: 'Below 1,800m',
      rainfall: '500-750mm during the growing season — relatively drought-tolerant',
    },
    regions: ['Tanzania', 'South Africa', 'Zambia', 'Zimbabwe', 'Kenya', 'Mozambique'],
    marketData: {
      avgYield: '1.0-2.5 tonnes/ha',
      priceRange: '$400-650 per tonne (seed)',
      exportMarkets: ['Domestic cooking oil market', 'Regional trade within EAC/SADC'],
    },
    topCountries: ['Tanzania', 'South Africa', 'Zambia', 'Zimbabwe'],
  },
  {
    name: 'Sesame',
    slug: 'sesame',
    category: 'Industrial Crops',
    image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=800&q=80',
    tagline: 'High-value export oilseed with surging Asian demand',
    description: 'Sesame is one of Africa\'s most promising export crops, with demand from Japan, China, and Korea driving premium prices for quality seed.',
    overview: [
      'Sesame is Africa\'s fastest-growing export oilseed crop, with Tanzania, Nigeria, Mozambique, and Uganda among the continent\'s leading producers. The seed is prized in East Asian cuisine for its oil and as a flavouring ingredient — Japan alone imports over 160,000 tonnes annually, with China and South Korea also major buyers. African sesame is competitive globally due to low production costs and the crop\'s suitability for smallholder farming in semi-arid regions.',
      'The crop is ideal for smallholder diversification because it requires minimal inputs, grows well in hot, dry conditions where many other crops fail, and has a short growing season of 90-120 days. However, achieving export-quality standards requires attention to colour consistency, oil content, and freedom from contamination — areas where training and quality infrastructure can significantly improve farmer returns.',
      'AFU supports sesame farmers through quality-focused programmes that include seed cleaning and grading equipment, colour-sorting technology, and training in harvest and post-harvest practices that preserve seed quality. Our aggregation model collects sesame from thousands of smallholders and prepares export-grade lots that meet Japanese and Korean food-safety standards. Direct export relationships eliminate unnecessary intermediaries, returning higher prices to farmers.',
    ],
    growingConditions: {
      climate: 'Hot tropical, 25-40°C, thrives in extreme heat',
      soil: 'Well-drained sandy to loamy soils, pH 5.5-7.0, moderate fertility',
      altitude: 'Below 1,200m',
      rainfall: '400-700mm — drought-tolerant, sensitive to waterlogging',
    },
    regions: ['Tanzania', 'Mozambique', 'Nigeria', 'Uganda', 'Kenya'],
    marketData: {
      avgYield: '0.4-1.0 tonnes/ha',
      priceRange: '$1,000-2,500 per tonne (export grade)',
      exportMarkets: ['Japan', 'China', 'South Korea', 'Turkey', 'EU'],
    },
    topCountries: ['Tanzania', 'Nigeria', 'Mozambique', 'Uganda'],
  },
];

export function getCropBySlug(slug: string): CropData | undefined {
  return CROPS.find((c) => c.slug === slug);
}

export function getCropsByCategory(category: string): CropData[] {
  return CROPS.filter((c) => c.category === category);
}
