import { useState } from 'react';
import React from 'react';
import type { User } from '../types/auth';
import { CheckSquare, ArrowRight } from 'lucide-react';
import api from '../api/axios';
interface AuthModalProps {
  onLoginSuccess: (user: User) => void;
}

export default function AuthModal({ onLoginSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const payload = isLogin ? { email, password } : { name, email, password };
    try {
      const response = await api.post<User>(endpoint, payload);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      onLoginSuccess(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during login.');
    }
  };
  return (
    <div className='min-h-screen bg-slate-100 flex items-center justify-center p-4'>
      <div className='bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-200'>
        <div className='flex items-center gap-3 mb-6 justify-center'>
          <div className='bg-indigo-600 p-2.5 rounded-2xl text-white'>
            <CheckSquare size={28} />
          </div>
          <span className='text-2xl font-bold text-slate-900'>TaskFlow</span>
        </div>
        <h2 className='text-xl font-bold text-center text-slate-800 mb-2'>
          {' '}
          {isLogin ? 'Welcome back!' : 'Create an account'}
        </h2>
        <p className='text-sm text-slate-400 text-center mb-6'>
          {isLogin ? 'Enter your system login details.' : 'Fill out the registration form.'}
        </p>
        {error && (
          <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl text-center'>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className='space-y-4'>
          {!isLogin && (
            <div>
              <label className='block text-xs font-semibold text-slate-500 mb-1'>Name: </label>
              <input
                type='text'
                required
                placeholder='Alex Jonhson'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl 
                        focus:outline-none focus:ring-2 focus:ring-indigo-500'
              />
            </div>
          )}
          <div>
            <label className='block text-xs font-semibold text-slate-500 mb-1'>Email: </label>
            <input
              type='email'
              required
              placeholder='alex@example.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl 
                    focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
          </div>
          <div>
            <label className='block text-xs font-semibold text-slate-500 mb-1'>Пароль</label>
            <input
              type='password'
              required
              placeholder='••••••••'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
          </div>
          <button
            type='submit'
            className='cursor-pointer w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-200 mt-2'
          >
            {isLogin ? 'Sign in' : 'Sign Up'}
            <ArrowRight size={18} />
          </button>
        </form>
        <div className='mt-6 text-center'>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className='cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-700'
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}
