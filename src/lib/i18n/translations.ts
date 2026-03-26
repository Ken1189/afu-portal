// ---------------------------------------------------------------------------
// AFU Portal — Internationalization (i18n)
// 14+ Languages across 20 African countries
// ---------------------------------------------------------------------------

export type Locale = 'en' | 'sn' | 'nd' | 'sw' | 'tn' | 'pt' | 'ha' | 'yo' | 'zu' | 'af' | 'bem' | 'kri' | 'lg';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  sn: 'Shona',
  nd: 'Ndebele',
  sw: 'Kiswahili',
  tn: 'Setswana',
  pt: 'Português',
  ha: 'Hausa',
  yo: 'Yorùbá',
  zu: 'isiZulu',
  af: 'Afrikaans',
  bem: 'Bemba',
  kri: 'Krio',
  lg: 'Luganda',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  sn: '🇿🇼',
  nd: '🇿🇼',
  sw: '🇹🇿',
  tn: '🇧🇼',
  pt: '🇲🇿',
  ha: '🇳🇬',
  yo: '🇳🇬',
  zu: '🇿🇦',
  af: '🇿🇦',
  bem: '🇿🇲',
  kri: '🇸🇱',
  lg: '🇺🇬',
};

/** ISO country code per locale — used for flag image URLs */
export const localeCountryCodes: Record<Locale, string> = {
  en: 'gb',
  sn: 'zw',
  nd: 'zw',
  sw: 'tz',
  tn: 'bw',
  pt: 'mz',
  ha: 'ng',
  yo: 'ng',
  zu: 'za',
  af: 'za',
  bem: 'zm',
  kri: 'sl',
  lg: 'ug',
};

/** Get flag image URL for a locale (uses flagcdn.com SVGs) */
export function getFlagUrl(locale: Locale, size: 16 | 20 | 24 | 32 | 48 = 20): string {
  const code = localeCountryCodes[locale];
  return `https://flagcdn.com/${size}x${Math.round(size * 0.75)}/${code}.png`;
}

// Translation keys organized by section
export interface Translations {
  // Common
  common: {
    home: string;
    crops: string;
    doctor: string;
    money: string;
    journal: string;
    financing: string;
    insurance: string;
    marketplace: string;
    logistics: string;
    cooperatives: string;
    equipment: string;
    livestock: string;
    sustainability: string;
    exports: string;
    weather: string;
    aiTools: string;
    marketPrices: string;
    payments: string;
    assistant: string;
    save: string;
    cancel: string;
    back: string;
    next: string;
    submit: string;
    loading: string;
    viewAll: string;
    addNew: string;
    search: string;
    filter: string;
    today: string;
    yesterday: string;
    language: string;
    settings: string;
    signOut: string;
    farmPortal: string;
    backToPortal: string;
  };
  // Farm Dashboard
  dashboard: {
    greeting: string;
    goodMorning: string;
    goodAfternoon: string;
    goodEvening: string;
    takePhoto: string;
    weatherForecast: string;
    myPlots: string;
    todaysTasks: string;
    quickStats: string;
    recentActivity: string;
    aiTip: string;
    askAI: string;
    totalIncome: string;
    totalExpenses: string;
    profit: string;
    healthScore: string;
    daysToHarvest: string;
    addTask: string;
    high: string;
    medium: string;
    low: string;
  };
  // Crop Tracker
  cropTracker: {
    title: string;
    totalHectares: string;
    plots: string;
    avgHealth: string;
    plantingDate: string;
    expectedHarvest: string;
    soilPH: string;
    lastActivity: string;
    growthTimeline: string;
    logActivity: string;
    scanCrop: string;
    viewHistory: string;
    addPlot: string;
    plotName: string;
    crop: string;
    variety: string;
    size: string;
    stages: {
      planning: string;
      planted: string;
      germinating: string;
      vegetative: string;
      flowering: string;
      fruiting: string;
      harvesting: string;
      completed: string;
    };
  };
  // Crop Doctor
  cropDoctor: {
    title: string;
    subtitle: string;
    takePhoto: string;
    chooseGallery: string;
    selectPlot: string;
    tipsTitle: string;
    tip1: string;
    tip2: string;
    tip3: string;
    tip4: string;
    recentScans: string;
    analyzing: string;
    uploadingImage: string;
    analyzingLeaf: string;
    identifyingIssues: string;
    generatingRecs: string;
    healthScore: string;
    diagnosis: string;
    confidence: string;
    affectedArea: string;
    whatToDo: string;
    treatments: string;
    buyNow: string;
    scanAnother: string;
    saveToJournal: string;
    healthy: string;
    moderate: string;
    severe: string;
  };
  // Money Tracker
  moneyTracker: {
    title: string;
    thisSeason: string;
    income: string;
    expenses: string;
    profit: string;
    addIncome: string;
    addExpense: string;
    all: string;
    amount: string;
    category: string;
    description: string;
    selectPlot: string;
    date: string;
    incomeBySource: string;
    expensesByCategory: string;
    aiInsight: string;
    talkToAI: string;
    categories: {
      seeds: string;
      fertilizer: string;
      pesticides: string;
      labor: string;
      equipment: string;
      transport: string;
      harvestSale: string;
      contractPayment: string;
      subsidy: string;
      other: string;
    };
  };
  // Farm Journal
  farmJournal: {
    title: string;
    whatDidYouDo: string;
    entries: string;
    photos: string;
    spent: string;
    allPlots: string;
    activityType: string;
    titleField: string;
    descriptionField: string;
    addPhoto: string;
    howAreYou: string;
    cost: string;
    saveEntry: string;
    photoGallery: string;
    activities: {
      planting: string;
      watering: string;
      fertilizing: string;
      spraying: string;
      weeding: string;
      harvesting: string;
      scouting: string;
      soilTest: string;
      pruning: string;
      other: string;
    };
    moods: {
      great: string;
      good: string;
      okay: string;
      concerned: string;
      worried: string;
    };
  };
  // Financing
  financing: {
    title: string;
    subtitle: string;
    applyNow: string;
    myLoans: string;
    noLoans: string;
    noLoansDesc: string;
    loanTypes: {
      workingCapital: string;
      inputFinance: string;
      equipmentLease: string;
      tradeFinance: string;
    };
    loanAmount: string;
    outstanding: string;
    interestRate: string;
    nextPayment: string;
    repaid: string;
    status: string;
    active: string;
    completed: string;
    overdue: string;
    disbursed: string;
    approved: string;
    applyTitle: string;
    applySubtitle: string;
    howMuch: string;
    whatFor: string;
    cropSeason: string;
    farmSize: string;
    yearsExperience: string;
    estimatedRevenue: string;
    submitApplication: string;
    eligibility: string;
    eligibilityDesc: string;
    requirements: string;
    req1: string;
    req2: string;
    req3: string;
    req4: string;
    benefits: string;
    benefit1: string;
    benefit2: string;
    benefit3: string;
    applicationSent: string;
    applicationSentDesc: string;
    referenceNumber: string;
    whatHappensNext: string;
    step1: string;
    step2: string;
    step3: string;
    repaymentNote: string;
  };
  // Insurance
  insurance: {
    title: string;
    subtitle: string;
    myPolicies: string;
    fileClaim: string;
    myClaims: string;
    browseProducts: string;
    getQuote: string;
    activePolicies: string;
    totalCoverage: string;
    monthlyPremium: string;
    pendingClaims: string;
    policyDetails: string;
    coverageAmount: string;
    premium: string;
    deductible: string;
    startDate: string;
    endDate: string;
    nextPayment: string;
    coveredItems: string;
    renewPolicy: string;
    cancelPolicy: string;
    claimHistory: string;
    noActiveClaims: string;
    status: string;
    submitted: string;
    underReview: string;
    approved: string;
    rejected: string;
    paid: string;
    estimatedLoss: string;
    approvedAmount: string;
    incidentDate: string;
    describeIncident: string;
    uploadPhotos: string;
    selectPolicy: string;
    submitClaim: string;
    eligibilityCheck: string;
    calculatePremium: string;
    farmDetails: string;
    cropType: string;
    farmSize: string;
    estimatedPremium: string;
    getInsured: string;
    popular: string;
    perMonth: string;
    coverage: string;
    waitingPeriod: string;
    claimProcess: string;
    viewDetails: string;
    compareProducts: string;
  };
  // AI Assistant
  aiAssistant: {
    title: string;
    poweredBy: string;
    online: string;
    askAnything: string;
    weatherToday: string;
    checkCrops: string;
    farmProfit: string;
    pestAdvice: string;
    whatToDoToday: string;
    irrigation: string;
  };
}

