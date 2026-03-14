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
} from 'lucide-react';
import { cropScans, farmPlots } from '@/lib/data/farm';
import { useLanguage } from '@/lib/i18n/LanguageContext';

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

const mockDiagnoses: MockDiagnosis[] = [
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
        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal to-transparent"
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

export default function CropDoctorPage() {
  const { t } = useLanguage();
  const [pageState, setPageState] = useState<PageState>('capture');
  const [selectedPlotId, setSelectedPlotId] = useState<string>(farmPlots[0]?.id ?? '');
  const [plotDropdownOpen, setPlotDropdownOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [result, setResult] = useState<MockDiagnosis | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const selectedPlot = farmPlots.find((p) => p.id === selectedPlotId) ?? farmPlots[0];
  const recentScans = cropScans.slice(0, 3);

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

  // ─── Simulate analysis steps ───
  useEffect(() => {
    if (pageState !== 'analyzing') return;

    const steps = [
      { delay: 600 },
      { delay: 1200 },
      { delay: 2000 },
      { delay: 2800 },
    ];

    const timers: NodeJS.Timeout[] = [];

    steps.forEach((step, i) => {
      timers.push(
        setTimeout(() => {
          setAnalysisStep(i + 1);
        }, step.delay),
      );
    });

    // After all steps, show results
    timers.push(
      setTimeout(() => {
        const randomDiagnosis =
          mockDiagnoses[Math.floor(Math.random() * mockDiagnoses.length)];
        setResult(randomDiagnosis);
        setPageState('results');
      }, 3400),
    );

    return () => timers.forEach(clearTimeout);
  }, [pageState]);

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

  return (
    <div className="min-h-full">
      <AnimatePresence mode="wait">
        {/* ================================================================== */}
        {/* STATE 1: CAPTURE                                                   */}
        {/* ================================================================== */}
        {pageState === 'capture' && (
          <motion.div
            key="capture"
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
                      {farmPlots.map((plot) => (
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
                className="w-full h-32 bg-gradient-to-br from-teal to-teal-dark text-white rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg shadow-teal/20 active:scale-[0.98] transition-transform"
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
                    <span className="w-4 h-4 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">
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
                  alt="Crop photo being analyzed"
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
            className="p-4 space-y-5 pb-8"
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
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">
                    {t.cropDoctor.confidence}
                  </p>
                  <p className="text-lg font-bold text-navy">{result.confidence}%</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">
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
                          className="bg-teal text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 active:bg-teal-dark transition-colors"
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
                className="w-full h-14 bg-gradient-to-br from-teal to-teal-dark text-white rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-teal/20 active:scale-[0.98] transition-transform"
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
