import React from 'react'
import Dashboard from './pages/Dashboard'
import Header from './components/Header'
import Footer from './components/Footer'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-kraken-dark flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Dashboard />
      </main>
      <Footer />
    </div>
  )
}

export default App
