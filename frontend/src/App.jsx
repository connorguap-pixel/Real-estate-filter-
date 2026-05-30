import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import TermsModal from './components/TermsModal.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AnalyzeProperty from './pages/AnalyzeProperty.jsx'
import QuickAnalyze from './pages/QuickAnalyze.jsx'
import CRM from './pages/CRM.jsx'
import Pipeline from './pages/Pipeline.jsx'
import BuyersList from './pages/BuyersList.jsx'
import AccuracyTracker from './pages/AccuracyTracker.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <TermsModal />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analyze" element={<AnalyzeProperty />} />
          <Route path="/quick" element={<QuickAnalyze />} />
          <Route path="/crm" element={<CRM />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/buyers" element={<BuyersList />} />
          <Route path="/accuracy" element={<AccuracyTracker />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
