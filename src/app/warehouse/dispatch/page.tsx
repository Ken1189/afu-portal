'use client';

import { useState, useEffect } from 'react';
import {
  Truck,
  Loader2,
  Plus,
  Search,
  MapPin,
  Package,
  CheckCircle2,
  Clock,
  X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Dispatch {
  id: string;
  dispatch_number: string;
  destination: string;
  transporter: string;
  vehicle_number: string;
  receipts: string[];
  total_weight_kg: number;
  status: 'loading' | 'in_transit' | 'delivered' | 'cancelled';
  created_at: string;
  dispatched_at: string | null;
  delivered_at: string | null;
  notes: string | null;
}

interface AvailableReceipt {
  id: string;
  receipt_number: string;
  farmer_name: string | null;
  commodity: string;
  net_weight_kg: number;
  grade: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  loading: 'bg-yellow-100 text-yellow-700',
  in_transit: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function DispatchPage() {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [availableReceipts, setAvailableReceipts] = useState<AvailableReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'create'>('pending');

  // Create form state
  const [selectedReceipts, setSelectedReceipts] = useState<string[]>([]);
  const [destination, setDestination] = useState('');
  const [transporter, setTransporter] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const supabase = createClient();

      // Dispatches
      const { data: dispatchData } = await supabase
        .from('dispatches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      setDispatches((dispatchData as Dispatch[]) || []);

      // Available receipts for dispatch (received, not dispatched)
      const { data: receipts } = await supabase
        .from('warehouse_receipts')
        .select('id, receipt_number, farmer_name, commodity, net_weight_kg, grade')
        .eq('status', 'received')
        .order('created_at', { ascending: false })
        .limit(100);

      setAvailableReceipts((receipts as AvailableReceipt[]) || []);
    } catch (err) {
      console.error('Fetch dispatches error:', err);
    } finally {
      setLoading(false);
    }
  }

  const toggleReceipt = (id: string) => {
    setSelectedReceipts((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const selectedWeight = availableReceipts
    .filter((r) => selectedReceipts.includes(r.id))
    .reduce((sum, r) => sum + (r.net_weight_kg || 0), 0);

  const handleCreateDispatch = async () => {
    if (!destination || !transporter || selectedReceipts.length === 0) return;
    setCreating(true);
    try {
      const supabase = createClient();
      const dispatchNum = `DSP-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;

      const { error } = await supabase.from('dispatches').insert({
        dispatch_number: dispatchNum,
        destination,
        transporter,
        vehicle_number: vehicleNumber,
        receipts: selectedReceipts,
        total_weight_kg: selectedWeight,
        status: 'loading',
        notes: dispatchNotes || null,
      });

      if (error) throw error;

      // Update receipt statuses
      await supabase
        .from('warehouse_receipts')
        .update({ status: 'dispatched' })
        .in('id', selectedReceipts);

      // Reset form
      setSelectedReceipts([]);
      setDestination('');
      setTransporter('');
      setVehicleNumber('');
      setDispatchNotes('');
      setActiveTab('pending');
      fetchData();
    } catch (err) {
      console.error('Create dispatch error:', err);
    } finally {
      setCreating(false);
    }
  };

  const updateDispatchStatus = async (id: string, newStatus: string) => {
    try {
      const supabase = createClient();
      const updateData: Record<string, unknown> = { status: newStatus };
      if (newStatus === 'in_transit') updateData.dispatched_at = new Date().toISOString();
      if (newStatus === 'delivered') updateData.delivered_at = new Date().toISOString();
      await supabase.from('dispatches').update(updateData).eq('id', id);
      fetchData();
    } catch (err) {
      console.error('Update dispatch error:', err);
    }
  };

  const pendingDispatches = dispatches.filter((d) => d.status === 'loading' || d.status === 'in_transit');
  const completedDispatches = dispatches.filter((d) => d.status === 'delivered' || d.status === 'cancelled');

  const formatWeight = (kg: number) =>
    kg >= 1000 ? `${(kg / 1000).toFixed(1)} MT` : `${kg.toFixed(0)} kg`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Outbound Dispatch</h1>
        <button
          onClick={() => setActiveTab('create')}
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#5DB347] text-white rounded-xl font-medium hover:bg-[#4ea03c] transition-colors min-h-[48px]"
        >
          <Plus className="w-5 h-5" />
          New Dispatch
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-5 py-3 rounded-xl font-medium text-base min-h-[48px] transition-colors ${
            activeTab === 'pending' ? 'bg-[#5DB347] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Active ({pendingDispatches.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-3 rounded-xl font-medium text-base min-h-[48px] transition-colors ${
            activeTab === 'history' ? 'bg-[#5DB347] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          History ({completedDispatches.length})
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-5 py-3 rounded-xl font-medium text-base min-h-[48px] transition-colors ${
            activeTab === 'create' ? 'bg-[#5DB347] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Create
        </button>
      </div>

      {/* Active Dispatches */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingDispatches.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
              <Truck className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No active dispatches</p>
            </div>
          ) : (
            pendingDispatches.map((d) => (
              <div key={d.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-bold text-[#1B2A4A] text-lg font-mono">{d.dispatch_number}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      {d.destination}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span><Truck className="w-4 h-4 inline mr-1" />{d.transporter}</span>
                      {d.vehicle_number && <span>Vehicle: {d.vehicle_number}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${STATUS_COLORS[d.status] || 'bg-gray-100 text-gray-700'}`}>
                      {d.status.replace('_', ' ')}
                    </span>
                    <p className="text-2xl font-bold text-[#1B2A4A] mt-2">{formatWeight(d.total_weight_kg)}</p>
                    <p className="text-xs text-gray-400">{d.receipts?.length || 0} receipts</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 border-t border-gray-100 pt-4">
                  {d.status === 'loading' && (
                    <button
                      onClick={() => updateDispatchStatus(d.id, 'in_transit')}
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 min-h-[44px]"
                    >
                      Mark In Transit
                    </button>
                  )}
                  {d.status === 'in_transit' && (
                    <button
                      onClick={() => updateDispatchStatus(d.id, 'delivered')}
                      className="px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 min-h-[44px]"
                    >
                      Mark Delivered
                    </button>
                  )}
                  <button
                    onClick={() => updateDispatchStatus(d.id, 'cancelled')}
                    className="px-4 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 min-h-[44px]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Dispatch History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {completedDispatches.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No dispatch history</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase border-b border-gray-100 bg-gray-50/50">
                    <th className="px-5 py-3 font-medium">Dispatch #</th>
                    <th className="px-5 py-3 font-medium">Destination</th>
                    <th className="px-5 py-3 font-medium">Transporter</th>
                    <th className="px-5 py-3 font-medium">Weight</th>
                    <th className="px-5 py-3 font-medium">Receipts</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {completedDispatches.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-mono text-sm font-medium">{d.dispatch_number}</td>
                      <td className="px-5 py-3 text-sm">{d.destination}</td>
                      <td className="px-5 py-3 text-sm">{d.transporter}</td>
                      <td className="px-5 py-3 text-sm font-medium">{formatWeight(d.total_weight_kg)}</td>
                      <td className="px-5 py-3 text-sm">{d.receipts?.length || 0}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[d.status] || 'bg-gray-100 text-gray-700'}`}>
                          {d.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">{new Date(d.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Dispatch */}
      {activeTab === 'create' && (
        <div className="space-y-5">
          {/* Select Receipts */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-[#1B2A4A] text-lg mb-4">Select Receipts to Ship</h3>
            {availableReceipts.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No receipts available for dispatch</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {availableReceipts.map((r) => {
                  const selected = selectedReceipts.includes(r.id);
                  return (
                    <button
                      key={r.id}
                      onClick={() => toggleReceipt(r.id)}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-colors min-h-[52px] ${
                        selected ? 'bg-[#5DB347]/10 border-2 border-[#5DB347]' : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                        selected ? 'bg-[#5DB347] border-[#5DB347]' : 'border-gray-300'
                      }`}>
                        {selected && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-mono text-sm">{r.receipt_number}</span>
                        <span className="text-sm text-gray-500 ml-2">{r.farmer_name || 'Walk-in'}</span>
                      </div>
                      <span className="text-sm capitalize text-gray-600">{r.commodity}</span>
                      <span className="text-sm font-bold">{formatWeight(r.net_weight_kg)}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {selectedReceipts.length > 0 && (
              <div className="mt-4 bg-[#1B2A4A] rounded-xl p-4 text-white flex items-center justify-between">
                <span>{selectedReceipts.length} receipts selected</span>
                <span className="text-2xl font-bold">{formatWeight(selectedWeight)}</span>
              </div>
            )}
          </div>

          {/* Dispatch Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
            <h3 className="font-bold text-[#1B2A4A] text-lg">Dispatch Details</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Delivery location"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#5DB347] min-h-[48px]"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transporter *</label>
                <input
                  type="text"
                  value={transporter}
                  onChange={(e) => setTransporter(e.target.value)}
                  placeholder="Transport company / driver"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#5DB347] min-h-[48px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="Plate number"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#5DB347] min-h-[48px]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={dispatchNotes}
                onChange={(e) => setDispatchNotes(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#5DB347]"
                placeholder="Optional notes..."
              />
            </div>

            <button
              onClick={handleCreateDispatch}
              disabled={creating || selectedReceipts.length === 0 || !destination || !transporter}
              className="w-full flex items-center justify-center gap-2 bg-[#5DB347] text-white py-4 rounded-xl font-bold text-lg min-h-[56px] hover:bg-[#4ea03c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Dispatch...
                </>
              ) : (
                <>
                  <Truck className="w-5 h-5" />
                  Create Dispatch ({selectedReceipts.length} receipts, {formatWeight(selectedWeight)})
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
