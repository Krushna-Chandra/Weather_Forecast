import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // ✅ 1. Import Footer
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import RadarPage from './pages/RadarPage';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen transition-colors duration-200 dark:bg-gray-900">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/radar" element={<RadarPage />} />
          </Routes>
          <Footer /> {/* ✅ 2. Add Footer here */}
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
