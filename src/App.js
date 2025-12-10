import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWork from './components/HowItWork';
import ScanPage from './components/ScanPage';
import ScanHistory from './components/ScanHistory';

function App() {
  return (
    <Router>
      <div className='bg-black h-screen overflow-x-hidden'>
        <Routes>
          <Route path="/" element={
            <>
              <Navbar />
              <Hero />
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
