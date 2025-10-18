import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { Link } from 'react-router-dom'

const RestaurantMenuLite = () => {
  const [items, setItems] = useState([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'Food', image: '', available: true })

  const load = async () => {
    try {
      const res = await api.get('/menu', { params: { t: Date.now() } })
      setItems(res?.data?.menuItems || [])
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load menu')
    }
  }

  useEffect(() => { load() }, [])

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type==='checkbox'? checked : value }))
  }

  const addItem = async () => {
    if (!form.name || !form.description || form.price === '' || !form.category || !form.image) {
      toast.error('Fill all fields')
      return
    }
    const price = Number(form.price)
    if (Number.isNaN(price) || price < 0) { toast.error('Invalid price'); return }
    setSaving(true)
    try {
      const res = await api.post('/menu', { ...form, price })
      const item = res?.data?.item
      if (item) {
        setItems(prev => [...prev, item])
        toast.success('Item added')
        setForm({ name: '', description: '', price: '', category: 'Food', image: '', available: true })
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this item?')) return
    try {
      await api.delete(`/menu/${id}`)
      setItems(prev => prev.filter(i => i.id !== id))
      toast.success('Deleted')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Menu Manager</h1>
          <Link to="/restaurant" className="btn-secondary">Back to Orders</Link>
        </div>

        <div className="card p-4 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Item</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input className="input-field w-full" name="name" value={form.name} onChange={onChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price (৳)</label>
              <input type="number" className="input-field w-full" name="price" value={form.price} onChange={onChange} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea className="input-field w-full" name="description" value={form.description} onChange={onChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select className="input-field w-full" name="category" value={form.category} onChange={onChange}>
                <option>Food</option>
                <option>Coffee</option>
                <option>Dessert</option>
                <option>Beverage</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image (data URL or URL)</label>
              <input className="input-field w-full mb-2" name="image" value={form.image} onChange={onChange} placeholder="https://... or data:image/png;base64,..." />
              <input type="file" accept="image/*" onChange={(e)=>{
                const f = e.target.files?.[0];
                if(!f) return;
                const rdr = new FileReader();
                rdr.onload = ()=> setForm(prev=>({ ...prev, image: String(rdr.result) }));
                rdr.readAsDataURL(f);
              }} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="available" checked={form.available} onChange={onChange} />
              <span>Item is available</span>
            </div>
          </div>
          <div className="mt-4">
            <button className="btn-primary" disabled={saving} onClick={addItem}>{saving?'Saving...':'Add Item'}</button>
          </div>
        </div>

        <div className="card p-4">
          <h2 className="text-xl font-semibold mb-4">Current Menu</h2>
          {items.length===0 ? (
            <div className="text-gray-600">No items yet.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(it => (
                <div key={it.id} className="border rounded p-3 bg-white">
                  <img src={it.image} alt={it.name} className="w-full h-32 object-cover rounded mb-2" />
                  <div className="font-semibold">{it.name}</div>
                  <div className="text-sm text-gray-600">{it.description}</div>
                  <div className="mt-1 flex justify-between items-center">
                    <span className="font-bold text-primary-600">৳{Number(it.price).toFixed(2)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${it.available?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{it.available?'Available':'Out of Stock'}</span>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button className="btn-secondary" onClick={()=>remove(it.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RestaurantMenuLite
