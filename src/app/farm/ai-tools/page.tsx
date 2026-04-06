'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/supabase/auth-context';
import FeatureGate from '@/components/ui/FeatureGate';
import { useMembershipTier } from '@/lib/membership-context';
import {
  Brain,
  Camera,
  TrendingUp,
  LineChart,
  Layers,
  Droplets,
  Bug,
  Calculator,
  CalendarDays,
  Upload,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Zap,
  Shield,
  Loader2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Animation Variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      ease: 'easeOut' as const,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const expandVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.2 },
  },
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AITool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}

// ---------------------------------------------------------------------------
// Shared AI helper — calls the real /api/ai/chat endpoint
// ---------------------------------------------------------------------------

async function callAI(message: string): Promise<string> {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context: 'farm_ai_tools' }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to get AI response');
  }

  const data = await res.json();
  return data.response || 'No response received. Please try again.';
}

async function callAIWithImage(message: string, imageBase64: string): Promise<string> {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, image: imageBase64, context: 'farm_ai_tools' }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to get AI response');
  }

  const data = await res.json();
  return data.response || 'No response received. Please try again.';
}

// ---------------------------------------------------------------------------
// Reusable AI Response display
// ---------------------------------------------------------------------------

function AIResponseDisplay({
  response,
  loading,
  error,
  onReset,
  resetLabel,
  accentColor = 'green',
}: {
  response: string | null;
  loading: boolean;
  error: string | null;
  onReset: () => void;
  resetLabel: string;
  accentColor?: string;
}) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className={`w-10 h-10 text-${accentColor}-600 mx-auto mb-3 animate-spin`} />
        <p className="text-sm font-medium text-[#1B2A4A]">Analyzing with Amara AI...</p>
        <p className="text-xs text-gray-400 mt-1">This may take a few seconds</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h4 className="font-semibold text-red-800 text-sm">Unable to get AI analysis</h4>
          </div>
          <p className="text-sm text-red-700">{error}</p>
          <p className="text-xs text-gray-500 mt-2">
            For immediate help, contact our support team or visit the AFU AI Chat for expert advice.
          </p>
        </div>
        <button
          onClick={onReset}
          className="w-full py-2 text-sm text-gray-500 hover:text-[#1B2A4A] transition-colors"
        >
          {resetLabel}
        </button>
      </div>
    );
  }

  if (response) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <div className={`bg-${accentColor}-50 border border-${accentColor}-200 rounded-xl p-4`}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className={`w-4 h-4 text-${accentColor}-600`} />
            <h4 className={`text-sm font-semibold text-${accentColor}-800`}>Amara AI Analysis</h4>
          </div>
          <div className="prose prose-sm max-w-none text-[#1B2A4A] text-sm leading-relaxed whitespace-pre-wrap">
            {response}
          </div>
        </div>
        <button
          onClick={onReset}
          className="w-full py-2 text-sm text-gray-500 hover:text-[#1B2A4A] transition-colors"
        >
          {resetLabel}
        </button>
      </motion.div>
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// Tool data
// ---------------------------------------------------------------------------

