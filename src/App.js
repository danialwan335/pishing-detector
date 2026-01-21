import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HowItWork from './components/HowItWork';
import ScanPage from './components/ScanPage';
import ScanHistory from './components/ScanHistory';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <div className='bg-black min-h-screen overflow-x-hidden'>
        <Routes>
          <Route path="/" element={
            <>
              <Navbar />
              <Dashboard />
            </>
          } />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/how-it-works" element={<HowItWork />} />
          <Route path="/history" element={<ScanHistory />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
