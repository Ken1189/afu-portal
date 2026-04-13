'use client';

import { useState } from 'react';
import { Settings, Bell, Clock, Shield } from 'lucide-react';

export default function DriverSettingsPage() {
  const [emailNotify, setEmailNotify] = useState(true);
  const [pushNotify, setPushNotify] = useState(true);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[#1B2A4A]">Settings</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Notifications */}
        <div>
          <h2 className="font-semibold text-[#1B2A4A] flex items-center gap-2 mb-4"><Bell className="w-4 h-4" /> Notifications</h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Email notifications for new deliveries</span>
              <input type="checkbox" checked={emailNotify} onChange={(e) => setEmailNotify(e.target.checked)} className="rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Push notifications</span>
              <input type="checkbox" checked={pushNotify} onChange={(e) => setPushNotify(e.target.checked)} className="rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]" />
            </label>
          </div>
        </div>

        {/* Availability Hours */}
        <div>
          <h2 className="font-semibold text-[#1B2A4A] flex items-center gap-2 mb-4"><Clock className="w-4 h-4" /> Availability</h2>
          <p className="text-sm text-gray-500 mb-2">Set your preferred working hours. You can always toggle availability from the dashboard.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Start Time</label>
              <input type="time" defaultValue="06:00" className="w-full px-3 py-2.5 border rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">End Time</label>
              <input type="time" defaultValue="18:00" className="w-full px-3 py-2.5 border rounded-xl text-sm" />
            </div>
          </div>
        </div>

        {/* Account */}
        <div>
          <h2 className="font-semibold text-[#1B2A4A] flex items-center gap-2 mb-4"><Shield className="w-4 h-4" /> Account</h2>
          <p className="text-sm text-gray-500">To change your password or email, visit your <a href="/farm/profile" className="text-[#5DB347] hover:underline">main profile settings</a>.</p>
        </div>
      </div>
    </div>
  );
}
