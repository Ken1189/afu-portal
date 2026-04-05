'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Minimize2, Send, Mic, Sparkles, User } from 'lucide-react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import QuickActions from './QuickActions';
import { getChatResponse, getInitialGreeting, generateMessageId } from '@/lib/chatbot';
import type { ChatMessage as ChatMessageType } from '@/lib/chatbot';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const openChat = () => {
    setIsOpen(true);
    if (!hasOpened) {
      setHasOpened(true);
      const greeting = getInitialGreeting('Farmer');
      setMessages([greeting]);
    }
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessageType = {
      id: generateMessageId(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await getChatResponse(text, { userName: 'Farmer' });
      const botMessage: ChatMessageType = {
        id: generateMessageId(),
        role: 'bot',
        text: response.text,
        suggestions: response.suggestions,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const errorMessage: ChatMessageType = {
        id: generateMessageId(),
        role: 'bot',
        text: "I'm having trouble right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleQuickAction = (label: string) => {
    sendMessage(label);
  };

  // ── Talk to Human — collect details then save to inbox ──
  const [humanRequested, setHumanRequested] = useState(false);
  const [showHumanForm, setShowHumanForm] = useState(false);
  const [humanForm, setHumanForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [humanSending, setHumanSending] = useState(false);

  const talkToHuman = () => {
    setShowHumanForm(true);
    const botMsg: ChatMessageType = {
      id: generateMessageId(),
      role: 'bot',
      text: "I'd love to connect you with our team! Please fill in your details below and we'll get back to you shortly.",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, botMsg]);
  };

  const submitHumanRequest = async () => {
    if (!humanForm.name || !humanForm.email) return;
    setHumanSending(true);
    setHumanRequested(true);

    try {
      const chatHistory = messages.map(m => `${m.role === 'user' ? 'Visitor' : 'Amara'}: ${m.text}`).join('\n');
      const fullMessage = `${humanForm.message ? humanForm.message + '\n\n' : ''}--- Chat History ---\n${chatHistory}`;

      await fetch('/api/admin/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_name: humanForm.name,
          contact_email: humanForm.email,
          contact_phone: humanForm.phone || null,
          contact_type: 'lead',
          subject: 'Chat — Talk to Human',
          message: fullMessage,
          channel: 'form',
        }),
      });

      setShowHumanForm(false);
      const confirmMsg: ChatMessageType = {
        id: generateMessageId(),
        role: 'bot',
        text: `Thanks ${humanForm.name.split(' ')[0]}! Our team will reach out to you at ${humanForm.email} shortly. In the meantime, feel free to keep chatting with me!`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, confirmMsg]);
    } catch {
      const errorMsg: ChatMessageType = {
        id: generateMessageId(),
        role: 'bot',
        text: "Something went wrong. Please email us directly at devonk@africanfarmingunion.org",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    }
    setHumanSending(false);
  };

  const unreadCount = hasOpened ? 0 : 1;

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={openChat}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-teal rounded-full shadow-lg flex items-center justify-center hover:bg-teal-dark transition-colors"
            aria-label="Open chat assistant"
          >
            <MessageCircle className="w-6 h-6 text-white" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
              >
                {unreadCount}
              </motion.span>
            )}
            {/* Pulse ring */}
            {!hasOpened && (
              <span className="absolute inset-0 rounded-full bg-teal animate-ping opacity-25" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden max-sm:bottom-0 max-sm:right-0 max-sm:w-full max-sm:h-full max-sm:rounded-none"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-navy to-navy-light px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-teal rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Amara</h3>
                  <p className="text-teal-light text-xs">Your AFU Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={talkToHuman}
                  disabled={humanRequested}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                  aria-label="Talk to a human"
                  title="Talk to a human"
                >
                  <User className="w-4 h-4 text-white/70" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Minimize chat"
                >
                  <Minimize2 className="w-4 h-4 text-white/70" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4 text-white/70" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-3 py-2 bg-gray-50/50 space-y-0.5">
              {messages.map((message) => (
                <div key={message.id}>
                  <ChatMessage message={message} />
                  {/* Suggestion Pills */}
                  {message.role === 'bot' && message.suggestions && (
                    <div className="flex flex-wrap gap-1.5 ml-10 mb-2">
                      {message.suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs px-2.5 py-1 bg-white border border-teal/30 text-teal-dark rounded-full hover:bg-teal-light transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Human form */}
            {showHumanForm && !humanRequested && (
              <div className="px-3 py-3 bg-amber-50 border-t border-amber-200 flex-shrink-0 space-y-2">
                <p className="text-xs font-semibold text-amber-800">Your Details</p>
                <input type="text" value={humanForm.name} onChange={e => setHumanForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name *" className="w-full text-xs border border-amber-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-amber-400" />
                <input type="email" value={humanForm.email} onChange={e => setHumanForm(p => ({ ...p, email: e.target.value }))} placeholder="Email address *" className="w-full text-xs border border-amber-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-amber-400" />
                <input type="tel" value={humanForm.phone} onChange={e => setHumanForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone (optional)" className="w-full text-xs border border-amber-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-amber-400" />
                <textarea value={humanForm.message} onChange={e => setHumanForm(p => ({ ...p, message: e.target.value }))} placeholder="What can we help with?" rows={2} className="w-full text-xs border border-amber-200 rounded-lg px-3 py-2 resize-none focus:ring-1 focus:ring-amber-400" />
                <button onClick={submitHumanRequest} disabled={humanSending || !humanForm.name || !humanForm.email} className="w-full text-xs bg-amber-500 text-white rounded-lg py-2 font-semibold hover:bg-amber-600 disabled:opacity-50">
                  {humanSending ? 'Sending...' : 'Request Callback'}
                </button>
              </div>
            )}

            {/* Quick Actions */}
            {!showHumanForm && (
              <div className="px-3 py-1.5 bg-white border-t border-gray-100 flex-shrink-0">
                <QuickActions onAction={handleQuickAction} />
              </div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="px-3 py-2.5 bg-white border-t border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-teal focus-within:ring-1 focus-within:ring-teal/30">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Amara anything..."
                  className="flex-1 bg-transparent text-sm text-navy placeholder:text-gray-400 focus:outline-none"
                  disabled={isTyping}
                />
                <button
                  type="button"
                  className="p-1 text-gray-400 hover:text-teal transition-colors"
                  aria-label="Voice input"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="p-1.5 bg-teal rounded-lg text-white disabled:opacity-50 hover:bg-teal-dark transition-colors disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
