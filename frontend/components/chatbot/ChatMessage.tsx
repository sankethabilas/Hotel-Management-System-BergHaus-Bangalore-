"use client";

import { ChatMessage as ChatMessageType } from '@/services/chatbotService';

interface ChatMessageProps {
  message: ChatMessageType;
  onQuickReply?: (reply: string) => void;
}

export default function ChatMessage({ message, onQuickReply }: ChatMessageProps) {
  const isUser = message.sender === 'user';
  const timestamp = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-xs lg:max-w-md ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {isUser ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L3 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>

        {/* Message bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-4 py-2 rounded-lg ${
            isUser
              ? 'bg-blue-500 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
          }`}>
            <p className="text-sm whitespace-pre-wrap">{message.message}</p>
          </div>
          
          {/* Timestamp */}
          <span className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {timestamp}
          </span>
          
          {/* Quick replies for bot messages */}
          {!isUser && message.metadata?.quickReplies && onQuickReply && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.metadata.quickReplies.map((reply: string, index: number) => (
                <button
                  key={index}
                  onClick={() => onQuickReply(reply)}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