// ---------------------------------------------------------------------------
// ENGLISH
// ---------------------------------------------------------------------------
export const en: Translations = {
  common: {
    home: 'Home',
    crops: 'Crops',
    doctor: 'Doctor',
    money: 'Money',
    journal: 'Journal',
    financing: 'Financing',
    insurance: 'Insurance',
    marketplace: 'Marketplace',
    logistics: 'Logistics',
    cooperatives: 'Cooperatives',
    equipment: 'Equipment',
    livestock: 'Livestock',
    sustainability: 'Sustainability',
    exports: 'Exports',
    weather: 'Weather',
    aiTools: 'AI Tools',
    marketPrices: 'Market Prices',
    payments: 'Payments',
    assistant: 'AI Chat',
    save: 'Save',
    cancel: 'Cancel',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    loading: 'Loading...',
    viewAll: 'View All',
    addNew: 'Add New',
    search: 'Search',
    filter: 'Filter',
    today: 'Today',
    yesterday: 'Yesterday',
    language: 'Language',
    settings: 'Settings',
    signOut: 'Sign Out',
    farmPortal: 'Farmer Portal',
    backToPortal: 'Back to AFU Portal',
  },
  dashboard: {
    greeting: 'Welcome back',
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    takePhoto: 'Take a crop photo',
    weatherForecast: 'Weather Forecast',
    myPlots: 'My Plots',
    todaysTasks: "Today's Tasks",
    quickStats: 'Quick Stats',
    recentActivity: 'Recent Activity',
    aiTip: 'AI Tip of the Day',
    askAI: 'Ask AI Assistant',
    totalIncome: 'Income',
    totalExpenses: 'Expenses',
    profit: 'Profit',
    healthScore: 'Health Score',
    daysToHarvest: 'days to harvest',
    addTask: 'Add Task',
    high: 'High',
    medium: 'Med',
    low: 'Low',
  },
  cropTracker: {
    title: 'My Crops',
    totalHectares: 'Total Hectares',
    plots: 'Plots',
    avgHealth: 'Avg Health',
    plantingDate: 'Planting Date',
    expectedHarvest: 'Expected Harvest',
    soilPH: 'Soil pH',
    lastActivity: 'Last Activity',
    growthTimeline: 'Growth Timeline',
    logActivity: 'Log Activity',
    scanCrop: 'Scan Crop',
    viewHistory: 'View History',
    addPlot: 'Add Plot',
    plotName: 'Plot Name',
    crop: 'Crop',
    variety: 'Variety',
    size: 'Size (ha)',
    stages: {
      planning: 'Planning',
      planted: 'Planted',
      germinating: 'Germinating',
      vegetative: 'Vegetative',
      flowering: 'Flowering',
      fruiting: 'Fruiting',
      harvesting: 'Harvesting',
      completed: 'Completed',
    },
  },
  cropDoctor: {
    title: 'Crop Doctor',
    subtitle: 'Take a photo of your crop to diagnose problems',
    takePhoto: 'Take Photo',
    chooseGallery: 'Choose from Gallery',
    selectPlot: 'Select Plot',
    tipsTitle: 'Tips for Best Results',
    tip1: 'Use good lighting — natural sunlight is best',
    tip2: 'Get close — 30cm from the affected area',
    tip3: 'Include both healthy and affected leaves',
    tip4: 'Take multiple photos from different angles',
    recentScans: 'Recent Scans',
    analyzing: 'Analyzing your crop...',
    uploadingImage: 'Uploading image...',
    analyzingLeaf: 'Analyzing leaf patterns...',
    identifyingIssues: 'Identifying issues...',
    generatingRecs: 'Generating recommendations...',
    healthScore: 'Health Score',
    diagnosis: 'Diagnosis',
    confidence: 'Confidence',
    affectedArea: 'Affected Area',
    whatToDo: 'What To Do',
    treatments: 'Recommended Treatments',
    buyNow: 'Buy Now',
    scanAnother: 'Scan Another Crop',
    saveToJournal: 'Save to Journal',
    healthy: 'Healthy',
    moderate: 'Moderate',
    severe: 'Severe',
  },
  moneyTracker: {
    title: 'Money Tracker',
    thisSeason: 'This Season',
    income: 'Income',
    expenses: 'Expenses',
    profit: 'Profit',
    addIncome: '+ Income',
    addExpense: '+ Expense',
    all: 'All',
    amount: 'Amount',
    category: 'Category',
    description: 'Description',
    selectPlot: 'Select Plot (optional)',
    date: 'Date',
    incomeBySource: 'Income by Source',
    expensesByCategory: 'Expenses by Category',
    aiInsight: 'AI Insight',
    talkToAI: 'Talk to AI',
    categories: {
      seeds: 'Seeds',
      fertilizer: 'Fertilizer',
      pesticides: 'Pesticides',
      labor: 'Labor',
      equipment: 'Equipment',
      transport: 'Transport',
      harvestSale: 'Harvest Sale',
      contractPayment: 'Contract Payment',
      subsidy: 'Subsidy',
      other: 'Other',
    },
  },
  farmJournal: {
    title: 'Farm Journal',
    whatDidYouDo: 'What did you do today?',
    entries: 'entries this month',
    photos: 'with photos',
    spent: 'spent',
    allPlots: 'All Plots',
    activityType: 'Activity Type',
    titleField: 'Title',
    descriptionField: 'What happened?',
    addPhoto: 'Add Photo',
    howAreYou: 'How are you feeling?',
    cost: 'Cost (optional)',
    saveEntry: 'Save Entry',
    photoGallery: 'Photo Gallery',
    activities: {
      planting: 'Planting',
      watering: 'Watering',
      fertilizing: 'Fertilizing',
      spraying: 'Spraying',
      weeding: 'Weeding',
      harvesting: 'Harvesting',
      scouting: 'Scouting',
      soilTest: 'Soil Test',
      pruning: 'Pruning',
      other: 'Other',
    },
    moods: {
      great: 'Great',
      good: 'Good',
      okay: 'Okay',
      concerned: 'Concerned',
      worried: 'Worried',
    },
  },
  financing: {
    title: 'Financing',
    subtitle: 'Get the funding you need to grow your farm',
    applyNow: 'Apply for a Loan',
    myLoans: 'My Loans',
    noLoans: 'No loans yet',
    noLoansDesc: 'Apply for financing to grow your farm. AFU members get preferential rates.',
    loanTypes: {
      workingCapital: 'Working Capital',
      inputFinance: 'Input Finance',
      equipmentLease: 'Equipment Lease',
      tradeFinance: 'Trade Finance',
    },
    loanAmount: 'Loan Amount',
    outstanding: 'Outstanding',
    interestRate: 'Interest Rate',
    nextPayment: 'Next Payment',
    repaid: 'Repaid',
    status: 'Status',
    active: 'Active',
    completed: 'Completed',
    overdue: 'Overdue',
    disbursed: 'Disbursed',
    approved: 'Approved',
    applyTitle: 'Apply for Farm Financing',
    applySubtitle: 'Tell us about your needs and we will find the best option for you',
    howMuch: 'How much do you need?',
    whatFor: 'What is the loan for?',
    cropSeason: 'Which crop season?',
    farmSize: 'Your farm size (hectares)',
    yearsExperience: 'Years of farming experience',
    estimatedRevenue: 'Expected revenue this season',
    submitApplication: 'Submit Application',
    eligibility: 'Check Your Eligibility',
    eligibilityDesc: 'As an AFU member, you may qualify for preferential rates',
    requirements: 'Requirements',
    req1: 'Active AFU membership',
    req2: 'At least 1 season of farming records',
    req3: 'Valid identification document',
    req4: 'Farm location verification',
    benefits: 'AFU Member Benefits',
    benefit1: 'Interest rates from 8% per annum',
    benefit2: 'No collateral needed up to $5,000',
    benefit3: 'Flexible repayment tied to harvest',
    applicationSent: 'Application Submitted!',
    applicationSentDesc: 'Your financing application has been received and is being reviewed.',
    referenceNumber: 'Reference Number',
    whatHappensNext: 'What happens next?',
    step1: 'Our team will review your application within 48 hours',
    step2: 'You will receive a decision via SMS and in-app notification',
    step3: 'If approved, funds are disbursed directly to your mobile wallet',
    repaymentNote: 'Repayment is flexible and tied to your harvest cycle. No penalties for early repayment.',
  },
  insurance: {
    title: 'Farm Insurance',
    subtitle: 'Protect your crops, livestock, and equipment',
    myPolicies: 'My Policies',
    fileClaim: 'File a Claim',
    myClaims: 'My Claims',
    browseProducts: 'Browse Products',
    getQuote: 'Get a Quote',
    activePolicies: 'Active Policies',
    totalCoverage: 'Total Coverage',
    monthlyPremium: 'Monthly Premium',
    pendingClaims: 'Pending Claims',
    policyDetails: 'Policy Details',
    coverageAmount: 'Coverage Amount',
    premium: 'Premium',
    deductible: 'Deductible',
    startDate: 'Start Date',
    endDate: 'End Date',
    nextPayment: 'Next Payment',
    coveredItems: 'Covered Items',
    renewPolicy: 'Renew Policy',
    cancelPolicy: 'Cancel Policy',
    claimHistory: 'Claim History',
    noActiveClaims: 'No active claims',
    status: 'Status',
    submitted: 'Submitted',
    underReview: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
    paid: 'Paid',
    estimatedLoss: 'Estimated Loss',
    approvedAmount: 'Approved Amount',
    incidentDate: 'Incident Date',
    describeIncident: 'Describe the Incident',
    uploadPhotos: 'Upload Photos',
    selectPolicy: 'Select Policy',
    submitClaim: 'Submit Claim',
    eligibilityCheck: 'Eligibility Check',
    calculatePremium: 'Calculate Premium',
    farmDetails: 'Farm Details',
    cropType: 'Crop Type',
    farmSize: 'Farm Size',
    estimatedPremium: 'Estimated Premium',
    getInsured: 'Get Insured',
    popular: 'Popular',
    perMonth: '/month',
    coverage: 'Coverage',
    waitingPeriod: 'Waiting Period',
    claimProcess: 'Claim Process',
    viewDetails: 'View Details',
    compareProducts: 'Compare Products',
  },
  aiAssistant: {
    title: 'Mkulima AI',
    poweredBy: 'Powered by AFU',
    online: 'Online — Ready to help',
    askAnything: 'Ask me anything about your farm...',
    weatherToday: '🌤️ Weather today?',
    checkCrops: '🌿 Check my crops',
    farmProfit: '💰 Farm profit',
    pestAdvice: '🐛 Pest advice',
    whatToDoToday: '📅 What should I do today?',
    irrigation: '💧 Irrigation schedule',
  },
};

