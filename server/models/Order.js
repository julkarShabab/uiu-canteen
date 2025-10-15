import { v4 as uuidv4 } from 'uuid';

// In-memory Order model
class Order {
  constructor() {
    // Initialize with empty orders array
    if (!global.mockOrders) {
      global.mockOrders = [];
    }
  }

  // Create a new order
  async create(orderData) {
    const order = {
      id: uuidv4(),
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    global.mockOrders.push(order);

    // Persist to disk if saver is available
    if (global.saveOrders) {
      try {
        global.saveOrders(global.mockOrders);
      } catch (e) {
        // non-fatal
      }
    }

    return order;
  }

  // Get all orders
  async findAll() {
    return global.mockOrders;
  }

  // Get orders by user ID
  async findByUserId(userId) {
    return global.mockOrders.filter(order => order.userId === userId);
  }

  // Get order by ID
  async findById(id) {
    return global.mockOrders.find(order => order.id === id);
  }

  // Update order
  async update(id, updateData) {
    const index = global.mockOrders.findIndex(order => order.id === id);
    if (index === -1) return null;

    const updatedOrder = {
      ...global.mockOrders[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    global.mockOrders[index] = updatedOrder;

    // Persist to disk if saver is available
    if (global.saveOrders) {
      try {
        global.saveOrders(global.mockOrders);
      } catch (e) {
        // non-fatal
      }
    }

    return updatedOrder;
  }

  // Update order status
  async updateStatus(id, status) {
    return this.update(id, { status });
  }

  // Assign delivery person to order
  async assignDelivery(id, deliveryPerson) {
    // Normalize assignedDelivery to an object with id, name, studentId if possible
    let assigned = deliveryPerson;
    if (typeof deliveryPerson === 'string') {
      const user = (global.mockUsers || []).find(u => u._id === deliveryPerson);
      assigned = user ? { id: user._id, name: user.name, studentId: user.studentId } : { id: deliveryPerson };
    }
    return this.update(id, { 
      assignedDelivery: assigned,
      status: 'assigned'
    });
  }
}

export default new Order();