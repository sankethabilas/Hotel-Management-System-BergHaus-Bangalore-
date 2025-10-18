"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  clearUnreadCount: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const incrementUnreadCount = () => {
    setUnreadCount(prev => prev + 1);
  };

  const clearUnreadCount = () => {
    setUnreadCount(0);
  };

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        setIsOpen,
        unreadCount,
        setUnreadCount,
        incrementUnreadCount,
        clearUnreadCount,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
