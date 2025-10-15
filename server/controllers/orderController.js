import Order from '../models/Order.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { items, total, deliveryAddress, deliveryInstructions } = req.body;

    if (!items || !total || !deliveryAddress) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    const order = await Order.create({
      userId: req.user.id,
      items,
      total,
      status: 'pending',
      deliveryAddress,
      deliveryInstructions,
      estimatedDelivery: new Date(Date.now() + 30 * 60000).toISOString(), // 30 minutes
      assignedDelivery: null
    });

    // Notify restaurant clients about the new order via websockets
    try {
      if (global.io) {
        global.io.to('restaurant').emit('order:new', order);
        global.io.to('restaurant').emit('notification', {
          type: 'order_new',
          message: `New order #${order.id} received`,
          orderId: order.id,
        });
      }
    } catch (e) {
      // ignore socket errors
    }

    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (for restaurant staff)
// @route   GET /api/orders
// @access  Private/Restaurant
export const getAllOrders = async (req, res) => {
  try {
    if (req.user.type !== 'restaurant') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const orders = await Order.findAll();
    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findByUserId(req.user.id);
    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if user owns this order or is restaurant staff
    if (order.userId !== req.user.id && req.user.type !== 'restaurant' && req.user.type !== 'delivery') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Restaurant or Delivery
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, message: 'Please provide status' });
    }

    // Validate status
    const validStatuses = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check authorization
    const isAssignedToDeliveryUser = req.user.type === 'delivery' && (
      order.assignedDelivery === req.user.id || order.assignedDelivery?.id === req.user.id
    );
    if (req.user.type !== 'restaurant' && !isAssignedToDeliveryUser) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updatedOrder = await Order.updateStatus(req.params.id, status);

    // Broadcast status update
    try {
      if (global.io) {
        global.io.emit('order:updated', { orderId: updatedOrder.id, status: updatedOrder.status });
      }
    } catch (e) {}

    res.status(200).json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign delivery person to order
// @route   PUT /api/orders/:id/assign
// @access  Private/Restaurant
export const assignDeliveryPerson = async (req, res) => {
  try {
    if (req.user.type !== 'restaurant') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Auto-select delivery person by ascending studentId
    const candidates = (global.mockUsers || [])
      .filter(u => u.type === 'delivery' && u.studentId && u.isAvailable === true)
      .sort((a, b) => Number(a.studentId) - Number(b.studentId));

    if (candidates.length === 0) {
      return res.status(400).json({ success: false, message: 'No delivery personnel available' });
    }

    const chosen = candidates[0];

    const updatedOrder = await Order.assignDelivery(req.params.id, chosen._id);

    // Broadcast assignment update
    try {
      if (global.io) {
        global.io.emit('order:updated', { orderId: updatedOrder.id, status: updatedOrder.status });
      }
    } catch (e) {}

    res.status(200).json({
      success: true,
      order: updatedOrder,
      assignedDeliveryPerson: { id: chosen._id, name: chosen.name, studentId: chosen.studentId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get pending orders (for delivery personnel)
// @route   GET /api/orders/pending
// @access  Private/Delivery
export const getPendingOrders = async (req, res) => {
  try {
    if (req.user.type !== 'delivery') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const orders = await Order.findAll();
    const pendingOrders = orders.filter(order => order.status === 'pending');

    res.status(200).json({
      success: true,
      count: pendingOrders.length,
      orders: pendingOrders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};