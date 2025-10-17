import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import fs from 'fs';
import path from 'path';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import setupSocket from './socket.js';
import { protect } from './middleware/auth.js';

// Load env vars
dotenv.config();

// Skip database connection for now - using in-memory mock
console.log('Using in-memory mock database instead of MongoDB');

// File paths for persistent data storage
const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json');
const MENU_FILE = path.join(process.cwd(), 'data', 'menu.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(USERS_FILE))) {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
}

// Load users from file or create empty array
const loadUsers = () => {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
  return [];
};

// Save users to file
const saveUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

// Load orders from file or create empty array
const loadOrders = () => {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading orders:', error);
  }
  return [];
};

// Save orders to file
const saveOrders = (orders) => {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  } catch (error) {
    console.error('Error saving orders:', error);
  }
};

// Load menu from file or create empty array
const loadMenu = () => {
  try {
    if (fs.existsSync(MENU_FILE)) {
      const data = fs.readFileSync(MENU_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading menu:', error);
  }
  return [];
};

// Save menu to file
const saveMenu = (items) => {
  try {
    fs.writeFileSync(MENU_FILE, JSON.stringify(items, null, 2));
  } catch (error) {
    console.error('Error saving menu:', error);
  }
};

// Initialize storage with persistent data
global.mockUsers = loadUsers();
global.saveUsers = saveUsers;

global.mockOrders = loadOrders();
global.saveOrders = saveOrders;

global.menuItems = loadMenu();
global.saveMenu = saveMenu;

console.log(`Loaded ${global.mockUsers.length} users and ${global.mockOrders.length} orders from persistent storage`);

// Initialize empty users array if none exist

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = setupSocket(server);
// Expose io globally for controllers to emit events
global.io = io;

// Body parser
app.use(express.json());

// Enable CORS with specific configuration
app.use(cors({
  origin: [
    'http://localhost:5173', 'http://127.0.0.1:5173',
    'http://localhost:5174', 'http://127.0.0.1:5174',
    'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:4173',
    'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://127.0.0.1:3002'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// Menu endpoints
app.get('/api/menu', (req, res) => {
  res.json({ menuItems: global.menuItems || [] });
});

app.post('/api/menu', (req, res) => {
  try {
    const { name, description, price, category, image, available } = req.body;
    if (!name || !description || typeof price === 'undefined' || !category || !image) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }
    const item = {
      id: Date.now(),
      name,
      description,
      price: Number(price),
      category,
      image,
      available: available !== false
    };
    global.menuItems.push(item);
    if (global.saveMenu) global.saveMenu(global.menuItems);
    if (global.io) {
      global.io.emit('menu:updated', { action: 'create', item });
    }
    res.status(201).json({ success: true, item });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.put('/api/menu/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const idx = (global.menuItems || []).findIndex(i => i.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
    const updated = { ...global.menuItems[idx], ...req.body };
    global.menuItems[idx] = updated;
    if (global.saveMenu) global.saveMenu(global.menuItems);
    if (global.io) {
      global.io.emit('menu:updated', { action: 'update', item: updated });
    }
    res.json({ success: true, item: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.delete('/api/menu/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const before = (global.menuItems || []).length;
    global.menuItems = (global.menuItems || []).filter(i => i.id !== id);
    if (global.saveMenu) global.saveMenu(global.menuItems);
    if (global.io) {
      global.io.emit('menu:updated', { action: 'delete', id });
    }
    res.json({ success: true, deleted: before - (global.menuItems || []).length });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Test route
app.post('/api/test', (req, res) => {
  console.log('Test endpoint received:', req.body);
  res.json({ success: true, message: 'Test endpoint working', data: req.body });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});