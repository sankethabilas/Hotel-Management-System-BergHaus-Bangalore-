import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Examples from './pages/Examples'

export default function App() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <nav style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Link to="/">Home</Link>
        <Link to="/examples">Examples</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/examples" element={<Examples />} />
      </Routes>
    </div>
  )
}


