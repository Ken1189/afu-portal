'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Bot,
  SendHorizontal,
  Camera,
  AlertTriangle,
  Lightbulb,
  Sun,
  DollarSign,
  Sprout,
  Bug,
  Calendar,
  Droplets,
  User,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// ---------------------------------------------------------------------------
// Types (inlined from @/lib/data/farm)
// ---------------------------------------------------------------------------

type WeatherCondition = 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy' | 'windy';

interface WeatherDay {
  date: string;
  day: string;
  condition: WeatherCondition;
  tempHigh: number;
  tempLow: number;
  humidity: number;
  rainChance: number;
  windSpeed: number;
  advice: string;
}

interface FarmPlot {
  id: string;
  name: string;
  size: number;
  sizeUnit: 'hectares' | 'acres';
  crop: string;
  variety: string;
  stage: string;
  plantingDate: string;
  expectedHarvest: string;
  daysToHarvest: number;
  progressPercent: number;
  healthScore: number;
  lastActivity: string;
  activities: unknown[];
  image: string;
  soilPH: number;
  location: string;
}

interface FarmTransaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
}

interface FarmTask {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: 'text' | 'image' | 'recommendation' | 'alert';
}

// ---------------------------------------------------------------------------
// Inline fallback data (from @/lib/data/farm)
// ---------------------------------------------------------------------------

