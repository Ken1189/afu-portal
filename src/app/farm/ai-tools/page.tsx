'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
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
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Leaf,
  Wheat,
  Target,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  X,
  Star,
  BarChart3,
  Sprout,
  Activity,
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

interface DiagnosisResult {
  disease: string;
  confidence: number;
  severity: 'low' | 'moderate' | 'severe';
  treatment: string;
}

interface YieldResult {
  estimatedYield: string;
  confidenceRange: string;
  regionalAvg: string;
  comparison: 'above' | 'below' | 'average';
}

interface PriceResult {
  commodity: string;
  currentPrice: string;
  forecast30d: string;
  recommendation: 'buy' | 'sell' | 'hold';
  confidence: number;
}

interface SoilResult {
  fertilizerType: string;
  applicationRate: string;
  limeRecommendation: string;
  overallHealth: string;
}

interface IrrigationResult {
  nextIrrigation: string;
  amount: string;
  frequency: string;
}

interface PestAlert {
  pest: string;
  affectedCrops: string;
  riskLevel: 'low' | 'medium' | 'high';
  action: string;
}

interface CreditResult {
  score: number;
  eligibility: string;
  recommendedProducts: string[];
}

interface PlannerResult {
  crops: { name: string; plant: string; harvest: string }[];
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const aiTools: AITool[] = [
  {
    id: 'crop-doctor',
    name: 'Crop Doctor AI',
    description: 'Upload a photo to diagnose crop diseases',
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
    description: 'AI-powered commodity price predictions',
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
    description: 'Real-time pest monitoring and alerts',
    icon: Bug,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  {
    id: 'credit-score',
    name: 'Credit Score Calculator',
    description: 'Calculate your agricultural credit score',
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

const FALLBACK_DIAGNOSIS: DiagnosisResult = {
  disease: 'Late Blight (Phytophthora infestans)',
  confidence: 94,
  severity: 'moderate',
  treatment: 'Apply Mancozeb 80WP at 2.5g/L. Remove infected leaves immediately. Improve air circulation. Avoid overhead irrigation. Re-inspect in 5-7 days.',
};

const FALLBACK_YIELD_RESULT: YieldResult = {
  estimatedYield: '4.8 tonnes/ha',
  confidenceRange: '4.2 - 5.4 tonnes/ha',
  regionalAvg: '3.9 tonnes/ha',
  comparison: 'above',
};

const FALLBACK_PRICE_RESULT: PriceResult = {
  commodity: 'Maize',
  currentPrice: '$285/tonne',
  forecast30d: '$312/tonne (+9.5%)',
  recommendation: 'hold',
  confidence: 78,
};

const FALLBACK_SOIL_RESULT: SoilResult = {
  fertilizerType: 'NPK 15-15-15 + Zinc Sulphate',
  applicationRate: '250 kg/ha basal, 100 kg/ha top dress',
  limeRecommendation: 'Apply 2 tonnes/ha of agricultural lime to raise pH from 5.2 to 6.0',
  overallHealth: 'Moderate - Nitrogen and Zinc deficiency detected',
};

const FALLBACK_IRRIGATION_RESULT: IrrigationResult = {
  nextIrrigation: 'Tomorrow at 06:00',
  amount: '25mm',
  frequency: 'Every 3 days',
};

const FALLBACK_PEST_ALERTS: PestAlert[] = [
  { pest: 'Fall Armyworm', affectedCrops: 'Maize, Sorghum', riskLevel: 'high', action: 'Apply Emamectin benzoate 5% SG at 0.4g/L. Scout fields every 2 days.' },
  { pest: 'Aphids (Rhopalosiphum maidis)', affectedCrops: 'Wheat, Barley', riskLevel: 'medium', action: 'Monitor populations. Apply Imidacloprid if threshold exceeded (50/plant).' },
  { pest: 'Red Spider Mite', affectedCrops: 'Tomatoes, Beans', riskLevel: 'low', action: 'Increase humidity around plants. Consider biological control with predatory mites.' },
];

const FALLBACK_CREDIT_RESULT: CreditResult = {
  score: 742,
  eligibility: 'Eligible for Tier 2 agricultural loans up to BWP 500,000',
  recommendedProducts: [
    'Seasonal Crop Finance - 12% APR',
    'Equipment Lease Program - BWP 200,000 limit',
    'Input Supply Credit Line - 60 day terms',
  ],
};

const FALLBACK_PLANNER_RESULT: PlannerResult = {
  crops: [
    { name: 'Maize', plant: 'Oct 15 - Nov 15', harvest: 'Mar 15 - Apr 15' },
    { name: 'Sorghum', plant: 'Nov 1 - Dec 1', harvest: 'Apr 1 - May 1' },
    { name: 'Groundnuts', plant: 'Nov 15 - Dec 15', harvest: 'Apr 15 - May 15' },
    { name: 'Sunflower', plant: 'Dec 1 - Jan 1', harvest: 'May 1 - Jun 1' },
  ],
};

// ---------------------------------------------------------------------------
// Tool Content Components
// ---------------------------------------------------------------------------

function CropDoctorContent() {
  const [showResult, setShowResult] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setShowResult(true);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {!showResult && !analyzing && (
        <div
          className="border-2 border-dashed border-green-200 rounded-xl p-8 text-center bg-green-50/50 cursor-pointer hover:bg-green-50 transition-colors"
          onClick={handleAnalyze}
        >
          <Upload className="w-10 h-10 text-green-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-[#1B2A4A]">Drag & drop a crop photo here</p>
          <p className="text-xs text-gray-400 mt-1">or click to upload (JPG, PNG up to 10MB)</p>
          <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
            Upload Photo
          </button>
        </div>
      )}

      {analyzing && (
        <div className="text-center py-8">
          <div className="w-12 h-12 border-3 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-[#1B2A4A]">Analyzing crop image...</p>
          <p className="text-xs text-gray-400">AI is examining for diseases, deficiencies, and pests</p>
        </div>
      )}

      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h4 className="font-semibold text-[#1B2A4A]">{FALLBACK_DIAGNOSIS.disease}</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-400">Confidence</p>
                <p className="text-lg font-bold text-[#8CB89C]">{FALLBACK_DIAGNOSIS.confidence}%</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-400">Severity</p>
                <p className="text-lg font-bold text-amber-600 capitalize">{FALLBACK_DIAGNOSIS.severity}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-4 h-4 text-green-600" />
              <h4 className="text-sm font-semibold text-green-800">Treatment Recommendation</h4>
            </div>
            <p className="text-sm text-green-700">{FALLBACK_DIAGNOSIS.treatment}</p>
          </div>
          <button
            onClick={() => setShowResult(false)}
            className="w-full py-2 text-sm text-gray-500 hover:text-[#1B2A4A] transition-colors"
          >
            Scan another crop
          </button>
        </motion.div>
      )}
    </div>
  );
}

function YieldPredictorContent() {
  const [crop, setCrop] = useState('Maize');
  const [hectares, setHectares] = useState('10');
  const [soilType, setSoilType] = useState('Loamy');
  const [irrigation, setIrrigation] = useState('Drip');
  const [showResult, setShowResult] = useState(false);

  return (
    <div className="space-y-4">
      {!showResult ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Crop</label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option>Maize</option>
                <option>Sorghum</option>
                <option>Wheat</option>
                <option>Sunflower</option>
                <option>Groundnuts</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Hectares</label>
              <input
                type="number"
                value={hectares}
                onChange={(e) => setHectares(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Soil Type</label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option>Loamy</option>
                <option>Sandy</option>
                <option>Clay</option>
                <option>Silty</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Irrigation</label>
              <select
                value={irrigation}
                onChange={(e) => setIrrigation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option>Drip</option>
                <option>Sprinkler</option>
                <option>Flood</option>
                <option>Rainfed</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => setShowResult(true)}
            className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Predict Yield
          </button>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">Estimated Yield for {crop}</p>
            <p className="text-3xl font-bold text-[#1B2A4A]">{FALLBACK_YIELD_RESULT.estimatedYield}</p>
            <p className="text-sm text-gray-500 mt-1">Confidence: {FALLBACK_YIELD_RESULT.confidenceRange}</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400">Regional Avg</p>
              <p className="text-sm font-bold text-[#1B2A4A]">{FALLBACK_YIELD_RESULT.regionalAvg}</p>
            </div>
            <div className="flex-1 bg-green-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400">vs Average</p>
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <p className="text-sm font-bold text-green-600">+23% Above</p>
              </div>
            </div>
          </div>
          <button onClick={() => setShowResult(false)} className="w-full py-2 text-sm text-gray-500 hover:text-[#1B2A4A] transition-colors">
            Run another prediction
          </button>
        </motion.div>
      )}
    </div>
  );
}

function PriceForecasterContent() {
  const [commodity, setCommodity] = useState('Maize');
  const [showResult, setShowResult] = useState(false);

  return (
    <div className="space-y-4">
      {!showResult ? (
        <>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Select Commodity</label>
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-amber-200"
            >
              <option>Maize</option>
              <option>Wheat</option>
              <option>Sorghum</option>
              <option>Soybeans</option>
              <option>Sunflower</option>
              <option>Cotton</option>
              <option>Beef</option>
            </select>
          </div>
          <button
            onClick={() => setShowResult(true)}
            className="w-full py-2.5 bg-[#D4A843] text-white rounded-xl text-sm font-medium hover:bg-[#c49a3a] transition-colors flex items-center justify-center gap-2"
          >
            <LineChart className="w-4 h-4" />
            Get Forecast
          </button>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">Current Price</p>
              <p className="text-lg font-bold text-[#1B2A4A]">{FALLBACK_PRICE_RESULT.currentPrice}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">30-Day Forecast</p>
              <p className="text-lg font-bold text-green-600">{FALLBACK_PRICE_RESULT.forecast30d}</p>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1B2A4A]">Recommendation: <span className="text-amber-600 uppercase">{FALLBACK_PRICE_RESULT.recommendation}</span></p>
              <p className="text-xs text-gray-500">Confidence: {FALLBACK_PRICE_RESULT.confidence}%</p>
            </div>
          </div>
          {/* Mini CSS sparkline */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-2">30-Day Price Trend</p>
            <div className="flex items-end gap-1 h-12">
              {[40, 42, 38, 45, 50, 48, 55, 52, 58, 60, 56, 62, 65, 63, 68, 70, 66, 72, 75, 78, 74, 80, 82, 79, 85, 88, 84, 90, 92, 95].map((v, i) => (
                <div
                  key={i}
                  className="flex-1 bg-[#D4A843] rounded-t-sm transition-all"
                  style={{ height: `${v}%` }}
                />
              ))}
            </div>
          </div>
          <button onClick={() => setShowResult(false)} className="w-full py-2 text-sm text-gray-500 hover:text-[#1B2A4A] transition-colors">
            Check another commodity
          </button>
        </motion.div>
      )}
    </div>
  );
}

function SoilAnalyzerContent() {
  const [ph, setPh] = useState('5.2');
  const [nitrogen, setNitrogen] = useState('28');
  const [phosphorus, setPhosphorus] = useState('15');
  const [potassium, setPotassium] = useState('180');
  const [showResult, setShowResult] = useState(false);

  return (
    <div className="space-y-4">
      {!showResult ? (
        <>
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
          <button onClick={() => setShowResult(true)} className="w-full py-2.5 bg-amber-700 text-white rounded-xl text-sm font-medium hover:bg-amber-800 transition-colors flex items-center justify-center gap-2">
            <Layers className="w-4 h-4" />
            Analyze Soil
          </button>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">Overall Assessment</p>
            <p className="text-sm font-semibold text-amber-800">{FALLBACK_SOIL_RESULT.overallHealth}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div>
              <p className="text-xs text-gray-400">Recommended Fertilizer</p>
              <p className="text-sm font-semibold text-[#1B2A4A]">{FALLBACK_SOIL_RESULT.fertilizerType}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Application Rate</p>
              <p className="text-sm font-semibold text-[#1B2A4A]">{FALLBACK_SOIL_RESULT.applicationRate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Lime Recommendation</p>
              <p className="text-sm font-semibold text-[#1B2A4A]">{FALLBACK_SOIL_RESULT.limeRecommendation}</p>
            </div>
          </div>
          <button onClick={() => setShowResult(false)} className="w-full py-2 text-sm text-gray-500 hover:text-[#1B2A4A] transition-colors">
            Analyze new sample
          </button>
        </motion.div>
      )}
    </div>
  );
}

function IrrigationSchedulerContent() {
  const [crop, setCrop] = useState('Maize');
  const [stage, setStage] = useState('Vegetative');
  const [soilType, setSoilType] = useState('Loamy');
  const [showResult, setShowResult] = useState(false);

  return (
    <div className="space-y-4">
      {!showResult ? (
        <>
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
          <button onClick={() => setShowResult(true)} className="w-full py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-medium hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2">
            <Droplets className="w-4 h-4" />
            Generate Schedule
          </button>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-cyan-50 rounded-xl p-3 text-center">
              <Droplets className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
              <p className="text-xs text-gray-400">Next</p>
              <p className="text-sm font-bold text-[#1B2A4A]">{FALLBACK_IRRIGATION_RESULT.nextIrrigation}</p>
            </div>
            <div className="bg-cyan-50 rounded-xl p-3 text-center">
              <Activity className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
              <p className="text-xs text-gray-400">Amount</p>
              <p className="text-sm font-bold text-[#1B2A4A]">{FALLBACK_IRRIGATION_RESULT.amount}</p>
            </div>
            <div className="bg-cyan-50 rounded-xl p-3 text-center">
              <Clock className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
              <p className="text-xs text-gray-400">Frequency</p>
              <p className="text-sm font-bold text-[#1B2A4A]">{FALLBACK_IRRIGATION_RESULT.frequency}</p>
            </div>
          </div>
          <button onClick={() => setShowResult(false)} className="w-full py-2 text-sm text-gray-500 hover:text-[#1B2A4A] transition-colors">
            Adjust parameters
          </button>
        </motion.div>
      )}
    </div>
  );
}

function PestAlertContent() {
  const riskColors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">Current pest alerts for your region</p>
      {FALLBACK_PEST_ALERTS.map((alert, idx) => (
        <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-[#1B2A4A]">{alert.pest}</h4>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${riskColors[alert.riskLevel]}`}>
              {alert.riskLevel} risk
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-2">
            <span className="font-medium">Affected:</span> {alert.affectedCrops}
          </p>
          <div className="bg-white rounded-lg p-2.5 border border-gray-100">
            <p className="text-xs text-gray-600">
              <span className="font-medium text-[#8CB89C]">Action:</span> {alert.action}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CreditScoreContent() {
  const [hectares, setHectares] = useState('10');
  const [crops, setCrops] = useState('Maize, Sorghum');
  const [experience, setExperience] = useState('5');
  const [revenue, setRevenue] = useState('250000');
  const [showResult, setShowResult] = useState(false);

  const scoreColor = FALLBACK_CREDIT_RESULT.score >= 700 ? 'text-green-600' : FALLBACK_CREDIT_RESULT.score >= 500 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="space-y-4">
      {!showResult ? (
        <>
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
          <button onClick={() => setShowResult(true)} className="w-full py-2.5 bg-[#8CB89C] text-white rounded-xl text-sm font-medium hover:bg-[#239189] transition-colors flex items-center justify-center gap-2">
            <Calculator className="w-4 h-4" />
            Calculate Score
          </button>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <p className="text-xs text-gray-400 mb-2">Your AI Credit Score</p>
            <p className={`text-5xl font-bold ${scoreColor}`}>{FALLBACK_CREDIT_RESULT.score}</p>
            <p className="text-xs text-gray-400 mt-1">out of 1,000</p>
            <div className="w-full h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-green-500"
                style={{ width: `${(FALLBACK_CREDIT_RESULT.score / 1000) * 100}%` }}
              />
            </div>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-3">
            <p className="text-sm font-medium text-[#1B2A4A]">{FALLBACK_CREDIT_RESULT.eligibility}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500">Recommended Products</p>
            {FALLBACK_CREDIT_RESULT.recommendedProducts.map((product, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white rounded-lg p-2.5 border border-gray-100">
                <CheckCircle className="w-4 h-4 text-[#8CB89C] flex-shrink-0" />
                <p className="text-xs text-[#1B2A4A]">{product}</p>
              </div>
            ))}
          </div>
          <button onClick={() => setShowResult(false)} className="w-full py-2 text-sm text-gray-500 hover:text-[#1B2A4A] transition-colors">
            Recalculate
          </button>
        </motion.div>
      )}
    </div>
  );
}

function FarmPlannerContent() {
  const [selectedCrops, setSelectedCrops] = useState('Maize, Sorghum, Groundnuts, Sunflower');
  const [location, setLocation] = useState('Gaborone');
  const [showResult, setShowResult] = useState(false);

  const monthNames = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const cropColors = ['bg-green-500', 'bg-amber-500', 'bg-blue-500', 'bg-purple-500'];

  return (
    <div className="space-y-4">
      {!showResult ? (
        <>
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
              </select>
            </div>
          </div>
          <button onClick={() => setShowResult(true)} className="w-full py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Generate Calendar
          </button>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {/* Timeline header */}
          <div className="overflow-x-auto">
            <div className="min-w-[500px]">
              <div className="flex mb-2">
                <div className="w-24 flex-shrink-0" />
                {monthNames.map((m) => (
                  <div key={m} className="flex-1 text-center text-xs text-gray-400 font-medium">{m}</div>
                ))}
              </div>
              {FALLBACK_PLANNER_RESULT.crops.map((crop, idx) => (
                <div key={idx} className="flex items-center mb-2">
                  <div className="w-24 flex-shrink-0 text-xs font-medium text-[#1B2A4A] truncate pr-2">{crop.name}</div>
                  <div className="flex-1 relative h-6 bg-gray-50 rounded-full overflow-hidden">
                    {/* Planting bar */}
                    <div
                      className={`absolute top-0 h-full rounded-full ${cropColors[idx]} opacity-80`}
                      style={{ left: `${(idx * 10) + 2}%`, width: '20%' }}
                    />
                    {/* Harvest bar */}
                    <div
                      className={`absolute top-0 h-full rounded-full ${cropColors[idx]} opacity-40`}
                      style={{ left: `${(idx * 10) + 50}%`, width: '20%' }}
                    />
                  </div>
                </div>
              ))}
              <div className="flex mt-2 ml-24 gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
                  <span className="text-xs text-gray-400">Planting</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500 opacity-40" />
                  <span className="text-xs text-gray-400">Harvest</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 space-y-2">
            {FALLBACK_PLANNER_RESULT.crops.map((crop, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#1B2A4A]">{crop.name}</span>
                <span className="text-gray-500">Plant: {crop.plant} | Harvest: {crop.harvest}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setShowResult(false)} className="w-full py-2 text-sm text-gray-500 hover:text-[#1B2A4A] transition-colors">
            Regenerate calendar
          </button>
        </motion.div>
      )}
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
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [liveDiagnosis, setLiveDiagnosis] = useState<DiagnosisResult>(FALLBACK_DIAGNOSIS);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    // Attempt to fetch any AI diagnosis results from Supabase or an AI endpoint
    const load = async () => {
      try {
        const supabase = createClient();
        // Try fetching latest farm activity as context for AI tools
        if (user) {
          const { data } = await supabase
            .from('farm_activities')
            .select('*')
            .eq('member_id', user.id)
            .order('date', { ascending: false })
            .limit(1);
          // Data available but diagnosis stays as demo until real AI endpoint exists
          if (data && data.length > 0) {
            // Context loaded — keep demo diagnosis as fallback
          }
        }
      } catch { /* keep fallback */ }
      setDataLoading(false);
    };
    load();
  }, [user]);

  const toggleTool = (toolId: string) => {
    setExpandedTool(expandedTool === toolId ? null : toolId);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50"
    >
      {/* ─── Header Banner ─── */}
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
              <p className="text-purple-200 text-sm lg:text-base">Powered by Mkulima AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A843]" />
              <span className="text-xs text-white/80">{aiTools.length} AI Tools Available</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-white/80">Real-time Analysis</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6">
        {/* ─── Tool Grid ─── */}
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

        {/* ─── AI Disclaimer ─── */}
        <motion.div variants={cardVariants} className="mt-6 bg-[#1B2A4A]/5 rounded-2xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#1B2A4A] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-[#1B2A4A]">AI Disclaimer</p>
            <p className="text-xs text-gray-500 mt-1">
              These AI tools provide estimates and recommendations based on available data. Always consult with local agricultural
              extension officers for critical decisions. Results should be used as guidance, not as definitive prescriptions.
            </p>
          </div>
        </motion.div>

        {/* Bottom spacer for mobile nav */}
        <div className="h-4" />
      </div>
    </motion.div>
  );
}
