'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/authStore';
import {
  FiMessageSquare,
  FiSend,
  FiUser,
  FiSearch,
  FiClock,
  FiChevronDown,
  FiImage,
} from 'react-icons/fi';
import moment from 'moment';
import { toast } from 'sonner';
import { fetchConversations, uploadFile } from '@/features/chat/api';
import { useChatSocket } from '@/features/chat/useChatSocket';
import { Message, Conversation } from '@/features/chat/types';

export default function AdminChat() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lastTypingTimeRef = useRef<number>(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    const now = Date.now();
    if (now - lastTypingTimeRef.current > 2000) {
      sendTyping();
      lastTypingTimeRef.current = now;
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: conversations = [], refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => fetchConversations(),
    enabled: !!user,
  });

  const conversationId = selectedConversation?._id ?? '';

  const { messages, isTyping, sendMessage, sendTyping, markRead } = useChatSocket({
    conversationId,
    user: user
      ? {
          email: user.email ?? '',
          displayName: user.displayName,
          role: 'admin',
          getIdToken: () => user.getIdToken(),
        }
      : null,
    onMessageReceived: (msg) => {
      refetchConversations();
      if (msg && msg.conversationId === selectedConversation?._id) {
        markRead();
      }
    },
    onMessagesMarkedRead: () => {
      refetchConversations();
    },
  });

  useEffect(() => {
    if (conversationId && markRead) {
      markRead();
    }
  }, [conversationId, markRead]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (e?: React.FormEvent, imageUrl?: string) => {
    e?.preventDefault();
    if (!selectedConversation || !user) return;

    const text = newMessage.trim();
    if (!text && !imageUrl) return;

    if (imageUrl) {
      sendMessage('', imageUrl);
    } else if (text) {
      sendMessage(text);
      setNewMessage('');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadFile(file);
      handleSendMessage(undefined, url);
    } catch {
      toast.error('Image upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConversationClick = (conv: Conversation) => {
    setSelectedConversation(conv);
  };

  if (!mounted || !user || !user.email) return null;

  return (
    <div className="h-[calc(100vh-160px)] flex rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800 font-outfit">
      <div
        className={`${isSidebarOpen ? 'w-80' : 'w-0'} border-r border-gray-100 dark:border-slate-800 flex flex-col bg-gray-50/30 dark:bg-slate-950/40 transition-all duration-300 overflow-hidden`}
      >
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <h2 className="text-lg font-black text-gray-800 dark:text-slate-100 tracking-tight">
            Messages
          </h2>
          <div className="relative mt-3">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-xs" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-gray-50 dark:bg-slate-800/80 border-none rounded-xl pl-9 pr-3 h-9 text-xs font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv: Conversation) => (
            <button
              key={conv._id}
              onClick={() => handleConversationClick(conv)}
              data-testid={`conversation-${conv._id}`}
              className={`w-full p-3 flex gap-3 hover:bg-white dark:hover:bg-slate-800/80 transition-all border-b border-gray-50 dark:border-slate-800 text-left ${
                selectedConversation?._id === conv._id
                  ? 'bg-white dark:bg-slate-800 ring-2 ring-primary/20 z-10 shadow-sm'
                  : ''
              }`}
            >
              <div className="w-10 h-10 bg-blue-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <FiUser className="text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-black text-xs text-gray-800 dark:text-slate-100 truncate">
                    {conv.lastMessage.senderEmail === user.email ||
                    conv.lastMessage.senderEmail === 'admin@gram2city.com'
                      ? conv.lastMessage.receiverEmail
                      : conv.lastMessage.senderName || conv.lastMessage.senderEmail}
                  </span>
                  <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase">
                    {moment(conv.lastMessage.timestamp).format('HH:mm')}
                  </span>
                </div>
                <p className="textarea-xs text-gray-500 dark:text-slate-400 truncate font-medium">
                  {conv.lastMessage.message}
                </p>
              </div>
              {(conv.unreadCount || 0) > 0 && (
                <div className="w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0">
                  {conv.unreadCount || 0}
                </div>
              )}
            </button>
          ))}
          {conversations.length === 0 && (
            <div className="p-4 text-center textarea-xs text-gray-400 dark:text-slate-500 font-bold">
              No conversations yet
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {selectedConversation ? (
          <>
            <div className="px-6 py-3 border-b border-gray-50 dark:border-slate-800 flex items-center gap-3 bg-white dark:bg-slate-900 shrink-0">
              <button
                type="button"
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <FiChevronDown className="rotate-90" />
              </button>
              <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
                <FiUser className="text-lg" />
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-xs text-gray-800 dark:text-slate-100 truncate">
                  {selectedConversation.lastMessage.senderEmail === user.email ||
                  selectedConversation.lastMessage.senderEmail === 'admin@gram2city.com'
                    ? selectedConversation.lastMessage.receiverEmail
                    : selectedConversation.lastMessage.senderName ||
                      selectedConversation.lastMessage.senderEmail}
                </h3>
                <p className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                  <FiClock /> Active Support Session
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/20 dark:bg-slate-950/30">
              {messages.map((msg: Message, idx: number) => {
                const isMe =
                  msg.senderEmail === user.email || msg.senderEmail === 'admin@gram2city.com';
                return (
                  <div
                    key={msg.timestamp ?? idx}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex flex-col gap-1 max-w-[70%]">
                      <div
                        className={`p-3 rounded-2xl text-sm shadow-sm ${
                          isMe
                            ? 'bg-primary text-white rounded-tr-none'
                            : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 rounded-tl-none border border-gray-100 dark:border-slate-700/60'
                        }`}
                      >
                        {msg.imageUrl && (
                          <img
                            src={msg.imageUrl}
                            alt="Shared"
                            className="rounded-lg mb-2 max-h-60 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(msg.imageUrl ?? undefined, '_blank')}
                          />
                        )}
                        {msg.message && (
                          <p className="leading-relaxed font-medium">{msg.message}</p>
                        )}
                      </div>
                      <div
                        className={`flex items-center gap-1 text-[9px] font-bold text-gray-400 dark:text-slate-500 ${
                          isMe ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {moment(msg.timestamp).format('hh:mm A')}
                      </div>
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl border border-gray-100 dark:border-slate-700 flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-slate-600 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-slate-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-slate-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-50 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-3 items-center"
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
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                  uploading
                    ? 'bg-gray-50 dark:bg-slate-800 text-gray-300 dark:text-slate-600'
                    : 'bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-primary/5'
                }`}
              >
                {uploading ? <FiImage className="animate-pulse" /> : <FiSend className="text-lg" />}
              </button>
              <input
                type="text"
                placeholder="Type a response..."
                className="flex-1 bg-gray-50 dark:bg-slate-800/80 border-none rounded-xl px-4 h-11 text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary/20 transition-all"
                value={newMessage}
                onChange={handleInputChange}
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="w-11 h-11 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform shrink-0 disabled:opacity-50 cursor-pointer"
              >
                <FiSend className="text-lg" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-30 text-slate-400 dark:text-slate-500">
            <FiMessageSquare className="text-7xl mb-4" />
            <h3 className="text-xl font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">
              Select a Conversation
            </h3>
            <p className="max-w-xs font-bold mt-2 text-sm text-slate-500 dark:text-slate-400">
              Choose a conversation from the left or wait for incoming messages to start response in
              real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
