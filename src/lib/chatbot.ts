export interface ChatResponse {
  text: string;
  suggestions?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'bot' | 'user' | 'system';
  text: string;
  suggestions?: string[];
  timestamp: Date;
}

export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function getInitialGreeting(userName?: string): ChatMessage {
  const name = userName || 'there';
  return {
    id: generateMessageId(),
    role: 'bot',
    text: `Hello ${name}! Welcome to AFU — Africa\u2019s Agriculture Development Platform. \ud83c\udf0d\n\nI can help you learn about our services, membership options, investment opportunities, and how AFU works.\n\nWhat would you like to know?`,
    suggestions: ['How does AFU work?', 'Membership options', 'Investment opportunity', 'Sponsor a farmer', 'Contact us', 'Our countries'],
    timestamp: new Date(),
  };
}

export async function getChatResponse(
  message: string,
  context?: { page?: string; userName?: string; tier?: string }
): Promise<ChatResponse> {
  // Try Gemini AI first for real responses
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        context: 'business_website_chat',
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.response) {
        return {
          text: data.response,
          suggestions: ['Membership options', 'Our services', 'Investment opportunity', 'Contact us'],
        };
      }
    }
  } catch {
    // Fall through to keyword matching
  }

  // Fallback: keyword matching
  const delay = 1000 + Math.random() * 1000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const lowerMessage = message.toLowerCase().trim();
  const name = context?.userName || 'there';

  // --- Greetings ---
  if (/^(hi|hello|hey|howdy|greetings|good\s*(morning|afternoon|evening)|sup|yo)\b/.test(lowerMessage)) {
    return {
      text: `Hello ${name}! I'm Mkulima, your AI farming assistant. How can I help you today?`,
      suggestions: ['Check crop health', 'Loan calculator', 'Market prices', 'Training courses'],
    };
  }

  // --- Crop Health Issues (check before general crop) ---
  if (/yellow\s*leaves?|disease|pest|sick|wilt|rot|blight|spots?|dying|infect/.test(lowerMessage)) {
    return {
      text: `It sounds like your crop might be stressed. I recommend using our Crop Health Scanner \u2014 upload a photo and I'll analyze it.\n\nGo to Dashboard \u2192 Crop Scanner to get started.\n\nIn the meantime, here are common causes:\n\u2022 Yellow leaves: Often nitrogen deficiency or overwatering\n\u2022 Spots: Could be fungal infection\n\u2022 Wilting: Check for root rot or water stress`,
      suggestions: ['Open Crop Scanner', 'Common diseases', 'Pest control tips'],
    };
  }

  // --- Blueberry specific ---
  if (/blueberr(y|ies)/.test(lowerMessage)) {
    return {
      text: `Great choice! Blueberries are a high-value export crop. Here's advice for Zimbabwe:\n\n\ud83e\uded0 **Planting Season:** Best planted in April-May (cool season)\n\ud83c\udf31 **Soil:** Acidic soil (pH 4.5-5.5), well-drained, rich in organic matter\n\ud83d\udca7 **Irrigation:** Drip irrigation recommended, 25-30mm/week\n\u2600\ufe0f **Sunlight:** Full sun, 6-8 hours daily\n\ud83d\udce6 **Harvest:** Berries ready Nov-Feb, peak UK demand March-April\n\n\ud83d\udca1 Tip: AFU's Premium tier includes blueberry-specific agronomist consultations.`,
      suggestions: ['Blueberry varieties', 'Export requirements', 'Find buyers', 'Irrigation setup'],
    };
  }

  // --- Cassava specific ---
  if (/cassava|manioc/.test(lowerMessage)) {
    return {
      text: `Cassava is a staple crop across Africa. Here's advice for optimal cultivation:\n\n\ud83c\udf3f **Planting:** Start of rainy season (Oct-Nov in Tanzania)\n\ud83c\udf0d **Soil:** Well-drained loamy soil, tolerates poor soils\n\ud83d\udca7 **Water:** Drought-tolerant, but needs 1000-1500mm annual rainfall\n\u23f0 **Harvest:** 8-18 months after planting depending on variety\n\ud83d\udcca **Yield:** 10-25 tonnes/hectare with good practices\n\n\ud83d\udca1 Tip: Sweet varieties (6-9 months) are best for fresh market; bitter varieties (12-18 months) for processing.`,
      suggestions: ['Cassava processing', 'Disease prevention', 'Market prices', 'Best varieties'],
    };
  }

  // --- Sesame specific ---
  if (/sesame/.test(lowerMessage)) {
    return {
      text: `Sesame is an excellent export crop with growing demand. Here's what you need to know:\n\n\ud83c\udf3e **Planting:** Early rainy season, needs warm soil (25-35\u00b0C)\n\ud83c\udf31 **Soil:** Light, well-drained sandy loam, pH 5.5-8.0\n\ud83d\udca7 **Water:** Moderate rainfall (300-600mm during growing season)\n\u23f0 **Harvest:** 90-120 days after planting\n\ud83d\udcca **Price:** Currently $2.80/kg, trending upward\n\n\ud83d\udca1 Tip: Organic sesame fetches 20-30% premium in export markets.`,
      suggestions: ['Sesame buyers', 'Organic certification', 'Storage tips', 'Market prices'],
    };
  }

  // --- General Crop / Farming ---
  if (/crop|plant|grow|farm|harvest|seed|cultivat/.test(lowerMessage)) {
    return {
      text: `I can help with crop advice! Here are some tips for this season:\n\n\ud83c\udf31 **Planting Season:** We're currently in the growing season for most regions. Ensure soil preparation is complete.\n\ud83e\udea3 **Soil Prep:** Test your soil pH and nutrients. AFU provides soil testing kits for members.\n\ud83d\udca7 **Irrigation:** Check your water schedule \u2014 most crops need consistent moisture during establishment.\n\n\ud83c\udf3e **Popular crops for your region:**\n\u2022 Blueberries (high value export)\n\u2022 Cassava (staple crop)\n\u2022 Sesame (growing demand)\n\u2022 Maize (food security)\n\nWhich crop would you like specific advice on?`,
      suggestions: ['Blueberries', 'Cassava', 'Sesame', 'Soil testing', 'Planting calendar'],
    };
  }

  // --- Soil & Fertilizer ---
  if (/soil|fertiliz|compost|manure|nutrient|nitrogen|phosphor|potassium|mulch/.test(lowerMessage)) {
    return {
      text: `Good soil management is the foundation of successful farming! Here are my recommendations:\n\n\ud83e\udea3 **Soil Testing:** Get a soil test before applying fertilizers. AFU offers affordable soil testing kits.\n\n\ud83c\udf31 **General Guidelines:**\n\u2022 pH 6.0-7.0 for most crops\n\u2022 Apply compost (5-10 tonnes/hectare) for organic matter\n\u2022 NPK fertilizer based on soil test results\n\u2022 Mulch to retain moisture and suppress weeds\n\n\u267b\ufe0f **Sustainable Options:**\n\u2022 Green manure cover crops\n\u2022 Vermicompost\n\u2022 Crop rotation to restore nutrients\n\nWould you like to order soil testing kits or fertilizers through AFU?`,
      suggestions: ['Order soil test', 'Buy fertilizer', 'Composting guide', 'Crop rotation plan'],
    };
  }

  // --- Financing / Loans ---
  if (/loan|financ|borrow|capital|money|fund|credit\s*line/.test(lowerMessage)) {
    return {
      text: `AFU offers several financing options tailored for African farmers:\n\n\ud83d\udcb0 **Pre-Export Working Capital**\n\u2022 Amount: $5,000 - $500,000\n\u2022 Term: 90-180 days\n\u2022 Rate: 12-18% APR\n\n\ud83d\udcc4 **Invoice Finance**\n\u2022 Up to 80% of invoice value\n\u2022 Term: 30-60 days\n\u2022 Rate: 8-10% APR\n\n\ud83d\ude9c **Equipment Finance**\n\u2022 Up to $100,000\n\u2022 Term: Up to 24 months\n\u2022 Rate: From 14% APR\n\n\ud83c\udf31 **Input Bundle Finance**\n\u2022 Seeds, fertilizer, chemicals\n\u2022 Seasonal repayment\n\u2022 Deducted from harvest proceeds\n\nWould you like me to help calculate a loan or start an application?`,
      suggestions: ['Loan calculator', 'Apply now', 'Check eligibility'],
    };
  }

  // --- Interest Rates ---
  if (/interest|rate|apr|percent/.test(lowerMessage)) {
    return {
      text: `Let me explain our interest rates in simple terms:\n\n\ud83d\udcca **How it works:**\nAPR (Annual Percentage Rate) is the yearly cost of borrowing. For example:\n\u2022 $10,000 at 12% APR for 6 months = ~$600 in interest\n\u2022 $10,000 at 8% APR for 2 months = ~$133 in interest\n\n\ud83d\udcb0 **Our rates by product:**\n\u2022 Invoice Finance: 8-10% APR (lowest)\n\u2022 Working Capital: 12-18% APR\n\u2022 Equipment: From 14% APR\n\u2022 Input Bundles: Varies by season\n\n\ud83d\udca1 Your rate depends on your credit history, farm size, and membership tier. Premium members get preferential rates.\n\nWant me to calculate exact costs for your loan amount?`,
      suggestions: ['Loan calculator', 'Upgrade membership', 'Talk to advisor'],
    };
  }

  // --- Repayment / Balance ---
  if (/repay|payment|balance|due|owe|installment|pay\s*back/.test(lowerMessage)) {
    return {
      text: `Your current outstanding balance is $12,300. Next payment of $2,100 is due on March 20, 2026.\n\n\ud83d\udcc5 **Payment Schedule:**\n\u2022 Mar 20, 2026: $2,100\n\u2022 Apr 20, 2026: $2,100\n\u2022 May 20, 2026: $2,100\n\u2022 Jun 20, 2026: $2,100\n\u2022 Jul 20, 2026: $3,900 (final)\n\n\u2705 Payment Status: On track\n\ud83d\udcb3 Auto-debit: Enabled\n\nWould you like to make a payment or adjust your schedule?`,
      suggestions: ['Payment schedule', 'Make payment', 'Contact finance team'],
    };
  }

  // --- Market Prices ---
  if (/price|market|sell|buy(er)?|trade|export|demand/.test(lowerMessage)) {
    return {
      text: `Current market prices (updated today):\n\n\ud83e\uded0 Blueberries: $12.50/kg (\u21913.2%)\n\ud83c\udf3f Cassava: $0.15/kg (\u21931.1%)\n\ud83c\udf3e Sesame: $2.80/kg (\u21910.5%)\n\ud83c\udf3d Maize: $0.28/kg (\u21911.8%)\n\u2615 Coffee: $4.20/kg (\u21912.3%)\n\ud83c\udf6b Cocoa: $3.15/kg (\u21910.8%)\n\nBest time to sell blueberries is March-April when UK demand peaks.\n\n\ud83d\udca1 AFU members get access to premium buyers offering 10-15% above market rates through our offtake agreements.`,
      suggestions: ['Price forecast', 'Find buyers', 'Sell now', 'Offtake contracts'],
    };
  }

  // --- Weather ---
  if (/weather|rain|forecast|temperature|climate|season|drought|flood/.test(lowerMessage)) {
    return {
      text: `Weather forecast for Harare, Zimbabwe:\n\n\u2600\ufe0f Today: 28\u00b0C, Sunny\n\ud83c\udf24 Tomorrow: 26\u00b0C, Partly Cloudy\n\ud83c\udf27 Thursday: 22\u00b0C, Rain expected (15mm)\n\u2600\ufe0f Friday: 25\u00b0C, Sunny\n\ud83c\udf24 Saturday: 27\u00b0C, Partly Cloudy\n\ud83c\udf24 Sunday: 26\u00b0C, Clear skies\n\n\ud83d\udca1 Tip: With rain expected Thursday, consider delaying any pesticide application until Friday. Good opportunity to apply fertilizer before the rain.\n\n\ud83d\udcc5 We're currently in the warm-wet season. Expect above-average rainfall this month.`,
      suggestions: ['Weekly forecast', 'Planting calendar', 'Irrigation advice', 'Seasonal outlook'],
    };
  }

  // --- Training ---
  if (/learn|course|training|study|certif|lesson|education|skill/.test(lowerMessage)) {
    return {
      text: `Based on your profile, I recommend these courses:\n\n1. \ud83c\udf31 **Blueberry Cultivation Best Practices** (90% match)\n   \u2022 Duration: 4 hours \u2022 Level: Intermediate\n\n2. \ud83d\udce6 **Export Quality Standards - EU** (85% match)\n   \u2022 Duration: 3 hours \u2022 Level: Beginner\n\n3. \ud83d\udcb0 **Financial Record Keeping** (80% match)\n   \u2022 Duration: 2 hours \u2022 Level: Beginner\n\n4. \ud83c\udf0d **Sustainable Farming Practices** (75% match)\n   \u2022 Duration: 5 hours \u2022 Level: Advanced\n\nYou've completed 3 of 8 courses. Keep going! \ud83c\udf89\n\nYour next milestone: Complete 5 courses to earn the "Skilled Farmer" badge.`,
      suggestions: ['Start next course', 'View all courses', 'My certificates', 'Study schedule'],
    };
  }

  // --- Documents ---
  if (/upload|document|passport|id\b|kyc|verify|verification|land\s*title|bank\s*statement/.test(lowerMessage)) {
    return {
      text: `To upload documents, go to Documents Center in your dashboard. Here's your current status:\n\n\u2705 Passport \u2014 Uploaded & Verified\n\u2705 Farm Photos \u2014 3 uploaded\n\u23f3 Bank Statement \u2014 Pending verification (submitted 2 days ago)\n\u274c Land Title \u2014 Not uploaded\n\n\ud83d\udcc4 **Required for loan applications:**\nAll 4 documents must be verified before you can access financing.\n\nWould you like to upload your land title now?`,
      suggestions: ['Upload document', 'Check KYC status', 'Documents center', 'Contact support'],
    };
  }

  // --- Help / Navigation ---
  if (/help|how\s+(do|can|to)|where|find|navigate|what\s+can|guide|menu/.test(lowerMessage)) {
    return {
      text: `I can help you navigate! Here's what you can do on the AFU portal:\n\n\ud83d\udcb0 **Financing** \u2014 Apply for loans, check balance, make payments\n\ud83d\udcda **Training** \u2014 Take courses, earn certificates, track progress\n\ud83d\udcc4 **Documents** \u2014 Upload & manage your KYC documents\n\ud83c\udf3e **Inputs** \u2014 Browse seeds, fertilizers, equipment\n\ud83d\udcca **Contracts** \u2014 View offtake agreements & trade deals\n\ud83d\udcc8 **Dashboard** \u2014 Overview of your farm & activities\n\u2699\ufe0f **Settings** \u2014 Update profile, notifications, preferences\n\nWhat would you like to do?`,
      suggestions: ['Dashboard', 'Financing', 'Training', 'Documents', 'Inputs', 'Settings'],
    };
  }

  // --- Thank you ---
  if (/thank|thanks|cheers|appreciate/.test(lowerMessage)) {
    return {
      text: `You're welcome, ${name}! I'm always here to help. \ud83c\udf31\n\nIs there anything else you'd like to know?`,
      suggestions: ['Crop advice', 'Market prices', 'Financing', 'Training'],
    };
  }

  // --- Goodbye ---
  if (/bye|goodbye|see\s*you|later|exit|quit/.test(lowerMessage)) {
    return {
      text: `Goodbye, ${name}! Happy farming! \ud83c\udf3e\n\nRemember, I'm available 24/7 whenever you need assistance. Just click the chat button to reach me.`,
      suggestions: ['Start new chat'],
    };
  }

  // --- Default / Unknown ---
  return {
    text: `I'm not sure I understand that. Here are some things I can help with:\n\n\ud83c\udf31 Crop advice and planting tips\n\ud83d\udcb0 Financing and loan information\n\ud83d\udcca Market prices and buyer connections\n\ud83c\udf24 Weather forecasts\n\ud83d\udcda Training courses\n\ud83d\udcc4 Document uploads and KYC\n\nTry asking me something specific, or use the quick actions below!`,
    suggestions: ['Crop advice', 'Financing help', 'Market prices', 'Weather forecast', 'Training', 'Upload documents'],
  };
}
