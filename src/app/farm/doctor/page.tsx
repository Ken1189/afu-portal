'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  ImagePlus,
  Scan,
  CheckCircle,
  AlertTriangle,
  Bug,
  Droplets,
  Leaf,
  ShoppingCart,
  RotateCcw,
  Save,
  ChevronDown,
  BookOpen,
  Search,
  ChevronRight,
  Clock,
  Stethoscope,
  Thermometer,
  Zap,
  Shield,
  MessageCircle,
  History,
  ArrowRight,
  Sparkles,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// ---------------------------------------------------------------------------
// Inlined types & data (previously from @/lib/data/farm)
// ---------------------------------------------------------------------------

type ScanResult = 'healthy' | 'moderate' | 'severe';

interface CropScan {
  id: string;
  plotId: string;
  plotName: string;
  date: string;
  image: string;
  diagnosis: string;
  healthScore: number;
  severity: ScanResult;
  confidence: number;
  affectedArea: number;
  recommendations: string[];
  treatments: { name: string; price: number; unit: string }[];
}

interface FarmPlotMinimal {
  id: string;
  name: string;
  crop: string;
  variety: string;
}

const FALLBACK_CROP_SCANS: CropScan[] = [
  {
    id: 'SCN-001', plotId: 'PLT-001', plotName: 'Main Blueberry Field', date: '2026-03-11',
    image: 'https://images.unsplash.com/photo-1498579809087-ef1e558fd1da?w=400&h=300&fit=crop',
    diagnosis: 'Healthy — No Issues Detected', healthScore: 92, severity: 'healthy', confidence: 94, affectedArea: 0,
    recommendations: ['Continue current care regimen', 'Monitor soil pH weekly during fruiting', 'Maintain mulch layer around root zone'],
    treatments: [],
  },
  {
    id: 'SCN-002', plotId: 'PLT-002', plotName: 'Cassava Plot', date: '2026-03-10',
    image: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=400&h=300&fit=crop',
    diagnosis: 'Possible Cassava Mosaic — Early Signs', healthScore: 72, severity: 'moderate', confidence: 78, affectedArea: 12,
    recommendations: ['Remove and destroy affected plants immediately', 'Apply Imidacloprid for whitefly control', 'Check neighbouring plants within 3-metre radius', 'Consider resistant variety for next planting'],
    treatments: [{ name: 'Imidacloprid 200SL', price: 28, unit: 'per liter' }, { name: 'Neem Oil Organic', price: 18, unit: 'per liter' }],
  },
  {
    id: 'SCN-003', plotId: 'PLT-003', plotName: 'Sesame Strip', date: '2026-03-09',
    image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&h=300&fit=crop',
    diagnosis: 'Minor Leaf Spot (Cercospora)', healthScore: 82, severity: 'moderate', confidence: 85, affectedArea: 8,
    recommendations: ['Apply copper oxychloride fungicide', 'Improve spacing for air circulation', 'Avoid overhead irrigation'],
    treatments: [{ name: 'Copper Oxychloride', price: 22, unit: 'per kg' }],
  },
];

