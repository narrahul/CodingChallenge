import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, User, Mail, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updatePassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await updatePassword(data.password);
    
    if (result.success) {
      toast.success('Password updated successfully!');
      reset();
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <User className="h-5 w-5 mr-2" />
            User Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <User className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-900">{user.name}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <Mail className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-900">{user.email}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <div className="flex items-start p-3 bg-gray-50 rounded-md">
                <MapPin className="h-4 w-4 text-gray-400 mr-3 mt-0.5" />
                <span className="text-gray-900">{user.address}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <User className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-900 capitalize">{user.role.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Lock className="h-5 w-5 mr-2" />
            Update Password
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    },
                    maxLength: {
                      value: 16,
                      message: 'Password must not exceed 16 characters'
                    },
                    pattern: {
                      value: /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/,
                      message: 'Password must contain at least one uppercase letter and one special character'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Password Requirements:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 8-16 characters long</li>
                <li>• At least one uppercase letter</li>
                <li>• At least one special character</li>
              </ul>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile; 