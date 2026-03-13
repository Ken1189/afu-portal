'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sprout } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/lib/chatbot';

interface ChatMessageProps {
  message: ChatMessageType;
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function renderTextWithLineBreaks(text: string) {
  return text.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      {index < text.split('\n').length - 1 && <br />}
    </React.Fragment>
  ));
}

export default function ChatMessage({ message }: ChatMessageProps) {
  if (message.role === 'system') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-center my-3"
      >
        <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
          {renderTextWithLineBreaks(message.text)}
        </span>
      </motion.div>
    );
  }

  const isBot = message.role === 'bot';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex gap-2.5 my-3 ${isBot ? 'justify-start' : 'justify-end'}`}
    >
      {/* Bot Avatar */}
      {isBot && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal flex items-center justify-center mt-1">
          <Sprout className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Message Bubble */}
      <div className={`max-w-[80%] flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
        <div
          className={`px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
            isBot
              ? 'bg-teal-light text-navy rounded-2xl rounded-tl-md'
              : 'bg-navy text-white rounded-2xl rounded-tr-md'
          }`}
        >
          {renderTextWithLineBreaks(message.text)}
        </div>

        {/* Timestamp */}
        <span
          className={`text-[10px] text-gray-400 mt-1 px-1 ${
            isBot ? 'text-left' : 'text-right'
          }`}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}
