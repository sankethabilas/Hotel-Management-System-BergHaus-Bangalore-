"use client";

interface QuickRepliesProps {
  replies: string[];
  onReply: (reply: string) => void;
}

export default function QuickReplies({ replies, onReply }: QuickRepliesProps) {
  if (!replies || replies.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {replies.map((reply, index) => (
        <button
          key={index}
          onClick={() => onReply(reply)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          {reply}
        </button>
      ))}
    </div>
  );
}
