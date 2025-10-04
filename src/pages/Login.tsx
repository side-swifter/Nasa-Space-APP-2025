import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-kraken-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header with Logo */}
        <div className="text-center">
          <div className="mb-8">
            <img
              src="/main-krak.svg"
              alt="Kraken Octopus"
              className="w-64 h-64 mx-auto object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-kraken-light font-mono">Welcome back</h2>
          <p className="mt-2 text-kraken-light opacity-70 font-mono">Sign in to your Kraken account</p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6 bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-8" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-kraken-red bg-opacity-10 border border-kraken-red border-opacity-30 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-kraken-red flex-shrink-0" />
              <p className="text-kraken-red text-sm font-mono">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-kraken-light mb-2 font-mono">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-kraken-light opacity-50" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-kraken-beige border-opacity-30 rounded-lg bg-kraken-dark bg-opacity-50 text-kraken-light placeholder-kraken-light placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-kraken-beige focus:border-kraken-beige focus:border-opacity-50 transition-colors font-mono"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-kraken-light mb-2 font-mono">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-kraken-light opacity-50" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-kraken-beige border-opacity-30 rounded-lg bg-kraken-dark bg-opacity-50 text-kraken-light placeholder-kraken-light placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-kraken-beige focus:border-kraken-beige focus:border-opacity-50 transition-colors font-mono"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-kraken-light opacity-50 hover:text-kraken-light" />
                  ) : (
                    <Eye className="h-5 w-5 text-kraken-light opacity-50 hover:text-kraken-light" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-kraken-beige focus:ring-kraken-beige border-kraken-beige border-opacity-30 rounded bg-kraken-dark"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-kraken-light font-mono">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-kraken-beige hover:text-kraken-light transition-colors font-mono"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-kraken-dark bg-kraken-beige hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kraken-beige disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-mono"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-kraken-dark mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {/* Sign up link */}
          <div className="text-center">
            <p className="text-kraken-light opacity-70 font-mono">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-kraken-beige hover:text-kraken-light transition-colors font-mono"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
