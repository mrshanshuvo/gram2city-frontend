'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSocketStore } from '@/store/useSocketStore';
import { Message } from './types';
import { fetchMessages } from './api';

const TYPING_TIMEOUT_MS = 3000;

export const useChatSocket = ({
  conversationId,
  user,
  onMessagesMarkedRead,
  onMessageReceived,
}: {
  conversationId: string;
  user: {
    email: string;
    displayName?: string | null;
    role?: string | null;
    getIdToken?: () => Promise<string>;
  } | null;
  onMessagesMarkedRead?: (data: { conversationId: string; readByEmail: string }) => void;
  onMessageReceived?: (msg: Message) => void;
}) => {
  const { socket, connected } = useSocketStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Destructure primitive properties to avoid re-running effects on object reference changes
  const userEmail = user?.email;
  const userDisplayName = user?.displayName;
  const userRole = user?.role;
  const getIdToken = user?.getIdToken;

  // Cache getIdToken in a ref so we can query token without re-running callbacks
  const getIdTokenRef = useRef(getIdToken);
  useEffect(() => {
    getIdTokenRef.current = getIdToken;
  }, [getIdToken]);

  const getToken = useCallback(async () => {
    const localToken =
      typeof window !== 'undefined' ? localStorage.getItem('gram2city_jwt_token') : null;
    if (localToken) return localToken;
    try {
      return getIdTokenRef.current ? await getIdTokenRef.current() : null;
    } catch {
      return null;
    }
  }, []);

  // Use refs for dynamic callbacks so effect is not re-registered on every render
  const onMessagesMarkedReadRef = useRef(onMessagesMarkedRead);
  const onMessageReceivedRef = useRef(onMessageReceived);
  useEffect(() => {
    onMessagesMarkedReadRef.current = onMessagesMarkedRead;
    onMessageReceivedRef.current = onMessageReceived;
  }, [onMessagesMarkedRead, onMessageReceived]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const loadHistory = async () => {
      try {
        const history = await fetchMessages(conversationId);
        const uniqueHistory: Message[] = [];
        const seenKeys = new Set<string>();
        for (const msg of history || []) {
          const key = `${msg.timestamp}_${msg.senderEmail}_${msg.message}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            uniqueHistory.push(msg);
          }
        }
        setMessages(uniqueHistory);
      } catch (err) {
        console.error('Failed to load message history:', err);
      }
    };

    loadHistory();
  }, [conversationId]);

  const markRead = useCallback(async () => {
    if (!socket || !conversationId || !userEmail) return;
    const token = await getToken();
    if (!token) return;
    socket.emit('mark_messages_read', {
      conversationId,
      readByEmail: userEmail,
      token,
    });
  }, [socket, conversationId, userEmail, getToken]);

  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg: Message) => {
      if (conversationId && msg.conversationId === conversationId) {
        setMessages((prev) => {
          const exists = prev.some(
            (m) => m.timestamp === msg.timestamp && m.senderEmail === msg.senderEmail,
          );
          if (exists) return prev;
          return [...prev, msg];
        });
      }
      onMessageReceivedRef.current?.(msg);
    };

    const handleTyping = (data?: { senderEmail?: string }) => {
      if (!data?.senderEmail || data.senderEmail === userEmail) return;
      setIsTyping(true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => setIsTyping(false), TYPING_TIMEOUT_MS);
    };

    const handleMarkedRead = (data: { conversationId: string; readByEmail: string }) => {
      if (data.conversationId !== conversationId) return;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.receiverEmail === data.readByEmail && !msg.isRead ? { ...msg, isRead: true } : msg,
        ),
      );
      onMessagesMarkedReadRef.current?.(data);
    };

    const handleError = () => {
      // Errors are surfaced by callers; hook keeps transport concerns isolated.
    };

    socket.on('receive_message', handleReceive);
    socket.on('user_typing', handleTyping);
    socket.on('messages_marked_read', handleMarkedRead);
    socket.on('message_error', handleError);

    return () => {
      socket.off('receive_message', handleReceive);
      socket.off('user_typing', handleTyping);
      socket.off('messages_marked_read', handleMarkedRead);
      socket.off('message_error', handleError);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [conversationId, socket, userEmail]);

  useEffect(() => {
    if (!socket || !connected || !userEmail) return;

    const tokenPromise = getToken();
    tokenPromise.then((token) => {
      if (token) {
        // Always join the user's personal room for direct notification updates
        socket.emit('join_chat', userEmail, token);

        // If a specific conversation is active, join that room too
        if (conversationId) {
          socket.emit('join_chat', conversationId, token);
        }
      }
    });
  }, [conversationId, socket, connected, userEmail, getToken]);

  const sendTyping = useCallback(async () => {
    if (!socket || !conversationId || !userEmail) return;
    const token = await getToken();
    if (!token) return;
    socket.emit('typing', {
      conversationId,
      token,
    });
  }, [socket, conversationId, userEmail, getToken]);

  return {
    messages,
    isTyping,
    sendMessage: async (text: string, imageUrl?: string | null) => {
      if (!socket || !userEmail) return;
      const token = await getToken();
      if (!token) return;

      // Determine who should receive the message:
      // If the current user is an admin or has admin email, the receiver is the customer.
      // Since the conversation ID is of the form: admin@gram2city.com_customerEmail
      // the customer is the one that is NOT admin@gram2city.com.
      // If the current user is a customer, the receiver is always the virtual support inbox (admin@gram2city.com).
      const isAdmin =
        userRole === 'admin' || userRole === 'superAdmin' || userEmail === 'admin@gram2city.com';

      const receiverEmail = isAdmin
        ? conversationId.split('_').find((p) => p !== 'admin@gram2city.com') || ''
        : 'admin@gram2city.com';

      socket.emit('send_message', {
        senderEmail: userEmail,
        senderName: userDisplayName,
        senderRole: userRole || 'user',
        receiverEmail,
        message: text,
        imageUrl: imageUrl || null,
        conversationId,
        token,
      });
    },
    markRead,
    sendTyping,
  };
};
