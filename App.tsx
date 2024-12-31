import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <h1>TubeTV</h1>
        <Routes>
          <Route path="/" element={<div>Hauptseite kommt hier...</div>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