const farmPlots: FarmPlot[] = [
  { id: 'PLT-001', name: 'Main Blueberry Field', size: 1.5, sizeUnit: 'hectares', crop: 'Blueberries', variety: 'Duke', stage: 'fruiting', plantingDate: '2025-09-15', expectedHarvest: '2026-04-10', daysToHarvest: 27, progressPercent: 78, healthScore: 92, lastActivity: '2026-03-12', activities: [], image: 'https://images.unsplash.com/photo-1498579809087-ef1e558fd1da?w=400&h=300&fit=crop', soilPH: 4.8, location: 'Plot A \u2014 North Field' },
  { id: 'PLT-002', name: 'Cassava Plot', size: 2.0, sizeUnit: 'hectares', crop: 'Cassava', variety: 'TMS 30572', stage: 'vegetative', plantingDate: '2025-12-01', expectedHarvest: '2026-09-30', daysToHarvest: 200, progressPercent: 35, healthScore: 78, lastActivity: '2026-03-10', activities: [], image: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=400&h=300&fit=crop', soilPH: 6.2, location: 'Plot B \u2014 South Field' },
  { id: 'PLT-003', name: 'Sesame Strip', size: 0.8, sizeUnit: 'hectares', crop: 'Sesame', variety: 'S42 White', stage: 'flowering', plantingDate: '2025-11-20', expectedHarvest: '2026-04-25', daysToHarvest: 42, progressPercent: 65, healthScore: 85, lastActivity: '2026-03-11', activities: [], image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&h=300&fit=crop', soilPH: 6.8, location: 'Plot C \u2014 East Strip' },
  { id: 'PLT-004', name: 'Maize Field', size: 1.0, sizeUnit: 'hectares', crop: 'Maize', variety: 'SC 513', stage: 'planted', plantingDate: '2026-03-01', expectedHarvest: '2026-07-15', daysToHarvest: 123, progressPercent: 8, healthScore: 95, lastActivity: '2026-03-01', activities: [], image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop', soilPH: 6.5, location: 'Plot D \u2014 West Field' },
];

const farmTransactions: FarmTransaction[] = [
  { id: 'TXN-001', type: 'income', category: 'harvest-sale', amount: 960, currency: 'USD', date: '2026-03-07', description: 'Blueberries 120kg @ $8/kg' },
  { id: 'TXN-002', type: 'income', category: 'contract-payment', amount: 500, currency: 'USD', date: '2026-03-01', description: 'Advance payment' },
  { id: 'TXN-003', type: 'expense', category: 'fertilizer', amount: 45, currency: 'USD', date: '2026-03-12', description: 'Sulfur-based soil acidifier' },
  { id: 'TXN-004', type: 'expense', category: 'labor', amount: 36, currency: 'USD', date: '2026-03-10', description: 'Weeding labor' },
  { id: 'TXN-005', type: 'expense', category: 'pesticides', amount: 18, currency: 'USD', date: '2026-03-11', description: 'Neem oil' },
  { id: 'TXN-006', type: 'expense', category: 'seeds', amount: 85, currency: 'USD', date: '2026-03-01', description: 'Maize seed' },
  { id: 'TXN-007', type: 'expense', category: 'fertilizer', amount: 90, currency: 'USD', date: '2026-03-05', description: 'NPK fertilizer' },
  { id: 'TXN-008', type: 'expense', category: 'equipment', amount: 15, currency: 'USD', date: '2026-03-03', description: 'Soil pH testing' },
  { id: 'TXN-009', type: 'income', category: 'subsidy', amount: 200, currency: 'USD', date: '2026-02-28', description: 'AFU member input subsidy' },
  { id: 'TXN-010', type: 'expense', category: 'transport', amount: 25, currency: 'USD', date: '2026-03-07', description: 'Transport blueberries' },
  { id: 'TXN-011', type: 'income', category: 'harvest-sale', amount: 180, currency: 'USD', date: '2026-02-22', description: 'Cassava chips 300kg' },
  { id: 'TXN-012', type: 'expense', category: 'labor', amount: 48, currency: 'USD', date: '2026-02-20', description: 'Harvesting labor' },
];

const farmTasks: FarmTask[] = [
  { id: 'TSK-001', title: 'Harvest blueberries', priority: 'high', completed: false },
  { id: 'TSK-002', title: 'Apply foliar feed to sesame', priority: 'medium', completed: false },
  { id: 'TSK-003', title: 'Scout cassava for mosaic virus', priority: 'high', completed: false },
  { id: 'TSK-004', title: 'Irrigate maize field', priority: 'medium', completed: false },
  { id: 'TSK-005', title: 'Check soil moisture sensors', priority: 'low', completed: false },
  { id: 'TSK-006', title: 'Weed between cassava rows', priority: 'medium', completed: false },
];

const weatherForecast: WeatherDay[] = [
  { date: '2026-03-14', day: 'Today', condition: 'partly-cloudy', tempHigh: 31, tempLow: 18, humidity: 55, rainChance: 15, windSpeed: 12, advice: 'Good day for harvesting. Apply pesticides before noon.' },
  { date: '2026-03-15', day: 'Sun', condition: 'sunny', tempHigh: 33, tempLow: 19, humidity: 45, rainChance: 5, windSpeed: 8, advice: 'Hot day ahead. Ensure irrigation is running. Harvest early morning.' },
  { date: '2026-03-16', day: 'Mon', condition: 'partly-cloudy', tempHigh: 30, tempLow: 17, humidity: 60, rainChance: 25, windSpeed: 15, advice: 'Good conditions for foliar feeding.' },
  { date: '2026-03-17', day: 'Tue', condition: 'rainy', tempHigh: 26, tempLow: 16, humidity: 80, rainChance: 75, windSpeed: 20, advice: 'Rain expected. Do not spray. Check drainage channels.' },
  { date: '2026-03-18', day: 'Wed', condition: 'rainy', tempHigh: 24, tempLow: 15, humidity: 85, rainChance: 80, windSpeed: 18, advice: 'Continued rain. Monitor for waterlogging in cassava plot.' },
  { date: '2026-03-19', day: 'Thu', condition: 'cloudy', tempHigh: 27, tempLow: 16, humidity: 70, rainChance: 35, windSpeed: 14, advice: 'Clearing skies. Good day for scouting and weeding.' },
  { date: '2026-03-20', day: 'Fri', condition: 'sunny', tempHigh: 32, tempLow: 18, humidity: 50, rainChance: 10, windSpeed: 10, advice: 'Warm and dry. Resume normal spraying schedule.' },
];

const aiConversation: AIMessage[] = [
  { id: 'AI-001', role: 'assistant', content: 'Good morning! \uD83C\uDF31 I see your blueberries are 27 days from harvest. Rows 5-8 look ready for picking tomorrow. Would you like me to set a reminder?', timestamp: '2026-03-14T06:00:00', type: 'recommendation' },
  { id: 'AI-002', role: 'user', content: 'Yes please. Also when should I spray the sesame?', timestamp: '2026-03-14T06:01:00', type: 'text' },
  { id: 'AI-003', role: 'assistant', content: 'Reminder set for tomorrow 6:00 AM! \uD83D\uDD14\n\nFor your sesame \u2014 I recommend spraying copper oxychloride today before noon. Rain is expected on Tuesday so you want at least 24 hours of dry weather after application. The leaf spot I detected last week has not spread, which is good news.', timestamp: '2026-03-14T06:01:30', type: 'recommendation' },
  { id: 'AI-004', role: 'user', content: 'How much fertilizer do I need for the cassava?', timestamp: '2026-03-14T06:05:00', type: 'text' },
  { id: 'AI-005', role: 'assistant', content: 'For your 2-hectare cassava plot (TMS 30572 variety), I recommend:\n\n\uD83D\uDCCA **NPK 15-15-15**: 400kg total (200kg/ha)\n\uD83D\uDCCA **Urea top-dress**: 200kg total (100kg/ha) \u2014 apply at 8 weeks\n\nYou already applied the NPK on March 5. The urea top-dress is due around March 26. That will cost approximately $76 for the urea.\n\nShall I add this to your calendar?', timestamp: '2026-03-14T06:05:30', type: 'recommendation' },
];

function getFarmSummary() {
  const totalIncome = farmTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = farmTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const profit = totalIncome - totalExpenses;
  const totalHectares = farmPlots.reduce((sum, p) => sum + p.size, 0);
  const avgHealthScore = Math.round(farmPlots.reduce((sum, p) => sum + p.healthScore, 0) / farmPlots.length);
  const pendingTasks = farmTasks.filter(t => !t.completed).length;
  const highPriorityTasks = farmTasks.filter(t => !t.completed && t.priority === 'high').length;
  return { totalIncome, totalExpenses, profit, totalHectares, avgHealthScore, pendingTasks, highPriorityTasks, plotCount: farmPlots.length };
}

// ---------------------------------------------------------------------------
// Animation Variants
// ---------------------------------------------------------------------------

const messageVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

const chipContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      ease: 'easeOut' as const,
    },
  },
};

const chipVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 20,
    },
  },
};

const typingDotVariants = {
  bounce: (i: number) => ({
    y: [0, -8, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut' as const,
      delay: i * 0.15,
    },
  }),
};

// ---------------------------------------------------------------------------
// Quick Suggestion Chips Icons (labels come from translations)
// ---------------------------------------------------------------------------

const quickSuggestionIcons = [Sun, Sprout, DollarSign, Bug, Calendar, Droplets];

// ---------------------------------------------------------------------------
// Mock AI Response Generator
// ---------------------------------------------------------------------------

function generateMockResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  const today = weatherForecast[0];
  const summary = getFarmSummary();

  if (lower.includes('weather')) {
    const conditionLabel =
      today.condition === 'partly-cloudy'
        ? 'Partly Cloudy'
        : today.condition.charAt(0).toUpperCase() + today.condition.slice(1);
    return (
      `Here's today's weather for your farm:\n\n` +
      `**${conditionLabel}** | ${today.tempHigh}°C / ${today.tempLow}°C\n` +
      `- Humidity: ${today.humidity}%\n` +
      `- Rain chance: ${today.rainChance}%\n` +
      `- Wind: ${today.windSpeed} km/h\n\n` +
      `**Advice:** ${today.advice}`
    );
  }

  if (lower.includes('crop') || lower.includes('check')) {
    const lines = farmPlots.map(
      (p) =>
        `- **${p.crop}** (${p.name}): Health ${p.healthScore}/100 | Stage: ${p.stage} | ${p.daysToHarvest} days to harvest`
    );
    return `Here's your crop overview:\n\n${lines.join('\n')}\n\nOverall farm health: **${summary.avgHealthScore}/100**. Your blueberries are closest to harvest!`;
  }

  if (lower.includes('profit') || lower.includes('money') || lower.includes('income')) {
    return (
      `Here's your farm financial summary:\n\n` +
      `- **Total Income:** $${summary.totalIncome.toLocaleString()}\n` +
      `- **Total Expenses:** $${summary.totalExpenses.toLocaleString()}\n` +
      `- **Net Profit:** $${summary.profit.toLocaleString()}\n\n` +
      `You're managing ${summary.plotCount} plots across ${summary.totalHectares} hectares. Your blueberry sales are your top earner this month!`
    );
  }

  if (lower.includes('pest')) {
    return (
      `Here are some pest management tips for your crops:\n\n` +
      `- **Blueberries:** Monitor for aphids, especially on new growth. Neem oil works well as organic control.\n` +
      `- **Cassava:** Watch for whitefly (cassava mosaic vector). Remove affected plants immediately.\n` +
      `- **Sesame:** Cercospora leaf spot detected — apply copper oxychloride before rain.\n` +
      `- **Maize:** Scout for fall armyworm. Early detection is key.\n\n` +
      `**Tip:** Always spray in calm weather, early morning or late afternoon for best results.`
    );
  }

  if (lower.includes('today') || lower.includes('should i do') || lower.includes('task')) {
    return (
      `Here's your plan for today:\n\n` +
      `- **Harvest blueberries** (Rows 5-8) — High priority\n` +
      `- **Scout cassava** for mosaic virus — High priority\n` +
      `- **Irrigate maize field** — Medium priority\n\n` +
      `**Weather note:** ${today.advice}\n\n` +
      `You have **${summary.pendingTasks} tasks** pending, including **${summary.highPriorityTasks} high-priority** items. Let's get them done!`
    );
  }

  if (lower.includes('irrig') || lower.includes('water')) {
    const rainyDays = weatherForecast.filter((d) => d.rainChance >= 60);
    return (
      `Based on the 7-day forecast, here's your irrigation plan:\n\n` +
      `- **Today:** ${today.rainChance < 30 ? 'Irrigate maize and cassava plots — low rain chance' : 'Hold off — rain expected'}\n` +
      `- **Tomorrow:** ${weatherForecast[1].rainChance < 30 ? 'Normal irrigation schedule' : 'Reduce watering — rain likely'}\n` +
      `- **Rainy days ahead:** ${rainyDays.length > 0 ? rainyDays.map((d) => d.day).join(', ') + ' — no irrigation needed' : 'None in forecast — maintain regular schedule'}\n\n` +
      `**Tip:** Your blueberries need consistent moisture during fruiting. Drip irrigation at 2-hour cycles works best.`
    );
  }

  return (
    `I'm here to help with anything about your farm! You can ask me about:\n\n` +
    `- Weather and forecasts\n` +
    `- Crop health and management\n` +
    `- Financial summaries\n` +
    `- Pest and disease advice\n` +
    `- Task planning and scheduling\n` +
    `- Irrigation recommendations\n\n` +
    `Just type your question or tap one of the quick suggestions below!`
  );
}

