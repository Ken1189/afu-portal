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

  // Fallback: business-focused keyword matching for the public website
  const delay = 800 + Math.random() * 800;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const lowerMessage = message.toLowerCase().trim();

  // --- Greetings ---
  if (/^(hi|hello|hey|howdy|greetings|good\s*(morning|afternoon|evening)|sup|yo)\b/.test(lowerMessage)) {
    return {
      text: "Hello! Welcome to AFU \u2014 the African Farming Union. We're building Africa's agriculture operating platform \u2014 financing, inputs, insurance, off-take, and training all in one place.\n\nHow can I help you today?",
      suggestions: ['How does AFU work?', 'Membership options', 'Investment opportunity', 'Sponsor a farmer'],
    };
  }

  // --- How AFU works ---
  if (/how.*work|what.*do|what.*afu|about.*afu|tell.*more/.test(lowerMessage)) {
    return {
      text: "AFU is a vertically integrated agriculture development platform. We connect farmers to everything they need:\n\n\u2022 **Financing** \u2014 Working capital, input finance, trade finance (SBLCs via our banking partners)\n\u2022 **Inputs** \u2014 Seeds, fertilizer, equipment at bulk pricing\n\u2022 **Insurance** \u2014 Crop, livestock, equipment (underwritten by Lloyd's of London)\n\u2022 **Off-take** \u2014 Guaranteed buyers for your harvest\n\u2022 **Training** \u2014 AI-powered advisory and progressive certification\n\u2022 **Trade Finance** \u2014 SBLCs and Letters of Credit for export\n\nWe operate across 10 African countries. Visit /services to learn more.",
      suggestions: ['Membership options', 'Our services', 'Which countries?', 'Apply now'],
    };
  }

  // --- Membership ---
  if (/member|join|sign\s*up|register|tier|pricing|cost|how\s*much/.test(lowerMessage)) {
    return {
      text: "AFU offers five membership tiers:\n\n\u2022 **Smallholder** \u2014 $50/year \u2014 Platform access, training, AI advisory, market prices\n\u2022 **Commercial Bronze** \u2014 $500/year \u2014 Discounted inputs, market access, basic trade finance\n\u2022 **Commercial Gold** \u2014 $5,000/year \u2014 Equipment leasing, 15% insurance discounts, dedicated advisor\n\u2022 **Commercial Platinum** \u2014 $10,000+/year \u2014 Legal support, off-take priority, farm manager visits\n\u2022 **Partner/Vendor** \u2014 $2,500+/year \u2014 Directory listing, co-branded programs\n\nVisit /memberships for full details or /apply to get started.",
      suggestions: ['Apply now', 'Compare tiers', 'Contact us'],
    };
  }

  // --- Investment ---
  if (/invest|investor|return|roi|fund|capital|seed\s*round|equity/.test(lowerMessage)) {
    return {
      text: "AFU is raising a $500M seed round with three investor tiers:\n\n\u2022 **Seed Investor** ($1M min) \u2014 10% target annual return\n\u2022 **Growth Partner** ($10M min) \u2014 15% target return + board observer\n\u2022 **Strategic Partner** ($100M min) \u2014 20% target return + board seat + co-investment rights\n\nReturns paid quarterly via revenue participation notes.\n\nVisit /investors for the full opportunity, or /contact?subject=investor to request the investor pack.",
      suggestions: ['Investor page', 'Request investor pack', 'View demo'],
    };
  }

  // --- Sponsorship ---
  if (/sponsor|donate|support.*farmer|give|help.*farmer|philanthropy/.test(lowerMessage)) {
    return {
      text: "You can sponsor an African farmer directly through AFU. Your contribution covers their membership, inputs, and program access \u2014 and you'll receive monthly updates as their season unfolds.\n\nVisit /sponsor to meet our farmers and choose who to support. Every dollar makes a measurable difference.\n\n10% of all AFU profits go to community programs: Women in Agriculture, Feed a Child, and Young Farmers.",
      suggestions: ['Sponsor a farmer', 'Meet our farmers', 'Our impact'],
    };
  }

  // --- Insurance ---
  if (/insurance|insure|cover|protect|lloyd|risk/.test(lowerMessage)) {
    return {
      text: "AFU offers 10 insurance products underwritten by Lloyd's of London:\n\n\u2022 Crop Insurance\n\u2022 Livestock Insurance\n\u2022 Equipment Insurance\n\u2022 Farm Property Insurance\n\u2022 Trade Insurance\n\u2022 Life & Personal Insurance\n\u2022 Vehicle Insurance\n\u2022 Medical Insurance\n\u2022 Pension & Retirement\n\u2022 Asset Insurance\n\nVisit /services/insurance to explore all products.",
      suggestions: ['Crop insurance', 'All insurance products', 'Get a quote'],
    };
  }

  // --- Trade Finance ---
  if (/trade\s*finance|sblc|letter\s*of\s*credit|export|import|warehouse\s*receipt/.test(lowerMessage)) {
    return {
      text: "AFU provides trade finance via our banking partners:\n\n\u2022 **Standby Letters of Credit (SBLCs)** \u2014 Guarantee your export deals\n\u2022 **Documentary Credits** \u2014 Secure international trade payments\n\u2022 **Export Pre-Financing** \u2014 Capital before shipment\n\u2022 **Warehouse Receipt Finance** \u2014 Borrow against stored commodity\n\u2022 **Foreign Exchange** \u2014 Competitive rates across African currencies\n\nVisit /services/finance/trade-finance for details.",
      suggestions: ['Trade finance page', 'Apply now', 'Contact us'],
    };
  }

  // --- Countries ---
  if (/countr|where|africa|zimbabwe|uganda|kenya|nigeria|ghana|tanzania|zambia|mozambique|botswana|south\s*africa/.test(lowerMessage)) {
    return {
      text: "AFU operates across 10 African countries:\n\nZimbabwe (pilot), Uganda, Ghana, Kenya, Tanzania, Nigeria, Zambia, Mozambique, South Africa, and Botswana.\n\nEach country has a dedicated team, local partnerships, and country-specific programs. Zimbabwe is our flagship market with the blueberry export project and Watson & Fine showcase farm.\n\nVisit /countries to explore each market.",
      suggestions: ['Zimbabwe', 'Uganda', 'All countries', 'Our programs'],
    };
  }

  // --- Jobs ---
  if (/job|hire|work|career|employ|recruit|position|vacancy/.test(lowerMessage)) {
    return {
      text: "AFU runs an agricultural jobs marketplace connecting farmers with workers:\n\n\u2022 Seasonal harvest workers\n\u2022 Specialist positions (agronomists, vets, irrigation techs)\n\u2022 Permanent farm management roles\n\u2022 Equipment operators\n\u2022 Processing and quality inspection\n\nVisit /jobs to browse current openings or post a position.",
      suggestions: ['View jobs', 'Post a job', 'Contact us'],
    };
  }

  // --- Contact ---
  if (/contact|email|phone|reach|talk|speak|call/.test(lowerMessage)) {
    return {
      text: "You can reach AFU through:\n\n\u2022 **Contact Form** \u2014 /contact\n\u2022 **Investor Inquiries** \u2014 /contact?subject=investor\n\u2022 **Membership** \u2014 /apply\n\u2022 **Sponsorship** \u2014 /sponsor\n\nOur team responds within 24 hours.",
      suggestions: ['Contact form', 'Apply now', 'Investor inquiry'],
    };
  }

  // --- Thank you ---
  if (/thank|thanks|cheers|appreciate/.test(lowerMessage)) {
    return {
      text: "You're welcome! Is there anything else I can help you with?",
      suggestions: ['How does AFU work?', 'Membership options', 'Contact us'],
    };
  }

  // --- Goodbye ---
  if (/bye|goodbye|see\s*you|later|exit|quit/.test(lowerMessage)) {
    return {
      text: "Thanks for chatting with us! Visit /apply to join our farming family, or /contact if you need anything else. Let's grow together!",
      suggestions: ['Apply now'],
    };
  }

  // --- Default ---
  return {
    text: "I can help you learn about AFU. Here are some topics:\n\n\u2022 How AFU works\n\u2022 Membership tiers and pricing\n\u2022 Investment opportunities ($500M seed round)\n\u2022 Insurance products (Lloyd's of London)\n\u2022 Trade finance (SBLCs, Letters of Credit)\n\u2022 Our 10 African countries\n\u2022 Sponsoring a farmer\n\u2022 Jobs marketplace\n\nWhat would you like to know?",
    suggestions: ['How does AFU work?', 'Membership options', 'Investment opportunity', 'Insurance', 'Trade finance', 'Contact us'],
  };
}
