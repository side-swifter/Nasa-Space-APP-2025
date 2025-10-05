import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Dashboard from './pages/Dashboard'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import PresentationSlideshow from './pages/PresentationSlideshow'
import Header from './components/Header'
import Footer from './components/Footer'
import locationService, { LocationInfo } from './services/locationService'
import './App.css'

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />
}

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

// App Layout Component
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [showNotificationConfig, setShowNotificationConfig] = useState(false);

  useEffect(() => {
    // Get user's location with city name
    const getUserLocation = async () => {
      try {
        console.log('🔍 Getting user location...');
        const location = await locationService.getCurrentLocationInfo();
        console.log('📍 Location found:', location);
        setLocationInfo(location);
      } catch (error) {
        console.warn('Location service error:', error);
        // Keep default location (NYC) and set basic info
        setLocationInfo({
          lat: 40.7128,
          lon: -74.0060,
          city: 'New York',
          state: 'NY',
          country: 'United States',
          displayName: 'New York, NY',
        });
      }
    };

    getUserLocation();
  }, []);

  return (
    <div className="min-h-screen bg-kraken-dark flex flex-col">
      <Header 
        locationInfo={locationInfo} 
        onShowNotificationConfig={() => setShowNotificationConfig(true)}
      />
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      <Footer />
      
      {/* Global Notification Configuration Modal */}
      {showNotificationConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-kraken-beige font-mono">Notification & AI Settings</h2>
                <button
                  onClick={() => setShowNotificationConfig(false)}
                  className="text-kraken-light hover:text-kraken-beige transition-colors text-2xl font-mono"
                >
                  ×
                </button>
              </div>
              <div className="bg-kraken-dark border border-kraken-beige border-opacity-20 rounded-lg p-6">
                <p className="text-kraken-light font-mono text-center">
                  Notification settings are available in the Dashboard's Alert Panel.
                  <br />
                  Navigate to the Dashboard to configure your AI prompt variables and notification preferences.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } 
          />

          {/* Presentation Route - Full Screen */}
          <Route 
            path="/presentation" 
            element={
              <ProtectedRoute>
                <PresentationSlideshow />
              </ProtectedRoute>
            } 
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