// ---------------------------------------------------------------------------
// SHONA (chiShona)
// ---------------------------------------------------------------------------
export const sn: Translations = {
  common: {
    home: 'Kumba',
    crops: 'Zvirimwa',
    doctor: 'Chiremba',
    money: 'Mari',
    journal: 'Bhuku',
    financing: 'Mafundisi eMari',
    insurance: 'Inishuwarenzi',
    marketplace: 'Musika',
    logistics: 'Kutakura',
    cooperatives: 'Makooperetivu',
    equipment: 'Midziyo',
    livestock: 'Zvipfuyo',
    sustainability: 'Kudzivirira',
    exports: 'Kuendesa',
    weather: 'Mamiriro eKunze',
    aiTools: 'Maturuzi eAI',
    marketPrices: 'Mitengo yeMusika',
    payments: 'Mubhadharo',
    assistant: 'AI Rubatsiro',
    save: 'Sevha',
    cancel: 'Kanzura',
    back: 'Shure',
    next: 'Mberi',
    submit: 'Tumira',
    loading: 'Kugadzira...',
    viewAll: 'Ona Zvose',
    addNew: 'Wedzera Itsva',
    search: 'Tsvaga',
    filter: 'Sefa',
    today: 'Nhasi',
    yesterday: 'Nezuro',
    language: 'Mutauro',
    settings: 'Zvigadziriso',
    signOut: 'Buda',
    farmPortal: 'Portal yeMurimi',
    backToPortal: 'Dzokera ku AFU Portal',
  },
  dashboard: {
    greeting: 'Wakaribwa',
    goodMorning: 'Mangwanani',
    goodAfternoon: 'Masikati',
    goodEvening: 'Manheru',
    takePhoto: 'Tora mufananidzo wechirimwa',
    weatherForecast: 'Mamiriro eKunze',
    myPlots: 'Minda Yangu',
    todaysTasks: 'Mabasa eNhasi',
    quickStats: 'Nhamba Pfupi',
    recentActivity: 'Zvakaitika Munguva Pfupi',
    aiTip: 'Zano reAI reZuva',
    askAI: 'Bvunza AI',
    totalIncome: 'Mari Yakapinda',
    totalExpenses: 'Mari Yakabudiswa',
    profit: 'Purofiti',
    healthScore: 'Hutano hweZvirimwa',
    daysToHarvest: 'mazuva ekukohwa',
    addTask: 'Wedzera Basa',
    high: 'Yakakwirira',
    medium: 'Pakati',
    low: 'Yakaderera',
  },
  cropTracker: {
    title: 'Zvirimwa Zvangu',
    totalHectares: 'Hekitari Dzose',
    plots: 'Minda',
    avgHealth: 'Hutano Hwepakati',
    plantingDate: 'Zuva Rekudyara',
    expectedHarvest: 'Kukohwa Kunotarisirwa',
    soilPH: 'pH yeIvhu',
    lastActivity: 'Basa Rekupedzisira',
    growthTimeline: 'Nhanho dzeKukura',
    logActivity: 'Nyora Basa',
    scanCrop: 'Tarisa Chirimwa',
    viewHistory: 'Ona Nhoroondo',
    addPlot: 'Wedzera Munda',
    plotName: 'Zita reMunda',
    crop: 'Chirimwa',
    variety: 'Mhando',
    size: 'Kukura (ha)',
    stages: {
      planning: 'Kuronga',
      planted: 'Yadyarwa',
      germinating: 'Kumera',
      vegetative: 'Kukura',
      flowering: 'Kutunga Maruva',
      fruiting: 'Kubereka',
      harvesting: 'Kukohwa',
      completed: 'Yapera',
    },
  },
  cropDoctor: {
    title: 'Chiremba weZvirimwa',
    subtitle: 'Tora mufananidzo wechirimwa chako kuti tione dambudziko',
    takePhoto: 'Tora Mufananidzo',
    chooseGallery: 'Sarudza kubva muGallery',
    selectPlot: 'Sarudza Munda',
    tipsTitle: 'Mazano eKuwana Mhinduro Yakanaka',
    tip1: 'Shandisa chiedza chakanaka — zuva ndiro rakanakisa',
    tip2: 'Swedera padyo — 30cm kubva panzvimbo yakakanganisika',
    tip3: 'Sanganisira mashizha akanaka neakakanganisika',
    tip4: 'Tora mifananidzo yakawanda kubva kunzvimbo dzakasiyana',
    recentScans: 'Zvakatarwa Munguva Pfupi',
    analyzing: 'Kuongorora chirimwa chako...',
    uploadingImage: 'Kutumira mufananidzo...',
    analyzingLeaf: 'Kuongorora mashizha...',
    identifyingIssues: 'Kutsvaga matambudziko...',
    generatingRecs: 'Kugadzira mazano...',
    healthScore: 'Nhamba yeHutano',
    diagnosis: 'Chirwere',
    confidence: 'Chokwadi',
    affectedArea: 'Nzvimbo Yakakanganisika',
    whatToDo: 'Zvekuita',
    treatments: 'Mishonga Inodiwa',
    buyNow: 'Tenga Izvozvi',
    scanAnother: 'Tarisa Chimwe Chirimwa',
    saveToJournal: 'Sevha muBhuku',
    healthy: 'Zvakanaka',
    moderate: 'Pakati',
    severe: 'Zvakaipisisa',
  },
  moneyTracker: {
    title: 'Kutarisa Mari',
    thisSeason: 'Mwaka Uno',
    income: 'Mari Yakapinda',
    expenses: 'Mari Yakabudiswa',
    profit: 'Purofiti',
    addIncome: '+ Mari Yakapinda',
    addExpense: '+ Mari Yakabudiswa',
    all: 'Zvose',
    amount: 'Huwandu',
    category: 'Rudzi',
    description: 'Tsananguro',
    selectPlot: 'Sarudza Munda (kwete compulsory)',
    date: 'Zuva',
    incomeBySource: 'Mari Yakapinda neKwayakabva',
    expensesByCategory: 'Mari Yakabudiswa neRudzi',
    aiInsight: 'Zano reAI',
    talkToAI: 'Taura neAI',
    categories: {
      seeds: 'Mbeu',
      fertilizer: 'Fetiraiza',
      pesticides: 'Mushonga weZvipukanana',
      labor: 'Varimi/Vashandi',
      equipment: 'Midziyo',
      transport: 'Kutakura',
      harvestSale: 'Kutengesa Goho',
      contractPayment: 'Kubhadharwa kweContract',
      subsidy: 'Rubatsiro',
      other: 'Zvimwe',
    },
  },
  farmJournal: {
    title: 'Bhuku reMunda',
    whatDidYouDo: 'Wakaita sei nhasi?',
    entries: 'zvinyorwa mumwedzi uno',
    photos: 'nemifananidzo',
    spent: 'yakashandiswa',
    allPlots: 'Minda Yose',
    activityType: 'Rudzi rweBasa',
    titleField: 'Musoro',
    descriptionField: 'Chii chakaitika?',
    addPhoto: 'Wedzera Mufananidzo',
    howAreYou: 'Uri kunzwa sei?',
    cost: 'Mutengo (kwete compulsory)',
    saveEntry: 'Sevha',
    photoGallery: 'Mifananidzo',
    activities: {
      planting: 'Kudyara',
      watering: 'Kudiridza',
      fertilizing: 'Kupa Fetiraiza',
      spraying: 'Kusasa Mushonga',
      weeding: 'Kusakura',
      harvesting: 'Kukohwa',
      scouting: 'Kuongorora',
      soilTest: 'Kuedza Ivhu',
      pruning: 'Kuchekera',
      other: 'Zvimwe',
    },
    moods: {
      great: 'Zvakanakisa',
      good: 'Zvakanaka',
      okay: 'Zvakangodaro',
      concerned: 'Ndine Hanya',
      worried: 'Ndinoshushikana',
    },
  },
  financing: {
    title: 'Mafundisi eMari',
    subtitle: 'Wana mari yaunoda kukudza munda wako',
    applyNow: 'Kumbira Chikwereti',
    myLoans: 'Zvikwereti Zvangu',
    noLoans: 'Hapana zvikwereti',
    noLoansDesc: 'Kumbira mari yekukudza munda wako. Nhengo dzeAFU dzinowana mitengo yakanaka.',
    loanTypes: {
      workingCapital: 'Mari yeBasa',
      inputFinance: 'Mari yeMbeu neFetiraiza',
      equipmentLease: 'Kuhaya Midziyo',
      tradeFinance: 'Mari yeKutengesa',
    },
    loanAmount: 'Huwandu hweChikwereti',
    outstanding: 'Chichiri Chisina Kubhadharwa',
    interestRate: 'Mutengo weInterest',
    nextPayment: 'Kubhadhara Kunotevera',
    repaid: 'Yakabhadharwa',
    status: 'Mamiriro',
    active: 'Inoshanda',
    completed: 'Yapera',
    overdue: 'Yakacherera',
    disbursed: 'Yakapiwa',
    approved: 'Yabvumirwa',
    applyTitle: 'Kumbira Mari yeMunda',
    applySubtitle: 'Tiudze zvaunoda uye tichakuwanira nzira yakanakisa',
    howMuch: 'Unoda mari yakadii?',
    whatFor: 'Chikwereti chiri cheyi?',
    cropSeason: 'Mwaka upi wechirimwa?',
    farmSize: 'Kukura kwemunda wako (hekitari)',
    yearsExperience: 'Makore ekurima',
    estimatedRevenue: 'Mari yaunotarisira mwaka uno',
    submitApplication: 'Tumira Chikumbiro',
    eligibility: 'Tarisa Kana Uchikodzera',
    eligibilityDesc: 'SeNhengo yeAFU, unogona kuwana mitengo yakanaka',
    requirements: 'Zvinodiwa',
    req1: 'Nhengo yeAFU inoshanda',
    req2: 'Nhoroondo yekurima yemwaka mumwe kana kupfuura',
    req3: 'Chipepetso chemazita chiri pamutemo',
    req4: 'Kujekeserwa kwenzvimbo yemunda',
    benefits: 'Makomborero eNhengo yeAFU',
    benefit1: 'Interest kubva pa8% pagore',
    benefit2: 'Hapana collateral inodiwa kusvika $5,000',
    benefit3: 'Kubhadhara kunochinja maererano negoho',
    applicationSent: 'Chikumbiro Chatumirwa!',
    applicationSentDesc: 'Chikumbiro chako chemari chagashirwa uye chiri kuongororwa.',
    referenceNumber: 'Nhamba yeReferenzi',
    whatHappensNext: 'Chii chinoitika zvadaro?',
    step1: 'Timu yedu ichaongorora chikumbiro chako mukati memaawa 48',
    step2: 'Uchagashira mhinduro neSMS uye munotification',
    step3: 'Kana chabvumirwa, mari inotumirwa kumobile wallet yako',
    repaymentNote: 'Kubhadhara kunochinja maererano negoho rako. Hapana muripo wekubhadhara munguva pfupi.',
  },
  insurance: {
    title: 'Inishuwarenzi yeMunda',
    subtitle: 'Dzivirira zvirimwa, mhuka, nemichina yako',
    myPolicies: 'Maphorisi Angu',
    fileClaim: 'Isa Chikumbiro',
    myClaims: 'Zvikumbiro Zvangu',
    browseProducts: 'Tarisa Zvigadzirwa',
    getQuote: 'Wana Mutengo',
    activePolicies: 'Maphorisi Anoshanda',
    totalCoverage: 'Kuchengetedzwa Kwose',
    monthlyPremium: 'Muripo weMwedzi',
    pendingClaims: 'Zvikumbiro Zvakamirira',
    policyDetails: 'Mashoko ePhorisi',
    coverageAmount: 'Huwandu Hwekuchengetedzwa',
    premium: 'Muripo',
    deductible: 'Deductible',
    startDate: 'Zuva Rekutanga',
    endDate: 'Zuva Rekupera',
    nextPayment: 'Kubhadhara Kunotevera',
    coveredItems: 'Zvinhu Zvinochengedzwa',
    renewPolicy: 'Vandudza Phorisi',
    cancelPolicy: 'Kanzura Phorisi',
    claimHistory: 'Nhoroondo yeZvikumbiro',
    noActiveClaims: 'Hapana zvikumbiro zviripo',
    status: 'Mamiriro',
    submitted: 'Yakatumirwa',
    underReview: 'Iri Kuongororwa',
    approved: 'Yabvumirwa',
    rejected: 'Yarambidzwa',
    paid: 'Yakabhadharwa',
    estimatedLoss: 'Kurasikirwa Kunofungidzirwa',
    approvedAmount: 'Huwandu Hwakabvumirwa',
    incidentDate: 'Zuva Rechiitiko',
    describeIncident: 'Tsanangura Chiitiko',
    uploadPhotos: 'Isa Mifananidzo',
    selectPolicy: 'Sarudza Phorisi',
    submitClaim: 'Tumira Chikumbiro',
    eligibilityCheck: 'Ongorora Kukodzera',
    calculatePremium: 'Verenga Muripo',
    farmDetails: 'Mashoko eMunda',
    cropType: 'Rudzi rweChirimwa',
    farmSize: 'Kukura kweMunda',
    estimatedPremium: 'Muripo Unofungidzirwa',
    getInsured: 'Chengetedzwa',
    popular: 'Inozivikanwa',
    perMonth: '/mwedzi',
    coverage: 'Kuchengetedzwa',
    waitingPeriod: 'Nguva Yekumirira',
    claimProcess: 'Nzira yeChikumbiro',
    viewDetails: 'Ona Zvakadzama',
    compareProducts: 'Enzanisa Zvigadzirwa',
  },
  aiAssistant: {
    title: 'Mkulima AI',
    poweredBy: 'Yakagadzirwa neAFU',
    online: 'Online — Yakagadzirira kukubatsira',
    askAnything: 'Bvunza chero chaunoda pamusoro pemunda wako...',
    weatherToday: '🌤️ Mamiriro enhasi?',
    checkCrops: '🌿 Tarisa zvirimwa',
    farmProfit: '💰 Purofiti yemunda',
    pestAdvice: '🐛 Zano rezvipukanana',
    whatToDoToday: '📅 Ndiite sei nhasi?',
    irrigation: '💧 Kudiridza',
  },
};

