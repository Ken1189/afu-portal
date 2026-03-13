'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  type?: 'single' | 'multiple';
  defaultOpen?: string[];
  className?: string;
}

interface AccordionItemInternalProps {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: (id: string) => void;
}

const contentVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: { height: { duration: 0.25 }, opacity: { duration: 0.15 } },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: 0.25, ease: 'easeOut' as const },
      opacity: { duration: 0.2, delay: 0.05 },
    },
  },
};

function AccordionItemComponent({
  item,
  isOpen,
  onToggle,
}: AccordionItemInternalProps) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <h3>
        <button
          type="button"
          id={`accordion-trigger-${item.id}`}
          aria-expanded={isOpen}
          aria-controls={`accordion-panel-${item.id}`}
          disabled={item.disabled}
          onClick={() => onToggle(item.id)}
          className={[
            'flex items-center justify-between w-full px-5 py-4 text-left',
            'text-sm font-medium text-navy transition-colors',
            'hover:bg-gray-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal/50',
            item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span>{item.title}</span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 ml-4"
          >
            <ChevronDown className="h-4 w-4 text-gray-500" aria-hidden="true" />
          </motion.span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`accordion-panel-${item.id}`}
            role="region"
            aria-labelledby={`accordion-trigger-${item.id}`}
            variants={contentVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
              {item.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Accordion({
  items,
  type = 'single',
  defaultOpen = [],
  className = '',
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(
    new Set(defaultOpen)
  );

  const handleToggle = useCallback(
    (id: string) => {
      setOpenItems((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          if (type === 'single') {
            next.clear();
          }
          next.add(id);
        }
        return next;
      });
    },
    [type]
  );

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}
    >
      {items.map((item) => (
        <AccordionItemComponent
          key={item.id}
          item={item}
          isOpen={openItems.has(item.id)}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
}

export { Accordion };
export type { AccordionProps, AccordionItem };
