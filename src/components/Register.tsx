'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_ENDPOINTS } from '@/config/api';

interface RegisterProps {
  onLogin: () => void;
  onSuccess: () => void;
}

function Register({ onLogin, onSuccess }: RegisterProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setToken, setIsAuthenticated } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      setToken(data.token);
      setIsAuthenticated(true);
      onSuccess();
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error('Error during registration:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center p-4">
      <div className="bg-[#1a1b2e] p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-200 mb-8">Create Account</h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-[#0a0b14] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200"
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-[#0a0b14] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200"
              placeholder="Create a password"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 bg-[#0a0b14] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200"
              placeholder="Confirm your password"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          Already have an account?{' '}
          <button
            onClick={onLogin}
            className="text-blue-400 hover:text-blue-300 transition-colors"
            disabled={isLoading}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;