"use client";

import { useState } from 'react';
import FloatingChatButton from './FloatingChatButton';
import ChatWindow from './ChatWindow';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleToggleChat = () => {
    setIsOpen(prev => {
      const newState = !prev;
      if (newState) {
        setUnreadCount(0); // Clear unread count when opening
      }
      return newState;
    });
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <FloatingChatButton
        onClick={handleToggleChat}
        isOpen={isOpen}
        unreadCount={unreadCount}
      />
      <ChatWindow
        isOpen={isOpen}
        onClose={handleClose}
      />
    </>
  );
}
