"use client";

import { useState } from 'react';

interface FloatingChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
  unreadCount?: number;
}

export default function FloatingChatButton({ onClick, isOpen, unreadCount = 0 }: FloatingChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
        isOpen ? 'rotate-45' : ''
      }`}
      aria-label="Open chat"
    >
      {/* Chat Icon */}
      <div className="flex items-center justify-center w-full h-full">
        {isOpen ? (
          // Close icon (X)
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Chat icon
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </div>
      
      {/* Unread count badge */}
      {unreadCount > 0 && !isOpen && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-bounce">
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        {isOpen ? 'Close chat' : 'Chat with us'}
      </div>
    </button>
  );
}
