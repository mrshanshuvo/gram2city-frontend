'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FiMessageSquare,
  FiX,
  FiSend,
  FiUser,
  FiCircle,
  FiPaperclip,
  FiImage,
  FiLock,
} from 'react-icons/fi';
import { useSocketStore } from '../../store/useSocketStore';
import { useAuthStore } from '../../features/auth/authStore';
import { axiosSecure } from '../../api/axios';
import moment from 'moment';
import { toast } from 'sonner';
import { uploadFile } from '../../features/chat/api';
import { useChatSocket } from '../../features/chat/useChatSocket';

const ChatWidget = () => {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { connected } = useSocketStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lastTypingTimeRef = useRef<number>(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    const now = Date.now();
    if (now - lastTypingTimeRef.current > 2000) {
      sendTyping();
      lastTypingTimeRef.current = now;
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const ADMIN_EMAIL = 'admin@gram2city.com';
  const conversationId = user ? [user.email, ADMIN_EMAIL].sort().join('_') : '';

  const { messages, isTyping, sendMessage, markRead, sendTyping } = useChatSocket({
    conversationId,
    user: user
      ? {
          email: user.email ?? '',
          displayName: user.displayName,
          getIdToken: async () => {
            try {
              return await user.getIdToken();
            } catch {
              return '';
            }
          },
        }
      : null,
    onMessagesMarkedRead: () => {},
  });

  useEffect(() => {
    if (user) {
      axiosSecure.get(`/users/${user.email}`).then((res) => {
        setRole(res.data.role);
      });
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && conversationId) markRead();
  }, [isOpen, conversationId, markRead]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent, imageUrl?: string) => {
    e?.preventDefault();
    if ((!message.trim() && !imageUrl) || !user) return;

    const text = imageUrl ? '' : message.trim();
    sendMessage(text, imageUrl || null);
    setMessage('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadFile(file);
      handleSendMessage(undefined, url);
    } catch {
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (!mounted) return null;

  if (role === 'admin' || role === 'superAdmin') return null;

  // ── Guest panel (not logged in) ─────────────────────────────────────────────
  if (!user) {
    return (
      <div className="fixed bottom-8 right-8 z-9999 font-outfit">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open support chat"
          className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 cursor-pointer ${
            isOpen ? 'bg-slate-800 rotate-90 text-white' : 'bg-primary text-white'
          }`}
        >
          {isOpen ? <FiX className="text-2xl" /> : <FiMessageSquare className="text-2xl" />}
        </button>

        {isOpen && (
          <div className="absolute bottom-20 right-0 w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="p-5 bg-slate-900 dark:bg-slate-950 text-white border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <FiUser className="text-primary dark:text-emerald-400 text-xl" />
                </div>
                <div>
                  <h4 className="font-black text-sm tracking-tight">Gram2City Support</h4>
                  <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">
                    Live Chat
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 bg-primary/10 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                <FiLock className="text-primary dark:text-emerald-400 text-2xl" />
              </div>
              <div>
                <h5 className="font-black text-gray-800 dark:text-slate-100 text-sm mb-1">
                  Sign in to chat with us
                </h5>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-medium leading-relaxed">
                  Create a free account or log in to start a real-time conversation with our support
                  team.
                </p>
              </div>
              <Link
                href="/login"
                className="w-full py-3 bg-primary text-white text-sm font-black rounded-xl text-center hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-primary/20"
              >
                Log in to chat
              </Link>
              <Link
                href="/register"
                className="w-full py-3 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-200 text-sm font-black rounded-xl text-center hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Create an account
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 z-9999 font-outfit">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 cursor-pointer ${
          isOpen ? 'bg-slate-800 rotate-90 text-white' : 'bg-primary text-white'
        }`}
      >
        {isOpen ? <FiX className="text-2xl" /> : <FiMessageSquare className="text-2xl" />}
        {!isOpen && messages.length > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce">
            !
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-95 h-137.5 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-500">
          <div className="p-6 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <FiUser className="text-primary dark:text-emerald-400 text-xl" />
              </div>
              <div>
                <h4 className="font-black text-sm tracking-tight">Gram2City Support</h4>
                <div className="flex items-center gap-1.5">
                  <FiCircle
                    className={`text-[8px] fill-current ${
                      connected ? 'text-emerald-500' : 'text-gray-500'
                    }`}
                  />
                  <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">
                    {connected ? 'Online' : 'Connecting...'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 dark:bg-slate-950/40">
            {messages.length === 0 && (
              <div className="text-center py-10 opacity-30 text-slate-400 dark:text-slate-500">
                <FiMessageSquare className="text-4xl mx-auto mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest">Start a conversation</p>
              </div>
            )}
            {messages.map((msg, idx) => {
              const isMe = msg.senderEmail === user?.email;
              return (
                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-sm ${
                      isMe
                        ? 'bg-primary text-white rounded-tr-none font-medium'
                        : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 rounded-tl-none border border-gray-100 dark:border-slate-700 font-medium'
                    }`}
                  >
                    {msg.imageUrl && (
                      <Image
                        src={msg.imageUrl}
                        alt="Shared"
                        width={300}
                        height={240}
                        className="rounded-xl mb-2 w-full max-h-60 object-cover cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                        onClick={() => msg.imageUrl && window.open(msg.imageUrl, '_blank')}
                      />
                    )}
                    {msg.message && <p className="leading-relaxed">{msg.message}</p>}
                    <span
                      className={`text-[9px] block mt-2 font-bold opacity-50 ${
                        isMe ? 'text-right' : 'text-left'
                      }`}
                    >
                      {moment(msg.timestamp).format('hh:mm A')}
                    </span>
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl border border-gray-100 dark:border-slate-700 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-slate-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex gap-2 items-center"
          >
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                uploading
                  ? 'bg-gray-50 dark:bg-slate-800 text-gray-300 dark:text-slate-600'
                  : 'bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-400 hover:text-primary dark:hover:text-emerald-400 hover:bg-primary/5 dark:hover:bg-slate-700'
              }`}
            >
              {uploading ? (
                <FiImage className="animate-pulse" />
              ) : (
                <FiPaperclip className="text-lg" />
              )}
            </button>
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 h-12 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl px-4 text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-primary/20"
              value={message}
              onChange={handleInputChange}
            />
            <button
              type="submit"
              className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              <FiSend className="text-lg" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
