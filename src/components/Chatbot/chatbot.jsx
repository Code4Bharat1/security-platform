'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello Faheem! I'm your cybersecurity assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      text: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiBase = (process.env.NEXT_PUBLIC_PROD_API_URL || "http://localhost:5000/api").replace(/\/+$/, "").replace(/\/api$/, "");
      const response = await axios.post(`${apiBase}/ask`, {
        question: input
      });

      const botMessage = {
        id: messages.length + 2,
        text: response.data.answer,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);

      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, I'm having trouble connecting to the server. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Markdown components customization
  const markdownComponents = {
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <pre className="bg-gray-800 text-gray-100 p-3 rounded-md overflow-x-auto text-sm my-2">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      ) : (
        <code className="bg-gray-200 px-1 py-0.5 rounded text-sm" {...props}>
          {children}
        </code>
      );
    },
    p: ({ node, children, ...props }) => (
      <p className="mb-2" {...props}>
        {children}
      </p>
    ),
    ul: ({ node, children, ...props }) => (
      <ul className="list-disc list-inside mb-2 ml-4" {...props}>
        {children}
      </ul>
    ),
    ol: ({ node, children, ...props }) => (
      <ol className="list-decimal list-inside mb-2 ml-4" {...props}>
        {children}
      </ol>
    ),
    li: ({ node, children, ...props }) => (
      <li className="mb-1" {...props}>
        {children}
      </li>
    ),
    strong: ({ node, children, ...props }) => (
      <strong className="font-semibold" {...props}>
        {children}
      </strong>
    ),
    a: ({ node, children, ...props }) => (
      <a className="text-blue-600 hover:text-blue-800 underline" {...props} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    blockquote: ({ node, children, ...props }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2" {...props}>
        {children}
      </blockquote>
    ),
  };

  return (
    <>
      {/* Floating Chat Icon */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          title="Open Chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4-.8L3 20l1.8-5A7.963 7.963 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>

        {/* Chat Popup */}
        {isOpen && (
          <div className="absolute bottom-16 left-0 w-80 sm:w-96 bg-white rounded-xl shadow-xl flex flex-col overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 font-semibold flex justify-between items-center">
              <span>Cybersecurity Assistant</span>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-white hover:text-gray-200 transition-colors duration-200 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs sm:max-w-sm rounded-lg p-3 ${
                      message.isUser
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                    }`}
                  >
                    {message.isUser ? (
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    ) : (
                      <ReactMarkdown 
                        components={markdownComponents}
                      >
                        {message.text}
                      </ReactMarkdown>
                    )}
                    <p className={`text-xs mt-2 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 rounded-lg rounded-bl-none p-3 max-w-xs border border-gray-200">
                    <div className="flex space-x-2 items-center">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></div>
                      <span className="text-xs text-gray-600 ml-2">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="border-t border-gray-200 p-3 bg-white">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about cybersecurity..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}