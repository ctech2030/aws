const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-2 rounded-lg text-sm max-w-[80%]">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
        isUser
          ? 'bg-purple-600 text-white'
          : 'bg-slate-700/50 text-slate-100 border border-slate-600/50'
      }`}>
        <div className="text-sm font-medium mb-1 opacity-80">
          {isUser ? '👤 You' : '🤖 Assistant'}
        </div>
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
