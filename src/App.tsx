import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import LandingPage from './pages/LandingPage'
import Header from './components/Header'
import Footer from './components/Footer'
import './App.css'

function App() {
  const [showDashboard, setShowDashboard] = useState(false)

  if (!showDashboard) {
    return <LandingPage onEnterApp={() => setShowDashboard(true)} />
  }

  return (
    <div className="min-h-screen bg-kraken-dark flex flex-col">
      <Header onBackToHome={() => setShowDashboard(false)} />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Dashboard />
      </main>
      <Footer />
    </div>
  )
}

export default App
