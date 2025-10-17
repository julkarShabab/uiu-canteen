import { io } from 'socket.io-client';

// Create a socket instance
const socket = io('http://localhost:5000', {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Socket event listeners
const socketEvents = {
  connect: (callback) => {
    socket.on('connect', callback);
  },
  
  disconnect: (callback) => {
    socket.on('disconnect', callback);
  },
  
  error: (callback) => {
    socket.on('error', callback);
  },
  
  // Order events
  orderUpdated: (callback) => {
    socket.on('order:updated', callback);
  },
  orderNew: (callback) => {
    socket.on('order:new', callback);
  },
  
  orderAssigned: (callback) => {
    socket.on('order:assigned', callback);
  },
  
  // Notification events
  notification: (callback) => {
    socket.on('notification', callback);
  },

  // Menu events
  menuUpdated: (callback) => {
    socket.on('menu:updated', callback);
  },
  
  // Chat events
  chatMessage: (callback) => {
    socket.on('chat:message', callback);
  },
  
  chatHistory: (callback) => {
    socket.on('chat:history', callback);
  },
};

// Socket emitters
const socketEmitters = {
  connectWithAuth: (token) => {
    socket.auth = { token };
    socket.connect();
  },
  
  disconnect: () => {
    socket.disconnect();
  },
  
  // Order emitters
  updateOrderStatus: (orderId, status) => {
    socket.emit('order:updateStatus', { orderId, status });
  },
  
  assignDelivery: (orderId, deliveryPersonId) => {
    socket.emit('order:assignDelivery', { orderId, deliveryPersonId });
  },
  
  // Location emitters
  updateLocation: (location) => {
    socket.emit('location:update', location);
  },
  
  // Chat emitters
  sendChatMessage: (messageData) => {
    socket.emit('chat:sendMessage', messageData);
  },
  
  getChatHistory: (orderId) => {
    socket.emit('chat:getHistory', { orderId });
  },
};

export { socket, socketEvents, socketEmitters };