// ---------------------------------------------------------------------------
// Markdown-like Renderer
// ---------------------------------------------------------------------------

function renderContent(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    if (line.trim() === '') {
      elements.push(<div key={`br-${lineIdx}`} className="h-2" />);
      return;
    }

    const isBullet = /^[-*]\s+/.test(line.trim());

    if (isBullet) {
      const bulletContent = line.trim().replace(/^[-*]\s+/, '');
      elements.push(
        <div key={`li-${lineIdx}`} className="flex items-start gap-1.5 ml-1 mb-0.5">
          <span className="text-teal mt-0.5 shrink-0 text-[10px]">{'\u2022'}</span>
          <span>{renderInlineFormatting(bulletContent)}</span>
        </div>
      );
      return;
    }

    elements.push(
      <p key={`p-${lineIdx}`} className="mb-0.5">
        {renderInlineFormatting(line)}
      </p>
    );
  });

  return elements;
}

function renderInlineFormatting(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <strong key={`bold-${match.index}`} className="font-semibold">
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

// ---------------------------------------------------------------------------
// Typing Indicator Component
// ---------------------------------------------------------------------------

function TypingIndicator() {
  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="flex items-end gap-2 mb-3"
    >
      {/* Avatar */}
      <div className="w-7 h-7 rounded-full bg-teal/10 flex items-center justify-center shrink-0">
        <Bot size={14} className="text-teal" />
      </div>

      {/* Typing bubble */}
      <div className="bg-teal/5 border-l-2 border-teal rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              custom={i}
              variants={typingDotVariants}
              animate="bounce"
              className="w-2 h-2 rounded-full bg-teal/50"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Chat Message Component
// ---------------------------------------------------------------------------

function ChatMessage({ message }: { message: AIMessage }) {
  const { t } = useLanguage();
  const isAssistant = message.role === 'assistant';
  const isRecommendation = message.type === 'recommendation';
  const isAlert = message.type === 'alert';

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className={`flex ${isAssistant ? 'items-end gap-2' : 'justify-end'} mb-3`}
    >
      {/* Assistant avatar */}
      {isAssistant && (
        <div className="w-7 h-7 rounded-full bg-teal/10 flex items-center justify-center shrink-0">
          <Bot size={14} className="text-teal" />
        </div>
      )}

      {/* Message bubble */}
      <div
        className={`max-w-[85%] sm:max-w-md ${
          isAssistant
            ? 'order-2'
            : 'order-1'
        }`}
      >
        {/* Label */}
        {isAssistant && (
          <div className="flex items-center gap-1.5 mb-1 ml-1">
            <Sparkles size={10} className="text-teal" />
            <span className="text-[11px] font-semibold text-teal">{t.aiAssistant.title}</span>
          </div>
        )}

        {/* Bubble content */}
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
            isAssistant
              ? isAlert
                ? 'bg-amber-50 border border-amber-200 rounded-bl-md'
                : isRecommendation
                  ? 'bg-teal/5 border-l-2 border-teal rounded-bl-md'
                  : 'bg-teal/5 border-l-2 border-teal rounded-bl-md'
              : 'bg-navy text-white rounded-br-md'
          }`}
        >
          {/* Special header for recommendation */}
          {isRecommendation && isAssistant && (
            <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-teal/10">
              <Lightbulb size={13} className="text-gold" />
              <span className="text-[11px] font-bold text-teal">Recommendation</span>
            </div>
          )}

          {/* Special header for alert */}
          {isAlert && isAssistant && (
            <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-amber-200">
              <AlertTriangle size={13} className="text-amber-500" />
              <span className="text-[11px] font-bold text-amber-600">Alert</span>
            </div>
          )}

          {/* Message content */}
          <div className={isAssistant ? 'text-gray-700' : 'text-white'}>
            {renderContent(message.content)}
          </div>
        </div>

        {/* Timestamp */}
        <p
          className={`text-[11px] mt-1 ${
            isAssistant ? 'text-gray-400 ml-1' : 'text-gray-400 text-right mr-1'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {/* User avatar */}
      {!isAssistant && (
        <div className="w-7 h-7 rounded-full bg-navy/10 flex items-center justify-center shrink-0 order-2">
          <User size={14} className="text-navy" />
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function AssistantPage() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<AIMessage[]>(() => [...aiConversation]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build quick suggestions from translations
  const quickSuggestions = [
    t.aiAssistant.weatherToday,
    t.aiAssistant.checkCrops,
    t.aiAssistant.farmProfit,
    t.aiAssistant.pestAdvice,
    t.aiAssistant.whatToDoToday,
    t.aiAssistant.irrigation,
  ].map((label, i) => ({ label, icon: quickSuggestionIcons[i] }));

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Send a message (from input or chip)
  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || isTyping) return;

      const userMessage: AIMessage = {
        id: `USR-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        timestamp: new Date().toISOString(),
        type: 'text',
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue('');
      setIsTyping(true);

      // Simulate AI response after 1-2s delay
      const delay = 1000 + Math.random() * 1000;
      setTimeout(() => {
        const responseContent = generateMockResponse(text);

        // Determine type based on content
        let responseType: AIMessage['type'] = 'text';
        const lower = text.toLowerCase();
        if (
          lower.includes('weather') ||
          lower.includes('crop') ||
          lower.includes('profit') ||
          lower.includes('pest') ||
          lower.includes('today') ||
          lower.includes('irrig') ||
          lower.includes('water')
        ) {
          responseType = 'recommendation';
        }

        const aiMessage: AIMessage = {
          id: `AI-${Date.now()}`,
          role: 'assistant',
          content: responseContent,
          timestamp: new Date().toISOString(),
          type: responseType,
        };

        setIsTyping(false);
        setMessages((prev) => [...prev, aiMessage]);
      }, delay);
    },
    [isTyping]
  );

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  // Handle chip tap
  const handleChipTap = (label: string) => {
    sendMessage(label);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-52px-72px)] bg-gray-50">
      {/* ─── Header Enhancement ─── */}
      <div className="bg-white border-b border-gray-100 px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8CB89C] to-[#729E82] flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-navy">{t.aiAssistant.title}</span>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-gray-400">
              {t.aiAssistant.poweredBy} &middot; {t.aiAssistant.online}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Chat Messages Area ─── */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 pt-4 pb-2 scrollbar-hide"
      >
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        <AnimatePresence>{isTyping && <TypingIndicator />}</AnimatePresence>

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* ─── Quick Suggestion Chips ─── */}
      <motion.div
        variants={chipContainerVariants}
        initial="hidden"
        animate="visible"
        className="px-4 py-2 border-t border-gray-100 bg-white/80 backdrop-blur-sm"
      >
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {quickSuggestions.map((chip) => (
            <motion.button
              key={chip.label}
              variants={chipVariants}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleChipTap(chip.label)}
              disabled={isTyping}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-gray-200 text-[12px] font-medium text-gray-600 active:bg-gray-50 active:border-teal/30 active:scale-95 transition-all disabled:opacity-50 min-h-[36px]"
            >
              <span className="whitespace-nowrap">{chip.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ─── Input Area ─── */}
      <div className="bg-white border-t border-gray-100 px-3 py-2.5 safe-area-bottom">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Camera button */}
          <button
            type="button"
            className="shrink-0 w-11 h-11 flex items-center justify-center rounded-full text-gray-400 active:bg-gray-100 transition-colors"
            aria-label="Send crop photo"
          >
            <Camera size={22} />
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t.aiAssistant.askAnything}
              className="w-full h-11 px-4 pr-3 rounded-full bg-gray-50 border border-gray-200 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/30 transition-all"
              disabled={isTyping}
            />
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="shrink-0 w-11 h-11 flex items-center justify-center rounded-full bg-teal text-white active:bg-teal-dark disabled:opacity-40 disabled:active:bg-teal transition-all"
            aria-label="Send message"
          >
            <SendHorizontal size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