const aiTools: AITool[] = [
  {
    id: 'crop-doctor',
    name: 'Crop Doctor AI',
    description: 'Upload a photo or describe symptoms to diagnose crop diseases',
    icon: Camera,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    id: 'yield-predictor',
    name: 'Yield Predictor',
    description: 'Predict harvest yields based on farm conditions',
    icon: TrendingUp,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'price-forecaster',
    name: 'Market Price Forecaster',
    description: 'AI-powered commodity price analysis',
    icon: LineChart,
    color: 'text-[#D4A843]',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    id: 'soil-analyzer',
    name: 'Soil Analyzer',
    description: 'Smart fertilizer and soil amendment recommendations',
    icon: Layers,
    color: 'text-amber-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    id: 'irrigation-scheduler',
    name: 'Irrigation Scheduler',
    description: 'Optimize water usage with AI scheduling',
    icon: Droplets,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
  },
  {
    id: 'pest-alert',
    name: 'Pest Alert System',
    description: 'AI-powered pest risk analysis for your region',
    icon: Bug,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  {
    id: 'credit-score',
    name: 'Credit Score Advisor',
    description: 'Get AI advice on agricultural credit eligibility',
    icon: Calculator,
    color: 'text-[#8CB89C]',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
  },
  {
    id: 'farm-planner',
    name: 'Farm Planner',
    description: 'Generate optimal crop calendars',
    icon: CalendarDays,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
];

// ---------------------------------------------------------------------------
// Tool Content Components — all wired to real AI backend
// ---------------------------------------------------------------------------

function CropDoctorContent() {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!symptoms.trim() && !imagePreview) return;
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const prompt = `As the Crop Doctor AI, analyze the following crop issue and provide:
1. Likely disease or problem identification
2. Severity assessment (low / moderate / severe)
3. Recommended treatment (both organic and chemical options)
4. Prevention advice for the future

${symptoms ? `Farmer's description of symptoms: ${symptoms}` : 'The farmer has uploaded a photo of their crop for analysis.'}`;

      let result: string;
      if (imagePreview) {
        result = await callAIWithImage(prompt, imagePreview);
      } else {
        result = await callAI(prompt);
      }
      setResponse(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResponse(null);
    setError(null);
    setSymptoms('');
    setImagePreview(null);
  };

  if (loading || response || error) {
    return (
      <AIResponseDisplay
        response={response}
        loading={loading}
        error={error}
        onReset={handleReset}
        resetLabel="Scan another crop"
        accentColor="green"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Describe the symptoms you see</label>
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="e.g. Yellow spots on maize leaves, browning at the edges, plants wilting..."
          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-green-200 resize-none"
          rows={3}
        />
      </div>

      <div className="border-2 border-dashed border-green-200 rounded-xl p-4 text-center bg-green-50/50">
        <Upload className="w-8 h-8 text-green-400 mx-auto mb-2" />
        {imagePreview ? (
          <div className="space-y-2">
            <p className="text-xs text-green-700 font-medium">Photo uploaded</p>
            <button
              onClick={() => setImagePreview(null)}
              className="text-xs text-gray-500 hover:text-red-500 transition-colors"
            >
              Remove photo
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-500">Optional: upload a crop photo for visual analysis</p>
            <label className="mt-2 inline-block px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium cursor-pointer hover:bg-green-200 transition-colors">
              Choose Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </>
        )}
      </div>

      <button
        onClick={handleAnalyze}
        disabled={!symptoms.trim() && !imagePreview}
        className="w-full py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles className="w-4 h-4" />
        Analyze with AI
      </button>
    </div>
  );
}

function YieldPredictorContent() {
  const [crop, setCrop] = useState('Maize');
  const [hectares, setHectares] = useState('10');
  const [soilType, setSoilType] = useState('Loamy');
  const [irrigation, setIrrigation] = useState('Drip');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const prompt = `As a Yield Predictor AI for African agriculture, provide a yield estimate for the following farm setup:
- Crop: ${crop}
- Farm size: ${hectares} hectares
- Soil type: ${soilType}
- Irrigation method: ${irrigation}

Please provide:
1. Estimated yield in tonnes per hectare
2. A realistic confidence range
3. How this compares to the regional average for this crop in Southern/East Africa
4. Key factors that could improve or reduce yield
5. Any specific recommendations for this combination of crop, soil, and irrigation

Be realistic and practical in your estimates.`;

      const result = await callAI(prompt);
      setResponse(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || response || error) {
    return (
      <AIResponseDisplay
        response={response}
        loading={loading}
        error={error}
        onReset={() => { setResponse(null); setError(null); }}
        resetLabel="Run another prediction"
        accentColor="blue"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Crop</label>
          <select value={crop} onChange={(e) => setCrop(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-blue-200">
            <option>Maize</option>
            <option>Sorghum</option>
            <option>Wheat</option>
            <option>Sunflower</option>
            <option>Groundnuts</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Hectares</label>
          <input type="number" value={hectares} onChange={(e) => setHectares(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Soil Type</label>
          <select value={soilType} onChange={(e) => setSoilType(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-blue-200">
            <option>Loamy</option>
            <option>Sandy</option>
            <option>Clay</option>
            <option>Silty</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Irrigation</label>
          <select value={irrigation} onChange={(e) => setIrrigation(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-blue-200">
            <option>Drip</option>
            <option>Sprinkler</option>
            <option>Flood</option>
            <option>Rainfed</option>
          </select>
        </div>
      </div>
      <button onClick={handlePredict} className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4" />
        Predict Yield with AI
      </button>
    </div>
  );
}

function PriceForecasterContent() {
  const [commodity, setCommodity] = useState('Maize');
  const [country, setCountry] = useState('Botswana');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleForecast = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const prompt = `As a Market Price Forecaster AI for African agriculture, provide price analysis for:
- Commodity: ${commodity}
- Country/Region: ${country}

Please provide:
1. General current market price context for ${commodity} in ${country}
2. Key factors affecting price trends (seasonal patterns, regional demand, global markets)
3. Short-term outlook and what farmers should watch for
4. Whether it might be a good time to sell, hold, or wait — and why
5. Any relevant market risks or opportunities

Note: Provide general market intelligence and analysis. Emphasize that actual prices vary by local market and that farmers should check current local prices before making decisions.`;

      const result = await callAI(prompt);
      setResponse(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || response || error) {
    return (
      <AIResponseDisplay
        response={response}
        loading={loading}
        error={error}
        onReset={() => { setResponse(null); setError(null); }}
        resetLabel="Check another commodity"
        accentColor="amber"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Commodity</label>
          <select value={commodity} onChange={(e) => setCommodity(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-amber-200">
            <option>Maize</option>
            <option>Wheat</option>
            <option>Sorghum</option>
            <option>Soybeans</option>
            <option>Sunflower</option>
            <option>Cotton</option>
            <option>Beef</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Country</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-amber-200">
            <option>Botswana</option>
            <option>Zimbabwe</option>
            <option>Tanzania</option>
            <option>Kenya</option>
            <option>Nigeria</option>
            <option>South Africa</option>
            <option>Ghana</option>
            <option>Zambia</option>
            <option>Mozambique</option>
          </select>
        </div>
      </div>
      <button onClick={handleForecast} className="w-full py-2.5 bg-[#D4A843] text-white rounded-xl text-sm font-medium hover:bg-[#c49a3a] transition-colors flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4" />
        Get AI Analysis
      </button>
    </div>
  );
}

function SoilAnalyzerContent() {
  const [ph, setPh] = useState('5.2');
  const [nitrogen, setNitrogen] = useState('28');
  const [phosphorus, setPhosphorus] = useState('15');
  const [potassium, setPotassium] = useState('180');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const prompt = `As a Soil Analyzer AI for African agriculture, analyze these soil test results and provide recommendations:
- pH Level: ${ph}
- Nitrogen: ${nitrogen} ppm
- Phosphorus: ${phosphorus} ppm
- Potassium: ${potassium} ppm

Please provide:
1. Overall soil health assessment
2. Specific nutrient deficiencies or excesses identified
3. Recommended fertilizer type and application rate
4. Lime recommendation if pH adjustment is needed
5. Suitable crops for this soil type
6. Long-term soil improvement strategies

Provide practical advice suitable for smallholder farmers in Africa.`;

      const result = await callAI(prompt);
      setResponse(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || response || error) {
    return (
      <AIResponseDisplay
        response={response}
        loading={loading}
        error={error}
        onReset={() => { setResponse(null); setError(null); }}
        resetLabel="Analyze new sample"
        accentColor="orange"
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">Enter your soil test results</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">pH Level</label>
          <input type="number" step="0.1" value={ph} onChange={(e) => setPh(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-orange-200" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Nitrogen (ppm)</label>
          <input type="number" value={nitrogen} onChange={(e) => setNitrogen(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-orange-200" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Phosphorus (ppm)</label>
          <input type="number" value={phosphorus} onChange={(e) => setPhosphorus(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-orange-200" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Potassium (ppm)</label>
          <input type="number" value={potassium} onChange={(e) => setPotassium(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-orange-200" />
        </div>
      </div>
      <button onClick={handleAnalyze} className="w-full py-2.5 bg-amber-700 text-white rounded-xl text-sm font-medium hover:bg-amber-800 transition-colors flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4" />
        Analyze Soil with AI
      </button>
    </div>
  );
}

function IrrigationSchedulerContent() {
  const [crop, setCrop] = useState('Maize');
  const [stage, setStage] = useState('Vegetative');
  const [soilType, setSoilType] = useState('Loamy');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSchedule = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const prompt = `As an Irrigation Scheduler AI for African agriculture, provide an irrigation plan for:
- Crop: ${crop}
- Growth stage: ${stage}
- Soil type: ${soilType}

Please provide:
1. Recommended irrigation frequency and timing
2. Recommended water amount per application (mm or litres)
3. Best time of day to irrigate
4. Water conservation tips specific to this crop and stage
5. Signs of over-watering and under-watering to watch for
6. Adjustments needed if weather is particularly hot or rainy

Provide practical advice suitable for smallholder farmers.`;

      const result = await callAI(prompt);
      setResponse(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || response || error) {
    return (
      <AIResponseDisplay
        response={response}
        loading={loading}
        error={error}
        onReset={() => { setResponse(null); setError(null); }}
        resetLabel="Adjust parameters"
        accentColor="cyan"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Crop</label>
          <select value={crop} onChange={(e) => setCrop(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-cyan-200">
            <option>Maize</option>
            <option>Tomatoes</option>
            <option>Wheat</option>
            <option>Sorghum</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Growth Stage</label>
          <select value={stage} onChange={(e) => setStage(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-cyan-200">
            <option>Germination</option>
            <option>Vegetative</option>
            <option>Flowering</option>
            <option>Fruiting</option>
            <option>Maturity</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Soil Type</label>
          <select value={soilType} onChange={(e) => setSoilType(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-cyan-200">
            <option>Loamy</option>
            <option>Sandy</option>
            <option>Clay</option>
            <option>Silty</option>
          </select>
        </div>
      </div>
      <button onClick={handleSchedule} className="w-full py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-medium hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4" />
        Generate AI Schedule
      </button>
    </div>
  );
}

function PestAlertContent() {
  const [region, setRegion] = useState('Botswana');
  const [crops, setCrops] = useState('Maize, Sorghum');
  const [season, setSeason] = useState('Summer (Oct-Mar)');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const prompt = `As a Pest Alert AI for African agriculture, provide a pest risk assessment for:
- Region/Country: ${region}
- Crops being grown: ${crops}
- Season: ${season}

Please provide:
1. Top 3-5 pest threats for these crops in this region and season
2. Risk level for each pest (low / medium / high)
3. Early warning signs to watch for
4. Recommended preventive measures
5. Treatment options (both organic and chemical) if pest is detected
6. Any recent outbreaks in the region to be aware of

Be specific and practical with advice.`;

      const result = await callAI(prompt);
      setResponse(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || response || error) {
    return (
      <AIResponseDisplay
        response={response}
        loading={loading}
        error={error}
        onReset={() => { setResponse(null); setError(null); }}
        resetLabel="Check another region"
        accentColor="red"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Region / Country</label>
          <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-red-200">
            <option>Botswana</option>
            <option>Zimbabwe</option>
            <option>Tanzania</option>
            <option>Kenya</option>
            <option>Nigeria</option>
            <option>South Africa</option>
            <option>Ghana</option>
            <option>Zambia</option>
            <option>Mozambique</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Crops Being Grown</label>
          <input type="text" value={crops} onChange={(e) => setCrops(e.target.value)} placeholder="e.g. Maize, Tomatoes, Sorghum" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-red-200" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Season</label>
          <select value={season} onChange={(e) => setSeason(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-red-200">
            <option>Summer (Oct-Mar)</option>
            <option>Winter (Apr-Sep)</option>
            <option>Rainy Season</option>
            <option>Dry Season</option>
          </select>
        </div>
      </div>
      <button onClick={handleCheck} className="w-full py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4" />
        Get AI Pest Analysis
      </button>
    </div>
  );
}

function CreditScoreContent() {
  const [hectares, setHectares] = useState('10');
  const [crops, setCrops] = useState('Maize, Sorghum');
  const [experience, setExperience] = useState('5');
  const [revenue, setRevenue] = useState('250000');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const prompt = `As a Credit Score Advisor AI for African agriculture, provide credit guidance for this farmer profile:
- Farm size: ${hectares} hectares
- Crops grown: ${crops}
- Farming experience: ${experience} years
- Annual revenue: BWP ${revenue}

Please provide:
1. General creditworthiness assessment based on these factors
2. What lenders typically look for in agricultural loans
3. Steps the farmer can take to strengthen their credit profile
4. Types of agricultural finance products they might be eligible for (e.g. seasonal crop finance, equipment lease, input credit)
5. General guidance on interest rates and terms to expect in the market
6. Important documents they should prepare for a loan application

Note: This is general guidance, not an official credit score. Recommend the farmer contact AFU or their local bank for formal assessment.`;

      const result = await callAI(prompt);
      setResponse(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || response || error) {
    return (
      <AIResponseDisplay
        response={response}
        loading={loading}
        error={error}
        onReset={() => { setResponse(null); setError(null); }}
        resetLabel="Recalculate"
        accentColor="teal"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Hectares</label>
          <input type="number" value={hectares} onChange={(e) => setHectares(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-teal-200" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Crops Grown</label>
          <input type="text" value={crops} onChange={(e) => setCrops(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-teal-200" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Years Experience</label>
          <input type="number" value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-teal-200" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Annual Revenue (BWP)</label>
          <input type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-teal-200" />
        </div>
      </div>
      <button onClick={handleCalculate} className="w-full py-2.5 bg-[#8CB89C] text-white rounded-xl text-sm font-medium hover:bg-[#239189] transition-colors flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4" />
        Get AI Credit Advice
      </button>
    </div>
  );
}

function FarmPlannerContent() {
  const [selectedCrops, setSelectedCrops] = useState('Maize, Sorghum, Groundnuts, Sunflower');
  const [location, setLocation] = useState('Gaborone');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const prompt = `As a Farm Planner AI for African agriculture, create an optimal crop calendar for:
- Crops to plan: ${selectedCrops}
- Location: ${location}

Please provide:
1. Optimal planting dates for each crop based on the local climate and rainfall patterns
2. Expected harvest dates for each crop
3. Recommended crop rotation strategy
4. Intercropping opportunities between these crops
5. Key activities calendar (land preparation, planting, weeding, fertilizing, harvesting)
6. Weather and seasonal risks to plan around

Format the calendar clearly so the farmer can use it as a practical planning guide.`;

      const result = await callAI(prompt);
      setResponse(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || response || error) {
    return (
      <AIResponseDisplay
        response={response}
        loading={loading}
        error={error}
        onReset={() => { setResponse(null); setError(null); }}
        resetLabel="Regenerate calendar"
        accentColor="purple"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Crops (comma separated)</label>
          <input type="text" value={selectedCrops} onChange={(e) => setSelectedCrops(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-purple-200" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Location</label>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-purple-200">
            <option>Gaborone</option>
            <option>Francistown</option>
            <option>Maun</option>
            <option>Kasane</option>
            <option>Harare</option>
            <option>Dar es Salaam</option>
            <option>Nairobi</option>
            <option>Lagos</option>
            <option>Lusaka</option>
            <option>Johannesburg</option>
            <option>Accra</option>
          </select>
        </div>
      </div>
      <button onClick={handleGenerate} className="w-full py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4" />
        Generate AI Calendar
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tool Content Router
// ---------------------------------------------------------------------------

function ToolContent({ toolId }: { toolId: string }) {
  switch (toolId) {
    case 'crop-doctor': return <CropDoctorContent />;
    case 'yield-predictor': return <YieldPredictorContent />;
    case 'price-forecaster': return <PriceForecasterContent />;
    case 'soil-analyzer': return <SoilAnalyzerContent />;
    case 'irrigation-scheduler': return <IrrigationSchedulerContent />;
    case 'pest-alert': return <PestAlertContent />;
    case 'credit-score': return <CreditScoreContent />;
    case 'farm-planner': return <FarmPlannerContent />;
    default: return null;
  }
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function AIToolsPage() {
  const { user } = useAuth();
  const { membershipTier } = useMembershipTier();
  const [expandedTool, setExpandedTool] = useState<string | null>(null);

  const toggleTool = (toolId: string) => {
    setExpandedTool(expandedTool === toolId ? null : toolId);
  };

  return (
    <FeatureGate feature="ai_tools" tier={membershipTier}>
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50"
    >
      {/* Header Banner */}
      <motion.div
        variants={cardVariants}
        className="bg-gradient-to-r from-purple-600 via-purple-700 to-[#1B2A4A] px-4 lg:px-6 py-8 lg:py-12"
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">AI Farm Tools</h1>
              <p className="text-purple-200 text-sm lg:text-base">Powered by Amara AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A843]" />
              <span className="text-xs text-white/80">{aiTools.length} AI Tools Available</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-white/80">Live AI Analysis</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6">
        {/* Tool Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiTools.map((tool) => {
            const Icon = tool.icon;
            const isExpanded = expandedTool === tool.id;

            return (
              <motion.div
                key={tool.id}
                variants={cardVariants}
                className={`bg-white rounded-2xl shadow-sm border transition-all ${
                  isExpanded ? `${tool.borderColor} border-2 shadow-md` : 'border-gray-100'
                }`}
              >
                {/* Tool Header */}
                <button
                  onClick={() => toggleTool(tool.id)}
                  className="w-full text-left p-5 flex items-center gap-4"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tool.bgColor}`}>
                    <Icon className={`w-6 h-6 ${tool.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#1B2A4A] text-sm">{tool.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{tool.description}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isExpanded ? tool.bgColor : 'bg-gray-50'
                  }`}>
                    {isExpanded ? (
                      <ChevronUp className={`w-4 h-4 ${tool.color}`} />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Tool Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      variants={expandVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-gray-50 pt-4">
                        <ToolContent toolId={tool.id} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* AI Disclaimer */}
        <motion.div variants={cardVariants} className="mt-6 bg-[#1B2A4A]/5 rounded-2xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#1B2A4A] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-[#1B2A4A]">AI Disclaimer</p>
            <p className="text-xs text-gray-500 mt-1">
              These AI tools provide estimates and recommendations based on available data and AI analysis. Always consult with local agricultural
              extension officers for critical decisions. Results should be used as guidance, not as definitive prescriptions.
              AI responses may occasionally contain inaccuracies.
            </p>
          </div>
        </motion.div>

        {/* Bottom spacer for mobile nav */}
        <div className="h-4" />
      </div>
    </motion.div>
    </FeatureGate>
  );
}
