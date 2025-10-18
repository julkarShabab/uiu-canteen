import React, { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { Link } from 'react-router-dom'

const StatusPill = ({ status }) => {
  const map = {
    pending: 'bg-orange-100 text-orange-700',
    assigned: 'bg-blue-100 text-blue-700',
    picked_up: 'bg-yellow-100 text-yellow-700',
    in_transit: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${map[status] || 'bg-gray-100 text-gray-700'}`}>
      {String(status || '').replace('_', ' ').toUpperCase()}
    </span>
  )
}

const RestaurantOrdersLite = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/orders', { params: { t: Date.now() } })
      setOrders(res?.data?.orders || [])
      setError('')
    } catch (e) {
      setError(e.response?.data?.message || e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    const id = setInterval(fetchOrders, 3000)
    return () => clearInterval(id)
  }, [fetchOrders])

  const acceptAndAssign = async (orderId) => {
    try {
      setLoading(true)
      const res = await api.put(`/orders/${orderId}/assign`, {})
      const updated = res?.data?.order
      if (updated) {
        setOrders(prev => prev.map(o => o.id === orderId ? updated : o))
        toast.success('Accepted & assigned')
      } else {
        toast.error('No delivery available')
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to assign')
    } finally {
      setLoading(false)
    }
  }

  const advanceStatus = async (orderId, status) => {
    try {
      setLoading(true)
      const res = await api.put(`/orders/${orderId}/status`, { status })
      const updated = res?.data?.order
      if (updated) {
        setOrders(prev => prev.map(o => o.id === orderId ? updated : o))
        toast.success(`Marked ${status.replace('_',' ')}`)
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Dashboard</h1>
          <div className="flex gap-2">
            <Link to="/restaurant/menu" className="btn-secondary">Menu Manager</Link>
            <button onClick={fetchOrders} className="btn-secondary">Refresh</button>
            {['all','pending','assigned','picked_up','in_transit','delivered'].map(s => (
              <button key={s} onClick={()=>setFilter(s)} className={`px-3 py-1 rounded-lg text-sm ${filter===s?'bg-primary-500 text-white':'bg-gray-200 text-gray-700'}`}>{s.replace('_',' ')}</button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-700">{error}</div>
        )}

        {loading && (
          <div className="mb-4 p-3 rounded bg-blue-50 text-blue-700">Loading...</div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center text-gray-600 py-16">No orders found.</div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => (
              <div key={order.id} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">Order #{order.id}</h3>
                    <div className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleString()}</div>
                  </div>
                  <StatusPill status={order.status} />
                </div>
                <div className="text-sm text-gray-700 mb-2">Deliver to: {order.deliveryAddress}</div>
                <ul className="text-sm mb-3 list-disc pl-6">
                  {(order.items||[]).map((it,i)=> (
                    <li key={i}>{it.name} x{it.quantity} — ৳{(it.price*it.quantity).toFixed(2)}</li>
                  ))}
                </ul>
                <div className="flex justify-between items-center">
                  <div className="font-semibold">Total: ৳{Number(order.total||0).toFixed(2)}</div>
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <button onClick={()=>acceptAndAssign(order.id)} className="btn-primary">Accept & Auto-Assign</button>
                    )}
                    {order.status === 'assigned' && (
                      <button onClick={()=>advanceStatus(order.id,'picked_up')} className="btn-primary">Mark Picked Up</button>
                    )}
                    {order.status === 'picked_up' && (
                      <button onClick={()=>advanceStatus(order.id,'in_transit')} className="btn-primary">Mark In Transit</button>
                    )}
                    {order.status === 'in_transit' && (
                      <button onClick={()=>advanceStatus(order.id,'delivered')} className="btn-primary">Mark Delivered</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RestaurantOrdersLite
