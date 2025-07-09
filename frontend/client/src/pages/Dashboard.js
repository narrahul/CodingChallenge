import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import { Users, Store, Star, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user.role === 'admin') {
          const response = await axios.get('/api/dashboard/admin');
          setStats(response.data);
        } else if (user.role === 'store_owner') {
          const response = await axios.get('/api/dashboard/store-owner');
          setStats(response.data);
        }
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user.role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (user.role === 'user') {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome, {user.name}!</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">What you can do:</h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-center">
              <Store className="h-5 w-5 mr-3 text-primary-600" />
              Browse and rate stores
            </li>
            <li className="flex items-center">
              <Star className="h-5 w-5 mr-3 text-primary-600" />
              Submit ratings from 1 to 5
            </li>
            <li className="flex items-center">
              <Users className="h-5 w-5 mr-3 text-primary-600" />
              Update your profile and password
            </li>
          </ul>
        </div>
      </div>
    );
  }

  if (user.role === 'admin') {
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Store className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Stores</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalStores || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Ratings</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalRatings || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Manage Users</h3>
              <p className="text-sm text-gray-600">Add, view, and manage all users in the system</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Manage Stores</h3>
              <p className="text-sm text-gray-600">Add new stores and assign store owners</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user.role === 'store_owner') {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Store Owner Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Ratings</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalRatings || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {stats?.usersWithRatings && stats.usersWithRatings.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Users Who Rated Your Store</h2>
            <div className="space-y-3">
              {stats.usersWithRatings.map((rating) => (
                <div key={rating.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{rating.name}</p>
                    <p className="text-sm text-gray-600">{rating.email}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-yellow-600">{rating.rating}</span>
                    <Star className="h-5 w-5 text-yellow-600 ml-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default Dashboard; 