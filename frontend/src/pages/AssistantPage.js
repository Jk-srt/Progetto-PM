import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Container } from "react-bootstrap";

const AssistantPage = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hello! I'm your AI financial advisor. How can I help you today?" }
  ]);
  const chatContainerRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setMessages(msgs => [...msgs, { sender: 'user', text: query }]);
    setQuery('');
    try {
      const res = await fetch('http://localhost:5000/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setMessages(msgs => [...msgs, { sender: 'ai', text: data.response }]);
    } catch (error) {
      setMessages(msgs => [...msgs, { sender: 'ai', text: 'Si è verificato un errore. Riprova più tardi.' }]);
    }
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Container fluid className="p-0 h-screen flex flex-col">
      <div className="bg-gray-900 text-gray-300 dark:bg-gray-800 rounded-xl shadow-md overflow-hidden m-4 flex flex-col flex-grow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Ask Your Financial Question</h3>
        </div>
        <div
          id="chat-container"
          ref={chatContainerRef}
          className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-800 rounded-lg"
        >
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`${m.sender === 'user'
                ? 'bg-blue-600 text-gray-300'
                : 'bg-gray-700 text-gray-300'
              } rounded-xl p-3 max-w-xs md:max-w-md`}>
                {/* render markdown incluso R code block */}
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-700 bg-gray-800 rounded-b-xl">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Type your financial question..."
              className="flex-grow px-4 py-2 rounded-full border border-gray-600 bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded-full transition-colors duration-300"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </div>
    </Container>
  );
};

export default AssistantPage;