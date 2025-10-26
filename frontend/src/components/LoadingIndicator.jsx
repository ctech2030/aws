const LoadingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-slate-700/50 text-slate-100 rounded-2xl px-4 py-3 border border-slate-600/50">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-sm text-slate-300 ml-2">Thinking...</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
