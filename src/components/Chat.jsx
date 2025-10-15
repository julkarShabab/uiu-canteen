import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket, socketEmitters } from '../utils/socket';

const Chat = ({ orderId, recipientId, recipientName, recipientRole }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  useEffect(() => {
    // Listen for new messages
    socket.on('chat:message', (newMessage) => {
      if (newMessage.orderId === orderId) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        
        // If chat is not open, increment unread count
        if (!isOpen && newMessage.senderId !== user.id) {
          setUnreadCount((prev) => prev + 1);
        }
      }
    });

    // Get chat history when component mounts
    socketEmitters.getChatHistory(orderId);
    
    socket.on('chat:history', ({ orderId: historyOrderId, messages: chatHistory }) => {
      if (historyOrderId === orderId) {
        setMessages(chatHistory);
      }
    });

    return () => {
      socket.off('chat:message');
      socket.off('chat:history');
    };
  }, [orderId, user.id, isOpen]);

  // Scroll to bottom when messages change or chat opens
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      chatInputRef.current?.focus();
      setUnreadCount(0); // Clear unread count when opening chat
    }
  }, [isOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      orderId,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      recipientId,
      content: message,
      timestamp: new Date().toISOString(),
    };

    socketEmitters.sendChatMessage(newMessage);
    setMessage('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg flex items-center justify-center relative"
      >
        <MessageCircle size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl overflow-hidden"
          >
            {/* Chat header */}
            <div className="bg-blue-500 text-white p-3 flex justify-between items-center">
              <h3 className="font-medium">
                Chat with {recipientName} ({recipientRole})
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat messages */}
            <div className="h-80 overflow-y-auto p-3 bg-gray-50">
              {messages.length === 0 ? (
                <p className="text-center text-gray-500 my-4">
                  No messages yet. Start the conversation!
                </p>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-3 ${
                      msg.senderId === user.id ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block px-3 py-2 rounded-lg max-w-[80%] ${
                        msg.senderId === user.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t">
              <div className="flex">
                <input
                  type="text"
                  ref={chatInputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-grow px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-r-lg"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chat;