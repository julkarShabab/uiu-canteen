import React, { useState } from 'react'
import { useOrder } from '../contexts/OrderContext'
import { Plus, Minus, ArrowLeft, ArrowUpDown, Search } from 'lucide-react'
import { Link } from 'react-router-dom'

const Menu = () => {
  const { menuItems, addToCart, cart } = useOrder()
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [quantities, setQuantities] = useState({})
  const [sortBy, setSortBy] = useState('default')
  const [searchTerm, setSearchTerm] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })

  const categories = ['All', ...new Set(menuItems.map(item => item.category))]

  // Filter items by category, search term, and price range
  const filteredItems = menuItems.filter(item => {
    // Category filter
    const categoryMatch = selectedCategory === 'All' || item.category === selectedCategory
    
    // Search term filter (case-insensitive)
    const searchMatch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Price range filter
    const priceMatch = (!priceRange.min || item.price >= parseFloat(priceRange.min)) &&
                      (!priceRange.max || item.price <= parseFloat(priceRange.max))
    
    return categoryMatch && searchMatch && priceMatch
  })

  // Sort items based on selected sort option
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0 // No sorting, maintain original order
    }
  })

  const handleQuantityChange = (itemId, change) => {
    const currentQty = quantities[itemId] || 0
    const newQty = Math.max(0, currentQty + change)
    
    if (newQty === 0) {
      const newQuantities = { ...quantities }
      delete newQuantities[itemId]
      setQuantities(newQuantities)
    } else {
      setQuantities(prev => ({ ...prev, [itemId]: newQty }))
    }
  }

  const handleAddToCart = (item) => {
    const quantity = quantities[item.id] || 1
    addToCart(item, quantity)
    setQuantities(prev => {
      const newQuantities = { ...prev }
      delete newQuantities[item.id]
      return newQuantities
    })
  }

  const handlePriceRangeChange = (field, value) => {
    setPriceRange(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const clearFilters = () => {
    setSearchTerm('')
    setPriceRange({ min: '', max: '' })
    setSelectedCategory('All')
    setSortBy('default')
  }

  return (
         <div className="min-h-screen py-8">
       <div className="container mx-auto px-4">
         <div className="flex items-center mb-6">
           <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors">
             <ArrowLeft className="h-5 w-5" />
             <span>Back to Home</span>
           </Link>
         </div>
                   <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            Our Menu
          </h1>

          {/* Search and Filter Section */}
          <div className="card mb-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search by Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Food
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or description..."
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Price Range - Min */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Price (৳)
                </label>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                  placeholder="0"
                  min="0"
                  className="input-field"
                />
              </div>

              {/* Price Range - Max */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price (৳)
                </label>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                  placeholder="1000"
                  min="0"
                  className="input-field"
                />
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full btn-secondary"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter and Sort Options */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
           {/* Category Filter */}
           <div className="flex flex-wrap justify-center gap-4">
             {categories.map(category => (
               <button
                 key={category}
                 onClick={() => setSelectedCategory(category)}
                 className={`px-6 py-2 rounded-full transition-colors ${
                   selectedCategory === category
                     ? 'bg-primary-500 text-white'
                     : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                 }`}
               >
                 {category}
               </button>
             ))}
           </div>

           {/* Sort Options */}
           <div className="flex items-center space-x-2">
             <ArrowUpDown className="h-5 w-5 text-gray-500" />
             <select
               value={sortBy}
               onChange={(e) => setSortBy(e.target.value)}
               className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
             >
               <option value="default">Default Order</option>
               <option value="price-low">Price: Low to High</option>
               <option value="price-high">Price: High to Low</option>
               <option value="name">Name: A to Z</option>
             </select>
           </div>
         </div>

                 {/* Menu Grid */}
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
           {sortedItems.map(item => (
            <div key={item.id} className="card hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                {!item.available && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <span className="text-white font-semibold">Out of Stock</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                                 <span className="text-lg font-bold text-primary-600">৳{item.price}</span>
              </div>
              
              <p className="text-gray-600 mb-4">{item.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuantityChange(item.id, -1)}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                    disabled={!item.available}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  
                  <span className="w-8 text-center font-semibold">
                    {quantities[item.id] || 0}
                  </span>
                  
                  <button
                    onClick={() => handleQuantityChange(item.id, 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                    disabled={!item.available}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <button
                  onClick={() => handleAddToCart(item)}
                  className={`flex items-center space-x-2 ${
                    cart.some(cartItem => cartItem.id === item.id)
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'btn-primary'
                  }`}
                  disabled={!item.available}
                >
                  <Plus className="h-4 w-4" />
                  <span>
                    {cart.some(cartItem => cartItem.id === item.id)
                      ? `In Cart (${cart.find(cartItem => cartItem.id === item.id)?.quantity || 0})`
                      : 'Add to Cart'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

                                   {sortedItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {searchTerm || priceRange.min || priceRange.max 
                  ? 'No items found matching your search criteria.' 
                  : 'No items found in this category.'}
              </p>
              {(searchTerm || priceRange.min || priceRange.max) && (
                <button
                  onClick={clearFilters}
                  className="mt-4 btn-primary"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
      </div>
    </div>
  )
}

export default Menu
