import { useState } from 'react';
import ChatUI from './components/ChatUI';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🤖 Ollama Chat
          </h1>
          <p className="text-purple-200 text-lg">
            Powered by OpenAI GPT • Cloud-based AI
          </p>
        </header>
        <ChatUI />
      </div>
    </div>
  );
}

export default App;