// ---------------------------------------------------------------------------
// NDEBELE (isiNdebele)
// ---------------------------------------------------------------------------
export const nd: Translations = {
  common: {
    home: 'Ekhaya',
    crops: 'Izilimo',
    doctor: 'Udokotela',
    money: 'Imali',
    journal: 'Ibhuku',
    financing: 'Imali Yokuboleka',
    insurance: 'Umshwalense',
    marketplace: 'Imakethe',
    logistics: 'Ukuthwala',
    cooperatives: 'Amakhoopharethivu',
    equipment: 'Amathuluzi',
    livestock: 'Imfuyo',
    sustainability: 'Ukuqhubeka',
    exports: 'Ukuthumela',
    weather: 'Umumo Womkhathi',
    aiTools: 'Amathuluzi e-AI',
    marketPrices: 'Amanani Emakethe',
    payments: 'Izinkokhelo',
    assistant: 'AI Uncedo',
    save: 'Gcina',
    cancel: 'Khansela',
    back: 'Emuva',
    next: 'Okulandelayo',
    submit: 'Thumela',
    loading: 'Kuyalayala...',
    viewAll: 'Bona Konke',
    addNew: 'Engeza Okutsha',
    search: 'Dinga',
    filter: 'Hluza',
    today: 'Lamuhla',
    yesterday: 'Izolo',
    language: 'Ulimi',
    settings: 'Izilungiselelo',
    signOut: 'Phuma',
    farmPortal: 'Isango loMlimi',
    backToPortal: 'Buyela ku AFU Portal',
  },
  dashboard: {
    greeting: 'Siyakwamukela',
    goodMorning: 'Livuke njani',
    goodAfternoon: 'Litshone njani',
    goodEvening: 'Lilale njani',
    takePhoto: 'Thatha isithombe sesilimo',
    weatherForecast: 'Umumo Womkhathi',
    myPlots: 'Amasimu Ami',
    todaysTasks: 'Imisebenzi Yalamuhla',
    quickStats: 'Amanani Amafitshane',
    recentActivity: 'Okwenzakele Kutsha',
    aiTip: 'Icebo le-AI Lalamuhla',
    askAI: 'Buza i-AI',
    totalIncome: 'Imali Engenayo',
    totalExpenses: 'Izindleko',
    profit: 'Inzuzo',
    healthScore: 'Impilakahle Yezilimo',
    daysToHarvest: 'insuku zokuvuna',
    addTask: 'Engeza Umsebenzi',
    high: 'Phezulu',
    medium: 'Phakathi',
    low: 'Phansi',
  },
  cropTracker: {
    title: 'Izilimo Zami',
    totalHectares: 'Amahekitha Wonke',
    plots: 'Amasimu',
    avgHealth: 'Impilakahle Ephakathi',
    plantingDate: 'Usuku Lokutshala',
    expectedHarvest: 'Ukuvuna Okulindelweyo',
    soilPH: 'pH yoMhlabathi',
    lastActivity: 'Umsebenzi Wokucina',
    growthTimeline: 'Izigaba Zokukhula',
    logActivity: 'Bhala Umsebenzi',
    scanCrop: 'Hlola Isilimo',
    viewHistory: 'Bona Imbali',
    addPlot: 'Engeza Insimu',
    plotName: 'Ibizo leNsimu',
    crop: 'Isilimo',
    variety: 'Uhlobo',
    size: 'Ubukhulu (ha)',
    stages: {
      planning: 'Ukuhlela',
      planted: 'Kutshaliwe',
      germinating: 'Kuyahluma',
      vegetative: 'Kuyakhula',
      flowering: 'Kuyakhahlela',
      fruiting: 'Kuyathela',
      harvesting: 'Kuyavunwa',
      completed: 'Kuphelile',
    },
  },
  cropDoctor: {
    title: 'Udokotela Wezilimo',
    subtitle: 'Thatha isithombe sesilimo sakho ukuze sibone inkinga',
    takePhoto: 'Thatha Isithombe',
    chooseGallery: 'Khetha ku-Gallery',
    selectPlot: 'Khetha Insimu',
    tipsTitle: 'Amacebo Okuthola Impendulo Enhle',
    tip1: 'Sebenzisa ukukhanya okuhle — ilanga lingcono',
    tip2: 'Sondela eduze — 30cm kusuka endaweni elinyazwe',
    tip3: 'Faka amahlamvu aphilileyo lalimele',
    tip4: 'Thatha izithombe ezinengi ngezinhlangothi ezitshiyeneyo',
    recentScans: 'Okuhlolwe Kutsha',
    analyzing: 'Kuhlolwa isilimo sakho...',
    uploadingImage: 'Kuthunyelwa isithombe...',
    analyzingLeaf: 'Kuhlolwa amahlamvu...',
    identifyingIssues: 'Kudingwa izinkinga...',
    generatingRecs: 'Kwenziwa amacebo...',
    healthScore: 'Inani Lempilakahle',
    diagnosis: 'Ukuxilongwa',
    confidence: 'Ukuqiniseka',
    affectedArea: 'Indawo Elimele',
    whatToDo: 'Okumele Ukwenze',
    treatments: 'Imithi Edingekayo',
    buyNow: 'Thenga Khathesi',
    scanAnother: 'Hlola Esinye Isilimo',
    saveToJournal: 'Gcina eBhukwini',
    healthy: 'Kuphilile',
    moderate: 'Phakathi',
    severe: 'Kubi Kakhulu',
  },
  moneyTracker: {
    title: 'Ukulandelela Imali',
    thisSeason: 'Isizini Le',
    income: 'Imali Engenayo',
    expenses: 'Izindleko',
    profit: 'Inzuzo',
    addIncome: '+ Imali Engenayo',
    addExpense: '+ Izindleko',
    all: 'Konke',
    amount: 'Inani',
    category: 'Uhlobo',
    description: 'Incazelo',
    selectPlot: 'Khetha Insimu (akudingi)',
    date: 'Usuku',
    incomeBySource: 'Imali Engenayo Ngomthombo',
    expensesByCategory: 'Izindleko Ngohlobo',
    aiInsight: 'Icebo le-AI',
    talkToAI: 'Khuluma le-AI',
    categories: {
      seeds: 'Imbewu',
      fertilizer: 'Umanyolo',
      pesticides: 'Umuthi Wezinambuzane',
      labor: 'Abasebenzi',
      equipment: 'Amathuluzi',
      transport: 'Ukuthwala',
      harvestSale: 'Ukuthengisa Isivuno',
      contractPayment: 'Inkokhelo yeKhontrakti',
      subsidy: 'Uncedo',
      other: 'Okunye',
    },
  },
  farmJournal: {
    title: 'Ibhuku leNsimu',
    whatDidYouDo: 'Wenzeni lamuhla?',
    entries: 'okubhaliweyo kule nyanga',
    photos: 'lezithombe',
    spent: 'kusetshenziselwe',
    allPlots: 'Zonke Izinsimu',
    activityType: 'Uhlobo Lomsebenzi',
    titleField: 'Isihloko',
    descriptionField: 'Kwenzakaleni?',
    addPhoto: 'Engeza Isithombe',
    howAreYou: 'Uzizwa njani?',
    cost: 'Intengo (akudingi)',
    saveEntry: 'Gcina',
    photoGallery: 'Izithombe',
    activities: {
      planting: 'Ukutshala',
      watering: 'Ukuthelela',
      fertilizing: 'Ukufaka Umanyolo',
      spraying: 'Ukufafaza',
      weeding: 'Ukuhlakula',
      harvesting: 'Ukuvuna',
      scouting: 'Ukuhlola',
      soilTest: 'Ukuhlola Umhlabathi',
      pruning: 'Ukuthena',
      other: 'Okunye',
    },
    moods: {
      great: 'Kuhle Kakhulu',
      good: 'Kuhle',
      okay: 'Kulungile',
      concerned: 'Ngikhathazekile',
      worried: 'Ngiyakhathazeka',
    },
  },
  financing: {
    title: 'Imali Yokuboleka',
    subtitle: 'Thola imali oyidingayo ukukhulisa insimu yakho',
    applyNow: 'Cela Isikweletu',
    myLoans: 'Izikweletu Zami',
    noLoans: 'Akulazikweletu',
    noLoansDesc: 'Cela imali yokukhulisa insimu yakho. Amalunga e-AFU athola amanani amahle.',
    loanTypes: {
      workingCapital: 'Imali Yokusebenza',
      inputFinance: 'Imali Yembewu loManyolo',
      equipmentLease: 'Ukuqhatsha Amathuluzi',
      tradeFinance: 'Imali Yokuthengisa',
    },
    loanAmount: 'Inani Lesikweletu',
    outstanding: 'Okungakabhadaliswa',
    interestRate: 'Inzalo',
    nextPayment: 'Ukubhadala Okulandelayo',
    repaid: 'Okubhadaliweyo',
    status: 'Isimo',
    active: 'Kuyasebenza',
    completed: 'Kuphelile',
    overdue: 'Kudlulelwe',
    disbursed: 'Kukhitshiwe',
    approved: 'Kuvunyelwe',
    applyTitle: 'Cela Imali Yensimu',
    applySubtitle: 'Sitshele ngalokho okudingayo sizakuthola indlela enhle kuwe',
    howMuch: 'Udinga malini?',
    whatFor: 'Isikweletu singesani?',
    cropSeason: 'Yisiphi isizini sesilimo?',
    farmSize: 'Ubukhulu bensimu yakho (amahekitha)',
    yearsExperience: 'Iminyaka yokulima',
    estimatedRevenue: 'Imali oyilindeleyo kule sizini',
    submitApplication: 'Thumela Isicelo',
    eligibility: 'Hlola Ukufaneleka Kwakho',
    eligibilityDesc: 'Njengelunga le-AFU, ungathola amanani amahle',
    requirements: 'Okudingekayo',
    req1: 'Ubulunga be-AFU obusebenzayo',
    req2: 'Imbali yokulima yesizini eyodwa kumbe ngaphezulu',
    req3: 'Isitifiketi samazwi esisemthethweni',
    req4: 'Ukuqinisekiswa kwendawo yensimu',
    benefits: 'Izinzuzo Zamalunga e-AFU',
    benefit1: 'Inzalo kusukela ku-8% ngomnyaka',
    benefit2: 'Akuladinga isibambiso kuze kube ngu-$5,000',
    benefit3: 'Ukubhadala okuhambisana lesivuno',
    applicationSent: 'Isicelo Sithunyelwe!',
    applicationSentDesc: 'Isicelo sakho semali samukelwe futhi siyahlolwa.',
    referenceNumber: 'Inombolo Yereferensi',
    whatHappensNext: 'Kuzakwenzakalani emva kwalokhu?',
    step1: 'Ithimu yethu izahlola isicelo sakho phakathi kwamahora angu-48',
    step2: 'Uzathola impendulo nge-SMS kanye le-notification',
    step3: 'Nxa kuvunyelwe, imali izathunyelwa ku-mobile wallet yakho',
    repaymentNote: 'Ukubhadala kuhambisana lesivuno sakho. Akulanjongo yokubhadala ngesikhathi esifitshane.',
  },
  insurance: {
    title: 'Umshwalense weNsimu',
    subtitle: 'Vikela izilimo, imfuyo, lezinto zakho zokulima',
    myPolicies: 'Amapholisi Ami',
    fileClaim: 'Faka Isicelo',
    myClaims: 'Izicelo Zami',
    browseProducts: 'Bheka Imikhiqizo',
    getQuote: 'Thola Intengo',
    activePolicies: 'Amapholisi Asebenzayo',
    totalCoverage: 'Isivikelo Sonke',
    monthlyPremium: 'Umholawano weNyanga',
    pendingClaims: 'Izicelo Ezilindile',
    policyDetails: 'Imininingwane yePholisi',
    coverageAmount: 'Isilinganiso Sesivikelo',
    premium: 'Umholawano',
    deductible: 'I-Deductible',
    startDate: 'Usuku Lokuqala',
    endDate: 'Usuku Lokucina',
    nextPayment: 'Ukubhadala Okulandelayo',
    coveredItems: 'Izinto Ezivikelweyo',
    renewPolicy: 'Vuselela iPholisi',
    cancelPolicy: 'Khansela iPholisi',
    claimHistory: 'Imbali Yezicelo',
    noActiveClaims: 'Akulazicelo ezikhona',
    status: 'Isimo',
    submitted: 'Kuthunyelwe',
    underReview: 'Kuyahlolwa',
    approved: 'Kuvunyelwe',
    rejected: 'Kwaliwe',
    paid: 'Kubhadalwe',
    estimatedLoss: 'Ukulahlekelwa Okulinganisiwayo',
    approvedAmount: 'Isilinganiso Esivunyelweyo',
    incidentDate: 'Usuku Lwesigameko',
    describeIncident: 'Chaza Isigameko',
    uploadPhotos: 'Layitsha Izithombe',
    selectPolicy: 'Khetha iPholisi',
    submitClaim: 'Thumela Isicelo',
    eligibilityCheck: 'Hlola Ukufaneleka',
    calculatePremium: 'Bala Umholawano',
    farmDetails: 'Imininingwane yeNsimu',
    cropType: 'Uhlobo lweSilimo',
    farmSize: 'Ubukhulu beNsimu',
    estimatedPremium: 'Umholawano Olinganisiwayo',
    getInsured: 'Vikeleka',
    popular: 'Edumileyo',
    perMonth: '/inyanga',
    coverage: 'Isivikelo',
    waitingPeriod: 'Isikhathi Sokulinda',
    claimProcess: 'Indlela Yesicelo',
    viewDetails: 'Bona Imininingwane',
    compareProducts: 'Qathanisa Imikhiqizo',
  },
  aiAssistant: {
    title: 'Mkulima AI',
    poweredBy: 'Yakwenziwa yi-AFU',
    online: 'Online — Ilungele ukukunceda',
    askAnything: 'Buza loba yini mayelana lensimu yakho...',
    weatherToday: '🌤️ Umkhathi walamuhla?',
    checkCrops: '🌿 Hlola izilimo zami',
    farmProfit: '💰 Inzuzo yensimu',
    pestAdvice: '🐛 Amacebo ngezinambuzane',
    whatToDoToday: '📅 Ngenzeni lamuhla?',
    irrigation: '💧 Ukuthelela',
  },
};

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Helper: deep merge English with partial overrides
// ---------------------------------------------------------------------------
function withOverrides(overrides: DeepPartial<Translations>): Translations {
  return deepMerge(en as unknown as Record<string, unknown>, overrides as unknown as Record<string, unknown>) as unknown as Translations;
}