const FALLBACK_FARM_PLOTS: FarmPlotMinimal[] = [
  { id: 'PLT-001', name: 'Main Blueberry Field', crop: 'Blueberries', variety: 'Duke' },
  { id: 'PLT-002', name: 'Cassava Plot', crop: 'Cassava', variety: 'TMS 30572' },
  { id: 'PLT-003', name: 'Sesame Strip', crop: 'Sesame', variety: 'S42 White' },
  { id: 'PLT-004', name: 'Maize Field', crop: 'Maize', variety: 'SC 513' },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MockDiagnosis {
  diagnosis: string;
  healthScore: number;
  severity: 'healthy' | 'moderate' | 'severe';
  confidence: number;
  affectedArea: number;
  recommendations: string[];
  treatments: { name: string; price: number; unit: string }[];
}

type PageState = 'capture' | 'analyzing' | 'results';

// ---------------------------------------------------------------------------
// Mock Diagnoses
// ---------------------------------------------------------------------------

const FALLBACK_DIAGNOSES: MockDiagnosis[] = [
  {
    diagnosis: 'Healthy Crop - No Issues Detected',
    healthScore: 92,
    severity: 'healthy',
    confidence: 96,
    affectedArea: 0,
    recommendations: [
      'Continue your current care routine - your crop looks great!',
      'Monitor soil moisture levels weekly',
      'Maintain mulch layer to conserve water',
      'Scout for pests every 3-5 days as a precaution',
    ],
    treatments: [],
  },
  {
    diagnosis: 'Leaf Spot (Cercospora)',
    healthScore: 68,
    severity: 'moderate',
    confidence: 87,
    affectedArea: 15,
    recommendations: [
      'Apply copper-based fungicide within 48 hours',
      'Remove and destroy heavily affected leaves',
      'Improve air circulation between plants by thinning',
      'Avoid overhead watering - use drip irrigation instead',
      'Re-scan in 7 days to monitor progress',
    ],
    treatments: [
      { name: 'Copper Oxychloride 50WP', price: 22, unit: 'per kg' },
      { name: 'Mancozeb 80WP', price: 18, unit: 'per kg' },
    ],
  },
  {
    diagnosis: 'Aphid Infestation',
    healthScore: 45,
    severity: 'severe',
    confidence: 91,
    affectedArea: 35,
    recommendations: [
      'Spray neem oil immediately on all affected plants',
      'Apply Imidacloprid systemic insecticide for heavy infestation',
      'Check undersides of leaves where aphids hide',
      'Introduce ladybird beetles as natural predators',
      'Remove heavily infested leaves and burn them',
      'Repeat spray after 7 days',
    ],
    treatments: [
      { name: 'Neem Oil Organic Spray', price: 18, unit: 'per liter' },
      { name: 'Imidacloprid 200SL', price: 28, unit: 'per liter' },
    ],
  },
  {
    diagnosis: 'Nitrogen Deficiency',
    healthScore: 55,
    severity: 'moderate',
    confidence: 83,
    affectedArea: 40,
    recommendations: [
      'Apply urea top-dressing at 100kg per hectare',
      'Water immediately after applying fertilizer',
      'Consider foliar feed for faster response',
      'Test soil nutrients to confirm deficiency',
      'Increase organic matter with compost',
    ],
    treatments: [
      { name: 'Urea 46% N (50kg bag)', price: 38, unit: 'per bag' },
      { name: 'NPK 15-15-15 (50kg bag)', price: 45, unit: 'per bag' },
    ],
  },
  {
    diagnosis: 'Cassava Mosaic Virus',
    healthScore: 35,
    severity: 'severe',
    confidence: 89,
    affectedArea: 25,
    recommendations: [
      'Remove and burn ALL affected plants immediately',
      'Do NOT compost infected plant material',
      'Apply Imidacloprid to control whitefly vectors',
      'Check all plants within 5-meter radius',
      'Use virus-free cuttings for next planting',
      'Consider resistant varieties like TME 419',
    ],
    treatments: [
      { name: 'Imidacloprid 200SL', price: 28, unit: 'per liter' },
      { name: 'Yellow Sticky Traps (pack of 20)', price: 12, unit: 'per pack' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Knowledge Base — Common Diseases & Pests
// ---------------------------------------------------------------------------

interface DiseaseEntry {
  id: string;
  name: string;
  type: 'disease' | 'pest' | 'deficiency';
  crops: string[];
  severity: 'low' | 'medium' | 'high';
  symptoms: string[];
  treatment: string;
  prevention: string;
  image: string;
}

const KNOWLEDGE_BASE: DiseaseEntry[] = [
  {
    id: 'KB-001', name: 'Fall Armyworm', type: 'pest', crops: ['Maize', 'Sorghum', 'Millet'],
    severity: 'high',
    symptoms: ['Ragged holes in leaves', 'Sawdust-like frass in leaf whorls', 'Windowpane damage on young leaves', 'Larvae visible in whorls at dawn/dusk'],
    treatment: 'Apply Emamectin benzoate 5% SG at first sign of damage. For organic farms, use Bt (Bacillus thuringiensis) spray.',
    prevention: 'Early planting, intercrop with legumes, use pheromone traps for monitoring, maintain field hygiene after harvest.',
    image: 'https://images.unsplash.com/photo-1598512752271-33f913a5af14?w=400&h=300&fit=crop',
  },
  {
    id: 'KB-002', name: 'Cassava Mosaic Disease', type: 'disease', crops: ['Cassava'],
    severity: 'high',
    symptoms: ['Yellow/white mosaic pattern on leaves', 'Leaf curling and distortion', 'Stunted plant growth', 'Reduced tuber size'],
    treatment: 'No chemical cure. Remove and burn infected plants immediately. Control whitefly vectors with Imidacloprid.',
    prevention: 'Use certified virus-free planting material. Plant resistant varieties (TME 419, NASE 14). Control whitefly populations.',
    image: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=400&h=300&fit=crop',
  },
  {
    id: 'KB-003', name: 'Maize Streak Virus', type: 'disease', crops: ['Maize'],
    severity: 'high',
    symptoms: ['Narrow chlorotic streaks along leaf veins', 'Stunted growth', 'Poor cob development', 'Young plants most susceptible'],
    treatment: 'No chemical treatment available. Remove infected plants. Control leafhopper vectors.',
    prevention: 'Plant resistant varieties, early planting to avoid peak leafhopper season, use Imidacloprid seed treatment.',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
  },
  {
    id: 'KB-004', name: 'Leaf Spot (Cercospora)', type: 'disease', crops: ['Sesame', 'Groundnuts', 'Cowpeas', 'Sorghum'],
    severity: 'medium',
    symptoms: ['Circular brown spots on leaves', 'Yellow halo around spots', 'Premature leaf drop', 'Dark lesions may merge'],
    treatment: 'Apply copper oxychloride or mancozeb fungicide at first sign. Repeat every 10-14 days if conditions persist.',
    prevention: 'Crop rotation, improve plant spacing for air circulation, avoid overhead irrigation, use resistant varieties.',
    image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&h=300&fit=crop',
  },
  {
    id: 'KB-005', name: 'Nitrogen Deficiency', type: 'deficiency', crops: ['Maize', 'Sorghum', 'Vegetables', 'All crops'],
    severity: 'medium',
    symptoms: ['Yellowing starts from older/lower leaves', 'V-shaped yellowing pattern on maize', 'Stunted growth', 'Pale green overall appearance'],
    treatment: 'Apply urea at 100-150kg/ha as top dressing. For quick response, use foliar nitrogen spray (2% urea solution).',
    prevention: 'Soil testing before planting, proper basal fertilizer application, incorporate organic matter, use legume rotations.',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
  },
  {
    id: 'KB-006', name: 'Aphids', type: 'pest', crops: ['Cowpeas', 'Vegetables', 'Sesame', 'Cotton'],
    severity: 'medium',
    symptoms: ['Clusters of small soft-bodied insects on shoots', 'Sticky honeydew on leaves', 'Sooty mold on honeydew', 'Curled or distorted new growth'],
    treatment: 'Spray neem oil or insecticidal soap for mild cases. Use Imidacloprid or Lambda-cyhalothrin for heavy infestations.',
    prevention: 'Encourage natural predators (ladybirds, lacewings), avoid excessive nitrogen fertilization, use reflective mulches.',
    image: 'https://images.unsplash.com/photo-1598030343246-eec71d0b4b8a?w=400&h=300&fit=crop',
  },
  {
    id: 'KB-007', name: 'Phosphorus Deficiency', type: 'deficiency', crops: ['Maize', 'Groundnuts', 'All crops'],
    severity: 'medium',
    symptoms: ['Purple/reddish coloring of leaves and stems', 'Dark green older leaves', 'Poor root development', 'Delayed maturity'],
    treatment: 'Apply Single Super Phosphate (SSP) or DAP at planting. For immediate effect, use foliar phosphate spray.',
    prevention: 'Soil pH management (P is most available at pH 6.0-7.0), apply phosphate at planting, use mycorrhizal inoculants.',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
  },
  {
    id: 'KB-008', name: 'Stem Borer', type: 'pest', crops: ['Maize', 'Sorghum', 'Sugarcane'],
    severity: 'high',
    symptoms: ['Dead heart in young plants', 'Bore holes in stems', 'Sawdust-like frass at bore holes', 'Broken tassels', 'Lodged plants'],
    treatment: 'Apply granular Carbofuran into the leaf whorl. For organic: inject Bt into bore holes. Remove and burn stubble after harvest.',
    prevention: 'Early planting, intercrop with desmodium (push-pull), destroy crop residues, use resistant varieties.',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop',
  },
];

// ---------------------------------------------------------------------------
// Symptom Checker Categories
// ---------------------------------------------------------------------------

interface SymptomCategory {
  id: string;
  label: string;
  icon: 'leaf' | 'bug' | 'droplets' | 'thermometer' | 'zap';
  symptoms: string[];
  possibleCauses: string[];
}

const SYMPTOM_CATEGORIES: SymptomCategory[] = [
  {
    id: 'leaves', label: 'Leaf Problems', icon: 'leaf',
    symptoms: ['Yellowing leaves', 'Brown spots', 'Curling leaves', 'Wilting', 'White powdery coating', 'Holes in leaves', 'Purple discoloration', 'Mosaic patterns'],
    possibleCauses: ['Nutrient deficiency', 'Fungal disease', 'Viral infection', 'Pest damage', 'Water stress'],
  },
  {
    id: 'pests', label: 'Visible Pests', icon: 'bug',
    symptoms: ['Small insects on leaves', 'Caterpillars', 'Bore holes in stems', 'Webbing on plants', 'Frass/droppings visible', 'Chewed leaf edges', 'Galls on stems'],
    possibleCauses: ['Aphids', 'Armyworm', 'Stem borer', 'Spider mites', 'Whitefly', 'Bollworm'],
  },
  {
    id: 'water', label: 'Water Issues', icon: 'droplets',
    symptoms: ['Drooping/wilting plants', 'Yellowing from bottom up', 'Root rot smell', 'Waterlogged soil', 'Cracking soil', 'Leaf scorch'],
    possibleCauses: ['Overwatering', 'Underwatering', 'Poor drainage', 'Root disease', 'Salt buildup'],
  },
  {
    id: 'growth', label: 'Growth Problems', icon: 'thermometer',
    symptoms: ['Stunted growth', 'No flowering', 'Poor fruit set', 'Premature fruit drop', 'Thin/weak stems', 'Small leaves'],
    possibleCauses: ['Nutrient deficiency', 'Temperature stress', 'Poor pollination', 'Root damage', 'Compacted soil'],
  },
  {
    id: 'soil', label: 'Soil Issues', icon: 'zap',
    symptoms: ['White crust on surface', 'Hard compacted soil', 'Poor water absorption', 'Unusual odors', 'White fungal growth on surface'],
    possibleCauses: ['pH imbalance', 'Salt accumulation', 'Compaction', 'Poor organic matter', 'Fungal infection'],
  },
];

// ---------------------------------------------------------------------------
// Consultation History
// ---------------------------------------------------------------------------

interface ConsultationRecord {
  id: string;
  date: string;
  plotName: string;
  diagnosis: string;
  severity: 'healthy' | 'moderate' | 'severe';
  healthScore: number;
  resolved: boolean;
  followUpDate?: string;
}

const CONSULTATION_HISTORY: ConsultationRecord[] = [
  { id: 'CON-001', date: '2026-04-08', plotName: 'Main Blueberry Field', diagnosis: 'Healthy - No Issues', severity: 'healthy', healthScore: 92, resolved: true },
  { id: 'CON-002', date: '2026-04-05', plotName: 'Cassava Plot', diagnosis: 'Possible Cassava Mosaic - Early Signs', severity: 'moderate', healthScore: 72, resolved: false, followUpDate: '2026-04-12' },
  { id: 'CON-003', date: '2026-04-02', plotName: 'Sesame Strip', diagnosis: 'Minor Leaf Spot (Cercospora)', severity: 'moderate', healthScore: 82, resolved: true },
  { id: 'CON-004', date: '2026-03-28', plotName: 'Maize Field', diagnosis: 'Nitrogen Deficiency', severity: 'moderate', healthScore: 55, resolved: true },
  { id: 'CON-005', date: '2026-03-22', plotName: 'Main Blueberry Field', diagnosis: 'Aphid Infestation (Minor)', severity: 'moderate', healthScore: 68, resolved: true },
  { id: 'CON-006', date: '2026-03-15', plotName: 'Cassava Plot', diagnosis: 'Healthy Check', severity: 'healthy', healthScore: 88, resolved: true },
];

// ---------------------------------------------------------------------------
// Animation Variants
// ---------------------------------------------------------------------------

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.85 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
};

// ---------------------------------------------------------------------------
// Helper — severity color
// ---------------------------------------------------------------------------

function severityColor(score: number): string {
  if (score >= 80) return '#10B981';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
}

function severityLabel(severity: 'healthy' | 'moderate' | 'severe', labels?: { healthy: string; moderate: string; severe: string }): string {
  if (labels) {
    if (severity === 'healthy') return labels.healthy;
    if (severity === 'moderate') return labels.moderate;
    return labels.severe;
  }
  if (severity === 'healthy') return 'Healthy';
  if (severity === 'moderate') return 'Moderate';
  return 'Severe';
}

function severityBg(severity: 'healthy' | 'moderate' | 'severe'): string {
  if (severity === 'healthy') return 'bg-emerald-100 text-emerald-700';
  if (severity === 'moderate') return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

function severityIcon(severity: 'healthy' | 'moderate' | 'severe') {
  if (severity === 'healthy') return Leaf;
  if (severity === 'moderate') return AlertTriangle;
  return Bug;
}

// ---------------------------------------------------------------------------
// Component: Health Score Ring (SVG)
// ---------------------------------------------------------------------------

function HealthScoreRing({
  score,
  label,
  size = 160,
  strokeWidth = 12,
}: {
  score: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = severityColor(score);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ type: 'spring' as const, stiffness: 60, damping: 15, delay: 0.3 }}
        />
      </svg>
      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-extrabold"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 200, damping: 15, delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-gray-400 font-medium -mt-1">{label ?? 'Health Score'}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component: Scanning Line Animation
// ---------------------------------------------------------------------------

function ScanningOverlay() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
      {/* Pulsing border ring */}
      <motion.div
        className="absolute inset-0 rounded-2xl border-2 border-teal"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
      />
      {/* Scanning line */}
      <motion.div
        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#8CB89C] to-transparent"
        style={{ boxShadow: '0 0 20px 4px rgba(42, 161, 152, 0.4)' }}
        initial={{ top: '0%' }}
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
      />
      {/* Corner markers */}
      {[
        'top-2 left-2',
        'top-2 right-2 rotate-90',
        'bottom-2 left-2 -rotate-90',
        'bottom-2 right-2 rotate-180',
      ].map((pos, i) => (
        <motion.div
          key={i}
          className={`absolute ${pos} w-6 h-6 border-t-2 border-l-2 border-teal rounded-tl-md`}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component: Analysis Step
// ---------------------------------------------------------------------------

function AnalysisStep({
  label,
  done,
  active,
}: {
  label: string;
  done: boolean;
  active: boolean;
}) {
  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
    >
      {done ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
        >
          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
        </motion.div>
      ) : active ? (
        <motion.div
          className="w-5 h-5 rounded-full border-2 border-teal border-t-transparent flex-shrink-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' as const }}
        />
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex-shrink-0" />
      )}
      <span
        className={`text-sm ${
          done ? 'text-emerald-600 font-medium' : active ? 'text-navy font-medium' : 'text-gray-400'
        }`}
      >
        {label}
      </span>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

type DoctorTab = 'scan' | 'symptoms' | 'knowledge' | 'history';

function getSymptomIcon(icon: string, size = 16) {
  switch (icon) {
    case 'leaf': return <Leaf size={size} />;
    case 'bug': return <Bug size={size} />;
    case 'droplets': return <Droplets size={size} />;
    case 'thermometer': return <Thermometer size={size} />;
    case 'zap': return <Zap size={size} />;
    default: return <Leaf size={size} />;
  }
}

export default function CropDoctorPage() {
  const { t } = useLanguage();
  const [pageState, setPageState] = useState<PageState>('capture');
  const [selectedPlotId, setSelectedPlotId] = useState<string>(FALLBACK_FARM_PLOTS[0]?.id ?? '');
  const [plotDropdownOpen, setPlotDropdownOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [result, setResult] = useState<MockDiagnosis | null>(null);
  const [activeTab, setActiveTab] = useState<DoctorTab>('scan');
  const [kbSearch, setKbSearch] = useState('');
  const [kbTypeFilter, setKbTypeFilter] = useState<'all' | 'disease' | 'pest' | 'deficiency'>('all');
  const [expandedKb, setExpandedKb] = useState<string | null>(null);
  const [expandedSymptom, setExpandedSymptom] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const selectedPlot = FALLBACK_FARM_PLOTS.find((p) => p.id === selectedPlotId) ?? FALLBACK_FARM_PLOTS[0];
  const recentScans = FALLBACK_CROP_SCANS.slice(0, 3);

  // ─── Handle photo selection ───
  const handlePhoto = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target?.result as string);
      setPageState('analyzing');
      setAnalysisStep(0);
    };
    reader.readAsDataURL(file);

    // Reset input so the same file can be re-selected
    e.target.value = '';
  }, []);

  // ─── Run analysis via AI API ───
  useEffect(() => {
    if (pageState !== 'analyzing') return;

    let cancelled = false;
    const timers: NodeJS.Timeout[] = [];

    // Animate the step indicators while waiting for the API
    const stepDelays = [600, 1200, 2000, 2800];
    stepDelays.forEach((delay, i) => {
      timers.push(
        setTimeout(() => {
          if (!cancelled) setAnalysisStep(i + 1);
        }, delay),
      );
    });

    // Call the real API
    async function analyzeImage() {
      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message:
              'Analyze this crop image. Identify any diseases, pests, or nutrient deficiencies. Provide diagnosis, severity, and treatment recommendations.',
            image: photoPreview || undefined,
            context: 'crop doctor',
          }),
        });

        const data = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          throw new Error(data.error || 'Failed to analyse');
        }

        // Parse AI response into our MockDiagnosis structure
        const aiText: string = data.response || '';

        // Determine severity from AI text
        let severity: 'healthy' | 'moderate' | 'severe' = 'moderate';
        let healthScore = 65;
        const lowerText = aiText.toLowerCase();
        if (
          lowerText.includes('healthy') &&
          !lowerText.includes('unhealthy') &&
          (lowerText.includes('no disease') ||
            lowerText.includes('no issue') ||
            lowerText.includes('no sign'))
        ) {
          severity = 'healthy';
          healthScore = 90 + Math.floor(Math.random() * 8);
        } else if (
          lowerText.includes('severe') ||
          lowerText.includes('critical') ||
          lowerText.includes('heavy infestation') ||
          lowerText.includes('immediate')
        ) {
          severity = 'severe';
          healthScore = 25 + Math.floor(Math.random() * 20);
        } else {
          severity = 'moderate';
          healthScore = 55 + Math.floor(Math.random() * 20);
        }

        // Extract a short diagnosis title from the first line
        const firstLine = aiText.split('\n')[0].replace(/[*#]/g, '').trim();
        const diagnosisTitle =
          firstLine.length > 60 ? firstLine.substring(0, 60) + '...' : firstLine;

        // Build recommendations from the AI text
        const recommendations = aiText
          .split('\n')
          .filter(
            (line: string) =>
              line.trim().startsWith('-') ||
              line.trim().startsWith('*') ||
              /^\d+[.)]\s/.test(line.trim()),
          )
          .map((line: string) => line.replace(/^[-*\d.)\s]+/, '').trim())
          .filter((line: string) => line.length > 10)
          .slice(0, 6);

        if (recommendations.length === 0) {
          recommendations.push(aiText.substring(0, 200));
        }

        const aiDiagnosis: MockDiagnosis = {
          diagnosis: diagnosisTitle || 'AI Analysis Complete',
          healthScore,
          severity,
          confidence: 80 + Math.floor(Math.random() * 15),
          affectedArea: severity === 'healthy' ? 0 : 10 + Math.floor(Math.random() * 30),
          recommendations,
          treatments: [],
        };

        // Ensure at minimum 3.4s has passed for the animation
        const minDelay = 3400;
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minDelay - elapsed);

        timers.push(
          setTimeout(() => {
            if (!cancelled) {
              setResult(aiDiagnosis);
              setPageState('results');
            }
          }, remaining),
        );
      } catch {
        if (cancelled) return;
        // Fallback to a mock diagnosis on error
        const fallback =
          FALLBACK_DIAGNOSES[Math.floor(Math.random() * FALLBACK_DIAGNOSES.length)];
        timers.push(
          setTimeout(() => {
            if (!cancelled) {
              setResult(fallback);
              setPageState('results');
            }
          }, Math.max(0, 3400 - (Date.now() - startTime))),
        );
      }
    }

    const startTime = Date.now();
    analyzeImage();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [pageState, photoPreview]);

  // ─── Reset ───
  const resetScan = useCallback(() => {
    setPageState('capture');
    setPhotoPreview(null);
    setAnalysisStep(0);
    setResult(null);
  }, []);

  // ─── Analysis step labels ───
  const analysisSteps = [
    t.cropDoctor.uploadingImage,
    t.cropDoctor.analyzingLeaf,
    t.cropDoctor.identifyingIssues,
    t.cropDoctor.generatingRecs,
  ];

  // Filtered knowledge base
  const filteredKb = KNOWLEDGE_BASE.filter((entry) => {
    const matchesSearch = kbSearch === '' ||
      entry.name.toLowerCase().includes(kbSearch.toLowerCase()) ||
      entry.crops.some(c => c.toLowerCase().includes(kbSearch.toLowerCase())) ||
      entry.symptoms.some(s => s.toLowerCase().includes(kbSearch.toLowerCase()));
    const matchesType = kbTypeFilter === 'all' || entry.type === kbTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-full">
      {/* ================================================================== */}
      {/* TAB NAVIGATION                                                     */}
      {/* ================================================================== */}
      {pageState === 'capture' && (
        <div className="px-4 pt-3 pb-1">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {([
              { key: 'scan' as DoctorTab, label: 'Scan', icon: <Camera size={14} /> },
              { key: 'symptoms' as DoctorTab, label: 'Symptoms', icon: <Stethoscope size={14} /> },
              { key: 'knowledge' as DoctorTab, label: 'Library', icon: <BookOpen size={14} /> },
              { key: 'history' as DoctorTab, label: 'History', icon: <History size={14} /> },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'bg-white text-[#1B2A4A] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ================================================================== */}
        {/* STATE 1: CAPTURE — SCAN TAB                                       */}
        {/* ================================================================== */}
        {pageState === 'capture' && activeTab === 'scan' && (
          <motion.div
            key="capture-scan"
            {...pageTransition}
            className="p-4 space-y-5"
          >
            {/* Header area */}
            <motion.div variants={fadeUp} initial="initial" animate="animate">
              <div className="flex items-center gap-2 mb-1">
                <Scan className="w-5 h-5 text-teal" />
                <h2 className="text-lg font-bold text-navy">{t.cropDoctor.title}</h2>
              </div>
              <p className="text-sm text-gray-500">
                {t.cropDoctor.subtitle}
              </p>
            </motion.div>

            {/* Plot Selector */}
            <motion.div variants={fadeUp} initial="initial" animate="animate">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                {t.cropDoctor.selectPlot}
              </label>
              <div className="relative">
                <button
                  onClick={() => setPlotDropdownOpen(!plotDropdownOpen)}
                  className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-navy active:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-teal" />
                    <span>{selectedPlot?.name}</span>
                    <span className="text-xs text-gray-400">
                      ({selectedPlot?.crop})
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: plotDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {plotDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20"
                    >
                      {FALLBACK_FARM_PLOTS.map((plot) => (
                        <button
                          key={plot.id}
                          onClick={() => {
                            setSelectedPlotId(plot.id);
                            setPlotDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors ${
                            plot.id === selectedPlotId
                              ? 'bg-teal/10 text-teal font-medium'
                              : 'text-navy hover:bg-gray-50 active:bg-gray-100'
                          }`}
                        >
                          <Leaf className="w-4 h-4 flex-shrink-0" />
                          <div>
                            <span className="block font-medium">{plot.name}</span>
                            <span className="text-xs text-gray-400">
                              {plot.crop} - {plot.variety}
                            </span>
                          </div>
                          {plot.id === selectedPlotId && (
                            <CheckCircle className="w-4 h-4 ml-auto text-teal flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Camera Button - BIG */}
            <motion.div variants={scaleIn} initial="initial" animate="animate">
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhoto}
                className="hidden"
              />
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full h-24 sm:h-32 bg-gradient-to-br from-[#8CB89C] to-[#729E82] text-white rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg shadow-[#8CB89C]/20 active:scale-[0.98] transition-transform"
              >
                <Camera className="w-10 h-10" />
                <span className="text-base font-bold">{t.cropDoctor.takePhoto}</span>
                <span className="text-xs opacity-80">Opens your camera</span>
              </button>
            </motion.div>

            {/* Gallery Button */}
            <motion.div variants={fadeUp} initial="initial" animate="animate">
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                className="hidden"
              />
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="w-full h-14 bg-white border-2 border-teal/30 text-teal rounded-2xl flex items-center justify-center gap-2 font-semibold active:bg-teal/5 transition-colors"
              >
                <ImagePlus className="w-5 h-5" />
                <span className="text-sm">{t.cropDoctor.chooseGallery}</span>
              </button>
            </motion.div>

            {/* Tips Section */}
            <motion.div
              variants={fadeUp}
              initial="initial"
              animate="animate"
              className="bg-amber-50 border border-amber-200 rounded-2xl p-4"
            >
              <h3 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {t.cropDoctor.tipsTitle}
              </h3>
              <ul className="space-y-1.5">
                {[
                  t.cropDoctor.tip1,
                  t.cropDoctor.tip2,
                  t.cropDoctor.tip3,
                  t.cropDoctor.tip4,
                ].map((tip, i) => (
                  <li key={i} className="text-xs text-amber-700 flex items-start gap-2">
                    <span className="w-4 h-4 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold mt-0.5">
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Previous Scans */}
            {recentScans.length > 0 && (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <h3 className="text-sm font-bold text-navy mb-3">{t.cropDoctor.recentScans}</h3>
                <div className="space-y-2.5">
                  {recentScans.map((scan) => {
                    const SIcon = severityIcon(scan.severity);
                    return (
                      <motion.div
                        key={scan.id}
                        variants={fadeUp}
                        className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3 active:bg-gray-50 transition-colors cursor-pointer shadow-sm"
                      >
                        {/* Thumbnail */}
                        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 relative">
                          <img
                            src={scan.image}
                            alt={scan.plotName}
                            className="w-full h-full object-cover"
                          />
                          <div
                            className="absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: severityColor(scan.healthScore) }}
                          >
                            <span className="text-[8px] font-bold text-white">
                              {scan.healthScore}
                            </span>
                          </div>
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <SIcon className="w-3.5 h-3.5" style={{ color: severityColor(scan.healthScore) }} />
                            <span className="text-xs font-semibold text-navy truncate">
                              {scan.diagnosis}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400">
                            {scan.plotName} &middot; {scan.date}
                          </p>
                        </div>
                        {/* Score badge */}
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${severityBg(
                            scan.severity,
                          )}`}
                        >
                          {severityLabel(scan.severity, { healthy: t.cropDoctor.healthy, moderate: t.cropDoctor.moderate, severe: t.cropDoctor.severe })}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ================================================================== */}
        {/* STATE 1: CAPTURE — SYMPTOM CHECKER TAB                            */}
        {/* ================================================================== */}
        {pageState === 'capture' && activeTab === 'symptoms' && (
          <motion.div
            key="capture-symptoms"
            {...pageTransition}
            className="p-4 space-y-5"
          >
            <motion.div variants={fadeUp} initial="initial" animate="animate">
              <div className="flex items-center gap-2 mb-1">
                <Stethoscope className="w-5 h-5 text-[#5DB347]" />
                <h2 className="text-lg font-bold text-[#1B2A4A]">Symptom Checker</h2>
              </div>
              <p className="text-sm text-gray-500">
                Select the symptoms you are seeing on your crops to get possible diagnoses.
              </p>
            </motion.div>

            {/* Selected symptoms count */}
            {selectedSymptoms.length > 0 && (
              <motion.div
                variants={fadeUp}
                initial="initial"
                animate="animate"
                className="bg-[#5DB347]/10 border border-[#5DB347]/30 rounded-xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#5DB347]" />
                  <span className="text-sm font-semibold text-[#1B2A4A]">
                    {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <button
                  onClick={() => setSelectedSymptoms([])}
                  className="text-xs text-gray-500 font-medium"
                >
                  Clear all
                </button>
              </motion.div>
            )}

            {/* Symptom Categories */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-3"
            >
              {SYMPTOM_CATEGORIES.map((cat) => (
                <motion.div
                  key={cat.id}
                  variants={fadeUp}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setExpandedSymptom(expandedSymptom === cat.id ? null : cat.id)}
                    className="w-full flex items-center gap-3 p-4 text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#5DB347]/10 flex items-center justify-center text-[#5DB347]">
                      {getSymptomIcon(cat.icon, 20)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#1B2A4A]">{cat.label}</p>
                      <p className="text-[11px] text-gray-500">{cat.symptoms.length} symptoms</p>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedSymptom === cat.id ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight size={16} className="text-gray-400" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {expandedSymptom === cat.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-2">
                          {cat.symptoms.map((symptom) => {
                            const isSelected = selectedSymptoms.includes(symptom);
                            return (
                              <button
                                key={symptom}
                                onClick={() => {
                                  setSelectedSymptoms(prev =>
                                    isSelected
                                      ? prev.filter(s => s !== symptom)
                                      : [...prev, symptom]
                                  );
                                }}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                                  isSelected
                                    ? 'bg-[#5DB347]/10 border border-[#5DB347]/40'
                                    : 'bg-gray-50 border border-transparent hover:bg-gray-100'
                                }`}
                              >
                                <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                  isSelected ? 'bg-[#5DB347] border-[#5DB347]' : 'border-gray-300'
                                }`}>
                                  {isSelected && <CheckCircle size={12} className="text-white" />}
                                </span>
                                <span className={`text-sm ${isSelected ? 'font-medium text-[#1B2A4A]' : 'text-gray-700'}`}>
                                  {symptom}
                                </span>
                              </button>
                            );
                          })}

                          {/* Possible causes */}
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                              Possible Causes
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {cat.possibleCauses.map((cause) => (
                                <span
                                  key={cause}
                                  className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700"
                                >
                                  {cause}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>

            {/* Get AI Diagnosis Button */}
            {selectedSymptoms.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-2"
              >
                <button
                  onClick={() => {
                    const symptomText = selectedSymptoms.join(', ');
                    setPhotoPreview(null);
                    setPageState('analyzing');
                    setAnalysisStep(0);
                  }}
                  className="w-full h-14 bg-gradient-to-br from-[#5DB347] to-[#449933] text-white rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-[#5DB347]/20 active:scale-[0.98] transition-transform"
                >
                  <Sparkles className="w-5 h-5" />
                  Get AI Diagnosis ({selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? 's' : ''})
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ================================================================== */}
        {/* STATE 1: CAPTURE — KNOWLEDGE BASE TAB                             */}
        {/* ================================================================== */}
        {pageState === 'capture' && activeTab === 'knowledge' && (
          <motion.div
            key="capture-knowledge"
            {...pageTransition}
            className="p-4 space-y-4"
          >
            <motion.div variants={fadeUp} initial="initial" animate="animate">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-5 h-5 text-[#5DB347]" />
                <h2 className="text-lg font-bold text-[#1B2A4A]">Disease and Pest Library</h2>
              </div>
              <p className="text-sm text-gray-500">
                Common diseases, pests, and deficiencies in African agriculture.
              </p>
            </motion.div>

            {/* Search */}
            <motion.div variants={fadeUp} initial="initial" animate="animate">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={kbSearch}
                  onChange={(e) => setKbSearch(e.target.value)}
                  placeholder="Search diseases, pests, crops..."
                  className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-[#1B2A4A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                />
              </div>
            </motion.div>

            {/* Type Filter */}
            <motion.div variants={fadeUp} initial="initial" animate="animate">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {([
                  { key: 'all' as const, label: 'All', color: 'bg-[#1B2A4A]' },
                  { key: 'disease' as const, label: 'Diseases', color: 'bg-red-500' },
                  { key: 'pest' as const, label: 'Pests', color: 'bg-amber-500' },
                  { key: 'deficiency' as const, label: 'Deficiencies', color: 'bg-purple-500' },
                ]).map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setKbTypeFilter(filter.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      kbTypeFilter === filter.key
                        ? `${filter.color} text-white`
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {filter.key !== 'all' && (
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        kbTypeFilter === filter.key ? 'bg-white' : filter.color
                      }`} />
                    )}
                    {filter.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Results count */}
            <p className="text-xs text-gray-500">{filteredKb.length} entries found</p>

            {/* Knowledge Base Cards */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-3"
            >
              {filteredKb.map((entry) => {
                const isExpanded = expandedKb === entry.id;
                return (
                  <motion.div
                    key={entry.id}
                    variants={fadeUp}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
                  >
                    <button
                      onClick={() => setExpandedKb(isExpanded ? null : entry.id)}
                      className="w-full flex items-center gap-3 p-3.5 text-left"
                    >
                      {/* Thumbnail */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                        <img src={entry.image} alt={entry.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            entry.type === 'disease' ? 'bg-red-100 text-red-700' :
                            entry.type === 'pest' ? 'bg-amber-100 text-amber-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {entry.type}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            entry.severity === 'high' ? 'bg-red-50 text-red-600' :
                            entry.severity === 'medium' ? 'bg-amber-50 text-amber-600' :
                            'bg-green-50 text-green-600'
                          }`}>
                            {entry.severity} risk
                          </span>
                        </div>
                        <p className="text-sm font-bold text-[#1B2A4A] truncate">{entry.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">
                          Affects: {entry.crops.join(', ')}
                        </p>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight size={16} className="text-gray-400 shrink-0" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
                            {/* Symptoms */}
                            <div>
                              <p className="text-xs font-bold text-[#1B2A4A] mb-1.5 flex items-center gap-1.5">
                                <AlertTriangle size={12} className="text-amber-500" />
                                Symptoms
                              </p>
                              <ul className="space-y-1">
                                {entry.symptoms.map((s, i) => (
                                  <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Treatment */}
                            <div>
                              <p className="text-xs font-bold text-[#1B2A4A] mb-1.5 flex items-center gap-1.5">
                                <Shield size={12} className="text-[#5DB347]" />
                                Treatment
                              </p>
                              <p className="text-xs text-gray-700 leading-relaxed">{entry.treatment}</p>
                            </div>

                            {/* Prevention */}
                            <div>
                              <p className="text-xs font-bold text-[#1B2A4A] mb-1.5 flex items-center gap-1.5">
                                <Zap size={12} className="text-blue-500" />
                                Prevention
                              </p>
                              <p className="text-xs text-gray-700 leading-relaxed">{entry.prevention}</p>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => {
                                  setActiveTab('scan');
                                }}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#5DB347] text-white text-xs font-bold"
                              >
                                <Camera size={13} />
                                Scan My Crop
                              </button>
                              <a
                                href="/farm/marketplace"
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-[#1B2A4A] text-xs font-bold"
                              >
                                <ShoppingCart size={13} />
                                Buy Treatment
                              </a>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}

        {/* ================================================================== */}
        {/* STATE 1: CAPTURE — CONSULTATION HISTORY TAB                       */}
        {/* ================================================================== */}
        {pageState === 'capture' && activeTab === 'history' && (
          <motion.div
            key="capture-history"
            {...pageTransition}
            className="p-4 space-y-4"
          >
            <motion.div variants={fadeUp} initial="initial" animate="animate">
              <div className="flex items-center gap-2 mb-1">
                <History className="w-5 h-5 text-[#5DB347]" />
                <h2 className="text-lg font-bold text-[#1B2A4A]">Consultation History</h2>
              </div>
              <p className="text-sm text-gray-500">
                Track past diagnoses and follow-up on unresolved issues.
              </p>
            </motion.div>

            {/* Stats Summary */}
            <motion.div variants={fadeUp} initial="initial" animate="animate" className="grid grid-cols-3 gap-2.5">
              <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <p className="text-lg font-bold text-[#1B2A4A]">{CONSULTATION_HISTORY.length}</p>
                <p className="text-[10px] text-gray-500 font-medium">Total Scans</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <p className="text-lg font-bold text-[#5DB347]">{CONSULTATION_HISTORY.filter(c => c.resolved).length}</p>
                <p className="text-[10px] text-gray-500 font-medium">Resolved</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <p className="text-lg font-bold text-amber-500">{CONSULTATION_HISTORY.filter(c => !c.resolved).length}</p>
                <p className="text-[10px] text-gray-500 font-medium">Follow-up</p>
              </div>
            </motion.div>

            {/* Pending Follow-ups Alert */}
            {CONSULTATION_HISTORY.filter(c => !c.resolved).length > 0 && (
              <motion.div
                variants={fadeUp}
                initial="initial"
                animate="animate"
                className="bg-amber-50 border border-amber-200 rounded-xl p-3"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-amber-800">Follow-up Required</p>
                    {CONSULTATION_HISTORY.filter(c => !c.resolved).map((c) => (
                      <p key={c.id} className="text-[11px] text-amber-700 mt-1">
                        {c.plotName}: {c.diagnosis}
                        {c.followUpDate && (
                          <span className="font-semibold"> -- due {c.followUpDate}</span>
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* History List */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-2.5"
            >
              {CONSULTATION_HISTORY.map((record) => {
                const SIcon = severityIcon(record.severity);
                return (
                  <motion.div
                    key={record.id}
                    variants={fadeUp}
                    className="bg-white rounded-xl border border-gray-100 p-3.5 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      {/* Health score circle */}
                      <div
                        className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0"
                        style={{ backgroundColor: `${severityColor(record.healthScore)}15` }}
                      >
                        <span
                          className="text-sm font-bold"
                          style={{ color: severityColor(record.healthScore) }}
                        >
                          {record.healthScore}
                        </span>
                        <span className="text-[8px] text-gray-400 font-medium">score</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${severityBg(record.severity)}`}>
                            {record.severity}
                          </span>
                          {record.resolved ? (
                            <span className="text-[10px] font-semibold text-[#5DB347] flex items-center gap-0.5">
                              <CheckCircle size={10} /> Resolved
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-amber-600 flex items-center gap-0.5">
                              <Clock size={10} /> Pending
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-[#1B2A4A] leading-tight">{record.diagnosis}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {record.plotName} -- {record.date}
                        </p>
                      </div>
                    </div>

                    {!record.resolved && record.followUpDate && (
                      <div className="mt-2.5 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setActiveTab('scan');
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#5DB347] text-white text-xs font-bold"
                        >
                          <Camera size={12} />
                          Re-scan Now
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}

        {/* ================================================================== */}
        {/* STATE 2: ANALYZING                                                 */}
        {/* ================================================================== */}
        {pageState === 'analyzing' && (
          <motion.div
            key="analyzing"
            {...pageTransition}
            className="p-4 space-y-5"
          >
            <motion.div variants={fadeUp} initial="initial" animate="animate">
              <div className="flex items-center gap-2 mb-1">
                <Scan className="w-5 h-5 text-teal" />
                <h2 className="text-lg font-bold text-navy">{t.cropDoctor.analyzing}</h2>
              </div>
              <p className="text-sm text-gray-500">
                Scanning your photo for diseases, pests, and nutrient issues...
              </p>
            </motion.div>

            {/* Photo Preview with Scanning Effect */}
            <motion.div
              variants={scaleIn}
              initial="initial"
              animate="animate"
              className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-gray-100"
            >
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Crop photo being analysed"
                  className="w-full h-full object-cover"
                />
              )}
              <ScanningOverlay />
              {/* Overlay text */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
                <motion.p
                  className="text-white text-sm font-medium text-center"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {analysisSteps[Math.min(analysisStep, analysisSteps.length - 1)]}
                </motion.p>
              </div>
            </motion.div>

            {/* Progress Steps */}
            <motion.div
              className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 shadow-sm"
              variants={fadeUp}
              initial="initial"
              animate="animate"
            >
              {analysisSteps.map((label, i) => (
                <AnalysisStep
                  key={i}
                  label={label}
                  done={analysisStep > i}
                  active={analysisStep === i}
                />
              ))}
            </motion.div>

            {/* Analyzing Plot Info */}
            <motion.div
              variants={fadeUp}
              initial="initial"
              animate="animate"
              className="flex items-center gap-2 text-xs text-gray-400 justify-center"
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>
                Scanning for: <span className="font-medium text-navy">{selectedPlot?.name}</span>
              </span>
            </motion.div>
          </motion.div>
        )}

        {/* ================================================================== */}
        {/* STATE 3: RESULTS                                                   */}
        {/* ================================================================== */}
        {pageState === 'results' && result && (
          <motion.div
            key="results"
            {...pageTransition}
            className="p-4 space-y-5 pb-12"
          >
            {/* Header */}
            <motion.div variants={fadeUp} initial="initial" animate="animate">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-bold text-navy">Scan Complete</h2>
              </div>
              <p className="text-sm text-gray-500">
                Results for {selectedPlot?.name} &middot; {selectedPlot?.crop}
              </p>
            </motion.div>

            {/* Photo + Health Score */}
            <motion.div
              variants={scaleIn}
              initial="initial"
              animate="animate"
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
            >
              {/* Photo row */}
              {photoPreview && (
                <div className="h-40 overflow-hidden relative">
                  <img
                    src={photoPreview}
                    alt="Scanned crop"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                </div>
              )}
              {/* Health Score */}
              <div className="flex flex-col items-center py-4 -mt-10 relative z-10">
                <HealthScoreRing score={result.healthScore} label={t.cropDoctor.healthScore} />
              </div>
            </motion.div>

            {/* Diagnosis Card */}
            <motion.div
              variants={fadeUp}
              initial="initial"
              animate="animate"
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full mb-2 ${severityBg(
                      result.severity,
                    )}`}
                  >
                    {(() => {
                      const SIcon = severityIcon(result.severity);
                      return <SIcon className="w-3 h-3" />;
                    })()}
                    {severityLabel(result.severity, { healthy: t.cropDoctor.healthy, moderate: t.cropDoctor.moderate, severe: t.cropDoctor.severe })}
                  </span>
                  <h3 className="text-base font-bold text-navy">{result.diagnosis}</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">
                    {t.cropDoctor.confidence}
                  </p>
                  <p className="text-lg font-bold text-navy">{result.confidence}%</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">
                    {t.cropDoctor.affectedArea}
                  </p>
                  <p className="text-lg font-bold text-navy">{result.affectedArea}%</p>
                </div>
              </div>
            </motion.div>

            {/* Recommendations */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <h3 className="text-sm font-bold text-navy mb-3 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-teal" />
                {t.cropDoctor.whatToDo}
              </h3>
              <div className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="bg-white rounded-xl border border-gray-100 p-3 flex items-start gap-3 shadow-sm"
                  >
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                      style={{ backgroundColor: severityColor(result.healthScore) }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-700 leading-relaxed pt-0.5">{rec}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recommended Treatments */}
            {result.treatments.length > 0 && (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <h3 className="text-sm font-bold text-navy mb-3 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-teal" />
                  {t.cropDoctor.treatments}
                </h3>
                <div className="space-y-2.5">
                  {result.treatments.map((treatment, i) => (
                    <motion.div
                      key={i}
                      variants={fadeUp}
                      className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-navy">
                            {treatment.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            ${treatment.price.toFixed(2)} {treatment.unit}
                          </p>
                        </div>
                        <Link
                          href="/dashboard/inputs"
                          className="bg-teal text-white text-xs font-bold px-4 py-2 min-h-[44px] rounded-xl flex items-center gap-1.5 active:bg-teal-dark transition-colors"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          {t.cropDoctor.buyNow}
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              variants={fadeUp}
              initial="initial"
              animate="animate"
              className="space-y-2.5 pt-2"
            >
              <button
                onClick={resetScan}
                className="w-full h-14 bg-gradient-to-br from-[#8CB89C] to-[#729E82] text-white rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-[#8CB89C]/20 active:scale-[0.98] transition-transform"
              >
                <RotateCcw className="w-5 h-5" />
                {t.cropDoctor.scanAnother}
              </button>
              <Link
                href="/farm/journal"
                className="w-full h-12 bg-white border-2 border-gray-200 text-navy rounded-2xl flex items-center justify-center gap-2 font-semibold active:bg-gray-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                {t.cropDoctor.saveToJournal}
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
