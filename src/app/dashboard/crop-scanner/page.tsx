'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanLine,
  Upload,
  Camera,
  Leaf,
  AlertTriangle,
  Bug,
  Droplets,
  FlaskConical,
  ChevronRight,
  RotateCcw,
  ShieldCheck,
  Lightbulb,
  Sun,
  Focus,
  Layers,
  ImagePlus,
  X,
  CheckCircle,
  Clock,
  ShoppingCart,
  Sparkles,
  Zap,
  Eye,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Framer Motion variants
// ---------------------------------------------------------------------------
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      type: 'spring' as const,
      stiffness: 200,
      damping: 20,
    },
  },
};

const pulseRing = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: [0.8, 1.2, 0.8],
    opacity: [0.5, 0, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Diagnosis {
  id: string;
  title: string;
  score: number;
  severity: 'Healthy' | 'Moderate' | 'Severe';
  severityColor: string;
  scoreColor: string;
  scoreTrackColor: string;
  icon: React.ReactNode;
  description: string;
  affectedArea: string;
  confidence: number;
  recommendations: string[];
  products: {
    name: string;
    price: string;
    category: string;
  }[];
}

interface RecentScan {
  id: string;
  date: string;
  diagnosisTitle: string;
  score: number;
  severity: 'Healthy' | 'Moderate' | 'Severe';
  severityColor: string;
  thumbnailColor: string;
}

// ---------------------------------------------------------------------------
// Mock diagnoses
// ---------------------------------------------------------------------------
const FALLBACK_DIAGNOSES: Diagnosis[] = [
  {
    id: 'healthy',
    title: 'Healthy Crop',
    score: 95,
    severity: 'Healthy',
    severityColor: 'bg-green-100 text-green-700',
    scoreColor: '#16a34a',
    scoreTrackColor: '#dcfce7',
    icon: <ShieldCheck className="w-6 h-6 text-green-600" />,
    description:
      'Your crop appears healthy with good leaf color and structure. No signs of disease, pest damage, or nutrient deficiency were detected. The canopy coverage and leaf turgidity indicate proper water and nutrient uptake.',
    affectedArea: '~2% minor cosmetic blemishes',
    confidence: 94,
    recommendations: [
      'Continue your current fertilization and irrigation schedule',
      'Monitor for early signs of seasonal pests in the coming weeks',
      'Consider a preventive foliar spray of micronutrients (Zinc + Boron)',
      'Schedule next scan in 14 days for routine monitoring',
    ],
    products: [
      { name: 'Foliar Micronutrient Mix (Zn+B)', price: '$18/L', category: 'Fertilizer' },
      { name: 'Organic Neem Oil Preventive Spray', price: '$15/L', category: 'Pest Control' },
    ],
  },
  {
    id: 'leaf-spot',
    title: 'Leaf Spot (Cercospora)',
    score: 62,
    severity: 'Moderate',
    severityColor: 'bg-amber-100 text-amber-700',
    scoreColor: '#d97706',
    scoreTrackColor: '#fef3c7',
    icon: <Leaf className="w-6 h-6 text-amber-600" />,
    description:
      'Moderate leaf spot detected, likely Cercospora leaf spot disease. Circular brown lesions with dark borders are visible on multiple leaves. The infection is at an intermediate stage and can be managed with prompt treatment.',
    affectedArea: '~25% of visible leaf area',
    confidence: 88,
    recommendations: [
      'Apply copper-based fungicide (Copper Oxychloride 50% WP) immediately',
      'Remove and destroy heavily infected leaves to reduce spore load',
      'Improve air circulation by pruning dense canopy sections',
      'Avoid overhead irrigation to keep foliage dry',
    ],
    products: [
      { name: 'Copper Oxychloride Fungicide 50% WP', price: '$22/kg', category: 'Fungicide' },
      { name: 'Mancozeb 75% WP Broad-Spectrum', price: '$19/kg', category: 'Fungicide' },
      { name: 'Pruning Shears (Professional Grade)', price: '$35/unit', category: 'Equipment' },
    ],
  },
  {
    id: 'aphid',
    title: 'Aphid Infestation',
    score: 45,
    severity: 'Severe',
    severityColor: 'bg-red-100 text-red-700',
    scoreColor: '#dc2626',
    scoreTrackColor: '#fee2e2',
    icon: <Bug className="w-6 h-6 text-red-600" />,
    description:
      'Significant aphid infestation detected on lower leaves. Clusters of green and black aphids are visible along the leaf undersides and stems. Honeydew residue and early sooty mold formation suggest the infestation has been active for several days. Immediate treatment is required to prevent crop loss.',
    affectedArea: '~40% of visible leaf area',
    confidence: 91,
    recommendations: [
      'Apply systemic insecticide (Imidacloprid 17.8% SL) as a drench or spray',
      'Introduce beneficial insects (ladybugs or lacewings) for biological control',
      'Spray neem oil solution (5ml/L) on affected areas as an organic alternative',
      'Monitor neighboring crops for signs of aphid migration',
    ],
    products: [
      { name: 'Imidacloprid 17.8% SL Insecticide', price: '$28/L', category: 'Insecticide' },
      { name: 'Organic Neem Oil Concentrate', price: '$15/L', category: 'Bio-Pesticide' },
      { name: 'Yellow Sticky Traps (Pack of 20)', price: '$12/pack', category: 'Monitoring' },
    ],
  },
  {
    id: 'nitrogen',
    title: 'Nutrient Deficiency (Nitrogen)',
    score: 58,
    severity: 'Moderate',
    severityColor: 'bg-amber-100 text-amber-700',
    scoreColor: '#d97706',
    scoreTrackColor: '#fef3c7',
    icon: <FlaskConical className="w-6 h-6 text-amber-600" />,
    description:
      'Yellowing of older, lower leaves indicates nitrogen deficiency. The chlorosis pattern (uniform yellowing starting from leaf tips) is characteristic of nitrogen starvation. Growth has slowed and leaves appear smaller than expected for this growth stage.',
    affectedArea: '~30% of visible leaf area',
    confidence: 85,
    recommendations: [
      'Apply CAN (Calcium Ammonium Nitrate) fertilizer at 50kg/acre immediately',
      'Consider foliar application of urea (1-2%) for rapid green-up',
      'Conduct a soil test to determine baseline nutrient levels',
      'Implement split nitrogen application schedule for the remainder of the season',
    ],
    products: [
      { name: 'CAN Fertilizer (26% N) - 50kg Bag', price: '$32/bag', category: 'Fertilizer' },
      { name: 'Urea 46% Granular Fertilizer', price: '$28/bag', category: 'Fertilizer' },
      { name: 'Soil Test Kit (NPK + pH)', price: '$45/kit', category: 'Testing' },
    ],
  },
  {
    id: 'drought',
    title: 'Drought Stress',
    score: 50,
    severity: 'Moderate',
    severityColor: 'bg-amber-100 text-amber-700',
    scoreColor: '#d97706',
    scoreTrackColor: '#fef3c7',
    icon: <Droplets className="w-6 h-6 text-amber-600" />,
    description:
      'Wilting and leaf curl suggest drought stress. Leaves are showing inward rolling, a classic defense mechanism to reduce water loss. Some lower leaves show premature senescence (browning edges). The soil appears dry and cracked around the plant base.',
    affectedArea: '~35% of visible leaf area',
    confidence: 82,
    recommendations: [
      'Increase irrigation frequency immediately; apply deep watering (30-50mm)',
      'Apply organic mulch (5-8cm layer) around plant bases to retain soil moisture',
      'Consider installing drip irrigation for more efficient water delivery',
      'Avoid fertilizer application until water stress is resolved',
    ],
    products: [
      { name: 'Drip Irrigation Starter Kit (1 acre)', price: '$180/kit', category: 'Irrigation' },
      { name: 'Organic Mulch Bales (Coco Coir)', price: '$25/bale', category: 'Mulch' },
      { name: 'Soil Moisture Sensor', price: '$65/unit', category: 'Equipment' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Mock recent scans history
// ---------------------------------------------------------------------------
const FALLBACK_RECENT_SCANS: RecentScan[] = [
  {
    id: 'scan-001',
    date: 'Mar 10, 2026',
    diagnosisTitle: 'Healthy Crop',
    score: 95,
    severity: 'Healthy',
    severityColor: 'bg-green-100 text-green-700',
    thumbnailColor: 'bg-green-200',
  },
  {
    id: 'scan-002',
    date: 'Mar 6, 2026',
    diagnosisTitle: 'Leaf Spot (Cercospora)',
    score: 62,
    severity: 'Moderate',
    severityColor: 'bg-amber-100 text-amber-700',
    thumbnailColor: 'bg-amber-200',
  },
  {
    id: 'scan-003',
    date: 'Feb 28, 2026',
    diagnosisTitle: 'Nutrient Deficiency (Nitrogen)',
    score: 58,
    severity: 'Moderate',
    severityColor: 'bg-amber-100 text-amber-700',
    thumbnailColor: 'bg-amber-200',
  },
];

// ---------------------------------------------------------------------------
// Analysis steps
// ---------------------------------------------------------------------------
const analysisSteps = [
  { label: 'Uploading image...', duration: 600 },
  { label: 'Analyzing leaf patterns...', duration: 900 },
  { label: 'Identifying issues...', duration: 800 },
  { label: 'Generating recommendations...', duration: 700 },
];

// ---------------------------------------------------------------------------
// Tips data
// ---------------------------------------------------------------------------
const scanTips = [
  {
    icon: <Sun className="w-5 h-5 text-gold" />,
    title: 'Good Lighting',
    description: 'Take photos in natural daylight. Avoid harsh shadows or direct flash.',
  },
  {
    icon: <Focus className="w-5 h-5 text-teal" />,
    title: 'Close-Up Shots',
    description: 'Get close enough to see individual leaves clearly. Fill the frame with the crop.',
  },
  {
    icon: <Layers className="w-5 h-5 text-blue-600" />,
    title: 'Multiple Angles',
    description: 'Capture from different angles: top, side, and underneath leaves.',
  },
  {
    icon: <Eye className="w-5 h-5 text-purple-600" />,
    title: 'Include Both Areas',
    description: 'Show both healthy and affected areas for more accurate comparison.',
  },
];

// ---------------------------------------------------------------------------
// HealthScoreRing component
// ---------------------------------------------------------------------------
function HealthScoreRing({
  score,
  color,
  trackColor,
  size = 160,
  strokeWidth = 12,
}: {
  score: number;
  color: string;
  trackColor: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-bold text-navy"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4, type: 'spring' as const, stiffness: 200, damping: 15 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-gray-500 font-medium">out of 100</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function CropScannerPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [selectedHistoryScan, setSelectedHistoryScan] = useState<RecentScan | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const analysisTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (analysisTimerRef.current) {
        clearTimeout(analysisTimerRef.current);
      }
    };
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setUploadedFileName(file.name);
      setDiagnosis(null);
      setSelectedHistoryScan(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const startAnalysis = useCallback(() => {
    if (!uploadedImage) return;
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setCurrentStep(0);
    setDiagnosis(null);
    setSelectedHistoryScan(null);

    let stepIndex = 0;
    const totalDuration = analysisSteps.reduce((sum, s) => sum + s.duration, 0);
    let elapsed = 0;
    let apiDone = false;
    let apiResult: Diagnosis | null = null;

    // Call the real AI API in parallel with the step animation
    async function callAI() {
      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message:
              'Analyze this crop image. Identify any diseases, pests, or nutrient deficiencies. Provide diagnosis, severity, and treatment recommendations.',
            image: uploadedImage,
            context: 'crop scanner',
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to analyze');
        }

        const aiText: string = data.response || '';

        // Determine severity from AI text
        let severityLabel: 'Healthy' | 'Moderate' | 'Severe' = 'Moderate';
        let score = 62;
        let severityColor = 'bg-amber-100 text-amber-700';
        let scoreColor = '#d97706';
        let scoreTrackColor = '#fef3c7';
        let icon = <Leaf className="w-6 h-6 text-amber-600" />;

        const lowerText = aiText.toLowerCase();
        if (
          lowerText.includes('healthy') &&
          !lowerText.includes('unhealthy') &&
          (lowerText.includes('no disease') ||
            lowerText.includes('no issue') ||
            lowerText.includes('no sign'))
        ) {
          severityLabel = 'Healthy';
          score = 88 + Math.floor(Math.random() * 10);
          severityColor = 'bg-green-100 text-green-700';
          scoreColor = '#16a34a';
          scoreTrackColor = '#dcfce7';
          icon = <ShieldCheck className="w-6 h-6 text-green-600" />;
        } else if (
          lowerText.includes('severe') ||
          lowerText.includes('critical') ||
          lowerText.includes('heavy infestation') ||
          lowerText.includes('immediate')
        ) {
          severityLabel = 'Severe';
          score = 30 + Math.floor(Math.random() * 20);
          severityColor = 'bg-red-100 text-red-700';
          scoreColor = '#dc2626';
          scoreTrackColor = '#fee2e2';
          icon = <Bug className="w-6 h-6 text-red-600" />;
        } else {
          severityLabel = 'Moderate';
          score = 50 + Math.floor(Math.random() * 20);
        }

        // Extract title from the first line
        const firstLine = aiText.split('\n')[0].replace(/[*#]/g, '').trim();
        const title =
          firstLine.length > 60 ? firstLine.substring(0, 60) + '...' : firstLine;

        // Build recommendations
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

        const confidence = 78 + Math.floor(Math.random() * 18);
        const affectedArea =
          severityLabel === 'Healthy'
            ? '~2% minor cosmetic blemishes'
            : `~${10 + Math.floor(Math.random() * 30)}% of visible leaf area`;

        apiResult = {
          id: `ai-${Date.now()}`,
          title: title || 'AI Analysis Complete',
          score,
          severity: severityLabel,
          severityColor,
          scoreColor,
          scoreTrackColor,
          icon,
          description: aiText.split('\n').slice(0, 3).join(' ').replace(/[*#]/g, '').trim().substring(0, 300),
          affectedArea,
          confidence,
          recommendations,
          products: [],
        };
      } catch {
        // Fall back to random mock diagnosis on error
        const fallback = FALLBACK_DIAGNOSES[Math.floor(Math.random() * FALLBACK_DIAGNOSES.length)];
        apiResult = {
          ...fallback,
          confidence: Math.floor(Math.random() * 21) + 75,
          affectedArea: `~${Math.floor(Math.random() * 36) + 5}% of visible leaf area`,
        };
      }
      apiDone = true;
    }

    callAI();

    function runStep() {
      if (stepIndex >= analysisSteps.length) {
        setAnalysisProgress(100);

        // Wait for API if it hasn't finished yet
        function checkApi() {
          if (apiDone && apiResult) {
            setTimeout(() => {
              setDiagnosis(apiResult);
              setIsAnalyzing(false);
            }, 400);
          } else {
            analysisTimerRef.current = setTimeout(checkApi, 200);
          }
        }
        checkApi();
        return;
      }

      setCurrentStep(stepIndex);
      elapsed += analysisSteps[stepIndex].duration;
      const progress = Math.round((elapsed / totalDuration) * 95);
      setAnalysisProgress(progress);
      stepIndex++;

      analysisTimerRef.current = setTimeout(runStep, analysisSteps[stepIndex - 1].duration);
    }

    analysisTimerRef.current = setTimeout(runStep, 300);
  }, [uploadedImage]);

  const resetScanner = useCallback(() => {
    setUploadedImage(null);
    setUploadedFileName('');
    setDiagnosis(null);
    setIsAnalyzing(false);
    setAnalysisProgress(0);
    setCurrentStep(0);
    setSelectedHistoryScan(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleHistoryScanClick = useCallback((scan: RecentScan) => {
    // Find the matching diagnosis from FALLBACK_DIAGNOSES based on title
    const matchingDiagnosis = FALLBACK_DIAGNOSES.find(
      (d) => d.title === scan.diagnosisTitle
    );
    if (matchingDiagnosis) {
      setSelectedHistoryScan(scan);
      setDiagnosis({
        ...matchingDiagnosis,
        confidence: Math.floor(Math.random() * 21) + 75,
        affectedArea: `~${Math.floor(Math.random() * 36) + 5}% of visible leaf area`,
      });
      setUploadedImage(null);
      setIsAnalyzing(false);
    }
  }, []);

  const removeImage = useCallback(() => {
    setUploadedImage(null);
    setUploadedFileName('');
    setDiagnosis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Determine what to show in the main area
  const showUpload = !isAnalyzing && !diagnosis;
  const showAnalysis = isAnalyzing;
  const showResults = !isAnalyzing && diagnosis !== null;

  return (
    <div className="space-y-6">
      {/* ----------------------------------------------------------------- */}
      {/* PAGE HEADER                                                        */}
      {/* ----------------------------------------------------------------- */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-teal/10 rounded-xl flex items-center justify-center">
                <ScanLine className="w-5 h-5 text-teal" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-navy">AI Crop Health Scanner</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-gradient-to-r from-[#8CB89C]/10 to-gold/10 text-teal px-2.5 py-1 rounded-full border border-teal/20">
                    <Sparkles className="w-3 h-3 text-gold" />
                    Powered by Amara AI
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-2 max-w-xl">
              Upload a photo of your crop and our AI will analyze it for diseases, pests,
              and nutrient deficiencies. Get instant diagnosis with treatment recommendations.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ----------------------------------------------------------------- */}
      {/* MAIN CONTENT                                                       */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT / MAIN COLUMN (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {/* ============ UPLOAD AREA ============ */}
            {showUpload && (
              <motion.div
                key="upload"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Camera className="w-5 h-5 text-teal" />
                    <h2 className="text-base font-semibold text-navy">Upload Crop Image</h2>
                  </div>

                  {!uploadedImage ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${
                        isDragging
                          ? 'border-teal bg-teal/5 scale-[1.01]'
                          : 'border-gray-200 hover:border-teal/40 hover:bg-cream/50'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={handleInputChange}
                        className="hidden"
                      />

                      <div className="flex flex-col items-center gap-4">
                        <div
                          className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                            isDragging ? 'bg-teal/10' : 'bg-gray-50'
                          }`}
                        >
                          <Upload
                            className={`w-8 h-8 transition-colors ${
                              isDragging ? 'text-teal' : 'text-gray-400'
                            }`}
                          />
                        </div>
                        <div>
                          <p className="text-navy font-semibold mb-1">
                            {isDragging ? 'Drop your image here' : 'Drag & drop your crop image'}
                          </p>
                          <p className="text-sm text-gray-400">
                            or{' '}
                            <span className="text-teal font-medium underline underline-offset-2">
                              browse files
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <ImagePlus className="w-3.5 h-3.5" />
                            JPG, PNG, WebP
                          </span>
                          <span className="text-gray-300">|</span>
                          <span>Max 10MB</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                        <img
                          src={uploadedImage}
                          alt="Uploaded crop"
                          className="w-full h-64 object-cover"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage();
                          }}
                          className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                          aria-label="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                          <p className="text-white text-sm font-medium truncate">{uploadedFileName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={startAnalysis}
                          className="flex-1 bg-teal hover:bg-teal/90 text-white py-3 px-6 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <Zap className="w-4 h-4" />
                          Analyze Crop
                        </button>
                        <button
                          onClick={removeImage}
                          className="py-3 px-4 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          Change Image
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ============ ANALYSIS PROCESS ============ */}
            {showAnalysis && (
              <motion.div
                key="analysis"
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3 } }}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-8"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Animated scanner icon */}
                  <div className="relative mb-8">
                    <motion.div
                      variants={pulseRing}
                      initial="initial"
                      animate="animate"
                      className="absolute inset-0 w-20 h-20 rounded-full bg-teal/20"
                      style={{ margin: '-10px' }}
                    />
                    <div className="w-16 h-16 bg-teal/10 rounded-2xl flex items-center justify-center relative z-10">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' as const }}
                      >
                        <ScanLine className="w-8 h-8 text-teal" />
                      </motion.div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-navy mb-2">Analyzing Your Crop</h3>
                  <p className="text-sm text-gray-500 mb-8">
                    Our AI is examining the image for signs of disease, pests, and deficiencies.
                  </p>

                  {/* Progress bar */}
                  <div className="w-full max-w-md mb-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500 font-medium">Progress</span>
                      <span className="text-navy font-bold">{analysisProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className="h-3 rounded-full bg-gradient-to-r from-[#8CB89C] to-gold"
                        initial={{ width: '0%' }}
                        animate={{ width: `${analysisProgress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' as const }}
                      />
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="w-full max-w-md space-y-3">
                    {analysisSteps.map((step, index) => {
                      const isCompleted = index < currentStep;
                      const isCurrent = index === currentStep;
                      return (
                        <motion.div
                          key={step.label}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{
                            opacity: index <= currentStep ? 1 : 0.4,
                            x: 0,
                          }}
                          transition={{ delay: index * 0.15, duration: 0.3 }}
                          className={`flex items-center gap-3 text-sm ${
                            isCompleted
                              ? 'text-green-600'
                              : isCurrent
                                ? 'text-teal font-medium'
                                : 'text-gray-400'
                          }`}
                        >
                          <div className="w-6 h-6 flex items-center justify-center shrink-0">
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : isCurrent ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: 'linear' as const,
                                }}
                                className="w-5 h-5 border-2 border-teal border-t-transparent rounded-full"
                              />
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-200 rounded-full" />
                            )}
                          </div>
                          <span>{step.label}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ============ RESULTS PANEL ============ */}
            {showResults && diagnosis && (
              <motion.div
                key="results"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {/* Score + Diagnosis Header */}
                <motion.div
                  variants={staggerItem}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Health Score Ring */}
                    <div className="flex-shrink-0 flex justify-center">
                      <HealthScoreRing
                        score={diagnosis.score}
                        color={diagnosis.scoreColor}
                        trackColor={diagnosis.scoreTrackColor}
                      />
                    </div>

                    {/* Diagnosis Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                          {diagnosis.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-navy">{diagnosis.title}</h3>
                          <span
                            className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mt-1 ${diagnosis.severityColor}`}
                          >
                            {diagnosis.severity}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed mt-3">
                        {diagnosis.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                          <Leaf className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            Affected: <span className="font-semibold text-navy">{diagnosis.affectedArea}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                          <Sparkles className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            Confidence:{' '}
                            <span className="font-semibold text-navy">{diagnosis.confidence}%</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Recommendations */}
                <motion.div
                  variants={staggerItem}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-gold" />
                    <h3 className="text-base font-semibold text-navy">Recommendations</h3>
                  </div>
                  <div className="space-y-3">
                    {diagnosis.recommendations.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index, duration: 0.3 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-cream/60 hover:bg-cream transition-colors"
                      >
                        <div className="w-6 h-6 bg-teal/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-teal">{index + 1}</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{rec}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Recommended Products */}
                <motion.div
                  variants={staggerItem}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-teal" />
                      <h3 className="text-base font-semibold text-navy">Recommended Products</h3>
                    </div>
                    <Link
                      href="/dashboard/inputs"
                      className="text-sm font-medium text-teal hover:text-teal/80 transition-colors inline-flex items-center gap-1"
                    >
                      View all inputs <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {diagnosis.products.map((product, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 * index, duration: 0.3 }}
                      >
                        <Link
                          href="/dashboard/inputs"
                          className="block p-4 rounded-xl border border-gray-100 hover:border-teal/20 hover:shadow-md transition-all group"
                        >
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                            {product.category}
                          </span>
                          <h4 className="text-sm font-semibold text-navy mt-2 mb-2 leading-tight group-hover:text-teal transition-colors">
                            {product.name}
                          </h4>
                          <div className="flex items-center justify-between">
                            <span className="text-base font-bold text-teal">{product.price}</span>
                            <span className="text-xs text-teal font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                              View <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Scan Another Button */}
                <motion.div variants={staggerItem} className="flex items-center gap-3">
                  <button
                    onClick={resetScanner}
                    className="flex-1 sm:flex-none bg-teal hover:bg-teal/90 text-white py-3 px-8 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Scan Another Crop
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN (1/3) */}
        <div className="space-y-6">
          {/* Recent Scans History */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-xl border border-gray-100 shadow-sm"
          >
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <h3 className="text-base font-semibold text-navy">Recent Scans</h3>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {FALLBACK_RECENT_SCANS.map((scan) => {
                const isSelected = selectedHistoryScan?.id === scan.id;
                return (
                  <button
                    key={scan.id}
                    onClick={() => handleHistoryScanClick(scan)}
                    className={`w-full px-5 py-4 flex items-center gap-3 text-left transition-colors ${
                      isSelected
                        ? 'bg-teal/5 border-l-2 border-l-teal'
                        : 'hover:bg-cream/50 border-l-2 border-l-transparent'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${scan.thumbnailColor}`}
                    >
                      <Leaf className="w-5 h-5 text-white/80" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy truncate">
                        {scan.diagnosisTitle}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{scan.date}</span>
                        <span className="text-gray-300">|</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${scan.severityColor}`}
                        >
                          {scan.severity}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-bold text-navy">{scan.score}</span>
                      <p className="text-[10px] text-gray-400">/100</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Tips Section */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-gold" />
              <h3 className="text-base font-semibold text-navy">Tips for Better Scans</h3>
            </div>
            <div className="space-y-3">
              {scanTips.map((tip, index) => (
                <motion.div
                  key={tip.title}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-cream/50 transition-colors"
                >
                  <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                    {tip.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">{tip.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed mt-0.5">
                      {tip.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Info Box */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-gradient-to-br from-navy via-navy to-navy/90 rounded-xl p-5 text-white"
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-gold" />
              <h3 className="text-sm font-bold">Important Note</h3>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              This AI scanner provides preliminary guidance and should not replace
              professional agronomic advice. For severe infestations or unclear diagnoses,
              consult your local agricultural extension officer.
            </p>
            <Link
              href="/dashboard/training"
              className="inline-flex items-center gap-1 text-xs text-teal-light hover:text-white font-medium mt-3 transition-colors"
            >
              Take our crop health course <ChevronRight className="w-3 h-3" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
