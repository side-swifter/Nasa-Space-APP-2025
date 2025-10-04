import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      await signup(formData.email, formData.password, formData.name);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-kraken-dark flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <img
              src="/main-krak.svg"
              alt="Kraken Octopus"
              className="w-56 h-56 mx-auto object-contain animate-pulse"
            />
          </div>
          <div className="mx-auto h-16 w-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-kraken-light mb-2 font-mono">Account Created!</h2>
          <p className="text-kraken-light opacity-70 mb-4 font-mono">
            Welcome to Kraken! Please check your email to verify your account.
          </p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-kraken-beige mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kraken-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header with Logo */}
        <div className="text-center">
          <div className="mb-8">
            <img
              src="/main-krak.svg"
              alt="Kraken Octopus"
              className="w-48 h-48 mx-auto object-contain animate-pulse"
            />
          </div>
          <h2 className="text-3xl font-bold text-kraken-light font-mono">Create your account</h2>
          <p className="mt-2 text-kraken-light opacity-70 font-mono">Join Kraken to monitor air quality</p>
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
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-kraken-light mb-2 font-mono">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-kraken-light opacity-50" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-kraken-beige border-opacity-30 rounded-lg bg-kraken-dark bg-opacity-50 text-kraken-light placeholder-kraken-light placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-kraken-beige focus:border-kraken-beige focus:border-opacity-50 transition-colors font-mono"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

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
                  value={formData.email}
                  onChange={handleChange}
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-kraken-beige border-opacity-30 rounded-lg bg-kraken-dark bg-opacity-50 text-kraken-light placeholder-kraken-light placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-kraken-beige focus:border-kraken-beige focus:border-opacity-50 transition-colors font-mono"
                  placeholder="Create a password"
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

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-kraken-light mb-2 font-mono">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-kraken-light opacity-50" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-kraken-beige border-opacity-30 rounded-lg bg-kraken-dark bg-opacity-50 text-kraken-light placeholder-kraken-light placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-kraken-beige focus:border-kraken-beige focus:border-opacity-50 transition-colors font-mono"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-kraken-light opacity-50 hover:text-kraken-light" />
                  ) : (
                    <Eye className="h-5 w-5 text-kraken-light opacity-50 hover:text-kraken-light" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center">
            <input
              id="agree-terms"
              name="agree-terms"
              type="checkbox"
              required
              className="h-4 w-4 text-kraken-beige focus:ring-kraken-beige border-kraken-beige border-opacity-30 rounded bg-kraken-dark"
            />
            <label htmlFor="agree-terms" className="ml-2 block text-sm text-kraken-light font-mono">
              I agree to the{' '}
              <Link to="/terms" className="text-kraken-beige hover:text-kraken-light font-mono">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-kraken-beige hover:text-kraken-light font-mono">
                Privacy Policy
              </Link>
            </label>
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
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </button>
          </div>

          {/* Sign in link */}
          <div className="text-center">
            <p className="text-kraken-light opacity-70 font-mono">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-kraken-beige hover:text-kraken-light transition-colors font-mono"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
