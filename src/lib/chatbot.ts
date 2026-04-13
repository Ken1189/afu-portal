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
    text: `Hi ${name}! I'm Amara, your AFU assistant. \ud83c\udf0d\n\nI can help you with membership, services, investment opportunities, and more.\n\nWhat would you like to know?`,
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
      text: "AFU is building Africa's integrated agriculture platform. We're developing services to connect farmers with what they need:\n\n\u2022 **Financing** \u2014 Working capital and input finance\n\u2022 **Inputs & Equipment** \u2014 Seeds, fertilizer, machinery\n\u2022 **Insurance** \u2014 Crop, livestock, and equipment cover (in development)\n\u2022 **Market Access** \u2014 Connecting farmers to buyers\n\u2022 **Training** \u2014 Capacity building and AI advisory\n\u2022 **Veterinary & Legal** \u2014 Professional support services\n\u2022 **Trade Finance** \u2014 SBLCs and Letters of Credit (operating model)\n\nWe operate across 20 African countries. Visit /services to learn more.",
      suggestions: ['Membership options', 'Our services', 'Which countries?', 'Apply now'],
    };
  }

  // --- Membership ---
  if (/member|join|sign\s*up|register|tier|pricing|cost|how\s*much/.test(lowerMessage)) {
    return {
      text: "AFU offers five membership tiers:\n\n\u2022 **Free** \u2014 Basic platform access\n\u2022 **Smallholder** \u2014 $4.99/month \u2014 For individual smallholder farmers\n\u2022 **Commercial** \u2014 $49/month \u2014 For commercial farming operations\n\u2022 **Enterprise** \u2014 $499/month \u2014 For large agribusinesses\n\u2022 **Partner** \u2014 By application \u2014 For suppliers and service providers\n\nVisit /memberships for full details or /apply to get started.",
      suggestions: ['Apply now', 'Compare tiers', 'Contact us'],
    };
  }

  // --- Investment ---
  if (/invest|investor|return|roi|fund|capital|seed\s*round|equity/.test(lowerMessage)) {
    return {
      text: "AFU is building Africa's integrated agriculture platform and welcomes conversations with mission-aligned investors.\n\nFor investment inquiries, please visit /contact?subject=investor or email info@africanfarmingunion.org and our team will share current opportunities directly.",
      suggestions: ['Contact us', 'Our services', 'Our countries'],
    };
  }

  // --- Sponsorship ---
  if (/sponsor|donate|support.*farmer|give|help.*farmer|philanthropy/.test(lowerMessage)) {
    return {
      text: "You can support African farmers through AFU's sponsorship programme. Contributions help cover membership, inputs, and programme access for smallholder farmers across our operating countries.\n\nVisit /sponsor to learn more, or /contact to get in touch with our team.",
      suggestions: ['Sponsor a farmer', 'Our countries', 'Contact us'],
    };
  }

  // --- Insurance ---
  if (/insurance|insure|cover|protect|lloyd|risk/.test(lowerMessage)) {
    return {
      text: "AFU is developing a range of insurance products for farmers, including crop, livestock, equipment, and farm property cover. These products are currently in development and we haven't announced an underwriter yet.\n\nVisit /services/insurance for updates, or /contact to register interest.",
      suggestions: ['Our services', 'Contact us', 'Apply now'],
    };
  }

  // --- Trade Finance ---
  if (/trade\s*finance|sblc|letter\s*of\s*credit|export|import|warehouse\s*receipt/.test(lowerMessage)) {
    return {
      text: "Trade finance is part of AFU's operating model. Instruments we're building toward include:\n\n\u2022 **Standby Letters of Credit (SBLCs)**\n\u2022 **Documentary Credits**\n\u2022 **Export Pre-Financing**\n\u2022 **Warehouse Receipt Finance**\n\nThese are offered as a model for how AFU will support farmers and agribusinesses. Visit /services or /contact for current status.",
      suggestions: ['Our services', 'Contact us', 'Apply now'],
    };
  }

  // --- Countries ---
  if (/countr|where|africa|zimbabwe|uganda|kenya|nigeria|ghana|tanzania|zambia|mozambique|botswana|south\s*africa|ethiopia/.test(lowerMessage)) {
    return {
      text: "AFU operates across 20 African countries:\n\nBotswana, Zimbabwe, Tanzania, Kenya, Nigeria, Zambia, Mozambique, South Africa, Ghana, Uganda, Sierra Leone, Egypt, Ethiopia, Malawi, Namibia, Republic of Guinea, Guinea-Bissau, Liberia, Mali, and Ivory Coast.\n\nWe're building local infrastructure and partnerships in each market. Visit /countries to learn more.",
      suggestions: ['Our services', 'Membership options', 'Contact us'],
    };
  }

  // --- Veterinary Services ---
  if (/vet|veterinar|animal\s*health|livestock\s*doctor/.test(lowerMessage)) {
    return {
      text: "AFU connects farmers with qualified veterinary professionals across Africa.\n\n\u2022 **Find a vet** \u2014 Browse our directory at /directory/vets\n\u2022 **Register as a vet** \u2014 Apply at /services/vet/apply to join our network\n\u2022 **Request vet services** \u2014 Farmers can submit service requests at /farm/service-requests\n\nOur vet network covers livestock health, vaccinations, breeding support, and emergency care.",
      suggestions: ['Find a vet', 'Apply as a vet', 'Our services', 'Contact us'],
    };
  }

  // --- Marketplace / Shop ---
  if (/marketplace|shop|buy.*seed|buy.*fertiliz|buy.*equipment|buy.*input|shop.*input/.test(lowerMessage)) {
    return {
      text: "AFU's Marketplace lets farmers buy seeds, fertilizer, pesticides, equipment, and more from verified suppliers.\n\n\u2022 **Browse marketplace** \u2014 /farm/marketplace (log in to access)\n\u2022 **Become a supplier** \u2014 /supplier/apply\n\nMembers get discounted prices on all products.",
      suggestions: ['Browse marketplace', 'Become a supplier', 'Membership options', 'Contact us'],
    };
  }

  // --- Exchange ---
  if (/exchange|credit.*trade|barter|swap.*goods|trade.*credit/.test(lowerMessage)) {
    return {
      text: "AFU's Exchange is a credit-based trading system where farmers can list surplus produce, equipment for hire, and storage space.\n\n\u2022 **Access exchange** \u2014 /farm/exchange (log in to access)\n\nBuy and sell using AFU credits \u2014 no cash needed.",
      suggestions: ['Access exchange', 'Marketplace', 'Our services', 'Contact us'],
    };
  }

  // --- Trading / Commodities ---
  if (/trad(e|er|ing)|commodit|grain\s*market|crop\s*market|sell.*crop|buy.*crop/.test(lowerMessage)) {
    return {
      text: "AFU's commodities trading platform connects farmers with verified traders and buyers.\n\n\u2022 **Sign up as a trader** \u2014 /commodities/signup\n\u2022 **Browse traders** \u2014 /directory/traders\n\u2022 **Offtake agreements** \u2014 /services/offtake/apply\n\nWhether you're buying or selling agricultural commodities, our platform provides transparent pricing and secure transactions.",
      suggestions: ['Sign up as trader', 'Find traders', 'Offtake services', 'Contact us'],
    };
  }

  // --- Offtake / Buyers ---
  if (/offtake|off-take|buyer|purchase.*crop|buying.*produce|procure/.test(lowerMessage)) {
    return {
      text: "AFU's offtake service guarantees farmers a market for their produce before harvest.\n\n\u2022 **Register as an offtaker** \u2014 /services/offtake/apply\n\u2022 **Browse offtakers** \u2014 /directory/offtakers\n\nOfftake agreements reduce risk for both farmers and buyers by locking in prices and quantities in advance.",
      suggestions: ['Apply as offtaker', 'Browse offtakers', 'Our services', 'Contact us'],
    };
  }

  // --- Processing / Milling ---
  if (/process|mill|packaging|value.?add|agro.?process|post.?harvest/.test(lowerMessage)) {
    return {
      text: "AFU's processing hub network adds value to raw agricultural commodities.\n\n\u2022 **Register your processing hub** \u2014 /services/processing/apply\n\u2022 **Browse processing hubs** \u2014 /directory/processing\n\nFrom milling and packaging to cold storage and drying, our network helps farmers access post-harvest services that increase the value of their produce.",
      suggestions: ['Register processing hub', 'Browse hubs', 'Our services', 'Contact us'],
    };
  }

  // --- Projects ---
  if (/project|submit.*project|proposal|grant/.test(lowerMessage)) {
    return {
      text: "AFU welcomes agricultural project submissions from across Africa.\n\n\u2022 **Submit a project** \u2014 /projects/submit\n\nWhether it's a new farming initiative, infrastructure project, or community programme, we review all submissions and connect viable projects with funding and support.",
      suggestions: ['Submit a project', 'Our services', 'Contact us'],
    };
  }

  // --- Service Directory ---
  if (/director|find\s*service|browse\s*service|search\s*provider|service\s*provider/.test(lowerMessage)) {
    return {
      text: "AFU's Service Directory lets you find verified agricultural service providers:\n\n\u2022 **Vets** \u2014 /directory/vets\n\u2022 **Traders** \u2014 /directory/traders\n\u2022 **Offtakers** \u2014 /directory/offtakers\n\u2022 **Processing hubs** \u2014 /directory/processing\n\u2022 **Full directory** \u2014 /directory\n\nAll providers are verified and rated by the AFU community.",
      suggestions: ['Browse directory', 'Our services', 'Contact us'],
    };
  }

  // --- Gallery ---
  if (/gallery|photo|picture|image/.test(lowerMessage)) {
    return {
      text: "Visit our Gallery at /gallery to see photos from AFU operations, farmer stories, events, and agricultural projects across Africa.",
      suggestions: ['View gallery', 'Our services', 'Contact us'],
    };
  }

  // --- Media / PR ---
  if (/media|press|pr\b|news|journalist|coverage/.test(lowerMessage)) {
    return {
      text: "For media inquiries, press releases, and AFU news coverage, visit /media.\n\nJournalists and media professionals can find press kits, recent coverage, and contact information for our communications team.",
      suggestions: ['Visit media page', 'Contact us', 'About AFU'],
    };
  }

  // --- Farmer Service Requests ---
  if (/service\s*request|request.*service|need.*help.*farm|farm.*help/.test(lowerMessage)) {
    return {
      text: "Farmers can submit service requests directly through the platform at /farm/service-requests.\n\nRequest help with:\n\u2022 Veterinary care\n\u2022 Equipment hire\n\u2022 Input delivery\n\u2022 Technical advisory\n\u2022 Processing services\n\nOur team matches your request with verified service providers in your area.",
      suggestions: ['Submit request', 'Browse directory', 'Our services', 'Contact us'],
    };
  }

  // --- Jobs ---
  if (/job|hire|work|career|employ|recruit|position|vacancy|talent/.test(lowerMessage)) {
    return {
      text: "AFU runs an agricultural jobs marketplace connecting farmers with workers:\n\n\u2022 Seasonal harvest workers\n\u2022 Specialist positions (agronomists, vets, irrigation techs)\n\u2022 Permanent farm management roles\n\u2022 Equipment operators\n\u2022 Processing and quality inspection\n\n\u2022 **Browse jobs** \u2014 /jobs\n\u2022 **Apply for roles** \u2014 /jobs/apply\n\nVisit /jobs to browse current openings or post a position.",
      suggestions: ['View jobs', 'Apply now', 'Post a job', 'Contact us'],
    };
  }

  // --- Contact ---
  if (/contact|email|phone|reach|talk|speak|call/.test(lowerMessage)) {
    return {
      text: "You can reach AFU through:\n\n\u2022 **Email** \u2014 info@africanfarmingunion.org\n\u2022 **Twitter** \u2014 @UnionAfric82069\n\u2022 **Contact Form** \u2014 /contact\n\u2022 **Membership** \u2014 /apply\n\u2022 **Sponsorship** \u2014 /sponsor\n\nOur team aims to respond within 1-2 business days.",
      suggestions: ['Contact form', 'Apply now', 'Membership options'],
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
    text: "I can help you learn about AFU. Here are some topics:\n\n\u2022 How AFU works\n\u2022 Membership tiers and pricing\n\u2022 Our services (financing, insurance, training, market access)\n\u2022 Trade finance model\n\u2022 Service directory (vets, traders, offtakers, processing hubs)\n\u2022 Commodities trading\n\u2022 Jobs and talent marketplace\n\u2022 Submit a project\n\u2022 Our 20 operating countries across Africa\n\u2022 Sponsoring a farmer\n\u2022 Gallery and media\n\nWhat would you like to know?",
    suggestions: ['How does AFU work?', 'Membership options', 'Browse directory', 'Our countries', 'Contact us'],
  };
}
