import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';

// Socket.io setup
const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });
  
  // In-memory storage for chat messages (in a real app, use a database)
  const chatMessages = {};

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: ' + error.message));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);
    
    // Join user to their own room
    socket.join(socket.user.id);
    
    // Join room based on user type
    if (socket.user.type === 'restaurant') {
      socket.join('restaurant');
    } else if (socket.user.type === 'delivery') {
      socket.join('delivery');
    }

    // Order status update
    socket.on('order:updateStatus', async ({ orderId, status }) => {
      // Broadcast to all relevant parties
      io.emit('order:updated', { orderId, status });
      
      // Send notification
      io.emit('notification', {
        type: 'order_status',
        message: `Order #${orderId} status updated to ${status}`,
        orderId
      });
    });

    // Order assignment
    socket.on('order:assignDelivery', async ({ orderId, deliveryPersonId }) => {
      // Notify delivery person
      io.to(deliveryPersonId).emit('order:assigned', { orderId });
      
      // Send notification to delivery person
      io.to(deliveryPersonId).emit('notification', {
        type: 'new_assignment',
        message: `New delivery assignment: Order #${orderId}`,
        orderId
      });
    });

    // Location update
    socket.on('location:update', (location) => {
      // Broadcast to relevant parties if this is a delivery person
      if (socket.user.type === 'delivery') {
        // Find orders assigned to this delivery person and broadcast to those rooms
        const assignedOrders = global.mockOrders?.filter(order => (
          order.assignedDelivery === socket.user.id || order.assignedDelivery?.id === socket.user.id
        )) || [];
        
        assignedOrders.forEach(order => {
          io.to(order.id).emit('delivery:locationUpdate', {
            orderId: order.id,
            deliveryPersonId: socket.user.id,
            location
          });
        });
      }
    });
    
    // Handle chat messages
    socket.on('chat:sendMessage', (messageData) => {
      const { orderId, recipientId, content } = messageData;
      
      // Store message in memory (in a real app, save to database)
      if (!chatMessages[orderId]) {
        chatMessages[orderId] = [];
      }
      
      const newMessage = {
        orderId,
        senderId: socket.user.id,
        senderName: socket.user.name,
        senderRole: socket.user.type,
        recipientId,
        content,
        timestamp: new Date().toISOString(),
      };
      
      chatMessages[orderId].push(newMessage);
      
      // Broadcast message to all clients interested in this order's chat
      io.to(orderId).emit('chat:message', newMessage);
      
      // Send notification to recipient
      io.to(recipientId).emit('notification', {
        type: 'chat_message',
        message: `New message from ${socket.user.name}`,
        orderId,
        senderId: socket.user.id,
        preview: content.substring(0, 30) + (content.length > 30 ? '...' : ''),
      });
    });
    
    // Handle chat history requests
    socket.on('chat:getHistory', ({ orderId }) => {
      const history = chatMessages[orderId] || [];
      socket.emit('chat:history', { orderId, messages: history });
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });

  return io;
};

export default setupSocket;