import express from 'express';
import { 
  createOrder, 
  getAllOrders, 
  getMyOrders, 
  getOrderById, 
  updateOrderStatus, 
  assignDeliveryPerson,
  getPendingOrders
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
// None

// Protected routes
router.post('/', protect, createOrder);
router.get('/', protect, getAllOrders);
router.get('/myorders', protect, getMyOrders);
router.get('/pending', protect, getPendingOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, updateOrderStatus);
router.put('/:id/assign', protect, assignDeliveryPerson);

export default router;