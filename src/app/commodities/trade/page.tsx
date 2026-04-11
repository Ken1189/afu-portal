'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/lib/supabase/auth-context';
import {
  ArrowUpDown, ShoppingCart, Package, Loader2, CheckCircle,
  AlertCircle, ChevronRight,
  MapPin, Scale, Tag, Clock, DollarSign, Send, LogIn,
  BarChart3, RefreshCw,
} from 'lucide-react';

/* ─── Commodity options ─── */
const COMMODITIES = [
  { name: 'Maize', price: 248, unit: 'tonne', symbol: 'MZE' },
  { name: 'Coffee Arabica', price: 4120, unit: 'tonne', symbol: 'COF' },
  { name: 'Soybean', price: 615, unit: 'tonne', symbol: 'SOY' },
  { name: 'Cocoa', price: 3280, unit: 'tonne', symbol: 'CCO' },
  { name: 'Cotton', price: 1845, unit: 'tonne', symbol: 'CTN' },
  { name: 'Cashew Nuts', price: 1520, unit: 'tonne', symbol: 'CSH' },
  { name: 'Tobacco', price: 3650, unit: 'tonne', symbol: 'TBC' },
  { name: 'Tea', price: 2890, unit: 'tonne', symbol: 'TEA' },
  { name: 'Macadamia', price: 7200, unit: 'tonne', symbol: 'MAC' },
  { name: 'Blueberries', price: 5100, unit: 'tonne', symbol: 'BLU' },
  { name: 'Wheat', price: 320, unit: 'tonne', symbol: 'WHT' },
  { name: 'Sorghum', price: 210, unit: 'tonne', symbol: 'SRG' },
  { name: 'Rice', price: 480, unit: 'tonne', symbol: 'RCE' },
  { name: 'Groundnuts', price: 890, unit: 'tonne', symbol: 'GNT' },
  { name: 'Sunflower', price: 720, unit: 'tonne', symbol: 'SNF' },
  { name: 'Sugarcane', price: 45, unit: 'tonne', symbol: 'SGC' },
  { name: 'Avocado', price: 2400, unit: 'tonne', symbol: 'AVO' },
  { name: 'Sesame', price: 1680, unit: 'tonne', symbol: 'SES' },
  { name: 'Millet', price: 195, unit: 'tonne', symbol: 'MLT' },
  { name: 'Beef Cattle', price: 3200, unit: 'kg', symbol: 'BCT' },
];

const QUALITY_GRADES = [
  'Grade A (Premium)',
  'Grade B (Standard)',
  'Grade C (Commercial)',
  'Organic Certified',
  'Fair Trade',
];

const UNITS = ['kg', 'tonnes', 'bags'];

const COUNTRIES = [
  'Zimbabwe', 'Kenya', 'Tanzania', 'South Africa', 'Nigeria',
  'Ghana', 'Uganda', 'Zambia', 'Mozambique', 'Ethiopia', 'Botswana', 'Sierra Leone',
];

interface RecentOrder {
  id: string;
  order_number: string;
  order_type: string;
  commodity: string;
  quantity: number;
  unit: string;
  target_price: number;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700',
  afu_review: 'bg-yellow-100 text-yellow-700',
  afu_fulfilling: 'bg-emerald-100 text-emerald-700',
  matched: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

export default function TradePage() {
  const { user, isLoading: authLoading } = useAuth();

  // Form state
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [selectedCommodity, setSelectedCommodity] = useState(COMMODITIES[0].name);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('tonnes');
  const [qualityGrade, setQualityGrade] = useState(QUALITY_GRADES[1]);
  const [country, setCountry] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [priceType, setPriceType] = useState<'market' | 'limit'>('market');
  const [targetPrice, setTargetPrice] = useState('');
  const [notes, setNotes] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Recent orders
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const currentCommodity = useMemo(
    () => COMMODITIES.find(c => c.name === selectedCommodity) || COMMODITIES[0],
    [selectedCommodity],
  );

  const marketPrice = currentCommodity.price;
  const effectivePrice = priceType === 'market' ? marketPrice : (parseFloat(targetPrice) || 0);
  const qty = parseFloat(quantity) || 0;

  // Convert to base unit for calculation
  const qtyInBaseUnit = unit === 'kg' ? qty / 1000 : unit === 'bags' ? qty * 0.05 : qty;
  const totalValue = effectivePrice * qtyInBaseUnit;

  // Fetch recent orders
  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setOrdersLoading(true);
    try {
      const res = await fetch(`/api/trading?user_id=${user.id}`);
      const json = await res.json();
      if (json.orders) {
        setRecentOrders(json.orders.slice(0, 10));
      }
    } catch {
      // Silently fail
    } finally {
      setOrdersLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user, fetchOrders]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 30);

