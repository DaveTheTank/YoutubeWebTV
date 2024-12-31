import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TV from './pages/TV';
import Admin from './pages/Admin';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TV />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
};

export default App;
