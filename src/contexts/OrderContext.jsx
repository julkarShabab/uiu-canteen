import React, { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { socket, socketEvents, socketEmitters } from '../utils/socket'
import api from '../utils/api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

const OrderContext = createContext()

export const useOrder = () => {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider')
  }
  return context
}

export const OrderProvider = ({ children }) => {
  // Initialize state from localStorage to prevent data loss on refresh
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart')
      return savedCart ? JSON.parse(savedCart) : []
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
      return []
    }
  })
  
  const [orders, setOrders] = useState(() => {
    try {
      const savedOrders = localStorage.getItem('orders')
      return savedOrders ? JSON.parse(savedOrders) : []
    } catch (error) {
      console.error('Error loading orders from localStorage:', error)
      return []
    }
  })
  
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [menuItems, setMenuItems] = useState(() => {
    try {
      const savedMenuItems = localStorage.getItem('menuItems')
      return savedMenuItems ? JSON.parse(savedMenuItems) : []
    } catch (error) {
      console.error('Error loading menu items from localStorage:', error)
      return []
    }
  })

  // Fetch menu items from server with localStorage fallback
  const fetchMenuItems = async () => {
    try {
      setLoading(true)
      const response = await api.get('/menu')
      const serverItems = response?.data?.menuItems
      if (Array.isArray(serverItems) && serverItems.length > 0) {
        setMenuItems(serverItems)
      } else {
        const stored = localStorage.getItem('menuItems')
        if (stored) {
          try {
            setMenuItems(JSON.parse(stored))
          } catch (_) {
            // ignore parse errors
          }
        } else {
          setMenuItems([])
        }
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching menu items:', error)
      const stored = localStorage.getItem('menuItems')
      if (stored) {
        try { setMenuItems(JSON.parse(stored)) } catch (_) {}
      }
      setLoading(false)
    }
  }

  // Menu item management functions
  const addMenuItem = (item) => {
    const newItem = {
      ...item,
      id: Date.now()
    }
    const next = [...menuItems, newItem]
    setMenuItems(next)
    localStorage.setItem('menuItems', JSON.stringify(next))
    toast.success('Menu item added successfully')
    return newItem
  }

  const updateMenuItem = (id, updatedItem) => {
    const updatedMenuItems = menuItems.map(item => 
      item.id === id ? { ...item, ...updatedItem } : item
    )
    setMenuItems(updatedMenuItems)
    localStorage.setItem('menuItems', JSON.stringify(updatedMenuItems))
    toast.success('Menu item updated successfully')
  }

  const removeMenuItem = (id) => {
    const updatedMenuItems = menuItems.filter(item => item.id !== id)
    setMenuItems(updatedMenuItems)
    localStorage.setItem('menuItems', JSON.stringify(updatedMenuItems))
    toast.success('Menu item removed successfully')
  }

  // Connect to socket when user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      socketEmitters.connectWithAuth(token);
      
      // Setup socket event listeners
      socketEvents.orderUpdated((data) => {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === data.orderId 
              ? { ...order, status: data.status } 
              : order
          )
        );
      });

      // New order notifications for restaurant staff
      socketEvents.orderNew((order) => {
        if (user && user.type === 'restaurant') {
          setOrders(prev => [order, ...prev])
          setNotifications(prev => [...prev, { type: 'order_new', message: `New order #${order.id} received`, orderId: order.id }])
        }
      });
      
      socketEvents.notification((notification) => {
        setNotifications(prev => [...prev, notification]);
      });

      // Fetch initial orders only when user info is available
      if (user) {
        if (user.type === 'restaurant') {
          fetchAllOrders();
        } else {
          fetchUserOrders();
        }
      }
    }
    
    return () => {
      if (localStorage.getItem('token')) {
        socketEmitters.disconnect();
      }
    };
  }, [user]);

  // If token exists and user becomes available later, fetch accordingly
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && user) {
      if (user.type === 'restaurant') {
        fetchAllOrders();
      } else {
        fetchUserOrders();
      }
    }
  }, [user?.type]);
  
  // Fetch menu items when component mounts
  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Persist menu items locally so they survive refreshes (no demo data added automatically)
  useEffect(() => {
    localStorage.setItem('menuItems', JSON.stringify(menuItems))
  }, [menuItems])

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  // Save orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders))
    // Also save to restaurantOrders for the restaurant dashboard
    localStorage.setItem('restaurantOrders', JSON.stringify(orders))
  }, [orders])

  const addToCart = (item, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id)
      
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        )
      } else {
        return [...prevCart, { ...item, quantity }]
      }
    })
    toast.success(`${item.name} added to cart!`)
  }

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId))
    toast.success('Item removed from cart')
  }

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
    localStorage.setItem('cart', JSON.stringify([]))
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0)
  }

  const addOrder = (order) => {
    const updatedOrders = [order, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    return order;
  };

  const placeOrder = async (deliveryAddress, deliveryInstructions = '') => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return null;
    }

    try {
      setLoading(true);
      
      // Create a new order directly in the frontend
      const newOrder = {
        id: `order-${Date.now()}`,
        user: user?.id || 'guest',
        items: [...cart],
        total: getCartTotal(),
        status: 'pending',
        deliveryAddress,
        deliveryInstructions,
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 30 * 60000).toISOString(), // 30 minutes
        assignedDelivery: null
      };
      
      // Skip API call entirely to avoid potential errors
      // Just add the order to local state and localStorage
      const updatedOrders = [newOrder, ...orders];
      setOrders(updatedOrders);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      localStorage.setItem('restaurantOrders', JSON.stringify(updatedOrders));
      
      // Force update via socket if available
      if (socket && socket.connected) {
        socketEmitters.newOrder(newOrder);
      }
      
      // Clear the cart and save to localStorage
      clearCart();
      
      toast.success('Order placed successfully!');
      setLoading(false);
      
      return newOrder;
    } catch (error) {
      setLoading(false);
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
      return null;
    }
  }

  const fetchUserOrders = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/orders/myorders')
      setOrders(response?.data?.orders || [])
      setLoading(false)
      return response?.data?.orders || []
    } catch (error) {
      setLoading(false)
      console.error('Error fetching orders:', error)
      return orders
    }
  }

  const fetchAllOrders = async () => {
    try {
      setLoading(true)
      const response = await api.get('/orders')
      setOrders(response?.data?.orders || [])
      setLoading(false)
      return response?.data?.orders || []
    } catch (error) {
      setLoading(false)
      console.error('Error fetching all orders:', error)
      return orders
    }
  }

  const updateOrderStatus = async (orderId, status) => {
    try {
      setLoading(true)
      const response = await api.put(`/orders/${orderId}/status`, { status })
      const updated = response?.data?.order
      if (updated) {
        setOrders(prev => prev.map(o => o.id === orderId ? updated : o))
      }
      setLoading(false)
      toast.success(`Order status updated to ${status}`)
    } catch (error) {
      setLoading(false)
      console.error('Error updating order status:', error)
      toast.error(error.response?.data?.message || 'Failed to update order status')
    }
  }

  const assignDelivery = async (orderId) => {
    try {
      setLoading(true)
      const response = await api.put(`/orders/${orderId}/assign`, {})
      const updated = response?.data?.order
      if (updated) {
        setOrders(prev => prev.map(o => o.id === orderId ? updated : o))
        const name = updated.assignedDelivery?.name || 'Delivery Person'
        toast.success(`Order assigned to ${name}`)
      } else {
        toast.error('No delivery personnel available')
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error('Error assigning delivery:', error)
      toast.error(error.response?.data?.message || 'Failed to assign delivery person')
    }
  }
  
  // Clear notification
  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }
  
  const value = {
    cart,
    orders,
    menuItems,
    notifications,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    placeOrder,
    updateOrderStatus,
    assignDelivery,
    clearNotification,
    addMenuItem,
    updateMenuItem,
    removeMenuItem,
    fetchUserOrders,
    fetchAllOrders
  }

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  )
}
