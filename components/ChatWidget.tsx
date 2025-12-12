import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, User, Sparkles } from 'lucide-react';
import { ChatSession } from '../services/geminiService';
import { ChatMessage, Sender } from '../types';

interface ChatWidgetProps {
  chatSession: ChatSession | null;
  hasFile: boolean;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ chatSession, hasFile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    // Initial greeting when file is loaded
    if (hasFile && messages.length === 0) {
      setMessages([
        {
          id: 'init',
          sender: Sender.MODEL,
          text: "I've analyzed the document. Ask me anything about the agenda, specific topics, or details within the file!",
          timestamp: new Date()
        }
      ]);
    } else if (!hasFile) {
        setMessages([]); // Reset on no file
    }
  }, [hasFile]);

  const handleSend = async () => {
    if (!inputValue.trim() || !chatSession) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: Sender.USER,
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const responseText = await chatSession.sendMessage(userMsg.text);
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: Sender.MODEL,
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: Sender.MODEL,
        text: "Sorry, I had trouble processing that request.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!hasFile) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none`}>
      {/* Chat Window */}
      <div 
        className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-[380px] h-[500px] mb-4 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right pointer-events-auto ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8 pointer-events-none h-0 w-0 mb-0'
        }`}
      >
        {/* Header */}
        <div className="bg-slate-900 p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={16} />
            </div>
            <div>
               <h3 className="text-white font-bold text-sm">Agenda Assistant</h3>
               <p className="text-slate-400 text-[10px]">Gemini 3 Pro Preview</p>
            </div>
          </div>
          <button onClick={toggleChat} className="text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === Sender.USER ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-2 max-w-[85%] ${msg.sender === Sender.USER ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                  msg.sender === Sender.USER ? 'bg-slate-200 text-slate-600' : 'bg-indigo-100 text-indigo-600'
                }`}>
                  {msg.sender === Sender.USER ? <User size={12} /> : <Bot size={12} />}
                </div>
                <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.sender === Sender.USER 
                    ? 'bg-white text-slate-800 rounded-tr-none border border-slate-100' 
                    : 'bg-indigo-600 text-white rounded-tl-none'
                } ${msg.isError ? 'bg-red-50 text-red-600 border-red-100' : ''}`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex justify-start">
               <div className="flex gap-2 max-w-[85%]">
                 <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-1">
                    <Bot size={12} />
                 </div>
                 <div className="bg-indigo-50 p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                 </div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t border-slate-100 shrink-0">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about the meeting..."
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
            <button 
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={toggleChat}
        className={`pointer-events-auto h-14 w-14 bg-slate-900 hover:bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-900/20 flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${isOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`}
        aria-label="Open Chat"
      >
        <MessageSquare size={24} />
      </button>
      
      {/* Floating close button when open, to allow easy closing without reaching top right of modal if preferred, though top right is standard */}
       <button 
        onClick={toggleChat}
        className={`pointer-events-auto absolute bottom-0 right-0 h-14 w-14 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform ${isOpen ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
        aria-label="Close Chat"
      >
        <X size={24} />
      </button>
    </div>
  );
};