type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] };

function deepMerge(base: Record<string, unknown>, override: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };
  for (const key of Object.keys(override)) {
    if (override[key] && typeof override[key] === 'object' && !Array.isArray(override[key]) &&
        base[key] && typeof base[key] === 'object') {
      result[key] = deepMerge(base[key] as Record<string, unknown>, override[key] as Record<string, unknown>);
    } else if (override[key] !== undefined) {
      result[key] = override[key];
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// SWAHILI (Kiswahili) — Tanzania, Kenya
// ---------------------------------------------------------------------------
export const sw: Translations = withOverrides({
  common: {
    home: 'Nyumbani', crops: 'Mazao', doctor: 'Daktari', money: 'Fedha', journal: 'Jarida',
    financing: 'Ufadhili', insurance: 'Bima', marketplace: 'Soko', logistics: 'Usafirishaji',
    cooperatives: 'Vyama', equipment: 'Vifaa', livestock: 'Mifugo', sustainability: 'Uendelevu',
    exports: 'Mauzo nje', weather: 'Hali ya Hewa', aiTools: 'Zana za AI', marketPrices: 'Bei za Soko',
    payments: 'Malipo', assistant: 'Msaidizi wa AI', save: 'Hifadhi', cancel: 'Ghairi',
    back: 'Rudi', next: 'Endelea', submit: 'Wasilisha', loading: 'Inapakia...',
    viewAll: 'Tazama Yote', addNew: 'Ongeza Mpya', search: 'Tafuta', filter: 'Chuja',
    today: 'Leo', yesterday: 'Jana', language: 'Lugha', settings: 'Mipangilio',
    signOut: 'Toka', farmPortal: 'Lango la Mkulima', backToPortal: 'Rudi kwenye AFU',
  },
  dashboard: {
    greeting: 'Karibu tena', goodMorning: 'Habari za asubuhi', goodAfternoon: 'Habari za mchana',
    goodEvening: 'Habari za jioni', takePhoto: 'Piga picha ya mazao', weatherForecast: 'Utabiri wa Hewa',
    myPlots: 'Mashamba Yangu', todaysTasks: 'Kazi za Leo', quickStats: 'Takwimu Haraka',
    recentActivity: 'Shughuli za Hivi Karibuni', aiTip: 'Ushauri wa AI', askAI: 'Uliza AI',
    totalIncome: 'Mapato', totalExpenses: 'Matumizi', profit: 'Faida',
    healthScore: 'Hali ya Afya', daysToHarvest: 'siku hadi mavuno', addTask: 'Ongeza Kazi',
    high: 'Juu', medium: 'Wastani', low: 'Chini',
  },
  cropTracker: {
    title: 'Mazao Yangu', totalHectares: 'Jumla ya Hekta', plots: 'Mashamba',
    avgHealth: 'Afya ya Wastani', plantingDate: 'Tarehe ya Kupanda', expectedHarvest: 'Mavuno Yanayotarajiwa',
    soilPH: 'pH ya Udongo', lastActivity: 'Shughuli ya Mwisho', growthTimeline: 'Ratiba ya Ukuaji',
    logActivity: 'Rekodi Shughuli', scanCrop: 'Chunguza Mazao', viewHistory: 'Tazama Historia',
    addPlot: 'Ongeza Shamba', plotName: 'Jina la Shamba', crop: 'Mazao', variety: 'Aina', size: 'Ukubwa (ha)',
    stages: {
      planning: 'Kupanga', planted: 'Kupandwa', germinating: 'Kuota', vegetative: 'Kukua',
      flowering: 'Kuchanua', fruiting: 'Matunda', harvesting: 'Mavuno', completed: 'Imekamilika',
    },
  },
  cropDoctor: {
    title: 'Daktari wa Mazao', subtitle: 'Piga picha ya mazao yako kugundua matatizo',
    takePhoto: 'Piga Picha', chooseGallery: 'Chagua kutoka Galeri', selectPlot: 'Chagua Shamba',
    tipsTitle: 'Vidokezo vya Matokeo Bora',
    tip1: 'Tumia mwanga mzuri — jua la asili ni bora', tip2: 'Karibia — sm 30 kutoka eneo lililoathirika',
    tip3: 'Jumuisha majani yenye afya na yaliyoathirika', tip4: 'Piga picha nyingi kutoka pembe tofauti',
    recentScans: 'Uchunguzi wa Hivi Karibuni', analyzing: 'Inachunguza mazao yako...',
    uploadingImage: 'Inapakia picha...', analyzingLeaf: 'Inachunguza mifumo ya jani...',
    identifyingIssues: 'Inatambua matatizo...', generatingRecs: 'Inazalisha mapendekezo...',
    healthScore: 'Hali ya Afya', diagnosis: 'Utambuzi', confidence: 'Uhakika',
    affectedArea: 'Eneo Lililoathirika', whatToDo: 'Nini Cha Kufanya', treatments: 'Matibabu Yanayopendekezwa',
    buyNow: 'Nunua Sasa', scanAnother: 'Chunguza Mazao Mengine', saveToJournal: 'Hifadhi kwenye Jarida',
    healthy: 'Yenye Afya', moderate: 'Wastani', severe: 'Kali',
  },
  moneyTracker: {
    title: 'Ufuatiliaji wa Fedha', thisSeason: 'Msimu Huu', income: 'Mapato', expenses: 'Matumizi',
    profit: 'Faida', addIncome: '+ Mapato', addExpense: '+ Matumizi', all: 'Yote',
    amount: 'Kiasi', category: 'Aina', description: 'Maelezo', selectPlot: 'Chagua Shamba',
    date: 'Tarehe', incomeBySource: 'Mapato kwa Chanzo', expensesByCategory: 'Matumizi kwa Aina',
    aiInsight: 'Ufahamu wa AI', talkToAI: 'Ongea na AI',
    categories: {
      seeds: 'Mbegu', fertilizer: 'Mbolea', pesticides: 'Dawa za Wadudu', labor: 'Kazi',
      equipment: 'Vifaa', transport: 'Usafirishaji', harvestSale: 'Mauzo ya Mavuno',
      contractPayment: 'Malipo ya Mkataba', subsidy: 'Ruzuku', other: 'Nyingine',
    },
  },
  farmJournal: {
    title: 'Jarida la Shamba', whatDidYouDo: 'Ulifanya nini leo?', entries: 'maingizo mwezi huu',
    photos: 'zenye picha', spent: 'zilizotumika', allPlots: 'Mashamba Yote',
    activityType: 'Aina ya Shughuli', titleField: 'Kichwa', descriptionField: 'Kilichotokea?',
    addPhoto: 'Ongeza Picha', howAreYou: 'Unajisikiaje?', cost: 'Gharama', saveEntry: 'Hifadhi',
    photoGallery: 'Galeri ya Picha',
    activities: {
      planting: 'Kupanda', watering: 'Kumwagilia', fertilizing: 'Kuweka Mbolea',
      spraying: 'Kupulizia', weeding: 'Kupalilia', harvesting: 'Kuvuna',
      scouting: 'Kukagua', soilTest: 'Upimaji wa Udongo', pruning: 'Kupogoa', other: 'Nyingine',
    },
    moods: { great: 'Nzuri sana', good: 'Nzuri', okay: 'Sawa', concerned: 'Wasiwasi', worried: 'Hofu' },
  },
  financing: {
    title: 'Ufadhili', subtitle: 'Pata fedha unazohitaji kukuza shamba lako',
    applyNow: 'Omba Mkopo', myLoans: 'Mikopo Yangu', noLoans: 'Hakuna mikopo bado',
    noLoansDesc: 'Omba ufadhili kukuza shamba lako. Wanachama wa AFU wanapata viwango vya upendeleo.',
    loanTypes: {
      workingCapital: 'Mtaji wa Kufanya Kazi', inputFinance: 'Ufadhili wa Pembejeo',
      equipmentLease: 'Kukodisha Vifaa', tradeFinance: 'Ufadhili wa Biashara',
    },
    loanAmount: 'Kiasi cha Mkopo', outstanding: 'Deni', interestRate: 'Kiwango cha Riba',
    nextPayment: 'Malipo Yajayo', repaid: 'Imerejeshwa', status: 'Hali', active: 'Hai',
    completed: 'Imekamilika', overdue: 'Imechelewa', disbursed: 'Imetolewa', approved: 'Imeidhinishwa',
    applyTitle: 'Omba Ufadhili wa Shamba', applySubtitle: 'Tuambie kuhusu mahitaji yako',
    howMuch: 'Unahitaji kiasi gani?', whatFor: 'Mkopo ni kwa ajili gani?',
    cropSeason: 'Msimu gani?', farmSize: 'Ukubwa wa shamba (hekta)',
    yearsExperience: 'Miaka ya uzoefu wa kilimo', estimatedRevenue: 'Mapato yanayotarajiwa',
    submitApplication: 'Wasilisha Ombi', eligibility: 'Angalia Ustahili',
    eligibilityDesc: 'Kama mwanachama wa AFU, unaweza kustahili viwango vya upendeleo',
    requirements: 'Mahitaji', req1: 'Uanachama hai wa AFU', req2: 'Angalau msimu 1 wa rekodi',
    req3: 'Kitambulisho halali', req4: 'Uthibitisho wa eneo la shamba',
    benefits: 'Faida za Mwanachama', benefit1: 'Riba kuanzia 8% kwa mwaka',
    benefit2: 'Hakuna dhamana hadi $5,000', benefit3: 'Malipo yanayobadilika kufuata mavuno',
    applicationSent: 'Ombi Limewasilishwa!', applicationSentDesc: 'Ombi lako la ufadhili limepokelewa.',
    referenceNumber: 'Nambari ya Kumbukumbu', whatHappensNext: 'Nini kinachofuata?',
    step1: 'Timu yetu itakagua ombi lako ndani ya masaa 48',
    step2: 'Utapata uamuzi kupitia SMS na arifa ya programu',
    step3: 'Ikiidhiniwa, fedha zitatumwa moja kwa moja kwenye pochi yako',
    repaymentNote: 'Malipo yanabadilika kulingana na mzunguko wa mavuno yako.',
  },
  insurance: {
    title: 'Bima ya Shamba', subtitle: 'Linda mazao, mifugo, na vifaa vyako',
    myPolicies: 'Sera Zangu', fileClaim: 'Wasilisha Dai', myClaims: 'Madai Yangu',
    browseProducts: 'Tazama Bidhaa', getQuote: 'Pata Bei', activePolicies: 'Sera Hai',
    totalCoverage: 'Jumla ya Bima', monthlyPremium: 'Malipo ya Kila Mwezi',
    pendingClaims: 'Madai Yanayosubiri', policyDetails: 'Maelezo ya Sera',
    coverageAmount: 'Kiasi cha Bima', premium: 'Ada', deductible: 'Kiasi cha Awali',
    startDate: 'Tarehe ya Kuanza', endDate: 'Tarehe ya Mwisho', nextPayment: 'Malipo Yajayo',
    coveredItems: 'Vitu Vilivyolindwa', renewPolicy: 'Fanya Upya Sera', cancelPolicy: 'Sitisha Sera',
    claimHistory: 'Historia ya Madai', noActiveClaims: 'Hakuna madai hai', status: 'Hali',
    submitted: 'Imewasilishwa', underReview: 'Inakaguliwa', approved: 'Imeidhinishwa',
    rejected: 'Imekataliwa', paid: 'Imelipwa', estimatedLoss: 'Hasara Inayokadiriwa',
    approvedAmount: 'Kiasi Kilichoidhinishwa', incidentDate: 'Tarehe ya Tukio',
    describeIncident: 'Elezea Tukio', uploadPhotos: 'Pakia Picha', selectPolicy: 'Chagua Sera',
    submitClaim: 'Wasilisha Dai', eligibilityCheck: 'Angalia Ustahili',
    calculatePremium: 'Hesabu Ada', farmDetails: 'Maelezo ya Shamba', cropType: 'Aina ya Mazao',
    farmSize: 'Ukubwa wa Shamba', estimatedPremium: 'Ada Inayokadiriwa', getInsured: 'Pata Bima',
    popular: 'Maarufu', perMonth: '/mwezi', coverage: 'Bima', waitingPeriod: 'Kipindi cha Kusubiri',
    claimProcess: 'Mchakato wa Dai', viewDetails: 'Tazama Maelezo', compareProducts: 'Linganisha Bidhaa',
  },
  aiAssistant: {
    title: 'Msaidizi wa AI', poweredBy: 'Imewezeshwa na AFU',
    online: 'Mtandaoni — Tayari kusaidia', askAnything: 'Niulize chochote kuhusu shamba lako...',
    weatherToday: '🌤️ Hali ya hewa leo?', checkCrops: '🌿 Angalia mazao yangu',
    farmProfit: '💰 Faida ya shamba', pestAdvice: '🐛 Ushauri wa wadudu',
    whatToDoToday: '📅 Nifanye nini leo?', irrigation: '💧 Ratiba ya umwagiliaji',
  },
});

// ---------------------------------------------------------------------------
// SETSWANA — Botswana
// ---------------------------------------------------------------------------
export const tn: Translations = withOverrides({
  common: {
    home: 'Gae', crops: 'Dijalo', doctor: 'Ngaka', money: 'Madi', journal: 'Buka ya Temo',
    financing: 'Matlole', insurance: 'Inshorense', marketplace: 'Mmaraka', logistics: 'Dipalangwa',
    cooperatives: 'Dikopanelo', equipment: 'Didirisiwa', livestock: 'Leruo', sustainability: 'Tswelelopele',
    exports: 'Diromelo', weather: 'Maemo a Bosa', aiTools: 'Didirisiwa tsa AI',
    marketPrices: 'Ditlhwatlhwa tsa Mmaraka', payments: 'Dituelo', assistant: 'Mothusi wa AI',
    save: 'Boloka', cancel: 'Khansela', back: 'Morago', next: 'Go latela', submit: 'Romela',
    loading: 'E a tsenya...', viewAll: 'Bona Tsotlhe', addNew: 'Tsenya e Ntšha', search: 'Batla',
    filter: 'Sefa', today: 'Gompieno', yesterday: 'Maabane', language: 'Puo', settings: 'Ditlhophiso',
    signOut: 'Tswa', farmPortal: 'Setsha sa Molemi', backToPortal: 'Boela go AFU',
  },
  dashboard: {
    greeting: 'O amogetswe gape', goodMorning: 'Dumela', goodAfternoon: 'Dumela',
    goodEvening: 'Dumela', takePhoto: 'Tshwaya setshwantsho sa dijalo',
    weatherForecast: 'Ponelopele ya Bosa', myPlots: 'Masimo a Me',
    todaysTasks: 'Ditiro tsa Gompieno', quickStats: 'Dipalo ka Bonako',
    recentActivity: 'Ditiro tsa Bosheng', aiTip: 'Kgakololo ya AI', askAI: 'Botsa AI',
    totalIncome: 'Lotseno', totalExpenses: 'Ditshenyegelo', profit: 'Poelo',
    healthScore: 'Maemo a Boitekanelo', daysToHarvest: 'malatsi go ya kobong', addTask: 'Tsenya Tiro',
    high: 'Godimo', medium: 'Magareng', low: 'Tlase',
  },
  cropTracker: {
    title: 'Dijalo tsa Me', totalHectares: 'Dihektara Kakaretso', plots: 'Masimo',
    avgHealth: 'Boitekanelo jo bo Magareng', plantingDate: 'Letsatsi la go Jala',
    expectedHarvest: 'Kobo e e Solofetsweng', soilPH: 'pH ya Mmu',
    lastActivity: 'Tiro ya Bofelo', growthTimeline: 'Nako ya Kgolo',
    logActivity: 'Kwala Tiro', scanCrop: 'Sekaseka Sejalo', viewHistory: 'Bona Histori',
    addPlot: 'Tsenya Tshimo', plotName: 'Leina la Tshimo', crop: 'Sejalo', variety: 'Mofuta',
    size: 'Bogolo (ha)',
    stages: {
      planning: 'Go Rulaganya', planted: 'Go Jalwa', germinating: 'Go Mela', vegetative: 'Go Gola',
      flowering: 'Go Thunya', fruiting: 'Go Ungwa', harvesting: 'Go Roba', completed: 'Go Fela',
    },
  },
  financing: {
    title: 'Matlole', subtitle: 'Bona madi a o a tlhokang go godisa tshimo ya gago',
    applyNow: 'Kopa Kadimo', myLoans: 'Dikadimo tsa Me',
    loanAmount: 'Selekanyo sa Kadimo', status: 'Maemo',
  },
  insurance: {
    title: 'Inshorense ya Polasi', subtitle: 'Sireletsa dijalo, leruo, le didirisiwa tsa gago',
    myPolicies: 'Dipholisi tsa Me', getQuote: 'Bona Tlhwatlhwa',
  },
  aiAssistant: {
    title: 'Mothusi wa AI', poweredBy: 'E theilwe ke AFU',
    online: 'Mo inthaneteng — Go siame go thusa',
    askAnything: 'Mpotsé sengwe ka tshimo ya gago...',
  },
});

// ---------------------------------------------------------------------------
// PORTUGUESE — Mozambique
// ---------------------------------------------------------------------------
export const pt: Translations = withOverrides({
  common: {
    home: 'Início', crops: 'Culturas', doctor: 'Doutor', money: 'Dinheiro', journal: 'Diário',
    financing: 'Financiamento', insurance: 'Seguro', marketplace: 'Mercado', logistics: 'Logística',
    cooperatives: 'Cooperativas', equipment: 'Equipamento', livestock: 'Pecuária',
    sustainability: 'Sustentabilidade', exports: 'Exportações', weather: 'Clima',
    aiTools: 'Ferramentas IA', marketPrices: 'Preços de Mercado', payments: 'Pagamentos',
    assistant: 'Assistente IA', save: 'Guardar', cancel: 'Cancelar', back: 'Voltar',
    next: 'Seguinte', submit: 'Submeter', loading: 'A carregar...', viewAll: 'Ver Tudo',
    addNew: 'Adicionar', search: 'Pesquisar', filter: 'Filtrar', today: 'Hoje',
    yesterday: 'Ontem', language: 'Idioma', settings: 'Definições', signOut: 'Sair',
    farmPortal: 'Portal do Agricultor', backToPortal: 'Voltar ao Portal AFU',
  },
  dashboard: {
    greeting: 'Bem-vindo de volta', goodMorning: 'Bom dia', goodAfternoon: 'Boa tarde',
    goodEvening: 'Boa noite', takePhoto: 'Tire foto da cultura', weatherForecast: 'Previsão do Tempo',
    myPlots: 'Minhas Parcelas', todaysTasks: 'Tarefas de Hoje', quickStats: 'Estatísticas Rápidas',
    recentActivity: 'Atividade Recente', aiTip: 'Dica da IA', askAI: 'Perguntar à IA',
    totalIncome: 'Receita', totalExpenses: 'Despesas', profit: 'Lucro',
    healthScore: 'Estado de Saúde', daysToHarvest: 'dias até colheita', addTask: 'Adicionar Tarefa',
    high: 'Alto', medium: 'Médio', low: 'Baixo',
  },
  cropTracker: {
    title: 'Minhas Culturas', totalHectares: 'Total de Hectares', plots: 'Parcelas',
    avgHealth: 'Saúde Média', plantingDate: 'Data de Plantio', expectedHarvest: 'Colheita Prevista',
    soilPH: 'pH do Solo', lastActivity: 'Última Atividade', growthTimeline: 'Linha do Tempo',
    logActivity: 'Registar Atividade', scanCrop: 'Analisar Cultura', viewHistory: 'Ver Histórico',
    addPlot: 'Adicionar Parcela', plotName: 'Nome da Parcela', crop: 'Cultura', variety: 'Variedade',
    size: 'Tamanho (ha)',
    stages: {
      planning: 'Planeamento', planted: 'Plantado', germinating: 'Germinando', vegetative: 'Vegetativo',
      flowering: 'Floração', fruiting: 'Frutificação', harvesting: 'Colheita', completed: 'Concluído',
    },
  },
  financing: {
    title: 'Financiamento', subtitle: 'Obtenha o financiamento necessário para crescer a sua machamba',
    applyNow: 'Pedir Empréstimo', myLoans: 'Meus Empréstimos',
    loanAmount: 'Valor do Empréstimo', status: 'Estado',
  },
  insurance: {
    title: 'Seguro Agrícola', subtitle: 'Proteja as suas culturas, gado e equipamento',
    myPolicies: 'Minhas Apólices', getQuote: 'Obter Cotação',
  },
  aiAssistant: {
    title: 'Assistente IA', poweredBy: 'Desenvolvido pela AFU',
    online: 'Online — Pronto para ajudar',
    askAnything: 'Pergunte-me qualquer coisa sobre a sua machamba...',
  },
});

// ---------------------------------------------------------------------------
// HAUSA — Nigeria
// ---------------------------------------------------------------------------
export const ha: Translations = withOverrides({
  common: {
    home: 'Gida', crops: 'Amfanin gona', doctor: 'Likita', money: 'Kuɗi',
    journal: 'Littafin aikin gona', financing: 'Kuɗin rance', insurance: 'Inshora',
    marketplace: 'Kasuwa', logistics: 'Sufuri', cooperatives: 'Ƙungiyoyi',
    equipment: 'Kayan aiki', livestock: 'Dabbobi', sustainability: 'Dorewa',
    exports: 'Fitarwa', weather: 'Yanayi', aiTools: 'Kayan AI', marketPrices: 'Farashin Kasuwa',
    payments: 'Biya', assistant: 'Mai taimako na AI', save: 'Ajiye', cancel: 'Soke',
    back: 'Baya', next: 'Na gaba', submit: 'Aika', loading: 'Ana lodi...',
    viewAll: 'Duba Duka', addNew: 'Ƙara Sabuwa', search: 'Bincika', filter: 'Tace',
    today: 'Yau', yesterday: 'Jiya', language: 'Harshe', settings: 'Saituna',
    signOut: 'Fita', farmPortal: 'Ƙofar Manomi', backToPortal: 'Koma AFU',
  },
  dashboard: {
    greeting: 'Barka da dawowa', goodMorning: 'Ina kwana', goodAfternoon: 'Ina wuni',
    goodEvening: 'Ina yini', takePhoto: 'Ɗauki hoton amfanin gona',
    weatherForecast: 'Hasashen Yanayi', myPlots: 'Gonakin Na', todaysTasks: 'Ayyukan Yau',
    quickStats: 'Ƙididdiga', recentActivity: 'Ayyukan Kwanan nan', aiTip: 'Shawarar AI',
    askAI: 'Tambayi AI', totalIncome: 'Kudin shiga', totalExpenses: 'Kashe kuɗi',
    profit: 'Riba', healthScore: 'Matsayin Lafiya', daysToHarvest: 'kwanaki kafin girbi',
    addTask: 'Ƙara Aiki', high: 'Babba', medium: 'Matsakaici', low: 'Ƙarami',
  },
  financing: {
    title: 'Kuɗin Rance', subtitle: 'Sami kuɗin da kake bukata don haɓaka gonar ka',
    applyNow: 'Nemi Rance', myLoans: 'Bashin Na',
  },
  insurance: {
    title: 'Inshorar Gona', subtitle: 'Kare amfanin gonar ka, dabbobi, da kayan aiki',
  },
  aiAssistant: {
    title: 'Mai Taimako na AI', poweredBy: 'An ƙirƙira ta AFU',
    online: 'A layi — Shirye don taimako',
    askAnything: 'Tambaye ni komai game da gonar ka...',
  },
});

// ---------------------------------------------------------------------------
// YORUBA — Nigeria
// ---------------------------------------------------------------------------
export const yo: Translations = withOverrides({
  common: {
    home: 'Ilé', crops: 'Oko', doctor: 'Dókítà', money: 'Owó', journal: 'Ìwé àkọsílẹ̀',
    financing: 'Ìnáwó', insurance: 'Ìṣedúró', marketplace: 'Ọjà', logistics: 'Ìgbékalẹ̀',
    cooperatives: 'Àwùjọ', equipment: 'Ohun èlò', livestock: 'Ẹran ọ̀sìn',
    sustainability: 'Àtìlẹ́yìn', exports: 'Ohun tí a kó jáde', weather: 'Ojú ọjọ́',
    aiTools: 'Ohun èlò AI', marketPrices: 'Iye Ọjà', payments: 'Ìsanwó',
    assistant: 'Olùrànlọ́wọ́ AI', save: 'Fi pamọ́', cancel: 'Fagilee', back: 'Padà',
    next: 'Tẹ̀síwájú', submit: 'Fíránṣẹ́', loading: 'Ń gbékalẹ̀...',
    viewAll: 'Wo Gbogbo', addNew: 'Fi Kun Tuntun', search: 'Wá', filter: 'Ṣàyẹ̀wò',
    today: 'Lónìí', yesterday: 'Láàná', language: 'Èdè', settings: 'Ètò',
    signOut: 'Jáde', farmPortal: 'Ẹnu-ọ̀nà Àgbẹ̀', backToPortal: 'Padà sí AFU',
  },
  dashboard: {
    greeting: 'Ẹ kú àbọ̀', goodMorning: 'Ẹ kú àárọ̀', goodAfternoon: 'Ẹ kú ọ̀sán',
    goodEvening: 'Ẹ kú ìrọ̀lẹ́', myPlots: 'Oko Mi', todaysTasks: 'Iṣẹ́ Lónìí',
    totalIncome: 'Owó tí ó wọlé', totalExpenses: 'Ìnáwó', profit: 'Èrè',
  },
  financing: {
    title: 'Ìnáwó', subtitle: 'Gba owó tí o nílò láti mú oko rẹ dàgbà',
    applyNow: 'Béèrè fún Awin',
  },
  aiAssistant: {
    title: 'Olùrànlọ́wọ́ AI', poweredBy: 'Ó wá láti ọ̀dọ̀ AFU',
    online: 'Lórí ayélujára — Ṣe ìtán láti ràn ọ́ lọ́wọ́',
    askAnything: 'Béèrè ohunkóhun nípa oko rẹ...',
  },
});

// ---------------------------------------------------------------------------
// ISIZULU — South Africa
// ---------------------------------------------------------------------------
export const zu: Translations = withOverrides({
  common: {
    home: 'Ekhaya', crops: 'Izitshalo', doctor: 'Udokotela', money: 'Imali',
    journal: 'Idayari', financing: 'Ukuxhaswa ngemali', insurance: 'Umshwalense',
    marketplace: 'Imakethe', logistics: 'Ukuthutha', cooperatives: 'Amahlelo',
    equipment: 'Izinto zokusebenza', livestock: 'Imfuyo', sustainability: 'Ukusimama',
    exports: 'Ukukhishwa', weather: 'Isimo sezulu', aiTools: 'Amathuluzi e-AI',
    marketPrices: 'Amanani Emakethe', payments: 'Izinkokhelo', assistant: 'Umsizi we-AI',
    save: 'Gcina', cancel: 'Khansela', back: 'Emuva', next: 'Okulandelayo',
    submit: 'Thumela', loading: 'Iyalayisha...', viewAll: 'Buka Konke',
    addNew: 'Engeza Okusha', search: 'Sesha', filter: 'Hlunga', today: 'Namuhla',
    yesterday: 'Izolo', language: 'Ulimi', settings: 'Izilungiselelo',
    signOut: 'Phuma', farmPortal: 'Isango Lomlimi', backToPortal: 'Buyela ku-AFU',
  },
  dashboard: {
    greeting: 'Wamkelekile futhi', goodMorning: 'Sawubona ekuseni',
    goodAfternoon: 'Sawubona emini', goodEvening: 'Sawubona kusihlwa',
    myPlots: 'Izindawo Zami', totalIncome: 'Imali engenayo', totalExpenses: 'Izindleko',
    profit: 'Inzuzo',
  },
  financing: {
    title: 'Ukuxhaswa Ngemali', subtitle: 'Thola imali oyidingayo ukukhulisa ipulazi lakho',
    applyNow: 'Cela Isikweletu',
  },
  aiAssistant: {
    title: 'Umsizi we-AI', poweredBy: 'Inikezwe yi-AFU',
    online: 'Ku-inthanethi — Ilungele ukusiza',
    askAnything: 'Buza noma yini ngepulazi lakho...',
  },
});

// ---------------------------------------------------------------------------
// AFRIKAANS — South Africa
// ---------------------------------------------------------------------------
export const af: Translations = withOverrides({
  common: {
    home: 'Tuis', crops: 'Gewasse', doctor: 'Dokter', money: 'Geld', journal: 'Joernaal',
    financing: 'Finansiering', insurance: 'Versekering', marketplace: 'Mark',
    logistics: 'Logistiek', cooperatives: 'Koöperasies', equipment: 'Toerusting',
    livestock: 'Vee', sustainability: 'Volhoubaarheid', exports: 'Uitvoere', weather: 'Weer',
    aiTools: 'KI-Gereedskap', marketPrices: 'Markpryse', payments: 'Betalings',
    assistant: 'KI-Assistent', save: 'Stoor', cancel: 'Kanselleer', back: 'Terug',
    next: 'Volgende', submit: 'Dien in', loading: 'Laai...', viewAll: 'Bekyk Alles',
    addNew: 'Voeg By', search: 'Soek', filter: 'Filter', today: 'Vandag',
    yesterday: 'Gister', language: 'Taal', settings: 'Instellings', signOut: 'Teken Uit',
    farmPortal: 'Boerportaal', backToPortal: 'Terug na AFU',
  },
  dashboard: {
    greeting: 'Welkom terug', goodMorning: 'Goeie môre', goodAfternoon: 'Goeie middag',
    goodEvening: 'Goeie naand', takePhoto: 'Neem gewas foto', weatherForecast: 'Weervoorspelling',
    myPlots: 'My Plotte', todaysTasks: 'Vandag se Take', quickStats: 'Vinnige Statistieke',
    recentActivity: 'Onlangse Aktiwiteit', aiTip: 'KI-Wenk', askAI: 'Vra KI',
    totalIncome: 'Inkomste', totalExpenses: 'Uitgawes', profit: 'Wins',
    healthScore: 'Gesondheidtelling', daysToHarvest: 'dae tot oes', addTask: 'Voeg Taak By',
    high: 'Hoog', medium: 'Medium', low: 'Laag',
  },
  cropTracker: {
    title: 'My Gewasse', totalHectares: 'Totale Hektaar', plots: 'Plotte',
    addPlot: 'Voeg Plot By', plotName: 'Plotnaam', crop: 'Gewas', variety: 'Variëteit',
    size: 'Grootte (ha)',
    stages: {
      planning: 'Beplanning', planted: 'Geplant', germinating: 'Ontkiem', vegetative: 'Vegetatief',
      flowering: 'Blom', fruiting: 'Vrug', harvesting: 'Oes', completed: 'Voltooi',
    },
  },
  financing: {
    title: 'Finansiering', subtitle: 'Kry die befondsing wat jy nodig het om jou plaas te groei',
    applyNow: 'Aansoek vir Lening', myLoans: 'My Lenings',
  },
  insurance: {
    title: 'Plaasversekering', subtitle: 'Beskerm jou gewasse, vee en toerusting',
  },
  aiAssistant: {
    title: 'KI-Assistent', poweredBy: 'Aangedryf deur AFU',
    online: 'Aanlyn — Gereed om te help',
    askAnything: 'Vra my enigiets oor jou plaas...',
  },
});

// ---------------------------------------------------------------------------
// BEMBA — Zambia
// ---------------------------------------------------------------------------
export const bem: Translations = withOverrides({
  common: {
    home: 'Kuŋanda', crops: 'Ifyakulima', doctor: 'Kalamba', money: 'Indalama',
    journal: 'Ibuku lya mulimo', financing: 'Ukwafwilishiwa', insurance: 'Ubushikishiki',
    marketplace: 'Icisali', logistics: 'Ukusenda', cooperatives: 'Amabungwe',
    equipment: 'Ifikwatililo', livestock: 'Inama', sustainability: 'Ukucingilila',
    exports: 'Ukufumishya', weather: 'Ubushiku', aiTools: 'Ifikwatililo fya AI',
    marketPrices: 'Amanshi ya Icisali', payments: 'Amalipilo', assistant: 'Uwafwilisha wa AI',
    save: 'Sunga', cancel: 'Leka', back: 'Bwela', next: 'Konse', submit: 'Tumya',
    loading: 'Nalapanga...', viewAll: 'Mona Fyonse', addNew: 'Bikamo Ipya',
    search: 'Fwaya', filter: 'Sola', today: 'Lelo', yesterday: 'Mailo',
    language: 'Ululimi', settings: 'Amafunde', signOut: 'Fuma',
    farmPortal: 'Pa Mulimo', backToPortal: 'Bwelela ku AFU',
  },
  dashboard: {
    greeting: 'Mwaiseni nakabili', goodMorning: 'Mwashibukeni', goodAfternoon: 'Mwapoleni',
    goodEvening: 'Mwapoleni', myPlots: 'Amapanga Yandi', totalIncome: 'Amabumo',
    totalExpenses: 'Amafuto', profit: 'Ubusuma',
  },
  financing: {
    title: 'Ukwafwilishiwa', subtitle: 'Sangeni indalama isho mulefwaya ukufulisha amapanga yenu',
    applyNow: 'Lombeni Ukwafwilishiwa',
  },
  aiAssistant: {
    title: 'Uwafwilisha wa AI', poweredBy: 'Ukufuma ku AFU',
    online: 'Pa intaneti — Naipekanishiwa ukumwafwilisha',
    askAnything: 'Njipusheni icili conse pa mapanga yenu...',
  },
});

// ---------------------------------------------------------------------------
// KRIO — Sierra Leone
// ---------------------------------------------------------------------------
export const kri: Translations = withOverrides({
  common: {
    home: 'Os', crops: 'Krop', doctor: 'Dɔktɔ', money: 'Mɔni', journal: 'Buk',
    financing: 'Mɔni fɔ bɔro', insurance: 'Inshɔrans', marketplace: 'Makit',
    logistics: 'Transpɔt', cooperatives: 'Grup', equipment: 'Tul dɛn',
    livestock: 'Animal dɛn', sustainability: 'Fɔ kip', exports: 'Sɛn go na abrod',
    weather: 'Wɛda', aiTools: 'AI Tul dɛn', marketPrices: 'Makit Prays',
    payments: 'Pe', assistant: 'AI Ɛlp', save: 'Sev', cancel: 'Kansul',
    back: 'Go bak', next: 'Nɛks', submit: 'Sɛn', loading: 'I de lod...',
    viewAll: 'Si Ɔl', addNew: 'Ad Niu', search: 'Luk fɔ', filter: 'Filta',
    today: 'Tide', yesterday: 'Yɛstade', language: 'Langwej', settings: 'Sɛtin',
    signOut: 'Kɔmɔt', farmPortal: 'Fam Dɔ', backToPortal: 'Go bak to AFU',
  },
  dashboard: {
    greeting: 'Wɛlkɔm bak', goodMorning: 'Gud mɔnin', goodAfternoon: 'Gud aftanun',
    goodEvening: 'Gud ivnin', myPlots: 'Mi Fam dɛn', totalIncome: 'Mɔni we kɔm',
    totalExpenses: 'Mɔni we go', profit: 'Prɔfit',
  },
  financing: {
    title: 'Mɔni fɔ Bɔro', subtitle: 'Gɛt di mɔni we yu nid fɔ gro yu fam',
    applyNow: 'Aply fɔ Lon',
  },
  aiAssistant: {
    title: 'AI Ɛlp', poweredBy: 'AFU mek am',
    online: 'Ɔnlayn — Rɛdi fɔ ɛlp',
    askAnything: 'Aks mi ɛnitin bɔt yu fam...',
  },
});

// ─── Luganda (Uganda) ────────────────────────────────────────────────────────

export const lg: Translations = withOverrides({
  common: {
    home: 'Awaka', crops: 'Ebirime', doctor: 'Omusawo', money: 'Ssente', journal: 'Ekitabo',
    financing: 'Okuwola', insurance: 'Yinshuwa', marketplace: 'Akatale',
    logistics: 'Entambula', cooperatives: 'Ebibiina', equipment: 'Ebyuma',
    livestock: 'Ebisolo', sustainability: 'Obukuumi', exports: 'Ebitundibwa ebweru',
    weather: 'Embeera y\'obudde', aiTools: 'Ebyuma bya AI', marketPrices: 'Emiwendo',
    payments: 'Okusasula', assistant: 'Omuyambi wa AI', save: 'Tereka', cancel: 'Sazaamu',
    back: 'Dda emabega', next: 'Ekiddako', submit: 'Waayo', loading: 'Kiteekedwa...',
    viewAll: 'Laba Byonna', addNew: 'Gattako Ekipya', search: 'Noonya', filter: 'Londoola',
    today: 'Leero', yesterday: 'Jjo', language: 'Olulimi', settings: 'Entegeka',
    signOut: 'Fuluma', farmPortal: 'Woomu w\'Okulima', backToPortal: 'Ddayo ku AFU',
  },
  dashboard: {
    greeting: 'Tukusanyukira', goodMorning: 'Wasuze otya', goodAfternoon: 'Osiibye otya',
    goodEvening: 'Oli otya akawungeezi', myPlots: 'Ennimiro Zange', totalIncome: 'Ssente Ezijja',
    totalExpenses: 'Ssente Ezigenda', profit: 'Amagoba',
  },
  financing: {
    title: 'Okuwola', subtitle: 'Funa ssente z\'weetaaga okulimisa',
    applyNow: 'Saba Looni',
  },
  aiAssistant: {
    title: 'Omuyambi wa AI', poweredBy: 'AFU yakola',
    online: 'Ku mutimbagano — Nzetegefu okuyamba',
    askAnything: 'Mbuuza ekikufaako ku bulimi bwo...',
  },
});

// ---------------------------------------------------------------------------
// Translation accessor
// ---------------------------------------------------------------------------
const translations: Record<Locale, Translations> = { en, sn, nd, sw, tn, pt, ha, yo, zu, af, bem, kri, lg };

export function getTranslations(locale: Locale): Translations {
  return translations[locale] || translations.en;
}