      const res = await fetch('/api/trading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: orderType,
          commodity: selectedCommodity,
          quantity: qtyInBaseUnit * 1000, // convert to kg for API
          unit: 'kg',
          quality_grade: qualityGrade,
          country: country || null,
          delivery_location: deliveryLocation,
          deadline: deadline.toISOString().slice(0, 10),
          target_price: effectivePrice,
          currency: 'USD',
          notes: notes || null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to submit order');
      }

      setSuccess(true);
      setQuantity('');
      setTargetPrice('');
      setDeliveryLocation('');
      setNotes('');
      fetchOrders();

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit order');
    } finally {
      setSubmitting(false);
    }
  };

  // Auth gate
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#5DB347] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#1B2A4A]/5 flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-8 h-8 text-[#1B2A4A]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-3">Sign In to Trade</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            You need an AFU account to place trade orders. Sign in or register to access the trading desk.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-md"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 border-2 border-[#1B2A4A] text-[#1B2A4A] hover:bg-[#1B2A4A] hover:text-white font-semibold px-8 py-3 rounded-xl transition-all"
            >
              Register
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/commodities" className="hover:text-[#5DB347] transition-colors">Commodities</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#1B2A4A] font-medium">Trade</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">Trading Desk</h1>
          <p className="text-gray-500">Place buy and sell orders for African agricultural commodities.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Buy/Sell Toggle */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex rounded-xl bg-gray-100 p-1">
                  <button
                    type="button"
                    onClick={() => setOrderType('buy')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
                      orderType === 'buy'
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('sell')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
                      orderType === 'sell'
                        ? 'bg-red-500 text-white shadow-md'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    Sell
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Commodity selector */}
                <div>
                  <label className="block text-sm font-semibold text-[#1B2A4A] mb-2">Commodity</label>
                  <select
                    value={selectedCommodity}
                    onChange={e => setSelectedCommodity(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] transition-all"
                  >
                    {COMMODITIES.map(c => (
                      <option key={c.name} value={c.name}>
                        {c.symbol} -- {c.name} (${c.price.toLocaleString()}/{c.unit})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity + Unit */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-[#1B2A4A] mb-2">
                      <Scale className="w-4 h-4 inline mr-1.5" />
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={e => setQuantity(e.target.value)}
                      placeholder="Enter quantity"
                      min="0"
                      step="any"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1B2A4A] mb-2">Unit</label>
                    <select
                      value={unit}
                      onChange={e => setUnit(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] transition-all"
                    >
                      {UNITS.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quality Grade */}
                <div>
                  <label className="block text-sm font-semibold text-[#1B2A4A] mb-2">
                    <Tag className="w-4 h-4 inline mr-1.5" />
                    Quality Grade
                  </label>
                  <select
                    value={qualityGrade}
                    onChange={e => setQualityGrade(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] transition-all"
                  >
                    {QUALITY_GRADES.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* Country + Delivery Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1B2A4A] mb-2">
                      <MapPin className="w-4 h-4 inline mr-1.5" />
                      Country
                    </label>
                    <select
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] transition-all"
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1B2A4A] mb-2">Delivery Location</label>
                    <input
                      type="text"
                      value={deliveryLocation}
                      onChange={e => setDeliveryLocation(e.target.value)}
                      placeholder="e.g. Harare CBD, Nairobi Warehouse"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] transition-all"
                    />
                  </div>
                </div>

                {/* Price type */}
                <div>
                  <label className="block text-sm font-semibold text-[#1B2A4A] mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1.5" />
                    Price
                  </label>
                  <div className="flex gap-3 mb-3">
                    <button
                      type="button"
                      onClick={() => setPriceType('market')}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                        priceType === 'market'
                          ? 'border-[#5DB347] bg-[#5DB347]/5 text-[#5DB347]'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      Market Price
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriceType('limit')}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                        priceType === 'limit'
                          ? 'border-[#5DB347] bg-[#5DB347]/5 text-[#5DB347]'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      Limit Price
                    </button>
                  </div>
                  {priceType === 'market' ? (
                    <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between border border-gray-200">
                      <span className="text-sm text-gray-500">Current market price</span>
                      <span className="text-lg font-bold font-mono text-[#1B2A4A]">
                        ${marketPrice.toLocaleString(undefined, { minimumFractionDigits: marketPrice < 100 ? 2 : 0 })}
                        <span className="text-xs font-normal text-gray-400 ml-1">/{currentCommodity.unit}</span>
                      </span>
                    </div>
                  ) : (
                    <input
                      type="number"
                      value={targetPrice}
                      onChange={e => setTargetPrice(e.target.value)}
                      placeholder={`Target price (market: $${marketPrice})`}
                      min="0"
                      step="any"
                      required={priceType === 'limit'}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] transition-all font-mono"
                    />
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-[#1B2A4A] mb-2">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Any special requirements or instructions..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] transition-all resize-none"
                  />
                </div>

                {/* Error / Success */}
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    Order submitted successfully. AFU will begin processing your order.
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting || !quantity || !deliveryLocation || (priceType === 'limit' && !targetPrice)}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all shadow-md ${
                    orderType === 'buy'
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 disabled:bg-emerald-300'
                      : 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20 disabled:bg-red-300'
                  }`}
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {orderType === 'buy' ? 'Place Buy Order' : 'Place Sell Order'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Order Summary + Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Order summary */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#5DB347]" />
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Type</span>
                  <span className={`font-semibold ${orderType === 'buy' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {orderType === 'buy' ? 'BUY' : 'SELL'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Commodity</span>
                  <span className="font-semibold text-[#1B2A4A]">{currentCommodity.symbol}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Quantity</span>
                  <span className="font-mono text-[#1B2A4A]">{qty > 0 ? `${qty.toLocaleString()} ${unit}` : '--'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Grade</span>
                  <span className="text-[#1B2A4A]">{qualityGrade.split(' ')[0]} {qualityGrade.split(' ')[1]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Price per {currentCommodity.unit}</span>
                  <span className="font-mono font-semibold text-[#1B2A4A]">
                    ${effectivePrice.toLocaleString(undefined, { minimumFractionDigits: effectivePrice < 100 ? 2 : 0 })}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#1B2A4A]">Estimated Total</span>
                    <span className="text-xl font-bold font-mono text-[#1B2A4A]">
                      ${totalValue > 0 ? totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 text-right mt-1">Final price subject to AFU confirmation</p>
                </div>
              </div>

              {/* Market price indicator */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Market Price</span>
                  <span className="text-xs text-gray-400">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Live
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-[#1B2A4A]">
                    ${marketPrice.toLocaleString(undefined, { minimumFractionDigits: marketPrice < 100 ? 2 : 0 })}
                  </span>
                  <span className="text-xs text-gray-400">/{currentCommodity.unit}</span>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#1B2A4A] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#5DB347]" />
                  Recent Orders
                </h3>
                <button
                  onClick={fetchOrders}
                  disabled={ordersLoading}
                  className="p-2 text-gray-400 hover:text-[#5DB347] transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ArrowUpDown className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No orders yet</p>
                  <p className="text-xs text-gray-300 mt-1">Your trade orders will appear here</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {recentOrders.map(order => (
                    <div
                      key={order.id}
                      className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                            order.order_type === 'buy' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {order.order_type?.toUpperCase()}
                          </span>
                          <span className="text-sm font-semibold text-[#1B2A4A]">{order.commodity}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-500'}`}>
                          {order.status?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="font-mono">{order.order_number}</span>
                        <span>${order.target_price?.toLocaleString()} -- {order.quantity?.toLocaleString()} {order.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
