'use client';

import Link from 'next/link';
import { CheckCircle2, Circle, ArrowRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Step {
  id: string;
  label: string;
  href: string;
  check: () => boolean;
}

interface GettingStartedProps {
  title: string;
  steps: Step[];
  storageKey: string;
}

export default function GettingStarted({ title, steps, storageKey }: GettingStartedProps) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const d = localStorage.getItem(storageKey);
    setDismissed(d === 'true');
  }, [storageKey]);

  const dismiss = () => {
    localStorage.setItem(storageKey, 'true');
    setDismissed(true);
  };

  const completed = steps.filter(s => s.check()).length;
  const total = steps.length;
  const allDone = completed === total;

  if (dismissed || allDone) return null;

  return (
    <div className="bg-white rounded-xl border border-[#5DB347]/20 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-[#1B2A4A] text-sm">{title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{completed} of {total} complete</p>
        </div>
        <button onClick={dismiss} className="text-gray-300 hover:text-gray-500"><X className="w-4 h-4" /></button>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
        <div className="h-2 rounded-full bg-[#5DB347] transition-all" style={{ width: `${(completed / total) * 100}%` }} />
      </div>
      <div className="space-y-2">
        {steps.map(step => {
          const done = step.check();
          return (
            <Link key={step.id} href={step.href} className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${done ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
              {done ? <CheckCircle2 className="w-5 h-5 text-[#5DB347] flex-shrink-0" /> : <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />}
              <span className={`text-sm flex-1 ${done ? 'text-gray-400 line-through' : 'text-[#1B2A4A] font-medium'}`}>{step.label}</span>
              {!done && <ArrowRight className="w-4 h-4 text-gray-300" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
