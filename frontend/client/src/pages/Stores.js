import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import { Search, Star, MapPin, Mail, Plus, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const Stores = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [selectedRating, setSelectedRating] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: ''
  });
  const [storeOwners, setStoreOwners] = useState([]);

  useEffect(() => {
    fetchStores();
    if (user.role === 'admin') {
      fetchStoreOwners();
    }
  }, [searchName, searchAddress]);

  const fetchStores = async () => {
    try {
      const params = new URLSearchParams();
      if (searchName) params.append('name', searchName);
      if (searchAddress) params.append('address', searchAddress);
      
      const endpoint = user.role === 'admin' ? '/api/stores/admin' : '/api/stores';
      const response = await axios.get(`${endpoint}?${params.toString()}`);
      setStores(response.data.stores);
    } catch (error) {
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreOwners = async () => {
    try {
      const response = await axios.get('/api/users?role=store_owner');
      setStoreOwners(response.data.users);
    } catch (error) {
      console.error('Failed to load store owners');
    }
  };

  const handleRating = async (storeId, rating) => {
    try {
      await axios.post('/api/ratings', { store_id: storeId, rating });
      toast.success('Rating submitted successfully!');
      fetchStores();
      setShowRatingModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/stores', newStore);
      toast.success('Store created successfully!');
      setShowCreateModal(false);
      setNewStore({ name: '', email: '', address: '', owner_id: '' });
      fetchStores();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create store');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Stores</h1>
        {user.role === 'admin' && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Store
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Name
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Search stores by name..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                placeholder="Search stores by address..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => (
          <div key={store.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-1">
                  {Number(store.average_rating) ? Number(store.average_rating).toFixed(1) : '0.0'}
                </span>
                {renderStars(Math.round(store.average_rating || 0))}
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {store.address}
              </div>
            </div>
            
            {user.role === 'user' && (
              <div className="border-t pt-4">
                {store.user_rating ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Your rating:</span>
                    <div className="flex items-center">
                      {renderStars(store.user_rating)}
                      <button
                        onClick={() => {
                          setSelectedStore(store);
                          setShowRatingModal(true);
                        }}
                        className="ml-2 text-sm text-primary-600 hover:text-primary-700"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedStore(store);
                      setShowRatingModal(true);
                    }}
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700"
                  >
                    Rate this store
                  </button>
                )}
              </div>
            )}


          </div>
        ))}
      </div>

      {stores.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No stores found.</p>
        </div>
      )}

      {/* Create Store Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Create New Store</h3>
            <form onSubmit={handleCreateStore} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                <input
                  type="text"
                  value={newStore.name}
                  onChange={(e) => setNewStore({...newStore, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter store name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Store Email</label>
                <input
                  type="email"
                  value={newStore.email}
                  onChange={(e) => setNewStore({...newStore, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter store email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Store Address</label>
                <textarea
                  value={newStore.address}
                  onChange={(e) => setNewStore({...newStore, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter store address"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Store Owner</label>
                <select
                  value={newStore.owner_id}
                  onChange={(e) => setNewStore({...newStore, owner_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select a store owner</option>
                  {storeOwners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Create Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Rate {selectedStore.name}</h3>
            <div className="flex justify-center space-x-2 mb-6">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRating(selectedStore.id, rating)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <Star className={`h-8 w-8 ${rating <= (selectedRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRatingModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stores; 